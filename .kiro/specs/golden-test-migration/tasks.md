# Implementation Plan

## Task 1: Golden Test 基盤ディレクトリとプロジェクト設定の構築

- [x] 1.1 Golden Test ディレクトリ構造を作成する
  - protoc-gen-pothos パッケージ内に `src/__tests__/golden/` ディレクトリを作成
  - 共通 TypeScript 設定ファイル `tsconfig.base.json` を配置し、型チェック専用の設定を定義
  - runtime-variant ディレクトリ（`ts-proto/`, `ts-proto-forcelong/`, `protobuf-es-v1/`, `protobuf-es/`）を作成
  - `__generated__/` ディレクトリを `.gitignore` に追加
  - _Requirements: 1.1, 1.2_

- [x] 1.2 依存パッケージを protoc-gen-pothos に追加する
  - testapis パッケージ（testapis-ts-proto, testapis-protobuf-es, testapis-protobuf-es-v1）を devDependencies に追加
  - tsx を devDependencies に追加（GraphQL スキーマ検証用）
  - pnpm install を実行して依存関係を解決
  - _Requirements: 3.5_

## Task 2: テストケース発見機能の実装

- [x] 2.1 (P) TestCaseDiscovery モジュールを実装する
  - golden ディレクトリ配下の runtime-variant/package 2階層構造を走査してテストケースを検出
  - `_` プレフィックスのディレクトリを除外する機能を実装
  - ディレクトリ名から runtime-variant とベース runtime を抽出するマッピングロジックを実装
  - proto package 名をディレクトリ名からそのまま取得
  - TestCase 型（name, dir, config）を返却する関数を実装
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2.2 (P) TestCaseConfig 設定解決機能を実装する
  - runtime-variant からベース runtime（ts-proto, protobuf-es-v1, protobuf-es）を抽出
  - runtime-variant に応じた追加パラメータ（forceLong=number 等）を導出
  - オプショナルな config.json ファイルの読み込みとマージ処理を実装
  - 不正な runtime-variant に対するエラーハンドリングを実装
  - _Requirements: 2.3, 2.4_

## Task 3: コード生成実行機能の実装

- [x] 3.1 CodeGenerationRunner モジュールを実装する
  - testapis-proto の buildCodeGeneratorRequest を使用して CodeGeneratorRequest を構築
  - protocGenPothos.run() を呼び出してコード生成を実行
  - GeneratedFile 配列（name, content）を返却する処理を実装
  - buf CLI を使用せず、FileDescriptorSet ベースでコード生成を完結させる
  - _Requirements: 2.1, 2.3, 2.4_

- [x] 3.2 生成ファイル書き込み機能を実装する
  - 生成されたファイルを `__generated__/` ディレクトリに書き込む処理を実装
  - テスト実行前に `__generated__/` ディレクトリをクリーンアップする処理を実装
  - proto package のドット区切りをディレクトリ構造に変換（testapis.enums → testapis/enums/）
  - _Requirements: 1.4_

## Task 4: TypeScript 型チェック機能の実装

- [x] 4.1 TypeScriptChecker モジュールを実装する
  - 各テストケースの tsconfig.json を読み込む処理を実装
  - TypeScript Compiler API（ts.createProgram, ts.getPreEmitDiagnostics）を使用した型チェックを実装
  - builder.ts と schema.ts、生成コードを対象とした型検証を実行
  - _Requirements: 3.1, 3.2_

- [x] 4.2 型チェック結果のフォーマット機能を実装する
  - 診断結果をスナップショット比較可能な文字列形式に変換
  - パス区切りを正規化してクロスプラットフォーム対応
  - ファイルパス、行番号、列番号、エラーコード、メッセージを含む構造化フォーマットを実装
  - 型エラーがある場合はテスト失敗として扱う
  - _Requirements: 3.3, 3.4_

## Task 5: GraphQL スキーマ検証機能の実装

- [x] 5.1 GraphQL スキーマ取得用サブプロセス実行を実装する
  - tsx を使用した独立プロセスで schema.ts を実行する処理を実装
  - 一時スクリプトを生成して printSchema でスキーマ SDL を出力
  - execFile を使用してシェルインジェクションを防止
  - モジュールキャッシュの影響を排除するための隔離を実現
  - _Requirements: 4.1, 4.2_

## Task 6: スナップショット検証機能の実装

- [x] 6.1 (P) 生成コードスナップショット検証を実装する
  - toMatchFileSnapshot を使用した生成ファイル比較を実装
  - `__generated__/` と `__expected__/` の対応するファイルを比較
  - 差分がある場合は vitest の差分表示機能で詳細を出力
  - vitest -u フラグによるスナップショット更新をサポート
  - _Requirements: 2.2, 2.5, 2.6_

- [x] 6.2 (P) 型エラーと GraphQL スキーマのスナップショット検証を実装する
  - 型チェック結果を `__expected__/type-errors.txt` と比較（通常は空）
  - GraphQL スキーマ SDL を `__expected__/schema.graphql` と比較
  - _Requirements: 3.4, 4.3_

## Task 7: 統合テストスイートの実装

- [x] 7.1 golden.test.ts メインテストファイルを実装する
  - TestCaseDiscovery で検出したテストケースを describe.each で展開
  - 各テストケースに対してコード生成、型チェック、スナップショット検証を実行
  - vitest の並列実行をサポートする構造で実装
  - _Requirements: 5.1, 5.2, 5.4_

