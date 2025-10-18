import type { ZennArticle } from '@/types';
import type { InsertArticle } from '@/db';
import { calculateTrendScore } from '@/lib/utils';

const ZENN_API_BASE = 'https://zenn.dev/api';

/**
 * Zenn API クライアント
 */
export class ZennClient {
  /**
   * 記事一覧を取得
   */
  async fetchArticles(params: {
    order?: 'latest' | 'daily' | 'weekly' | 'monthly';
    count?: number;
  } = {}): Promise<ZennArticle[]> {
    const { order = 'daily', count = 50 } = params;

    const url = new URL(`${ZENN_API_BASE}/articles`);
    url.searchParams.set('order', order);
    url.searchParams.set('count', count.toString());

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Zenn API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.articles || [];
  }

  /**
   * Zenn記事を共通Article型に変換
   */
  mapToArticle(article: ZennArticle, mediaSourceId: number): Omit<InsertArticle, 'id'> {
    const publishedAt = new Date(article.published_at);

    return {
      externalId: String(article.id),
      mediaSourceId,
      title: article.title,
      url: `https://zenn.dev${article.path}`,
      description: `${article.emoji} ${article.title}`,
      body: null, // Zenn APIには本文が含まれない
      thumbnailUrl: null,
      likesCount: article.liked_count,
      bookmarksCount: 0, // Zennにはブックマーク数がない
      commentsCount: 0,
      viewsCount: 0,
      trendScore: calculateTrendScore({
        likes_count: article.liked_count,
        bookmarks_count: 0,
        comments_count: 0,
        published_at: publishedAt,
      }),
      authorName: article.user.name || article.user.username,
      authorId: article.user.username,
      authorProfileUrl: `https://zenn.dev/${article.user.username}`,
      authorAvatarUrl: article.user.avatar_small_url,
      publishedAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * タグは記事詳細を取得しないと取れないため、空配列を返す
   * 必要に応じて後で記事詳細APIを実装
   */
  extractTags(_article: ZennArticle): string[] {
    return [];
  }
}
