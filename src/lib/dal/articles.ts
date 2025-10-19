import { db, articles, mediaSources, tags, articleTags } from '@/db';
import { eq, and, or, like, inArray, desc, gte } from 'drizzle-orm';
import type { ArticleWithTags } from '@/types';

export interface GetArticlesParams {
  page?: number;
  limit?: number;
  mediaNames?: string[];
  period?: 'day' | 'week' | 'month' | 'all';
  tagNames?: string[];
  search?: string;
  sort?: 'trend' | 'likes' | 'bookmarks' | 'latest';
}

export interface GetArticlesResult {
  articles: ArticleWithTags[];
  total: number;
  totalPages: number;
}

/**
 * 記事を取得する（フィルター、ページネーション、ソート対応）
 */
export async function getArticles(params: GetArticlesParams = {}): Promise<GetArticlesResult> {
  const {
    page = 1,
    limit = 12,
    mediaNames = [],
    period = 'all',
    tagNames = [],
    search = '',
    sort = 'trend',
  } = params;

  const offset = (page - 1) * limit;
  const conditions = [eq(mediaSources.isActive, true)];

  // メディアフィルター
  if (mediaNames.length > 0) {
    conditions.push(inArray(mediaSources.name, mediaNames));
  }

  // 期間フィルター
  if (period !== 'all') {
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    conditions.push(gte(articles.publishedAt, startDate));
  }

  // 検索フィルター
  if (search) {
    conditions.push(
      or(
        like(articles.title, `%${search}%`),
        like(articles.description, `%${search}%`)
      )!
    );
  }

  // タグフィルター適用
  if (tagNames.length > 0) {
    const tagRecords = await db
      .select()
      .from(tags)
      .where(inArray(tags.name, tagNames));

    const tagIds = tagRecords.map((t) => t.id);

    if (tagIds.length > 0) {
      const articleIds = await db
        .selectDistinct({ articleId: articleTags.articleId })
        .from(articleTags)
        .where(inArray(articleTags.tagId, tagIds));

      const articleIdList = articleIds.map((a) => a.articleId);

      if (articleIdList.length > 0) {
        conditions.push(inArray(articles.id, articleIdList));
      } else {
        // タグに一致する記事がない場合は空結果を返す
        return { articles: [], total: 0, totalPages: 0 };
      }
    }
  }

  // ソート順
  let orderByClause;
  switch (sort) {
    case 'likes':
      orderByClause = desc(articles.likesCount);
      break;
    case 'bookmarks':
      orderByClause = desc(articles.bookmarksCount);
      break;
    case 'latest':
      orderByClause = desc(articles.publishedAt);
      break;
    case 'trend':
    default:
      orderByClause = desc(articles.trendScore);
      break;
  }

  // 再構築したクエリ
  const result = await db
    .select({
      article: articles,
      mediaSource: mediaSources,
    })
    .from(articles)
    .innerJoin(mediaSources, eq(articles.mediaSourceId, mediaSources.id))
    .where(and(...conditions))
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset);

  // 総件数取得
  const countResult = await db
    .select({
      article: articles,
      mediaSource: mediaSources,
    })
    .from(articles)
    .innerJoin(mediaSources, eq(articles.mediaSourceId, mediaSources.id))
    .where(and(...conditions));

  const total = countResult.length;
  const totalPages = Math.ceil(total / limit);

  // タグ情報を取得
  const articlesWithTags: ArticleWithTags[] = await Promise.all(
    result.map(async ({ article, mediaSource }) => {
      const articleTagsData = await db
        .select({ tag: tags })
        .from(articleTags)
        .innerJoin(tags, eq(articleTags.tagId, tags.id))
        .where(eq(articleTags.articleId, article.id));

      return {
        ...article,
        mediaSource,
        tags: articleTagsData.map((t) => t.tag),
      };
    })
  );

  return {
    articles: articlesWithTags,
    total,
    totalPages,
  };
}

/**
 * 特定の記事をIDで取得
 */
export async function getArticleById(id: number): Promise<ArticleWithTags | null> {
  const result = await db
    .select({
      article: articles,
      mediaSource: mediaSources,
    })
    .from(articles)
    .innerJoin(mediaSources, eq(articles.mediaSourceId, mediaSources.id))
    .where(eq(articles.id, id))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const { article, mediaSource } = result[0];

  const articleTagsData = await db
    .select({ tag: tags })
    .from(articleTags)
    .innerJoin(tags, eq(articleTags.tagId, tags.id))
    .where(eq(articleTags.articleId, article.id));

  return {
    ...article,
    mediaSource,
    tags: articleTagsData.map((t) => t.tag),
  };
}

/**
 * トレンドスコア順で記事を取得（初期表示用）
 */
export async function getTrendingArticles(limit = 12): Promise<ArticleWithTags[]> {
  const result = await getArticles({ limit, sort: 'trend' });
  return result.articles;
}
