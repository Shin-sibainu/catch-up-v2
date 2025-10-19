import { NextRequest, NextResponse } from 'next/server';
import { db, mediaSources, articles, tags, articleTags, crawlLogs } from '@/db';
import { eq } from 'drizzle-orm';
import { QiitaClient } from '@/lib/api/qiita';
import { ZennClient } from '@/lib/api/zenn';
import { NoteClient } from '@/lib/api/note';
import { fetchHatenaArticles } from '@/lib/api/hatena';
import { generateTagSlug } from '@/lib/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60秒タイムアウト

/**
 * 記事収集バッチ処理
 * Vercel Cron Jobsから定期的に実行される
 */
export async function GET(request: NextRequest) {
  // Cron Jobの認証（本番環境のみ）
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('🚀 Starting article collection batch...');

  try {
    // アクティブなメディアソースを取得
    const activeSources = await db
      .select()
      .from(mediaSources)
      .where(eq(mediaSources.isActive, true));

    const results = await Promise.allSettled(
      activeSources.map((source) => collectFromSource(source))
    );

    // 結果をまとめる
    const summary = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return {
          source: activeSources[index].displayName,
          status: 'success',
          count: result.value,
        };
      } else {
        return {
          source: activeSources[index].displayName,
          status: 'failed',
          error: result.reason.message,
        };
      }
    });

    console.log('✅ Article collection completed:', summary);

    return NextResponse.json({
      success: true,
      summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Batch process error:', error);
    return NextResponse.json(
      { error: 'Failed to collect articles' },
      { status: 500 }
    );
  }
}

/**
 * 特定のメディアソースから記事を収集
 */
async function collectFromSource(source: typeof mediaSources.$inferSelect) {
  const startedAt = new Date();
  let articlesCollected = 0;
  let status: 'success' | 'failed' | 'partial' = 'success';
  let errorMessage: string | null = null;

  try {
    console.log(`📥 Collecting from ${source.displayName}...`);

    if (source.name === 'qiita') {
      articlesCollected = await collectFromQiita(source.id);
    } else if (source.name === 'zenn') {
      articlesCollected = await collectFromZenn(source.id);
    } else if (source.name === 'note') {
      articlesCollected = await collectFromNote(source.id);
    } else if (source.name === 'hatena') {
      articlesCollected = await collectFromHatena(source.id);
    }

    console.log(`✓ Collected ${articlesCollected} articles from ${source.displayName}`);
  } catch (error) {
    console.error(`✗ Error collecting from ${source.displayName}:`, error);
    status = 'failed';
    errorMessage = error instanceof Error ? error.message : 'Unknown error';
  }

  // クロールログを記録
  await db.insert(crawlLogs).values({
    mediaSourceId: source.id,
    status,
    articlesCollected,
    errorMessage,
    startedAt,
    completedAt: new Date(),
    createdAt: new Date(),
  });

  return articlesCollected;
}

/**
 * Qiitaから記事を収集
 */
async function collectFromQiita(mediaSourceId: number): Promise<number> {
  const client = new QiitaClient(process.env.QIITA_ACCESS_TOKEN!);

  // トレンド記事を取得（直近1週間でストック数10以上）
  const query = `created:>${getOneWeekAgo()} stocks:>10`;
  const items = await client.fetchItems({ query, perPage: 100 });

  let count = 0;

  for (const item of items) {
    try {
      // 記事を挿入/更新
      const articleData = client.mapToArticle(item, mediaSourceId);
      await db
        .insert(articles)
        .values(articleData)
        .onConflictDoUpdate({
          target: articles.url,
          set: {
            likesCount: articleData.likesCount,
            bookmarksCount: articleData.bookmarksCount,
            commentsCount: articleData.commentsCount,
            trendScore: articleData.trendScore,
            updatedAt: new Date(),
          },
        });

      // 記事IDを取得
      const [savedArticle] = await db
        .select()
        .from(articles)
        .where(eq(articles.url, articleData.url))
        .limit(1);

      // タグを保存
      const tagNames = client.extractTags(item);
      await saveTags(savedArticle.id, tagNames);

      count++;
    } catch (error) {
      console.error(`Error saving article ${item.id}:`, error);
    }
  }

  return count;
}

/**
 * Zennから記事を収集
 */
