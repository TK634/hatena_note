# auto-income — ブログ自動投稿・アフィリエイト収益化システム

Claude AI で記事を生成し、はてなブログへ毎日自動投稿するシステム。
「AI量産」ではなく、**体験談ベース・ロングテールSEO・高単価アフィリ**に絞った構成。

- 投稿先: https://takataka634.hatenablog.com/
- 実行環境: macOS の launchd で毎朝9:00に `run-all.ts` を自動実行
- 月間APIコスト: 約$2.7（予算ガードで$4.5を超えると自動停止）

---

## 現在のジャンル（3つに集約）

| ジャンルID | ジャンル名 | 狙い | 主な収益源 |
|-----------|-----------|------|-----------|
| `invest` | 新NISA・証券の手続き | 「移管・設定変更」など具体的手続きのロングテール | 証券口座（高単価） |
| `fx-credit` | クレカ・FX・保険の比較 | 実際に申し込んだ体験ベースの比較 | FX・クレカ（最高単価） |
| `emergency` | 住まいの緊急トラブル | 「今困っている人」向けの超ロングテール実体験 | 業者紹介（生活110番等） |

広いキーワード（例:「NISA おすすめ」）は大手に勝てないため捨て、
「楽天証券からSBIへNISA移管する手順」のような**具体的な状況・手続き**だけを狙う。

---

## 記事品質の設計（generate.ts のプロンプト）

- **体験談ベース**: 一人称・具体的な金額・期間・失敗談を必ず含める
- **感情訴求**: 読者の感情の言語化・感情込みの失敗描写。ただし「絶対」「必ず」等の煽りは禁止（YMYL評価・広告審査対策）
- **事実ガードレール**: 制度・税率など公式な数字は断定せず公式サイト確認へ誘導（誤情報対策）
- **SEO構造**: Q&Aセクション（強調スニペット対策）・比較表・共起語入り見出し
- **リンク安全**: 未設定のアフィリリンク（`REPLACE_`）は出力されない

---

## 仕組み

```
毎朝9:00 (launchd)
  └─ run.sh → run-all.ts
       ├─ resolve-urls.ts   … RSSから過去記事の実URLを取得してログ補正（内部リンク用）
       ├─ ジャンルごとに:
       │    ├─ generate.ts  … Claude Haiku で記事生成（予算ガード付き）
       │    ├─ ogp.ts       … アイキャッチ画像を自動生成
       │    ├─ post-hatena.ts … メール投稿（画像添付＝記事冒頭に表示）
       │    └─ post-twitter.ts 等 … SNS投稿（APIキー設定時のみ）
       ├─ cost-guard.ts     … 月$4.5到達で残りジャンルを自動スキップ
       └─ notify.ts         … 実行結果をメールで通知
```

---

## ディレクトリ構成

```
auto-income/
├── genres.ts          # ジャンル定義（トピック・アフィリリンク・ペルソナ）
├── generate.ts        # Claude AI で記事生成（品質プロンプト・予算チェック）
├── cost-guard.ts      # 月間API利用額の積算と予算ガード（上限$4.5）
├── resolve-urls.ts    # はてなRSSから実記事URLを取得しpost-log.jsonを補正
├── internal-links.ts  # 同ジャンル過去記事への内部リンク挿入（実URLのみ）
├── ogp.ts             # アイキャッチ画像生成（SVG→PNG）
├── post-hatena.ts     # はてなブログにメール投稿（画像添付対応）
├── post-twitter.ts    # X(Twitter) 投稿（任意）
├── post-note.ts / post-threads.ts / post-wordpress.ts / post-instagram.ts  # 任意
├── notify.ts          # 投稿結果メール通知
├── run.ts             # 単ジャンル実行: npx tsx run.ts [genreId]
├── run-all.ts         # 全ジャンル一括実行（毎朝の本番エントリ）
├── run.sh             # launchd から呼ばれるラッパー
├── stats.ts           # 投稿統計
├── articles/          # 生成記事のローカル保存（gitignore）
├── post-log.json      # 投稿履歴（gitignore）
├── cost-log.json      # 月別API利用額（gitignore）
└── .env               # APIキー等（gitignore）
```

---

## セットアップ

```bash
npm install
cp .env.example .env   # APIキーを設定
```

| キー | 説明 |
|------|------|
| `ANTHROPIC_API_KEY` | Claude API キー（必須） |
| `GMAIL_USER` | Gmail アドレス（必須・はてなメール投稿の送信元） |
| `GMAIL_APP_PASSWORD` | Gmail アプリパスワード（必須） |
| `TWITTER_API_KEY` 等 | X API 認証情報（任意） |

## 使い方

```bash
npx tsx run-all.ts           # 全3ジャンル一括投稿（本番と同じ）
npx tsx run.ts invest        # 特定ジャンルだけ投稿
npx tsx generate.ts invest   # 記事生成のみ（投稿しない・品質確認用）
npx tsx cost-guard.ts        # 今月のAPI利用額を確認
npx tsx resolve-urls.ts      # 過去記事URLの補正を手動実行
SKIP_GENRES=emergency npx tsx run-all.ts  # ジャンルをスキップ
```

---

## 運用状況・TODO

- [x] 3ジャンル・ロングテール構成へ移行（2026-06）
- [x] 体験談・感情訴求・事実ガードレール付きプロンプト
- [x] 関連記事リンクの実URL化（RSS照合）
- [x] アイキャッチ画像の投稿反映
- [x] 月$5以内の予算ガード
- [x] Google Search Console 登録・サイトマップ送信（2026-07）
- [ ] **A8.net 登録・提携**（`genres.ts` の `REPLACE_XXXXX` を実リンクに差し替え）← 収益化の必須条件
- [ ] X (Twitter) APIキー設定でSNS集客開始
- [ ] AdSense 申請（記事が新構成で溜まってから）

## アフィリエイトリンクの設定

`genres.ts` 内の `REPLACE_XXXXX` を A8.net で取得した実リンクに置き換える。
`REPLACE_` を含むリンクは記事に出力されない安全設計のため、差し替えた瞬間から記事に反映される。
