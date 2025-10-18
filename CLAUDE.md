# Claude Code 開発ルール

このドキュメントは、Claude Codeが開発を行う際に従うべきルールとベストプラクティスを定義します。

---

## ドキュメント参照ルール

### 必須参照ドキュメント

開発タスクを開始する前に、必ず以下のドキュメントを参照してください：

1. **`/docs/requirement.md`**
   - プロジェクト全体の要件定義
   - 機能要件、非機能要件、技術スタック
   - データベース設計、API設計

2. **`/docs/progress.md`**
   - 現在の開発フェーズと進捗状況
   - タスクのチェックリスト
   - 完了したタスク、未完了のタスクを確認

3. **`/docs/technical-notes.md`**
   - 実装時に参照する技術メモ
   - 型定義、ユーティリティ関数
   - 外部API連携の詳細（Qiita/Zenn）
   - Drizzle ORMのクエリパターン

4. **`/docs/component-design.md`**
   - UIコンポーネントの設計
   - ディレクトリ構成
   - 各コンポーネントのProps定義と実装例

5. **`/docs/setup.md`**
   - 環境構築が必要な場合に参照
   - 環境変数、データベースセットアップ

### ドキュメントの更新

- タスクを完了したら、`/docs/progress.md`のチェックリストを更新する
- 新しい技術的知見を得た場合は、`/docs/technical-notes.md`に追記する
- 新しいコンポーネントを作成した場合は、`/docs/component-design.md`に記載する

---

## Next.js App Router ベストプラクティス

### 1. ファイル構成

#### App Router の規則を厳守

```
app/
├── layout.tsx          # ルートレイアウト
├── page.tsx            # トップページ
├── loading.tsx         # ローディング状態
├── error.tsx           # エラー処理
└── api/                # API Routes
    └── route.ts
```

#### Server Components をデフォルトに

- 特別な理由がない限り、Server Componentsを使用する
- クライアント側の処理が必要な場合のみ、`'use client'`を明示的に宣言する

```typescript
// ❌ Bad: 不要なClient Component化
'use client';

export default function StaticContent() {
  return <div>静的コンテンツ</div>;
}

// ✅ Good: Server Componentとして実装
export default function StaticContent() {
  return <div>静的コンテンツ</div>;
}
```

### 2. データフェッチング

#### Server Componentsでのデータフェッチ

```typescript
// ✅ Good: Server Componentで直接fetch
export default async function ArticlesPage() {
  const articles = await fetch('https://api.example.com/articles', {
    next: { revalidate: 3600 }, // ISR: 1時間キャッシュ
  }).then(res => res.json());

  return <ArticleList articles={articles} />;
}
```

#### キャッシュ戦略を明示

- **SSR（常に最新）**: `cache: 'no-store'`
- **SSG（ビルド時）**: デフォルト
- **ISR（定期的再生成）**: `next: { revalidate: 秒数 }`

```typescript
// SSR: 常に最新データを取得
fetch(url, { cache: 'no-store' });

// ISR: 1時間ごとに再生成
fetch(url, { next: { revalidate: 3600 } });

// SSG: ビルド時に生成（デフォルト）
fetch(url);
```

### 3. Server Actions

#### フォーム送信やミューテーションにはServer Actionsを使用

```typescript
// app/actions.ts
'use server';

export async function createArticle(formData: FormData) {
  const title = formData.get('title');

  // データベース操作
  await db.insert(articles).values({ title });

  revalidatePath('/articles');
  return { success: true };
}

// Client Component
'use client';

import { createArticle } from './actions';

export function CreateArticleForm() {
  return (
    <form action={createArticle}>
      <input name="title" />
      <button type="submit">作成</button>
    </form>
  );
}
```

### 4. メタデータとSEO

#### Metadataオブジェクトで定義

```typescript
// app/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tech Catch Up - 技術トレンドキュレーション',
  description: 'QiitaやZennの技術記事をまとめてチェック',
  openGraph: {
    title: 'Tech Catch Up',
    description: '最新の技術トレンドを効率的にキャッチアップ',
    images: ['/og-image.png'],
  },
};
```

#### 動的メタデータ

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const article = await getArticle(params.id);

  return {
    title: article.title,
    description: article.description,
  };
}
```

### 5. ローディングとエラーハンドリング

#### loading.tsx でローディング状態を管理

```typescript
// app/loading.tsx
export default function Loading() {
  return <SkeletonGrid count={6} />;
}
```

#### error.tsx でエラーをハンドリング

```typescript
// app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>エラーが発生しました</h2>
      <button onClick={reset}>再試行</button>
    </div>
  );
}
```

### 6. 画像最適化

#### next/imageを必ず使用

```typescript
import Image from 'next/image';

