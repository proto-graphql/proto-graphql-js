# Decision Log: gRPC Service → GraphQL 設計セッション

- 日時: 2026-07-11
- 進め方: グリリング形式(設計ツリーの根本から一問ずつ、選択肢と推奨案を提示して意思決定)。並行してコードベース調査と外部ライブラリ調査を実施
- 本ドキュメントの目的: **各決定の「なぜ」と、検討して捨てた代替案を後から追跡できるようにする**。設計の結論だけを知りたい場合は [design.md](./design.md) を参照

## 0. 出発点(初期要求)

> この proto-graphql を拡張し、gRPC(Connect RPC) の Service の RPC 定義から完全な graphql schema を生成するような仕組みを考えたい。
> rpc がそのまま query あるいは mutation となる。また、この Service から生成した GraphQL Schema は GraphQL Federation の subschema として運用されるイメージ。
> federation 利用があるので、BatchGet RPC から dataloader 生成や、そこに `@key` を利用した entity 拡張の仕組みなどが必要になるはず。

## 1. 事前調査で判明した前提

質問設計の土台になった主要な事実(詳細は [research.md](./research.md)):

- Service/Method レベルの proto オプション、Query/Mutation 生成、federation、dataloader は**すべて存在しない**(完全グリーンフィールド)。サービスを触る既存コードは `exceptRequestOrResponse` のみ
- protoc-gen-pothos は protobuf-es v2 をフルサポート済み。出力は「1 proto = 1 ファイル」でユーザーの `builder` に side-effect 登録
- **Connect-ES v2 は protobuf-es v2 必須**。`protoc-gen-es` v2 単体で message + `GenService` を生成し `createClient(Service, transport)` に渡せる
- Pothos federation plugin の `resolveReference` は representation 毎に呼ばれる(バッチ版なし)→ dataloader が公式推奨。**`asEntity` は既存 TypeRef に後付け可能**
- 旧 e2e は golden test framework に置換済み。query 実行スナップショット経路は配線済みだが未使用(休眠)

## 2. 意思決定の記録

以下、時系列。各項目は「提示した選択肢 → 決定(→ 推奨と違う場合はその旨)→ 理由・含意」の形式。

### Q1. 実行モデル — 生成コードはどこまで実装を含むか

- 選択肢: **(a) フル実装を生成(推奨)** / (b) スケルトン生成(resolver はユーザー実装) / (c) フル実装 + オーバーライド機構
- **決定: (a) フル実装を生成**
- 理由: 「完全な schema を生成」という要件に合致。Connect の `Transport` 抽象により、別プロセスへの呼び出し(BFF 構成)と同一プロセス内実行(`createRouterTransport`)を同じ生成コードでカバーできることが判明したため、実行形態の柔軟性は Transport 注入で担保できる
- 含意: ユーザーが書くのは builder / context / server 組み立てのみ。オーバーライドは Pothos の resolver 差し替え等で自然に可能なため専用機構は不要

### Q2. 対応ランタイム

- 選択肢: **(a) protobuf-es v2 専用(推奨)** / (b) ts-proto も同時対応 / (c) 将来も protobuf-es のみと割り切る
- **決定: (a) protobuf-es v2 専用**(ts-proto は将来の拡張余地として設計上塗り固めない)
- 理由: Connect-ES v2 が protobuf-es v2 必須。ts-proto 対応は nice-grpc 等の別エコシステムのクライアント生成が丸ごと必要になり、PoC の初期コストが倍増する
- 含意: `protobuf_lib != protobuf-es` で `(graphql.service)` を検出したらエラーにする

### Q3〜Q6. アーキテクチャの探索(3 度のピボットの経緯)★重要

この区間は最終決定に至るまでに 3 案を行き来した。**検討済みの代替案と、それぞれを見送った理由**がここに残っている。

#### Q3. 提供形態(1 回目)

- 選択肢: (a) protoc-gen-pothos に統合(推奨) / (b) 新プラグインを作る / (c) 統合だが別ファイル出力
- **ユーザー選択: (b) 新プラグイン**(推奨に反する選択)
- この時点で提示した事実: entity 化は `asEntity` の後付けで message printer 変更なしに可能 / printer 層は protoc-gen-pothos 内部にあり共有にはリファクタリングが先行する

#### Q4. 新プラグインのスコープ → 根本的な問題提起が発生

