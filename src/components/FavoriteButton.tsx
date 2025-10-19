'use client';

import { useState } from 'react';
import { useSession } from '@/lib/auth-client';

interface FavoriteButtonProps {
  articleId: number;
  initialIsFavorited?: boolean;
  onAuthRequired?: () => void;
}

export function FavoriteButton({
  articleId,
  initialIsFavorited = false,
  onAuthRequired,
}: FavoriteButtonProps) {
  const { data: session } = useSession();
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      onAuthRequired?.();
      return;
    }

    setIsLoading(true);

    try {
      if (isFavorited) {
        // お気に入りを削除
        const response = await fetch(`/api/favorites?articleId=${articleId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setIsFavorited(false);
        }
      } else {
        // お気に入りを追加
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articleId }),
        });

        if (response.ok) {
          setIsFavorited(true);
        }
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm transition-all ${
        isFavorited
          ? 'bg-red-100 text-red-600 hover:bg-red-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isFavorited ? 'お気に入りから削除' : 'お気に入りに追加'}
    >
      <svg
        className={`h-4 w-4 ${isFavorited ? 'fill-current' : 'stroke-current fill-none'}`}
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {isFavorited ? '保存済み' : '保存'}
    </button>
  );
}
