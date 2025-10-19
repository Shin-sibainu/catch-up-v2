import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { checkFavorites } from '@/lib/dal/favorites';

export const runtime = 'edge';

/**
 * GET /api/favorites/check?ids=1,2,3 - 複数の記事のお気に入り状態を一括チェック
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const idsParam = searchParams.get('ids');

    if (!idsParam) {
      return NextResponse.json({ error: 'Missing ids parameter' }, { status: 400 });
    }

    const articleIds = idsParam.split(',').map((id) => parseInt(id)).filter((id) => !isNaN(id));

    if (articleIds.length === 0) {
      return NextResponse.json({});
    }

    const favorites = await checkFavorites(session.user.id, articleIds);

    return NextResponse.json(favorites);
  } catch (error) {
    console.error('Error checking favorites:', error);
    return NextResponse.json({ error: 'Failed to check favorites' }, { status: 500 });
  }
}
