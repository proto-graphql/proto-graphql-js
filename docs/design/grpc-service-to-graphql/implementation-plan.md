# Implementation Plan: gRPC Service → GraphQL(全体)

> 設計: [design.md](./design.md) / [federation-design.md](./federation-design.md) / [protoc-gen-dataloader](../protoc-gen-dataloader/design.md)
> dataloader トラックのタスク詳細: [../protoc-gen-dataloader/implementation-plan.md](../protoc-gen-dataloader/implementation-plan.md)

実装は **opus / sonnet の subagent に委譲**する前提。各タスクは「依頼票」としてそのまま subagent への指示に使える粒度で記述する。

## 0. 進め方の共通規約

### 依頼票の使い方

- 各タスクの依頼時は、**依頼票本文 + 「参照」欄のドキュメント(該当セクション)を必読指定**する。設計ドキュメントが正であり、依頼票は要約にすぎない
- subagent は受け入れ基準のコマンドを自分で実行して結果を報告する
- 「変更してはいけないもの」を守る: 既存 golden スナップショット(意図した変更以外)、既存パッケージの公開 API、無関係ファイルの整形

### ブランチ・コミット・レビュー

- タスク毎に feature ブランチ + worktree 分離。Conventional Commits(`feat(codegen-core): ...` 等)で小さくコミット
- golden snapshot の更新(`vitest -u`)は意図した出力変更のみ。想定外差分が出たら停止して報告
- 各タスク完了後、メインセッションで code-review(正しさ / 既存規約整合 / 設計ドキュメントとの一致)→ 修正 → マージ

### モデル選定の指針

| モデル | 向くタスク |
|---|---|
| **opus** | 新規の型抽象・printer 設計・既存テスト資産のリファクタ・診断メッセージ UX など、依頼票だけでは閉じない判断を含むもの(T1.2, T1.3, T3.1, T3.2, D2, D4) |
| **sonnet** | 依頼票と設計ドキュメントで仕様が閉じている機械的実装・fixtures・docs(T0.x, T1.1, T1.4, T1.5, T1.6, T3.3, T3.4, D1, D3, D5, D6) |

難所(T1.3 / T3.2)は effort 高めを指定する。

## 1. フェーズ構成と依存グラフ

```
Phase 0: オプション基盤
  T0.1 本家 proto にオプション追加 ──▶ T0.2 submodule bump + gen:extensions + getters
                                            │
Phase 1: Step 1(resolver 生成)             ▼
  T1.1 runtime パッケージ ──────────┬────────┤
  T1.2 codegen-core operation 抽象 ─┤        │
                                    ▼        │
  T1.3 operation printer ◀──────────┘        │
  T1.4 suffix 変換(T1.2 後、T1.3 と並行可) │
  T1.5 fixtures + golden + 実行テスト        │
  T1.6 docs                                  │
                                             │
Phase 2: protoc-gen-dataloader(T0 + T1.1 後、Phase 1 後半と並行可)
  D1〜D6(別ドキュメント)                    │
                                             │
Phase 3: Federation(T1.3 + D3 後)           ▼
  T3.1 codegen-core federation 抽象(T0.2 + D2 後に開始可)
  T3.2 federation printers(T3.1 + T1.3 + D3)
  T3.3 fixtures + golden + _entities + composition(T3.2 + D5)
  T3.4 docs
```

**クリティカルパス**: T0.1 → T0.2 → T1.2 → T1.3 → T3.2 → T3.3。
**並行性**: T1.1 は T0.2 と独立に着手可(オプション非依存)。Phase 2 は T1.1 完了後いつでも。T3.1 は Phase 1 完了を待たない。

## 2. マイルストーン

| M | 内容 | リリース物 |
|---|---|---|
| **M1** | Phase 0 + Phase 1 完了 | protoc-gen-pothos minor(service→operation、experimental 明記)+ runtime パッケージ初版 + 本家オプションリリース |
| **M2** | Phase 2 完了 | protoc-gen-dataloader 初版 |
| **M3** | Phase 3 完了 | protoc-gen-pothos minor(federation)+ docs 一式 |

