import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-background-secondary/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <span className="text-xl font-bold text-white">C</span>
            </div>
            <span className="text-xl font-bold text-text-primary">Catch Up</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-gray-400 transition-colors hover:text-primary"
            >
              トレンド
            </Link>
            <Link
              href="/#"
              className="text-sm font-medium text-gray-400 transition-colors hover:text-primary"
            >
              タグ
            </Link>
            <Link
              href="/#"
              className="text-sm font-medium text-gray-400 transition-colors hover:text-primary"
            >
              About
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden rounded-lg p-2 text-gray-400 hover:bg-gray-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
