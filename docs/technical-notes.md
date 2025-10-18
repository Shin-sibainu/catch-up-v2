# 技術メモ・実装ガイド

開発中に参照する技術的なメモ、Tips、よく使う型定義などをまとめたドキュメントです。

---

## データベース設計

### トレンドスコア計算式

```typescript
/**
 * トレンドスコアの計算
 * スコアが高いほどトレンド性が高い
 */
function calculateTrendScore(article: {
  likes_count: number;
  bookmarks_count: number;
  comments_count: number;
  published_at: Date;
}): number {
  const now = new Date();
  const hoursSincePublished =
    (now.getTime() - article.published_at.getTime()) / (1000 * 60 * 60);

  const score =
    (article.likes_count * 2) +
    (article.bookmarks_count * 3) +
    (article.comments_count * 1) -
    (hoursSincePublished * 0.1);

  return Math.max(0, Math.round(score));
}
```

### インデックス設計

```sql
-- articles テーブルの重要なインデックス
CREATE INDEX idx_articles_media_source ON articles(media_source_id);
CREATE INDEX idx_articles_trend_score ON articles(trend_score DESC);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_external_id ON articles(external_id, media_source_id);

-- article_tags テーブル
CREATE INDEX idx_article_tags_article ON article_tags(article_id);
CREATE INDEX idx_article_tags_tag ON article_tags(tag_id);

-- tags テーブル
CREATE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_tags_slug ON tags(slug);
```

---

## 型定義

### 記事型（Article）

```typescript
export type Article = {
  id: number;
  external_id: string;
  media_source_id: number;
  title: string;
  url: string;
  description: string | null;
  body: string | null;
  thumbnail_url: string | null;
  likes_count: number;
  bookmarks_count: number;
  comments_count: number;
  views_count: number;
  trend_score: number;
  author_name: string;
  author_id: string;
  author_profile_url: string | null;
  author_avatar_url: string | null;
  published_at: Date;
  created_at: Date;
  updated_at: Date;
};

// タグ情報を含む記事型
export type ArticleWithTags = Article & {
  tags: Tag[];
  media_source: MediaSource;
};
```

### タグ型（Tag）

```typescript
export type Tag = {
  id: number;
  name: string;
  display_name: string;
  slug: string;
  color: string | null;
  icon_url: string | null;
  article_count: number;
  created_at: Date;
  updated_at: Date;
};
```

### メディアソース型（MediaSource）

```typescript
export type MediaSource = {
  id: number;
  name: string;
  display_name: string;
  base_url: string;
  api_endpoint: string | null;
  icon_url: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};
```

### API レスポンス型

```typescript
// GET /api/articles
export type GetArticlesResponse = {
  articles: ArticleWithTags[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// GET /api/articles クエリパラメータ
export type GetArticlesParams = {
  page?: number;
  limit?: number;
  media?: string[];  // media source names
  period?: 'day' | 'week' | 'month' | 'all';
  tags?: string[];   // tag slugs
  sort?: 'trend' | 'likes' | 'bookmarks' | 'latest';
  search?: string;
};
```

---

## 外部API連携

### Qiita API

#### エンドポイント
```
GET https://qiita.com/api/v2/items
```

#### リクエストヘッダー
```typescript
headers: {
  'Authorization': `Bearer ${process.env.QIITA_ACCESS_TOKEN}`,
  'Content-Type': 'application/json',
}
```

#### クエリパラメータ
```typescript
{
  page: 1,           // ページ番号
  per_page: 100,     // 1ページあたりの件数（最大100）
  query: 'created:>2024-01-01 stocks:>10',  // 検索クエリ
}
```

#### レスポンスマッピング

```typescript
// Qiita APIレスポンス → Articleへの変換
function mapQiitaItemToArticle(item: QiitaItem): Partial<Article> {
  return {
    external_id: item.id,
    title: item.title,
    url: item.url,
    description: item.body.substring(0, 200), // 最初の200文字
    body: item.body,
    thumbnail_url: null, // Qiitaにはサムネイルなし
    likes_count: item.likes_count,
    bookmarks_count: item.stocks_count,
    comments_count: item.comments_count,
    author_name: item.user.name || item.user.id,
    author_id: item.user.id,
    author_profile_url: `https://qiita.com/${item.user.id}`,
    author_avatar_url: item.user.profile_image_url,
    published_at: new Date(item.created_at),
  };
}
```

### Zenn API/RSS

#### RSS
```
GET https://zenn.dev/feed
```

#### 非公式API（使用する場合）
```
GET https://zenn.dev/api/articles
```

#### クエリパラメータ
```typescript
{
  order: 'latest' | 'daily' | 'weekly' | 'monthly',
  count: 50,  // 取得件数
}
```

#### レスポンスマッピング

```typescript
function mapZennArticleToArticle(article: ZennArticle): Partial<Article> {
  return {
    external_id: String(article.id),
    title: article.title,
    url: `https://zenn.dev${article.path}`,
    description: article.emoji + ' ' + article.title,
    body: null, // RSSには本文が含まれない
    thumbnail_url: null,
    likes_count: article.liked_count,
    bookmarks_count: 0, // Zennにはブックマーク数がない
    comments_count: 0,
    author_name: article.user.name,
    author_id: article.user.username,
    author_profile_url: `https://zenn.dev/${article.user.username}`,
    author_avatar_url: article.user.avatar_small_url,
    published_at: new Date(article.published_at),
  };
}
```

---

## ユーティリティ関数

### 日付フィルター用

```typescript
/**
 * 期間フィルターに応じた開始日時を取得
 */
