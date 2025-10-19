# Phase 2 & 3 実装ガイド

このドキュメントは、Phase 2（ユーザー機能）とPhase 3（AI機能）の実装手順をまとめたものです。

---

## Phase 2: ユーザー機能（3-4週間）

### 概要

ユーザー認証、お気に入り、既読管理、パーソナライズ機能を実装します。

---

## Week 1: 認証機能実装

### 1.1 Better Auth セットアップ

#### インストール
```bash
npm install better-auth
```

#### 環境変数追加
```bash
# .env.local
BETTER_AUTH_SECRET=your_secret_key_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

#### Better Auth 設定ファイル作成
`src/lib/auth.ts`
```typescript
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  database: {
    // Drizzle ORM連携
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
});
```

### 1.2 データベーススキーマ追加

#### users テーブル
`src/db/schema.ts` に追加:
```typescript
export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // Better Auth ID
  email: text('email').notNull().unique(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  isPremium: integer('is_premium', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
}, (table) => ({
  emailIdx: index('idx_users_email').on(table.email),
}));
```

#### マイグレーション実行
```bash
npm run db:generate
npm run db:push
```

### 1.3 認証API Routes作成

#### `/api/auth/[...all]/route.ts`
```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

### 1.4 認証UIコンポーネント

#### `src/components/auth/LoginForm.tsx`
- Email/Passwordログインフォーム
- OAuth（Google/GitHub）ボタン

#### `src/components/auth/SignupForm.tsx`
- 新規登録フォーム

#### `src/components/Header.tsx` 更新
- ログイン状態表示
- ユーザーアバター＆ドロップダウンメニュー

---

## Week 2: お気に入り・既読管理

### 2.1 お気に入り機能

#### データベーススキーマ追加

`src/db/schema.ts`:
```typescript
export const favorites = sqliteTable('favorites', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  articleId: integer('article_id')
    .notNull()
    .references(() => articles.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
}, (table) => ({
  userArticleIdx: index('idx_favorites_user_article').on(table.userId, table.articleId),
  uniqueUserArticle: unique().on(table.userId, table.articleId),
}));
```

#### API Routes作成

**POST /api/favorites**
```typescript
// お気に入り追加
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { articleId } = await request.json();

  await db.insert(favorites).values({
    userId: session.user.id,
    articleId,
  }).onConflictDoNothing();

  return NextResponse.json({ success: true });
}
```

**DELETE /api/favorites/[articleId]**
```typescript
// お気に入り削除
export async function DELETE(request: NextRequest, { params }) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await db.delete(favorites).where(
    and(
      eq(favorites.userId, session.user.id),
      eq(favorites.articleId, params.articleId)
    )
  );

  return NextResponse.json({ success: true });
}
```

**GET /api/favorites**
```typescript
// お気に入り一覧取得
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const favoriteArticles = await db
    .select({
      article: articles,
      mediaSource: mediaSources,
      favoriteCreatedAt: favorites.createdAt,
    })
    .from(favorites)
    .innerJoin(articles, eq(favorites.articleId, articles.id))
    .innerJoin(mediaSources, eq(articles.mediaSourceId, mediaSources.id))
    .where(eq(favorites.userId, session.user.id))
    .orderBy(desc(favorites.createdAt));

  return NextResponse.json({ favorites: favoriteArticles });
}
```

#### UIコンポーネント

**`src/components/FavoriteButton.tsx`**
```typescript
'use client';

export function FavoriteButton({ articleId, isFavorited }: Props) {
  const [favorited, setFavorited] = useState(isFavorited);

  const toggleFavorite = async () => {
    if (favorited) {
      await fetch(`/api/favorites/${articleId}`, { method: 'DELETE' });
    } else {
      await fetch('/api/favorites', {
        method: 'POST',
        body: JSON.stringify({ articleId }),
      });
    }
    setFavorited(!favorited);
  };

  return (
    <button onClick={toggleFavorite}>
      {favorited ? '❤️' : '🤍'}
    </button>
  );
}
```

**`src/app/favorites/page.tsx`**
- お気に入り一覧ページ

### 2.2 既読管理

#### データベーススキーマ追加

