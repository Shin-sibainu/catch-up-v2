import { db, favorites } from "@/db";
import { eq, and, desc, inArray } from "drizzle-orm";

export interface FavoriteArticle {
  url: string;
  title: string;
  mediaSourceName: string;
  favoritedAt: Date;
}

/**
 * お気に入りを追加
 */
export async function addFavorite(
  userId: string,
  articleUrl: string,
  articleTitle?: string,
  mediaSourceName?: string
) {
  try {
    await db.insert(favorites).values({
      userId,
      articleUrl,
      articleTitle: articleTitle || null,
      mediaSourceName: mediaSourceName || null,
      createdAt: new Date(),
    });
    return { success: true };
  } catch (error) {
    // UNIQUE制約違反の場合は既にお気に入り済み
    return { success: false, error: "Already favorited" };
  }
}

/**
 * お気に入りを削除
 */
export async function removeFavorite(userId: string, articleUrl: string) {
  await db
    .delete(favorites)
    .where(
      and(eq(favorites.userId, userId), eq(favorites.articleUrl, articleUrl))
    );
  return { success: true };
}

/**
 * ユーザーのお気に入り記事一覧を取得
 */
export async function getUserFavorites(
  userId: string,
  options: { page?: number; limit?: number } = {}
): Promise<{ articles: FavoriteArticle[]; total: number; totalPages: number }> {
  const { page = 1, limit = 12 } = options;
  const offset = (page - 1) * limit;

  // お気に入り記事を取得
  const result = await db
    .select({
      url: favorites.articleUrl,
      title: favorites.articleTitle,
      mediaSourceName: favorites.mediaSourceName,
      favoritedAt: favorites.createdAt,
    })
    .from(favorites)
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

  const articles: FavoriteArticle[] = result.map((r) => ({
    url: r.url,
    title: r.title || "",
    mediaSourceName: r.mediaSourceName || "",
    favoritedAt: r.favoritedAt,
  }));

  return {
    articles,
    total,
    totalPages,
  };
}

/**
 * 特定の記事がお気に入りかどうかをチェック
 */
export async function isFavorited(
  userId: string,
  articleUrl: string
): Promise<boolean> {
  const result = await db
    .select()
    .from(favorites)
    .where(
      and(eq(favorites.userId, userId), eq(favorites.articleUrl, articleUrl))
    )
    .limit(1);

  return result.length > 0;
}

/**
 * 複数の記事のお気に入り状態を一括チェック
 */
export async function checkFavorites(
  userId: string,
  articleUrls: string[]
): Promise<Record<string, boolean>> {
  if (articleUrls.length === 0) {
    return {};
  }

  const result = await db
    .select({ articleUrl: favorites.articleUrl })
    .from(favorites)
    .where(
      and(
        eq(favorites.userId, userId),
        inArray(favorites.articleUrl, articleUrls)
      )
    );

  const favoritedUrls = new Set(result.map((r) => r.articleUrl));

  return articleUrls.reduce((acc, url) => {
    acc[url] = favoritedUrls.has(url);
    return acc;
  }, {} as Record<string, boolean>);
}
