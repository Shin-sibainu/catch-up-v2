import { NoteClient } from '../src/lib/api/note';

async function testNoteAPI() {
  console.log('🧪 Testing note.com API...\n');

  const client = new NoteClient();

  try {
    console.log('📥 Fetching articles with keywords: プログラミング, エンジニア, Web開発');

    // Test with a simple fetch first
    console.log('\n🔍 Testing direct API call...');
    const testUrl = 'https://note.com/api/v3/searches?q=プログラミング&context=note&size=5&start=0';
    console.log('URL:', testUrl);

    const testResponse = await fetch(testUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', testResponse.status);
    const testData = await testResponse.json();
    console.log('Response keys:', Object.keys(testData));
    console.log('Full response:', JSON.stringify(testData, null, 2));

    const articles = await client.fetchArticles({
      keywords: ['プログラミング', 'エンジニア', 'Web開発'],
      size: 10,
    });

    console.log(`\n✅ Successfully fetched ${articles.length} articles\n`);

    if (articles.length > 0) {
      console.log('First 3 articles:');
      articles.slice(0, 3).forEach((article, index) => {
        console.log(`\n${index + 1}. ${article.name || '無題'}`);
        console.log(`   ID: ${article.id}`);
        console.log(`   Price: ${article.price === 0 ? '無料' : `${article.price}円`}`);
        console.log(`   Like Count: ${article.like_count || 0}`);
        console.log(`   URL: ${article.noteUrl || 'N/A'}`);
        console.log(`   Author: ${article.user?.nickname || article.user?.name || '匿名'}`);
      });

      console.log('\n🔄 Testing mapToArticle...');
      const mappedArticle = client.mapToArticle(articles[0], 1);
      console.log('Mapped article:', {
        title: mappedArticle.title,
        url: mappedArticle.url,
        likesCount: mappedArticle.likesCount,
        authorName: mappedArticle.authorName,
      });

      console.log('\n🏷️ Testing extractTags...');
      const tags = client.extractTags(articles[0]);
      console.log(`Tags: ${tags.length > 0 ? tags.join(', ') : 'No tags'}`);
    } else {
      console.log('⚠️ No articles found. This might be expected if the API is rate limited or no articles match the keywords.');
    }

    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

testNoteAPI();