各マイルストーンで changesets を切る。M1 の時点で experimental として実ユーザー(自分)の proto で試用し、オプション semantics へのフィードバックを M2/M3 前に反映する。

---

## Phase 0: オプション基盤

### T0.1: proto-graphql 本家へのオプション追加

- **推奨モデル**: sonnet / **作業リポジトリ**: proto-graphql 本家(このリポジトリの submodule `proto-graphql/` で編集 → 本家へ PR)
- **依存**: なし
- **参照**: design.md §2(オプション全文ドラフト)、protoc-gen-dataloader/design.md §2
- **成果物**:
  - `proto/graphql/schema.proto` に追加: `GraphqlServiceOptions` / `GraphqlOperation` / `GraphqlRpcOptions`(`batch` / `federation` ネスト含む)/ `GraphqlFederationOptions`(`GraphqlObjectTypeOptions` に field 5)/ `GraphqlSchemaOptions` の suffix 変換 2 フィールド。**全て EXPERIMENTAL コメント付き**
  - **spike(タスク内最初に実施)**: `bool extends = 2;` というフィールド名が protoc / buf で合法か検証。NG なら `external` に変更し design.md へフィードバック
  - Go binding(`go/graphqlpb`)の再生成、本家 README / docs の annotations 一覧更新
- **受け入れ基準**: 本家リポジトリで `buf build` / `buf lint` 成功、Go binding が再生成されている、既存オプションの field number に変更がない
- **注意**: field number は 2056 慣例。既存フィールドの変更・削除は禁止

### T0.2: submodule 更新 + extension binding + オプション getter

- **推奨モデル**: sonnet
- **依存**: T0.1
- **参照**: research.md §1.3、`codegen-core/src/types/util.ts` の既存 getter 群
- **成果物**:
  - submodule bump、`pnpm gen:extensions` で `codegen-core/src/__generated__/extensions/` 再生成
  - `getServiceOptions(DescService)` / `getRpcOptions(DescMethod)` を util.ts に追加(frozen `EMPTY_*_OPTIONS` シングルトンパターン、既存 getter と同形)+ 単体テスト
- **受け入れ基準**: `pnpm build && pnpm test && pnpm lint` 成功、既存 golden スナップショット変更ゼロ

---

## Phase 1: Step 1(RPC → Query/Mutation)

### T1.1: runtime パッケージ新設

- **推奨モデル**: sonnet
- **依存**: なし(並行可)
- **参照**: design.md §3.3(context 規約・API)、§3.1(エラー変換)
- **成果物**: `packages/@proto-graphql/connect-runtime/`(名称は npm 空き確認の上確定。仮名のまま進め、公開前にリネーム可):
  - `ProtoGraphqlConnectContext` 型(transport / transports / callOptions / errorHandler)
  - `getClient(ctx, service)`(WeakMap + service typeName で memoize、per-service transport 上書き対応)
  - `callRpc(ctx, fn)`(callOptions 適用 + `ConnectError` → `GraphQLError` 変換。extensions.code = Code 名、details 非掲載、errorHandler で差し替え)
  - ESM+CJS dual export、単体テスト(memoize、transport 振り分け、エラー変換、errorHandler 差し替え)
- **受け入れ基準**: `pnpm build && pnpm test` 成功。依存: `@connectrpc/connect` / `@bufbuild/protobuf` / `graphql`(peer)。workspace catalog 管理に従う

### T1.2: codegen-core に operation 型抽象を追加

- **推奨モデル**: **opus**
- **依存**: T0.2
- **参照**: design.md §3.1(マッピング規則の全表)、requirements.md R1〜R5、research.md §1.4
- **成果物**:
  - `OperationField`(仮)抽象: 対象判定(service opt-in / ignore / streaming 警告・エラー / protobuf-es ガード)、operation 判定(明示 > idempotency 規約)、名前導出(camelCase + name)、引数モデル(Query flatten: request フィールド → 引数リスト(既存 nullability 規則適用)/ Mutation: 単一 input)、戻り値モデル(response 型 / expose_field 検証 / Empty 規則)
  - `collectTypesFromFile` と並ぶ `collectOperationsFromFile`(仮)エントリポイント
  - 単体テスト(判定マトリクス、エラー診断メッセージ)