`src/db/schema.ts`:
```typescript
export const readArticles = sqliteTable('read_articles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  articleId: integer('article_id')
    .notNull()
    .references(() => articles.id, { onDelete: 'cascade' }),
  readAt: integer('read_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
}, (table) => ({
  userArticleIdx: index('idx_read_articles_user_article').on(table.userId, table.articleId),
  uniqueUserArticle: unique().on(table.userId, table.articleId),
}));
```

#### API Routes作成

**POST /api/read-articles**
```typescript
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { articleId } = await request.json();

  await db.insert(readArticles).values({
    userId: session.user.id,
    articleId,
  }).onConflictDoUpdate({
    target: [readArticles.userId, readArticles.articleId],
    set: { readAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
```

#### クライアント側実装

**記事カードクリック時に既読を送信**:
```typescript
const handleArticleClick = async (articleId: number) => {
  // 既読登録
  await fetch('/api/read-articles', {
    method: 'POST',
    body: JSON.stringify({ articleId }),
  });

  // 外部リンクを開く
  window.open(article.url, '_blank');
};
```

---

## Week 3-4: マイページ・興味タグ設定

### 3.1 興味タグ設定

#### データベーススキーマ追加

`src/db/schema.ts`:
```typescript
export const userInterests = sqliteTable('user_interests', {
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tagId: integer('tag_id')
    .notNull()
    .references(() => tags.id, { onDelete: 'cascade' }),
  weight: integer('weight').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.tagId] }),
}));
```

#### API Routes作成

**POST /api/user-interests**
```typescript
// 興味タグ追加
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { tagId } = await request.json();

  await db.insert(userInterests).values({
    userId: session.user.id,
    tagId,
  }).onConflictDoNothing();

  return NextResponse.json({ success: true });
}
```

### 3.2 マイページ

**`src/app/mypage/page.tsx`**
- プロフィール編集
- お気に入り記事一覧
- 興味タグ管理
- 既読/未読統計

---

## Phase 3: AI機能（3-4週間）

### 概要

Claude API / OpenAI APIを使って、ホットトピック分析とパーソナライズドフィードを実装します。

---

## Week 1-2: ホットトピック分析バッチ

### 1.1 Claude API / OpenAI API セットアップ

#### 環境変数追加
```bash
# .env.local
ANTHROPIC_API_KEY=your_anthropic_api_key
# または
OPENAI_API_KEY=your_openai_api_key
```

#### APIクライアント作成

`src/lib/ai/claude.ts`:
```typescript
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeTopics(articles: Article[]) {
  const prompt = `
以下の記事タイトルと説明から、今話題のトピックを5-10個抽出してください。
各トピックには以下を含めてください：
- トピック名
- 2-3文の簡潔な説明
- 関連記事のインデックス番号

記事リスト:
${articles.map((a, i) => `${i}. ${a.title}\n${a.description}`).join('\n\n')}
  `.trim();

  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2000,
    messages: [{
      role: "user",
      content: prompt,
    }],
  });

  return response.content[0].text;
}
```

### 1.2 データベーススキーマ追加

`src/db/schema.ts`:
```typescript
export const hotTopics = sqliteTable('hot_topics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'), // AIサマリー
  articleCount: integer('article_count').default(0),
  totalEngagement: integer('total_engagement').default(0),
  trendScore: integer('trend_score').default(0),
  rank: integer('rank'),
  periodStart: integer('period_start', { mode: 'timestamp' }).notNull(),
  periodEnd: integer('period_end', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
}, (table) => ({
  periodIdx: index('idx_hot_topics_period').on(table.periodStart, table.periodEnd),
  rankIdx: index('idx_hot_topics_rank').on(table.rank),
}));

export const hotTopicArticles = sqliteTable('hot_topic_articles', {
  hotTopicId: integer('hot_topic_id')
    .notNull()
    .references(() => hotTopics.id, { onDelete: 'cascade' }),
  articleId: integer('article_id')
    .notNull()
    .references(() => articles.id, { onDelete: 'cascade' }),
  relevanceScore: integer('relevance_score').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
}, (table) => ({
  pk: primaryKey({ columns: [table.hotTopicId, table.articleId] }),
  topicIdx: index('idx_hot_topic_articles_topic').on(table.hotTopicId),
}));
```

### 1.3 ホットトピック分析バッチ

