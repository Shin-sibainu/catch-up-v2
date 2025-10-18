'use client';

import { useEffect, useState } from 'react';
import type { MediaSource, Tag } from '@/db';

interface FilterBarProps {
  onFilterChange: (filters: {
    media: string[];
    period: 'day' | 'week' | 'month' | 'all';
    tags: string[];
    search: string;
    sort: 'trend' | 'likes' | 'bookmarks' | 'latest';
  }) => void;
}

export function FilterBar({ onFilterChange }: FilterBarProps) {
  const [mediaSources, setMediaSources] = useState<MediaSource[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'all'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'trend' | 'likes' | 'bookmarks' | 'latest'>('trend');

  useEffect(() => {
    // Fetch media sources
    fetch('/api/media-sources?active=true')
      .then((res) => res.json())
      .then((data) => setMediaSources(data));

    // Fetch popular tags
    fetch('/api/tags?limit=20')
      .then((res) => res.json())
      .then((data) => setTags(data));
  }, []);

  useEffect(() => {
    onFilterChange({
      media: selectedMedia,
      period: selectedPeriod,
      tags: selectedTags,
      search,
      sort,
    });
  }, [selectedMedia, selectedPeriod, selectedTags, search, sort, onFilterChange]);

  const toggleMedia = (mediaName: string) => {
    setSelectedMedia((prev) =>
      prev.includes(mediaName)
        ? prev.filter((m) => m !== mediaName)
        : [...prev, mediaName]
    );
  };

  const toggleTag = (tagSlug: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagSlug) ? prev.filter((t) => t !== tagSlug) : [...prev, tagSlug]
    );
  };

  return (
    <div className="space-y-4 rounded-lg border border-gray-800 bg-background-secondary p-4">
      {/* Search */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-400">検索</label>
        <input
          type="text"
          placeholder="記事を検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none"
        />
      </div>

      {/* Sort */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-400">並び替え</label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
          className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-white focus:border-primary focus:outline-none"
        >
          <option value="trend">トレンド</option>
          <option value="likes">いいね数</option>
          <option value="bookmarks">ブックマーク数</option>
          <option value="latest">最新</option>
        </select>
      </div>

      {/* Period */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-400">期間</label>
        <div className="grid grid-cols-2 gap-2">
          {(['all', 'day', 'week', 'month'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'border-primary bg-primary/20 text-primary'
                  : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
              }`}
            >
              {period === 'all' && '全期間'}
              {period === 'day' && '24時間'}
              {period === 'week' && '1週間'}
              {period === 'month' && '1ヶ月'}
            </button>
          ))}
        </div>
      </div>

      {/* Media Sources */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-400">メディア</label>
        <div className="space-y-2">
          {mediaSources.map((media) => (
            <label
              key={media.id}
              className="flex cursor-pointer items-center gap-2 rounded-lg p-2 hover:bg-gray-800/50"
            >
              <input
                type="checkbox"
                checked={selectedMedia.includes(media.name)}
                onChange={() => toggleMedia(media.name)}
                className="h-4 w-4 rounded border-gray-700 bg-gray-900 text-primary focus:ring-2 focus:ring-primary"
              />
              <span className="text-sm text-gray-300">{media.displayName}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Popular Tags */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-400">人気タグ</label>
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 10).map((tag) => (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.slug)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                selectedTags.includes(tag.slug)
                  ? 'bg-primary text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {tag.displayName}
            </button>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      {(selectedMedia.length > 0 ||
        selectedTags.length > 0 ||
        search ||
        selectedPeriod !== 'all' ||
        sort !== 'trend') && (
        <button
          onClick={() => {
            setSelectedMedia([]);
            setSelectedTags([]);
            setSearch('');
            setSelectedPeriod('all');
            setSort('trend');
          }}
          className="w-full rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700"
        >
          フィルターをリセット
        </button>
      )}
    </div>
  );
}