async function collectFromZenn(mediaSourceId: number): Promise<number> {
  const client = new ZennClient();

  // デイリートレンドを取得
  const zennArticles = await client.fetchArticles({ order: 'daily', count: 50 });

  let count = 0;

  for (const article of zennArticles) {
    try {
      // 記事を挿入/更新
      const articleData = client.mapToArticle(article, mediaSourceId);
      await db
        .insert(articles)
        .values(articleData)
        .onConflictDoUpdate({
          target: articles.url,
          set: {
            likesCount: articleData.likesCount,
            trendScore: articleData.trendScore,
            updatedAt: new Date(),
          },
        });

      // 記事IDを取得
      const [savedArticle] = await db
        .select()
        .from(articles)
        .where(eq(articles.url, articleData.url))
        .limit(1);

      // Zennはタグ情報がAPIに含まれないため、空配列
      const tagNames = client.extractTags(article);
      await saveTags(savedArticle.id, tagNames);

      count++;
    } catch (error) {
      console.error(`Error saving article ${article.id}:`, error);
    }
  }

  return count;
}

/**
 * note.comから記事を収集
 */
async function collectFromNote(mediaSourceId: number): Promise<number> {
  const client = new NoteClient();

  // 技術系キーワードで記事を取得
  const noteArticles = await client.fetchArticles({
    keywords: [
      'プログラミング',
      'エンジニア',
      'Web開発',
      'React',
      'Next.js',
      'TypeScript',
      'フロントエンド',
      'バックエンド',
      'AI',
      'ChatGPT',
    ],
    size: 50,
  });

  let count = 0;

  for (const article of noteArticles) {
    try {
      // 記事を挿入/更新
      const articleData = client.mapToArticle(article, mediaSourceId);
      await db
        .insert(articles)
        .values(articleData)
        .onConflictDoUpdate({
          target: articles.url,
          set: {
            likesCount: articleData.likesCount,
            commentsCount: articleData.commentsCount,
            trendScore: articleData.trendScore,
            updatedAt: new Date(),
          },
        });

      // 記事IDを取得
      const [savedArticle] = await db
        .select()
        .from(articles)
        .where(eq(articles.url, articleData.url))
        .limit(1);

      // タグを保存
      const tagNames = client.extractTags(article);
      await saveTags(savedArticle.id, tagNames);

      count++;
    } catch (error) {
      console.error(`Error saving article ${article.id}:`, error);
    }
  }

  return count;
}

/**
 * タグを保存し、記事との関連付けを行う
 */
async function saveTags(articleId: number, tagNames: string[]): Promise<void> {
  for (const tagName of tagNames) {
    try {
      const slug = generateTagSlug(tagName);

      // タグを挿入/取得
      await db
        .insert(tags)
        .values({
          name: tagName,
          displayName: tagName,
          slug,
          articleCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoNothing();

      // タグIDを取得
      const [tag] = await db.select().from(tags).where(eq(tags.slug, slug)).limit(1);

      if (tag) {
        // 記事とタグの関連付け
        await db
          .insert(articleTags)
          .values({
            articleId,
            tagId: tag.id,
            createdAt: new Date(),
          })
          .onConflictDoNothing();
      }
    } catch (error) {
      console.error(`Error saving tag ${tagName}:`, error);
    }
  }
}

/**
 * はてなブログから記事を収集
 */
async function collectFromHatena(mediaSourceId: number): Promise<number> {
  // はてなブログの技術記事RSSを取得
  const hatenaArticles = await fetchHatenaArticles(50);

  let count = 0;

  for (const article of hatenaArticles) {
    try {
      // トレンドスコアを計算（はてなはいいね数がないため、記事の新しさを重視）
      const hoursSincePublished = (Date.now() - article.publishedAt.getTime()) / (1000 * 60 * 60);
      const trendScore = Math.max(0, Math.floor(100 - hoursSincePublished * 0.5));

      // 記事を挿入/更新
      const articleData = {
        externalId: article.id,
        mediaSourceId,
        title: article.title,
        url: article.url,
        description: article.description,
        body: article.content,
        likesCount: 0, // はてなブログはRSSにいいね数が含まれない
        bookmarksCount: 0,
        commentsCount: 0,
        viewsCount: 0,
        trendScore,
        authorName: article.author.name,
        authorId: article.author.url || article.author.name,
        authorProfileUrl: article.author.url,
        publishedAt: article.publishedAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db
        .insert(articles)
        .values(articleData)
        .onConflictDoUpdate({
          target: articles.url,
          set: {
            trendScore: articleData.trendScore,
            updatedAt: new Date(),
          },
        });

      // 記事IDを取得
      const [savedArticle] = await db
        .select()
        .from(articles)
        .where(eq(articles.url, articleData.url))
        .limit(1);

      // タグを保存（はてなブログのカテゴリをタグとして保存）
      await saveTags(savedArticle.id, article.categories);

      count++;
    } catch (error) {
      console.error(`Error saving Hatena article ${article.id}:`, error);
    }
  }

  return count;
}

/**
 * 1週間前の日付を取得（ISO 8601形式）
 */
function getOneWeekAgo(): string {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date.toISOString().split('T')[0];
}
