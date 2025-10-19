import { createClient } from '@libsql/client';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

async function seedHatena() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  try {
    // はてなブログが既に存在するかチェック
    const existing = await client.execute({
      sql: 'SELECT id FROM media_sources WHERE name = ?',
      args: ['hatena']
    });

    if (existing.rows.length > 0) {
      console.log('⚠️  Hatena Blog already exists in media_sources');
      return;
    }

    // はてなブログを追加
    await client.execute({
      sql: `INSERT INTO media_sources (name, display_name, base_url, api_endpoint, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'hatena',
        'はてなブログ',
        'https://hatenablog.com',
        'rss', // RSS フィードを使用
        1, // is_active
        Date.now(),
        Date.now()
      ]
    });

    console.log('✅ Hatena Blog added to media_sources successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

seedHatena();
