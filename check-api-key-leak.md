# APIキー漏洩チェック方法

## GitHubで確認する方法

1. **GitHubリポジトリの履歴を確認**
   ```bash
   # 過去のコミットで.envファイルが含まれていないか確認
   git log --all --full-history -- "*env*"
   
   # APIキーが含まれる可能性のあるファイルを検索
   git log --all -S "AIza" --source --all
   ```

2. **GitHubのセキュリティアラートを確認**
   - GitHubリポジトリの「Security」タブを確認
   - 「Secret scanning」で検出されたAPIキーがないか確認

3. **Vercelの環境変数設定を確認**
   - Vercelダッシュボードで環境変数が公開設定になっていないか確認
   - 本番環境とプレビュー環境の両方を確認

## 対処方法

1. **新しいAPIキーを取得**
   - [Google AI Studio](https://aistudio.google.com/app/apikey) で新しいAPIキーを作成
   - 古いAPIキーを削除または無効化

2. **環境変数を再設定**
   - `.env.local` ファイルに新しいAPIキーを設定
   - Vercelの環境変数も更新

3. **Git履歴から削除（もし漏洩していた場合）**
   ```bash
   # Git履歴から.envファイルを削除（注意：履歴を書き換えます）
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env .env.local" \
     --prune-empty --tag-name-filter cat -- --all
   
   # 強制プッシュ（チームと相談してから実行）
   git push origin --force --all
   ```

## 今後の対策

- `.env.local` は絶対にコミットしない
- `.gitignore` に `.env*` が含まれていることを確認
- APIキーは環境変数としてのみ管理
- スクリーンショットや動画でAPIキーを映さない

