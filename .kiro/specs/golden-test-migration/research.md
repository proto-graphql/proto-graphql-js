# Research & Design Decisions

---
**Purpose**: Capture discovery findings, architectural investigations, and rationale that inform the technical design.
---

## Summary
- **Feature**: golden-test-migration
- **Discovery Scope**: Extension
- **Key Findings**:
  - 既存の e2e テストは `e2e/tests.json` と `e2e/tests/pothos--*` に分散し、buf CLI と tsc を組み合わせた実行に依存している。
  - `@proto-graphql/testapis-proto` の `buildCodeGeneratorRequest` が FileDescriptorSet から CodeGeneratorRequest を構築する既存経路を提供している。
  - `packages/protoc-gen-pothos` の vitest 設定は最小構成であり、Golden Test を同一テストスイートに統合できる。

## Research Log

### 既存テスト構成の把握
- **Context**: Requirement 6 の移行範囲を明確化するため。
- **Sources Consulted**: `e2e/tests.json`, `e2e/tests/**`, `e2e/vitest.config.ts`
- **Findings**:
  - 43 件の test ケースが `tests.json` に定義され、各ケースが `pothos--{package}--{runtime}` 形式で配置されている。
  - GraphQL スキーマは `__generated__/schema.test.ts` で `toMatchFileSnapshot` を利用している。
  - tsconfig は `@proto-graphql/tsconfig/tsconfig.e2e.json` を継承している。
- **Implications**: Golden Test は directory discovery と `tsconfig` 継承を維持しつつ、buf CLI 依存を除去する設計が必要。

### コード生成経路の確認
- **Context**: Requirement 2.1 の buf 非依存生成を満たすため。
- **Sources Consulted**: `devPackages/testapis-proto/src/index.ts`, `packages/protoc-gen-pothos/src/plugin.test.ts`
- **Findings**:
  - `buildCodeGeneratorRequest` は FileDescriptorSet を `testapisPackages` から解決し、対象 `proto` のみ `fileToGenerate` に追加する。
  - `protocGenPothos.run()` は既存テストで利用され、生成結果は `CodeGeneratorResponse` 形式で得られる。
- **Implications**: Golden Test は同じ API を利用することで、現行のコード生成ルートと整合する。

### 依存関係とツール互換性
- **Context**: 新規依存の追加有無と互換性を確認するため。
- **Sources Consulted**: `package.json`, `packages/protoc-gen-pothos/package.json`
- **Findings**:
  - `vitest`, `typescript`, `tsx` は既に devDependencies に存在する。
  - 追加の外部依存は不要で、既存ツールの組み合わせで要件を満たせる。
- **Implications**: WebSearch は新規依存確認の観点では不要。設計上は既存依存の活用を明示する。

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Modular Test Infrastructure | Discovery/Generation/TypeCheck/Snapshot を分離 | 変更影響が局所化し、テスト拡張が容易 | 連携インターフェースが増える | 既存設計方針と整合 |
| Monolithic Test Runner | 1 ファイルで完結するテスト | 実装は最短 | 規模拡大時の保守性低下 | 既存要件の拡張性に不向き |

## Design Decisions

### Decision: テストケース発見はディレクトリベースで統一
- **Context**: Requirement 1.3 の自動検出を満たすため。
- **Alternatives Considered**:
  1. `tests.json` の継続利用
  2. ディレクトリ探索での自動検出
- **Selected Approach**: `tests/golden/` 直下のディレクトリを探索する。
- **Rationale**: テスト追加時のメンテナンスコストを下げ、vitest 実行時に自動的に検出できる。
- **Trade-offs**: ディレクトリ名規約に依存するため、命名ミスの検出が必要。
- **Follow-up**: ディレクトリ名検証とエラーメッセージの整備。

### Decision: GraphQL スキーマ検証は独立実行でキャッシュ影響を排除
- **Context**: Requirement 4.1 の安定したスナップショット比較を行うため。
- **Alternatives Considered**:
  1. vitest で動的 import を直接実行
  2. 独立サブプロセスでスキーマ生成を実行
- **Selected Approach**: サブプロセスで schema.ts を実行し、SDL を取得する。
- **Rationale**: モジュールキャッシュの影響を排除し、ケース間の独立性を保証する。
- **Trade-offs**: プロセス起動コストが増える。
- **Follow-up**: 実行時間の観測と並列実行の影響評価。

### Decision: 型チェックはケースごとの tsconfig を継承
- **Context**: Requirement 3.1, 3.5 を満たすため。
- **Alternatives Considered**:
  1. 共通 tsconfig のみ使用
  2. 共通 + ケース別 tsconfig の二段構成
- **Selected Approach**: `golden/tsconfig.base.json` を共通化し、各ケースで `extends` を利用する。
- **Rationale**: 依存解決と include 対象を統一しつつ、ケース固有の調整を可能にする。
- **Trade-offs**: 設定ファイルが増える。
- **Follow-up**: include 対象と生成物配置の一貫性を設計で固定化。

