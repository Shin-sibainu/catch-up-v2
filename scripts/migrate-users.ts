import { createClient } from '@libsql/client';
import * as fs from 'fs';
import * as path from 'path';

async function migrate() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const sqlPath = path.join(process.cwd(), 'drizzle', '0001_tiny_lockjaw.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  // statement-breakpointで分割
  const statements = sql
    .split('--> statement-breakpoint')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`🚀 Executing ${statements.length} SQL statements...`);

  for (const statement of statements) {
    console.log(`Executing: ${statement.substring(0, 50)}...`);
    await client.execute(statement);
  }

  console.log('✅ Migration completed successfully!');
  process.exit(0);
}

migrate().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