- **受け入れ基準**: `pnpm build && pnpm test` 成功、既存 golden 変更ゼロ(この時点では printer 未接続)
- **注意**: 診断メッセージには対処方法(オプション記入例)を含めること

### T1.3: operation printer(queryField / mutationField + resolver)

- **推奨モデル**: **opus**(effort 高め)
- **依存**: T1.2 + T1.1
- **参照**: design.md §3.2(生成コードイメージ)、`protoc-gen-pothos/src/dslgen/printers/` の既存 printer 群
- **成果物**:
  - printer: `builder.queryField/mutationField` 出力、flatten 引数(`t.arg` 群、message 型は `FooInput$Ref` 参照 + `$toProto` 変換、oneof は optional 展開)、Mutation input(request 由来 Input 型 + `$toProto`)、`getClient`/`callRpc` 呼び出し、`create(RequestSchema, {...})` 組み立て、expose_field unwrap、`extensions.protobufMethod` メタデータ
  - 同一 `*.pb.pothos.ts` への append(printer dispatch への組み込み)
- **受け入れ基準**: `pnpm build && pnpm test` 成功。T1.5 の golden で出力が固定されるまでは手元 fixture での確認で可
- **注意**: import は `createImportSymbol` 経由(protoplugin が相対パス解決)。dprint 整形前提の `code` テンプレート規約に従う

### T1.4: Request/Response suffix 変換オプション

- **推奨モデル**: sonnet
- **依存**: T1.2(並行可: T1.3 と独立)
- **参照**: design.md §2(GraphqlSchemaOptions)、§3.1、research.md §1.2(`exceptRequestOrResponse`)
- **成果物**: `requests_as_inputs` / `responses_as_payloads`(正式名はこのタスクで確定し design.md に反映): 対象 message の suffix 変換(`XxxRequest` → `XxxInput` は Input のみ生成、`XxxResponse` → `XxxPayload` は Object のみ生成)、`ignore_requests`/`ignore_responses` との併用時は ignore が優先(併用は警告)。単体テスト + 命名衝突検証(変換後の名前が既存型と衝突したらエラー)
- **受け入れ基準**: `pnpm build && pnpm test` 成功、既存 golden 変更ゼロ(オプション未使用時)

### T1.5: Step 1 fixtures + golden + 実行テスト

- **推奨モデル**: sonnet
- **依存**: T1.3 + T1.4
- **参照**: design.md §5、testing-strategy.md、research.md §1.5(golden の構造と「schema.ts が生成物を import していない」注意点)
- **成果物**:
  - testapis 追加(`testapis/service/` 配下に: 基本 CRUD(全マッピング規則)/ idempotency 判定 / rename / expose_field / Empty / streaming 混在 / suffix 変換)+ FileDescriptorSet 再生成
  - golden ケース(protobuf-es のみ): 生成コード snapshot、型チェック、SDL snapshot(builder が生成物を side-effect import する schema.ts 構成)、**query.graphql 実行スナップショット**(`createRouterTransport` フェイクサーバを builder.ts / context で注入。Query / Mutation / エラー変換(NOT_FOUND → extensions.code)を最低 1 ケースずつ)
  - 非 protobuf-es ランタイム + service オプションのエラー系テスト
- **受け入れ基準**: `pnpm test` 成功(新規ケース含む)、既存ケースのスナップショット変更ゼロ

### T1.6: Step 1 docs

- **推奨モデル**: sonnet
- **依存**: T1.5
- **成果物**: `docs/protoc-gen-pothos/`(service→operation ガイド、builder/context セットアップ、configuration 追記)、`docs/proto-annotations/reference.md` 追記((graphql.service) / (graphql.rpc))、runtime パッケージ README。**experimental であることを明記**
- **受け入れ基準**: リンク切れなし、`pnpm lint` 成功

---

## Phase 2: protoc-gen-dataloader

タスク D1〜D6 は [../protoc-gen-dataloader/implementation-plan.md](../protoc-gen-dataloader/implementation-plan.md) を参照。前提は T0.x + T1.1。Phase 1 の T1.2 以降と並行可。

---

## Phase 3: Federation(Step 2)

