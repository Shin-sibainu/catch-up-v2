import type { Article, Tag, MediaSource } from '@/db';

// 記事とタグを含む拡張型
export type ArticleWithTags = Article & {
  tags: Tag[];
  mediaSource: MediaSource;
};

// API レスポンス型
export type GetArticlesResponse = {
  articles: ArticleWithTags[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// GET /api/articles クエリパラメータ
export type GetArticlesParams = {
  page?: number;
  limit?: number;
  media?: string[]; // media source names
  period?: 'day' | 'week' | 'month' | 'all';
  tags?: string[]; // tag slugs
  sort?: 'trend' | 'likes' | 'bookmarks' | 'latest';
  search?: string;
};

// Qiita API型
export type QiitaItem = {
  id: string;
  title: string;
  url: string;
  body: string;
  likes_count: number;
  stocks_count: number;
  comments_count: number;
  tags: { name: string }[];
  user: {
    id: string;
    name: string;
    profile_image_url: string;
  };
  created_at: string;
  updated_at: string;
};

// Zenn API型
export type ZennArticle = {
  id: number;
  title: string;
  slug: string;
  emoji: string;
  liked_count: number;
  body_letters_count: number;
  article_type: string;
  published_at: string;
  path: string;
  user: {
    username: string;
    name: string;
    avatar_small_url: string;
  };
};

// クロールログのステータス型
export type CrawlStatus = 'success' | 'failed' | 'partial';
