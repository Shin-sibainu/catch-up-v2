import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { articles, mediaSources } from '../src/db/schema.js';
import { eq, desc, count } from 'drizzle-orm';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

async function checkArticles() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const db = drizzle(client);
  console.log('=== Article counts by media source ===\n');

  const sources = await db.select().from(mediaSources);

  for (const source of sources) {
    const [result] = await db
      .select({ count: count() })
      .from(articles)
      .where(eq(articles.mediaSourceId, source.id));

    console.log(`${source.displayName}: ${result.count} articles`);
  }

  // 最新5件を表示
  console.log('\n=== Latest 5 Articles ===\n');
  const latest = await db
    .select({
      title: articles.title,
      source: mediaSources.displayName,
      createdAt: articles.createdAt
    })
    .from(articles)
    .innerJoin(mediaSources, eq(articles.mediaSourceId, mediaSources.id))
    .orderBy(desc(articles.createdAt))
    .limit(5);

  latest.forEach(a => {
    console.log(`[${a.source}] ${a.title}`);
    console.log(`  Created: ${a.createdAt}\n`);
  });
}

checkArticles();
