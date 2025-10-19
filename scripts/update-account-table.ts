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

  console.log('🚀 Updating account table...\n');

  try {
    // Drop and recreate account table with new fields
    console.log('1. Dropping old account table...');
    await client.execute('DROP TABLE IF EXISTS account');
    console.log('   ✓ Old account table dropped');

    console.log('\n2. Creating account table with new fields...');
    await client.execute(`
      CREATE TABLE account (
        id TEXT PRIMARY KEY NOT NULL,
        accountId TEXT NOT NULL,
        providerId TEXT NOT NULL,
        userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
        accessToken TEXT,
        refreshToken TEXT,
        idToken TEXT,
        accessTokenExpiresAt INTEGER,
        refreshTokenExpiresAt INTEGER,
        scope TEXT,
        password TEXT,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      )
    `);
    console.log('   ✓ Account table created');

    console.log('\n✅ Account table updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
