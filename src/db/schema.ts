import { sqliteTable, text, integer, primaryKey, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// メディアソーステーブル
export const mediaSources = sqliteTable('media_sources', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  displayName: text('display_name').notNull(),
  baseUrl: text('base_url').notNull(),
  apiEndpoint: text('api_endpoint'),
  iconUrl: text('icon_url'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

// 記事テーブル
export const articles = sqliteTable(
  'articles',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    externalId: text('external_id').notNull(),
    mediaSourceId: integer('media_source_id')
      .notNull()
      .references(() => mediaSources.id),
    title: text('title').notNull(),
    url: text('url').notNull().unique(),
    description: text('description'),
    body: text('body'),
    thumbnailUrl: text('thumbnail_url'),
    likesCount: integer('likes_count').notNull().default(0),
    bookmarksCount: integer('bookmarks_count').notNull().default(0),
    commentsCount: integer('comments_count').notNull().default(0),
    viewsCount: integer('views_count').notNull().default(0),
    trendScore: integer('trend_score').notNull().default(0),
    authorName: text('author_name').notNull(),
    authorId: text('author_id').notNull(),
    authorProfileUrl: text('author_profile_url'),
    authorAvatarUrl: text('author_avatar_url'),
    publishedAt: integer('published_at', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => ({
    mediaSourceIdx: index('idx_articles_media_source').on(table.mediaSourceId),
    trendScoreIdx: index('idx_articles_trend_score').on(table.trendScore),
    publishedAtIdx: index('idx_articles_published_at').on(table.publishedAt),
    externalIdIdx: index('idx_articles_external_id').on(
      table.externalId,
      table.mediaSourceId
    ),
  })
);

// タグテーブル
export const tags = sqliteTable(
  'tags',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull().unique(),
    displayName: text('display_name').notNull(),
    slug: text('slug').notNull().unique(),
    color: text('color'),
    iconUrl: text('icon_url'),
    articleCount: integer('article_count').notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => ({
    nameIdx: index('idx_tags_name').on(table.name),
    slugIdx: index('idx_tags_slug').on(table.slug),
  })
);

// 記事タグ中間テーブル
export const articleTags = sqliteTable(
  'article_tags',
  {
    articleId: integer('article_id')
      .notNull()
      .references(() => articles.id, { onDelete: 'cascade' }),
    tagId: integer('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.articleId, table.tagId] }),
    articleIdx: index('idx_article_tags_article').on(table.articleId),
    tagIdx: index('idx_article_tags_tag').on(table.tagId),
  })
);

// クロールログテーブル
export const crawlLogs = sqliteTable(
  'crawl_logs',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    mediaSourceId: integer('media_source_id')
      .notNull()
      .references(() => mediaSources.id),
    status: text('status', { enum: ['success', 'failed', 'partial'] }).notNull(),
    articlesCollected: integer('articles_collected').notNull().default(0),
    errorMessage: text('error_message'),
    startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
    completedAt: integer('completed_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    mediaSourceIdx: index('idx_crawl_logs_media_source').on(table.mediaSourceId),
    statusIdx: index('idx_crawl_logs_status').on(table.status),
  })
);

// 型エクスポート
export type MediaSource = typeof mediaSources.$inferSelect;
export type InsertMediaSource = typeof mediaSources.$inferInsert;

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

export type Tag = typeof tags.$inferSelect;
export type InsertTag = typeof tags.$inferInsert;

export type ArticleTag = typeof articleTags.$inferSelect;
export type InsertArticleTag = typeof articleTags.$inferInsert;

export type CrawlLog = typeof crawlLogs.$inferSelect;
export type InsertCrawlLog = typeof crawlLogs.$inferInsert;
