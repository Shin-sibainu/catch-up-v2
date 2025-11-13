import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

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
  description:
    "Qiita、Zenn、noteから最新の技術記事を一箇所でキャッチアップ。トレンドスコア順、期間フィルター、タグ検索で効率的に情報収集できます。",
  keywords: [
    "技術記事",
    "Qiita",
    "Zenn",
    "note",
    "プログラミング",
    "エンジニア",
    "トレンド",
    "キャッチアップ",
  ],
  authors: [{ name: "Catch Up" }],
  creator: "Catch Up",
  publisher: "Catch Up",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    title: "Catch Up🔥 - 技術トレンドをキャッチアップ",
    description:
      "Qiita、Zenn、noteから最新の技術記事を一箇所でキャッチアップ。トレンドスコア順、期間フィルター、タグ検索で効率的に情報収集できます。",
    url: "/",
    siteName: "Catch Up",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Catch Up - 技術トレンドをキャッチアップ",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Catch Up🔥 - 技術トレンドをキャッチアップ",
    description:
      "Qiita、Zenn、noteから最新の技術記事を一箇所でキャッチアップ。",
    images: ["/api/og"],
    creator: "@your_twitter_handle", // Twitterアカウントがあれば変更
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <meta name="theme-color" content="#FFF8F0" />

        <script
          async
          src="http://localhost:3000/js/ca-3e3486b5bee331b8.js"
        ></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col bg-background-primary antialiased`}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
