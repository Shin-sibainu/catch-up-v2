import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background-primary border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-text-primary">
              Catch Up🔥
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-text-secondary transition-colors hover:text-primary"
            >
              トレンド
            </Link>
            <Link
              href="/#"
              className="text-sm font-medium text-text-secondary transition-colors hover:text-primary"
            >
              タグ
            </Link>
            <Link
              href="/#"
              className="text-sm font-medium text-text-secondary transition-colors hover:text-primary"
            >
              About
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
