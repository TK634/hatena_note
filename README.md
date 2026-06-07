# auto-income — ブログ自動投稿・アフィリエイト収益化システム

Claude AI で記事を生成し、複数ジャンル・複数ブログへ毎日自動投稿するシステム。  
**目標: 月収1000万円達成まで機能拡張を続ける。**

---

## 方針・ロードマップ

### フェーズ1: 複数ジャンル展開（対応中）
- [x] 投資・節約ブログ（はてなブログ）
- [ ] 副業・フリーランスブログ（はてなブログ新規作成）
- [ ] 転職・キャリアブログ（はてなブログ新規作成）
- [ ] 健康・ダイエットジャンル追加（検討中）

### フェーズ2: アフィリエイト収益最大化
- [ ] A8.net / もしもアフィリエイト に登録して実際のリンクを genres.ts に設定
- [ ] Amazon アソシエイトのタグを genres.ts に設定
- [ ] 金融系高単価案件の記事を優先的に生成（クレカ・証券口座・FX）
- [ ] 記事内のアフィリエイトリンクをクリックしやすい位置に最適化

### フェーズ3: SNS多チャンネル自動投稿（実装済み/予定）
- [x] X(Twitter) 自動投稿（`post-twitter.ts`）
- [x] note.com 自動投稿（`post-note.ts`）
- [ ] Threads 自動投稿（Playwright）
- [ ] Instagram リール（テキスト→画像スライド生成）
- [ ] YouTube Shorts（TTS + スライド動画生成）

### フェーズ4: 記事品質・SEO強化
- [ ] キーワードリサーチ自動化（検索ボリューム取得）
- [ ] 記事ごとにOGP画像を自動生成
- [ ] 内部リンク自動挿入（同ジャンル記事間）
- [ ] 記事公開後のパフォーマンス計測・フィードバックループ

### フェーズ5: スケールアップ
- [ ] 1日1記事 → 1日3記事（時間帯分散）
- [ ] WordPress マルチサイト展開
- [ ] メルマガ・LINE公式アカウントとの連携

---

## ディレクトリ構成

```
auto-income/
├── genres.ts          # ジャンル定義（トピック・アフィリエイト・ブログ設定）
├── generate.ts        # Claude AI で記事生成
├── post-hatena.ts     # はてなブログにメール投稿
├── post-note.ts       # note.com に Playwright で投稿
├── post-twitter.ts    # X(Twitter) に投稿
├── run.ts             # 単ジャンル実行: npx tsx run.ts [genreId]
├── run-all.ts         # 全ジャンル一括実行
├── setup-cron.sh      # cron 設定（各ジャンルを時間差で自動投稿）
├── articles/          # 生成した記事のローカル保存（ジャンル別サブフォルダ）
├── post-log.json      # 投稿履歴ログ
└── .env               # APIキー等（.gitignore で除外）
```

---

## セットアップ

```bash
npm install

# .env を作成して各種APIキーを設定
cp .env.example .env
```

### .env に設定が必要なもの

| キー | 説明 |
|------|------|
| `ANTHROPIC_API_KEY` | Claude API キー |
| `GMAIL_USER` | Gmail アドレス |
| `GMAIL_APP_PASSWORD` | Gmail アプリパスワード |
| `HATENA_EMAIL_SIDEHUSTLE` | 副業ブログのはてな投稿メール |
| `HATENA_EMAIL_CAREER` | 転職ブログのはてな投稿メール |
| `TWITTER_API_KEY` 等 | X API 認証情報（任意） |

---

## 使い方

```bash
# 特定ジャンルだけ投稿
npx tsx run.ts invest        # 投資・節約
npx tsx run.ts side-hustle   # 副業・フリーランス
npx tsx run.ts career        # 転職・キャリア

# 全ジャンル一括投稿
npx tsx run-all.ts

# 記事生成だけ確認（投稿しない）
npx tsx generate.ts invest

# 毎日自動投稿のcronを設定
bash setup-cron.sh
```

---

## アフィリエイトリンクの設定

`genres.ts` 内の `REPLACE_XXXXX` / `REPLACE-22` を実際のIDに置き換える。

```ts
// 例: A8.net の場合
楽天証券: "https://px.a8.net/svt/ejp?a8mat=実際のコード",

// 例: Amazon アソシエイト
敗者のゲーム: "https://www.amazon.co.jp/dp/4532358973/?tag=あなたのタグ-22",
```

---

## 収益モデル

| 収益源 | 想定単価 | 目標件数/月 |
|--------|----------|-------------|
| 証券口座開設（アフィリエイト） | 5,000〜20,000円/件 | 50件 |
| クレカ発行（アフィリエイト） | 3,000〜10,000円/件 | 100件 |
| Amazon 商品（アソシエイト） | 購入額の 3〜8% | 多数 |
| 転職エージェント（アフィリエイト） | 10,000〜50,000円/件 | 20件 |
| note 有料記事・サブスク | 100〜500円/人 | 1,000人 |
| YouTube 広告収益 | 〜 | フェーズ3以降 |
