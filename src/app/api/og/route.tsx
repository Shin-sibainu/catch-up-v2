import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#FFF8F0', // 暖色系背景
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
          gap: '48px',
        }}
      >
        {/* ロゴ */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <h1
            style={{
              fontSize: 96,
              fontWeight: 'bold',
              margin: 0,
              color: '#111827',
              letterSpacing: '-0.02em',
            }}
          >
            Catch Up
          </h1>
          <span style={{ fontSize: 96 }}>🔥</span>
        </div>

        {/* キャッチコピー */}
        <p
          style={{
            fontSize: 42,
            color: '#6B7280',
            margin: 0,
            textAlign: 'center',
            fontWeight: 500,
          }}
        >
          技術トレンドをキャッチアップ
        </p>

        {/* メディアバッジ */}
        <div
          style={{
            display: 'flex',
            gap: '20px',
          }}
        >
          {/* Qiita */}
          <div
            style={{
              background: 'rgba(85, 197, 0, 0.15)',
              color: '#55C500',
              padding: '16px 32px',
              borderRadius: '16px',
              fontSize: 28,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span>📗</span>
            <span>Qiita</span>
          </div>

          {/* Zenn */}
          <div
            style={{
              background: 'rgba(62, 168, 255, 0.15)',
              color: '#3EA8FF',
              padding: '16px 32px',
              borderRadius: '16px',
              fontSize: 28,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span>⚡</span>
            <span>Zenn</span>
          </div>

          {/* note */}
          <div
            style={{
              background: 'rgba(65, 201, 180, 0.15)',
              color: '#41C9B4',
              padding: '16px 32px',
              borderRadius: '16px',
              fontSize: 28,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span>📝</span>
            <span>note</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
