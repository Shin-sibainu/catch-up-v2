import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind CSSクラスをマージするユーティリティ
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * トレンドスコアの計算
 * スコアが高いほどトレンド性が高い
 */
export function calculateTrendScore(article: {
  likes_count: number;
  bookmarks_count: number;
  comments_count: number;
  published_at: Date;
}): number {
  const now = new Date();
  const hoursSincePublished =
    (now.getTime() - article.published_at.getTime()) / (1000 * 60 * 60);

  const score =
    article.likes_count * 2 +
    article.bookmarks_count * 3 +
    article.comments_count * 1 -
    hoursSincePublished * 0.1;

  return Math.max(0, Math.round(score));
}

/**
 * 期間フィルターに応じた開始日時を取得
 */
export function getStartDateByPeriod(
  period: 'day' | 'week' | 'month' | 'all'
): Date | null {
  const now = new Date();

  switch (period) {
    case 'day':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case 'week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'month':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'all':
    default:
      return null;
  }
}

/**
 * タグ名からスラッグを生成
 */
export function generateTagSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * 相対時間を表示（例: "2時間前", "3日前"）
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return 'たった今';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分前`;
  } else if (diffHours < 24) {
    return `${diffHours}時間前`;
  } else if (diffDays < 30) {
    return `${diffDays}日前`;
  } else {
    return date.toLocaleDateString('ja-JP');
  }
}

// エイリアス
export const formatRelativeTime = getRelativeTime;

/**
 * 数値をフォーマット（例: 1000 -> "1K", 1500 -> "1.5K"）
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}
