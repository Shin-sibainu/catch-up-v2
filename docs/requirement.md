# 技術トレンドキュレーションサービス 要件定義書

**作成日**: 2025-10-18  
**バージョン**: 1.0

---

## 1. プロジェクト概要

### 1.1 目的
複数の技術メディアサイトからトレンド記事を自動収集し、エンジニアが効率的に最新の技術情報をキャッチアップできるキュレーションサービスを構築する。

### 1.2 ターゲットユーザー
- プライマリ: エンジニア(フロントエンド、バックエンド、モバイル、インフラ等)
- セカンダリ: 技術に興味のあるビジネス職、学生

### 1.3 提供価値
- 複数メディアのトレンド記事を一箇所で閲覧可能
- エンゲージメント指標(いいね、ブックマーク数)による質の高い記事の発見
- 将来的にAIによるトレンド分析とパーソナライズ

---

## 2. 機能要件

### 2.1 Phase 1: MVP (最小限の機能)

#### 2.1.1 記事一覧表示
**概要**: 収集した記事をトレンドスコア順に一覧表示

**表示項目**:
- 記事タイトル
- 記事説明文(要約)
- メディア名(Qiita/Zenn等)
- 著者情報(名前、アバター)
- エンゲージメント指標(いいね数、ブックマーク数)
- タグ(最大5個程度)
- 投稿日時
- サムネイル画像(あれば)

**ソート機能**:
- トレンドスコア順(デフォルト)
- いいね数順
- ブックマーク数順
- 新着順

**ページネーション**: 
- 無限スクロール または ページネーション
- 1ページあたり20-30件

#### 2.1.2 フィルタリング機能

**メディア別フィルター**:
- 全て(デフォルト)
- Qiita
- Zenn
- (将来追加メディア対応)

**期間別フィルター**:
- 今日
- 今週(過去7日間)
- 今月(過去30日間)
- 全期間

**タグフィルター**:
- タグクラウドまたはドロップダウンで選択
- 複数タグのAND/OR検索

#### 2.1.3 検索機能
- 記事タイトルでの全文検索
- タグ名での検索
- 著者名での検索

**検索UI**:
- ヘッダー固定の検索バー
- サジェスト機能(オプション)

#### 2.1.4 記事詳細へのリンク
- 各記事カードをクリックで元メディアへ遷移
- 新しいタブで開く

#### 2.1.5 レスポンシブデザイン
- モバイル(320px-767px)
- タブレット(768px-1023px)
- デスクトップ(1024px以上)

#### 2.1.6 データ収集バッチ処理

**対象メディア**:
- Qiita API
- Zenn RSS/API

**収集頻度**: 12時間ごと(0:00、12:00)

**収集データ**:
- 記事メタデータ(タイトル、URL、説明等)
- エンゲージメント指標
- タグ情報
- 著者情報

**実行基盤**: Vercel Cron Jobs

**エラーハンドリング**:
- 失敗時のリトライ(最大3回)
- エラーログの記録
- 部分的な成功も許容

---

### 2.2 Phase 2: ユーザー機能

#### 2.2.1 ユーザー認証
**認証方式**:
- メールアドレス + パスワード
- OAuth (Google, GitHub)

**実装**: Better Auth

#### 2.2.2 お気に入り機能
- 記事をお気に入りに追加
- お気に入り一覧ページ
- お気に入り記事の検索・フィルタリング

#### 2.2.3 既読管理
- 記事クリック時に既読フラグを自動付与
- 既読/未読フィルター
- 既読記事は視覚的に区別(透明度を下げる等)

#### 2.2.4 興味タグの設定
- ユーザーが興味のあるタグを登録
- 登録タグに基づくフィード優先表示

#### 2.2.5 マイページ
- プロフィール編集
- お気に入り記事一覧
- 興味タグ管理

---

### 2.3 Phase 3: AI機能

#### 2.3.1 ホットトピック分析
**概要**: 人気記事の内容をAIが分析し、今話題のトピックをランキング形式で表示

**機能詳細**:
- 過去7日間の人気記事(上位100-200件)を分析
- 頻出トピック/技術/キーワードを自動抽出
- トピックごとに以下を表示:
  - トピック名
  - 関連記事数
  - 総エンゲージメント数
  - AIによるトピックサマリー(2-3文)
  - 代表的な記事3-5件
  - トレンドスコア

