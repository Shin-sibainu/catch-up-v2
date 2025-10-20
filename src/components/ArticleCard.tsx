'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatRelativeTime, formatNumber } from '@/lib/utils';
import type { ArticleWithTags } from '@/types';
import { FavoriteButton } from './FavoriteButton';
import { AuthModal } from './auth/AuthModal';

interface ArticleCardProps {
  article: ArticleWithTags;
  initialIsFavorited?: boolean;
}

export function ArticleCard({ article, initialIsFavorited = false }: ArticleCardProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);

  // メディアごとの色設定と絵文字
  const getMediaConfig = (mediaName: string) => {
    switch (mediaName) {
      case 'qiita':
        return {
          badge: 'bg-[#55C500]/20 text-[#55C500]',
          border: 'border-l-[#55C500]',
          emoji: '📗',
        };
      case 'zenn':
        return {
          badge: 'bg-[#3EA8FF]/20 text-[#3EA8FF]',
          border: 'border-l-[#3EA8FF]',
          emoji: '⚡',
        };
      case 'note':
        return {
          badge: 'bg-[#41C9B4]/20 text-[#41C9B4]',
          border: 'border-l-[#41C9B4]',
          emoji: '📝',
        };
      case 'hatena':
        return {
          badge: 'bg-[#00A4DE]/20 text-[#00A4DE]',
          border: 'border-l-[#00A4DE]',
          emoji: '📘',
        };
      default:
        return {
          badge: 'bg-primary/20 text-primary',
          border: 'border-l-primary',
          emoji: '📄',
        };
    }
  };

  const mediaConfig = getMediaConfig(article.mediaSource.name);

  return (
    <>
      <Link
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block h-full animate-fade-in"
      >
        <article className={`glass-card h-full rounded-lg p-6 border-l-4 ${mediaConfig.border} transition-all duration-300 hover-lift hover:border-primary/50`}>
          {/* Header - Media Source & Time + Favorite Button */}
        <div className="mb-3 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${mediaConfig.badge}`}>
              {mediaConfig.emoji} {article.mediaSource.displayName}
            </span>
            <time className="text-text-tertiary" dateTime={article.publishedAt.toString()}>
              {formatRelativeTime(new Date(article.publishedAt))}
            </time>
          </div>
          <FavoriteButton
            articleId={article.id}
            initialIsFavorited={initialIsFavorited}
            onAuthRequired={() => setShowAuthModal(true)}
          />
        </div>

        {/* Title */}
        <h2 className="mb-3 line-clamp-2 text-xl font-bold text-text-primary transition-colors group-hover:text-primary break-words overflow-hidden">
          {article.title}
        </h2>

        {/* Description */}
        {article.description && (
          <p className="mb-4 line-clamp-3 text-sm text-text-secondary">
            {article.description}
          </p>
        )}

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {article.tags.slice(0, 5).map((tag) => (
              <span
                key={tag.id}
                className="rounded-md bg-background-tertiary px-2 py-1 text-xs text-text-secondary"
              >
                #{tag.displayName}
              </span>
            ))}
          </div>
        )}

        {/* Footer - Author & Stats */}
        <div className="flex items-center justify-between border-t border-border/30 pt-4">
          {/* Author - はてなブログ以外の場合のみ表示 */}
          {article.mediaSource.name !== 'hatena' && (
            <div className="flex items-center gap-2">
              {article.authorAvatarUrl && (
                <img
                  src={article.authorAvatarUrl}
                  alt={article.authorName}
                  className="h-6 w-6 rounded-full"
                />
              )}
              <span className="text-sm text-text-secondary">{article.authorName}</span>
            </div>
          )}

          {/* Stats */}
          <div className={`flex items-center gap-4 text-sm text-text-tertiary ${article.mediaSource.name === 'hatena' ? 'ml-auto' : ''}`}>
            {article.likesCount > 0 && (
              <div className="flex items-center gap-1">
                <span>❤️</span>
                <span>{formatNumber(article.likesCount)}</span>
              </div>
            )}
            {article.bookmarksCount > 0 && (
              <div className="flex items-center gap-1">
                <span>🔖</span>
                <span>{formatNumber(article.bookmarksCount)}</span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
    <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
