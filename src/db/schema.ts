import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  index,
  unique,
} from "drizzle-orm/sqlite-core";

// メディアソーステーブル
export const mediaSources = sqliteTable("media_sources", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  baseUrl: text("base_url").notNull(),
  apiEndpoint: text("api_endpoint"),
  iconUrl: text("icon_url"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

// 記事テーブル
export const articles = sqliteTable(
  "articles",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    externalId: text("external_id").notNull(),
    mediaSourceId: integer("media_source_id")
      .notNull()
      .references(() => mediaSources.id),
    title: text("title").notNull(),
    url: text("url").notNull().unique(),
    description: text("description"),
    body: text("body"),
    thumbnailUrl: text("thumbnail_url"),
    likesCount: integer("likes_count").notNull().default(0),
    bookmarksCount: integer("bookmarks_count").notNull().default(0),
    commentsCount: integer("comments_count").notNull().default(0),
    viewsCount: integer("views_count").notNull().default(0),
    trendScore: integer("trend_score").notNull().default(0),
    authorName: text("author_name").notNull(),
    authorId: text("author_id").notNull(),
    authorProfileUrl: text("author_profile_url"),
    authorAvatarUrl: text("author_avatar_url"),
    publishedAt: integer("published_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => ({
    mediaSourceIdx: index("idx_articles_media_source").on(table.mediaSourceId),
    trendScoreIdx: index("idx_articles_trend_score").on(table.trendScore),
    publishedAtIdx: index("idx_articles_published_at").on(table.publishedAt),
    externalIdIdx: index("idx_articles_external_id").on(
      table.externalId,
      table.mediaSourceId
    ),
  })
);

// タグテーブル
export const tags = sqliteTable(
  "tags",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull().unique(),
    displayName: text("display_name").notNull(),
    slug: text("slug").notNull().unique(),
    color: text("color"),
    iconUrl: text("icon_url"),
    articleCount: integer("article_count").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => ({
    nameIdx: index("idx_tags_name").on(table.name),
    slugIdx: index("idx_tags_slug").on(table.slug),
  })
);

// 記事タグ中間テーブル
export const articleTags = sqliteTable(
  "article_tags",
  {
    articleId: integer("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.articleId, table.tagId] }),
    articleIdx: index("idx_article_tags_article").on(table.articleId),
    tagIdx: index("idx_article_tags_tag").on(table.tagId),
  })
);

// クロールログテーブル
export const crawlLogs = sqliteTable(
  "crawl_logs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    mediaSourceId: integer("media_source_id")
      .notNull()
      .references(() => mediaSources.id),
    status: text("status", {
      enum: ["success", "failed", "partial"],
    }).notNull(),
    articlesCollected: integer("articles_collected").notNull().default(0),
    errorMessage: text("error_message"),
    startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
    completedAt: integer("completed_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    mediaSourceIdx: index("idx_crawl_logs_media_source").on(
      table.mediaSourceId
    ),
    statusIdx: index("idx_crawl_logs_status").on(table.status),
  })
);

// ユーザーテーブル (Phase 2)
export const users = sqliteTable(
  "user",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull().unique(),
    emailVerified: integer("emailVerified", { mode: "boolean" })
      .notNull()
      .default(false),
    name: text("name"),
    image: text("image"),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updatedAt", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => ({
    emailIdx: index("idx_users_email").on(table.email),
  })
);

// Better Auth - セッションテーブル
export const sessions = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

// Better Auth - アカウントテーブル (ソーシャルログイン用)
export const accounts = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refreshTokenExpiresAt", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

// Better Auth - 検証テーブル (メール認証用)
export const verifications = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

// お気に入りテーブル (Phase 2 Week 2)
// URLベースで保存（DBに記事を保存しないため）
export const favorites = sqliteTable(
  "favorites",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    articleUrl: text("article_url").notNull(),
    articleTitle: text("article_title"),
    mediaSourceName: text("media_source_name"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    userIdx: index("idx_favorites_user").on(table.userId),
    urlIdx: index("idx_favorites_url").on(table.articleUrl),
    // 同じユーザーが同じURLを複数回お気に入りに追加できないようにUNIQUE制約
    userUrlUnique: unique("idx_favorites_user_url_unique").on(
      table.userId,
      table.articleUrl
    ),
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

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type InsertAccount = typeof accounts.$inferInsert;

export type Verification = typeof verifications.$inferSelect;
export type InsertVerification = typeof verifications.$inferInsert;

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;
