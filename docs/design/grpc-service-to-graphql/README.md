# Design Docs: gRPC/Connect RPC Service → GraphQL Operations + Federation Subgraph

protoc-gen-pothos を拡張し、gRPC (Connect RPC) の Service/RPC 定義から GraphQL の Query/Mutation を resolver 実装込みで生成し、GraphQL Federation の subgraph として運用可能にする機能の設計ドキュメント群。

- Status: **詳細設計済み・実装未着手**(2026-07-11 設計セッション + 同日の詳細設計フェーズで確定)
- リリース計画: Step 1(RPC → Query/Mutation)→ Step 2(Federation 対応)。実装は opus / sonnet の subagent に依頼票形式で委譲する

## ドキュメント構成

| ドキュメント | 内容 |
|---|---|
| [requirements.md](./requirements.md) | 要求定義(Step 1 / Step 2 / 横断要求 / スコープ外) |
| [design.md](./design.md) | 設計本体(proto オプション、生成コード、runtime パッケージ) |
| [federation-design.md](./federation-design.md) | **Step 2 の詳細設計**(生成規則、検証ルール F1〜F9、検証済み Pothos API 事実) |
| [implementation-plan.md](./implementation-plan.md) | **全体実装計画**(Phase 0〜3、subagent 依頼票、依存グラフ、マイルストーン、リスク) |
| [decision-log.md](./decision-log.md) | 設計セッションの議論・意思決定の完全な記録(検討した代替案とピボットの経緯を含む) |
| [research.md](./research.md) | 前提調査の記録(コードベースの事実、外部ライブラリ、gqlkit 精査) |

## 関連ドキュメント

- [protoc-gen-dataloader 設計](../protoc-gen-dataloader/design.md) / [同実装計画](../protoc-gen-dataloader/implementation-plan.md) — Step 2 が依存する独立プラグイン。**federation 対応と独立して開発可能**なためドキュメントを分離している

## 読む順序の目安

- 全体像を知りたい: requirements.md → design.md → federation-design.md
- 「なぜこの設計なのか」を知りたい: decision-log.md(特に §2 のアーキテクチャ探索の経緯)
- 実装に着手する: implementation-plan.md の該当タスク依頼票 + 参照指定された設計セクション
