/**
 * はてなブログ RSS クライアント
 *
 * はてなブログの技術記事を収集するためのクライアント
 * RSS フィードから記事情報を取得
 */

import Parser from 'rss-parser';

export interface HatenaArticle {
  id: string;
  title: string;
  url: string;
  description: string;
  content: string;
  publishedAt: Date;
  author: {
    name: string;
    url?: string;
  };
  categories: string[];
}

// はてなブログの技術ブログRSSフィード一覧
// 人気の企業技術ブログを厳選
const HATENA_TECH_BLOGS = [
  'https://developer.hatenastaff.com/rss',           // はてな
  'https://devblog.thebase.in/rss',                  // BASE
  'https://engineering.mercari.com/blog/feed.xml',   // メルカリ
  'https://tech.smarthr.jp/rss',                     // SmartHR
  'https://blog.cybozu.io/rss',                      // サイボウズ
  'https://tech.gunosy.io/rss',                      // Gunosy
  'https://techlife.cookpad.com/rss',                // クックパッド
];

const parser: Parser = new Parser({
  customFields: {
    item: [
      ['content:encoded', 'contentEncoded'],
      ['dc:creator', 'creator'],
    ],
  },
});

/**
 * はてなブログから技術記事を取得
 */
export async function fetchHatenaArticles(limit = 20): Promise<HatenaArticle[]> {
  try {
    const allArticles: HatenaArticle[] = [];

    // 各ブログのRSSを並列で取得
    const feedPromises = HATENA_TECH_BLOGS.map(async (feedUrl) => {
      try {
        const feed = await parser.parseURL(feedUrl);
        return feed.items || [];
      } catch (error) {
        console.error(`Failed to fetch ${feedUrl}:`, error);
        return [];
      }
    });

    const feedsResults = await Promise.all(feedPromises);
    const allItems = feedsResults.flat();

    // 記事を新しい順にソート
    const sortedItems = allItems.sort((a, b) => {
      const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return dateB - dateA;
    });

    // 上位limit件を取得
    const limitedItems = sortedItems.slice(0, limit);

    // データを正規化
    for (const item of limitedItems) {
      if (!item.link || !item.title) continue;

      // 著者名を抽出（記事本文から id:xxx を抽出、または feed.title を使用）
      const authorName = extractAuthorName(item.content || '', item.link);

      const article: HatenaArticle = {
        id: generateIdFromUrl(item.link),
        title: item.title,
        url: item.link,
        description: item.contentSnippet || item.content || '',
        content: (item as { contentEncoded?: string }).contentEncoded || item.content || '',
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        author: {
          name: authorName,
          url: extractBlogUrl(item.link),
        },
        categories: item.categories || [],
      };

      allArticles.push(article);
    }

    console.log(`✅ Hatena: Fetched ${allArticles.length} articles`);
    return allArticles;
  } catch (error) {
    console.error('❌ Hatena API Error:', error);
    throw error;
  }
}

/**
 * はてなブックマーク数を取得
 */
export async function fetchHatenaBookmarkCount(url: string): Promise<number> {
  try {
    const response = await fetch(
      `https://bookmark.hatenaapis.com/count/entry?url=${encodeURIComponent(url)}`
    );

    if (!response.ok) {
      return 0;
    }

    const count = await response.json();
    return typeof count === 'number' ? count : 0;
  } catch (error) {
    console.error(`Failed to fetch bookmark count for ${url}:`, error);
    return 0;
  }
}

/**
 * URLからユニークIDを生成
 */
function generateIdFromUrl(url: string): string {
  // URLの最後の部分をIDとして使用
  const parts = url.split('/').filter(Boolean);
  return parts[parts.length - 1] || url;
}

/**
 * 記事URLからブログのベースURLを抽出
 */
function extractBlogUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.host}`;
  } catch {
    return '';
  }
}

/**
 * 記事本文またはURLから著者名を抽出
 */
function extractAuthorName(content: string, url: string): string {
  // 記事本文から最初の id:xxx を抽出
  const idMatch = content.match(/id:([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) {
    return idMatch[1];
  }

  // URLからブログ名を抽出（例: developer.hatenastaff.com → Hatena Developer Blog）
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // よく知られたブログのマッピング
    const blogNames: { [key: string]: string } = {
      'developer.hatenastaff.com': 'Hatena Developer Blog',
      'devblog.thebase.in': 'BASE',
      'techblog.yahoo.co.jp': 'Yahoo! JAPAN',
      'engineering.mercari.com': 'Mercari',
      'tech.smarthr.jp': 'SmartHR',
      'blog.cybozu.io': 'Cybozu',
      'tech.gunosy.io': 'Gunosy',
      'techlife.cookpad.com': 'Cookpad',
      'tech.pepabo.com': 'Pepabo',
      'zozotech-inc.github.io': 'ZOZO',
    };

    return blogNames[hostname] || hostname;
  } catch {
    return 'Unknown';
  }
}
