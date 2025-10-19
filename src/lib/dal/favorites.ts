import { db, favorites, articles, mediaSources, tags, articleTags } from '@/db';
import { eq, and, desc, inArray } from 'drizzle-orm';
import type { ArticleWithTags } from '@/types';

/**
 * お気に入りを追加
 */
export async function addFavorite(userId: string, articleId: number) {
  try {
    await db.insert(favorites).values({
      userId,
      articleId,
      createdAt: new Date(),
    });
    return { success: true };
  } catch (error) {
    // UNIQUE制約違反の場合は既にお気に入り済み
    return { success: false, error: 'Already favorited' };
  }
}

/**
 * お気に入りを削除
 */
export async function removeFavorite(userId: string, articleId: number) {
  await db
    .delete(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.articleId, articleId)));
  return { success: true };
}

/**
 * ユーザーのお気に入り記事一覧を取得
 */
export async function getUserFavorites(
  userId: string,
  options: { page?: number; limit?: number } = {}
): Promise<{ articles: ArticleWithTags[]; total: number; totalPages: number }> {
  const { page = 1, limit = 12 } = options;
  const offset = (page - 1) * limit;

  // お気に入り記事を取得
  const result = await db
    .select({
      article: articles,
      mediaSource: mediaSources,
      favoritedAt: favorites.createdAt,
    })
    .from(favorites)
    .innerJoin(articles, eq(favorites.articleId, articles.id))
    .innerJoin(mediaSources, eq(articles.mediaSourceId, mediaSources.id))
    .where(eq(favorites.userId, userId))
    .orderBy(desc(favorites.createdAt))
    .limit(limit)
    .offset(offset);

  // 総件数を取得
  const totalResult = await db
    .select({ count: favorites.id })
    .from(favorites)
    .where(eq(favorites.userId, userId));

  const total = totalResult.length;
  const totalPages = Math.ceil(total / limit);

  // タグ情報を一括取得（N+1問題回避）
  const articleIds = result.map(({ article }) => article.id);
  let allArticleTagsData: Array<{ articleId: number; tag: typeof tags.$inferSelect }> = [];

  if (articleIds.length > 0) {
    allArticleTagsData = await db
      .select({
        articleId: articleTags.articleId,
        tag: tags,
      })
      .from(articleTags)
      .innerJoin(tags, eq(articleTags.tagId, tags.id))
      .where(inArray(articleTags.articleId, articleIds));
  }

  // タグをarticleIdでグループ化
  const tagsByArticleId = allArticleTagsData.reduce((acc, { articleId, tag }) => {
    if (!acc[articleId]) {
      acc[articleId] = [];
    }
    acc[articleId].push(tag);
    return acc;
  }, {} as Record<number, Array<typeof tags.$inferSelect>>);

  // 記事にタグを結合
  const articlesWithTags: ArticleWithTags[] = result.map(({ article, mediaSource }) => ({
    ...article,
    mediaSource,
    tags: tagsByArticleId[article.id] || [],
  }));

  return {
    articles: articlesWithTags,
    total,
    totalPages,
  };
}

/**
 * 特定の記事がお気に入りかどうかをチェック
 */
export async function isFavorited(userId: string, articleId: number): Promise<boolean> {
  const result = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.articleId, articleId)))
    .limit(1);

  return result.length > 0;
}

/**
 * 複数の記事のお気に入り状態を一括チェック
 */
export async function checkFavorites(
  userId: string,
  articleIds: number[]
): Promise<Record<number, boolean>> {
  if (articleIds.length === 0) {
    return {};
  }

  const result = await db
    .select({ articleId: favorites.articleId })
    .from(favorites)
    .where(and(eq(favorites.userId, userId), inArray(favorites.articleId, articleIds)));

  const favoritedIds = new Set(result.map((r) => r.articleId));

  return articleIds.reduce((acc, id) => {
    acc[id] = favoritedIds.has(id);
    return acc;
  }, {} as Record<number, boolean>);
}
