import { NextRequest, NextResponse } from 'next/server';
import { db, articles, tags, articleTags, mediaSources } from '@/db';
import { eq, and, or, like, inArray, sql, desc, gte } from 'drizzle-orm';
import type { GetArticlesResponse, ArticleWithTags } from '@/types';

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
    const mediaFilter = searchParams.get('media')?.split(',').filter(Boolean) || [];
    const period = (searchParams.get('period') || 'all') as 'day' | 'week' | 'month' | 'all';
    const tagFilter = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const sort = (searchParams.get('sort') || 'trend') as 'trend' | 'likes' | 'bookmarks' | 'latest';
    const search = searchParams.get('search') || '';

    // ページネーション計算
    const offset = (page - 1) * limit;

    // フィルター条件を構築
    const conditions = [];

    // メディアソースフィルター
    if (mediaFilter.length > 0) {
      const mediaSourceIds = await db
        .select({ id: mediaSources.id })
        .from(mediaSources)
        .where(inArray(mediaSources.name, mediaFilter));

      if (mediaSourceIds.length > 0) {
        conditions.push(
          inArray(
            articles.mediaSourceId,
            mediaSourceIds.map((m) => m.id)
          )
        );
      }
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

    // タグフィルター（記事とタグの中間テーブルを使う）
    let articleIds: number[] | null = null;
    if (tagFilter.length > 0) {
      const tagIds = await db
        .select({ id: tags.id })
        .from(tags)
        .where(inArray(tags.slug, tagFilter));

      if (tagIds.length > 0) {
        const articleTagRecords = await db
          .select({ articleId: articleTags.articleId })
          .from(articleTags)
          .where(inArray(articleTags.tagId, tagIds.map((t) => t.id)));

        articleIds = articleTagRecords.map((at) => at.articleId);

        if (articleIds.length > 0) {
          conditions.push(inArray(articles.id, articleIds));
        } else {
          // タグに該当する記事がない場合は空配列を返す
          return NextResponse.json({
            articles: [],
            pagination: {
              page,
              limit,
              total: 0,
              totalPages: 0,
            },
          });
        }
      }
    }

    // ソート条件
    let orderBy;
    switch (sort) {
      case 'likes':
        orderBy = desc(articles.likesCount);
        break;
      case 'bookmarks':
        orderBy = desc(articles.bookmarksCount);
        break;
      case 'latest':
        orderBy = desc(articles.publishedAt);
        break;
      case 'trend':
      default:
        orderBy = desc(articles.trendScore);
        break;
    }

    // WHERE条件を結合
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // 記事の総数を取得（ページネーション用）
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(articles)
      .where(whereClause);

    const totalPages = Math.ceil(count / limit);

    // 記事一覧を取得
    const articleList = await db
      .select()
      .from(articles)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // 各記事のタグとメディアソースを取得
    const articlesWithTags: ArticleWithTags[] = await Promise.all(
      articleList.map(async (article) => {
        // タグを取得
        const articleTagList = await db
          .select({ tag: tags })
          .from(articleTags)
          .innerJoin(tags, eq(articleTags.tagId, tags.id))
          .where(eq(articleTags.articleId, article.id));

        // メディアソースを取得
        const [mediaSource] = await db
          .select()
          .from(mediaSources)
          .where(eq(mediaSources.id, article.mediaSourceId))
          .limit(1);

        return {
          ...article,
          tags: articleTagList.map((at) => at.tag),
          mediaSource,
        };
      })
    );

    const response: GetArticlesResponse = {
      articles: articlesWithTags,
      pagination: {
        page,
        limit,
        total: count,
        totalPages,
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
