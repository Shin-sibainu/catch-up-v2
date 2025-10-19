import { createClient } from '@libsql/client';
import { config } from 'dotenv';
import { resolve } from 'path';
import bcrypt from 'bcryptjs';

config({ path: resolve(process.cwd(), '.env.local') });

async function createTestUser() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const hashedPassword = await bcrypt.hash('password123', 10);
  const userId = 'test-user-001';

  try {
    // Check if user already exists
    const existing = await client.execute({
      sql: 'SELECT id FROM user WHERE email = ?',
      args: ['test@example.com']
    });

    if (existing.rows.length > 0) {
      console.log('⚠️  Test user already exists!');
      console.log('Email: test@example.com');
      console.log('Password: password123');
      return;
    }

    // Create user
    await client.execute({
      sql: 'INSERT INTO user (id, email, emailVerified, name, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
      args: [userId, 'test@example.com', 1, 'Test User', Date.now(), Date.now()]
    });

    // Create account with password
    await client.execute({
      sql: 'INSERT INTO account (id, accountId, providerId, userId, password, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: ['acc-' + userId, 'test@example.com', 'credential', userId, hashedPassword, Date.now(), Date.now()]
    });

    console.log('✅ Test user created successfully!');
    console.log('Email: test@example.com');
    console.log('Password: password123');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTestUser();
