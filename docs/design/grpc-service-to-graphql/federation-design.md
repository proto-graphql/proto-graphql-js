# Federation 詳細設計(Step 2)

> 関連: [design.md](./design.md)(全体設計)/ [implementation-plan.md](./implementation-plan.md) / [protoc-gen-dataloader](../protoc-gen-dataloader/design.md)

- Status: 詳細設計済み(2026-07-11)。Pothos plugin-federation 4.4.x の API をソースレベルで裏取り済み(§8 に検証済み事実)

## 1. スコープ

**Step 2 で実装する**:

- `(graphql.object_type).federation.key` による entity 宣言(**単一フィールドキーのみ**。複合キー指定はエラー)
- `(graphql.rpc).federation.entity_resolver` による resolveReference 配線(entity loader 経由)
- `federation.extends` スタブ(他 subgraph 所有 entity)+ `(graphql.rpc).federation.extend` によるフィールド追加(**外部 entity / ローカル型の両対応**)
- extend フィールドのバッチング(`batch { group: true }` → group loader)と非バッチ fallback(per-parent 並列呼び出し)
- subgraph SDL の出力検証(`printSubgraphSchema`)と composition 検証(`@apollo/composition`)

**Step 2 では実装しない**(設計余地のみ確保):

- 複合キー・複数キーセット / `@shareable` `@requires` `@provides` `@override` / `@interfaceObject` / 非 resolvable な自己 entity(`resolvable: false`)/ interface の entity 化

## 2. 生成規則

### 2.1 entity 化(`asEntity`)

**トリガー**: message に `federation.key` があり、かつどこかのサービスの RPC に当該 message を entity とする `federation.entity_resolver` が宣言されている。

**配置**: `asEntity(...)` は **entity_resolver RPC が属するサービスの proto ファイルの出力**に emit する(message ファイルは変更しない。`asEntity` は import した `Xxx$Ref` に後付けできる)。

```ts
// user_service.pb.pothos.ts(生成イメージ)
import { User$Ref } from "./user.pb.pothos";
import { batchGetUsersLoader } from "./user_service.pb.dataloader";

builder.asEntity(User$Ref, {
  key: builder.selection<{ id: string }>("id"),
  resolveReference: (ref, ctx) => batchGetUsersLoader(ctx).load(ref.id),
});
```

**生成規則の詳細**:

- `key`: `builder.selection<Shape>("fieldset")`。**fieldset 文字列と Shape のプロパティ名は GraphQL フィールド名(rename 適用後)**を使う(Pothos は selection 文字列を SDL に verbatim 出力するため)。proto オプション上の fieldset(proto フィールド名)から codegen-core の既存名前変換で導出する
- Shape の TS 型はキーフィールドの GraphQL 型に対応(`id: true` なら `string`、Int なら `number` 等)
- `resolveReference`: representation(= key shape)から **proto 値へ逆変換してから** loader を呼ぶ。単一キー・スカラーのため Step 2 では恒等変換だが、`(graphql.field).id = true` で `ID`(string)化された int64 キー等は `BigInt(ref.id)` のような逆変換を生成する。loader パラメータは渡さない(request の非キーフィールドは unset。required があれば F10 でエラー)
- entity loader の欠損(`null`)はそのまま return(`_entities` の per-representation null に対応)。RPC エラーは dataloader から reject され、`callRpc` と同じ変換規則(runtime の errorHandler)で GraphQLError 化して throw する

### 2.2 スタブ生成(`externalRef`)

**トリガー**: message に `federation = { key: [...], extends: true }`。

**配置**: スタブ message が属する proto ファイルの出力。通常の `objectRef` / `objectType` の**代わりに** `externalRef` を生成する(Input 型は通常どおり生成しない: スタブは出力専用)。

```ts
// user_stub.pb.pothos.ts(生成イメージ)
export const User$Ref = builder.externalRef(
  "User",
  builder.selection<{ id: string }>("id"),
  // resolveReference は省略: representation(キー)がそのまま parent になる
);
User$Ref.implement({
  externalFields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
  }),
});
```

