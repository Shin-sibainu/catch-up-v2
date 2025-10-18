import { NextRequest, NextResponse } from 'next/server';
import { db, mediaSources } from '@/db';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

/**
 * メディアソース一覧取得API
 * GET /api/media-sources
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const sources = activeOnly
      ? await db.select().from(mediaSources).where(eq(mediaSources.isActive, true))
      : await db.select().from(mediaSources);

    return NextResponse.json(sources);
  } catch (error) {
    console.error('Error fetching media sources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media sources' },
      { status: 500 }
    );
  }
}
