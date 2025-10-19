import { createClient } from '@libsql/client';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

async function migrate() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  console.log('🚀 Creating favorites table...\n');

  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
        article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
        created_at INTEGER NOT NULL,
        UNIQUE(user_id, article_id)
      )
    `);
    console.log('   ✓ Favorites table created');

    await client.execute('CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites (user_id)');
    await client.execute('CREATE INDEX IF NOT EXISTS idx_favorites_article ON favorites (article_id)');
    console.log('   ✓ Indexes created');

    console.log('\n✅ Favorites table migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
