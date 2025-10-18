'use client';

import { useEffect, useState } from 'react';
import type { Tag } from '@/db';

export function Sidebar() {
  const [popularTags, setPopularTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tags?limit=15&sort=count')
      .then((res) => res.json())
      .then((data) => {
        setPopularTags(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <aside className="space-y-6">
        <div className="rounded-lg border border-border bg-background-secondary p-6">
          <div className="h-6 w-32 animate-pulse rounded bg-background-tertiary"></div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="space-y-6">
      {/* Popular Tags Cloud */}
      <div className="rounded-lg border border-border bg-background-secondary p-6">
        <h2 className="mb-4 text-lg font-bold text-text-primary">人気タグ</h2>
        <div className="flex flex-wrap gap-2">
          {popularTags.map((tag) => {
            const size = Math.min(Math.max(tag.articleCount, 1), 10);
            const fontSize = 0.75 + (size / 10) * 0.5; // 0.75rem ~ 1.25rem

            return (
              <a
                key={tag.id}
                href={`/?tags=${tag.slug}`}
                className="rounded-md bg-background-tertiary px-3 py-1 transition-colors hover:bg-primary hover:text-white"
                style={{ fontSize: `${fontSize}rem` }}
              >
                <span className="font-medium text-text-secondary">
                  {tag.displayName}
                </span>
                <span className="ml-1 text-xs text-text-tertiary">
                  ({tag.articleCount})
                </span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="rounded-lg border border-border bg-background-secondary p-6">
        <h2 className="mb-4 text-lg font-bold text-text-primary">統計情報</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-tertiary">総タグ数</span>
            <span className="text-lg font-bold text-primary">{popularTags.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-tertiary">総記事数</span>
            <span className="text-lg font-bold text-primary">
              {popularTags.reduce((sum, tag) => sum + tag.articleCount, 0)}
            </span>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="rounded-lg border border-border bg-background-secondary p-6">
        <h2 className="mb-4 text-lg font-bold text-text-primary">About</h2>
        <p className="text-sm leading-relaxed text-text-tertiary">
          Catch Upは、QiitaやZennなどの技術メディアから最新のトレンド記事を自動収集し、一つの場所でキャッチアップできるサービスです。
        </p>
      </div>
    </aside>
  );
}