**更新頻度**: 1日1回(深夜バッチ)

**実装技術**:
- Claude API または OpenAI API
- プロンプトエンジニアリング

#### 2.3.2 パーソナライズドフィード
- ユーザーの閲覧履歴、お気に入りを分析
- 興味に合った記事を優先表示
- レコメンデーションセクションの追加

---

## 3. 非機能要件

### 3.1 パフォーマンス
- 初回ページロード: 3秒以内
- ページ遷移: 1秒以内
- API レスポンス: 500ms以内(P95)

### 3.2 可用性
- 稼働率: 99.5%以上
- メンテナンス時間: 月1回、深夜時間帯

### 3.3 セキュリティ
- HTTPS通信
- XSS、CSRF対策
- SQLインジェクション対策(ORM使用)
- レート制限(API: 100req/min/IP)

### 3.4 スケーラビリティ
- 同時アクセス: 1000ユーザーまで対応
- 記事データ: 10万件まで対応
- 将来的な水平スケーリング可能な設計

### 3.5 保守性
- TypeScript による型安全性
- コンポーネント単位でのテスト
- ドキュメント整備(README、API仕様書)

---

## 4. 技術スタック

### 4.1 フロントエンド
- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **状態管理**: React Server Components + Client Components
- **データフェッチング**: Server Actions / fetch

### 4.2 バックエンド
- **フレームワーク**: Next.js 15 API Routes / Server Actions
- **言語**: TypeScript
- **ORM**: Drizzle ORM
- **バリデーション**: Zod

### 4.3 データベース
- **DBMS**: Turso (libSQL/SQLite互換)
- **特徴**: エッジ対応、低レイテンシ、コスト効率良好

### 4.4 認証
- **ライブラリ**: Better Auth
- **認証方式**: Email/Password, OAuth (Google, GitHub)

### 4.5 AI/機械学習
- **API**: Claude API (Anthropic) または OpenAI API
- **用途**: ホットトピック分析、記事要約

### 4.6 インフラ
- **ホスティング**: Vercel
- **バッチ処理**: Vercel Cron Jobs
- **環境変数管理**: Vercel Environment Variables

### 4.7 開発ツール
- **パッケージマネージャ**: npm / pnpm
- **Linter**: ESLint
- **Formatter**: Prettier
- **Git**: GitHub
- **CI/CD**: GitHub Actions + Vercel自動デプロイ

---

## 5. データベース設計

### 5.1 テーブル一覧

#### Phase 1 テーブル

**media_sources** (メディアソース)
```
- id: INTEGER PRIMARY KEY
- name: TEXT UNIQUE NOT NULL (例: 'qiita', 'zenn')
- display_name: TEXT NOT NULL (例: 'Qiita', 'Zenn')
- base_url: TEXT NOT NULL
- api_endpoint: TEXT
- icon_url: TEXT
- is_active: BOOLEAN DEFAULT true
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**articles** (記事)
```
- id: INTEGER PRIMARY KEY
- external_id: TEXT NOT NULL (メディア側のID)
- media_source_id: INTEGER FK -> media_sources
- title: TEXT NOT NULL
- url: TEXT UNIQUE NOT NULL
- description: TEXT
- body: TEXT (AI分析用)
- thumbnail_url: TEXT
- likes_count: INTEGER DEFAULT 0
- bookmarks_count: INTEGER DEFAULT 0
- comments_count: INTEGER DEFAULT 0
- views_count: INTEGER DEFAULT 0
- trend_score: INTEGER DEFAULT 0
- author_name: TEXT
- author_id: TEXT
- author_profile_url: TEXT
- author_avatar_url: TEXT
- published_at: TIMESTAMP NOT NULL
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

INDEX: media_source_id, trend_score, published_at, (external_id, media_source_id)
```

**tags** (タグ)
```
- id: INTEGER PRIMARY KEY
- name: TEXT UNIQUE NOT NULL
- display_name: TEXT NOT NULL
- slug: TEXT UNIQUE NOT NULL
- color: TEXT
- icon_url: TEXT
- article_count: INTEGER DEFAULT 0
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

