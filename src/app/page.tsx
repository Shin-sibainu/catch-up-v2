import { Sidebar } from "@/components/Sidebar";
import { HomeContent } from "@/components/HomeContent";
import { getLiveArticles } from "@/lib/dal/articles-live";

export const revalidate = 300; // 5分ごとに再検証（外部APIから取得するため短めに）

// URLから一意の数値IDを生成する関数
function generateIdFromUrl(url: string): number {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export default async function Home() {
  const initialData = await getLiveArticles({ limit: 12, sort: 'trend', period: '3days' });
  
  // LiveArticleをArticleWithTags形式に変換
  const articles = initialData.articles.map((article, index) => {
    // URLから一意のIDを生成（重複を避けるため、インデックスも使用）
    const urlHash = generateIdFromUrl(article.url);
    const uniqueId = urlHash + index * 1000000; // インデックスを加算して重複を回避
    
    return {
      id: uniqueId,
      externalId: article.externalId,
      mediaSourceId: article.mediaSource.id,
      title: article.title,
      url: article.url,
      description: article.description,
      body: null,
      thumbnailUrl: article.thumbnailUrl,
      likesCount: article.likesCount,
      bookmarksCount: article.bookmarksCount,
      commentsCount: article.commentsCount,
      viewsCount: article.viewsCount,
      trendScore: article.trendScore,
      authorName: article.authorName,
      authorId: article.authorId,
      authorProfileUrl: article.authorProfileUrl,
      authorAvatarUrl: article.authorAvatarUrl,
      publishedAt: article.publishedAt,
      createdAt: article.publishedAt,
      updatedAt: article.publishedAt,
      mediaSource: article.mediaSource,
      tags: article.tags.map((tagName, tagIndex) => ({
        id: generateIdFromUrl(tagName) + tagIndex * 10000,
        name: tagName,
        displayName: tagName,
        slug: tagName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        color: null,
        iconUrl: null,
        articleCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    };
  });

  return (
    <div className="min-h-screen bg-background-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr_320px]">
          {/* HomeContent includes left sidebar on desktop */}
          <HomeContent
            initialArticles={articles}
            initialTotalPages={initialData.totalPages}
          />

          {/* Right Sidebar (Desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <Sidebar />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
