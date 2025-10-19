'use client';

import { useEffect, useState, useCallback } from 'react';
import { ArticleCard } from '@/components/ArticleCard';
import { useSession } from '@/lib/auth-client';
import type { GetArticlesResponse, ArticleWithTags } from '@/types';

interface ArticlesListProps {
  filters: {
    media: string[];
    period: 'day' | 'week' | 'month' | 'all';
    tags: string[];
    search: string;
    sort: 'trend' | 'likes' | 'bookmarks' | 'latest';
  };
  initialArticles: ArticleWithTags[];
  initialTotalPages: number;
}

export function ArticlesList({ filters, initialArticles, initialTotalPages }: ArticlesListProps) {
  const { data: session } = useSession();
  const [articles, setArticles] = useState<ArticleWithTags[]>(initialArticles);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [favoriteStates, setFavoriteStates] = useState<Record<number, boolean>>({});

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
    // フィルターが適用されているかチェック
    const hasFilters =
      filters.media.length > 0 ||
      filters.period !== 'all' ||
      filters.tags.length > 0 ||
      filters.search !== '' ||
      filters.sort !== 'trend';

    // フィルターが適用されているか、ページが1以外の場合のみAPIを呼ぶ
    if (hasFilters || page > 1) {
      fetchArticles();
    } else {
      // フィルターなし & 1ページ目 = 初期データを使用（ISR最適化）
      setArticles(initialArticles);
      setTotalPages(initialTotalPages);
      setLoading(false);
    }
  }, [fetchArticles, initialArticles, initialTotalPages, filters, page]);

  // フィルター変更時はページを1にリセット
  useEffect(() => {
    setPage(1);
  }, [filters.media, filters.period, filters.tags, filters.search, filters.sort]);

  // お気に入り状態をチェック
  useEffect(() => {
    if (!session || articles.length === 0) return;

    const checkFavorites = async () => {
      const articleIds = articles.map((a) => a.id).join(',');
      try {
        const response = await fetch(`/api/favorites/check?ids=${articleIds}`);
        if (response.ok) {
          const favorites = await response.json();
          setFavoriteStates(favorites);
        }
      } catch (error) {
        console.error('Failed to check favorites:', error);
      }
    };

    checkFavorites();
  }, [session, articles]);

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
      {/* Articles Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card rounded-lg p-6 border-l-4 border-l-background-tertiary/30">
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
              <div className="flex items-center justify-between border-t border-border/30 pt-4">
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
            <ArticleCard
              key={article.id}
              article={article}
              initialIsFavorited={favoriteStates[article.id] || false}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg glass-card p-12 text-center">
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