**`src/app/api/cron/analyze-hot-topics/route.ts`**
```typescript
import { analyzeTopics } from '@/lib/ai/claude';
import { db, articles, hotTopics, hotTopicArticles } from '@/db';
import { desc, gte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  // Cron認証チェック
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('🔥 Starting hot topic analysis...');

  // 過去7日間の人気記事を取得（上位200件）
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const popularArticles = await db
    .select()
    .from(articles)
    .where(gte(articles.publishedAt, sevenDaysAgo))
    .orderBy(desc(articles.trendScore))
    .limit(200);

  // AIでトピック分析
  const analysisResult = await analyzeTopics(popularArticles);

  // 結果をパースしてDBに保存
  const topics = parseAIResponse(analysisResult);

  const periodStart = sevenDaysAgo;
  const periodEnd = new Date();

  for (const [index, topic] of topics.entries()) {
    const [insertedTopic] = await db.insert(hotTopics).values({
      name: topic.name,
      slug: generateSlug(topic.name),
      description: topic.description,
      articleCount: topic.articleIds.length,
      totalEngagement: calculateEngagement(topic.articleIds, popularArticles),
      trendScore: calculateTrendScore(topic.articleIds, popularArticles),
      rank: index + 1,
      periodStart,
      periodEnd,
    }).returning();

    // 関連記事を保存
    for (const articleId of topic.articleIds) {
      await db.insert(hotTopicArticles).values({
        hotTopicId: insertedTopic.id,
        articleId,
        relevanceScore: 100,
      });
    }
  }

  console.log(`✅ Analyzed ${topics.length} hot topics`);
  return NextResponse.json({ success: true, topicsCount: topics.length });
}
```

#### vercel.json に追加
```json
{
  "crons": [
    {
      "path": "/api/cron/collect-articles",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cron/analyze-hot-topics",
      "schedule": "0 2 * * *"
    }
  ]
}
```

---

## Week 3: ホットトピックUI実装

### 3.1 ホットトピック一覧ページ

**`src/app/hot-topics/page.tsx`**
```typescript
export default async function HotTopicsPage() {
  const topics = await getHotTopics();

  return (
    <div>
      <h1>🔥 ホットトピック</h1>
      {topics.map((topic, i) => (
        <HotTopicCard key={topic.id} topic={topic} rank={i + 1} />
      ))}
    </div>
  );
}
```

**`src/components/HotTopicCard.tsx`**
- トピック名
- AIサマリー
- 関連記事数
- 総エンゲージメント
- 代表記事3-5件

---

## Week 4: パーソナライズドフィード

### 4.1 レコメンデーションロジック

**`src/lib/recommendation.ts`**
```typescript
export async function getRecommendedArticles(userId: string) {
  // ユーザーの興味タグを取得
  const interests = await db
    .select()
    .from(userInterests)
    .where(eq(userInterests.userId, userId));

  // お気に入り記事を取得
  const favoriteArticles = await db
    .select()
    .from(favorites)
    .where(eq(favorites.userId, userId))
    .limit(20);

  // 類似記事をスコアリング
  const recommendations = await db
    .select()
    .from(articles)
    .where(/* タグが一致する記事 */)
    .orderBy(desc(articles.trendScore))
    .limit(10);

  return recommendations;
}
```

### 4.2 レコメンデーションUI

**`src/components/RecommendedArticles.tsx`**
- ユーザー専用のレコメンデーションセクション
- 「あなたへのおすすめ」

---

## チェックリスト

### Phase 2
- [ ] Better Auth セットアップ
- [ ] users テーブル作成
- [ ] 認証UI実装
- [ ] お気に入り機能（DB + API + UI）
- [ ] 既読管理（DB + API + UI）
- [ ] 興味タグ設定（DB + API + UI）
- [ ] マイページ実装

### Phase 3
- [ ] Claude/OpenAI API セットアップ
- [ ] hot_topics テーブル作成
- [ ] ホットトピック分析バッチ実装
- [ ] ホットトピックUI実装
- [ ] パーソナライズドフィード実装
- [ ] レコメンデーションUI実装

---

## 参考リンク

- [Better Auth Documentation](https://www.better-auth.com/)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [OpenAI API](https://platform.openai.com/docs/)
- [Drizzle ORM Relations](https://orm.drizzle.team/docs/rqb)
