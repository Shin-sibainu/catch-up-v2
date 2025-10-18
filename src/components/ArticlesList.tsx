'use client';

import { useEffect, useState, useCallback } from 'react';
import { ArticleCard } from '@/components/ArticleCard';
import type { GetArticlesResponse, ArticleWithTags } from '@/types';

interface ArticlesListProps {
  filters: {
    media: string[];
    period: 'day' | 'week' | 'month' | 'all';
    tags: string[];
    search: string;
    sort: 'trend' | 'likes' | 'bookmarks' | 'latest';
  };
}

export function ArticlesList({ filters }: ArticlesListProps) {
  const [articles, setArticles] = useState<ArticleWithTags[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
  useEffect(() => {
    setPage(1);
  }, [filters]);

  if (error && articles.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-error">エラー: {error}</p>
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
    <>
      {/* Stats */}
      <div className="mb-6 text-center lg:text-left">
        <p className="text-text-tertiary">
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
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card rounded-lg p-6 border-l-4 border-l-background-tertiary">
              <div className="mb-3 flex items-center justify-between">
                <div className="h-6 w-20 bg-background-tertiary rounded-full animate-pulse"></div>
                <div className="h-4 w-16 bg-background-tertiary rounded animate-pulse"></div>
              </div>
              <div className="mb-3 h-6 w-3/4 bg-background-tertiary rounded animate-pulse"></div>
              <div className="mb-2 h-4 w-full bg-background-tertiary rounded animate-pulse"></div>
              <div className="mb-4 h-4 w-5/6 bg-background-tertiary rounded animate-pulse"></div>
              <div className="mb-4 flex gap-2">
                <div className="h-6 w-16 bg-background-tertiary rounded animate-pulse"></div>
                <div className="h-6 w-20 bg-background-tertiary rounded animate-pulse"></div>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-4">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 bg-background-tertiary rounded-full animate-pulse"></div>
                  <div className="h-4 w-24 bg-background-tertiary rounded animate-pulse"></div>
                </div>
                <div className="flex gap-4">
                  <div className="h-4 w-8 bg-background-tertiary rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : articles.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-background-secondary p-12 text-center">
          <p className="text-text-tertiary">
            条件に一致する記事が見つかりませんでした
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="mt-12 flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg bg-background-tertiary px-6 py-2 font-medium text-text-primary transition-colors hover:bg-background-tertiary/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            前へ
          </button>
          <span className="text-text-tertiary">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg bg-background-tertiary px-6 py-2 font-medium text-text-primary transition-colors hover:bg-background-tertiary/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            次へ
          </button>
        </div>
      )}
    </>
  );
}
