import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Catch Up🔥 - 技術トレンドをキャッチアップ",
    template: "%s | Catch Up🔥",
  },
  description: "Qiita、Zenn、noteから最新の技術記事を一箇所でキャッチアップ。トレンドスコア順、期間フィルター、タグ検索で効率的に情報収集できます。",
  keywords: ["技術記事", "Qiita", "Zenn", "note", "プログラミング", "エンジニア", "トレンド", "キャッチアップ"],
  authors: [{ name: "Catch Up" }],
  creator: "Catch Up",
  publisher: "Catch Up",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: "Catch Up🔥 - 技術トレンドをキャッチアップ",
    description: "Qiita、Zenn、noteから最新の技術記事を一箇所でキャッチアップ。トレンドスコア順、期間フィルター、タグ検索で効率的に情報収集できます。",
    url: '/',
    siteName: 'Catch Up',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'Catch Up - 技術トレンドをキャッチアップ',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Catch Up🔥 - 技術トレンドをキャッチアップ",
    description: "Qiita、Zenn、noteから最新の技術記事を一箇所でキャッチアップ。",
    images: ['/api/og'],
    creator: '@your_twitter_handle', // Twitterアカウントがあれば変更
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background-primary antialiased`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