- 選択肢: (a) コンパニオン型(型は protoc-gen-pothos に任せ RPC 由来だけ生成、推奨) / (b) スーパーセット型(単体で全部生成)
- **ユーザー回答は選択肢外**: 「**resolver をユーザーが書かないなら Pothos(code-first DSL)は冗長では**」という問題提起。代替として:
  1. `protoc-gen-graphql`(素の `.graphql` SDL 生成)+ server preset の出力に合わせた resolver 実装生成
  2. [gqlkit](https://github.com/izumin5210/gqlkit) を前提とした `protoc-gen-gqlkit` で最小限の生成物にする
- この指摘は正しい: Pothos の価値は「手書きコードの型安全性」であり、全生成なら中間 DSL を挟む必然性は薄い

#### 事実確認: server preset と SDL 直生成の実態

- GraphQL Code Generator の Server Preset(`@eddeee888/gcg-typescript-resolver-files`)は「1 フィールド = 1 resolver ファイルの**人間が編集するスタブ**を生成し、既存実装は上書きしない」思想 → **機械が実装を全生成する用途とは思想が衝突**
- ただし型レイヤ(`typescript-resolvers` の `Resolvers` 型)は再利用可能で、「preset 互換」=この型規約に合わせた完全実装済み resolvers map の生成、という解釈なら成立
- SDL 路線の最小構成を定式化: `schema.graphql`(federation directive 込み)+ 完全実装済み typed resolvers map を生成し、ユーザーは `buildSubgraphSchema({ typeDefs, resolvers: {...generated, ...overrides} })` するだけ。Pothos も preset も不要、yoga/apollo 非依存

#### Q5. 主軸の選択(2 回目)

- 選択肢: (a) SDL + resolvers map(推奨) / (b) gqlkit 前提(protoc-gen-gqlkit) / (c) SDL をコアに両展開
- **決定: (a) SDL + resolvers map** — federation は SDL の本家表現、framework 非依存、gqlkit アダプタは後から追加可能な設計とする
- gqlkit を即採用しなかった理由(当時): federation 完全未対応で前提作業が発生、pre-1.0 の外部プロジェクトへの結合

#### Q6. 値フロー → gqlkit 回帰(3 回目)

- SDL 路線の核心の質問「resolver の parent 値は protobuf-es の MessageShape をそのまま流すか、全変換するか」を提示したところ、**ユーザーが前言撤回**: 「それを考えるとやはり protoc-gen-gqlkit を実装したうえでそれをベースにするのがいい。**gqlkit は TypeScript object の値変換の機構を持つ**ため」
- → gqlkit をクローンして精査(詳細は research.md §3)。判明した実態:
  - gqlkit は静的解析器で「TS モデル型 = resolver parent 型」。構造的検出のため**生成 TS はそのまま通る**(protobuf-es/Prisma 生成型を模した golden test も存在)
  - ただし自動の値変換は限定的(enum 値マップ、カスタムスカラー実装注入、ignoreFields、`$typeName` 除去)。**任意のフィールド変換は `defineField` で表現する** = Pothos 版の field resolver 生成と本質的に同等の生成が必要
  - 具体的ギャップ: `bigint` 未対応で hard fail(int64 系)/ oneof の `{case, value}` はそのままでは union にならない / proto enum 規約(UNSPECIFIED 除去)なし / **federation 完全未対応**(directive 機構はあるため `@key` directive 生成 + `buildSubgraphSchema` glue で非改修でも組める見込み)/ dataloader 規約なし

#### Q6(再). 最終方針の確定

- 選択肢: (a) gqlkit ベースで確定(当時の推奨) / (b) やはり SDL 直生成 / (c) 両段構え(コア共通化)
- **ユーザー最終判断(選択肢外・確定)**: 「**やっぱり protoc-gen-pothos の拡張から始めるのがいい。そっちで PoC 的に進めつつ、うまくいきそうなら protoc-gen-gqlkit 実装時に resolver 対応や federation 対応を考える。Pothos への federation subgraph 対応も『resolver 対応』→『federation 対応』とステップを踏む**」
- この判断の合理性:
  - 値変換問題は既存 protoc-gen-pothos の機構(`objectRef<MessageShape>` + フィールド毎 resolver)が**既に解決済み**
  - `asEntity` の後付けにより federation 対応も message printer 変更なしで載る
  - PoC の知見(オプション設計、マッピング規則、dataloader)は gqlkit 版にほぼそのまま還元できる
- **確定事項**: protoc-gen-pothos 拡張 / PoC / Step 1 = resolver 対応 → Step 2 = federation 対応 / protoc-gen-gqlkit は将来課題

### Q7. Query / Mutation の判定ルール

- 選択肢: (a) 明示オプション必須(推奨) / **(b) 規約デフォルト + オーバーライド** / (c) 命名規約ベース
- **決定: (b)** `idempotency_level = NO_SIDE_EFFECTS` → Query、それ以外 → Mutation、`(graphql.rpc).operation` で上書き(推奨に反する選択)
- 理由: idempotency_level は proto 標準の副作用シグナル(Connect も HTTP GET 対応に使用)。アノテーション量を抑える
- 「全 RPC 自動公開事故」の懸念は Q8 の opt-in で担保する前提
- **[2026-07-14 追記] Q31 でこの決定は覆された**: 規約デフォルトは撤廃され、`(graphql.rpc).operation` の明示指定のみが Query/Mutation を決定する。詳細は [Q31](#q31-operation-の明示指定を唯一のオプトイン条件にする2026-07-14) を参照

### Q8. 生成対象のオプトイン単位

- 選択肢: **(a) service オプション(推奨)** / (b) プラグインパラメータ / (c) 両方
- **決定: (a)** `(graphql.service)` を付けたサービスのみ生成
- 理由: proto が唯一の真実。同一ファイル内で公開/非公開サービスを共存できる。プラグインパラメータ追加不要。個別 RPC の除外は `(graphql.rpc).ignore`
- **[2026-07-14 追記] Q31 でこの決定は覆された**: `(graphql.service)` オプション自体を撤廃し、RPC 単位の `(graphql.rpc).operation` 明示指定がオプトインを兼ねる。詳細は [Q31](#q31-operation-の明示指定を唯一のオプトイン条件にする2026-07-14) を参照

### Q9. フィールド名の導出

- 選択肢: **(a) camelCase そのまま(推奨)** / (b) AIP 風 prefix 除去(GetUser → user) / (c) name 指定必須
- **決定: (a)** `GetUser` → `getUser`、`(graphql.rpc).name` で上書き
- 理由: 予測可能で誤爆なし(`GetOrCreateSession` 等)。「デフォルトは機械的変換、美学はオプションで」という既存 `(graphql.field).name` と同じ思想

### Q10. 引数の展開方式

- 選択肢: (a) 常に flatten(推奨) / (b) 常に single input / (c) Query は flatten / Mutation は input
- **決定: ユーザー独自案 = (c) + suffix 変換オプション**
  - Query: request フィールドを引数に flatten
  - Mutation: 単一 `input` 引数
  - さらに `ignore_requests` / `ignore_responses` の発展形として、**RPC の `XxxRequest` → `XxxInput`(Input object)、`XxxResponse` → `XxxPayload`(object type)へ suffix 変換して生成するオプション**を新設
- 理由: GraphQL コミュニティの慣習(参照系はフラット、更新系は Relay 流 input/payload)に一致し、既存オプションとの思想的連続性がある。Relay の mutation payload 慣習が proto から直接導出される

### Q11. Query のラッパー response の unwrap

- 選択肢: **(a) 変換のみ + 明示 unwrap(推奨)** / (b) 単一フィールド自動 unwrap / (c) 常に変換のみ
- **決定: (a)** デフォルトは構造保持(`GetUserResponse` → `GetUserPayload`)、unwrap したい RPC のみ `(graphql.rpc).expose_field` で指定
- 理由: 自動 unwrap は「response にフィールドが追加された瞬間、GraphQL スキーマが `User` → `GetUserPayload` へ暗黙に破壊的変更される」**進化ハザード**があるため不採用。Connect/buf 界隈はラッパー response が主流なので unwrap の需要自体はある → 明示指定で両立

### Q12. エラー変換ポリシー

- 選択肢: **(a) code 付き GraphQLError(推奨)** / (b) NOT_FOUND は null に変換 / (c) 素通し(masking 任せ)
- **決定: (a)** `ConnectError` → `GraphQLError(message = rawMessage, extensions.code = "NOT_FOUND" 等)`。details はデフォルト非掲載(情報漏洩防止、オプトインで拡張)。変換関数は runtime helper で差し替え可能
- 補足: federation の `_entities` は「見つからない entity は null」がプロトコル仕様なので、Step 2 の dataloader 経路では NotFound → null が構造的に強制される(ポリシー選択ではない)
- あわせて承認されたデフォルト: **streaming RPC は生成対象外(警告、明示 operation 指定時はエラー)**、**`google.protobuf.Empty` は request → 引数ゼロ / response → `Boolean`(常に true)**

### Q13. Connect client の注入方式

- 選択肢: **(a) context 規約 + runtime helper(推奨)** / (b) 生成 init 関数(モジュールグローバル) / (c) Pothos plugin 化
- **決定: (a)** GraphQL context に所定のキー(transport + 任意の callOptions hook)を置く規約とし、runtime パッケージの `getClient(ctx, Service)` が per-service に memoize して client を返す
- 理由: per-request ヘッダ伝搬・テストでの transport 差し替え(`createRouterTransport`)・サービス毎の transport 振り分けをすべて自然にカバー。context 型が規約を満たさなければ生成コードが型エラーになりコンパイル時に検出できる
- 含意: **Pothos 系初のランタイムパッケージ新設が確定**(エラー変換 helper もここに載る)

### Q14. `@key` の宣言方法

- 選択肢: **(a) `(graphql.object_type).federation.key`(推奨)** / (b) `object_type.key` にフラット追加 / (c) field オプションで指定
- **決定: (a)** ネストした `GraphqlFederationOptions` に repeated fieldset 文字列
- 理由: 将来の federation 系オプション(shareable / external / inaccessible 等)の集約先を確保し、既存オプションの名前空間を汚さない。proto の後方互換制約上、フラットに追加すると後からネストへ移せない。field オプション案は複数キーセット・複合キーが表現できない
- 付随決定: fieldset は **proto フィールド名で記述**し plugin が GraphQL 名へ変換(`(graphql.field).name` によるリネームと自動整合)

### Q15. entity 解決(resolveReference)と RPC の紐付け

- 選択肢: **(a) method オプションで宣言(推奨)** / (b) message 側から RPC を文字列参照 / (c) 命名規約(BatchGet*)自動検出
- **決定: (a)** BatchGet 系 RPC に method オプションを付与。request のキーリスト / response の entity リストのフィールド対応は「唯一の repeated フィールド」なら自動推論、複数あれば明示必須
- 理由: 生成物(dataloader + asEntity)が service 側ファイルに集約され、「このサービスがこの entity を解決する」という所有権宣言として読める。(b) は message の proto が service を知る形で関心の向きが逆。(c) は opt-in 思想と矛盾
- 付随決定: **entity resolver に指定された RPC はデフォルトで Query 非公開**(公開したければ `operation: QUERY` を併記)。loader は内部機構のため

### Q16〜Q17. dataloader の実装と生成場所

- Q16 選択肢: (a) runtime パッケージで自前(推奨) / (b) `@pothos/plugin-dataloader` / (c) ハイブリッド
- **Q16 決定: 自前**。ただしユーザーから「runtime で頑張るかコード生成するかは要検討。**protoc-gen-dataloader を別で作りそれに依存させるのもあり**」との方向づけ
- `@pothos/plugin-dataloader` を使わない理由: builder への plugin 追加が必須になり(federation plugin だけに抑えたい)、生成コードが plugin 固有 API に結合し、キー照合ロジックを自分の手に持てない
- Q17 選択肢: **(a) protoc-gen-dataloader 新設(推奨)** / (b) protoc-gen-pothos に内蔵 / (c) runtime の汎用関数のみ
- **Q17 決定: (a) protoc-gen-dataloader 新設**
- 理由: dataloader のコードは Connect-ES + protobuf-es のみに依存し **GraphQL 非依存にできる** → 将来の protoc-gen-gqlkit や非 GraphQL 用途で再利用可能。cross-plugin import の懸念(Q4 で議論)は、loader ファイルが同一 proto 由来で suffix 違いになるだけなので軽微。薄い共通処理(context 規約・per-context キャッシュ・キー照合)は runtime パッケージへ
- **→ 独立ドキュメント [../protoc-gen-dataloader/design.md](../protoc-gen-dataloader/design.md) に分離**(2026-07-11 のフィードバックによる。federation 対応と独立して開発を進められるため)

### Q18. BatchGet レスポンスの照合方式

- 選択肢: **(a) キーマッチ(推奨)** / (b) 順序前提(AIP-231 準拠) / (c) デフォルトキーマッチ + 選択制
- **決定: (a)** 返ってきた entity の @key フィールド値で request keys と突き合わせて並べ直す
- 理由: AIP-231 は「リクエスト順・atomic」だが、現実の BatchGet 実装は「見つかったものだけ返す」「順序保証なし」も多い。順序前提は非準拠サーバで **entity の静かな取り違え(silent data corruption)** を起こす。キーマッチは順序・欠損・重複すべてに頑健で、欠損は null(`_entities` 仕様に整合)。複合キーは fieldset 順で serialize して照合

### Q19. 外部 entity 拡張の proto 表現

- 選択肢: **(a) スタブ message + method オプション(推奨)** / (b) method オプションのみ(型情報を文字列で) / (c) 本物の message を import して宣言
- **決定: (a)** キーフィールドだけ持つスタブ message(`federation.extends` 宣言)+ RPC 側の method オプションで「どの型のどのフィールドになるか・request のどのフィールドに親のキーを詰めるか」を宣言
- 理由: キーの型が proto の型システムで表現される(typo・型不一致を codegen 時に検証可能)。「このサブグラフが知っている User の形」が proto 上で可視化される。将来の `@requires`(非キー external フィールド)にも拡張可能。(b) は型情報が文字列に漏れる。(c) は import した message の全フィールドの扱いが複雑化し他チーム proto への依存も発生

### Q20. MethodOptions の extension 名

- 選択肢: **(a) `(graphql.rpc)`(推奨)** / (b) `(graphql.method)` / (c) `(graphql.operation)`
- **決定: (a)** proto の `rpc` キーワードと一致して短く直感的。「rpc に対する GraphQL マッピング設定」と読め、operation 以外の関心(entity resolver、extend、batch)も自然に同居できる。(c) は entity loader 専用 RPC が operation ではないため名前と内容がずれる

### Q21. テスト戦略

- 選択肢: **(a) golden 拡張 + 実行テスト(推奨)** / (b) golden のみ / (c) golden + 別立て E2E
- **決定: (a)** service 付き proto を testapis に追加して golden case 化(コード snapshot + 型チェック + SDL snapshot)し、さらに `createRouterTransport` のフェイク Connect サーバで `query.graphql` 実行 → 結果 snapshot(**休眠中の実行経路を初活用**)。Step 2 では `_entities` 直接実行 + `@apollo/composition` の compose 検証
- 理由: resolver 実装が本機能の核であり、バグの大半(引数詰め替え・エラー変換・dataloader 照合)は実行時に宿る。(c) は旧 e2e を廃して golden に寄せた直近のリポジトリ方針と逆行

### Q22. proto 拡張オプションの追加プロセス

- 選択肢: **(a) 本家に experimental で追加(推奨)** / (b) 最初から正式仕様 / (c) JS リポジトリでローカル試作
- **決定: (a)** proto-graphql 本家に experimental 明記で追加(field number 2056 慣例)、Go binding 同時再生成、submodule 更新 → `pnpm gen:extensions`
- 理由: import パスが最初から正規(`graphql/schema.proto`)なので将来の移行痛なし。PoC の学びを仕様に反映する余地を宣言できる。(c) は利用者の proto の import パス変更という破壊的移行が確定してしまう

### Q23. ローカルリレーションのステップ配置

- 選択肢: **(a) Step 2 に含める(推奨)** / (b) Step 3 以降 / (c) Step 1 に前倒し
- **決定: (a)** extend 機構(RPC → 既存型のフィールド化)を外部 entity とローカル型の両対応で設計・実装
- 理由: 実装の 8 割が共通(externalRef か既存 objectRef かの違いのみ)で、機構の一般性を両ケースで検証できる。dataloader 基盤(Step 2 成果物)を N+1 対策にそのまま使える。(c) はバッチング基盤なしで N+1 のまま出すか dataloader を Step 1 に引き込むかの二択になり PoC が肥大化

### 最終確認

- 上記すべてを統合した設計サマリを提示し、**共有理解への到達を確認、ドキュメント化へ進むことに合意**

## 3. セッション後の追加フィードバック(2026-07-11)

1. **kiro spec フォーマットは使わない**(`.kiro/specs/` 形式で作成した初版を `docs/design/` へ移設・再構成)
2. **議論・意思決定の記録ドキュメントを追加**(本ドキュメント)
3. **protoc-gen-dataloader の設計を独立ドキュメントに分離** — federation 対応と独立して開発可能なため
   - この分離に伴い、loader 宣言オプションを `(graphql.rpc).federation.entity_resolver` から **`(graphql.rpc).batch` として federation の外に出す改訂案**を提示している(federation の entity_resolver は batch 宣言を参照する薄いフラグになる)。詳細と確認事項は [../protoc-gen-dataloader/design.md](../protoc-gen-dataloader/design.md) を参照

## 4. 確定事項サマリ

| 論点 | 決定 |
|---|---|
| 実装形態 | protoc-gen-pothos の拡張(PoC)。新プラグイン・SDL 直生成・gqlkit 案は見送り(§2 Q3〜Q6) |
| resolver | フル実装を生成。Transport 注入で別プロセス / in-process 両対応 |
| ランタイム | protobuf-es v2 専用(Connect-ES v2 前提) |
| リリース | Step 1: RPC → Query/Mutation → Step 2: Federation |
| opt-in | `(graphql.service)`。個別除外は `(graphql.rpc).ignore` |
| operation 判定 | idempotency_level 規約 + `operation` 上書き |
| 命名 | camelCase(rpc 名)+ `name` 上書き |
| 引数 | Query flatten / Mutation single input |
| Request/Response | suffix 変換オプション(→ `XxxInput` / → `XxxPayload`) |
| unwrap | `expose_field` による明示のみ(自動 unwrap 不採用) |
| エラー | code 付き GraphQLError、details 非掲載、helper 差し替え可 |
| client 注入 | context 規約 + runtime パッケージ `getClient(ctx, Service)` |
| streaming / Empty | 対象外(警告)/ 引数ゼロ・`Boolean` |
| @key | `(graphql.object_type).federation.key`(proto フィールド名 fieldset) |
| entity 解決 | method オプション + 自動推論、loader はデフォルト Query 非公開 |
| dataloader | 自前実装、protoc-gen-dataloader として独立(別ドキュメント) |
| 照合 | キーマッチ(順序非依存、欠損 null) |
| entity 拡張 | スタブ message + `(graphql.rpc).federation.extend`。ローカル型リレーションも同機構で Step 2 |
| オプション追加 | proto-graphql 本家に experimental、Go binding 同時再生成 |
| テスト | golden 拡張 + createRouterTransport 実行テスト、Step 2 で _entities + composition 検証 |

## 5. 未決事項(実装時に確定)

design.md §7 および protoc-gen-dataloader/design.md の残項目を参照。主なもの:

- suffix 変換オプションの正式名と `ignore_requests`/`ignore_responses` 併用時の優先順位
- flatten 時の oneof 引数の XOR バリデーション要否
- パッケージ正式名(runtime、protoc-gen-dataloader の npm 名)

## 6. 詳細設計フェーズの決定(2026-07-11 続き)

実装を opus / sonnet の subagent に委譲する前提で詳細計画を立てるフェーズに移行。以下を決定:

### Q24. 実装計画のスコープ

- 選択肢: **(a) Step 1 込みの全体計画(推奨)** / (b) federation/dataloader のみ
- **決定: (a)** 本家オプション追加 → Step 1(resolver + runtime パッケージ)→ dataloader → federation の全フェーズを一つの依存グラフとして計画する。federation/dataloader は Step 1 の基盤(オプション getter、context 規約、printer 基盤)に依存するため

### Q25. `(graphql.rpc).batch` 独立化(前回の要確認事項)

- **決定: 承認**。loader 宣言は `(graphql.rpc).batch` として federation の外に置き、`federation.entity_resolver` は batch 宣言を参照する薄いフラグとする

### Q26. group loader(1 キー → N entities)

- 選択肢: **(a) 今回のスコープに含める(推奨)** / (b) 後回し(entity loader のみ)
- **決定: (a)** `batch.group = true` で `DataLoader<K, V[]>` を生成。extend RPC(ローカルリレーション含む)のバッチングに必須で、キーマッチ機構の自然な拡張(groupBy)のため実装増分が小さい

### Q27. 複合キーのスコープ

- 選択肢: **(a) 単一フィールドキー限定で開始(推奨)** / (b) 最初から複合キー対応
- **決定: (a)** 複合キー指定は codegen エラーとする。ただしオプション形式(repeated fieldset)と照合機構は複合キーへ拡張可能な形を維持する(design-ready)

### Q28. BatchGet RPC が key_field 以外のフィールドを持つ場合の扱い

- 背景: DataLoader のバッチは「キー以外の入力が均一」が前提(1 バッチ = 1 RPC)。よって非キーフィールドは「リクエストの一部」ではなく「**ローダーの分割単位**」。実例は (a) AIP の `parent`(実質複合キーの変種)、(b) `view`/`read_mask`(取得形状)、(c) locale 等(per-request 定数)、(d) フィルタ
- 選択肢: (a) 非キーフィールドがあれば codegen エラー / (b) 常に unset 固定 / **(c) loader パラメータ化(推奨)** / (d) context hook 注入
- **決定: (c) loader パラメータ化**。accessor の第 2 引数に `Omit<MessageInitShape<Request>, keyField>` 型の params を取り、**params 値の組ごとに DataLoader を分離**(二段キャッシュ: ctx → paramsKey → DataLoader)。required フィールド(behavior comment 判定)があれば params を型レベルで必須化
- 帰結: federation 経由(entity_resolver / extend)は params を渡せないため、**required な非キーフィールドを持つ RPC は codegen エラー(F10)**、optional は unset。将来の extend フィールド GraphQL 引数化では args → params が受け皿になる。固定値注入(`request_defaults`)は将来検討
- 反映先: dataloader design §3(V9)/ §4.5、federation-design §3(F10)、実装計画 D1/D2/D3/D5/T3.1

### 実装フェーズで確定した設計修正(2026-07-12)

- **`<Rpc>LoaderParams` の Omit 廃止**(D5 の golden 型チェックで発覚): protobuf-es v2 の `MessageInitShape` は union 型で `Omit` が分配されず型不整合になるため、params 型は**完全な request init shape**とする。key_field が params に混入しても `call` が常に上書きするため正しさは保たれる(dataloader design §4.5 に反映)
- **`DataLoader` 型の import**: `dataloader` は CJS export assignment のため protoplugin の `createImportSymbol`(named import 専用)が使えず、`import type DataLoader from "dataloader";` を生成ファイル毎に直接出力する
- golden ルートは `tests/golden-dataloader/`(pothos の resolveConfig が `tests/golden/` 直下の未知ディレクトリで throw するため分離)

### 実装委譲の前提

- 実装タスクは「依頼票」形式(目的 / 前提 / 参照 / 成果物 / 受け入れ基準 / 実装ヒント / 推奨モデル)に分解し、opus または sonnet の subagent に依頼する
- 詳細は [implementation-plan.md](./implementation-plan.md) と [protoc-gen-dataloader/implementation-plan.md](../protoc-gen-dataloader/implementation-plan.md)

### Q29. proto オプションの per-track landing(2026-07-12)

- 背景: `add-service-rpc-options` ブランチ(proto-graphql 本家 PR)は当初 service/operation/federation/batch の全 experimental オプションを一括追加していた。しかし本リポジトリ側でコンシューマ実装が存在するのは protoc-gen-dataloader が消費する `(graphql.rpc).batch` のみで、service→operation 変換(Step 1)・federation(Step 2)はまだ実装 PR が着地していない
- 選択肢: (a) 全オプションを一括で upstream に着地させる / (b) **各トラックのコンシューマ実装 PR と同時に、そのトラックのオプションだけを着地させる per-track landing(推奨)**
- **決定: (b) per-track landing**。upstream PR を `(graphql.rpc).batch`(`GraphqlRpcBatchOptions` + `GraphqlRpcOptions.batch = 5` + `rpc = 2056` extension)のみに絞り、service/operation/federation 関連のメッセージ・フィールドは対応する PR(Step 1 / Step 2)まで追加しない
- 理由:
  - **未消費・未確定形状のオプションを proto に着地させない**: service→operation・federation はまだ実装で仕様が固まっておらず、実装中に API shape が変わりうる。消費者のいない experimental option を先に確定させても、実装時の手戻りで結局 upstream を再改訂することになりやすく、無消費の期間だけ「触ってはいけない/意味のない」proto 表面が増える
  - **proto への追加は後方互換であり、先送りは無料(free)**: 新しい message/field はいつでも追加でき、既存ユーザーへの影響もない。「今のうちに全部足しておく」ことに実利がなく、コンシューマと同時に着地させたほうが 1 PR あたりのレビュー単位も小さくなる
  - トラック間の依存を proto レベルで作らない(dataloader トラックの upstream PR が、federation トラックの設計未確定を理由にブロックされずに済む)
- 帰結:
  - `GraphqlRpcOptions` は `batch` フィールド(5)のみを持つ。1-4(ignore/operation/name/expose_field)・10(federation)はコンシューマ実装 PR で埋める前提の**慣行上の予約**であり、proto の `reserved` キーワードでは予約していない
  - `GraphqlObjectTypeOptions.federation`(field 5)、`GraphqlSchemaOptions` の 5-6(requests_as_inputs/responses_as_payloads)も同様に未定義
  - **`GraphqlFederationOptions` が upstream に存在しないため、batch の entity_key `@key` フォールバック(protoc-gen-dataloader design §3 V5)が実装できない**。entity_key は entity モード・group モードともに当面必須とし、フォールバックは federation 対応(Step 2)の PR で `GraphqlFederationOptions` と同時に追加する。federation-design.md の F4(entity_resolver ↔ batch の整合チェック)も同様に Step 2 まで休眠する
- 反映先: [protoc-gen-dataloader/design.md](../protoc-gen-dataloader/design.md) §2/§3(V5)、[design.md](./design.md) §2、[federation-design.md](./federation-design.md) §1

### Q30. loader パラメータの受け渡しタイミング(accessor time → load time、2026-07-13)

- 背景: ユーザー要望により、Q28 で決めた「params を accessor の第 2 引数で渡す」設計を見直した。accessor time 方式は `batchGetUsersLoader(ctx, params)` のように呼び出す毎に新しい参照を作れてしまい、同一 ctx でも params の異なる呼び出しを取り違えやすい・呼び出し側が「1 回だけ ctx で解決してから複数キーを load する」自然なパターンと相性が悪い、という指摘があった
- 選択肢:
  - (a) 現状維持(accessor time: `(ctx, params?) => DataLoader`)
  - (b) **wrapper オブジェクト化(採用)**: accessor は `(ctx) => RpcLoader` のみを返し、`RpcLoader.load(key, ...params)` / `loadMany(keys, ...params)` / `loader(...params)` で params を load time に渡す。wrapper 内部で ctx → paramsKey → DataLoader の二段キャッシュを維持
  - (c) 複合キー単一 DataLoader 化: key と params をまとめた複合キー(`{ key, paramsKey }`)を 1 つの DataLoader に渡し、batch 関数側で paramsKey ごとにグルーピングして複数 RPC を発行する
- **決定: (b) wrapper オブジェクト化**
- (c) を却下した理由:
  - **`maxBatchSize` の意味論が濁る**: `maxBatchSize` は「1 RPC あたりの最大キー数」のはずだが、複合キーを 1 つの DataLoader に通すと「1 バッチ(= 1 tick 分の複合キー集合)」と「1 RPC(= paramsKey でグルーピングした後の実際の呼び出し単位)」がずれる。`maxBatchSize` を複合キー単位で切ると同一 paramsKey 内の RPC 分割数が意図と食い違い、paramsKey 単位で切ろうとすると DataLoader 標準の `maxBatchSize` オプションでは表現できず自前のバッチ分割ロジックが要る
  - **グループ単位のエラー伝搬が複雑になる**: DataLoader は「1 バッチ = 1 batch 関数呼び出し = 1 reject 単位」が前提。複合キー単一 DataLoader では 1 tick に複数 paramsKey が混在しうるため、batch 関数内で paramsKey ごとに RPC を分けて呼び、それぞれの成否を元の複合キー配列の対応する位置に再マッピングする必要がある。これは今 wrapper 側でやっている「paramsKey ごとに素の DataLoader を分ける」ことを batch 関数の中に押し込めるだけで、実装が複雑になる上に「RPC 呼び出しが 1 回」という Q12 のエラー変換ポリシー(呼び出し側が reject をそのまま扱える)の前提が崩れる
  - (b) は Q28 の「paramsKey ごとに DataLoader を分ける」二段キャッシュ構造をそのまま保てるため、`maxBatchSize` は DataLoader 標準機能のまま・エラー伝搬も DataLoader 単位のままで済む
- 副次効果: 生成ファイルの const アノテーションが `DataLoader<K, V>` から `RpcLoader<K, V, PArgs>` に変わったことで、**生成ファイルが `dataloader` パッケージの型を直接 import しなくなった**(実装フェーズで確定した設計修正の「`DataLoader` 型の import」を参照)。`RpcLoader.loader(...)` が `.prime()`/`.clear()` 用に生の `DataLoader` を返すが、その型は `@proto-graphql/connect-runtime` 経由でのみ参照される
- 反映先: [protoc-gen-dataloader/design.md](../protoc-gen-dataloader/design.md) §1.1/§4.2/§4.3/§4.5、`@proto-graphql/connect-runtime` の `RpcLoader` 型・`createRpcLoader`、生成物の const アノテーション、golden テスト・実行テスト

### Step 1 実装フェーズの記録(2026-07-14)

T0.2〜T1.6(codegen-core の operation 抽象・printer・fixtures/golden/実行テスト・docs)を実装した過程で確定した細部・発見事項。設計そのものの変更ではなく、design.md に明記のなかった実装判断とテストで見つかった既存の不具合の記録。

- **戻り値 nullability の判断**: response message 型を返す operation は**デフォルトで non-null**(RPC は値を返すか throw するかのいずれかで、`NOT_FOUND` 等は `null` ではなくエラーとして表出する — Q12 の帰結)。`expose_field` 使用時は unwrap したフィールド自身の output nullability(`isRequiredField(field, "output")`)にそのまま従う。`google.protobuf.Empty` レスポンスは常に non-null `Boolean`。実装は `codegen-core/src/types/operationField.ts` の `OperationField.nullable` / `resolveReturn`
- **oneof の XOR バリデーションは v1 では生成しない**: Query flatten 時、oneof メンバーは個別の optional 引数としてそのまま並ぶだけで、複数同時指定を拒否する runtime チェックは生成されない(design.md §7 の未決事項どおり据え置き)。**arg 単位の deprecation も出力しない**: `OperationField.deprecationReason` は operation フィールド自体には反映されるが、flatten 引数(`t.arg(...)`)側は `type`/`required` のみで `deprecationReason` を持たない — Pothos の `t.arg` が deprecation 相当の API を持つか未検証のため、今回は見送り
- **ignore と suffix 変換(`requests_as_inputs`/`responses_as_payloads`)の併用優先順位**: `ignore_requests`/`ignore_responses` が勝つ(design.md §7 で「実装時に定義」としていた項目の確定)。この組み合わせを検出した警告は、型収集層(`buildInputObjectTypes`/`buildObjectTypes`)には警告チャネルがないため、`collectOperationsFromFile`(ファイル単位で `GraphqlSchemaOptions` を読む唯一の場所)がファイルにつき 1 回だけ出す形にした
- **KNOWN ISSUE(Step 1 起因ではない既存不具合、実行テストで発覚)**: squashed-oneof-union printer は、oneof の 2 つ以上のメンバーが同一 message 型を指す場合に `union X = T | T` という不正な GraphQL(union のメンバー型は一意でなければならない)を生成する。`protoc-gen-pothos` の golden スイートはこれまで `printSchema` の結果を SDL snapshot するだけで `validateSchema` を一切通していなかったため検出されず、今回 S1-F の実行テストが初めて `graphql()`(内部でスキーマを validate する)を呼んだことで表面化した。同型の重複は `printer.test.ts` の既存スモークテスト(`oneof pick { Address addr_a; Address addr_b; }` → `union GetUserRequestPick = Address | Address`)にも以前から存在しており、今回新規に持ち込んだ欠陥ではない。テスト用 fixture(`SearchUsersRequest.filter`)は `work` を別の `WorkAddress` 型にすることで回避した(commit `9684f89b`)。printer 自体の修正はスコープ外 — follow-up 候補として (a) squashed union printer 側での重複型検出/エラー化、(b) golden ハーネスに schema-validation ステージ(`validateSchema` 呼び出し)を追加し、この種の不正スキーマを型チェック段階で検出できるようにする、の 2 点を残す
- **ts-proto 側 fixture 生成の `outputServices=none` 化**: `testapis/service/*` は本 PoC で初めて `stream` RPC を含む fixture になったため、ts-proto のデフォルトのサービス stub 出力が `rxjs` 型依存を引き込んでしまう(本リポジトリは未導入)。RPC→GraphQL 生成は protobuf-es v2 専用(design.md §1.1)で ts-proto 側にサービス stub は元々不要なため、`buf.gen.testapis.yaml` に `outputServices=none` を追加して回避した(commit `afcab638`)

### Q31. `operation` の明示指定を唯一のオプトイン条件にする(2026-07-14)

- 背景: Step 1 実装(basic/transforms fixtures)を見たユーザーから、standalone(非 federation)利用を想定すると空の `option (graphql.service) = {};` によるオプトインが直感的でない、という指摘があった。「サービスを丸ごとオプトインしてから個々の RPC の挙動を規約 + オーバーライドで決める」という二段構えではなく、「各 RPC が自分自身の生成物を明示的に宣言する」形のほうが読んでそのまま分かる
- 選択肢:
  - (a) 現状維持(Q7 の規約デフォルト + Q8 の service opt-in)
  - **(b) `(graphql.rpc).operation` を QUERY/MUTATION に明示設定した RPC だけが生成対象になる、単一の宣言点に一本化(採用)**。`GraphqlServiceOptions` と `service = 2056` の ServiceOptions extension は本家から削除し、`idempotency_level` は一切参照しない
  - (c) service opt-in は残しつつ、規約デフォルト(idempotency_level → Query)だけ廃止して RPC 単位では明示必須にする(ハイブリッド)
- **決定: (b)**。Q7(規約デフォルト)・Q8(service opt-in)の両方を上書きする
- 理由:
  - **「空オプションで意味が変わる」設計は直感に反する**: `option (graphql.service) = {};` のように値を持たないオプションの「付いているかどうか」だけが意味を持つ設計は、proto を読むだけでは気づきにくい(Q8 の決定時点でも `getServiceOptions` ではなく `hasExtension` を使う特殊対応が必要だった=実装上のコード臭でもあった)
  - **RPC 単位の宣言のほうが「何が Query/Mutation になるか」を RPC 自身の定義だけで判断できる**: 現状は「このサービスは opt-in されているか」→「この RPC は ignore されていないか」→「idempotency_level は何か」→「operation で上書きされていないか」の 4 段階を追わないと結論が出ない。(b) は「operation に QUERY/MUTATION が入っているか」の 1 段階で完結する
  - **将来の kind 拡張と自然に接続する**: Step 2 で federation 向けに「既存型のフィールドとして extend する」種類の宣言(`extend` 相当)を追加する可能性があるが、それも「RPC が自分の生成物の種類を宣言する」という同じ形に乗る。service opt-in という別レイヤーの概念を維持する理由がなくなる
  - **idempotency_level は「安全な再試行」を表す proto 標準シグナルであり、「GraphQL に公開するかどうか」の意味論を持たせるのは責務の混在**(Q7 で「アノテーション量を抑える」ために採用した規約だが、実際に fixture を書いてみると「Query にしたいから idempotency_level を設定する」という本末転倒が起きやすいことが分かった)
- 帰結:
  - `(graphql.rpc).ignore` は維持: `operation` が設定されていても `ignore = true` なら生成しない(「宣言を残したまま一時的に無効化する」という他オプションと一貫した意味論)
  - streaming RPC への挙動: `operation` を明示した streaming RPC はエラー(変更なし)。`operation` 未設定の streaming RPC は単に非公開になる(旧来の「警告」は消える — 未注釈 RPC 全般の扱いと統一されたため)
  - protoc-gen-pothos の protobuf-es 専用ガード(旧 R1.4)のトリガーは「opt-in されたサービスがある」から「`operation` を設定した RPC がある」に置き換え
  - upstream(`proto-graphql` submodule)の是正コミットは `make-rpc-operation-explicit` ブランチで用意し、Step 1 で着地済みの `GraphqlServiceOptions` を削除する(Q29 の per-track landing 方針とは別に、着地済みオプションの訂正として扱う)
- 反映先: [design.md](./design.md) §2(オプション草案)/§3.1(マッピング表)、[requirements.md](./requirements.md) R1/R2、`packages/@proto-graphql/codegen-core`(`operationField.ts`/`util.ts`)、`protoc-gen-pothos`(`printer.ts` ガード)、`devPackages/testapis-proto` の service fixtures、[rpc-operations.md](../../protoc-gen-pothos/rpc-operations.md)、[proto-annotations/reference.md](../../proto-annotations/reference.md)

## 7. 将来課題への申し送り(protoc-gen-gqlkit)

本 PoC の知見を protoc-gen-gqlkit に還元する際、research.md §3 の gqlkit 精査結果が前提になる。特に:

- proto オプション設計(`(graphql.service)` / `(graphql.rpc)` / `federation` / `batch`)は生成ターゲットに依存しないため**そのまま再利用できる**
- protoc-gen-dataloader の生成物は GraphQL 非依存のため**そのまま依存できる**
- gqlkit 側の要対応: bigint(branded scalar 生成で回避可)、oneof の型再整形、federation(directive 生成 + `buildSubgraphSchema` glue で非改修でも可、ネイティブ対応は gqlkit のロードマップ判断)
