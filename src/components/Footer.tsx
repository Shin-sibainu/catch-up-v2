import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border/30 bg-background-secondary/50 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* About */}
          <div>
            <h3 className="mb-3 text-lg font-semibold text-text-primary">
              Catch Up🔥
            </h3>
            <p className="text-sm text-text-tertiary leading-relaxed">
              Qiita、Zenn、noteから最新の技術記事を一箇所でキャッチアップできるサービスです。
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-3 text-lg font-semibold text-text-primary">
              リンク
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/terms"
                  className="text-text-tertiary hover:text-text-primary transition-colors"
                >
                  利用規約
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/Shin-sibainu/catch-up-v2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-tertiary hover:text-text-primary transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h3 className="mb-3 text-lg font-semibold text-text-primary">
              免責事項
            </h3>
            <p className="text-xs text-text-tertiary leading-relaxed">
              記事の著作権は各プラットフォームおよび著者に帰属します。
              note.comは非公式な方法で利用しており、予告なく機能が停止する可能性があります。
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-border/30 pt-6 text-center">
          <p className="text-sm text-text-tertiary">
            © 2025 Catch Up. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
