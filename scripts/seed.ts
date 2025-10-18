import { db, mediaSources } from '../src/db';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // メディアソースの初期データ
    const mediaSourcesData = [
      {
        name: 'qiita',
        displayName: 'Qiita',
        baseUrl: 'https://qiita.com',
        apiEndpoint: 'https://qiita.com/api/v2/items',
        iconUrl: '/icons/qiita.svg',
        isActive: true,
      },
      {
        name: 'zenn',
        displayName: 'Zenn',
        baseUrl: 'https://zenn.dev',
        apiEndpoint: 'https://zenn.dev/api/articles',
        iconUrl: '/icons/zenn.svg',
        isActive: true,
      },
      {
        name: 'note',
        displayName: 'note',
        baseUrl: 'https://note.com',
        apiEndpoint: 'https://note.com/api/v3/searches',
        iconUrl: '/icons/note.svg',
        isActive: true,
      },
    ];

    // メディアソースを挿入
    for (const source of mediaSourcesData) {
      await db.insert(mediaSources).values(source).onConflictDoNothing();
      console.log(`✓ Inserted media source: ${source.displayName}`);
    }

    console.log('✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
