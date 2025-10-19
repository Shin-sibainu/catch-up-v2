import { NextRequest, NextResponse } from 'next/server';
import { getArticles } from '@/lib/dal/articles';
import type { GetArticlesResponse } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1時間ごとに再検証

/**
 * 記事一覧取得API
 * GET /api/articles
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // クエリパラメータの取得
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const mediaNames = searchParams.get('media')?.split(',').filter(Boolean) || [];
    const period = (searchParams.get('period') || 'all') as 'day' | 'week' | 'month' | 'all';
    const tagNames = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const sort = (searchParams.get('sort') || 'trend') as 'trend' | 'likes' | 'bookmarks' | 'latest';
    const search = searchParams.get('search') || '';

    // DALを使って記事を取得
    const result = await getArticles({
      page,
      limit,
      mediaNames,
      period,
      tagNames,
      search,
      sort,
    });

    const response: GetArticlesResponse = {
      articles: result.articles,
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
