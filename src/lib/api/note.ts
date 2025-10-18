import type { NoteArticle } from '@/types';
import type { InsertArticle } from '@/db';
import { calculateTrendScore } from '@/lib/utils';

const NOTE_API_BASE = 'https://note.com/api/v3';

/**
 * note.com API クライアント（非公式API）
 * ⚠️ 非公式APIのため、仕様変更の可能性があります
 */
export class NoteClient {
  /**
   * キーワード検索で記事を取得
   * 技術系のキーワードで検索
   */
  async fetchArticles(params: {
    keywords?: string[];
    size?: number;
    start?: number;
  } = {}): Promise<NoteArticle[]> {
    const {
      keywords = ['プログラミング', 'エンジニア', 'Web開発', 'React', 'Next.js', 'TypeScript'],
      size = 50,
      start = 0,
    } = params;

    const allArticles: NoteArticle[] = [];
    const seenIds = new Set<string>();

    // 複数のキーワードで検索して結果を集約
    for (const keyword of keywords.slice(0, 6)) {
      // 最大6つのキーワード
      try {
        const url = new URL(`${NOTE_API_BASE}/searches`);
        url.searchParams.set('q', keyword);
        url.searchParams.set('context', 'note');
        url.searchParams.set('size', Math.min(size, 50).toString()); // 1キーワードあたり最大50件
        url.searchParams.set('start', start.toString());

        const response = await fetch(url.toString(), {
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          console.error(`Note API error for keyword "${keyword}": ${response.status}`);
          continue; // エラーの場合は次のキーワードへ
        }

        const data = await response.json();
        const articles = data.data?.notes?.contents || [];

        // 除外する著者のリスト
        const blockedAuthors = ['enginner_skill'];

        // 重複を除いて追加（無料記事のみ、ブロックされた著者を除外）
        for (const article of articles) {
          const isFree = article.price === 0 || article.price === undefined;
          const isBlocked = blockedAuthors.includes(article.user?.urlname || '');

          if (article.id && !seenIds.has(article.id) && isFree && !isBlocked) {
            seenIds.add(article.id);
            allArticles.push(article);
          }
        }

        // レート制限対策: 少し待機
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error fetching articles for keyword "${keyword}":`, error);
      }
    }

    return allArticles;
  }

  /**
   * note記事を共通Article型に変換
   */
  mapToArticle(article: NoteArticle, mediaSourceId: number): Omit<InsertArticle, 'id'> {
    const publishedAt = new Date(article.publish_at || article.created_at || Date.now());

    // いいね数がない場合は0、URLを生成
    const likesCount = article.like_count || 0;
    const url = article.noteUrl || `https://note.com/${article.user?.urlname || 'unknown'}/n/${article.key || article.id}`;

    return {
      externalId: String(article.id),
      mediaSourceId,
      title: article.name || '無題',
      url,
      description: article.description || article.name?.substring(0, 200) || '',
      body: null, // note APIには本文が含まれない
      thumbnailUrl: article.eyecatch || null,
      likesCount,
      bookmarksCount: 0, // noteにはブックマーク数がない
      commentsCount: article.comment_count || 0,
      viewsCount: 0,
      trendScore: calculateTrendScore({
        likes_count: likesCount,
        bookmarks_count: 0,
        comments_count: article.comment_count || 0,
        published_at: publishedAt,
      }),
      authorName: article.user?.nickname || article.user?.name || '匿名',
      authorId: article.user?.urlname || String(article.user?.id || article.id),
      authorProfileUrl: article.user?.urlname
        ? `https://note.com/${article.user.urlname}`
        : '',
      authorAvatarUrl: article.user?.user_profile_image_path || null,
      publishedAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * ハッシュタグを抽出
   * noteのAPIレスポンスにハッシュタグ情報が含まれる場合に使用
   */
  extractTags(article: NoteArticle): string[] {
    // ハッシュタグ情報がある場合はそれを使用
    if (article.hashtags && Array.isArray(article.hashtags)) {
      return article.hashtags.map((tag) => (typeof tag === 'string' ? tag : tag.name || ''));
    }
    return [];
  }
}
