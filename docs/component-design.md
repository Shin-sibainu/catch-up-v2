# コンポーネント設計

UIコンポーネントの設計と実装ガイド。

---

## ディレクトリ構成

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # トップページ
│   └── api/               # API Routes
│       ├── articles/
│       ├── tags/
│       └── cron/
├── components/            # Reactコンポーネント
│   ├── layouts/          # レイアウト系
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   ├── articles/         # 記事関連
│   │   ├── ArticleCard.tsx
│   │   ├── ArticleList.tsx
│   │   └── ArticleGrid.tsx
│   ├── filters/          # フィルター関連
│   │   ├── FilterBar.tsx
│   │   ├── MediaFilter.tsx
│   │   ├── PeriodFilter.tsx
│   │   └── TagFilter.tsx
│   ├── search/           # 検索関連
│   │   └── SearchBar.tsx
│   └── ui/               # 共通UIコンポーネント
│       ├── Button.tsx
│       ├── Badge.tsx
│       ├── Loading.tsx
│       ├── Toast.tsx
│       └── Skeleton.tsx
├── lib/                   # ユーティリティ
│   ├── utils.ts
│   ├── api.ts
│   └── constants.ts
├── db/                    # データベース
│   ├── schema.ts
│   └── index.ts
└── types/                 # 型定義
    └── index.ts
