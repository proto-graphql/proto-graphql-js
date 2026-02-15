# Requirements Document

## Project Description (Input)
現在、生成コードの型チェックや graphql schema の snapshot test を e2e testとして実装してるが、 これを https://github.com/izumin5210/gqlkit の golden.test.ts のような形式に変更したい。
https://github.com/izumin5210/gqlkit/blob/%40gqlkit-ts/cli%400.2.0/packages/cli/src/gen-orchestrator/golden.test.ts

- protoc-gen-pothos パッケージ内の特定ディレクトリのテストケースディレクトリを並べる
- それぞれに対して protoc-gen-pothos によるコード生成を実行し、生成コード (`*.pb.pothos.ts`) を toMatchFileSnapshot でテストする
- また、その生成コードを使った pothos のコード（現在の e2e test 中の builder.ts, schema.ts に相当）と tsconfig.json も各ケースに配置し、それに対してテストコード上から型チェックを実行する

snapshot test と e2e test で責務が重複しているのが解消できるほか、package 内の通常のテスト(vitest)上でコード生成のテストをすることでテストカバレッジを正確に測れるようにするのも目的。
protoc-gen-pothos を利用したコード生成については testapis の file descriptor set から CodeGeneratorRequest を作成して渡すことで buf を経由せずとも実現可能なはず

現在の e2e test および snapshot test は破棄し、上記のようなテストを設計・実装してください

## Requirements

### Requirement 1: Golden Test インフラストラクチャ
**Objective:** 開発者として、protoc-gen-pothos パッケージ内に Golden Test 形式のテストケースディレクトリ構造を持ちたい。これにより、テストケースの管理が容易になり、コード生成のテストカバレッジを正確に測定できるようになる。

#### Acceptance Criteria
1. The Golden Test shall テストケースディレクトリを `tests/golden/` 配下に配置する
2. The Golden Test shall `golden/<runtime-variant>/<proto-package>/` の2階層構造を使用する。runtime-variant はランタイム種別とパラメータバリエーションを含み、proto-package は proto package 全体をそのままディレクトリ名として使用する（例: `golden/ts-proto/testapis.enums/`, `golden/ts-proto-forcelong/testapis.primitives/`, `golden/protobuf-es/testapis.primitives/`）
3. When テストケースディレクトリが追加された場合, the Golden Test shall 自動的にそのディレクトリを検出してテスト対象に含める
4. The Golden Test shall テストケースディレクトリ内に期待される生成コード（`__expected__/*.pb.pothos.ts`）を配置する
5. The Golden Test shall テストケースディレクトリ内に Pothos スキーマ定義ファイル（`builder.ts`, `schema.ts`）を配置する
6. The Golden Test shall テストケースディレクトリ内に TypeScript 型チェック用の `tsconfig.json` を配置する

### Requirement 2: コード生成テスト
**Objective:** 開発者として、protoc-gen-pothos によるコード生成結果をスナップショットテストしたい。これにより、コード生成ロジックの変更による意図しない出力変更を検出できるようになる。

#### Acceptance Criteria
1. The Golden Test shall testapis-proto パッケージの FileDescriptorSet から CodeGeneratorRequest を構築し、buf CLI を経由せずにコード生成を実行する
2. When コード生成が実行された場合, the Golden Test shall 生成された `*.pb.pothos.ts` ファイルを `toMatchFileSnapshot` でテストする
3. The Golden Test shall 各 protobuf ランタイム（ts-proto, protobuf-es-v1, protobuf-es）に対応したテストケースを提供する
4. The Golden Test shall プラグインオプション（import_prefix, partial_inputs, scalar など）のバリエーションに対応したテストケースを提供する
5. If 生成コードが期待値と異なる場合, the Golden Test shall 差分を明確に表示してテストを失敗させる
6. The Golden Test shall vitest の `--update` (`-u`) フラグによるスナップショット更新機能を使用して期待値ファイルを更新する（独自の `UPDATE_GOLDEN` 環境変数は使用しない）

### Requirement 3: 型チェック検証
**Objective:** 開発者として、生成コードと Pothos スキーマ定義の型安全性をテストコード内から検証したい。これにより、生成コードが正しい TypeScript 型を生成していることを保証できる。

#### Acceptance Criteria
1. The Golden Test shall 各テストケースの `tsconfig.json` を使用してプログラム的に TypeScript 型チェックを実行する
2. When 型チェックが実行された場合, the Golden Test shall `builder.ts` と `schema.ts` が型エラーなくコンパイルできることを検証する
3. If 型エラーが検出された場合, the Golden Test shall エラー内容を明確に表示してテストを失敗させる
4. The Golden Test shall 型チェック結果をスナップショットとして保存し、意図しない型変更を検出する（エラーがない場合は空のスナップショット）
5. While 型チェックを実行中, the Golden Test shall 生成コードと依存パッケージ（@bufbuild/protobuf, @pothos/core など）の型定義を正しく解決する

### Requirement 4: GraphQL スキーマ検証
**Objective:** 開発者として、生成されたPothosコードから構築されるGraphQLスキーマをスナップショットテストしたい。これにより、protobufからGraphQLへのマッピングが正しく機能していることを保証できる。

#### Acceptance Criteria
1. When schema.ts がビルドされた場合, the Golden Test shall 生成された GraphQL スキーマを SDL 形式でスナップショットテストする
2. The Golden Test shall `printSchema` を使用して GraphQL スキーマを文字列化し、`__expected__/schema.graphql` と比較する
3. If GraphQL スキーマが期待値と異なる場合, the Golden Test shall 差分を明確に表示してテストを失敗させる

### Requirement 5: テスト実行統合
**Objective:** 開発者として、Golden Test を既存の vitest テストインフラに統合したい。これにより、`pnpm test` で全てのテストを実行でき、テストカバレッジが正確に測定されるようになる。

#### Acceptance Criteria
1. The Golden Test shall protoc-gen-pothos パッケージの vitest 設定内で実行される
2. When `pnpm test` が実行された場合, the Golden Test shall 他のユニットテストと同時に実行される
3. The Golden Test shall テストカバレッジ測定ツールによってコード生成ロジックのカバレッジを正確に計測可能にする
4. The Golden Test shall テスト実行時間を最適化するため、並列実行をサポートする

### Requirement 6: 既存テストの移行と削除
**Objective:** 開発者として、既存の e2e テストとスナップショットテストを Golden Test に置き換え、重複を解消したい。これにより、テストの責務が明確になり、メンテナンスコストが削減される。

#### Acceptance Criteria
1. The Golden Test shall 既存の e2e テスト（`/e2e/tests/`）のすべてのテストケースをカバーする
2. When Golden Test の実装が完了した場合, the Migration shall `/e2e/` ディレクトリ内の Pothos 関連テストを削除する
3. The Migration shall 既存の `plugin.test.ts` のスナップショットテストを廃止し、全てのテストケースを Golden Test に統合する
4. The Migration shall `e2e/tests.json` の設定を不要にする
5. If 既存テストと Golden Test で検証内容に差異がある場合, the Migration shall 差異を明確にドキュメント化する
