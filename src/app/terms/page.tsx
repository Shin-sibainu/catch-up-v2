import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '利用規約',
  description: 'Catch Upの利用規約',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background-primary">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="mb-8 text-4xl font-bold text-text-primary">利用規約</h1>

        <div className="glass-card rounded-lg p-8 space-y-8">
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">1. サービス概要</h2>
            <p className="text-text-secondary leading-relaxed">
              Catch Up（以下「本サービス」）は、技術記事キュレーションサービスです。
              Qiita、Zenn、note.comなどの外部プラットフォームから技術記事を収集し、
              ユーザーに提供します。
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">2. 外部サービスの利用について</h2>
            <div className="space-y-4 text-text-secondary leading-relaxed">
              <p>本サービスは以下の外部サービスから記事情報を取得しています：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Qiita</strong>: 公式APIを使用</li>
                <li><strong>Zenn</strong>: 公式Feed/APIを使用</li>
                <li><strong>note.com</strong>: 検索機能を使用（非公式）</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">3. 免責事項</h2>
            <div className="space-y-4 text-text-secondary leading-relaxed">
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
                <p className="font-semibold text-amber-800 mb-2">⚠️ note.com の利用について</p>
                <p className="text-amber-700">
                  本サービスはnote.comの検索機能を利用しています。
                  これは非公式な方法であり、note.com側の仕様変更により、
                  予告なく機能が停止する可能性があります。
                  現在、note.comに対して正式な利用許可を問い合わせ中です。
                </p>
              </div>

              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>本サービスは教育・研究目的で技術記事を表示しています</li>
                <li>記事の著作権は各プラットフォームおよび著者に帰属します</li>
                <li>本サービスは記事内容の正確性を保証しません</li>
                <li>外部サービスの利用規約に準拠します</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">4. データの取り扱い</h2>
            <div className="space-y-4 text-text-secondary leading-relaxed">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>本サービスは記事のメタデータ（タイトル、URL、著者情報等）のみを保存します</li>
                <li>記事本文は保存せず、外部サイトへのリンクを提供します</li>
                <li>クロール頻度を制限し、外部サービスへの負荷を最小限に抑えています</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">5. 著作権・知的財産権</h2>
            <p className="text-text-secondary leading-relaxed">
              表示される記事の著作権は、各記事の著者および掲載プラットフォームに帰属します。
              本サービスは記事へのリンクを提供するのみであり、コンテンツの著作権を主張しません。
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">6. サービスの変更・停止</h2>
            <p className="text-text-secondary leading-relaxed">
              本サービスは予告なく内容の変更、一部機能の停止、または全体の終了を行う場合があります。
              特に、外部サービスからの要請があった場合は、即座に該当機能を停止します。
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-text-primary">7. お問い合わせ</h2>
            <p className="text-text-secondary leading-relaxed">
              著作権者の方で、記事の掲載を望まない場合や、その他ご質問がある場合は、
              GitHubのIssueまたはリポジトリ管理者までご連絡ください。
            </p>
          </section>

          <section>
            <p className="text-sm text-text-tertiary">
              最終更新日: 2025年10月19日
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
