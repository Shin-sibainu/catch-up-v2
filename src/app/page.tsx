import { Sidebar } from "@/components/Sidebar";
import { HomeContent } from "@/components/HomeContent";

export default function Home() {
  return (
    <div className="min-h-screen bg-background-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr_320px]">
          {/* HomeContent includes left sidebar on desktop */}
          <HomeContent />

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
