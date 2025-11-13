import { db, mediaSources } from '@/db';
import { eq } from 'drizzle-orm';
import { QiitaClient } from '@/lib/api/qiita';
import { ZennClient } from '@/lib/api/zenn';
import { calculateTrendScore, getStartDateByPeriod } from '@/lib/utils';
import type { MediaSource } from '@/db';

export interface LiveArticle {
  id: string; // URLをIDとして使用
  externalId: string;
  mediaSource: MediaSource;
  title: string;
  url: string;
  description: string | null;
  thumbnailUrl: string | null;
  likesCount: number;
  bookmarksCount: number;
  commentsCount: number;
  viewsCount: number;
  trendScore: number;
  authorName: string;
  authorId: string;
  authorProfileUrl: string | null;
  authorAvatarUrl: string | null;
  publishedAt: Date;
  tags: string[];
}

export interface GetLiveArticlesParams {
  page?: number;
  limit?: number;
  mediaNames?: string[];
  period?: 'day' | '3days' | 'week' | 'month' | 'all';
  tagNames?: string[];
  search?: string;
  sort?: 'trend' | 'likes' | 'bookmarks' | 'latest';
}

export interface GetLiveArticlesResult {
  articles: LiveArticle[];
  total: number;
  totalPages: number;
}

/**
 * 外部APIから記事を取得（DBに保存しない）
 */
export async function getLiveArticles(
  params: GetLiveArticlesParams = {}
): Promise<GetLiveArticlesResult> {
  const {
    page = 1,
    limit = 12,
    mediaNames = [],
    period = '3days',
    tagNames = [],
    search = '',
    sort = 'trend',
  } = params;

  // アクティブなメディアソースを取得
  let sources = await db
    .select()
    .from(mediaSources)
    .where(eq(mediaSources.isActive, true));

  // メディアフィルター
  if (mediaNames.length > 0) {
    sources = sources.filter((s) => mediaNames.includes(s.name));
  }

  // 各メディアソースから記事を取得
  const allArticles: LiveArticle[] = [];
  const fetchPromises = sources.map((source) => fetchArticlesFromSource(source));
  const results = await Promise.allSettled(fetchPromises);

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allArticles.push(...result.value);
    }
  }

  // 期間フィルター
  let filteredArticles = allArticles;
  if (period !== 'all') {
    const startDate = getStartDateByPeriod(period);
    if (startDate) {
      filteredArticles = filteredArticles.filter(
        (article) => article.publishedAt >= startDate
      );
    }
  }

  // 検索フィルター
  if (search) {
    const searchLower = search.toLowerCase();
    filteredArticles = filteredArticles.filter(
      (article) =>
        article.title.toLowerCase().includes(searchLower) ||
        (article.description && article.description.toLowerCase().includes(searchLower))
    );
  }

  // タグフィルター
  if (tagNames.length > 0) {
    filteredArticles = filteredArticles.filter((article) =>
      tagNames.some((tagName) =>
        article.tags.some((tag) => tag.toLowerCase() === tagName.toLowerCase())
      )
    );
  }

  // ソート
  filteredArticles.sort((a, b) => {
    switch (sort) {
      case 'likes':
        return b.likesCount - a.likesCount;
      case 'bookmarks':
        return b.bookmarksCount - a.bookmarksCount;
      case 'latest':
        return b.publishedAt.getTime() - a.publishedAt.getTime();
      case 'trend':
      default:
        return b.trendScore - a.trendScore;
    }
  });

  // ページネーション
  const total = filteredArticles.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const paginatedArticles = filteredArticles.slice(offset, offset + limit);

  return {
    articles: paginatedArticles,
    total,
    totalPages,
  };
}

/**
 * 特定のメディアソースから記事を取得
 */
async function fetchArticlesFromSource(source: MediaSource): Promise<LiveArticle[]> {
  try {
    if (source.name === 'qiita') {
      return await fetchFromQiita(source);
    } else if (source.name === 'zenn') {
      return await fetchFromZenn(source);
    }
    return [];
  } catch (error) {
    console.error(`Error fetching from ${source.displayName}:`, error);
    return [];
  }
}

/**
 * Qiitaから記事を取得
 */
async function fetchFromQiita(source: MediaSource): Promise<LiveArticle[]> {
  if (!process.env.QIITA_ACCESS_TOKEN) {
    return [];
  }

  const client = new QiitaClient(process.env.QIITA_ACCESS_TOKEN);
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const query = `created:>${oneWeekAgo.toISOString().split('T')[0]} stocks:>10`;

  const items = await client.fetchItems({ query, perPage: 100 });

  return items.map((item) => {
    const publishedAt = new Date(item.created_at);
    const tags = client.extractTags(item);

    return {
      id: item.url, // URLをIDとして使用
      externalId: item.id,
      mediaSource: source,
      title: item.title,
      url: item.url,
      description: item.body.substring(0, 200),
      thumbnailUrl: null,
      likesCount: item.likes_count,
      bookmarksCount: item.stocks_count,
      commentsCount: item.comments_count,
      viewsCount: 0,
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
      tags,
    };
  });
}

/**
 * Zennから記事を取得
 */
async function fetchFromZenn(source: MediaSource): Promise<LiveArticle[]> {
  const client = new ZennClient();
  const articles = await client.fetchArticles({ order: 'daily', count: 50 });

  return articles.map((article) => {
    const publishedAt = new Date(article.published_at);

    return {
      id: `https://zenn.dev${article.path}`, // URLをIDとして使用
      externalId: String(article.id),
      mediaSource: source,
      title: article.title,
      url: `https://zenn.dev${article.path}`,
      description: `${article.emoji} ${article.title}`,
      thumbnailUrl: null,
      likesCount: article.liked_count,
      bookmarksCount: 0,
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
      tags: [], // Zenn APIにはタグ情報が含まれない
    };
  });
}