## Risks & Mitigations
- モジュールキャッシュによるスキーマ混線 — 独立サブプロセス実行で隔離
- ディレクトリ命名ミス — 検証ルールとエラー出力を追加
- 型解決の不安定化 — `tsconfig.base.json` で paths と moduleResolution を固定

---

## gqlkit Golden Test 実装の詳細調査

### 概要

[gqlkit/golden.test.ts](https://github.com/izumin5210/gqlkit/blob/%40gqlkit-ts/cli%400.2.0/packages/cli/src/gen-orchestrator/golden.test.ts) は、コード生成の検証に Golden File Testing パターンを採用した参照実装。

### テストケース発見 (Test Case Discovery)

```typescript
const entries = await readdir(testdataDir, { withFileTypes: true });
const caseNames = entries
  .filter((e) => e.isDirectory() && !e.name.startsWith("_"))
  .map((e) => e.name)
  .sort();
```

**特徴**:
- `testdata/` ディレクトリ配下のサブディレクトリを走査
- `_` プレフィックスのディレクトリは除外 (無効化されたテストケース)
- アルファベット順にソートして決定的な順序を保証

### ディレクトリ構造

```
testdata/
├── basic-object-type/
│   ├── src/gqlkit/schema/        # ソースファイル
│   ├── tsconfig.json             # 型チェック設定
│   └── config.json               # テスト設定 (optional)
├── scalar-mapping/
│   └── ...
└── _disabled-test/               # 除外されるテストケース
```

### tsconfig.json 設計パターン

各テストケースの `tsconfig.json`:
```json
{ "extends": "../tsconfig.base.json" }
```

共通の `tsconfig.base.json`:
```json
{
  "extends": "../../../../../tsconfig.base.json",
  "compilerOptions": {
    "noEmit": true,
    "preserveSymlinks": true,
    "esModuleInterop": true
  }
}
```

**ポイント**:
- 各テストケースは最小限の設定で共通設定を継承
- `noEmit: true` で型チェックのみ実行
- `preserveSymlinks: true` で monorepo のシンボリックリンクを正しく解決

### config.json スキーマ

```typescript
interface TestConfig {
  scalars?: Array<{
    name: string;
    tsType: { name: string; from?: string };
    only?: "input" | "output";
    description?: string;
  }>;
  sourceDir?: string;            // デフォルト: "src/gqlkit/schema"
  sourceIgnoreGlobs?: string[];  // 除外パターン
}
```

### コード生成実行

```typescript
const result = await executeGeneration({
  workingDir: caseDir,
  sourceDir: config?.sourceDir ?? "src/gqlkit/schema",
  sourceIgnoreGlobs: config?.sourceIgnoreGlobs,
  outputResolversPath: join(caseDir, "src/gqlkit/resolvers.ts"),
  outputTypeDefsPath: join(caseDir, "src/gqlkit/typeDefs.ts"),
  outputSchemaPath: join(caseDir, "src/gqlkit/schema.graphql"),
  customScalars,
  tsconfigPath: join(caseDir, "tsconfig.json"),
});
```

**特徴**:
- 各テストケースディレクトリを working directory として実行
- 出力パスは固定パターン
- tsconfig.json パスを明示的に渡す

### スナップショット検証パターン

```typescript
// 診断結果のスナップショット
await expect(serializeDiagnostics(result.diagnostics)).toMatchFileSnapshot(
  join(expectedDir, "diagnostics.txt")
);

// 生成ファイルのスナップショット
if (result.success) {
  await expect(typeDefs.content).toMatchFileSnapshot(
    join(expectedDir, "typeDefs.ts")
  );
  await expect(printSchema(schema)).toMatchFileSnapshot(
    join(expectedDir, "schema.graphql")
  );
}
```

**`toMatchFileSnapshot` の特徴**:
- `await` が必要 (非同期ファイル操作)
- vitest の `-u` フラグで更新可能
- 任意のファイル拡張子をサポート

### 診断結果のシリアライズ

```typescript
function serializeDiagnostics(diagnostics: Diagnostic[]): string {
  return diagnostics
    .map((d) => {
      const location = d.file
        ? `${d.file.replace(/\\/g, "/")}:${d.line}:${d.character}`
        : "<no-location>";
      return `${location}: ${d.category} ${d.code}: ${d.message}`;
    })
    .join("\n");
}
```

**ポイント**:
- パス区切りを `/` に正規化 (クロスプラットフォーム対応)
- location、category、code、message を含む構造化フォーマット

### ヘルパー関数

```typescript
// ファイル存在チェック
async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

// 更新モードでのファイル削除
async function assertFileNotExists(path: string): Promise<void> {
  if (process.env.UPDATE_GOLDEN === "true") {
    await unlink(path).catch(() => {});
    return;
  }
  expect(await fileExists(path)).toBe(false);
}

// JSON 安全読み込み
async function readJsonIfExists<T>(path: string): Promise<T | null> {
  try {
    const content = await readFile(path, "utf-8");
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}
```

### 型チェックについて

**重要**: gqlkit の golden.test.ts は**明示的な TypeScript 型チェックを実装していない**。

- `executeGeneration` 内部で TypeScript コンパイラを使用しているが、それはコード生成のためであり、生成コードの型検証ではない
- 生成コードの型安全性は、TypeScript の通常のビルドプロセスに委ねている

**proto-graphql での対応**:
- TypeScript Compiler API (`ts.createProgram`, `ts.getPreEmitDiagnostics`) を使用した明示的な型チェックが必要
- これは gqlkit にはなかった新規実装

### テストケース数

gqlkit の testdata には **105 件** のテストケースが存在:
- abstract-resolver-* (10件)
- auto-object-* (6件)
- default-value-* (4件)
- directive-* (9件)
- enum (string/numeric/inline) 系 (20件以上)
- export-declaration-* (8件)
- interface-* (7件)
- scalar-* (12件)
- type-alias-* (7件)
- その他 (union, oneof, field-resolver など)

---

## proto-graphql への適用方針

### gqlkit からの採用ポイント

| gqlkit の実装 | proto-graphql での採用 |
|--------------|----------------------|
| ディレクトリベースのテストケース発見 | ✅ そのまま採用 |
| `_` プレフィックスでの除外 | ✅ そのまま採用 |
| tsconfig.json の継承構造 | ✅ そのまま採用 |
| config.json によるケース設定 | ✅ 採用（スキーマは調整） |
| `toMatchFileSnapshot` の使用 | ✅ そのまま採用 |
| `serializeDiagnostics` パターン | ✅ 型チェック結果に適用 |
| `UPDATE_GOLDEN` 環境変数 | ❌ vitest `-u` フラグで代用 |

### gqlkit にない追加実装

| 機能 | 実装方針 |
|------|---------|
| TypeScript 型チェック | `ts.createProgram` + `ts.getPreEmitDiagnostics` |
| GraphQL スキーマ検証 | tsx サブプロセスで独立実行 |
| buf CLI 非依存コード生成 | `buildCodeGeneratorRequest` + `protocGenPothos.run()` |

---

## tsx 代替案の調査

### 問題: モジュールキャッシュの隔離

GraphQL スキーマ検証において、各テストケースの `schema.ts` を動的にインポートする必要がある。
しかし、Node.js/vitest のモジュールキャッシュが残り、テストケース間で干渉する可能性がある。

### 調査した選択肢

#### 1. tsx (採用)

[tsx](https://github.com/privatenumber/tsx) は TypeScript を直接実行できる Node.js ランタイム。

**メリット**:
- シンプルで高速
- 広く使われている（npm weekly downloads: 5M+）
- TypeScript を直接実行可能
- ESM/CJS 両対応

**デメリット**:
- 追加依存

#### 2. vite-node (不採用)

[vite-node](https://www.npmjs.com/package/vite-node) は Vite をバックエンドとして TypeScript を実行。

**メリット**:
- vitest と同じエコシステム
- Vite の設定を再利用可能

**デメリット**:
- 公式は「Vite Environment Module Runner への移行」を推奨
- vitest がすでに内部で使用しているため、外部からの使用は非推奨

#### 3. vi.resetModules() (不採用)

[vitest の vi.resetModules()](https://vitest.dev/api/vi.html#vi-resetmodules) でモジュールキャッシュをリセット。

**メリット**:
- 追加依存なし
- vitest 内で完結

**デメリット**:
- 完全な隔離を保証しない
- トップレベル import は再評価できない
- 参照: 「Top-level imports cannot be re-evaluated.」

#### 4. Node ESM loader (不採用)

Node.js の `--experimental-loader` を使用してカスタムローダーを設定。

**メリット**:
- Node.js 標準機能
- 追加依存なし

**デメリット**:
- 設定が複雑
- TypeScript を直接実行できない（事前コンパイルが必要）
- experimental フラグが必要

### 結論

**tsx を採用**。シンプルで確実、かつ広く使われているため、メンテナンス性も高い。

**参考リンク**:
- [Vitest Config - isolate](https://vitest.dev/config/#isolate)
- [Vitest vi.resetModules](https://vitest.dev/api/vi.html#vi-resetmodules)
- [vite-node npm](https://www.npmjs.com/package/vite-node)

---

## References
- [gqlkit golden.test.ts](https://github.com/izumin5210/gqlkit/blob/%40gqlkit-ts/cli%400.2.0/packages/cli/src/gen-orchestrator/golden.test.ts)
- [gqlkit testdata ディレクトリ](https://github.com/izumin5210/gqlkit/tree/%40gqlkit-ts/cli%400.2.0/packages/cli/src/gen-orchestrator/testdata)
- [Vitest toMatchFileSnapshot](https://vitest.dev/guide/snapshot#file-snapshots)
- [TypeScript Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)
- [tsx - TypeScript Execute](https://github.com/privatenumber/tsx)
- `e2e/tests.json`
- `devPackages/testapis-proto/src/index.ts`
- `packages/protoc-gen-pothos/src/plugin.test.ts`
- `packages/protoc-gen-pothos/vitest.config.ts`