### T3.1: codegen-core に federation 抽象を追加

- **推奨モデル**: **opus**
- **依存**: T0.2 + D2(BatchSpec)
- **参照**: federation-design.md §2〜§3(生成規則と F1〜F10)、§7(コード配置)
- **成果物**:
  - `FederationSpec`(仮): 全ファイル走査 index(entity ↔ entity_resolver RPC の突合、extend → 対象型の解決)、F1〜F10 検証(診断メッセージに対処方法を含む。F10 = required な非キーフィールドの拒否)、key fieldset → GraphQL 名 selection への変換、キー型導出(BatchSpec と整合検証)
  - 単体テスト(F1〜F10 各ケース + 正常系)
- **受け入れ基準**: `pnpm build && pnpm test` 成功、既存 golden 変更ゼロ

### T3.2: federation printers

- **推奨モデル**: **opus**(effort 高め)
- **依存**: T3.1 + T1.3 + D3(loader export 契約)
- **参照**: federation-design.md §2(asEntity / externalRef / objectField の生成規則と分岐表)、§8(検証済み API 事実)
- **成果物**:
  - asEntity printer(entity_resolver RPC のファイルに出力、selection 生成、representation → proto 値の逆変換、loader import)
  - externalRef printer(extends スタブ: objectType printer の分岐、externalFields としてキー出力、Input 非生成)
  - extend フィールド printer(`builder.objectField`、group loader / entity loader / 直接呼び出しの 3 分岐、parent がスタブかローカルかのプロパティ参照差)
  - dataloader 出力位置パラメータ(protoc-plugin-helpers)
- **受け入れ基準**: `pnpm build && pnpm test` 成功
- **注意**: 生成コードが依存してよい Pothos API は federation-design.md §5 の表に限定

### T3.3: federation fixtures + golden + 実行 + composition テスト

- **推奨モデル**: sonnet
- **依存**: T3.2 + D5(dataloader golden 基盤)
- **参照**: federation-design.md §6(fixtures 表と検証レイヤ)
- **成果物**:
  - `testapis/federation/{entity, extend_local, extend_external, errors}` + golden ケース(コード snapshot / 型チェック / **printSubgraphSchema による SDL snapshot** / F エラー診断 snapshot)
  - 実行テスト: `_entities` 実行(バッチ合流の呼び出し回数、欠損 null)、extend フィールドの group 解決、`_service { sdl }`
  - composition テスト: `composeServices`(entity は単独、extend_external は所有側 SDL fixture との 2 subgraph)で errors なし
  - golden ハーネスへの subgraph モード追加(printSubgraphSchema 差し替え)
- **受け入れ基準**: `pnpm test` 成功、既存ケース変更ゼロ

### T3.4: federation docs

- **推奨モデル**: sonnet
- **依存**: T3.3
- **成果物**: federation ガイド(builder セットアップ(plugins 順 / graphql@16 固定 / toSubGraphSchema)、@key・entity_resolver・extend の書き方、dataloader との併用、router との接続例)、annotations reference 追記
- **受け入れ基準**: リンク切れなし、`pnpm lint` 成功

---

## リスクと対応

| リスク | 対応 |
|---|---|
| オプション semantics が PoC 中に変わる | 本家で experimental 明記(T0.1)。M1 で実プロジェクト試用し M2/M3 前に反映 |
| `extends` フィールド名が protoc で使えない | T0.1 冒頭の spike で検証。NG 時は `external` へ(design.md 更新) |
| Pothos / Apollo のバージョン変動 | federation-design.md §5 の検証済み範囲に依存 API を限定し、golden + composition テストで検知 |
| golden ハーネス汎用化(D4)が既存テストを壊す | 受け入れ基準に「既存スナップショット変更ゼロ」を明記(純リファクタ強制) |
| subagent 生成コードの規約逸脱・設計乖離 | 依頼票に設計ドキュメント必読指定 + メインセッションの code-review ゲート + `pnpm lint`/typecheck |
| graphql 17 系との非互換(Apollo peer 制約) | docs に graphql@16 固定を明記(T1.6 / T3.4)。将来 Apollo 側の 17 対応を追従 |
