'use client';

import { useState } from 'react';
import { FilterBar } from '@/components/FilterBar';
import { ArticlesList } from '@/components/ArticlesList';
import type { ArticleWithTags } from '@/types';

interface HomeContentProps {
  initialArticles: ArticleWithTags[];
  initialTotalPages: number;
}

export function HomeContent({ initialArticles, initialTotalPages }: HomeContentProps) {
  const [filters, setFilters] = useState({
    media: [] as string[],
    period: 'all' as 'day' | 'week' | 'month' | 'all',
    tags: [] as string[],
    search: '',
    sort: 'trend' as 'trend' | 'likes' | 'bookmarks' | 'latest',
  });

  return (
    <>
      {/* Left Sidebar - Filters (Desktop) */}
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <FilterBar onFilterChange={setFilters} />
        </div>
      </aside>

      {/* Main Articles */}
      <main>
        {/* Mobile Filters */}
        <div className="mb-6 lg:hidden">
          <details className="group">
            <summary className="cursor-pointer rounded-lg glass-card px-4 py-3 font-medium text-text-secondary">
              フィルター
              <span className="ml-2 inline-block transition-transform group-open:rotate-180">
                ▼
              </span>
            </summary>
            <div className="mt-2">
              <FilterBar onFilterChange={setFilters} />
            </div>
          </details>
        </div>

        <ArticlesList
          filters={filters}
          initialArticles={initialArticles}
          initialTotalPages={initialTotalPages}
        />
      </main>
    </>
  );
}