- キーフィールドは `externalFields` として定義(`@external` 扱い。Pothos の文書化されたパターン)
- スタブの非キーフィールド(将来の `@requires` 用)は Step 2 では非対応(存在したらエラー)
- export 名は通常の `Xxx$Ref` 規約を維持 → extend フィールド生成側が同じ規約で import できる

### 2.3 extend フィールド生成(`objectField`)

**トリガー**: RPC に `federation.extend = { type, field, keys }`。

**配置**: extend RPC が属するサービスの proto ファイルの出力。`builder.objectField(対象$Ref, "fieldName", ...)` を emit(対象がローカル型でもスタブでも同一。`ExternalEntityRef` は `ObjectRef` のサブクラスであり cross-file の `objectField` が機能することを検証済み)。

```ts
// review_service.pb.pothos.ts(生成イメージ: batch { group: true } がある場合)
import { User$Ref } from "./user_stub.pb.pothos";
import { batchListReviewsByUsersLoader } from "./review_service.pb.dataloader";

builder.objectField(User$Ref, "reviews", (t) =>
  t.field({
    type: [Review$Ref],
    nullable: false,
    resolve: (parent, _args, ctx) =>
      batchListReviewsByUsersLoader(ctx).load(parent.id),
  }),
);
```

**resolver の分岐**:

| 条件 | 生成される resolver |
|---|---|
| 同一 RPC に `batch { group: true }` あり | group loader 経由(`DataLoader<K, V[]>`)。N+1 なし |
| 同一 RPC に `batch {}`(entity モード)あり | entity loader 経由(`DataLoader<K, V \| null>`) |
| `batch` なし | per-parent の直接 RPC 呼び出し(`getClient` + `callRpc`)。並列実行されるが N+1(docs で明記し、group loader を推奨) |

- `keys` mapping(`parent_field` → `request_field`)により、parent のフィールド値を request に詰める。batch あり時は loader のキーに渡す(単一 mapping のみ。複数はエラー = 複合キー扱い)
- extend RPC の request に `keys` mapping 対象以外の **required** フィールドがある場合はエラー(F10)。optional フィールドは unset で呼ぶ。将来、残りフィールドを GraphQL 引数として公開する際は **args → loader パラメータ**([dataloader design §4.5](../protoc-gen-dataloader/design.md))が受け皿になる(args の組ごとにバッチが分かれる意味論)
- 戻り値: 通常の RPC と同じ規則(response 型 / `expose_field` unwrap / suffix 変換)。group loader 使用時は `expose_field` 不要(loader が entity リストを返す)
- parent の型: ローカル型なら `MessageShape`、スタブなら key selection shape。`parent_field` の参照コードはこの differences を考慮して生成(スタブは GraphQL 名、ローカルは proto プロパティ名)

### 2.4 entity resolver RPC の公開制御

- `federation.entity_resolver = true` の RPC は、`operation` が明示されない限り Query フィールドを生成しない(decision-log Q15)
- `entity_resolver` は同一 RPC に `batch`(entity モード)の宣言があることを要求する(§3 F4)

## 3. 検証ルール(codegen エラー)

