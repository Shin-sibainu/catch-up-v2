# セットアップガイド

このドキュメントでは、開発環境のセットアップ手順を説明します。

---

## 前提条件

- Node.js 18.x 以上
- npm または pnpm
- Git
- Tursoアカウント（データベース用）

---

## 1. プロジェクトのクローン

```bash
git clone <repository-url>
cd catch-up-v2
```

---

## 2. 依存パッケージのインストール

```bash
npm install
# または
pnpm install
```

---

## 3. 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成し、以下の環境変数を設定します。

```bash
# Database (Turso)
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token

# External APIs
QIITA_ACCESS_TOKEN=your-qiita-token
ZENN_API_KEY=your-zenn-api-key  # (必要に応じて)

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Vercel Cron Jobs認証用（本番環境のみ）
CRON_SECRET=your-secret-key

# Phase 2で必要（今は不要）
# BETTER_AUTH_SECRET=
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
# GITHUB_CLIENT_ID=
# GITHUB_CLIENT_SECRET=

# Phase 3で必要（今は不要）
# ANTHROPIC_API_KEY=
```

### 環境変数の取得方法

#### Turso Database
1. [Turso](https://turso.tech/)にサインアップ
2. データベースを作成:
   ```bash
   turso db create catch-up-db
   ```
3. データベースURLを取得:
   ```bash
   turso db show catch-up-db --url
   ```
4. 認証トークンを作成:
   ```bash
   turso db tokens create catch-up-db
   ```

#### Qiita API
1. [Qiita](https://qiita.com/)にログイン
2. 設定 > アプリケーション > 個人用アクセストークン
3. 新しいトークンを生成（read_qiita権限が必要）

#### Zenn
- 現時点では公式APIキーは不要（RSS利用）
- 将来的に非公式APIを使う場合は要検討

---

## 4. データベースのセットアップ

### スキーマ定義の作成

Drizzle ORMを使用してスキーマを定義します。

```bash
# スキーマファイルは以下に配置
# src/db/schema.ts
```

### マイグレーションの実行

```bash
# マイグレーションファイル生成
npm run db:generate

# マイグレーション実行
npm run db:push
```

### シードデータの投入

```bash
# メディアソースの初期データ投入
npm run db:seed
```

#### シードデータ例（`scripts/seed.ts`）

```typescript
// Qiita
{
  name: 'qiita',
  display_name: 'Qiita',
  base_url: 'https://qiita.com',
  api_endpoint: 'https://qiita.com/api/v2/items',
  icon_url: '/icons/qiita.svg',
  is_active: true
}

// Zenn
{
  name: 'zenn',
  display_name: 'Zenn',
  base_url: 'https://zenn.dev',
  api_endpoint: 'https://zenn.dev/api/articles',
  icon_url: '/icons/zenn.svg',
  is_active: true
}
```

---

## 5. 開発サーバーの起動

```bash
npm run dev
# または
pnpm dev
```

ブラウザで `http://localhost:3000` を開く。

---

## 6. データ収集バッチの手動実行（開発時）

```bash
# ローカルでバッチ処理をテスト実行
curl http://localhost:3000/api/cron/collect-articles
```

**注意**: 本番環境ではVercel Cron Jobsが自動実行するため、手動実行は不要です。

---

## 7. ビルド確認

```bash
npm run build
npm run start
```

---

## 8. Vercelへのデプロイ

### 初回デプロイ

1. [Vercel](https://vercel.com/)にサインアップ/ログイン
2. GitHubリポジトリを連携
3. プロジェクトをインポート
4. 環境変数を設定（VercelダッシュボードのSettings > Environment Variables）
5. デプロイ実行

### Cron Jobsの設定

`vercel.json` に以下を追加:

```json
{
  "crons": [
    {
      "path": "/api/cron/collect-articles",
      "schedule": "0 0,12 * * *"
    }
  ]
}
```

スケジュール: 毎日0:00と12:00（UTC）に実行

---

## 9. 開発ツールのセットアップ

### VSCode拡張機能（推奨）

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Error Translator

### package.jsonスクリプト

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write .",
    "db:generate": "drizzle-kit generate:sqlite",
    "db:push": "drizzle-kit push:sqlite",
    "db:studio": "drizzle-kit studio",
    "db:seed": "tsx scripts/seed.ts"
  }
}
```

---

## トラブルシューティング

### データベース接続エラー

- `.env.local` の `TURSO_DATABASE_URL` と `TURSO_AUTH_TOKEN` を確認
- Tursoダッシュボードでデータベースが有効か確認

### Qiita APIのレート制限

- 認証済みアクセストークンを使用している場合、1000 req/hourまで
- レート制限に達した場合は、一定時間待つ

### ビルドエラー

- `node_modules` を削除して再インストール:
  ```bash
  rm -rf node_modules
  npm install
  ```
- Next.jsのキャッシュをクリア:
  ```bash
  rm -rf .next
  npm run build
  ```

---

## 参考リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [Turso Documentation](https://docs.turso.tech/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Vercel Documentation](https://vercel.com/docs)
- [Qiita API v2 Documentation](https://qiita.com/api/v2/docs)
