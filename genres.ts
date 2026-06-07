export interface AffiliateLinks {
  [category: string]: { [name: string]: string };
}

export interface BlogConfig {
  type: "hatena" | "note";
  hatenaEmail?: string;
  hatenaUrl: string;
}

export interface Genre {
  id: string;
  name: string;
  topics: string[];
  affiliateLinks: AffiliateLinks;
  blog: BlogConfig;
  writerPersona: string;
  targetReader: string;
  twitterHashtags: string[];
}

export const GENRES: Genre[] = [
  {
    id: "invest",
    name: "投資・節約",
    topics: [
      "新NISAで月3万円積立投資を始める完全ガイド【2024年最新】",
      "S&P500インデックスファンドの選び方と比較【eMAXIS Slim vs SBI・V】",
      "高配当株投資で不労所得を作る方法【月5万円の配当金生活】",
      "株初心者が最初の1年でやるべきこと【損しないための基本ルール】",
      "iDeCo vs NISA どちらを優先すべきか【税制メリット徹底比較】",
      "米国株ETFのおすすめ5選【VTI・VOO・VYM・QQQ・SPYD】",
      "暴落時に買い増しすべき株の見極め方【バフェットの手法を学ぶ】",
      "インデックス投資vs高配当株投資【10年後に資産が多いのはどちらか】",
      "ドルコスト平均法の効果を証明するシミュレーション結果",
      "楽天証券とSBI証券どちらがお得？2024年最新比較",
      "毎月3万円節約できる固定費削減の完全チェックリスト",
      "格安SIMに乗り換えで年間6万円節約する方法【最新プラン比較】",
      "電気代を月5000円削減する13のテクニック【今日からできる】",
      "ふるさと納税で実質無料で食品・日用品をもらう方法【2024年版】",
      "クレジットカードのポイント還元で年間3万円分お得になる組み合わせ",
      "サブスク断捨離で月1万円削減【不要なサービスを見直す手順】",
      "食費月3万円以下を実現する買い物術と献立の作り方",
      "保険の見直しで年間20万円節約する方法【必要な保険だけ残す】",
      "手取り30万円で資産1000万円を達成する具体的なロードマップ",
      "複利の力を最大化する「再投資」戦略【30年で1000万が何倍になるか】",
    ],
    affiliateLinks: {
      証券口座: {
        楽天証券: "https://px.a8.net/svt/ejp?a8mat=REPLACE_RAKUTEN_SEC",
        SBI証券: "https://px.a8.net/svt/ejp?a8mat=REPLACE_SBI_SEC",
        松井証券: "https://px.a8.net/svt/ejp?a8mat=REPLACE_MATSUI_SEC",
      },
      クレジットカード: {
        楽天カード: "https://px.a8.net/svt/ejp?a8mat=REPLACE_RAKUTEN_CARD",
        三井住友カードNL: "https://px.a8.net/svt/ejp?a8mat=REPLACE_SMC_NL",
      },
      家計管理アプリ: {
        マネーフォワードME: "https://px.a8.net/svt/ejp?a8mat=REPLACE_MF_ME",
      },
      投資本: {
        敗者のゲーム: "https://www.amazon.co.jp/dp/4532358973/?tag=REPLACE-22",
        ウォール街のランダムウォーカー: "https://www.amazon.co.jp/dp/4822289087/?tag=REPLACE-22",
        バビロンの大富豪: "https://www.amazon.co.jp/dp/4877710361/?tag=REPLACE-22",
      },
    },
    blog: {
      type: "hatena",
      hatenaEmail: "hzeefh2u4h.z5vbahlsjcgn6@blog.hatena.ne.jp",
      hatenaUrl: "https://takataka634.hatenablog.com/",
    },
    writerPersona: "株式投資・資産運用・節約の専門家ライター",
    targetReader: "20〜40代の投資初心者〜中級者",
    twitterHashtags: ["投資", "NISA", "節約", "資産運用", "副業"],
  },

  {
    id: "side-hustle",
    name: "副業・フリーランス",
    topics: [
      "会社員が副業で月5万円を稼ぐまでのロードマップ【実体験】",
      "クラウドソーシングで初心者が最初の1万円を稼ぐ方法",
      "Webライターとして月10万円稼ぐための単価アップ戦略",
      "プログラミング副業で稼ぐ最短ルート【未経験から案件獲得まで】",
      "動画編集副業の始め方【必要なスキルと稼げる案件の探し方】",
      "SNSマーケティング副業で企業案件を獲得する方法",
      "ハンドメイド販売でminne・Creemaを使って月3万円稼ぐコツ",
      "Amazon輸入転売の始め方【初期費用10万円で月収20万円の実例】",
      "ブログアフィリエイトで月1万円を最速で達成する記事戦略",
      "YouTubeチャンネルを3ヶ月で収益化する動画構成と投稿頻度",
      "フリーランスエンジニアの単価交渉術【時給3000円を超える方法】",
      "確定申告が必要な副業収入の基準と節税の基本【初心者向け】",
      "副業バレない方法と住民税の普通徴収切り替え手続き",
      "スキルシェアサービスCOCONALAで月5万円稼ぐプロフィールの作り方",
      "在宅ワークで本業並みに稼ぐためのタイムマネジメント術",
      "Udemyで講師デビューして月10万円のオンライン収入を作る方法",
      "副業で使えるおすすめ会計ソフト比較【freee vs マネーフォワード】",
      "クラウドワークスとランサーズどちらがおすすめ？徹底比較",
      "副業で稼いだお金の正しい使い方【再投資 vs 生活費 vs 貯蓄】",
      "ChatGPTを使った副業5選【AIで効率10倍にする方法】",
    ],
    affiliateLinks: {
      クラウドソーシング: {
        クラウドワークス: "https://px.a8.net/svt/ejp?a8mat=REPLACE_CW",
        ランサーズ: "https://px.a8.net/svt/ejp?a8mat=REPLACE_LANCERS",
        COCONALA: "https://px.a8.net/svt/ejp?a8mat=REPLACE_COCONALA",
      },
      会計ソフト: {
        freee: "https://px.a8.net/svt/ejp?a8mat=REPLACE_FREEE",
        マネーフォワードクラウド: "https://px.a8.net/svt/ejp?a8mat=REPLACE_MF_CLOUD",
      },
      学習サービス: {
        Udemy: "https://px.a8.net/svt/ejp?a8mat=REPLACE_UDEMY",
        テックアカデミー: "https://px.a8.net/svt/ejp?a8mat=REPLACE_TECHACADEMY",
      },
      副業本: {
        副業の学校: "https://www.amazon.co.jp/dp/4297134667/?tag=REPLACE-22",
        月収プラス5万円の副業: "https://www.amazon.co.jp/dp/4798168793/?tag=REPLACE-22",
      },
    },
    blog: {
      type: "hatena",
      hatenaEmail: process.env.HATENA_EMAIL_SIDEHUSTLE ?? "",
      hatenaUrl: process.env.BLOG_URL_SIDEHUSTLE ?? "https://takataka634-sidehustle.hatenablog.com/",
    },
    writerPersona: "副業・フリーランスの専門家ライター。会社員をしながら複数の副業で月20万円を稼いでいる",
    targetReader: "20〜35代の副業に興味がある会社員・主婦",
    twitterHashtags: ["副業", "フリーランス", "在宅ワーク", "副業収入", "稼ぐ方法"],
  },

  {
    id: "career",
    name: "転職・キャリア",
    topics: [
      "30代からの転職で年収100万円アップする求人の選び方",
      "転職エージェントと転職サイトの使い分け方【失敗しない活用法】",
      "職務経歴書の書き方で採用率が3倍変わる【テンプレート付き】",
      "未経験からITエンジニアに転職する最短ルート【3ヶ月で内定】",
      "リクルートエージェントvsdoda vs マイナビ転職【2024年比較】",
      "面接で必ず聞かれる「転職理由」の答え方【NG例とOK例】",
      "年収交渉で失敗しないためのタイミングと具体的な言い方",
      "40代・50代の転職を成功させるスキルの棚卸し方法",
      "外資系企業への転職で押さえるべき英語レベルと面接対策",
      "副業・兼業OKの求人を見つけるための転職サイト活用術",
      "転職で後悔しないための「企業研究」の正しいやり方",
      "リモートワーク求人の探し方と条件交渉のコツ",
      "Webデザイナーに未経験から転職する独学ポートフォリオの作り方",
      "産休・育休取りやすい企業の見分け方【女性の転職活動】",
      "20代若手が年収500万円超えの企業に転職する戦略",
      "公務員から民間へ転職するリスクと成功パターン",
      "転職回数が多い人の職務経歴書の書き方と面接での答え方",
      "スカウト型転職サービスで年収アップを狙う登録の仕方",
      "逆求人サイトおすすめ5選【OfferBox・キミスカ・Wantedly】",
      "転職活動中の在職中と退職後どちらが有利か【メリット比較】",
    ],
    affiliateLinks: {
      転職エージェント: {
        リクルートエージェント: "https://px.a8.net/svt/ejp?a8mat=REPLACE_RA",
        doda: "https://px.a8.net/svt/ejp?a8mat=REPLACE_DODA",
        マイナビ転職: "https://px.a8.net/svt/ejp?a8mat=REPLACE_MYNAVI",
      },
      スカウト転職: {
        ビズリーチ: "https://px.a8.net/svt/ejp?a8mat=REPLACE_BIZREACH",
        OfferBox: "https://px.a8.net/svt/ejp?a8mat=REPLACE_OFFERBOX",
      },
      学習: {
        Udemy: "https://px.a8.net/svt/ejp?a8mat=REPLACE_UDEMY",
        資格スクエア: "https://px.a8.net/svt/ejp?a8mat=REPLACE_SHIKAKU",
      },
      転職本: {
        転職の思考法: "https://www.amazon.co.jp/dp/4478106878/?tag=REPLACE-22",
        科学的な適職: "https://www.amazon.co.jp/dp/4478107823/?tag=REPLACE-22",
      },
    },
    blog: {
      type: "hatena",
      hatenaEmail: process.env.HATENA_EMAIL_CAREER ?? "",
      hatenaUrl: process.env.BLOG_URL_CAREER ?? "https://takataka634-career.hatenablog.com/",
    },
    writerPersona: "キャリアコンサルタント・転職支援の専門家ライター。年間100名以上の転職をサポートしている",
    targetReader: "20〜40代の転職を検討している会社員",
    twitterHashtags: ["転職", "キャリア", "年収アップ", "転職活動", "就職"],
  },
];

export function getGenreById(id: string): Genre | undefined {
  return GENRES.find((g) => g.id === id);
}

export function getTopicForGenre(genre: Genre): string {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return genre.topics[dayOfYear % genre.topics.length];
}
