# Implementation Plan: protoc-gen-dataloader

> 設計: [design.md](./design.md) / 全体計画: [../grpc-service-to-graphql/implementation-plan.md](../grpc-service-to-graphql/implementation-plan.md)

実装は opus / sonnet の subagent に依頼する前提のタスク分解。各タスクは独立した依頼票として使える粒度にしてある。

## 外部依存(このトラックの前提)

| 前提 | 供給元 |
|---|---|
| `(graphql.rpc).batch` オプションの TS binding(`gen:extensions` 済み) | 全体計画 Phase 0(本家オプション追加) |
| runtime パッケージの骨格(context 規約・`getClient`・`callRpc`) | 全体計画 Phase 1 / T1.1 |
| golden ハーネス | 既存(protoc-gen-pothos 内)。D4 で汎用化 |

Phase 0 と T1.1 が完了していれば、**このトラック全体は grpc-service-to-graphql の Step 1 実装(printer 等)や federation と並行して進められる**。

## タスク依存グラフ

```
(Phase 0, T1.1 完了)
   ├── D1: runtime createRpcLoader ──────────┐
   ├── D2: codegen-core BatchSpec 抽象 ──────┤
   └── D4: golden ハーネス汎用化 ─────┐      │
                                      │      ▼
                                      │   D3: プラグイン本体(printer)
                                      │      │
                                      └──────┴─▶ D5: fixtures + golden + 実行テスト
                                                    │
                                                    ▼
                                                 D6: docs + 命名確定
```

D1 / D2 / D4 は相互に独立(並行可)。

---

## D1: runtime `createRpcLoader` の実装

- **推奨モデル**: sonnet(仕様確定済みのロジック実装)
- **依存**: T1.1(runtime パッケージ骨格)
- **参照**: design.md §4.3(実装仕様 1〜5)、§4.4(キー型)、§4.5(loader パラメータ)、§8-1(テスト観点)
- **変更対象**: runtime パッケージ(`packages/@proto-graphql/connect-runtime/`(仮)) `src/rpcLoader.ts` + テスト
- **成果物**:
  - `createRpcLoader`(entity / group のオーバーロード、**二段 per-context キャッシュ(ctx → paramsKey → DataLoader)**、paramsKey 算出(`toBinary(create(requestSchema, params ?? {}))`)、キーマッチ照合、maxBatchSize 透過)
  - 単体テスト: 順序シャッフル / 欠損(null・`[]`)/ 重複キー / 余剰 entity / エラー全キー伝搬 / maxBatchSize 分割 / ctx 毎のキャッシュ分離 / 同一 ctx 内バッチ合流 / bigint キー / **params(同一 params 合流・異なる params 分離・`undefined` ≡ `{}`・bigint 含む params)**
- **受け入れ基準**: `pnpm build` 成功、追加テストがパス、`dataloader` を dependencies に追加(catalog 管理に従う)
- **実装ヒント**: DataLoader の batch 関数は Error インスタンスを返り値配列に混ぜられるが、本実装は「バッチ全体 throw = 全キー reject」で十分(per-key Error は使わない)。`extractEntities` の型は `call` の戻り型と generics で結合すること

## D2: codegen-core への BatchSpec 抽象の追加

- **推奨モデル**: opus(既存の型抽象・診断メッセージ設計との整合判断が必要)
- **依存**: Phase 0(オプション binding)
- **参照**: design.md §2(オプション)、§3(V1〜V9 と推論・エラー UX)、§4.4(キー型)、§4.5(loader パラメータ)、§6(検証の分担)
- **変更対象**: `packages/@proto-graphql/codegen-core/src/types/`(新規 `BatchSpec.ts` 等)+ `types/util.ts`(`getRpcOptions` は Phase 0 で追加済み想定)
- **成果物**:
  - `DescMethod` → `BatchSpec | BatchSpecError` を返す resolver(key_field / entity_field / entity_key の解決、推論、V1〜V9 検証、@key フォールバック(単一フィールドのみ)、キー TS 型の導出、**非キーフィールドの列挙と required 判定(`isRequiredField` の input セマンティクス再利用)= params モデル**)
  - エラーは「候補フィールドの列挙 + 明示オプションの記入例」を含む診断文字列を持つこと(snapshot テスト)
  - 単体テスト(推論成功 / 各エラーケース)
- **受け入れ基準**: `pnpm build && pnpm test` 成功。protoc-gen-pothos 側から import 可能な公開 API(`codegen-core` の index 経由)
- **実装ヒント**: 既存 `exceptRequestOrResponse`(`types/util.ts`)がサービス走査の参考。`EMPTY_*_OPTIONS` の frozen シングルトンパターンに従う

## D3: プラグイン本体(パッケージ雛形 + printer)