INDEX: name, slug
```

**article_tags** (記事タグ中間テーブル)
```
- article_id: INTEGER FK -> articles
- tag_id: INTEGER FK -> tags
- created_at: TIMESTAMP

PRIMARY KEY: (article_id, tag_id)
INDEX: article_id, tag_id
```

**crawl_logs** (収集ログ)
```
- id: INTEGER PRIMARY KEY
- media_source_id: INTEGER FK -> media_sources
- status: TEXT NOT NULL ('success', 'failed', 'partial')
- articles_collected: INTEGER DEFAULT 0
- error_message: TEXT
- started_at: TIMESTAMP NOT NULL
- completed_at: TIMESTAMP
- created_at: TIMESTAMP

INDEX: media_source_id, status
```

#### Phase 2 テーブル

**users** (ユーザー)
```
- id: TEXT PRIMARY KEY (Better Auth ID)
- email: TEXT UNIQUE NOT NULL
- name: TEXT
- avatar_url: TEXT
- is_premium: BOOLEAN DEFAULT false
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

INDEX: email
```

**favorites** (お気に入り)
```
- id: INTEGER PRIMARY KEY
- user_id: TEXT FK -> users
- article_id: INTEGER FK -> articles
- created_at: TIMESTAMP

INDEX: (user_id, article_id)
UNIQUE: (user_id, article_id)
```

**read_articles** (既読記事)
```
- id: INTEGER PRIMARY KEY
- user_id: TEXT FK -> users
- article_id: INTEGER FK -> articles
- read_at: TIMESTAMP

INDEX: (user_id, article_id)
UNIQUE: (user_id, article_id)
```

**user_interests** (ユーザー興味タグ)
```
- user_id: TEXT FK -> users
- tag_id: INTEGER FK -> tags
- weight: INTEGER DEFAULT 1
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

PRIMARY KEY: (user_id, tag_id)
```

#### Phase 3 テーブル

**hot_topics** (ホットトピック)
```
- id: INTEGER PRIMARY KEY
- name: TEXT NOT NULL
- slug: TEXT NOT NULL
- description: TEXT (AIサマリー)
- article_count: INTEGER DEFAULT 0
- total_engagement: INTEGER DEFAULT 0
- trend_score: INTEGER DEFAULT 0
- rank: INTEGER
- period_start: TIMESTAMP NOT NULL
- period_end: TIMESTAMP NOT NULL
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

INDEX: (period_start, period_end), rank
```

**hot_topic_articles** (トピック記事関連)
```
- hot_topic_id: INTEGER FK -> hot_topics
- article_id: INTEGER FK -> articles
- relevance_score: INTEGER DEFAULT 0
- created_at: TIMESTAMP