| # | 規則 |
|---|---|
| F1 | `federation.key` は単一フィールドの fieldset 1 つのみ(複合・複数キーセットはエラー: 非対応と明示) |
| F2 | key フィールドは message 上に存在するスカラーフィールドであること |
| F3 | `federation.key` があり `extends` でない message は、**ちょうど 1 つ**の `entity_resolver` RPC を持つこと(0 個: 解決手段がない旨 + 宣言例を提示 / 2 個以上: 曖昧) |
| F4 | `entity_resolver = true` の RPC は `batch`(entity モード、group 不可)を宣言していること。loader の entity 型 = 対象 message、`batch.entity_key`(または @key フォールバック)= `federation.key` のフィールドと一致すること |
| F5 | `extends: true` の message はキーフィールド以外を持たないこと(Step 2 制約) |
| F6 | `extend.type` は FQN で解決可能な message で、`federation.key` を持つこと(ローカル)または `extends: true` であること(スタブ) |
| F7 | `extend.keys` は 1 mapping のみ。`parent_field` は対象 message の key フィールド、`request_field` は request 上の互換型フィールドであること |
| F8 | `extend.field` の名前が対象型の既存フィールド(message 由来 + 他の extend)と衝突しないこと |
| F9 | federation 系オプション使用時、`protobuf_lib=protobuf-es` であること(Step 1 と同じガード) |
| F10 | `entity_resolver` / `extend` に使う RPC の request に **required な非キー(非 mapping)フィールドが無いこと**(生成される resolveReference / extend resolver は representation / parent 以外の情報を持たず loader パラメータを渡せないため)。optional な非キーフィールドは unset で呼ぶ。エラーメッセージでは「required `parent` 等は複合キー対応で扱う予定」と案内する |

## 4. builder / server 要件(利用者向け契約)

```ts
import SchemaBuilder from "@pothos/core";
import DirectivePlugin from "@pothos/plugin-directives";
import FederationPlugin from "@pothos/plugin-federation";

const builder = new SchemaBuilder<{ Context: MyContext; Scalars: {...} }>({
  plugins: [DirectivePlugin, FederationPlugin], // directives が先、federation は最後
});
builder.queryType({}); // 必須(Query フィールドが無い entity-only subgraph でも必要)
builder.mutationType({}); // Mutation を生成する場合のみ

// 生成ファイルを side-effect import した後:
export const schema = builder.toSubGraphSchema({}); // @link federation/v2.6(plugin デフォルト)
```

- SDL の出力・snapshot には `printSubgraphSchema(schema)`(`@apollo/subgraph`)を使う(`printSchema` は federation directive を落とす)
- **`graphql` は 16.x に固定**(`@apollo/subgraph` / `@apollo/composition` の peer 制約が `^16.5.0`。17 系は不可)。docs のセットアップガイドに明記する

## 5. 依存パッケージとバージョンポリシー

| パッケージ | 検証済みバージョン | 備考 |
|---|---|---|
| `@pothos/core` | 4.13.x | peer: graphql ^16.10 \|\| ^17 |
| `@pothos/plugin-federation` | 4.4.x | peer: `@apollo/subgraph ^2.0.0` |
| `@pothos/plugin-directives` | 4.3.x | federation の前に登録 |
| `@apollo/subgraph` | 2.14.x | peer: graphql ^16.5(**17 不可**) |
| `@apollo/composition` | 2.14.x | テスト専用(devDependency) |
| `dataloader` | 2.2.x | runtime パッケージの dependency |

- 生成コードが直接依存する API は `asEntity` / `externalRef` / `selection` / `objectField` / `queryField` / `mutationField` に限定し、docs に「検証済みバージョン範囲」を記載する。plugin のメジャーアップは golden テストで検知

## 6. テスト計画

### 6.1 fixtures(`devPackages/testapis-proto` に追加)

| proto パッケージ | 検証対象 |
|---|---|
| `testapis/federation/entity` | key + entity_resolver + batch 推論、ID 型キー、rename されたキーフィールド |
| `testapis/federation/extend_local` | ローカル型へのリレーション(group loader あり / batch なし fallback) |
| `testapis/federation/extend_external` | extends スタブ + 外部 entity へのフィールド追加 |
| `testapis/federation/errors` | F1〜F8 の診断メッセージ(snapshot) |

### 6.2 検証レイヤ

1. **golden**: 生成コード snapshot + TS 型チェック + **subgraph SDL snapshot**(golden の schema 出力を `printSubgraphSchema` に差し替えるケース種別を追加)
2. **実行テスト**: `createRouterTransport` フェイクサーバ + `graphql()` 直接実行で:
   - `_entities(representations: [...])` クエリ → 複数 representation が 1 回の BatchGet に合流すること(呼び出し回数)、欠損 representation が null になること
   - extend フィールド(group loader)→ 複数 parent の解決が 1 RPC に合流すること
   - `_service { sdl }` が federation directive を含むこと
