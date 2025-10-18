# 開発進捗管理

**最終更新**: 2025-10-18
**現在のフェーズ**: Phase 1 MVP

---

## Phase 1: MVP 開発

### Week 1-2: プロジェクトセットアップ、DB 設計、データ収集バッチ

#### プロジェクト初期設定

- [x] Next.js 15 プロジェクトのセットアップ
- [x] TypeScript 設定
- [x] ESLint/Prettier 設定
- [x] Tailwind CSS 設定
- [x] フォルダ構成の整理

#### データベース設計・実装

- [x] Turso データベースのセットアップ
- [x] Drizzle ORM の設定
- [x] スキーマ定義
  - [x] media_sources テーブル
  - [x] articles テーブル
  - [x] tags テーブル
  - [x] article_tags テーブル
  - [x] crawl_logs テーブル
- [x] マイグレーション実行
- [x] シードデータ投入（media_sources）

#### データ収集バッチ処理

- [x] Qiita API 連携
  - [x] API クライアント実装
  - [x] データパース処理
  - [x] エラーハンドリング
- [x] Zenn API/RSS 連携
  - [x] API クライアント実装
  - [x] データパース処理
  - [x] エラーハンドリング
- [x] バッチ処理本体
  - [x] `/app/api/cron/collect-articles/route.ts` 実装
  - [x] トレンドスコア計算ロジック
  - [x] 記事の挿入/更新処理
  - [x] タグの抽出・関連付け
  - [x] ログ記録処理
- [ ] Vercel Cron Jobs の設定

---

### Week 3-4: 記事一覧表示、フィルター、検索機能

#### API 実装

- [x] GET /api/articles - 記事一覧取得
  - [x] クエリパラメータ処理（page, limit, media, period, tags, sort, search）
  - [x] ページネーション実装
  - [x] フィルタリングロジック
  - [x] ソート処理
  - [x] レスポンス型定義
- [x] GET /api/articles/[id] - 記事詳細取得
- [x] GET /api/tags - タグ一覧取得
- [x] GET /api/media-sources - メディアソース一覧取得

#### フロントエンド - コンポーネント実装

- [x] レイアウト
  - [x] ルートレイアウト（`app/layout.tsx`）
  - [x] ヘッダーコンポーネント
  - [ ] フッターコンポーネント（オプション）
- [x] トップページ（`app/page.tsx`）
  - [x] 記事一覧表示
  - [x] ページネーション
  - [x] ローディング状態
  - [x] エラー表示
- [x] 記事カードコンポーネント
  - [x] メタ情報表示
  - [x] ホバーアニメーション
- [x] フィルターバーコンポーネント
  - [x] メディア別フィルター
  - [x] 期間別フィルター
  - [x] タグフィルター
  - [x] 検索入力フォーム
  - [x] ソート機能
- [x] サイドバーコンポーネント（デスクトップ）
  - [x] 人気タグクラウド
  - [x] 統計情報表示

#### 共通コンポーネント

- [ ] Button コンポーネント（Primary, Secondary, Ghost）
- [ ] Badge コンポーネント（タグ表示用）
- [x] Loading コンポーネント（スケルトン、スピナー）
- [ ] Toast コンポーネント（通知用）

---

### Week 5-6: UI/UX 調整、テスト、デプロイ

#### デザイン調整

- [x] ダークモードカラーパレット適用
- [x] グラスモーフィズム効果の適用
- [x] アニメーション・トランジション調整
- [x] レスポンシブ対応確認
  - [x] モバイル（320px-767px）
  - [x] タブレット（768px-1023px）
  - [x] デスクトップ（1024px 以上）

#### テスト

- [ ] 単体テスト
  - [ ] トレンドスコア計算関数
  - [ ] データ変換ユーティリティ
- [ ] 統合テスト
  - [ ] API エンドポイント
  - [ ] データ収集バッチ
- [ ] E2E テスト
  - [ ] 記事一覧表示
  - [ ] フィルタリング
  - [ ] 検索機能
- [ ] パフォーマンステスト
  - [ ] ページロード時間計測
  - [ ] API レスポンス時間計測

#### デプロイ準備

- [x] 環境変数の設定（Vercel）
- [x] ビルドエラーの解消
- [x] SEO 設定（metadata）
- [ ] OGP 画像設定
- [ ] favicon 設定

#### デプロイ

- [ ] Vercel への初回デプロイ
- [x] Vercel Cron Jobs 設定（vercel.json）
- [ ] Cron Job 動作確認
- [ ] 本番環境での動作確認
- [ ] パフォーマンスモニタリング設定

---

## Phase 2: ユーザー機能（今後）

- [ ] Better Auth セットアップ
- [ ] ユーザー認証機能
- [ ] お気に入り機能
- [ ] 既読管理
- [ ] マイページ

---

## Phase 3: AI 機能（今後）

- [ ] Claude API / OpenAI API 連携
- [ ] ホットトピック分析バッチ
- [ ] パーソナライズドフィード

---

## メモ・課題

### 技術的な課題

-

### 改善案

-

### 参考リンク

- [Qiita API Docs](https://qiita.com/api/v2/docs)
- [Zenn Feed](https://zenn.dev/feed)
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Turso Docs](https://docs.turso.tech/)
