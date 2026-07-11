# Design: gRPC/Connect RPC Service → GraphQL Operations + Federation Subgraph

> 関連: [requirements.md](./requirements.md) / [decision-log.md](./decision-log.md)(意思決定の経緯)/ [research.md](./research.md)(前提調査)/ [protoc-gen-dataloader 設計](../protoc-gen-dataloader/design.md)

- Status: 設計合意済み(2026-07-11)。`batch` オプション独立化・group loader 追加・単一キー限定は同日の詳細設計フェーズで承認済み([decision-log.md §6](./decision-log.md))

## 1. 全体アーキテクチャ

### 1.1 方針

- **protoc-gen-pothos の拡張**として実装する(新プラグイン化・SDL 直生成・gqlkit ベース案は検討の末、今回は見送り。経緯は [decision-log.md §2 Q3〜Q6](./decision-log.md))
- PoC として進め、知見を将来の protoc-gen-gqlkit(および Pothos 版の正式化)に還元する
- resolver は**フル実装を生成**する。ユーザーが書くのは builder / context / server 組み立てのみ
- **protobuf-es v2 専用**(Connect-ES v2 が protobuf-es v2 必須のため)。`protobuf_lib=protobuf-es` 以外で `(graphql.service)` を検出したらエラー
- 2 段階リリース: **Step 1 = RPC → Query/Mutation**、**Step 2 = Federation**
- dataloader 生成は独立プラグイン **protoc-gen-dataloader** に分離(federation と独立して開発可能。[設計はこちら](../protoc-gen-dataloader/design.md))

### 1.2 実行時の構成イメージ

```
┌ GraphQL subgraph server (yoga/apollo) ┐      ┌ gRPC/Connect backend ┐
│ builder(+federation plugin)           │      │ UserService          │
│ 生成コード:                            │      │  - GetUser           │
│  - 型定義(既存の *.pb.pothos.ts)      │ ---> │  - BatchGetUsers     │
│  - Query/Mutation フィールド + resolver │ Connect Transport        │
│  - asEntity(Step 2)                  │      └──────────────────────┘
│  - dataloader(protoc-gen-dataloader) │
│ context: { transport, callOptions? }  │
└───────────────────────────────────────┘
```

- Transport 抽象により、別プロセスへの HTTP/gRPC 呼び出しと同一プロセス内の `createRouterTransport` の両方をカバーする

## 2. proto 拡張オプション(ドラフト)

proto-graphql 本家 `graphql/schema.proto` への追加。**experimental を明記**し、PoC 期間中の semantics 変更余地を宣言する。Go binding (`graphqlpb`) を同時再生成し、本リポジトリは submodule 更新 + `pnpm gen:extensions` で追従する。

```proto
// ============ Service / Method (Step 1) ============

// EXPERIMENTAL: 仕様は予告なく変更される可能性がある
message GraphqlServiceOptions {
  bool ignore = 1;  // オプション自体は残しつつ一時的に生成を止める用
}

enum GraphqlOperation {
  GRAPHQL_OPERATION_UNSPECIFIED = 0;  // 規約デフォルト(idempotency_level 由来)
  QUERY = 1;
  MUTATION = 2;
}

// EXPERIMENTAL
message GraphqlRpcOptions {
  bool ignore = 1;
  GraphqlOperation operation = 2;  // 未指定時: NO_SIDE_EFFECTS → QUERY, else MUTATION
  string name = 3;                 // フィールド名上書き(デフォルト: rpc 名の camelCase)
  string expose_field = 4;         // response の指定フィールドを戻り値として unwrap

  // バッチローダー生成対象の宣言(federation 非依存)。
  // protoc-gen-dataloader が消費する。詳細: docs/design/protoc-gen-dataloader/design.md
  GraphqlRpcBatchOptions batch = 5;

  GraphqlRpcFederationOptions federation = 10;  // Step 2
}

// EXPERIMENTAL: protoc-gen-dataloader 用(詳細は同設計ドキュメント参照)
message GraphqlRpcBatchOptions {
  string key_field = 1;      // request 中のキーリスト(唯一の repeated なら省略可)
  string entity_field = 2;   // response 中の entity リスト(唯一の repeated message なら省略可)
  string entity_key = 3;     // entity 側のキーフィールド(省略時 @key にフォールバック。group 時は必須)
  bool group = 4;            // 1 キー → N entities(DataLoader<K, V[]> を生成)
  uint32 max_batch_size = 5; // 1 回の RPC に載せる最大キー数(0 = 無制限)
}

// ============ Federation (Step 2) ============

// EXPERIMENTAL
message GraphqlRpcFederationOptions {
  // batch 宣言済みの RPC を entity resolver として使う。
  // entity の @key と batch のキーの整合を codegen 時に検証する
  bool entity_resolver = 1;
  GraphqlExtendOptions extend = 2;
}

message GraphqlExtendOptions {
  string type = 1;   // 拡張対象 message(FQN)。スタブ message / ローカル message 両対応
  string field = 2;  // 追加フィールド名(省略時: rpc 名の camelCase)
  repeated GraphqlKeyMapping keys = 3;  // 親フィールド値 → request フィールドの対応
}

message GraphqlKeyMapping {
  string parent_field = 1;   // 親型の proto フィールド名
  string request_field = 2;  // RPC request の proto フィールド名
}

// EXPERIMENTAL: GraphqlObjectTypeOptions に追加
message GraphqlFederationOptions {
  // entity 宣言。fieldset は proto フィールド名で記述(例: "id", "org_id id")
  // 生成時に GraphQL フィールド名へ変換される((graphql.field).name と整合)
  repeated string key = 1;
  // 他 subgraph 所有 entity のスタブ宣言(Pothos externalRef として生成)
  bool extends = 2;
}

extend google.protobuf.ServiceOptions { GraphqlServiceOptions service = 2056; }
extend google.protobuf.MethodOptions  { GraphqlRpcOptions rpc = 2056; }
// GraphqlObjectTypeOptions { ... GraphqlFederationOptions federation = 5; }
```

