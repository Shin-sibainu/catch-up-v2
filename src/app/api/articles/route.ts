import { NextRequest, NextResponse } from 'next/server';
import { getLiveArticles } from '@/lib/dal/articles-live';
import type { GetArticlesResponse } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 300; // 5分ごとに再検証（外部APIから取得するため短めに）

// URLから一意の数値IDを生成する関数
function generateIdFromUrl(url: string): number {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * 記事一覧取得API
 * GET /api/articles
 * 外部APIから直接取得（DBに保存しない）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // クエリパラメータの取得
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const mediaNames = searchParams.get('media')?.split(',').filter(Boolean) || [];
    const period = (searchParams.get('period') || '3days') as 'day' | '3days' | 'week' | 'month' | 'all';
    const tagNames = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const sort = (searchParams.get('sort') || 'trend') as 'trend' | 'likes' | 'bookmarks' | 'latest';
    const search = searchParams.get('search') || '';

    // 外部APIから記事を取得
    const result = await getLiveArticles({
      page,
      limit,
      mediaNames,
      period,
      tagNames,
      search,
      sort,
    });

    // LiveArticleをArticleWithTags形式に変換
    const articles = result.articles.map((article, index) => {
      // URLから一意のIDを生成（重複を避けるため、インデックスも使用）
      const urlHash = generateIdFromUrl(article.url);
      const uniqueId = urlHash + index * 1000000; // インデックスを加算して重複を回避
      
      return {
        id: uniqueId,
        externalId: article.externalId,
        mediaSourceId: article.mediaSource.id,
        title: article.title,
        url: article.url,
        description: article.description,
        body: null,
        thumbnailUrl: article.thumbnailUrl,
        likesCount: article.likesCount,
        bookmarksCount: article.bookmarksCount,
        commentsCount: article.commentsCount,
        viewsCount: article.viewsCount,
        trendScore: article.trendScore,
        authorName: article.authorName,
        authorId: article.authorId,
        authorProfileUrl: article.authorProfileUrl,
        authorAvatarUrl: article.authorAvatarUrl,
        publishedAt: article.publishedAt,
        createdAt: article.publishedAt,
        updatedAt: article.publishedAt,
        mediaSource: article.mediaSource,
        tags: article.tags.map((tagName, tagIndex) => ({
          id: generateIdFromUrl(tagName) + tagIndex * 10000,
          name: tagName,
          displayName: tagName,
          slug: tagName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
          color: null,
          iconUrl: null,
          articleCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      };
    });

    const response: GetArticlesResponse = {
      articles,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
