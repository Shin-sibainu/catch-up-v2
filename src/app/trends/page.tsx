'use client';

import { useState } from 'react';
import Link from 'next/link';

interface YouTubeRecommendation {
  title: string;
  description: string;
  keywords: string[];
  targetAudience: string;
}

interface SourceArticle {
  title: string;
  url: string;
  mediaSourceName: string;
  likesCount: number;
  bookmarksCount: number;
  trendScore: number;
}

interface TrendAnalysis {
  summary: string;
  emergingTopics: string[];
  youtubeRecommendations: YouTubeRecommendation[];
  sourceArticles: SourceArticle[];
  analyzedAt: string;
}

export default function TrendsPage() {
  const [analysis, setAnalysis] = useState<TrendAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/trends/analyze');
      
      const data = await response.json();
      
      if (!response.ok) {
        // APIからエラーレスポンスが返された場合
        throw new Error(data.message || data.error || 'トレンド分析の取得に失敗しました');
      }

      // エラーフィールドが含まれている場合もエラーとして扱う
      if (data.error) {
        throw new Error(data.message || data.error);
      }

      setAnalysis(data);
    } catch (err) {
      console.error('Error fetching trend analysis:', err);
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました';
      setError(errorMessage);
      // エラーが発生した場合、分析結果をクリア
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-primary">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-2 text-text-secondary transition-colors hover:text-primary"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            ホームに戻る
          </Link>
          <h1 className="text-4xl font-bold text-text-primary">📊 AIトレンド分析</h1>
          <p className="mt-2 text-text-secondary">
            Gemini AIが最新の技術記事を分析して、現在のトレンドを教えてくれます
          </p>
        </div>

        {/* Analysis Button */}
        {!analysis && !loading && (
          <div className="mb-8 rounded-lg glass-card p-8 text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
                <svg
                  className="h-12 w-12 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="mb-4 text-2xl font-bold text-text-primary">トレンド分析を開始</h2>
            <p className="mb-6 text-text-secondary">
              AIが最新の技術記事を分析し、現在のトレンドや注目トピックを抽出します
            </p>
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="rounded-lg bg-gradient-to-r from-primary to-primary/80 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:from-primary/90 hover:to-primary/70 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? '分析中...' : '🚀 トレンドを分析する'}
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mb-8 rounded-lg glass-card p-8">
            <div className="flex flex-col items-center">
              <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <h2 className="mb-2 text-xl font-bold text-text-primary">AIが分析中...</h2>
              <p className="text-text-secondary">最新の技術記事を分析しています。しばらくお待ちください。</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-8 rounded-lg glass-card border-l-4 border-red-500 bg-red-50/10 p-6">
            <div className="mb-2 flex items-center gap-2">
              <svg
                className="h-5 w-5 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="font-semibold text-red-500">エラーが発生しました</h3>
            </div>
            <div className="mb-4 rounded-md bg-red-500/10 p-4">
              <p className="mb-2 font-medium text-red-500">エラーメッセージ:</p>
              <p className="mb-3 text-sm text-text-secondary whitespace-pre-wrap break-words">{error}</p>
              {error.includes('APIキー') && (
                <div className="mt-3 rounded-md bg-yellow-500/10 border border-yellow-500/20 p-3">
                  <p className="mb-2 text-sm font-medium text-yellow-600 dark:text-yellow-400">
                    💡 解決方法:
                  </p>
                  <ol className="ml-4 list-decimal space-y-1 text-xs text-text-secondary">
                    <li>
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Google AI Studio
                      </a>
                      で新しいAPIキーを取得
                    </li>
                    <li>プロジェクトのルートに <code className="bg-background-tertiary px-1 py-0.5 rounded">.env.local</code> ファイルを作成</li>
                    <li><code className="bg-background-tertiary px-1 py-0.5 rounded">GEMINI_API_KEY=あなたのAPIキー</code> を追加</li>
                    <li>開発サーバーを再起動</li>
                  </ol>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAnalyze}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
              >
                再試行
              </button>
              <button
                onClick={() => {
                  setError(null);
                  setAnalysis(null);
                }}
                className="rounded-lg bg-background-tertiary px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-background-tertiary/80"
              >
                クリア
              </button>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && !loading && (
          <div className="space-y-8">
            {/* Summary Card */}
            <div className="rounded-lg glass-card p-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-text-primary">📈 トレンドサマリー</h2>
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="rounded-md bg-background-tertiary px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-background-tertiary/80 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  再分析
                </button>
              </div>
              <p className="text-lg leading-relaxed text-text-secondary">{analysis.summary}</p>
              {analysis.analyzedAt && (
                <p className="mt-4 text-sm text-text-tertiary">
                  分析日時: {new Date(analysis.analyzedAt).toLocaleString('ja-JP')}
                </p>
              )}
            </div>

            {/* Emerging Topics */}
            {analysis.emergingTopics && analysis.emergingTopics.length > 0 && (
              <div className="rounded-lg glass-card p-8">
                <h3 className="mb-6 text-xl font-bold text-text-primary">🚀 新興トピック</h3>
                <div className="flex flex-wrap gap-3">
                  {analysis.emergingTopics.map((topic, index) => (
                    <span
                      key={index}
                      className="rounded-lg bg-gradient-to-r from-primary/20 to-primary/10 px-5 py-2.5 text-sm font-medium text-primary border border-primary/20 hover:from-primary/30 hover:to-primary/20 transition-colors"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* YouTube Recommendations */}
            {analysis.youtubeRecommendations && analysis.youtubeRecommendations.length > 0 && (
              <div className="rounded-lg glass-card p-8">
                <div className="mb-6 flex items-center gap-3">
                  <svg
                    className="h-6 w-6 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  <h3 className="text-xl font-bold text-text-primary">🎥 YouTube動画コンテンツ提案</h3>
                </div>
                <div className="space-y-6">
                  {analysis.youtubeRecommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="rounded-lg border-l-4 border-red-500 bg-background-secondary/50 p-6 transition-all hover:bg-background-secondary"
                    >
                      <div className="mb-3 flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="mb-2 text-lg font-semibold text-text-primary">
                            {index + 1}. {rec.title}
                          </h4>
                          <p className="mb-3 text-sm leading-relaxed text-text-secondary">
                            {rec.description}
                          </p>
                          <div className="mb-3">
                            <span className="inline-block rounded-md bg-red-500/10 px-3 py-1 text-xs font-medium text-red-500">
                              {rec.targetAudience}
                            </span>
                          </div>
                          {rec.keywords && rec.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {rec.keywords.map((keyword, idx) => (
                                <span
                                  key={idx}
                                  className="rounded-md bg-background-tertiary px-2.5 py-1 text-xs font-medium text-text-secondary"
                                >
                                  #{keyword}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Source Articles */}
            {analysis.sourceArticles && analysis.sourceArticles.length > 0 && (
              <div className="rounded-lg glass-card p-8">
                <div className="mb-6 flex items-center gap-3">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="text-xl font-bold text-text-primary">📚 分析に使用した記事（出典元）</h3>
                </div>
                <p className="mb-4 text-sm text-text-secondary">
                  この分析は以下の {analysis.sourceArticles.length} 件の記事データから生成されました。
                </p>
                <div className="space-y-3">
                  {analysis.sourceArticles.map((article, index) => (
                    <a
                      key={index}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-4 rounded-lg bg-background-secondary/50 p-4 transition-all hover:bg-background-secondary hover:shadow-md"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-medium text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="mb-1 text-sm font-semibold text-text-primary line-clamp-2 hover:text-primary transition-colors">
                          {article.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
                          <span className="rounded-md bg-background-tertiary px-2 py-1 font-medium">
                            {article.mediaSourceName}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {article.likesCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            {article.bookmarksCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            {article.trendScore}
                          </span>
                        </div>
                      </div>
                      <svg
                        className="h-5 w-5 shrink-0 text-text-tertiary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