// ✅ Good
<Image
  src={article.thumbnail_url}
  alt={article.title}
  width={600}
  height={400}
  loading="lazy"
/>

// ❌ Bad
<img src={article.thumbnail_url} alt={article.title} />
```

### 7. API Routes

#### Route Handlersの使用

```typescript
// app/api/articles/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get('page') || '1';

  const articles = await getArticles({ page: Number(page) });

  return NextResponse.json({ articles });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  // データ作成処理

  return NextResponse.json({ success: true }, { status: 201 });
}
```

#### 動的ルート

```typescript
// app/api/articles/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const article = await getArticle(params.id);
  return NextResponse.json({ article });
}
```

### 8. 環境変数

#### 命名規則

- **サーバーサイド専用**: `VARIABLE_NAME`
- **クライアント公開**: `NEXT_PUBLIC_VARIABLE_NAME`

```typescript
// ✅ Good: サーバーサイドのみ
const dbUrl = process.env.TURSO_DATABASE_URL;

// ✅ Good: クライアントでも使用
const appUrl = process.env.NEXT_PUBLIC_APP_URL;

// ❌ Bad: サーバー専用変数をクライアントで使用しようとしても undefined
'use client';
const dbUrl = process.env.TURSO_DATABASE_URL; // undefined!
```

---

## プロジェクト固有のルール

### 1. TypeScript

- **型安全性を最優先**
- `any`型の使用は禁止（やむを得ない場合はコメントで理由を記載）
- 型定義は`/src/types`ディレクトリにまとめる

### 2. スタイリング

- **Tailwind CSSのみを使用**
- CSS Modules、styled-componentsは使用しない
- カスタムクラス名は`tailwind.config.ts`で定義

### 3. データベース

- **Drizzle ORMを使用**
- 生SQLは使用しない（パフォーマンス上必要な場合を除く）
- スキーマ変更時は必ずマイグレーションを生成

```bash
npm run db:generate
npm run db:push
```

### 4. エラーハンドリング

- **すべてのAPI Routeでtry-catchを使用**
- エラーログは`console.error`で出力
- ユーザーフレンドリーなエラーメッセージを返す

```typescript
try {
  // 処理
} catch (error) {
  console.error('Error fetching articles:', error);
  return NextResponse.json(
    { error: 'Failed to fetch articles' },
    { status: 500 }
  );
}
```

### 5. コンポーネント設計

- **単一責任の原則を守る**
- コンポーネントは50行以内を目安に
- 複雑なロジックはカスタムフックまたはユーティリティ関数に分離

### 6. パフォーマンス

- **Dynamic Importでコード分割**
- 重いコンポーネントは遅延ロード

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <Loading />,
  ssr: false,
});
```

### 7. アクセシビリティ

- セマンティックHTMLを使用
- `alt`属性を必ず設定
- キーボード操作に対応

### 8. コミットメッセージ

```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント更新
style: コードスタイル変更（機能に影響なし）
refactor: リファクタリング
test: テスト追加・修正
chore: ビルド・ツール関連
```

---

## 開発フロー

### 1. タスク開始前

1. `/docs/progress.md`で現在のタスクを確認
2. 関連するドキュメント（`requirement.md`, `technical-notes.md`, `component-design.md`）を確認
3. 既存のコードベースを確認

### 2. 実装中

1. TypeScriptの型エラーをすべて解消
2. Tailwind CSSで一貫したスタイルを適用
3. コンポーネントは再利用可能な形で作成
4. 適切なコメントを記載（特に複雑なロジック）

### 3. タスク完了後

1. ビルドエラーがないか確認: `npm run build`
2. Lintエラーを修正: `npm run lint`
3. **`/docs/progress.md`のチェックリストを更新（必須）**
   - 完了したタスクは `- [ ]` を `- [x]` に変更
   - タスク完了の都度、リアルタイムで更新すること
4. 必要に応じて技術メモやコンポーネント設計ドキュメントを更新

**重要**: タスクを完了したら、必ず`/docs/progress.md`でチェックを入れてください。これにより、プロジェクトの進捗が可視化されます。

---

## 禁止事項

- ❌ `any`型の多用
- ❌ インラインスタイルの使用
- ❌ Client Componentの過度な使用
- ❌ 環境変数の直接ハードコード
- ❌ console.logの残存（デバッグ後は削除）
- ❌ 未使用のimportやコードの残存

---

## 参考リンク

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

**重要**: このルールに従わない実装は、レビュー時に修正を求められます。
