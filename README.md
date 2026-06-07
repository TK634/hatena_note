# auto-income — ブログ自動投稿・アフィリエイト収益化システム

Claude AI で記事を生成し、複数ジャンル・複数ブログへ毎日自動投稿するシステム。  
**目標: 月収1000万円達成まで機能拡張を続ける。**

---

## 方針・ロードマップ

### フェーズ1: 複数ジャンル展開（対応中）
- [x] 投資・節約ブログ（はてなブログ）
- [x] 副業・フリーランスブログ（genres.ts 定義済み・はてな新規作成で即使用可）
- [x] 転職・キャリアブログ（genres.ts 定義済み）
- [x] 健康・ダイエットブログ（genres.ts 定義済み）

### フェーズ2: アフィリエイト収益最大化（着手中）
- [ ] A8.net / もしもアフィリエイト に登録して genres.ts の REPLACE_XXXXX を実リンクに変更
- [ ] Amazon アソシエイトのタグを genres.ts の REPLACE-22 に設定
- [ ] 金融系高単価案件の記事を優先的に生成（証券口座・FX・保険）
- [ ] 記事内アフィリエイトリンクのA/Bテスト（CTR計測）

### フェーズ3: SNS多チャンネル自動投稿（実装済み/予定）
- [x] X(Twitter) 自動投稿（`post-twitter.ts`）
- [x] note.com 自動投稿（`post-note.ts`）
- [x] Threads 自動投稿（`post-threads.ts` ※APIトークン設定要）
- [ ] Instagram リール（テキスト→画像スライド生成）
- [ ] YouTube Shorts（TTS + スライド動画生成）
- [ ] LINE公式アカウント配信

### フェーズ4: 記事品質・SEO強化
- [ ] キーワードリサーチ自動化（検索ボリューム取得）
- [ ] 記事ごとにOGP画像を自動生成（SNS拡散力アップ）
- [ ] 内部リンク自動挿入（同ジャンル記事間）
- [ ] 記事公開後のパフォーマンス計測・フィードバックループ

### フェーズ5: スケールアップ
- [ ] 1日1記事 → 1日3記事/ジャンル（朝・昼・夜）
- [ ] WordPress マルチサイト展開（独自ドメインでSEO強化）
- [ ] メルマガ・LINE公式アカウントとの連携
- [ ] 外注ライターへのAIサポートで記事量産

---

## ディレクトリ構成

```
auto-income/
├── genres.ts          # ジャンル定義（トピック・アフィリエイト・ブログ設定）
├── generate.ts        # Claude AI で記事生成
├── post-hatena.ts     # はてなブログにメール投稿
├── post-note.ts       # note.com に Playwright で投稿
├── post-twitter.ts    # X(Twitter) に投稿
├── post-threads.ts    # Threads(Meta) に投稿
├── notify.ts          # 投稿結果をメールで通知
├── stats.ts           # 投稿統計・収益予測を表示
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

cp .env.example .env
# .env を編集して各種APIキーを設定
```

### .env に設定が必要なもの

| キー | 説明 |
|------|------|
| `ANTHROPIC_API_KEY` | Claude API キー（必須） |
| `GMAIL_USER` | Gmail アドレス（必須） |
| `GMAIL_APP_PASSWORD` | Gmail アプリパスワード（必須） |
| `HATENA_EMAIL_SIDEHUSTLE` | 副業ブログのはてな投稿メール |
| `HATENA_EMAIL_CAREER` | 転職ブログのはてな投稿メール |
| `HATENA_EMAIL_HEALTH` | 健康ブログのはてな投稿メール |
| `TWITTER_API_KEY` 等 | X API 認証情報（任意） |
| `THREADS_ACCESS_TOKEN` | Threads API トークン（任意） |
| `THREADS_USER_ID` | Threads ユーザーID（任意） |
| `NOTIFY_EMAIL` | 投稿結果通知メール送信先（省略時はGMAIL_USERへ） |

---

## 使い方

```bash
# 特定ジャンルだけ投稿
npx tsx run.ts invest        # 投資・節約
npx tsx run.ts side-hustle   # 副業・フリーランス
npx tsx run.ts career        # 転職・キャリア
npx tsx run.ts health        # 健康・ダイエット

# 全ジャンル一括投稿（各30秒待機）
npx tsx run-all.ts

# 特定ジャンルをスキップして一括実行
SKIP_GENRES=career npx tsx run-all.ts

# 記事生成だけ確認（投稿しない）
npx tsx generate.ts invest

# 統計・収益予測を表示
npx tsx stats.ts

# 毎日自動投稿のcronを設定（9〜12時に各ジャンル）
bash setup-cron.sh
```

---

## アフィリエイトリンクの設定

`genres.ts` 内の `REPLACE_XXXXX` / `REPLACE-22` を実際のIDに置き換える。

```ts
// A8.net の場合（プログラムに参加後、専用URLを取得）
楽天証券: "https://px.a8.net/svt/ejp?a8mat=実際のコード",

// Amazon アソシエイト（タグをアソシエイトセントラルで確認）
敗者のゲーム: "https://www.amazon.co.jp/dp/4532358973/?tag=あなたのタグ-22",
```

---

## 現在のジャンル一覧

| ジャンルID | ジャンル名 | 主な収益源 |
|-----------|-----------|-----------|
| `invest` | 投資・節約 | 証券口座・クレカ・投資本 |
| `side-hustle` | 副業・フリーランス | クラウドソーシング・会計ソフト |
| `career` | 転職・キャリア | 転職エージェント（高単価） |
| `health` | 健康・ダイエット | サプリ・フィットネス・宅食 |

---

## 収益モデル（目標月収1000万円）

| 収益源 | 想定単価 | 目標件数/月 | 想定月収 |
|--------|----------|-------------|---------|
| 転職エージェント | 15,000〜50,000円/件 | 50件 | 100万円 |
| 証券口座開設 | 5,000〜20,000円/件 | 200件 | 200万円 |
| クレジットカード | 3,000〜10,000円/件 | 300件 | 150万円 |
| 保険・FX | 10,000〜30,000円/件 | 100件 | 150万円 |
| サプリ・宅食 | 1,000〜5,000円/件 | 500件 | 100万円 |
| Amazon アソシエイト | 購入額の3〜8% | 多数 | 50万円 |
| note 有料記事 | 100〜500円/人 | 2,000人 | 50万円 |
| YouTube 広告 | 〜 | フェーズ5以降 | — |
| **合計目標** | | | **¥10,000,000** |