file レベル(`GraphqlSchemaOptions`)への追加(名称は実装時に確定):

```proto
message GraphqlSchemaOptions {
  // 既存: type_prefix=1, ignore_requests=2, ignore_responses=3, ignore=4
  // 新規(ignore_requests/responses の発展形。併用時の優先順位は実装時に定義):
  bool requests_as_inputs = 5;     // XxxRequest → XxxInput(Input のみ生成)
  bool responses_as_payloads = 6;  // XxxResponse → XxxPayload(Object のみ生成)
}
```

## 3. Step 1: RPC → Query/Mutation

### 3.1 マッピング規則

| 項目 | 規則 |
|---|---|
| 対象 | `(graphql.service)` 付きサービスの unary RPC(`ignore` 除く) |
| operation | 明示 `operation` > `idempotency_level=NO_SIDE_EFFECTS` → Query > それ以外 Mutation |
| フィールド名 | camelCase(rpc 名)、`name` で上書き |
| Query 引数 | request フィールドを flatten(message フィールドは `FooInput` 参照、oneof は optional 展開) |
| Mutation 引数 | `input: XxxInput!` の単一引数 |
| 戻り値 | response message 型(変換有効時 `XxxPayload`)。`expose_field` 指定時のみ unwrap |
| streaming | 生成対象外+警告。明示 `operation` 付きならエラー |
| `google.protobuf.Empty` | request → 引数ゼロ / response → `Boolean`(常に `true`) |

**意図的に採用しないもの**(理由は [decision-log.md](./decision-log.md) Q7/Q9/Q11):

- 単一フィールド response の自動 unwrap — response へのフィールド追加で GraphQL スキーマが暗黙に破壊的変更される進化ハザード
- 命名規約(prefix)による operation 推定・AIP 風 prefix 除去 — 誤爆リスク(`GetOrCreateSession` 等)

### 3.2 生成コードのイメージ

```ts
// user_service.pb.pothos.ts(生成イメージ、抜粋)
import { builder } from "../builder";
import { getClient, callRpc } from "@proto-graphql/connect-runtime"; // 名称仮
import { UserService, GetUserRequestSchema } from "./user_service_pb";
import { User$Ref } from "./user.pb.pothos";

builder.queryField("getUser", (t) =>
  t.field({
    type: User$Ref,
    nullable: true,
    args: { userId: t.arg({ type: "String", required: true }) },
    resolve: async (_root, args, ctx) => {
      const client = getClient(ctx, UserService);
      const res = await callRpc(ctx, (opts) =>
        client.getUser(create(GetUserRequestSchema, { userId: args.userId }), opts),
      );
      return res.user; // expose_field: "user" の場合
    },
    extensions: { protobufMethod: { ... } },
  }),
);
```