PRIMARY KEY: (hot_topic_id, article_id)
INDEX: hot_topic_id
```

---

## 6. API設計

### 6.1 記事取得API

#### GET /api/articles
**概要**: 記事一覧を取得

**クエリパラメータ**:
```typescript
{
  page?: number;           // ページ番号 (default: 1)
  limit?: number;          // 取得件数 (default: 20, max: 100)
  media?: string[];        // メディアID配列
  period?: 'day' | 'week' | 'month' | 'all'; // 期間
  tags?: string[];         // タグID配列
  sort?: 'trend' | 'likes' | 'bookmarks' | 'latest'; // ソート
  search?: string;         // 検索クエリ
}
```

**レスポンス**:
```typescript
{
  articles: Article[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

#### GET /api/articles/[id]
**概要**: 記事詳細を取得

**レスポンス**: `Article`

### 6.2 タグ取得API

#### GET /api/tags
**概要**: タグ一覧を取得

**クエリパラメータ**:
```typescript
{
  popular?: boolean;  // 人気タグのみ
  limit?: number;     // 取得件数
}
```

**レスポンス**: `Tag[]`

### 6.3 メディアソース取得API

#### GET /api/media-sources
**概要**: メディアソース一覧を取得

**レスポンス**: `MediaSource[]`

### 6.4 Phase 2: ユーザーAPI

#### POST /api/favorites
**概要**: お気に入りに追加

**リクエストボディ**:
```typescript
{
  articleId: number;
}
```

#### DELETE /api/favorites/[id]
**概要**: お気に入りから削除

#### GET /api/favorites
**概要**: ユーザーのお気に入り一覧取得

**レスポンス**: `Article[]`

#### POST /api/read-articles
**概要**: 既読記事を記録

**リクエストボディ**:
```typescript
{
  articleId: number;
}
```

### 6.5 Phase 3: AI機能API

#### GET /api/hot-topics
**概要**: ホットトピックランキング取得

**クエリパラメータ**:
```typescript
{
  period?: 'week' | 'month'; // 分析期間
  limit?: number;            // 取得件数 (default: 10)
}
```

**レスポンス**: `HotTopic[]`

---

## 7. 外部API仕様

### 7.1 Qiita API

**エンドポイント**: `https://qiita.com/api/v2/items`

**必要な情報**:
- アクセストークン(環境変数)
- レート制限: 1000 req/hour (認証済み)

**取得データ**:
```typescript
{
  id: string;
  title: string;
  url: string;
  body: string;
  likes_count: number;
  stocks_count: number; // ブックマーク数
  comments_count: number;
  tags: { name: string }[];
  user: {
    id: string;
    name: string;
    profile_image_url: string;
  };
  created_at: string;
  updated_at: string;
}
```

### 7.2 Zenn API/RSS

**エンドポイント**: 
- RSS: `https://zenn.dev/feed`
- API: `https://zenn.dev/api/articles` (非公式)

**取得データ**:
```typescript
{
  id: string;
  title: string;
  slug: string;
  emoji: string;
  liked_count: number;
  body_letters_count: number;
  article_type: string;
  published_at: string;
  user: {
    username: string;
    name: string;
    avatar_small_url: string;
  };
}
```

---

## 8. バッチ処理仕様

### 8.1 記事収集バッチ

**ファイル**: `/app/api/cron/collect-articles/route.ts`

**実行頻度**: 12時間ごと (0:00, 12:00 JST)

**処理フロー**:
1. アクティブなメディアソースを取得
2. 各メディアのAPIを呼び出し
3. 記事データをパース・正規化
4. 既存記事は更新、新規記事は挿入
5. タグの抽出・関連付け
6. トレンドスコアの計算
7. crawl_logsに結果を記録

**トレンドスコア計算式**:
```
trend_score = (likes_count * 2) + (bookmarks_count * 3) + (comments_count * 1) - (hours_since_published * 0.1)
```

**エラーハンドリング**:
- メディアごとに独立して処理
- 失敗しても他のメディアの収集は継続
- 3回までリトライ
- エラー詳細をログに記録

### 8.2 Phase 3: ホットトピック分析バッチ

**ファイル**: `/app/api/cron/analyze-hot-topics/route.ts`

**実行頻度**: 1日1回 (深夜2:00 JST)

**処理フロー**:
1. 過去7日間の人気記事(トレンドスコア上位200件)を取得
2. 記事タイトル・本文をClaude APIに送信
3. AIにトピック抽出を依頼
4. 抽出されたトピックをDBに保存
5. 各トピックに関連記事を紐付け
6. ランキング計算

**プロンプト例**:
```
以下は過去7日間で人気のあった技術記事のタイトル一覧です。
この中から、現在トレンドになっている技術トピックを10個抽出し、
各トピックについて2-3文で説明してください。

[記事タイトル一覧]
...
```

---

## 9. UI/UX要件

### 9.1 デザインコンセプト

**テーマ**: エンジニア向けのスタイリッシュでカッコいいUI

**デザインの方向性**:
- **ダークモード優先**: 目に優しく、開発環境に馴染むダークベースのデザイン
- **ミニマリスト**: 無駄を削ぎ落としたクリーンなレイアウト
- **モダン**: グラスモーフィズム、微細なアニメーション、グラデーション効果
- **ターミナルライク**: 開発ツールのようなシャープで機能的なデザイン
- **情報密度**: エンジニアが効率的に情報を取得できる適度な情報密度

**参考イメージ**:
- GitHub (洗練されたダークUI)
- Vercel (ミニマルでスタイリッシュ)
- Linear (美しいグラデーションとアニメーション)
- Raycast (シャープで機能的)

### 9.2 デザインシステム

**カラーパレット** (ダークモード):
- Background Primary: #0a0a0a (深い黒)
- Background Secondary: #1a1a1a (カードなど)
- Background Tertiary: #2a2a2a (ホバー時など)
- Border: #333333 (境界線)
- Primary: #3B82F6 → #60A5FA (明るめの青、グラデーション対応)
- Accent: #8B5CF6 → #A78BFA (紫系グラデーション)
- Success: #10B981
- Warning: #F59E0B
- Error: #EF4444
- Text Primary: #FAFAFA (ほぼ白)
- Text Secondary: #A1A1A1 (グレー)
- Text Tertiary: #737373 (薄いグレー)

**タイポグラフィ**:
- フォント: 'Inter', 'JetBrains Mono'(コード用), 'Noto Sans JP'
- 見出し: 24px-32px (Bold/Semibold)
- 本文: 14px-16px (Regular)
- キャプション: 12px-14px (Regular)
- コードスニペット: 13px-14px (JetBrains Mono)

**視覚効果**:
- グラスモーフィズム: `backdrop-blur-md bg-white/5 border border-white/10`
- シャドウ: 微細な影とグロー効果を組み合わせ
- グラデーション: 
  - Primary: `from-blue-500 to-blue-600`
  - Accent: `from-purple-500 to-indigo-500`
  - カード: `from-gray-900/50 to-gray-800/50`
- アニメーション: 
  - ホバー時のスムーズな遷移 (transition-all duration-200)
  - ページ遷移時のフェード
  - カードの微細な浮き上がり効果
- ボーダー: 1px の細いボーダーを基本に、アクセント時はグロー効果

### 9.3 主要画面

#### 9.3.1 トップページ
- **ヘッダー**
  - 固定ヘッダー、グラスモーフィズム効果
  - ロゴ(左上、モノグラムまたはテキストロゴ)
  - 中央に検索バー(フォーカス時に拡大・グロー効果)
  - 右側にナビゲーションとユーザーアイコン
  
- **フィルターバー**
  - ピルボタン形式(Rounded, ホバー時にグロー)
  - 選択中の項目は背景グラデーション + ボーダーグロー
  - スムーズなアニメーション
  
- **記事カード一覧**
  - 2カラムまたは3カラムのグリッド(画面サイズ応じて)
  - カード間の適度な余白(gap-6)
  - 無限スクロール、読み込み時はスケルトンローディング
  
- **サイドバー**(デスクトップのみ)
  - 人気タグクラウド(ホバー時に拡大・グロー)
  - 統計情報(アニメーション付きカウントアップ)
  - ガラス効果の背景

#### 9.3.2 記事カード
- **デザイン要素**:
  - ダークグラデーション背景 + 細いボーダー
  - ホバー時: 浮き上がり(translateY)、ボーダーグロー、シャドウ強調
  - サムネイル画像(16:9、Rounded corners、オーバーレイグラデーション)
  - 情報は視覚的にグルーピング(アイコン + テキスト)
  
- **レイアウト**:
  ```
  [サムネイル画像]
  [メディアバッジ (小さく、右上に絶対配置)]
  
  [タイトル - 16px Bold, 2行まで]
  [説明文 - 14px Regular, 3行まで, 透明度80%]
  
  [著者情報 - アバター + 名前]
  [エンゲージメント - アイコン + 数値を横並び]
  [タグ - ピルボタン形式、最大3個]
  [投稿日時 - 右下、小さく表示]
  ```

- **インタラクション**:
  - カード全体がクリッカブル
  - ホバー時に微細なスケール変化(scale-[1.02])
  - タグやメディアバッジは個別にクリック可能(イベント伝播制御)

#### 9.3.3 ヘッダー
- **スタイル**: 
  - グラスモーフィズム(`backdrop-blur-lg bg-black/60`)
  - 下部に細いボーダー + グロー
  - スクロール時に背景の不透明度が上がる
  
- **検索バー**:
  - ダーク背景、フォーカス時にボーダーグロー
  - アイコン(虫眼鏡)は左側
  - プレースホルダー: "Search articles, tags, authors..."
  - キーボードショートカット表示(⌘K / Ctrl+K)

- **ナビゲーション**:
  - テキストリンク、ホバー時にアンダーライン + グロー
  - アクティブページは色変化

#### 9.3.4 その他のUIコンポーネント

- **ボタン**:
  - Primary: グラデーション背景 + ホバー時に明るく
  - Secondary: 透明背景 + ボーダー + ホバー時に背景色
  - Ghost: 背景なし、ホバー時に薄い背景
  
- **バッジ・タグ**:
  - ピルボタン形式(Rounded-full)
  - 半透明背景 + 細いボーダー
  - ホバー時に背景明度アップ
  
- **ローディング**:
  - スケルトンスクリーン(グラデーションアニメーション)
  - スピナー(グラデーション回転)
  
- **トースト通知**:
  - 右上から出現
  - グラスモーフィズム + アイコン
  - 自動消去(3秒)

#### 9.3.5 レスポンシブ対応
- **モバイル(〜767px)**:
  - 1カラム
  - ヘッダーは圧縮(ハンバーガーメニュー)
  - 検索バーはアイコンボタン、タップで展開
  - サイドバーなし
  
- **タブレット(768px〜1023px)**:
  - 2カラム
  - サイドバーなし、またはドロワー形式
  
- **デスクトップ(1024px〜)**:
  - 2-3カラム
  - サイドバー常時表示

---

## 10. 開発フェーズ・スケジュール

### Phase 1: MVP (4-6週間)
- Week 1-2: プロジェクトセットアップ、DB設計、データ収集バッチ
- Week 3-4: 記事一覧表示、フィルター、検索機能
- Week 5-6: UI/UX調整、テスト、デプロイ

### Phase 2: ユーザー機能 (3-4週間)
- Week 1: 認証機能実装
- Week 2: お気に入り、既読管理
- Week 3-4: マイページ、パーソナライズ基盤

### Phase 3: AI機能 (3-4週間)
- Week 1-2: ホットトピック分析バッチ
- Week 3: ホットトピックUI実装
- Week 4: パーソナライズドフィード

---

## 11. テスト要件

### 11.1 単体テスト
- ユーティリティ関数
- データ変換ロジック
- トレンドスコア計算

### 11.2 統合テスト
- API エンドポイント
- データ収集バッチ
- 認証フロー(Phase 2)

### 11.3 E2Eテスト
- 記事一覧表示
- フィルタリング
- 検索機能
- お気に入り追加(Phase 2)

### 11.4 パフォーマンステスト
- ページロード時間
- API レスポンス時間
- 大量データ取得時の挙動

---

## 12. デプロイメント

### 12.1 環境
- **Production**: Vercel (main branch)
- **Staging**: Vercel (develop branch) - オプション
- **Development**: ローカル環境

### 12.2 環境変数
```
# Database
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=

# Authentication (Phase 2)
BETTER_AUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# External APIs
QIITA_ACCESS_TOKEN=
ZENN_API_KEY=

# AI (Phase 3)
ANTHROPIC_API_KEY=

# Other
NEXT_PUBLIC_APP_URL=
CRON_SECRET= # Vercel Cron認証用
```

### 12.3 デプロイフロー
1. GitHub にプッシュ
2. Vercel が自動ビルド・デプロイ
3. マイグレーション実行(必要時)
4. 動作確認

---

## 13. 監視・運用

### 13.1 ログ
- アプリケーションログ(Vercel Logs)
- エラートラッキング(Sentry - オプション)
- パフォーマンス監視(Vercel Analytics)

### 13.2 アラート
- データ収集失敗時
- API レート制限到達時
- エラー率上昇時

### 13.3 バックアップ
- Turso の自動バックアップ機能を利用
- 重要データの定期エクスポート

---

## 14. 今後の拡張案

- メディアソース追加(dev.to, Medium, note, etc.)
- モバイルアプリ(React Native / Flutter)
- ニュースレター機能(週次メール配信)
- 記事のブックマーク機能
- コメント・ディスカッション機能
- API公開(サードパーティ連携)
- 多言語対応
- ダークモード

---

## 15. 参考資料

### API ドキュメント
- Qiita API: https://qiita.com/api/v2/docs
- Zenn: https://zenn.dev/feed

### 技術ドキュメント
- Next.js: https://nextjs.org/docs
- Turso: https://docs.turso.tech/
- Drizzle ORM: https://orm.drizzle.team/
- Better Auth: https://www.better-auth.com/docs
- Vercel: https://vercel.com/docs

---

**以上**