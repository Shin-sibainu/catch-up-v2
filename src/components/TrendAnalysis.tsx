'use client';

import { useState } from 'react';

interface TrendTopic {
  category: string;
  description: string;
  keywords: string[];
  articleCount: number;
  trendScore: number;
}

interface TrendAnalysis {
  summary: string;
  topCategories: TrendTopic[];
  emergingTopics: string[];
  insights: string[];
  analyzedAt: string;
}

export function TrendAnalysis() {
  const [analysis, setAnalysis] = useState<TrendAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/trends/analyze');
      
      if (!response.ok) {
        throw new Error('トレンド分析の取得に失敗しました');
      }

      const data = await response.json();
      setAnalysis(data);
      setHasAnalyzed(true);
    } catch (err) {
      console.error('Error fetching trend analysis:', err);
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // まだ分析していない場合はボタンのみ表示
  if (!hasAnalyzed && !loading && !error) {
    return (
      <div className="rounded-lg glass-card p-6">
        <h2 className="mb-4 text-lg font-bold text-text-primary">📊 トレンド分析</h2>
        <p className="mb-4 text-sm text-text-secondary">
          AIが最新の技術記事を分析して、現在のトレンドを教えてくれます。
        </p>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-white transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? '分析中...' : 'トレンドを分析する'}
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-lg glass-card p-6">
        <h2 className="mb-4 text-lg font-bold text-text-primary">📊 トレンド分析</h2>
        <div className="mb-4 space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-background-tertiary"></div>
          <div className="h-4 w-5/6 animate-pulse rounded bg-background-tertiary"></div>
        </div>
        <button
          disabled
          className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-white opacity-50"
        >
          AIが分析中...
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg glass-card p-6">
        <h2 className="mb-4 text-lg font-bold text-text-primary">📊 トレンド分析</h2>
        <p className="mb-4 text-sm text-text-tertiary">{error}</p>
        <button
          onClick={handleAnalyze}
          className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-white transition-all hover:bg-primary/90"
        >
          再試行
        </button>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* サマリー */}
      <div className="rounded-lg glass-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">📊 トレンド分析</h2>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="rounded-md bg-background-tertiary px-3 py-1 text-xs font-medium text-text-secondary transition-colors hover:bg-background-tertiary/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            再分析
          </button>
        </div>
        <p className="text-sm leading-relaxed text-text-secondary">{analysis.summary}</p>
        {analysis.analyzedAt && (
          <p className="mt-2 text-xs text-text-tertiary">
            分析日時: {new Date(analysis.analyzedAt).toLocaleString('ja-JP')}
          </p>
        )}
      </div>

      {/* トップカテゴリ */}
      {analysis.topCategories && analysis.topCategories.length > 0 && (
        <div className="rounded-lg glass-card p-6">
          <h3 className="mb-4 text-base font-bold text-text-primary">🔥 トレンドカテゴリ</h3>
          <div className="space-y-4">
            {analysis.topCategories.map((category, index) => (
              <div key={index} className="border-l-4 border-primary pl-4">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-semibold text-text-primary">{category.category}</h4>
                  <span className="text-xs text-text-tertiary">
                    スコア: {category.trendScore}
                  </span>
                </div>
                <p className="mb-2 text-sm text-text-secondary">{category.description}</p>
                {category.keywords && category.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {category.keywords.slice(0, 5).map((keyword, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-background-tertiary px-2 py-1 text-xs text-text-secondary"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 新興トピック */}
      {analysis.emergingTopics && analysis.emergingTopics.length > 0 && (
        <div className="rounded-lg glass-card p-6">
          <h3 className="mb-4 text-base font-bold text-text-primary">🚀 新興トピック</h3>
          <div className="flex flex-wrap gap-2">
            {analysis.emergingTopics.map((topic, index) => (
              <span
                key={index}
                className="rounded-md bg-primary/20 px-3 py-1 text-sm font-medium text-primary"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 洞察 */}
      {analysis.insights && analysis.insights.length > 0 && (
        <div className="rounded-lg glass-card p-6">
          <h3 className="mb-4 text-base font-bold text-text-primary">💡 洞察</h3>
          <ul className="space-y-2">
            {analysis.insights.map((insight, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-text-secondary">
                <span className="mt-1 text-primary">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