```

---

## レイアウトコンポーネント

### Header

**ファイル**: `src/components/layouts/Header.tsx`

**説明**: 固定ヘッダー、グラスモーフィズム効果を持つ

**Props**:
```typescript
type HeaderProps = {
  // Phase 2で追加
  // user?: User | null;
};
```

**実装例**:
```typescript
export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-black/60 border-b border-white/10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Logo />
        <SearchBar />
        <Navigation />
      </div>
    </header>
  );
}
```

**スタイル**:
- グラスモーフィズム: `backdrop-blur-lg bg-black/60`
- ボーダー: `border-b border-white/10`
- スクロール時の透明度変化（JavaScript制御）

---

### Sidebar

**ファイル**: `src/components/layouts/Sidebar.tsx`

**説明**: デスクトップのみ表示、人気タグと統計情報

**Props**:
```typescript
type SidebarProps = {
  tags: Tag[];
  stats?: {
    totalArticles: number;
    totalTags: number;
    todayArticles: number;
  };
};
```

**実装例**:
```typescript
export function Sidebar({ tags, stats }: SidebarProps) {
  return (
    <aside className="hidden lg:block w-80 space-y-6">
      {/* 人気タグクラウド */}
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">人気タグ</h3>
        <TagCloud tags={tags} />
      </div>

      {/* 統計情報 */}
      {stats && (
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">統計</h3>
          <StatsDisplay stats={stats} />
        </div>
      )}
    </aside>
  );
}
```

---

## 記事関連コンポーネント

### ArticleCard

**ファイル**: `src/components/articles/ArticleCard.tsx`

**説明**: 記事の情報を表示するカード

**Props**:
```typescript
type ArticleCardProps = {
  article: ArticleWithTags;
  onClick?: () => void;
};
```

**実装例**:
```typescript
export function ArticleCard({ article, onClick }: ArticleCardProps) {
  return (
    <article
      className="group relative bg-gradient-to-br from-gray-900/50 to-gray-800/50
                 border border-white/10 rounded-lg overflow-hidden
                 hover:-translate-y-1 hover:shadow-2xl hover:border-primary/50
                 transition-all duration-200 cursor-pointer"
      onClick={onClick}
    >
      {/* サムネイル */}
      {article.thumbnail_url && (
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={article.thumbnail_url}
            alt={article.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      {/* メディアバッジ */}
      <div className="absolute top-4 right-4">
        <MediaBadge media={article.media_source} />
      </div>

      {/* コンテンツ */}
      <div className="p-6 space-y-4">
        {/* タイトル */}
        <h3 className="text-lg font-bold text-text-primary line-clamp-2">
          {article.title}
        </h3>

        {/* 説明文 */}
        {article.description && (
          <p className="text-sm text-text-secondary/80 line-clamp-3">
            {article.description}
          </p>
        )}

        {/* 著者情報 */}
        <div className="flex items-center gap-2">
          <Image
            src={article.author_avatar_url || '/default-avatar.png'}
            alt={article.author_name}
            width={24}
            height={24}
            className="rounded-full"
          />
          <span className="text-sm text-text-secondary">
            {article.author_name}
          </span>
        </div>

        {/* エンゲージメント */}
        <div className="flex items-center gap-4 text-sm text-text-tertiary">
          <span className="flex items-center gap-1">
            <HeartIcon className="w-4 h-4" />
            {article.likes_count}
          </span>
          <span className="flex items-center gap-1">
            <BookmarkIcon className="w-4 h-4" />
            {article.bookmarks_count}
          </span>
          <span className="ml-auto">
            {getRelativeTime(article.published_at)}
          </span>
        </div>

        {/* タグ */}
        <div className="flex flex-wrap gap-2">
          {article.tags.slice(0, 3).map(tag => (
            <Badge key={tag.id} variant="secondary">
              {tag.display_name}
            </Badge>
          ))}
        </div>
      </div>
    </article>
  );
}
```

**スタイルポイント**:
- グラデーション背景: `from-gray-900/50 to-gray-800/50`
- ホバー時の浮き上がり: `hover:-translate-y-1`
- ボーダーグロー: `hover:border-primary/50`

---

### ArticleList / ArticleGrid

**ファイル**: `src/components/articles/ArticleGrid.tsx`

**説明**: 記事カードをグリッドレイアウトで表示

**Props**:
```typescript
type ArticleGridProps = {
  articles: ArticleWithTags[];
  loading?: boolean;
  onLoadMore?: () => void;
};
```

**実装例**:
```typescript
export function ArticleGrid({ articles, loading, onLoadMore }: ArticleGridProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map(article => (
          <ArticleCard
            key={article.id}
            article={article}
            onClick={() => window.open(article.url, '_blank')}
          />
        ))}
      </div>

      {/* 無限スクロール用 */}
      {loading && <SkeletonGrid count={6} />}

      {/* ロードモアボタン */}
      {onLoadMore && !loading && (
        <div className="text-center">
          <Button onClick={onLoadMore}>もっと見る</Button>
        </div>
      )}
    </div>
  );
}
```

---

## フィルター関連コンポーネント

### FilterBar

**ファイル**: `src/components/filters/FilterBar.tsx`

**説明**: メディア、期間、タグのフィルターをまとめたバー

**Props**:
```typescript
type FilterBarProps = {
  selectedMedia: string[];
  selectedPeriod: 'day' | 'week' | 'month' | 'all';
  selectedTags: string[];
  onMediaChange: (media: string[]) => void;
  onPeriodChange: (period: string) => void;
  onTagsChange: (tags: string[]) => void;
};
```

**実装例**:
```typescript
export function FilterBar({
  selectedMedia,
  selectedPeriod,
  selectedTags,
  onMediaChange,
  onPeriodChange,
  onTagsChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-4 items-center p-4 backdrop-blur-md bg-white/5 border border-white/10 rounded-lg">
      <MediaFilter selected={selectedMedia} onChange={onMediaChange} />
      <PeriodFilter selected={selectedPeriod} onChange={onPeriodChange} />
      <TagFilter selected={selectedTags} onChange={onTagsChange} />
    </div>
  );
}
```

### PeriodFilter

**ファイル**: `src/components/filters/PeriodFilter.tsx`

**実装例**:
```typescript
const PERIODS = [
  { value: 'day', label: '今日' },
  { value: 'week', label: '今週' },
  { value: 'month', label: '今月' },
  { value: 'all', label: '全期間' },
] as const;

export function PeriodFilter({ selected, onChange }: PeriodFilterProps) {
  return (
    <div className="flex gap-2">
      {PERIODS.map(period => (
        <button
          key={period.value}
          onClick={() => onChange(period.value)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
            selected === period.value
              ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-lg shadow-primary/50'
              : 'bg-white/5 text-text-secondary hover:bg-white/10'
          )}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}
```

---

## 検索コンポーネント

### SearchBar

**ファイル**: `src/components/search/SearchBar.tsx`

**Props**:
```typescript
type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
};
```

**実装例**:
```typescript
export function SearchBar({ value, onChange, onSubmit, placeholder }: SearchBarProps) {
  return (
    <div className="relative flex-1 max-w-2xl">
      <div className="absolute left-4 top-1/2 -translate-y-1/2">
        <SearchIcon className="w-5 h-5 text-text-tertiary" />
      </div>

      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onSubmit?.()}
        placeholder={placeholder || 'Search articles, tags, authors...'}
        className="w-full pl-12 pr-20 py-3 bg-background-secondary border border-white/10
                   rounded-full text-text-primary placeholder:text-text-tertiary
                   focus:outline-none focus:border-primary focus:shadow-lg focus:shadow-primary/20
                   transition-all duration-200"
      />

      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <kbd className="px-2 py-1 text-xs bg-white/10 border border-white/20 rounded">
          ⌘K
        </kbd>
      </div>
    </div>
  );
}
```

---

## 共通UIコンポーネント

### Button

**ファイル**: `src/components/ui/Button.tsx`

**Props**:
```typescript
type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};
```

**実装例**:
```typescript
export function Button({ variant = 'primary', size = 'md', children, ...props }: ButtonProps) {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 disabled:opacity-50';

  const variants = {
    primary: 'bg-gradient-to-r from-primary to-primary-light text-white hover:shadow-lg hover:shadow-primary/50',
    secondary: 'bg-transparent border border-white/20 text-text-primary hover:bg-white/10',
    ghost: 'bg-transparent text-text-primary hover:bg-white/5',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], props.className)}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Badge

