import { NextRequest, NextResponse } from 'next/server';
import { getLiveArticles } from '@/lib/dal/articles-live';
import { analyzeTrends } from '@/lib/ai/gemini';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 1800; // 30分ごとに再検証

/**
 * トレンド分析API
 * GET /api/trends/analyze
 * 現在の記事データを分析してトレンドを抽出
 */
export async function GET(request: NextRequest) {
  try {
    // 環境変数のチェック
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // 最新の記事を取得（分析用に多めに取得、期間も長めに）
    const result = await getLiveArticles({
      limit: 100,
      sort: 'trend',
      period: 'week', // より多くのデータを取得するため1週間に拡張
    });

    if (result.articles.length === 0) {
      return NextResponse.json({
        summary: '分析対象の記事がありません。',
        emergingTopics: [],
        youtubeRecommendations: [],
        analyzedAt: new Date(),
      });
    }

    // 記事データを分析用の形式に変換
    const articlesForAnalysis = result.articles.map((article) => ({
      title: article.title,
      description: article.description,
      tags: article.tags,
      trendScore: article.trendScore,
      likesCount: article.likesCount,
      bookmarksCount: article.bookmarksCount,
      url: article.url,
      mediaSourceName: article.mediaSource.name,
    }));

    // Gemini APIでトレンド分析
    const analysis = await analyzeTrends(articlesForAnalysis);

    // 分析に使用した記事の出典情報を追加（上位20件を表示）
    const sourceArticles = result.articles
      .slice(0, 20)
      .map((article) => ({
        title: article.title,
        url: article.url,
        mediaSourceName: article.mediaSource.name,
        likesCount: article.likesCount,
        bookmarksCount: article.bookmarksCount,
        trendScore: article.trendScore,
      }));

    return NextResponse.json({
      ...analysis,
      sourceArticles,
    });
  } catch (error) {
    console.error('Error analyzing trends:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // エラーの詳細を返す（開発時に有用）
    return NextResponse.json(
      {
        error: 'Failed to analyze trends',
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