3. **composition 検証**: `composeServices()`(単一 subgraph で可)。extend_external ケースは所有側 subgraph の SDL を文字列 fixture として用意し 2-subgraph で compose、`result.errors` が無いことをアサート

## 7. 実装上の統合点(コード配置)

| 箇所 | 内容 |
|---|---|
| `codegen-core/src/types/` | `FederationSpec`(仮): key 解析(F1/F2)、entity ↔ entity_resolver の突合(F3/F4、BatchSpec と連携)、extends 検証(F5)、extend 解決(F6〜F8)。**ファイル横断の突合が必要なため、`collectTypesFromFile` と別に「全ファイル走査で構築する index」を導入する**(`schema.allFiles` は既に渡っている) |
| `protoc-gen-pothos/src/dslgen/printers/` | `asEntity` printer / `externalRef` printer(objectType printer の分岐)/ `objectField`(extend)printer / loader import 解決(dataloader の suffix 契約) |
| `protoc-plugin-helpers` | dataloader 出力位置の指定パラメータ(デフォルト: 同一ディレクトリ・デフォルト suffix) |
| golden ハーネス | `printSubgraphSchema` モードと `_entities` 実行ケースのサポート追加 |

## 8. 検証済みの外部 API 事実(2026-07-11、ソースレベル確認)

設計の前提として裏取りした Pothos / Apollo の仕様。実装時はこの前提が崩れていないかを golden で検知する。

1. `asEntity(ref, { key, resolveReference, interfaceObject? })` — **`resolveReference` は型上必須**。`resolvable` オプションは asEntity には無い(非 resolvable は `builder.keyDirective(selection, false)` を key に渡す形。Step 2 スコープ外)
2. `externalRef(name, key?, resolveReference?)` — **key も resolveReference も optional**。resolveReference 省略時は representation(キー)がそのまま parent になる
3. **`ExternalEntityRef extends ObjectRef`** であり、`builder.objectField(ref, ...)` による**別ファイルからのフィールド追加が機能する**(ConfigStore による遅延マージ。型がどこかで implement されていれば順序不問)
4. `selection<Shape>('fieldset')` の文字列は SDL に **verbatim 出力** → GraphQL フィールド名(rename 後)で書く。ネスト fieldset(`'id organization { id }'`)は型レベルでサポートされる(複合キー将来対応の余地)
5. `toSubGraphSchema` のデフォルトは federation **v2.6** の `@link`。使用 directive は自動収集。v1 モードは存在しない
6. `queryField` / `mutationField` はコア API(plugin 不要)だがルート型の自動生成は無い → `builder.queryType({})` の呼び出しが必須
7. `composeServices([{ name, typeDefs: DocumentNode }])` は**単一 subgraph でも動作**し、`result.errors` で判定できる
8. DataLoader `maxBatchSize` は超過分を別バッチとして自動分割 dispatch(チャンク分割は DataLoader 任せで正しい)。`cacheKeyFn` 使用時も batch 関数には**元のキー**が渡る(複合キー将来対応の根拠)
9. `graphql` は 16.x 固定(Apollo 系 peer 制約)。`@pothos/plugin-directives` → `@pothos/plugin-federation` の順で登録

## 9. 残項目

- 非 resolvable な自己 entity(`federation.resolvable = false` オプション)— asEntity が resolveReference 必須のため、生成するダミー resolver の仕様検討が必要
- extend RPC の request に追加引数がある場合の GraphQL 引数化(loader パラメータ機構が受け皿。dataloader design §4.5)
- スタブへの非キー external フィールド(`@requires` の前提)
- 複合キー(オプション形式・照合・`cacheKeyFn` 設計は複合対応可能な形を維持済み)
