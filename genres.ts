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
      "新NISAで月3万円積立投資を始める完全ガイド【2026年最新】",
      "S&P500インデックスファンドの選び方と比較【eMAXIS Slim vs SBI・V】",
      "高配当株投資で不労所得を作る方法【月5万円の配当金生活】",
      "株初心者が最初の1年でやるべきこと【損しないための基本ルール】",
      "iDeCo vs NISA どちらを優先すべきか【税制メリット徹底比較】",
      "米国株ETFのおすすめ5選【VTI・VOO・VYM・QQQ・SPYD】",
      "暴落時に買い増しすべき株の見極め方【バフェットの手法を学ぶ】",
      "インデックス投資vs高配当株投資【10年後に資産が多いのはどちらか】",
      "ドルコスト平均法の効果を証明するシミュレーション結果",
      "楽天証券とSBI証券どちらがお得？2026年最新比較",
      "毎月3万円節約できる固定費削減の完全チェックリスト",
      "格安SIMに乗り換えで年間6万円節約する方法【最新プラン比較】",
      "電気代を月5000円削減する13のテクニック【今日からできる】",
      "ふるさと納税で実質無料で食品・日用品をもらう方法【2026年版】",
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
        敗者のゲーム: "https://www.amazon.co.jp/dp/4532359112/?tag=tk634-22",
        ウォール街のランダムウォーカー: "https://www.amazon.co.jp/dp/4296115871/?tag=tk634-22",
        バビロンの大富豪: "https://www.amazon.co.jp/dp/4901423126/?tag=tk634-22",
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
        副業の学校: "https://www.amazon.co.jp/dp/4802612885/?tag=tk634-22",
      },
    },
    blog: {
      type: "hatena",
      hatenaEmail: "hzeefh2u4h.z5vbahlsjcgn6@blog.hatena.ne.jp",
      hatenaUrl: "https://takataka634.hatenablog.com/",
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
      "リクルートエージェントvsdoda vs マイナビ転職【2026年比較】",
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
        転職の思考法: "https://www.amazon.co.jp/dp/4478105553/?tag=tk634-22",
        科学的な適職: "https://www.amazon.co.jp/dp/4295411469/?tag=tk634-22",
      },
    },
    blog: {
      type: "hatena",
      hatenaEmail: "hzeefh2u4h.z5vbahlsjcgn6@blog.hatena.ne.jp",
      hatenaUrl: "https://takataka634.hatenablog.com/",
    },
    writerPersona: "キャリアコンサルタント・転職支援の専門家ライター。年間100名以上の転職をサポートしている",
    targetReader: "20〜40代の転職を検討している会社員",
    twitterHashtags: ["転職", "キャリア", "年収アップ", "転職活動", "就職"],
  },

  {
    id: "health",
    name: "健康・ダイエット",
    topics: [
      "3ヶ月で10kg痩せた糖質制限ダイエットの正しいやり方【完全版】",
      "有酸素運動vs筋トレ どちらが痩せやすい？科学的な答え",
      "睡眠の質を上げる7つの習慣【疲れが取れない人へ】",
      "プロテインの選び方と飲むタイミング【筋トレ初心者向け】",
      "間欠的ファスティング（16:8）で内臓脂肪を落とす方法",
      "ジムに行かずに自宅で腹筋を割る3ヶ月プログラム",
      "腸活で痩せ体質になる食事法【腸内フローラを整える食品15選】",
      "40代からの筋トレが絶対必要な理由【筋肉量と基礎代謝の関係】",
      "ランニング初心者が3ヶ月でハーフマラソンを完走する練習法",
      "糖質制限中に食べていいもの・ダメなもの完全リスト",
      "メンタルヘルスを整える5つの生活習慣【ストレス社会を生き抜く】",
      "プランクを毎日やり続けた30日間の体の変化【写真付き記録】",
      "タンパク質を食事から効率よく摂る方法【鶏胸肉以外の選択肢】",
      "骨盤矯正で姿勢が変わる！自宅でできるストレッチ10選",
      "ビタミンDサプリは本当に必要か？効果と正しい摂り方",
      "コレステロールが高い人が食事で改善する方法【医師監修】",
      "脂肪燃焼に効く食材トップ10【スーパーで買える身近な食品】",
      "更年期太りを防ぐ食事と運動【40〜50代女性向け】",
      "デスクワーク族の腰痛を自分で治すストレッチ【今日からできる】",
      "スムージーダイエットの正しいやり方と続けるためのレシピ集",
    ],
    affiliateLinks: {
      サプリ・プロテイン: {
        マイプロテイン: "https://px.a8.net/svt/ejp?a8mat=REPLACE_MYPROTEIN",
        DNS: "https://px.a8.net/svt/ejp?a8mat=REPLACE_DNS",
        ビーレジェンド: "https://px.a8.net/svt/ejp?a8mat=REPLACE_BLEGEND",
      },
      フィットネス器具: {
        Amazonスポーツ: "https://www.amazon.co.jp/s?k=フィットネス&tag=tk634-22",
      },
      フィットネスアプリ: {
        ライザップ: "https://px.a8.net/svt/ejp?a8mat=REPLACE_RIZAP",
        ティップネスオンライン: "https://px.a8.net/svt/ejp?a8mat=REPLACE_TIPNESS",
      },
      健康本: {
        運動脳: "https://www.amazon.co.jp/dp/4763140140/?tag=tk634-22",
        シリコンバレー式超ファスティング: "https://www.amazon.co.jp/dp/4484221020/?tag=tk634-22",
      },
      宅食・食事管理: {
        ナッシュ: "https://px.a8.net/svt/ejp?a8mat=REPLACE_NOSH",
        マッスルデリ: "https://px.a8.net/svt/ejp?a8mat=REPLACE_MUSCLEDELI",
      },
    },
    blog: {
      type: "hatena",
      hatenaEmail: "hzeefh2u4h.z5vbahlsjcgn6@blog.hatena.ne.jp",
      hatenaUrl: "https://takataka634.hatenablog.com/",
    },
    writerPersona: "管理栄養士・パーソナルトレーナーの資格を持つ健康ライター。500名以上のダイエット指導実績がある",
    targetReader: "20〜50代のダイエット・健康維持に関心がある男女",
    twitterHashtags: ["ダイエット", "健康", "筋トレ", "痩せる", "糖質制限"],
  },

  {
    id: "beauty",
    name: "美容・コスメ",
    topics: [
      "プチプラコスメで垢抜ける！2026年最新おすすめファンデーション10選",
      "30代からのスキンケア完全ガイド【シワ・たるみ・シミを防ぐ順番】",
      "クレンジングの正しい選び方【肌質別・おすすめアイテム比較】",
      "美容液の効果的な使い方と重ね付けの順番【成分別解説】",
      "韓国コスメおすすめ20選【通販で買えるプチプラ名品】",
      "ニキビ跡を消す方法【皮膚科と市販ケアの違いと選び方】",
      "日焼け止めの正しい塗り方と選び方【SPF・PA値の見方】",
      "毛穴レス肌を作る洗顔からケアまでの完全ルーティン",
      "ドラッグストアで買える最強乾燥肌ケアアイテム15選",
      "目の下のクマを消すコンシーラーの使い方と選び方",
      "髪のダメージを修復するトリートメントおすすめ比較",
      "40代からの美容投資【エイジングケアで差をつける方法】",
      "敏感肌でも使えるスキンケアブランドおすすめランキング",
      "セルフネイルを長持ちさせるコツと剥がれにくいベースコート比較",
      "ヒアルロン酸・コラーゲン・レチノールの違いと効果的な使い方",
      "眉毛サロンvs自己処理どちらがいい？コスパ比較と形の作り方",
      "化粧水の浸透を高めるコットンパックの正しいやり方",
      "美白効果が高い食べ物と避けるべき食べ物【体の内側から整える】",
      "メイクの時短テクニック10選【忙しい朝でも垢抜けるコツ】",
      "ホームホワイトニングvs歯科ホワイトニング徹底比較",
    ],
    affiliateLinks: {
      コスメ通販: {
        LIPS: "https://px.a8.net/svt/ejp?a8mat=REPLACE_LIPS",
        "アットコスメ通販": "https://px.a8.net/svt/ejp?a8mat=REPLACE_COSME",
        NOIN: "https://px.a8.net/svt/ejp?a8mat=REPLACE_NOIN",
      },
      スキンケア: {
        オルビス: "https://px.a8.net/svt/ejp?a8mat=REPLACE_ORBIS",
        ファンケル: "https://px.a8.net/svt/ejp?a8mat=REPLACE_FANCL",
        ドクターシーラボ: "https://px.a8.net/svt/ejp?a8mat=REPLACE_DRCILAB",
      },
      脱毛: {
        ミュゼプラチナム: "https://px.a8.net/svt/ejp?a8mat=REPLACE_MUSE",
        銀座カラー: "https://px.a8.net/svt/ejp?a8mat=REPLACE_GINZACOLOR",
      },
      美容本: {
        美肌の教科書: "https://www.amazon.co.jp/dp/4887188455/?tag=tk634-22",
      },
    },
    blog: {
      type: "hatena",
      hatenaEmail: "hzeefh2u4h.z5vbahlsjcgn6@blog.hatena.ne.jp",
      hatenaUrl: "https://takataka634.hatenablog.com/",
    },
    writerPersona: "美容専門ライター・元エステティシャン。10年間で1000人以上のスキンケア相談に対応してきた",
    targetReader: "20〜40代の美容に関心がある女性",
    twitterHashtags: ["美容", "コスメ", "スキンケア", "プチプラ", "垢抜け"],
  },

  {
    id: "realestate",
    name: "不動産・住宅ローン",
    topics: [
      "住宅ローン金利比較2026【固定vs変動どちらが得か徹底解説】",
      "マンションvs一戸建て どちらを買うべきか【生涯コスト比較】",
      "住宅ローン控除の正しい使い方【確定申告から最大還付を受ける方法】",
      "年収400万円でも家は買える？無理のない住宅購入の目安と計算法",
      "不動産投資で月10万円の家賃収入を得るための物件選び",
      "首都圏で3000万円以下の新築マンションを買う方法",
      "住宅ローンの繰り上げ返済は本当にお得か？シミュレーション比較",
      "賃貸vs購入どちらが得？老後まで含めた生涯コスト徹底比較",
      "フラット35と変動金利型どちらを選ぶべきか【2026年版】",
      "不動産投資の失敗パターン7選と回避方法",
      "ペアローンで家を買うメリット・デメリットと注意点",
      "中古マンションをリノベーションして資産価値を上げる方法",
      "マンション購入前に必ず確認すべき管理状態の見極め方",
      "土地から注文住宅を建てる完全ガイド【費用・流れ・業者選び】",
      "FIRE（経済的自立）を不動産で実現する具体的な戦略",
      "引越し費用を50%削減する交渉術と繁忙期を避けるタイミング",
      "不動産クラウドファンディングおすすめ5社比較【少額から始める】",
      "住宅購入の諸費用を完全解説【見落としがちな出費一覧】",
      "空き家・古民家を格安で購入してDIYリノベする方法",
      "民泊（Airbnb）投資の始め方と月収シミュレーション",
    ],
    affiliateLinks: {
      住宅ローン: {
        "住信SBIネット銀行": "https://px.a8.net/svt/ejp?a8mat=REPLACE_住信SBI",
        "楽天銀行住宅ローン": "https://px.a8.net/svt/ejp?a8mat=REPLACE_楽天ローン",
        "auじぶん銀行": "https://px.a8.net/svt/ejp?a8mat=REPLACE_AUJIBUN",
      },
      不動産投資: {
        RENOSY: "https://px.a8.net/svt/ejp?a8mat=REPLACE_RENOSY",
        "プロパティエージェント": "https://px.a8.net/svt/ejp?a8mat=REPLACE_PROP",
        "不動産クラファンCOZUCHI": "https://px.a8.net/svt/ejp?a8mat=REPLACE_COZUCHI",
      },
      不動産検索: {
        SUUMO: "https://px.a8.net/svt/ejp?a8mat=REPLACE_SUUMO",
        "HOMES": "https://px.a8.net/svt/ejp?a8mat=REPLACE_HOMES",
      },
      不動産本: {
        お金の大学: "https://www.amazon.co.jp/dp/4023323780/?tag=tk634-22",
        不動産投資の学校: "https://www.amazon.co.jp/dp/4478002908/?tag=tk634-22",
      },
    },
    blog: {
      type: "hatena",
      hatenaEmail: "hzeefh2u4h.z5vbahlsjcgn6@blog.hatena.ne.jp",
      hatenaUrl: "https://takataka634.hatenablog.com/",
    },
    writerPersona: "不動産投資家・ファイナンシャルプランナー。自身も複数の収益物件を保有し、家賃収入月50万円を達成している",
    targetReader: "30〜50代のマイホーム購入・不動産投資を検討している人",
    twitterHashtags: ["不動産", "住宅ローン", "不動産投資", "マイホーム", "FIRE"],
  },

  {
    id: "fx-credit",
    name: "FX・クレカ・保険",
    topics: [
      "FX初心者が最初の1万円を稼ぐまでの完全ロードマップ",
      "スプレッドが狭いFX業者おすすめ5社比較【2026年最新版】",
      "ゴールドカードのメリットと年会費が無料のおすすめ1枚",
      "マイルが貯まるクレジットカードおすすめ比較【航空会社別】",
      "生命保険の正しい見直し方【無駄な保険料を年20万円削減】",
      "医療保険は本当に必要か？貯蓄代わりになる考え方",
      "ドル円を初心者が安全に始めるためのFX基礎知識",
      "楽天カードvsSBIカードvs三井住友NLどれが最強か",
      "ETFへの投資とFXの組み合わせで資産を増やす戦略",
      "自動車保険を毎年見直して年5万円節約する方法",
      "ビットコインFXの始め方とリスク管理の基本",
      "積立FXとは？メリット・デメリットと証券会社比較",
      "がん保険は必要か？かかる確率と実際の治療費を元に判断する",
      "年会費無料の最強カード組み合わせ3枚【ポイント最大化】",
      "収入保障保険の選び方【掛け捨てで最小コストで最大保障】",
      "FXでスワップポイントを受け取りながら長期保有する方法",
      "クレジットカードのポイントをANAマイルに最も効率よく交換する方法",
      "海外旅行保険付きクレジットカードおすすめ5選【空港ラウンジ利用可】",
      "外貨建て保険のリスクを理解してから判断すべき理由",
      "仮想通貨取引所おすすめ比較【手数料・セキュリティ・使いやすさ】",
    ],
    affiliateLinks: {
      FX業者: {
        GMOクリック証券FX: "https://px.a8.net/svt/ejp?a8mat=REPLACE_GMO_FX",
        外為どっとコム: "https://px.a8.net/svt/ejp?a8mat=REPLACE_GAITAME",
        SBI_FXトレード: "https://px.a8.net/svt/ejp?a8mat=REPLACE_SBI_FX",
        XM: "https://px.a8.net/svt/ejp?a8mat=REPLACE_XM",
        DMM_CFD: "https://px.a8.net/svt/ejp?a8mat=4B5R02+1JDC1E+1WP2+NYHDT",
      },
      クレジットカード: {
        三井住友カードNL: "https://px.a8.net/svt/ejp?a8mat=REPLACE_SMC_NL",
        楽天プレミアムカード: "https://px.a8.net/svt/ejp?a8mat=REPLACE_RAKUTEN_PREMIUM",
        アメックスグリーン: "https://px.a8.net/svt/ejp?a8mat=REPLACE_AMEX",
        PayPayカード: "https://px.a8.net/svt/ejp?a8mat=REPLACE_PAYPAY_CARD",
      },
      保険: {
        ライフネット生命: "https://px.a8.net/svt/ejp?a8mat=REPLACE_LIFENET",
        チューリッヒ生命: "https://px.a8.net/svt/ejp?a8mat=REPLACE_ZURICH",
        保険見直しラボ: "https://px.a8.net/svt/ejp?a8mat=REPLACE_HOKEN_MINAOSHI",
      },
      仮想通貨: {
        コインチェック: "https://px.a8.net/svt/ejp?a8mat=REPLACE_COINCHECK",
        bitFlyer: "https://px.a8.net/svt/ejp?a8mat=REPLACE_BITFLYER",
      },
    },
    blog: {
      type: "hatena",
      hatenaEmail: "hzeefh2u4h.z5vbahlsjcgn6@blog.hatena.ne.jp",
      hatenaUrl: "https://takataka634.hatenablog.com/",
    },
    writerPersona: "FXトレーダー・ファイナンシャルプランナー。10年以上のFX経験と保険・クレカの専門知識を持つ",
    targetReader: "20〜50代のFX・クレカ・保険の最適化に関心がある人",
    twitterHashtags: ["FX", "クレジットカード", "保険", "ポイ活", "資産運用"],
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
