# Research: gRPC Service → GraphQL 生成の前提調査

> 関連: [design.md](./design.md) / [decision-log.md](./decision-log.md)

設計セッション(2026-07-11)で実施した調査の要約。設計判断の根拠として参照する。意思決定そのものの経緯は [decision-log.md](./decision-log.md) に記録している。

## 1. 現行コードベースの事実

### 1.1 プラグイン構成(CLAUDE.md は一部 stale)

- 生きているのは **protoc-gen-pothos のみ**。protoc-gen-nexus / proto-descriptors は削除済み(PR #450 ほか)
- descriptor 処理は `@bufbuild/protoplugin` + `@bufbuild/protobuf`(protobuf-es v2)ベース
- 生成対象 runtime は `protobuf_lib` パラメータで `ts-proto` / `protobuf-es-v1` / `protobuf-es`(v2)の 3 択。**protobuf-es v2 はフルサポート済み**(`XxxSchema` + `MessageShape`、`create()`、`isMessage()`)
- 出力は「1 proto ファイル = 1 出力ファイル」(`*.pb.pothos.ts`)。ユーザー提供の `builder` を import して型を side-effect 登録(`pothos_builder_path` パラメータ)
- Pothos 系の生成コードは**完全ランタイムフリー**(依存は `@pothos/core` と protobuf runtime のみ)。ランタイムパッケージは存在しない
- Connect / gRPC / federation 関連の依存・コードは**一切存在しない**

### 1.2 Service/Method の扱い

- サービスを触るのは `codegen-core/src/types/util.ts` の `exceptRequestOrResponse()` のみ(`${Method}Request` / `${Method}Response` 命名の message を `ignore_requests` / `ignore_responses` で除外するためのウォーク)。**Query/Mutation 生成は皆無**
- `DescMethod` は `.input` / `.output`(DescMessage)、`.methodKind`(streaming 判別)を公開しており、必要な descriptor 情報は揃っている

### 1.3 proto 拡張オプションの現状

- 定義元は submodule `proto-graphql/proto/graphql/schema.proto`(唯一の extension ファイル、Go binding 同居)
- File(schema=2056)/ Message(object_type=2056, input_type=2057)/ Field(field=2056)/ Oneof / Enum / EnumValue のみ。**ServiceOptions / MethodOptions の extension は存在しない**(完全グリーンフィールド)
- 読み取りは `codegen-core/src/types/util.ts` の getter 群(`getExtension` + frozen `EMPTY_*_OPTIONS` シングルトン)に集約。ここに `getServiceOptions` / `getRpcOptions` を足すのが自然
- TS binding は `scripts/compile-extensions-proto`(`pnpm gen:extensions`)で `codegen-core/src/__generated__/extensions/` に再生成

### 1.4 型モデルと printer

- `codegen-core/src/types/`: `TypeBase` 派生(ObjectType / InputObjectType / EnumType / OneofUnionType / SquashedOneofUnionType / InterfaceType)+ `FieldBase` 派生。`collectTypesFromFile` が入口
- message は ObjectType と InputObjectType(`FooInput` + `Foo$toProto` コンバータ)の両方に生成される — RPC の入出力変換の下地が既にある
- printer は `protoc-gen-pothos/src/dslgen/printers/`(ts-poet ではなく自前の `code` タグ付きテンプレート + dprint)。builder import は `pothosBuilderPrintable`(`opts.pothos.builderPath`)
- nullability: 明示オプション > proto3 optional > `LABEL_REQUIRED`/scalar > behavior comment(`// Required.` 等)
- フィールドゼロの message には `_: Boolean`(noop フィールド)を生成する既存規約がある(`testapis.basic.empty` の golden 出力で確認)

### 1.5 テスト基盤

- 旧 e2e(`e2e/tests.json`)は **golden test framework に置換済み**(PR #470)。`tests/golden/<runtime-variant>/<proto-package>/`
- 検証 5 段: in-process codegen snapshot → TS 型チェック → SDL snapshot → (query.graphql があれば)実行結果 snapshot。**実行経路は配線済みだが全ケース未使用(休眠)**
- 現状の golden `schema.ts` は生成物を import していない(SDL snapshot は builder 骨格のみ)。本機能では side-effect import する構成が必要
- testapis に service を含む proto は 1 つだけ(`testapis/options/schema/schema.proto` の PostsService — ignore_requests/responses の検証用)
- proto は `buf.gen.testapis.yaml`(`pnpm gen:testapis`)でコンパイル。golden は `buildCodeGeneratorRequest`(committed FileDescriptorSet)で buf 不要

## 2. 外部ライブラリの事実(2026-07 時点)

### 2.1 @pothos/plugin-federation(4.4.x)

- `builder.asEntity(TypeRef, { key: builder.selection<Shape>('fieldset'), resolveReference })`。複数キーは `keys: [...]`
- **`asEntity` は既存 TypeRef に後付けできる** → message printer を変更せずに entity 化可能(統合判断の根拠)
- `resolveReference` は **representation 毎に 1 回**呼ばれる(バッチ版なし)→ dataloader でのバッチが公式推奨パターン
- 外部 entity は `builder.externalRef(name, keySelection).implement({ externalFields, fields })`(`@external` / `@requires` 対応)
- 要 `@pothos/plugin-directives` + `@apollo/subgraph`。plugin 順は federation を最後に。`builder.toSubGraphSchema()`(デフォルト fed v2.6)
- 詳細設計フェーズでのソースレベル追検証(2026-07-11): `resolveReference` は型上必須 / `ExternalEntityRef extends ObjectRef` で cross-file の `builder.objectField` が機能 / selection 文字列は SDL に verbatim 出力(GraphQL 名で記述)/ `composeServices` は単一 subgraph で検証可 / **Apollo 系 peer 制約により graphql は 16.x 固定**。全文は [federation-design.md §8](./federation-design.md)

### 2.2 @pothos/plugin-dataloader(4.4.x)→ 不採用

- `loadableObject` / `getDataloader(ctx)` 等は存在するが、builder への plugin 追加が必須になり生成コードが plugin API に結合するため、自前 loader(dataloader npm + WeakMap per-context)を採用(decision-log Q16〜Q17)

### 2.3 Connect-ES v2(@connectrpc/connect 2.x)

- **protobuf-es v2 必須**(peerDep `@bufbuild/protobuf ^2.x`)→ 本機能を protobuf-es v2 専用とする根拠
- `protoc-gen-es` v2 単体で message + **`GenService`**(service 記述子)を生成(protoc-gen-connect-es は廃止)。`createClient(Service, transport)`
- Transport: `createConnectTransport` / `createGrpcTransport`(@connectrpc/connect-node)、**`createRouterTransport` で in-process 実行可能**(テスト・同一プロセス運用の根拠)
- interceptor による横断的ヘッダ操作も可能だが、per-call の `{ headers, signal }` オプションが per-request 伝搬の主経路
- エラー: `ConnectError`(16 値の `Code`、`rawMessage`、`metadata`、`details`、`findDetails()`)

### 2.4 Federation の entity 解決セマンティクス

- Router は `_entities(representations: [_Any!]!)` を**リクエスト毎にまとめて**送る。結果は「representation と同順、欠損は null」が仕様
- `@apollo/subgraph` は `__resolveReference` を representation 毎に呼ぶ → per-request dataloader が標準対策

### 2.5 AIP-231 BatchGet

- 「レスポンスはリクエスト順・atomic(欠損は全体 NOT_FOUND)」が仕様。ただし現実の実装は「見つかったものだけ返す」「順序保証なし」も多い
- → **キーマッチ照合**(entity の @key フィールド値で突き合わせ)を採用。順序前提は非準拠サーバで silent data corruption を起こすため不採用(decision-log Q18)

### 2.6 GraphQL Code Generator Server Preset(検討時の調査)

- `@eddeee888/gcg-typescript-resolver-files`: SDL → 「1 フィールド = 1 resolver ファイル」の**人間が編集するスタブ**を生成し、既存実装を上書きしない思想
- 機械による resolver 全生成とは思想が衝突。ただし `typescript-resolvers` の型規約は「preset 互換の完全実装済み resolvers map」という形で再利用可能(SDL 直生成案の根拠。最終的に見送り — decision-log Q4〜Q5)

## 3. gqlkit 調査(将来の protoc-gen-gqlkit のための記録)

[izumin5210/gqlkit](https://github.com/izumin5210/gqlkit)(cli 0.7.2 / runtime 0.3.0、pre-1.0)をクローンして精査した結果:

### 3.1 アーキテクチャ

- **静的解析器**: runtime パッケージはほぼ phantom type + identity 関数(`defineQuery` / `defineMutation` / `defineSubscription` / `defineField` / `defineResolveType` / `defineIsTypeOf`、`GqlScalar` / `GqlObject` / `GqlInterface` / `GqlField` / `GqlDirective`)。実処理はすべて CLI が TS Compiler API(ts-morph 不使用)で型を解析
- `gqlkit gen`: `src/gqlkit/schema/` をスキャン → 2 フェーズ型抽出 → `typeDefs.ts`(DocumentNode AST)+ `resolvers.ts`(`createResolvers()`)+ `schema.graphql` を出力 → `makeExecutableSchema` で組み立て
- 検出は**構造的**(空白 prefix の phantom property。import 元は見ない)→ **生成された TS コードはそのまま通る**。protobuf-es / Prisma 生成型を模した golden test(`export-declaration-wildcard`)が既に存在し、re-export バレル経由の外部型取り込みが動作する

### 3.2 値変換の実態

- 「TS モデル型 = resolver parent 型」で、GraphQL 型は TS 型から導出される
- 自動変換は限定的: enum 値マップ(`ACTIVE: "active"`)、カスタムスカラー(`GqlScalar` ブランド型 or config。**実装はユーザー注入**)、`ignoreFields`、`$typeName` / `__typename` の自動除去
- **任意のフィールド変換は `defineField` で表現する** = Pothos 版の field resolver 生成と本質的に同等の生成が必要(「gqlkit なら変換が要らない」わけではない)

### 3.3 proto 由来型を流す際のギャップ

1. **`bigint` 未対応**: `PRIMITIVE_TYPE_MAP` に無く、`UNRESOLVED_REFERENCE` で**生成が hard fail**。protobuf-es は int64 系をデフォルト bigint にするため致命的 → `GqlScalar<"Int64", bigint>` のブランド型を生成すれば回避可(フィールド型として明示使用する場合は phantom property 検出で動く)
2. **oneof**: protobuf-es の `{case, value}` 判別 union はそのままでは GraphQL union にならない → 型の再整形 + `defineField` / `defineResolveType` の生成が必要($typeName が dotted name のため auto `__resolveType` も誤る → `defineResolveType` 生成で解決)
3. **enum 規約**: proto の `UNSPECIFIED` 除去・prefix 除去規約は gqlkit に無い(gqlkit 独自の prefix 除去はある)→ literal union 型を生成すれば制御可能
4. `$unknown` 等の `$` 付きフィールドは `SKIPPED_FIELD` 警告(非致命だがノイズ)
5. resolver は `export const X = defineField<Parent, Args, Ret>(impl)` の**明示型引数が必須**(構文的に型引数を読むため)。pruning デフォルト有効のため参照されない型は消える(codegen 側で考慮要)

### 3.4 federation / dataloader

- **federation は完全未対応**(`@key` / entity / `resolveReference` / subgraph への言及ゼロ)。ただし directive の定義・適用機構(型・フィールド・引数・input field)は実装済み → `@key` を directive として生成し、`buildSubgraphSchema({ typeDefs, resolvers })` + `__resolveReference` の手動マージという **gqlkit 非改修の glue 構成が成立する見込み**。ネイティブ対応は gqlkit 側のロードマップ判断
- dataloader のサポート・規約は無し(context 経由でユーザー実装) → **protoc-gen-dataloader の生成物がそのまま使える**

## 4. 検討したが不採用としたアーキテクチャ(要約)

経緯の詳細は [decision-log.md §2 Q3〜Q6](./decision-log.md)。

1. **新プラグイン(コンパニオン型/スーパーセット型)**: printer 共有のためのリファクタが先行し、builder パス等の設定整合をユーザーが担保する必要 → 不採用
2. **protoc-gen-graphql(SDL + typescript-resolvers 互換の resolvers map 直生成)**: 「resolver を全生成するなら Pothos の code-first DSL は冗長」という問題意識から検討。federation を SDL の本家表現で扱え framework 非依存という利点はあるが、値変換(oneof/enum/int64)の生成は結局必要で、既存資産を捨てる割に得るものが PoC 段階では小さい → 見送り
3. **protoc-gen-gqlkit ベース**: §3 の通りギャップが具体的に存在し、federation 対応の前提作業が発生 → 将来課題化
4. **最終判断**: 既存の protoc-gen-pothos 拡張として PoC。値変換は既存機構がそのまま解決し、`asEntity` の後付けにより message printer 変更も不要。PoC の知見を gqlkit 版と Pothos 版 federation の段階的対応(resolver 対応 → federation 対応)に還元する
