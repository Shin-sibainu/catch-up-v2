'use client';

import Link from 'next/link';

export function Sidebar() {
  return (
    <aside className="space-y-6">
      {/* AIトレンド分析へのリンク */}
      <div className="rounded-lg glass-card p-6">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
            <svg
              className="h-8 w-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-lg font-bold text-text-primary">AIトレンド分析</h2>
          <p className="mb-4 text-sm leading-relaxed text-text-tertiary">
            AIが最新の技術記事を分析して、トレンドを教えてくれます
          </p>
          <Link
            href="/trends"
            className="group flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary/80 px-4 py-3 font-medium text-white transition-all hover:from-primary/90 hover:to-primary/70"
          >
            <span>分析を見る</span>
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* X (Twitter) 宣伝スペース */}
      <div className="rounded-lg glass-card p-6">
        <div className="flex flex-col items-center text-center">
          {/* Xアイコン */}
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-black dark:bg-white">
            <svg
              className="h-8 w-8 text-white dark:text-black"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </div>

          {/* タイトルと説明 */}
          <h2 className="mb-2 text-lg font-bold text-text-primary">Xでフォロー</h2>
          <p className="mb-4 text-sm leading-relaxed text-text-tertiary">
            最新の技術情報や開発のヒントをXで発信しています。フォローして最新情報をチェック！
          </p>

          {/* Xリンクボタン */}
          <Link
            href="https://x.com/Shin_Engineer"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 font-medium text-white transition-all hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            <svg
              className="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>Xでフォロー</span>
          </Link>
        </div>
      </div>

      {/* About */}
      <div className="rounded-lg glass-card p-6">
        <h2 className="mb-4 text-lg font-bold text-text-primary">About</h2>
        <p className="text-sm leading-relaxed text-text-tertiary">
          Catch Upは、QiitaやZennなどの技術メディアから最新のトレンド記事を自動収集し、一つの場所でキャッチアップできるサービスです。
        </p>
      </div>
    </aside>
  );
}
