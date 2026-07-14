# Requirements: gRPC/Connect RPC Service → GraphQL Operations + Federation Subgraph

> 関連: [design.md](./design.md) / [decision-log.md](./decision-log.md) / [protoc-gen-dataloader 設計](../protoc-gen-dataloader/design.md)

## 概要

protoc-gen-pothos を拡張し、gRPC (Connect RPC) の Service/RPC 定義から GraphQL の Query/Mutation フィールドを resolver 実装込みで生成する。生成された GraphQL スキーマは GraphQL Federation の subgraph として運用できる(`@key` による entity 解決、BatchGet RPC からの dataloader 生成、他 subgraph が所有する entity への拡張)。

2 段階でリリースする:

- **Step 1**: RPC → Query/Mutation resolver 生成
- **Step 2**: Federation 対応(entity / dataloader / entity 拡張)

dataloader 生成プラグイン(protoc-gen-dataloader)は Step 2 の依存物だが、**federation 対応と独立して開発可能**なため要求・設計を[別ドキュメント](../protoc-gen-dataloader/design.md)に分離している。

## 用語

- **公開 RPC**: `(graphql.rpc).operation` に `QUERY`/`MUTATION` を明示し、`(graphql.rpc).ignore` されていない unary RPC(Q31: service 単位のオプトインはない)
- **batch RPC**: `(graphql.rpc).batch` が宣言された BatchGet 系 RPC(dataloader 生成対象)
- **entity resolver RPC**: batch RPC のうち `(graphql.rpc).federation.entity_resolver` が宣言されたもの
- **extend RPC**: `(graphql.rpc).federation.extend` により既存型のフィールドとして公開される RPC

## Step 1: RPC → Query/Mutation

### R1. オプトインと対象選別(Q31 により全面改訂)
- R1.1: システムは `(graphql.rpc).operation` に `QUERY` または `MUTATION` が明示された RPC のみを生成対象とすること。service 単位のオプトインオプションは存在しない — RPC ごとの `operation` 明示指定が唯一のオプトイン条件である
- R1.2: `(graphql.rpc).ignore = true` の RPC は生成対象から除外すること(`operation` が明示されていても、`ignore` が優先されサイレントに非生成となる)
- R1.3: streaming RPC(client/server/bidi)は、`operation` が未指定であれば他の未注釈 RPC と同様サイレントに生成対象外とすること(警告は出力しない)。明示的に `operation` が指定されている場合はエラーとすること
- R1.4: 本機能は `protobuf_lib=protobuf-es`(v2)でのみ有効とすること。`operation` を設定した RPC を含むファイルが他ランタイムでビルドされた場合はエラーとすること

### R2. operation 種別の決定(Q31 により全面改訂)
- R2.1: `(graphql.rpc).operation` に `QUERY` または `MUTATION` を明示した RPC のみ、その値どおりに Query/Mutation として生成すること
- R2.2: `idempotency_level` は operation 種別の決定に一切使用しないこと。規約デフォルト(旧 R2.2: `NO_SIDE_EFFECTS` → Query)は撤廃された

### R3. フィールド名
- R3.1: デフォルトのフィールド名は RPC 名の camelCase とすること(`GetUser` → `getUser`)
- R3.2: `(graphql.rpc).name` で上書きできること

### R4. 引数
- R4.1: Query の場合、request message のフィールドを GraphQL 引数として flatten すること(ネストした message フィールドは既存の `FooInput` 型を参照)
- R4.2: Mutation の場合、単一の `input` 引数(request message 由来の Input 型)とすること
- R4.3: 引数の nullability は既存のフィールド nullability 規則(明示オプション > proto3 optional > behavior comment 等)に従うこと

### R5. Request/Response の型変換
- R5.1: file レベルオプションにより、RPC の `XxxRequest` message から suffix を `Input` に変換した Input object を生成できること(`ignore_requests` の発展形)
- R5.2: 同様に `XxxResponse` から suffix を `Payload` に変換した object type を生成できること(`ignore_responses` の発展形)
- R5.3: デフォルトの戻り値は response message 由来の型(変換有効時は `XxxPayload`)とし、構造を保持すること
- R5.4: `(graphql.rpc).expose_field` により response 中の指定フィールドを戻り値として unwrap できること(暗黙の自動 unwrap は行わない)
- R5.5: `google.protobuf.Empty` は request 側では引数ゼロ、response 側では `Boolean`(常に `true`)として扱うこと