**ファイル**: `src/components/ui/Badge.tsx`

**Props**:
```typescript
type BadgeProps = {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
};
```

**実装例**:
```typescript
export function Badge({ variant = 'secondary', children, onClick }: BadgeProps) {
  const variants = {
    primary: 'bg-primary/20 text-primary border-primary/30',
    secondary: 'bg-white/5 text-text-secondary border-white/10',
  };

  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border',
        'hover:bg-white/10 transition-colors duration-200',
        variants[variant],
        onClick && 'cursor-pointer'
      )}
    >
      {children}
    </span>
  );
}
```

### Skeleton

**ファイル**: `src/components/ui/Skeleton.tsx`

**実装例**:
```typescript
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded',
        className
      )}
    />
  );
}

export function ArticleCardSkeleton() {
  return (
    <div className="border border-white/10 rounded-lg overflow-hidden p-6 space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </div>
  );
}
```

### Toast

**ファイル**: `src/components/ui/Toast.tsx`

**実装例**:
```typescript
type ToastProps = {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
};

export function Toast({ message, type = 'info', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
    error: <XCircleIcon className="w-5 h-5 text-red-500" />,
    info: <InfoCircleIcon className="w-5 h-5 text-blue-500" />,
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="flex items-center gap-3 backdrop-blur-md bg-white/10 border border-white/20 rounded-lg p-4 shadow-2xl">
        {icons[type]}
        <span className="text-sm text-text-primary">{message}</span>
        <button onClick={onClose} className="ml-4 hover:text-text-primary">
          <XIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
```

---

## アニメーション

### tailwind.config.ts に追加

```typescript
theme: {
  extend: {
    animation: {
      'slide-in': 'slideIn 0.3s ease-out',
      'fade-in': 'fadeIn 0.5s ease-in',
    },
    keyframes: {
      slideIn: {
        '0%': { transform: 'translateX(100%)', opacity: '0' },
        '100%': { transform: 'translateX(0)', opacity: '1' },
      },
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
    },
  },
}
```

---

## アイコン

### Heroicons v2 を使用

```bash
npm install @heroicons/react
```

```typescript
import { HeartIcon, BookmarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
```

---

## 実装優先度

### 高優先度（MVP必須）
1. ArticleCard
2. ArticleGrid
3. Header
4. FilterBar (Media, Period)
5. SearchBar
6. Button
7. Badge
8. Loading/Skeleton

### 中優先度（MVP推奨）
1. Sidebar
2. TagFilter
3. Toast

### 低優先度（後で追加可能）
1. Footer
2. その他デコレーション要素

---

## 参考リンク

- [Headless UI](https://headlessui.com/) - アクセシブルなUIコンポーネント
- [Heroicons](https://heroicons.com/) - アイコンライブラリ
- [Tailwind UI](https://tailwindui.com/) - デザインインスピレーション