- **推奨モデル**: sonnet(protoc-gen-pothos の既存構造の移植)
- **依存**: D2(BatchSpec)。D1 は型参照のみ(並行末尾で合流可)
- **参照**: design.md §4.1〜4.2(ファイルレイアウト・生成コード)、§5(パラメータ)
- **変更対象**: `packages/protoc-gen-dataloader/`(新規パッケージ)
- **成果物**:
  - `createEcmaScriptPlugin` ベースのプラグイン(protoc-gen-pothos の `plugin.ts` / `printer.ts` 構造を踏襲、`@proto-graphql/protoc-plugin-helpers` にパラメータパーサを追加: `filename_suffix` / `runtime_module` 等)
  - printer: batch 宣言のある RPC 毎に `createRpcLoader` 呼び出しを生成(`code` タグ付きテンプレート + `createImportSymbol`)。**非キーフィールドがある場合は `<RpcName>LoaderParams` 型(`Omit<MessageInitShape<...>, keyField>`)を export し、required 有無で params 引数の必須/任意を切り替える**(design.md §4.5)。BatchSpecError は `CodeGeneratorResponse.error` として報告
  - ESM+CJS dual export、bin 定義、既存パッケージと同じ build 設定
- **受け入れ基準**: `pnpm build` 成功。手元確認: testapis の batch 付き proto(D5 で追加。先行する場合は仮 fixture)に対して意図した TS を出力
- **実装ヒント**: 出力ファイル名は `filenameFromProtoFile`(codegen-core `printer/util.ts`)の suffix 差し替えで実現。import_prefix の解決は `protoImportPath` 相当を再利用

## D4: golden ハーネスの汎用化

- **推奨モデル**: opus(既存テスト資産のリファクタリング判断)
- **依存**: なし(独立。ただし D5 より先)
- **参照**: research.md §1.5(現行 golden の構造)、`packages/protoc-gen-pothos/src/__tests__/golden/_helpers/`
- **成果物**: golden ハーネス(`codeGenerationRunner` / `fileWriter` / `snapshotValidator` / `typeScriptChecker` / `testCaseDiscovery`)を「プラグイン差し替え可能」にする。方式は次のいずれかを調査の上選択し、決定理由を PR 説明に残す:
  1. `devPackages/golden-test-harness` への抽出(将来の protoc-gen-gqlkit にも有効)
  2. protoc-gen-pothos 内のまま plugin 注入引数を追加し、protoc-gen-dataloader からは dev 依存で利用
- **受け入れ基準**: 既存 golden テストが**スナップショット変更ゼロ**でパスし続けること(純リファクタ)。`pnpm test` 成功
- **注意**: 挙動変更・スナップショット更新を伴う変更は行わない。ハーネスの公開 API は最小限に

## D5: fixtures + golden ケース + 実行テスト

- **推奨モデル**: sonnet
- **依存**: D1 + D3 + D4
- **参照**: design.md §8(テスト 2〜3)、[testing-strategy](../../development/testing-strategy.md)
- **成果物**:
  - `devPackages/testapis-proto` に dataloader 用 proto 追加(例: `testapis/dataloader/`: entity 推論成功 / 明示指定 / group / max_batch_size / **非キーフィールドあり(optional のみ・required あり)** / エラー系数種)+ `gen:testapis` 系設定更新 + FileDescriptorSet 再生成
  - golden ケース(生成コード snapshot + 型チェック + 診断エラー snapshot)
  - 実行テスト: `createRouterTransport` フェイクサーバで (a) バッチ合流(RPC 呼び出し回数)、(b) シャッフル/欠損/重複照合、(c) エラー伝搬、(d) group の groupBy を検証
- **受け入れ基準**: `pnpm test` 成功(新規ケース含む)。実行テストがフェイクサーバの呼び出し回数をアサートしていること
- **実装ヒント**: 実行テストの配置は golden ケース内 `query-result` 経路ではなく、protoc-gen-dataloader パッケージの vitest として生成物を import する形でよい(GraphQL を介さないため)

## D6: ドキュメント + 命名確定

- **推奨モデル**: sonnet
- **依存**: D3 / D5
- **成果物**:
  - `docs/protoc-gen-dataloader/`(利用者向け: getting-started、buf 設定、オプションリファレンス、生成コードリファレンス)
  - `docs/proto-annotations/reference.md` に `(graphql.rpc).batch` 追記
  - npm パッケージ名の空き確認(`@proto-graphql/protoc-gen-dataloader` + bin `protoc-gen-dataloader` を第一候補として検証)と package.json への反映。buf plugin(BSR)公開の要否メモ
- **受け入れ基準**: docs のリンク切れなし、`pnpm lint` 成功

---

## 進め方の共通規約(全タスク)

- タスク毎に feature ブランチ + worktree で分離し、Conventional Commits(`feat(protoc-gen-dataloader): ...` 等)で小さくコミット
- 受け入れ基準のコマンドは subagent 自身が実行して結果を報告する(`pnpm build` / `pnpm test` / `pnpm lint`)
- golden snapshot の更新(`vitest -u`)は「意図した出力変更」の場合のみ。意図しない差分が出たら停止して報告
- 各タスク完了後、メインセッションで code-review(正しさ + 既存規約との整合)を実施してからマージ