### R6. resolver 実装
- R6.1: resolver は完全な実装を生成すること(ユーザーによる resolver 記述を不要とする)
- R6.2: resolver は GraphQL context 上の規約キーから Connect Transport を取得し、runtime パッケージの `getClient(ctx, Service)`(サービス毎 memoize)経由で client を得ること
- R6.3: per-request のヘッダ等は context 規約上の callOptions hook から伝搬できること
- R6.4: `ConnectError` は `GraphQLError`(`extensions.code` に Connect の code 名)へ変換して throw すること。エラー詳細(details)はデフォルト非掲載とし、変換関数は runtime パッケージで差し替え可能とすること

## Step 2: Federation

### R7. entity 宣言(@key)
- R7.1: `(graphql.object_type).federation.key`(repeated、fieldset 文字列)により entity を宣言できること
- R7.2: fieldset は proto フィールド名で記述し、生成時に GraphQL フィールド名へ変換すること(`(graphql.field).name` と整合)
- R7.3: entity は Pothos の `asEntity` として生成され、`@pothos/plugin-federation` を登録した builder で `toSubGraphSchema()` により subgraph スキーマを構築できること

### R8. entity 解決(resolveReference + dataloader)
- R8.1: batch RPC に `(graphql.rpc).federation.entity_resolver` を宣言することで、その RPC を entity の解決手段にできること
- R8.2: entity resolver RPC は、`operation` が明示されない限り Query フィールドとしては公開しないこと
- R8.3: resolveReference は protoc-gen-dataloader が生成する per-context キャッシュの loader を経由し、同一リクエスト内の representation をバッチして BatchGet RPC を呼ぶこと
- R8.4: entity の `@key` と loader のキー(`batch.entity_key` または推論結果)の整合を codegen 時に検証すること
- R8.5: 照合はキーマッチ方式であること(詳細要求は [protoc-gen-dataloader 設計](../protoc-gen-dataloader/design.md) §3.3 に定義: 順序非依存、欠損 null、エラー全キー伝搬)

### R9. entity 拡張・リレーション(RPC のフィールド化)
- R9.1: 他 subgraph 所有の entity は、キーフィールドのみを持つスタブ message + `(graphql.object_type).federation` の extends 宣言で表現できること(Pothos の `externalRef` として生成)
- R9.2: `(graphql.rpc).federation.extend` により、RPC を指定型のフィールドとして公開できること(親のキーフィールド値 → request フィールドの対応を宣言)
- R9.3: extend 対象はスタブ message(外部 entity)とローカル message(自 subgraph 内リレーション)の両方をサポートすること

## 横断要求

### R10. proto 拡張オプション
- R10.1: 新オプション(`(graphql.rpc)`(`operation`/`batch` 等を含む)、`GraphqlFederationOptions` 等)は proto-graphql 本家リポジトリの `graphql/schema.proto` に experimental 明記で追加すること(field number 2056 慣例、Go binding 同時再生成、submodule 更新後 `pnpm gen:extensions`)。service 単位のオプトインオプションは追加しない(Q31)

### R11. テスト
- R11.1: golden test framework に service 付き testapis proto を追加し、コード snapshot / 型チェック / SDL snapshot を検証すること
- R11.2: `createRouterTransport` によるフェイク Connect サーバを用い、`query.graphql` 実行スナップショット(既存の休眠経路)で resolver の実行時挙動を検証すること
- R11.3: Step 2 では `_entities` クエリの直接実行と `@apollo/composition` による compose 可能性を検証すること

### R12. 後方互換
- R12.1: 新オプションを使用しない既存ユーザーの生成結果は一切変化しないこと

## スコープ外(将来課題)

- Subscription(server streaming RPC の変換)
- ts-proto / protobuf-es v1 でのサービス生成(設計上の拡張余地は残す)
- `@shareable` / `@requires` / `@provides` / `@override` 等の高度な federation directive(`federation` ネスト下に将来追加)
- NOT_FOUND → null 変換(エラー変換 hook で各自対応可能)
- protoc-gen-gqlkit(本 PoC の知見を踏まえた将来プロジェクト。[decision-log.md §6](./decision-log.md) 参照)
