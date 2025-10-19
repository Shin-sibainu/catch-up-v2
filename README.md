# Catch Up🔥 - 技術トレンドをキャッチアップ

Qiita、Zenn、noteから最新の技術記事を一箇所でキャッチアップできるWebアプリケーション。

## 特徴

- 📗 **Qiita** - 日本最大級のプログラマーコミュニティ
- ⚡ **Zenn** - エンジニアのための情報共有サービス
- 📝 **note** - クリエイター向けプラットフォームの技術記事

### 主な機能

- トレンドスコア順の記事一覧表示
- メディア・期間・タグによる高度なフィルタリング
- 全文検索機能
- レスポンシブデザイン（モバイル・タブレット・デスクトップ対応）
- PWA対応（ホーム画面に追加可能）

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **データベース**: Turso (libSQL)
- **ORM**: Drizzle ORM
- **スタイリング**: Tailwind CSS
- **デプロイ**: Vercel
- **外部API**: Qiita API v2, Zenn Feed, note.com API v3

## パフォーマンス最適化

- ISR (Incremental Static Regeneration) - 1時間キャッシュ
- DAL (Data Access Layer) - コード削減とクエリ最適化
- N+1問題の解消 - 10倍以上の速度向上
- Server Components優先のアーキテクチャ

## セットアップ

### 環境変数

`.env.local` を作成して以下を設定：

```bash
# Database (Turso)
TURSO_DATABASE_URL=your_turso_database_url
TURSO_AUTH_TOKEN=your_turso_auth_token

# External APIs
QIITA_ACCESS_TOKEN=your_qiita_token

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Vercel Cron Jobs
CRON_SECRET=your_cron_secret
```

### インストール

```bash
npm install
```

### データベースセットアップ

```bash
# マイグレーション実行
npm run db:generate
npm run db:push

# シードデータ投入
npm run db:seed
```

### 開発サーバー起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) でアプリケーションが起動します。

## ドキュメント

- [要件定義](./docs/requirement.md)
- [進捗管理](./docs/progress.md)
- [技術メモ](./docs/technical-notes.md)
- [コンポーネント設計](./docs/component-design.md)
- [セットアップガイド](./docs/setup.md)

## ブランチ戦略

- `master` - 本番環境（安定版）
- `develop` - 開発環境（新機能開発）

## 免責事項

### 外部サービスの利用について

本サービスは以下の外部サービスから記事情報を取得しています：

- **Qiita**: 公式API v2を使用
- **Zenn**: 非公式APIを使用（公式ドキュメントなし）
- **note.com**: 非公式APIを使用（検索機能）

⚠️ **非公式APIの利用について**:
本サービスはZennとnote.comの非公式APIを利用しています。Zennは公式なAPIドキュメントが提供されておらず、note.comは検索機能を利用しています。これらのサービス側の仕様変更により、予告なく機能が停止する可能性があります。現在、両サービスに対して正式な利用許可を問い合わせ中です。

### 著作権

- 表示される記事の著作権は、各記事の著者および掲載プラットフォームに帰属します
- 本サービスは記事へのリンクを提供するのみであり、コンテンツの著作権を主張しません
- 記事本文は保存せず、メタデータ（タイトル、URL、著者情報等）のみを保存します

著作権者の方で掲載を望まない場合は、GitHubのIssueまたはリポジトリ管理者までご連絡ください。

## ライセンス

MIT
