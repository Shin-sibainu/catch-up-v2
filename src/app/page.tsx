import { Sidebar } from "@/components/Sidebar";
import { HomeContent } from "@/components/HomeContent";
import { getArticles } from "@/lib/dal/articles";

export const revalidate = 21600; // 6時間ごとに再検証（Cron Jobと同期）

export default async function Home() {
  const initialData = await getArticles({ limit: 12, sort: 'trend' });

  return (
    <div className="min-h-screen bg-background-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr_320px]">
          {/* HomeContent includes left sidebar on desktop */}
          <HomeContent
            initialArticles={initialData.articles}
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
