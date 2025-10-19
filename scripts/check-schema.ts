import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { count } from 'drizzle-orm';
import * as schema from '../src/db/schema.js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

const { users, articles, tags, mediaSources, articleTags } = schema;

async function checkSchema() {
  try {
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    const db = drizzle(client, { schema });

    console.log('📊 Database Schema Status\n');

    // Count records in each table
    const [usersCount] = await db.select({ count: count() }).from(users);
    const [articlesCount] = await db.select({ count: count() }).from(articles);
    const [tagsCount] = await db.select({ count: count() }).from(tags);
    const [mediaSourcesCount] = await db.select({ count: count() }).from(mediaSources);
    const [articleTagsCount] = await db.select({ count: count() }).from(articleTags);

    console.log('📋 Table Records:');
    console.log(`  users:         ${usersCount.count} records`);
    console.log(`  articles:      ${articlesCount.count} records`);
    console.log(`  tags:          ${tagsCount.count} records`);
    console.log(`  media_sources: ${mediaSourcesCount.count} records`);
    console.log(`  article_tags:  ${articleTagsCount.count} records`);

    // Check if users table has correct schema
    console.log('\n👤 Users Table:');
    const sampleUsers = await db.select().from(users).limit(5);
    if (sampleUsers.length > 0) {
      console.log('  Sample user:', JSON.stringify(sampleUsers[0], null, 2));
    } else {
      console.log('  ✅ Table exists and is ready for data (currently empty)');
    }

    // Check recent articles
    console.log('\n📰 Recent Articles (sample):');
    const recentArticles = await db
      .select({
        id: articles.id,
        title: articles.title,
        mediaSourceId: articles.mediaSourceId,
        likesCount: articles.likesCount,
        publishedAt: articles.publishedAt,
      })
      .from(articles)
      .limit(3);

    recentArticles.forEach((article) => {
      console.log(`  [${article.id}] ${article.title.substring(0, 50)}...`);
    });

    console.log('\n✅ Schema check completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking schema:', error);
    process.exit(1);
  }
}

checkSchema();
