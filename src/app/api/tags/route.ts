import { NextRequest, NextResponse } from 'next/server';
import { db, tags, articleTags } from '@/db';
import { eq, sql, desc } from 'drizzle-orm';

export const runtime = 'nodejs';

/**
 * タグ一覧取得API
 * GET /api/tags
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const sortBy = searchParams.get('sort') || 'count'; // 'count' | 'name'

    // タグごとの記事数を計算して取得
    const tagList = await db
      .select({
        id: tags.id,
        name: tags.name,
        displayName: tags.displayName,
        slug: tags.slug,
        articleCount: sql<number>`count(${articleTags.articleId})`,
        createdAt: tags.createdAt,
        updatedAt: tags.updatedAt,
      })
      .from(tags)
      .leftJoin(articleTags, eq(tags.id, articleTags.tagId))
      .groupBy(tags.id)
      .orderBy(
        sortBy === 'name'
          ? tags.name
          : desc(sql<number>`count(${articleTags.articleId})`)
      )
      .limit(limit);

    // articleCountを更新（実際のカウントを反映）
    const tagsWithCount = tagList.map((tag) => ({
      ...tag,
      articleCount: Number(tag.articleCount),
    }));

    return NextResponse.json(tagsWithCount);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}