export function getStartDateByPeriod(period: 'day' | 'week' | 'month' | 'all'): Date | null {
  const now = new Date();

  switch (period) {
    case 'day':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case 'week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'month':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'all':
    default:
      return null;
  }
}
```

### タグスラッグ生成

```typescript
/**
 * タグ名からスラッグを生成
 */
export function generateTagSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
```

### 相対時間表示

```typescript
/**
 * 相対時間を表示（例: "2時間前", "3日前"）
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 60) {
    return `${diffMinutes}分前`;
  } else if (diffHours < 24) {
    return `${diffHours}時間前`;
  } else if (diffDays < 30) {
    return `${diffDays}日前`;
  } else {
    return date.toLocaleDateString('ja-JP');
  }
}
```

---

## Drizzle ORM Tips

### スキーマ定義例

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const articles = sqliteTable('articles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  external_id: text('external_id').notNull(),
  media_source_id: integer('media_source_id').notNull(),
  title: text('title').notNull(),
  url: text('url').notNull().unique(),
  // ... 他のフィールド
  created_at: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
```

### よく使うクエリパターン

```typescript
import { db } from '@/db';
import { articles, tags, articleTags } from '@/db/schema';
import { eq, desc, and, gte } from 'drizzle-orm';

// 記事一覧取得（タグ含む）
const articlesWithTags = await db
  .select()
  .from(articles)
  .leftJoin(articleTags, eq(articles.id, articleTags.article_id))
  .leftJoin(tags, eq(articleTags.tag_id, tags.id))
  .where(gte(articles.published_at, startDate))
  .orderBy(desc(articles.trend_score))
  .limit(20);

// 記事の挿入/更新（upsert）
await db
  .insert(articles)
  .values(newArticle)
  .onConflictDoUpdate({
    target: articles.url,
    set: {
      likes_count: newArticle.likes_count,
      bookmarks_count: newArticle.bookmarks_count,
      trend_score: newArticle.trend_score,
      updated_at: new Date(),
    },
  });
```

---

## Tailwind CSS カスタム設定

### tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#0a0a0a',
          secondary: '#1a1a1a',
          tertiary: '#2a2a2a',
        },
        border: '#333333',
        primary: {
          DEFAULT: '#3B82F6',
          light: '#60A5FA',
        },
        accent: {
          DEFAULT: '#8B5CF6',
          light: '#A78BFA',
        },
        text: {
          primary: '#FAFAFA',
          secondary: '#A1A1A1',
          tertiary: '#737373',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans JP', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backdropBlur: {
        glass: '12px',
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## Next.js App Router パターン

### Server ComponentでのデータフェッチNG

```typescript
// app/page.tsx
export default async function Home() {
  const res = await fetch('http://localhost:3000/api/articles', {
    cache: 'no-store', // SSRの場合
    // next: { revalidate: 3600 }, // ISRの場合（1時間キャッシュ）
  });
  const data = await res.json();

  return <ArticleList articles={data.articles} />;
}
```

### Client ComponentでのデータフェッチOK

```typescript
'use client';

import { useEffect, useState } from 'react';

export default function ArticleListClient() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetch('/api/articles')
      .then(res => res.json())
      .then(data => setArticles(data.articles));
  }, []);

  return <div>{/* ... */}</div>;
}
```

---

## パフォーマンス最適化

### 画像最適化

```typescript
import Image from 'next/image';

<Image
  src={article.thumbnail_url || '/default-thumbnail.png'}
  alt={article.title}
  width={600}
  height={400}
  className="rounded-lg"
  loading="lazy"
  placeholder="blur"
  blurDataURL="/blur-placeholder.png"
/>
```

### 動的インポート

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false, // クライアントサイドのみで読み込む
});
```

---

## エラーハンドリング

### API Routeでのエラーハンドリング

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 処理
    return NextResponse.json({ success: true, data: [] });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
```

---

## デバッグTips

### Drizzle Studio

データベースの内容を視覚的に確認:

```bash
npm run db:studio
```

### Vercel Logs

```bash
vercel logs <deployment-url>
```

---

## 参考リンク

- [Next.js 15 Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Drizzle Queries](https://orm.drizzle.team/docs/rqb)
- [Tailwind CSS Customization](https://tailwindcss.com/docs/configuration)
- [Qiita API Rate Limits](https://qiita.com/api/v2/docs#%E5%88%A9%E7%94%A8%E5%88%B6%E9%99%90)
