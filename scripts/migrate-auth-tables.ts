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

  console.log('🚀 Migrating Better Auth tables...\n');

  try {
    // 1. Drop old users table
    console.log('1. Dropping old users table...');
    await client.execute('DROP TABLE IF EXISTS users');
    console.log('   ✓ Old users table dropped');

    // 2. Create user table (Better Auth compatible)
    console.log('\n2. Creating user table...');
    await client.execute(`
      CREATE TABLE user (
        id TEXT PRIMARY KEY NOT NULL,
        email TEXT NOT NULL UNIQUE,
        emailVerified INTEGER DEFAULT 0 NOT NULL,
        name TEXT,
        image TEXT,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      )
    `);
    await client.execute('CREATE UNIQUE INDEX user_email_unique ON user (email)');
    await client.execute('CREATE INDEX idx_users_email ON user (email)');
    console.log('   ✓ User table created');

    // 3. Create session table
    console.log('\n3. Creating session table...');
    await client.execute(`
      CREATE TABLE session (
        id TEXT PRIMARY KEY NOT NULL,
        expiresAt INTEGER NOT NULL,
        token TEXT NOT NULL UNIQUE,
        ipAddress TEXT,
        userAgent TEXT,
        userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      )
    `);
    await client.execute('CREATE UNIQUE INDEX session_token_unique ON session (token)');
    console.log('   ✓ Session table created');

    // 4. Drop and recreate account table with new fields
    console.log('\n4. Recreating account table with new fields...');
    await client.execute('DROP TABLE IF EXISTS account');
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

    // 5. Create verification table
    console.log('\n5. Creating verification table...');
    await client.execute(`
      CREATE TABLE verification (
        id TEXT PRIMARY KEY NOT NULL,
        identifier TEXT NOT NULL,
        value TEXT NOT NULL,
        expiresAt INTEGER NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      )
    `);
    console.log('   ✓ Verification table created');

    console.log('\n✅ All Better Auth tables created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