- [x] 7.2 テストカバレッジ測定を有効化する
  - protoc-gen-pothos の vitest 設定でカバレッジ測定を有効化
  - Golden Test 経由でコード生成ロジックのカバレッジを計測可能にする
  - _Requirements: 5.3_

## Task 8: ts-proto テストケースの移行

- [x] 8.1 ts-proto 基本テストケースを作成する（前半）
  - testapis.enums, testapis.primitives, testapis.nested, testapis.oneof を移行
  - 各ケースに `__expected__/` ディレクトリと期待値ファイルを配置
  - builder.ts, schema.ts, tsconfig.json を e2e テストから移行
  - _Requirements: 6.1_

- [x] 8.2 ts-proto 基本テストケースを作成する（後半）
  - testapis.wktypes, testapis.extensions, testapis.field_behavior, testapis.deprecation を移行
  - testapis.proto3_optional, testapis.empty_types を移行
  - 注: testapis.multipkgs.subpkg2 は他パッケージへの依存があるため、現状では型エラーあり
  - _Requirements: 6.1_

- [x] 8.3 ts-proto edgecases テストケースを作成する
  - testapis.edgecases.import_from_same_pkg を移行
  - 注: testapis.edgecases.import_squashed_union.pkg2 は他パッケージへの依存があるため、現状では型エラーあり
  - _Requirements: 6.1_

- [x] 8.4 ts-proto-forcelong テストケースを作成する
  - testapis.primitives と testapis.wktypes の forceLong=number バリアントを作成
  - codeGenerationRunner で ts-proto-forcelong 用の Int スカラー設定を追加
  - _Requirements: 6.1, 2.4_

## Task 9: protobuf-es-v1 テストケースの移行

- [x] 9.1 (P) protobuf-es-v1 基本テストケースを作成する（前半）
  - testapis.enums, testapis.nested, testapis.oneof を移行
  - 注: testapis.primitives は Int64/Byte カスタムスカラー依存のため `_` プレフィックスで除外
  - 各ケースに `__expected__/` ディレクトリと期待値ファイルを配置
  - builder.ts, schema.ts, tsconfig.json を e2e テストから移行
  - _Requirements: 6.1_

- [x] 9.2 (P) protobuf-es-v1 基本テストケースを作成する（後半）
  - testapis.field_behavior, testapis.deprecation, testapis.proto3_optional, testapis.empty_types を移行
  - 注: testapis.wktypes, testapis.extensions は Int64/DateTime/Byte カスタムスカラー依存のため `_` プレフィックスで除外
  - 注: testapis.multipkgs は他パッケージへの依存があるため実装対象外
  - _Requirements: 6.1_

- [x] 9.3 (P) protobuf-es-v1 edgecases テストケースを作成する
  - testapis.edgecases.import_from_same_pkg を移行
  - testapis.edgecases.import_oneof_member_from_other_file を移行
  - 注: testapis.edgecases.import_squashed_union.pkg2 は他パッケージへの依存があるため `_` プレフィックスで除外
  - _Requirements: 6.1_

## Task 10: protobuf-es テストケースの移行

- [x] 10.1 (P) protobuf-es 基本テストケースを作成する（前半）
  - testapis.enums, testapis.nested, testapis.oneof を移行
  - 注: testapis.primitives は BigInt カスタムスカラー依存のため `_` プレフィックスで除外
  - 各ケースに `__expected__/` ディレクトリと期待値ファイルを配置
  - builder.ts, schema.ts, tsconfig.json を e2e テストから移行
  - _Requirements: 6.1_

- [x] 10.2 (P) protobuf-es 基本テストケースを作成する（後半）
  - testapis.field_behavior, testapis.deprecation, testapis.proto3_optional, testapis.empty_types を移行
  - 注: testapis.wktypes, testapis.extensions は Byte/DateTime/Int64 カスタムスカラー依存のため `_` プレフィックスで除外
  - 注: testapis.multipkgs.subpkg2 は他パッケージへの依存があるため `_` プレフィックスで除外
  - _Requirements: 6.1_

- [x] 10.3 (P) protobuf-es edgecases テストケースを作成する
  - testapis.edgecases.import_from_same_pkg を移行
  - testapis.edgecases.import_oneof_member_from_other_file を移行
  - 注: testapis.edgecases.import_squashed_union.pkg2 は他パッケージへの依存があるため `_` プレフィックスで除外
  - _Requirements: 6.1_

## Task 11: 移行検証と既存テスト削除

- [x] 11.1 Golden Test 全件実行と検証を実施する
  - `pnpm test` で全テストケース（43件）が正常に実行されることを確認
  - e2e/tests.json のケース数と Golden Test のケース数が一致することを確認
  - 生成コードと GraphQL スキーマが既存 e2e テストと同等の検証結果となることを確認
  - _Requirements: 6.1, 6.5_

- [x] 11.2 plugin.test.ts のスナップショットテストを削除する
  - plugin.test.ts の既存スナップショットテストを削除
  - Golden Test でカバーされていることを確認
  - _Requirements: 6.3_

- [x] 11.3 e2e ディレクトリの Pothos 関連テストを削除する
  - e2e/tests/ 配下の pothos--* ディレクトリを削除
  - e2e/tests.json から Pothos 関連エントリを削除
  - e2e 関連の設定ファイルを必要に応じて更新
  - _Requirements: 6.2, 6.4_

- [x] 11.4 移行差異のドキュメント化を完了する
  - 既存テストと Golden Test の検証内容の差異を確認
  - design.md の Migration Mapping セクションが最新であることを確認
  - _Requirements: 6.5_
