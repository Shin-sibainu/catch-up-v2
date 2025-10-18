import { NextRequest, NextResponse } from 'next/server';
import { db, articles, tags, articleTags, mediaSources } from '@/db';
import { eq } from 'drizzle-orm';
import type { ArticleWithTags } from '@/types';

export const runtime = 'nodejs';

/**
 * 記事詳細取得API
 * GET /api/articles/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const articleId = parseInt(params.id, 10);

    if (isNaN(articleId)) {
      return NextResponse.json(
        { error: 'Invalid article ID' },
        { status: 400 }
      );
    }

    // 記事を取得
    const [article] = await db
      .select()
      .from(articles)
      .where(eq(articles.id, articleId))
      .limit(1);

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

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

    const articleWithTags: ArticleWithTags = {
      ...article,
      tags: articleTagList.map((at) => at.tag),
      mediaSource,
    };

    return NextResponse.json(articleWithTags);
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}
