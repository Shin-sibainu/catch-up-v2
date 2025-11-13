import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface YouTubeRecommendation {
  title: string;
  description: string;
  keywords: string[];
  targetAudience: string;
}

export interface SourceArticle {
  title: string;
  url: string;
  mediaSourceName: string;
  likesCount: number;
  bookmarksCount: number;
  trendScore: number;
}

export interface TrendAnalysis {
  summary: string;
  emergingTopics: string[];
  youtubeRecommendations: YouTubeRecommendation[];
  sourceArticles: SourceArticle[]; // 分析に使用した記事の出典
  analyzedAt: Date;
}

/**
 * 記事データからトレンド分析を実行
 */
export async function analyzeTrends(
  articles: Array<{
    title: string;
    description: string | null;
    tags: string[];
    trendScore: number;
    likesCount: number;
    bookmarksCount: number;
    url?: string;
    mediaSourceName?: string;
  }>
): Promise<Omit<TrendAnalysis, "sourceArticles">> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  // 記事データを要約（最大100件に増加）
  const sampleArticles = articles.slice(0, 100);

  // 統計情報を計算
  const totalLikes = sampleArticles.reduce((sum, a) => sum + a.likesCount, 0);
  const totalBookmarks = sampleArticles.reduce(
    (sum, a) => sum + a.bookmarksCount,
    0
  );
  const avgTrendScore =
    sampleArticles.reduce((sum, a) => sum + a.trendScore, 0) /
    sampleArticles.length;

  // タグの頻度を計算
  const tagFrequency: Record<string, number> = {};
  sampleArticles.forEach((article) => {
    article.tags.forEach((tag) => {
      tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
    });
  });
  const topTags = Object.entries(tagFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([tag, count]) => `${tag}(${count})`)
    .join(", ");

  // 記事データを詳細にフォーマット
  const articlesText = sampleArticles
    .map((article, index) => {
      const tags =
        article.tags.length > 0 ? `[${article.tags.join(", ")}]` : "";
      const engagement = `👍${article.likesCount} 🔖${
        article.bookmarksCount
      } 📊${Math.round(article.trendScore)}`;
      return `${index + 1}. ${article.title}${
        article.description
          ? `\n   説明: ${article.description.substring(0, 150)}`
          : ""
      }\n   タグ: ${tags}\n   エンゲージメント: ${engagement}`;
    })
    .join("\n\n");

  // Gemini 2.5 Flashモデルを優先使用（より高速で安定）
  // 利用できない場合は2.5-pro、さらに2.0-flash-expにフォールバック
  // モデル名の優先順位: gemini-2.5-flash > gemini-2.5-pro > gemini-2.0-flash-exp
  const modelNames = [
    "gemini-2.5-flash", // より高速で安定しているため優先
    "gemini-2.5-pro",
    "gemini-2.0-flash-exp",
  ];

  const prompt = `あなたは技術トレンド分析の専門家です。以下の技術記事データを詳細に分析して、現在の技術トレンドを深く洞察してください。

【分析対象データ】
- 記事数: ${sampleArticles.length}件
- 総いいね数: ${totalLikes}
- 総ブックマーク数: ${totalBookmarks}
- 平均トレンドスコア: ${Math.round(avgTrendScore)}
- 人気タグ（上位20）: ${topTags}

【記事詳細リスト】
${articlesText}

【分析の指示】
以下の点を重視して分析してください：
1. 記事のタイトル、説明、タグ、エンゲージメント（いいね・ブックマーク・トレンドスコア）を総合的に評価
2. 単なるキーワードの頻度だけでなく、記事の内容とエンゲージメントから真のトレンドを抽出
3. 新興技術や急成長している分野を特定
4. YouTube動画コンテンツのレコメンドは、トレンド分析の結果から、技術者向けの教育コンテンツとして価値のあるトピックを提案してください

以下の形式でJSONを返してください：
{
  "summary": "全体的なトレンドの要約（3-5文で詳細に）",
  "emergingTopics": ["新興トピック1（具体的に）", "新興トピック2", "新興トピック3", "新興トピック4", "新興トピック5", "新興トピック6", "新興トピック7", "新興トピック8"],
  "youtubeRecommendations": [
    {
      "title": "YouTube動画のタイトル案（具体的で魅力的なタイトル）",
      "description": "動画の内容説明（2-3文で、なぜこのトピックが今重要か、どのような内容を扱うか）",
      "keywords": ["キーワード1", "キーワード2", "キーワード3", "キーワード4", "キーワード5"],
      "targetAudience": "ターゲット視聴者（例: 中級エンジニア、フロントエンド開発者、AI/ML初心者など）"
    }
  ]
}

YouTubeレコメンドは6件、トレンド分析の結果から最も価値のあるコンテンツトピックを選んでください。
JSONのみを返してください。説明文やコメントは不要です。`;

  // リトライ関数（指数バックオフ付き）
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const retryWithBackoff = async (
    fn: () => Promise<string>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<string> => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        // 503エラー（過負荷）の場合はリトライ
        if (
          (errorMessage.includes("503") ||
            errorMessage.includes("Service Unavailable") ||
            errorMessage.includes("overloaded")) &&
          attempt < maxRetries - 1
        ) {
          const delay = baseDelay * Math.pow(2, attempt);
          console.warn(
            `Model overloaded, retrying in ${delay}ms... (attempt ${
              attempt + 1
            }/${maxRetries})`
          );
          await sleep(delay);
          continue;
        }

        // その他のエラーは再スロー
        throw error;
      }
    }
    throw new Error("Max retries exceeded");
  };

  try {
    let text: string | undefined;

    // モデルのフォールバック処理（API呼び出し時にエラーが発生した場合）
    for (let i = 0; i < modelNames.length; i++) {
      try {
        const currentModel = genAI.getGenerativeModel({ model: modelNames[i] });

        // リトライロジック付きでAPI呼び出し
        text = await retryWithBackoff(async () => {
          const result = await currentModel.generateContent(prompt);
          const response = await result.response;
          return response.text();
        });

        break; // 成功したらループを抜ける
      } catch (modelError: unknown) {
        const errorMessage =
          modelError instanceof Error ? modelError.message : String(modelError);

        // APIキーの問題を検出
        if (
          errorMessage.includes("403") ||
          errorMessage.includes("Forbidden") ||
          errorMessage.includes("API key") ||
          errorMessage.includes("leaked") ||
          errorMessage.includes("invalid")
        ) {
          throw new Error(
            "APIキーに問題があります。Google AI Studio (https://aistudio.google.com/app/apikey) で新しいAPIキーを取得して、環境変数 GEMINI_API_KEY に設定してください。"
          );
        }

        // 503エラー（過負荷）の場合は次のモデルを試す
        if (
          errorMessage.includes("503") ||
          errorMessage.includes("Service Unavailable") ||
          errorMessage.includes("overloaded")
        ) {
          if (i === modelNames.length - 1) {
            throw new Error(
              "すべてのモデルが過負荷状態です。しばらく時間をおいてから再度お試しください。"
            );
          }
          console.warn(
            `Model ${modelNames[i]} is overloaded, trying next model...`
          );
          continue;
        }

        // モデルが見つからない場合（404エラーなど）は次のモデルを試す
        if (
          errorMessage.includes("404") ||
          errorMessage.includes("not found")
        ) {
          if (i === modelNames.length - 1) {
            // 最後のモデルでも失敗した場合はエラーを投げる
            throw modelError;
          }
          console.warn(
            `Model ${modelNames[i]} not available, trying next model...`
          );
          continue;
        }
        // その他のエラーはそのまま投げる
        throw modelError;
      }
    }

    if (!text) {
      throw new Error("Failed to generate content from any available model");
    }

    // JSONを抽出（```json```で囲まれている場合がある）
    let jsonText = text.trim();
    if (jsonText.includes("```json")) {
      jsonText = jsonText.split("```json")[1].split("```")[0].trim();
    } else if (jsonText.includes("```")) {
      jsonText = jsonText.split("```")[1].split("```")[0].trim();
    }

    // JSONパースを試行
    let analysis: Omit<TrendAnalysis, "analyzedAt">;
    try {
      analysis = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Raw response text:", text);
      console.error("Extracted JSON text:", jsonText);
      throw new Error(
        `JSONの解析に失敗しました。AIの応答が不正な形式です: ${
          parseError instanceof Error ? parseError.message : String(parseError)
        }`
      );
    }

    // 必須フィールドの検証
    if (
      !analysis.summary ||
      !Array.isArray(analysis.emergingTopics) ||
      !Array.isArray(analysis.youtubeRecommendations)
    ) {
      console.error("Invalid analysis structure:", analysis);
      throw new Error("AIの応答に必要なフィールドが含まれていません");
    }

    return {
      ...analysis,
      analyzedAt: new Date(),
    };
  } catch (error) {
    console.error("Error analyzing trends with Gemini:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    // エラーを再スローして、APIルートで適切に処理できるようにする
    throw new Error(`トレンド分析エラー: ${errorMessage}`);
  }
}
