import { db, articles, mediaSources } from '../src/db';
import { eq } from 'drizzle-orm';

async function checkNoteUrls() {
  const noteSource = await db
    .select()
    .from(mediaSources)
    .where(eq(mediaSources.name, 'note'))
    .limit(1);

  if (!noteSource.length) {
    console.log('note.com media source not found');
    return;
  }

  const noteArticles = await db
    .select()
    .from(articles)
    .where(eq(articles.mediaSourceId, noteSource[0].id))
    .limit(5);

  console.log('Sample note.com article URLs:\n');
  noteArticles.forEach((a, i) => {
    console.log(`${i + 1}. Title: ${a.title.substring(0, 60)}...`);
    console.log(`   URL: ${a.url}`);
    console.log(`   External ID: ${a.externalId}`);
    console.log('');
  });
}

checkNoteUrls();
