import { db, articles, mediaSources } from '../src/db';
import { eq } from 'drizzle-orm';

async function resetNoteArticles() {
  console.log('🗑️ Deleting old note.com articles...');

  // note.comのメディアソースIDを取得
  const noteSource = await db
    .select()
    .from(mediaSources)
    .where(eq(mediaSources.name, 'note'))
    .limit(1);

  if (!noteSource.length) {
    console.log('❌ note.com media source not found');
    return;
  }

  // note.comの記事を全削除
  const result = await db
    .delete(articles)
    .where(eq(articles.mediaSourceId, noteSource[0].id));

  console.log('✅ Deleted note.com articles');
  console.log('ℹ️ Please run the cron job again to re-collect with correct URLs');
}

resetNoteArticles();
