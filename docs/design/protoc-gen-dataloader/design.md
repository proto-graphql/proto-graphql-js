# Design: protoc-gen-dataloader

> 関連: [implementation-plan.md](./implementation-plan.md)(実装計画・subagent 依頼票)/ [grpc-service-to-graphql](../grpc-service-to-graphql/README.md)(親プロジェクト)

- Status: 詳細設計済み(2026-07-11)。`batch` オプション独立・group loader・単一キー限定は承認済み([decision-log §6](../grpc-service-to-graphql/decision-log.md))
- **federation 対応(protoc-gen-pothos Step 2)と独立して開発可能**。依存関係は §7 参照

## 1. 目的と位置づけ

BatchGet 系の RPC 定義から、[DataLoader](https://github.com/graphql/dataloader) ベースのバッチローダーを生成する protoc プラグイン。

生成物は **Connect-ES + protobuf-es + dataloader のみに依存し、GraphQL / Pothos に依存しない**。

| ユースケース | コンシューマ |
|---|---|
| Federation entity 解決(`resolveReference` のバッチ化) | protoc-gen-pothos の federation 出力(Step 2)が import |
| リレーション/extend フィールドの N+1 対策(group loader) | 同上 |
| 将来: protoc-gen-gqlkit の resolver 生成 | gqlkit 版が import |
| 非 GraphQL: BFF・バッチ処理での RPC 呼び出し合成 | ユーザーコードが直接 import |

### 1.1 2 つのローダーモード

| モード | 宣言 | 生成される型 | 欠損時 | 用途 |
|---|---|---|---|---|
| **entity** | `batch: {}` | `RpcLoader<K, Entity \| null, PArgs>` | `null` | BatchGet(1 キー → 高々 1 entity)。federation の resolveReference |
| **group** | `batch: { group: true }` | `RpcLoader<K, Entity[], PArgs>` | `[]` | 1 キー → N entities(例: `user_id` → `Review[]`)。リレーション/extend フィールド |

`RpcLoader<K, V, PArgs>` は `ctx` 単位でメモ化される薄いラッパーで、`load(key, ...args)` / `loadMany(keys, ...args)` / `loader(...args)`(`.prime()`/`.clear()` 用の生 `DataLoader` を取り出すエスケープハッチ)を持つ。`PArgs` は非キーフィールド(§4.5)の有無で `[]` / `[params?: P]` / `[params: P]` に変わる — **params は accessor 呼び出し時ではなく `load`/`loadMany`/`loader` 呼び出し時に渡す**(§4.3・§4.5)。

## 2. proto オプション

`(graphql.rpc).batch` として宣言する(federation 非依存。proto-graphql 本家 `graphql/schema.proto` に experimental で追加)。**per-track landing 方針により、アップストリームには現時点で `batch` のみが追加されている**(service→operation 変換・federation 関連オプションはフィールド番号だけ予約し、それぞれのコンシューマ実装 PR で追加される。経緯は [decision-log Q29](../grpc-service-to-graphql/decision-log.md))。

```proto
// EXPERIMENTAL
message GraphqlRpcBatchOptions {
  // request 中のキーリストフィールド(唯一の repeated フィールドなら省略可 = 自動推論)
  string key_field = 1;
  // response 中の entity リストフィールド(唯一の repeated message フィールドなら省略可)
  string entity_field = 2;
  // entity 側のキーフィールド(キーマッチ照合に使用)。
  // 現状は entity モード・group モードともに必須。entity モードの @key フォールバックは
  // federation 対応時に追加予定(それまでは GraphqlFederationOptions 自体が upstream に
  // 存在しないため、フォールバック先がない)。
  string entity_key = 3;
  // 1 キー → N entities の group loader を生成する
  bool group = 4;
  // 1 回の RPC 呼び出しに載せる最大キー数(DataLoader maxBatchSize)。0 = 無制限
  uint32 max_batch_size = 5;
}
```

宣言例:

```proto
service UserService {
  // entity loader: ids → User(1:1)
  rpc BatchGetUsers(BatchGetUsersRequest) returns (BatchGetUsersResponse) {
    option (graphql.rpc).batch = { entity_key: "id" };  // key_field=ids, entity_field=users は推論。entity_key は現状必須(@key フォールバックは federation 対応後)
  };
}

service ReviewService {
  // group loader: user_ids → Review(1:N)
  rpc BatchListReviewsByUsers(BatchListReviewsByUsersRequest) returns (BatchListReviewsByUsersResponse) {
    option (graphql.rpc).batch = { group: true, entity_key: "user_id" };
  };
}
```

### 2.1 オプトインの独立性

- **`(graphql.service)` は不要**。`batch` の宣言だけで生成対象になる(GraphQL への公開と dataloader 生成は独立した関心)
- protoc-gen-pothos 側の federation 配線(`federation.entity_resolver` / `extend`)を使う場合は、そちらの規則(service opt-in)が別途適用される
- `batch` の名前空間が `graphql.*` に残る点は意図的: proto-graphql エコシステムのアノテーションとして一元管理し、新 extension 名前空間のコスト(利用者の import 追加、本家の管理対象増)を避ける。非 GraphQL 用途が本格化したら独立名前空間への移行を再検討する

## 3. バリデーションと自動推論

codegen 時に以下を検証する。**推論が外れたときのエラーメッセージには「候補フィールドの列挙 + 明示オプションの記入例」を必ず含める**(命名規約による自動検出を不採用にした理由が「推論失敗時のエラーの難解さ」だったため)。

| # | 規則 | 違反時 |
|---|---|---|
| V1 | `batch` は unary RPC のみ | エラー(streaming 不可) |
| V2 | `key_field`: request 中の repeated スカラーフィールド。省略時は「唯一の repeated フィールド」を推論(複数あれば明示必須。**明示すれば残りの repeated フィールドは loader パラメータとして扱える**) | 0 個 or(省略時に)複数ならエラー + 候補列挙 |
| V3 | `entity_field`: response 中の repeated message フィールド。省略時は「唯一の repeated message フィールド」を推論 | 同上 |
| V4 | `entity_key`: entity message 上のスカラーフィールドで、`key_field` の要素型と一致すること | 型不一致・不存在はエラー |
| V5 | entity モードでも `entity_key` は現状必須(@key フォールバックは未実装。upstream に `GraphqlFederationOptions` が無いため)。federation 対応後、entity の `(graphql.object_type).federation.key` が**単一フィールドの fieldset 1 つ**ならそれを採用するフォールバックを追加予定 | 省略はエラー(明示を要求) |
| V6 | group モードでは `entity_key` 必須 | エラー |
| V7 | 複合キー(fieldset に複数フィールド)は本バージョンでは非対応 | エラー(単一キーのみサポートと明示) |
| V8 | `protobuf_lib` 相当の前提: protobuf-es v2 固定 | (パラメータ自体を持たない) |
| V9 | **key_field 以外の request フィールドは loader パラメータになる**(§4.5)。required なフィールドが 1 つでもあれば、accessor の params 引数を**型レベルで必須**にする。required 判定は codegen-core の `isRequiredField(field, "input")` をそのまま再利用(= proto3 の暗黙 presence スカラーは required 扱い。`optional` / `(graphql.field).input_nullability = NULLABLE` / behavior comment で制御可能 — 既存 Input 型の nullability 哲学と一貫) | エラーではなくシグネチャに反映 |

## 4. 生成物仕様

### 4.1 ファイルレイアウト

- 「1 proto ファイル = 1 出力ファイル」: `<proto>.pb.dataloader.ts`(suffix はパラメータで変更可)
- `batch` 宣言のある RPC 毎に 1 つの loader accessor をエクスポート。命名: `<rpcNameCamelCase>Loader`(例: `batchGetUsersLoader`)

### 4.2 生成コードのイメージ

```ts
// user_service.pb.dataloader.ts(entity モード)
import type { ProtoGraphqlConnectContext, RpcLoader } from "@proto-graphql/connect-runtime";
import { createRpcLoader } from "@proto-graphql/connect-runtime";
import { create } from "@bufbuild/protobuf";
import { UserService, BatchGetUsersRequestSchema } from "./user_service_pb";

export const batchGetUsersLoader: (
  ctx: ProtoGraphqlConnectContext,
) => RpcLoader<string, User | null> = createRpcLoader({
  service: UserService,
  method: "batchGetUsers",
  requestSchema: BatchGetUsersRequestSchema,
  call: (client, keys, params, opts) =>
    client.batchGetUsers(create(BatchGetUsersRequestSchema, { ...params, ids: [...keys] }), opts),
  extractEntities: (res) => res.users,
  extractKey: (user) => user.id,
});
// 使用側: await batchGetUsersLoader(ctx).load("user-1")   → User | null
//         await batchGetUsersLoader(ctx).loadMany(ids)     → (User | null | Error)[]
// 非キーフィールドがある場合(§4.5): accessor ではなく load 呼び出し時に渡す:
//   await batchGetUsersLoader(ctx).load("user-1", { view: View.FULL })
```

```ts
// review_service.pb.dataloader.ts(group モード)
export const batchListReviewsByUsersLoader: (
  ctx: ProtoGraphqlConnectContext,
) => RpcLoader<string, Review[]> = createRpcLoader({
  service: ReviewService,
  method: "batchListReviewsByUsers",
  group: true,
  maxBatchSize: 100, // batch.max_batch_size 指定時のみ出力
  call: (client, keys, params, opts) =>
    client.batchListReviewsByUsers(create(BatchListReviewsByUsersRequestSchema, { ...params, userIds: [...keys] }), opts),
  extractEntities: (res) => res.reviews,
  extractKey: (review) => review.userId,
});
// 使用側: await batchListReviewsByUsersLoader(ctx).load("user-1") → Review[]
```

- RPC 固有の詰め替え(request 組み立て・entity 取り出し・キー抽出)だけを生成コードが持ち、照合・キャッシュ等の共通ロジックは runtime に置く(**可読性とデバッグ性を確保しつつ、照合バグの修正は runtime の patch で済む**)

### 4.3 runtime API(`@proto-graphql/connect-runtime`、名称仮)

grpc-service-to-graphql Step 1 で新設する runtime パッケージに同居する(context 規約 / `getClient` を共有するため)。

```ts
// RpcLoader ラッパー: ctx 単位でメモ化され、params は load 呼び出し時に渡す
export interface RpcLoader<K, V, PArgs extends readonly unknown[] = []> {
  load(key: K, ...args: PArgs): Promise<V>;
  loadMany(keys: readonly K[], ...args: PArgs): Promise<(V | Error)[]>;
  loader(...args: PArgs): DataLoader<K, V>; // .prime() / .clear() / .clearAll() 用のエスケープハッチ
}

// 生成コードが使う factory
export function createRpcLoader<S extends GenService, K, E, P>(config: {
  service: S;
  method: string;                       // 診断用(エラーメッセージ・ラベル)
  requestSchema: GenMessage<...>;       // params の正規化・cache key 算出に使用
  call: (client: Client<S>, keys: readonly K[], params: P, opts: CallOptions) => Promise<unknown>;
  extractEntities: (res: never) => E[]; // 実際は call の戻り型と結合
  extractKey: (entity: E) => K;
  group?: false;
  maxBatchSize?: number;
}): (ctx: ProtoGraphqlConnectContext) => RpcLoader<K, E | null, [params?: P]>;
// group オーバーロード: config.group: true → (ctx) => RpcLoader<K, E[], [params?: P]>
// 生成コードの const アノテーションは PArgs を [] / [params?: P] / [params: P] に narrow する(§4.5)
```

実装仕様:

1. **per-context キャッシュ(二段)**: accessor は `WeakMap<object /*ctx*/, RpcLoader>` で ctx 毎にラッパーをメモ化する。ラッパー自身が `Map<string /*paramsKey*/, DataLoader>` を持ち、同一 ctx + 同一 params の `load()`/`loadMany()`/`loader()` 呼び出しだけが同じ DataLoader(= 同じバッチ)に合流する。paramsKey の算出は §4.5
2. **batch 関数**: `getClient(ctx, service)` で client を取得し、`callOptions(ctx)` を適用して 1 回(maxBatchSize 超過時は DataLoader が自動分割した単位で)RPC を呼ぶ。request は `create(requestSchema, { ...params, [keyField]: keys })` 相当を `call` closure 内で組み立てる
3. **キーマッチ照合**(順序に依存しない):
   - entity モード: `Map<K, E>` を `extractKey` で構築し、`keys.map(k => map.get(k) ?? null)`
   - group モード: `Map<K, E[]>` に groupBy し、`keys.map(k => map.get(k) ?? [])`
   - レスポンスの順序・欠損・重複・余剰 entity(要求していないキーの entity)すべてに頑健
4. **エラー**: RPC 呼び出しが throw したらそのまま throw(DataLoader がそのバッチの全キーを reject)。**GraphQL エラーへの変換はしない**(呼び出し側の責務。pothos 側 resolveReference が `ConnectError` → `GraphQLError` 変換を担う)
5. **キー型**: proto 型に応じて `string` / `number` / `bigint`(protobuf-es v2 の int64 デフォルト)。いずれも `Map` のキーとして同値性が成立するため追加処理不要。**複合キーは非対応**(将来: fieldset 順 serialize + `cacheKeyFn` で拡張する設計余地を残す)

### 4.4 キー型マッピング

| proto 要素型(key_field) | TS キー型 K |
|---|---|
| string | string |
| int32 / uint32 / sint32 / fixed32 / sfixed32 | number |
| int64 / uint64 / sint64 / fixed64 / sfixed64 | bigint |
| bool / enum / message / bytes / float / double | **エラー**(キーとして非対応) |

### 4.5 非キーフィールド(loader パラメータ)

**前提**: DataLoader のバッチは「キー以外の入力が均一」であることが前提。1 バッチ = 1 RPC のため、`view` や `read_mask` のような非キーフィールドは「リクエストの一部」ではなく「**ローダーの分割単位**」として扱う(検討経緯は [decision-log Q28](../grpc-service-to-graphql/decision-log.md))。

**生成規則**:

- request に key_field 以外のフィールドがある場合、params 型を生成し、accessor が返す `RpcLoader` の `load`/`loadMany`/`loader` の(キーに続く)追加引数にする。**accessor(`(ctx) => RpcLoader<...>`)自体は params を取らない** — params は呼び出し時(load time)に渡す:

```ts
// 実装時修正: 当初案の Omit<..., "ids"> は protobuf-es v2 の MessageInitShape が
// union 型のため型不整合を起こす(Omit が union を collapse して $typeName が
// 広がり、runtime の RpcLoader に代入不能)。params 型は完全な init shape
// とし、key_field は含まれていても call が常にバッチのキーで上書きするため無害
// (paramsKey が分かれてバッチ分割の無駄が出るだけで正しさは保たれる)。
export type BatchGetUsersLoaderParams =
  MessageInitShape<typeof BatchGetUsersRequestSchema>;

export const batchGetUsersLoader: (
  ctx: ProtoGraphqlConnectContext,
) => RpcLoader<string, User | null, [params?: BatchGetUsersLoaderParams]>; // required な非キーフィールドがあれば [params: ...] として生成

// 使用側:
await batchGetUsersLoader(ctx).load("user-1", { view: View.FULL });
await batchGetUsersLoader(ctx).loadMany(ids, { view: View.FULL });
```

- required 判定は `isRequiredField(field, "input")` の既存セマンティクス(V9 参照)。**型レベルの強制のみ**で、runtime バリデーションはしない(不正はサーバが拒否する)
- 非キーフィールドが 1 つも無ければ従来どおり `(ctx) => RpcLoader<K, V>`(`PArgs` は `[]`、`load`/`loadMany` は params 引数なし)

**runtime の挙動**:

- paramsKey = `toBinary(create(requestSchema, params ?? {}))`(key_field は未設定のまま)を文字列化したもの。バイナリ経由なので bigint を含む params も扱え、`undefined` と `{}` は同一キーに正規化される
- map フィールドを含む params は挿入順序差で別キーになり得るが、バッチが分かれるだけで正しさは損なわれない(docs に注意として記載)
- batch 実行時は `{ ...params, [keyField]: keys }` で request を組み立てる
- accessor(`(ctx) => RpcLoader`)は ctx 単位でメモ化される薄いラッパーを返すだけで、実際の DataLoader 群(paramsKey 毎)はラッパー内部で load-time に遅延生成される。`loader(params?)` は `.prime()`/`.clear()`/`.clearAll()` が必要なときの、その DataLoader 自体を取り出すエスケープハッチ

**batch 物理特性は変わらない(docs に明記)**: params をキーごとに変える使い方は(accessor 時代と同様)バッチを分割し N+1 に近づく — params の受け渡しタイミングが load time に変わっても、「異なる params は同一 RPC に同居できない」という DataLoader のバッチ物理は不変。同一 ctx で同じ params 値(バイナリ一致)の `load()` 呼び出しだけが 1 バッチに合流する。

**federation との関係**: 生成される `resolveReference` / extend フィールド resolver は representation / parent 以外の情報を持たないため params を渡せない。よって federation 経由で使う RPC は「required な非キーフィールドなし」が条件(optional は unset で呼ぶ)— [federation-design F10](../grpc-service-to-graphql/federation-design.md) を参照。AIP の required `parent` はこれに該当するが、実質「複合キー問題の変種」なので複合キー対応と同時に解く。将来 extend フィールドに GraphQL 引数を生やす際は **args → loader params** がそのまま受け皿になる(args の組ごとにバッチが分かれる意味論)。

## 5. プラグインパラメータ

`@proto-graphql/protoc-plugin-helpers` のパース基盤を再利用:

| パラメータ | デフォルト | 意味 |
|---|---|---|
| `import_prefix` | (必須相当) | protobuf-es 生成物の import パス prefix(protoc-gen-pothos と同じ) |
| `filename_suffix` | `.pb.dataloader.ts` | 出力ファイル suffix |
| `runtime_module` | `@proto-graphql/connect-runtime`(仮) | createRpcLoader の import 元(パッケージ名確定までの逃げ道兼テスト用) |
| `format` | `true` | dprint フォーマット |
| `emit_imported_files` | `false` | protoc-gen-pothos と同じ意味論 |

## 6. protoc-gen-pothos との連携(Step 2 が消費する契約)

- **import パス契約**: loader ファイルは同一 proto ファイル由来の suffix 違い。pothos 側は「同じ proto の出力ディレクトリに `filename_suffix` 違いで存在する」前提で相対 import を生成する(pothos 側パラメータに dataloader の suffix / 出力 prefix を渡す。デフォルトは同一ディレクトリ・デフォルト suffix)
- **エクスポート名契約**: `<rpcNameCamelCase>Loader`
- **セマンティクス契約**: entity モードの戻り `null` = 欠損(`_entities` の null に対応)。group モードの `[]` = 対象なし
- **検証の分担**: batch 宣言自体の検証(§3)は codegen-core の共有ロジックに置き、両プラグインが同じ結果を参照する(pothos 側は追加で `@key` との整合を検証)

## 7. 依存関係と開発順序

```
proto-graphql 本家: (graphql.rpc).batch オプション追加  ← Phase 0(Step 1 のオプション追加と同一 PR)
        │
        ▼
@proto-graphql/connect-runtime(仮): context 規約 + getClient + createRpcLoader
        │                            ← Phase 1 で新設(createRpcLoader はこのプラグインの実装時でも可)
        ▼
protoc-gen-dataloader 本体  ←★ federation 対応と独立して開発可能(Phase 1 と並行可)
        │
        ▼
protoc-gen-pothos Step 2(federation): asEntity / extend フィールドの resolver が loader を import
```

- **protoc-gen-pothos の federation 対応は本プラグインに依存するが、逆の依存はない**
- タスク分解と依頼票は [implementation-plan.md](./implementation-plan.md)

## 8. テスト

1. **runtime 単体テスト**(`createRpcLoader`): 照合ロジックを網羅 — 順序シャッフル / 欠損(null・[])/ 重複キー / 余剰 entity / RPC エラーの全キー伝搬 / maxBatchSize 分割 / per-context キャッシュ(同一 ctx で 1 バッチに合流、別 ctx で分離)/ group の groupBy / **loader パラメータ**(同一 params は 1 バッチに合流・異なる params は分離・`undefined` ≡ `{}`・bigint を含む params)
2. **golden テスト**(codegen): batch 付き service proto → 生成コード snapshot + TS 型チェック。推論成功系(省略)と明示指定系、エラー系(V1〜V7 の診断メッセージ snapshot)
3. **実行テスト**: `createRouterTransport` のフェイク Connect サーバに対して生成 loader を駆動し、(a) `load` の並行呼び出しが 1 RPC にまとまること(呼び出し回数計測)、(b) シャッフル/欠損/重複レスポンスでの照合結果、(c) エラー伝搬、をアサート
4. golden ハーネスは protoc-gen-pothos の `_helpers` を汎用化して共用する(実装計画のタスク参照)

## 9. 残項目

- **npm パッケージ名 / bin 名 / runtime パッケージ名(確定)**: npm 名・bin 名とも `protoc-gen-dataloader` のまま確定(空き確認済み、2026-07-12)。ランタイムも `@proto-graphql/connect-runtime` のまま確定(同日空き確認済み)
- `map<K, V>` 型 response の対応(キーマッチが自明になる形。将来)
- 単発 Get RPC の並列 fallback ローダー(BatchGet が無いサービス向け。スコープ外の可能性が高い)
- 複合キー対応(§4.3 の設計余地に沿って将来)
- 非キーフィールドへの固定値注入(proto オプション `batch.request_defaults` や context hook 案)— federation 経由で required な非キーフィールドを持つ RPC を使いたくなった場合の将来検討(現状はエラー + 専用 RPC を案内)
