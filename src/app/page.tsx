'use client';

import { useEffect, useState, useCallback } from 'react';
import { ArticleCard } from '@/components/ArticleCard';
import { FilterBar } from '@/components/FilterBar';
import { Sidebar } from '@/components/Sidebar';
import type { GetArticlesResponse, ArticleWithTags } from '@/types';

export default function Home() {
  const [articles, setArticles] = useState<ArticleWithTags[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    media: [] as string[],
    period: 'all' as 'day' | 'week' | 'month' | 'all',
    tags: [] as string[],
    search: '',
    sort: 'trend' as 'trend' | 'likes' | 'bookmarks' | 'latest',
  });

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sort: filters.sort,
      });

      if (filters.media.length > 0) {
        params.set('media', filters.media.join(','));
      }
      if (filters.period !== 'all') {
        params.set('period', filters.period);
      }
      if (filters.tags.length > 0) {
        params.set('tags', filters.tags.join(','));
      }
      if (filters.search) {
        params.set('search', filters.search);
      }

      const response = await fetch(`/api/articles?${params.toString()}`);

      if (!response.ok) {
        throw new Error('記事の取得に失敗しました');
      }

      const data: GetArticlesResponse = await response.json();
      setArticles(data.articles);
      setTotalPages(data.pagination.totalPages);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // フィルター変更時はページを1にリセット
  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  if (loading && articles.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-gray-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error && articles.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-400">エラー: {error}</p>
          <button
            onClick={fetchArticles}
            className="rounded-lg bg-primary px-6 py-2 font-medium text-white hover:bg-primary/80"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Hero Section */}
      <div className="border-b border-gray-800 bg-gradient-to-b from-background-secondary to-background-primary">
        <div className="container mx-auto px-4 py-16">
          <h1 className="mb-4 text-center text-5xl font-bold text-text-primary">
            技術トレンド
          </h1>
          <p className="text-center text-xl text-gray-400">
            最新の技術記事をキャッチアップ
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr_320px]">
          {/* Left Sidebar - Filters (Desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <FilterBar onFilterChange={handleFilterChange} />
            </div>
          </aside>

          {/* Main Articles */}
          <main>
            {/* Mobile Filters */}
            <div className="mb-6 lg:hidden">
              <details className="group">
                <summary className="cursor-pointer rounded-lg border border-gray-800 bg-background-secondary px-4 py-3 font-medium text-gray-300">
                  フィルター
                  <span className="ml-2 inline-block transition-transform group-open:rotate-180">
                    ▼
                  </span>
                </summary>
                <div className="mt-2">
                  <FilterBar onFilterChange={handleFilterChange} />
                </div>
              </details>
            </div>

            {/* Stats */}
            <div className="mb-6 text-center lg:text-left">
              <p className="text-gray-400">
                {loading ? (
                  '読み込み中...'
                ) : articles.length > 0 ? (
                  `${articles.length}件の記事を表示中`
                ) : (
                  '記事が見つかりませんでした'
                )}
              </p>
            </div>

            {/* Articles Grid */}
            {articles.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-gray-800 bg-background-secondary p-12 text-center">
                <p className="text-gray-400">
                  条件に一致する記事が見つかりませんでした
                </p>
                <button
                  onClick={() => {
                    setFilters({
                      media: [],
                      period: 'all',
                      tags: [],
                      search: '',
                      sort: 'trend',
                    });
                    setPage(1);
                  }}
                  className="mt-4 rounded-lg bg-gray-800 px-6 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700"
                >
                  フィルターをリセット
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="rounded-lg bg-gray-800 px-6 py-2 font-medium text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  前へ
                </button>
                <span className="text-gray-400">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                  className="rounded-lg bg-gray-800 px-6 py-2 font-medium text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  次へ
                </button>
              </div>
            )}
          </main>

          {/* Right Sidebar (Desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <Sidebar />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
