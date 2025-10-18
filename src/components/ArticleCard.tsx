import Link from 'next/link';
import { formatRelativeTime, formatNumber } from '@/lib/utils';
import type { ArticleWithTags } from '@/types';

interface ArticleCardProps {
  article: ArticleWithTags;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block h-full animate-fade-in"
    >
      <article className="glass-card h-full rounded-lg p-6 transition-all duration-300 hover-lift hover:border-primary/50">
        {/* Header - Media Source & Time */}
        <div className="mb-3 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary">
              {article.mediaSource.displayName}
            </span>
          </div>
          <time className="text-text-tertiary" dateTime={article.publishedAt.toString()}>
            {formatRelativeTime(new Date(article.publishedAt))}
          </time>
        </div>

        {/* Title */}
        <h2 className="mb-3 line-clamp-2 text-xl font-bold text-text-primary transition-colors group-hover:text-primary">
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
        <div className="flex items-center justify-between border-t border-border pt-4">
          {/* Author */}
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

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-text-tertiary">
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
  );
}