- 出力先は既存の「1 proto ファイル = 1 出力ファイル」を維持し、同一 `*.pb.pothos.ts` に append する
- `builder.queryField` / `builder.mutationField` を使用(ユーザーの builder に `queryType({})` / `mutationType({})` が必要 — golden の builder 慣行と同じ。ドキュメント化する)
- 型参照・Input 変換(`XxxInput$toProto` 相当)は既存 printer 基盤を再利用
- Mutation の生成イメージ:

```ts
builder.mutationField("createUser", (t) =>
  t.field({
    type: CreateUserPayload$Ref,   // responses_as_payloads による変換後の型
    nullable: false,
    args: { input: t.arg({ type: CreateUserInput$Ref, required: true }) },
    resolve: async (_root, args, ctx) => {
      const client = getClient(ctx, UserService);
      return await callRpc(ctx, (opts) =>
        client.createUser(CreateUserInput$toProto(args.input), opts),
      );
    },
  }),
);
```

### 3.3 runtime パッケージ(新設)

Pothos 系で初のランタイムパッケージ。名称仮: `@proto-graphql/connect-runtime`。protoc-gen-dataloader の生成物とも共有する(同設計ドキュメント §3.2)。

```ts
// context 規約(ユーザーの context 型が構造的に満たす)
interface ProtoGraphqlConnectContext {
  protoGraphql: {
    transport: Transport;                        // デフォルト transport
    transports?: Map<string, Transport>;         // service typeName 毎の上書き(任意)
    callOptions?: (ctx: unknown) => CallOptions; // per-request ヘッダ等(任意)
    errorHandler?: (err: ConnectError) => Error; // エラー変換差し替え(任意)
  };
}

function getClient<S extends GenService>(ctx, service: S): Client<S>; // per-service memoize (WeakMap)
function callRpc<T>(ctx, fn: (opts: CallOptions) => Promise<T>): Promise<T>; // callOptions 適用 + エラー変換
function createRpcLoader(...): (ctx) => DataLoader<K, V | null>;      // protoc-gen-dataloader 用
```

- context 型が規約を満たさない場合、生成コードが型エラーになる(コンパイル時検出)
- **エラー変換**: `ConnectError` → `GraphQLError(message = rawMessage, extensions: { code: "NOT_FOUND" 等 })`。details はデフォルト非掲載(情報漏洩防止)。`errorHandler` で差し替え可能

### 3.4 既存コードとの統合点

| 変更箇所 | 内容 |
|---|---|
| `proto-graphql/proto/graphql/schema.proto`(本家) | §2 のオプション追加 |
| `codegen-core/src/__generated__/extensions/` | `pnpm gen:extensions` で再生成 |
| `codegen-core/src/types/util.ts` | `getServiceOptions` / `getRpcOptions` 追加(既存 getter 群・`EMPTY_*_OPTIONS` パターンに倣う)。`exceptRequestOrResponse` を suffix 変換対応に拡張 |
| `codegen-core/src/types/` | `OperationField`(仮)等、`DescMethod` を包む型抽象を追加。`collectTypesFromFile` 相当の operation 収集を追加 |
| `protoc-gen-pothos/src/dslgen/printers/` | operation printer(queryField/mutationField + resolver)追加 |
| `protoc-plugin-helpers/src/options.ts` | 必要なら plugin パラメータ追加(基本は proto オプション駆動で不要の想定) |

## 4. Step 2: Federation

### 4.1 entity 宣言と解決

```proto
message User {
  option (graphql.object_type).federation = { key: ["id"] };
  string id = 1 [(graphql.field).id = true];
  string name = 2;
}

service UserService {
  option (graphql.service) = {};
  rpc BatchGetUsers(BatchGetUsersRequest) returns (BatchGetUsersResponse) {
    option (graphql.rpc) = {
      batch: {}                       // フィールド対応は自動推論(protoc-gen-dataloader が消費)
      federation: { entity_resolver: true }
    };
  };
}
```

生成(イメージ):

```ts
// protoc-gen-pothos の出力(federation 有効時)
import { batchGetUsersLoader } from "./user_service.pb.dataloader"; // protoc-gen-dataloader の出力

builder.asEntity(User$Ref, {
  key: builder.selection<{ id: string }>("id"),
  resolveReference: (ref, ctx) => batchGetUsersLoader(ctx).load(ref.id),
});
```

