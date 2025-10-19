'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { ArticleCard } from '@/components/ArticleCard';
import type { ArticleWithTags } from '@/types';

interface FavoritesResponse {
  articles: ArticleWithTags[];
  total: number;
  totalPages: number;
}

export default function FavoritesPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoritesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/');
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (!session) return;

    const fetchFavorites = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/favorites?page=${page}&limit=12`);
        const data = await response.json();
        setFavorites(data);
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [session, page]);

  if (isPending || !session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-text-primary">お気に入り</h1>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : favorites && favorites.articles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {favorites.articles.map((article) => (
              <ArticleCard key={article.id} article={article} initialIsFavorited={true} />
            ))}
          </div>

          {/* Pagination */}
          {favorites.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md bg-background-secondary px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-background-tertiary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                前へ
              </button>

              <span className="flex items-center px-4 text-sm text-text-secondary">
                {page} / {favorites.totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(favorites.totalPages, p + 1))}
                disabled={page === favorites.totalPages}
                className="rounded-md bg-background-secondary px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-background-tertiary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                次へ
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="py-12 text-center">
          <p className="text-lg text-text-secondary">
            まだお気に入りの記事がありません
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 rounded-md bg-primary px-6 py-2 text-white transition-colors hover:bg-primary/90"
          >
            記事を探す
          </button>
        </div>
      )}
    </div>
  );
}
