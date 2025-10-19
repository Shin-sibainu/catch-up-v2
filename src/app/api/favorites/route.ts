import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { addFavorite, removeFavorite, getUserFavorites } from '@/lib/dal/favorites';

export const runtime = 'edge';

/**
 * GET /api/favorites - ユーザーのお気に入り一覧を取得
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const result = await getUserFavorites(session.user.id, { page, limit });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
  }
}

/**
 * POST /api/favorites - お気に入りを追加
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { articleId } = body;

    if (!articleId || typeof articleId !== 'number') {
      return NextResponse.json({ error: 'Invalid articleId' }, { status: 400 });
    }

    const result = await addFavorite(session.user.id, articleId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding favorite:', error);
    return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 });
  }
}

/**
 * DELETE /api/favorites - お気に入りを削除
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const articleId = parseInt(searchParams.get('articleId') || '0');

    if (!articleId) {
      return NextResponse.json({ error: 'Invalid articleId' }, { status: 400 });
    }

    await removeFavorite(session.user.id, articleId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 });
  }
}