- **entity resolver RPC はデフォルトで Query 非公開**(公開したければ `operation: QUERY` を併記)
- loader の生成・per-context キャッシュ・**キーマッチ照合**(順序非依存、欠損 null、エラー全キー伝搬)の仕様は [protoc-gen-dataloader 設計 §3](../protoc-gen-dataloader/design.md) を正とする
- `@pothos/plugin-dataloader` には依存しない(builder 要件を federation plugin のみに抑える)

### 4.2 entity 拡張・リレーション(RPC のフィールド化)

他 subgraph 所有の entity への拡張(例: Reviews subgraph が User に `reviews` を生やす):

```proto
// スタブ message: この subgraph が知っている User の形
message User {
  option (graphql.object_type).federation = { key: ["id"], extends: true };
  string id = 1 [(graphql.field).id = true];
}

service ReviewService {
  option (graphql.service) = {};
  rpc ListReviewsByUser(ListReviewsByUserRequest) returns (ListReviewsByUserResponse) {
    option (graphql.rpc).federation.extend = {
      type: "example.reviews.User", field: "reviews",
      keys: [{ parent_field: "id", request_field: "user_id" }]
    };
  };
}
```

- スタブは Pothos の `externalRef` として生成(キーフィールドは `@external`)
- **extend 対象がローカル message の場合も同一機構**で、既存 `objectRef` へのフィールド追加として生成する(自 subgraph 内リレーション: `User.posts` 等)。バッチングが必要な場合は同じ RPC に `batch { group: true }` を宣言し、group loader(`DataLoader<K, V[]>`)経由で解決する。batch 宣言がなければ per-parent の並列呼び出しにフォールバック
- キーの型が proto の型システムで表現されるため、型不一致は codegen 時に検証可能

### 4.3 builder / server 組み立て(ユーザーコード)

```ts
const builder = new SchemaBuilder<{ Context: MyContext; Scalars: {...} }>({
  plugins: [DirectivePlugin, FederationPlugin],  // federation は最後
});
builder.queryType({});
// 生成ファイル群を side-effect import
const schema = builder.toSubGraphSchema({}); // federation v2
```

## 5. テスト戦略

golden test framework(`tests/golden/`)を拡張する:

1. **codegen snapshot / 型チェック / SDL snapshot**: service 付き proto を `devPackages/testapis-proto` に追加し、既存の 5 段検証に載せる
2. **実行テスト**: `createRouterTransport` でフェイク Connect サーバを in-process に立て、`query.graphql` → `query-result.json` スナップショット(既存の休眠経路を初活用)。生成 resolver の引数詰め替え・エラー変換を実行時に検証
3. **Step 2**: `_entities(representations)` クエリの直接実行スナップショット + `@apollo/composition` で compose 可能なことの検証
4. 注意: 現状の golden `schema.ts` は生成物を import していない。本機能のケースでは builder/schema が生成ファイルを side-effect import する構成にする

## 6. 後方互換・ガード

- 新オプション未使用の既存ユーザーの出力は完全に不変(R12)
- `(graphql.service)` + `protobuf_lib != protobuf-es` → エラー
- streaming RPC + 明示 `operation` → エラー、暗黙は警告スキップ

## 7. 実装時に確定する残項目

- suffix 変換オプションの正式名(`requests_as_inputs` / `responses_as_payloads` は仮)と `ignore_requests`/`ignore_responses` 併用時の優先順位
- Query flatten 時の oneof 引数の XOR バリデーション(生成 resolver 内での runtime check の要否)
- runtime パッケージの正式名(`@proto-graphql/connect-runtime` は仮)
- Pothos federation plugin のバージョン互換ポリシー(`@pothos/plugin-federation` ^4.4 時点の API 前提)
- protoc-gen-dataloader 側の残項目は[同設計ドキュメント §8](../protoc-gen-dataloader/design.md)

## 8. スコープ外(将来)

- Subscription(server streaming → Subscription 変換)
- ts-proto / protobuf-es v1 対応
- `@shareable` / `@requires` / `@provides` / `@override` / `@interfaceObject`(`federation` ネスト下に追加余地を確保済み)
- NOT_FOUND → null 変換オプション(`errorHandler` で各自対応可能)
- protoc-gen-gqlkit(gqlkit の値変換機構・federation 対応と合わせて別途設計。[research.md §3](./research.md) と [decision-log.md §6](./decision-log.md) 参照)
