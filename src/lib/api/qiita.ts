import type { QiitaItem } from '@/types';
import type { InsertArticle } from '@/db';
import { calculateTrendScore } from '@/lib/utils';

const QIITA_API_BASE = 'https://qiita.com/api/v2';

/**
 * Qiita API クライアント
 */
export class QiitaClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * 記事一覧を取得
   */
  async fetchItems(params: {
    page?: number;
    perPage?: number;
    query?: string;
  } = {}): Promise<QiitaItem[]> {
    const { page = 1, perPage = 100, query = 'stocks:>10' } = params;

    const url = new URL(`${QIITA_API_BASE}/items`);
    url.searchParams.set('page', page.toString());
    url.searchParams.set('per_page', perPage.toString());
    if (query) {
      url.searchParams.set('query', query);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Qiita API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Qiita記事を共通Article型に変換
   */
  mapToArticle(item: QiitaItem, mediaSourceId: number): Omit<InsertArticle, 'id'> {
    const publishedAt = new Date(item.created_at);

    return {
      externalId: item.id,
      mediaSourceId,
      title: item.title,
      url: item.url,
      description: item.body.substring(0, 200),
      body: item.body,
      thumbnailUrl: null, // Qiitaにはサムネイルなし
      likesCount: item.likes_count,
      bookmarksCount: item.stocks_count,
      commentsCount: item.comments_count,
      viewsCount: 0, // Qiita APIには閲覧数がない
      trendScore: calculateTrendScore({
        likes_count: item.likes_count,
        bookmarks_count: item.stocks_count,
        comments_count: item.comments_count,
        published_at: publishedAt,
      }),
      authorName: item.user.name || item.user.id,
      authorId: item.user.id,
      authorProfileUrl: `https://qiita.com/${item.user.id}`,
      authorAvatarUrl: item.user.profile_image_url,
      publishedAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * タグ名のリストを抽出
   */
  extractTags(item: QiitaItem): string[] {
    return item.tags.map((tag) => tag.name);
  }
}
