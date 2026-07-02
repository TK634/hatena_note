import { LINKS } from "./affiliate-links.js";

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
    name: "新NISA・証券の手続き",
    topics: [
      "楽天証券からSBI証券へNISA口座を移管する手順と注意点【2026年】",
      "新NISA つみたて投資枠と成長投資枠の使い分け【実例3パターン】",
      "iDeCoの掛金を変更する手順と反映されるタイミング",
      "特定口座の投資信託を新NISAに移すべきか判断する3つの基準",
      "クレカ積立を楽天証券からSBI証券へ乗り換えたときの還元率の差",
      "新NISAは楽天証券とSBI証券どちらにすべきか【ポイント還元で比較】",
      "投資信託を別の証券会社へ移管する方法と移管できないケース",
      "iDeCoの受け取りを一時金と年金どちらにするかの判断基準",
      "つみたてNISAから新NISAへ自動で引き継がれるもの・されないもの",
      "特定口座（源泉徴収あり）と一般口座どちらを選ぶべきか",
      "新NISAの非課税枠を使い切った後の投資先の選び方",
      "楽天証券のポイント投資のやり方と注意点【期間限定ポイントは使える?】",
      "配当金で確定申告が必要になるケースと不要にする受け取り方",
      "投資信託の分配金「再投資型」と「受取型」どちらを選ぶべきか",
      "新NISAで積立額を途中で増やす・減らすときの設定変更手順",
      "証券口座を解約する前に確認すべきこと【保有商品の扱い】",
      "クレカ積立の上限が月10万円に増えたときに見直すべき設定",
      "新NISAの成長投資枠で高配当ETFを買うときの銘柄の選び方",
      "iDeCoとNISAを両方やる場合の毎月の入金額の決め方",
      "投資信託の信託報酬を比較して乗り換えるか判断する基準",
    ],
    affiliateLinks: {
      証券口座: {
        楽天証券: LINKS.楽天証券,
        SBI証券: LINKS.SBI証券,
        松井証券: LINKS.松井証券,
      },
      クレジットカード: {
        楽天カード: LINKS.楽天カード,
        三井住友カードNL: LINKS.三井住友カードNL,
      },
      家計管理アプリ: {
        マネーフォワードME: LINKS.マネーフォワードME,
      },
    },
    blog: {
      type: "hatena",
      hatenaEmail: "hzeefh2u4h.z5vbahlsjcgn6@blog.hatena.ne.jp",
      hatenaUrl: "https://takataka634.hatenablog.com/",
    },
    writerPersona: "自分で新NISAとiDeCoを運用し、証券会社の移管や口座変更を実際に経験してきた個人投資家ブロガー。専門用語を避け、つまずいた点を具体的に書く",
    targetReader: "新NISA・iDeCoの具体的な手続きや設定で迷っている20〜40代",
    twitterHashtags: ["新NISA", "iDeCo", "SBI証券", "楽天証券", "資産運用"],
  },

  {
    id: "fx-credit",
    name: "クレカ・FX・保険の比較",
    topics: [
      "三井住友カードNLを申し込みから到着まで使った実体験【審査〜初回利用】",
      "楽天カードからゴールドに切り替える損益分岐点【年会費の元を取る条件】",
      "FX口座のスプレッドが狭いのはどこか 主要5社を実測比較【2026年】",
      "ANAマイルを最も効率よく貯めるクレカの組み合わせ【実例】",
      "FXを少額（1000通貨）から始めるための口座の選び方と注意点",
      "海外旅行保険が自動付帯するクレカおすすめ【条件と落とし穴】",
      "PayPayカードとリクルートカードどちらが還元率で得か【用途別】",
      "年会費無料で空港ラウンジが使えるクレカはあるか【現実的な選択肢】",
      "FXのスワップポイント狙いで長期保有する通貨ペアの選び方",
      "医療保険を解約する前に確認すべきこと【貯蓄で代替できるか】",
      "クレカの引き落とし口座を変更する手順と反映タイミング",
      "ガソリン代が安くなるクレカの選び方【還元と割引どちらが得か】",
      "FXの確定申告が必要になる利益の基準と書き方【会社員向け】",
      "ナンバーレスカードのセキュリティと使い勝手を実際に使って検証",
      "生命保険を見直すときに最初に削るべき特約の見分け方",
      "クレカを複数枚持つときの管理方法と年会費で損しないコツ",
      "FX口座を放置・休眠させたときのリスクと解約手順",
      "ふるさと納税をクレカ払いでポイント二重取りする手順",
      "自動車保険を一括見積もりで乗り換えて保険料を下げた実体験",
      "電子マネーへのチャージで還元されるクレカの組み合わせ",
    ],
    affiliateLinks: {
      FX業者: {
        GMOクリック証券FX: LINKS.GMOクリック証券FX,
        外為どっとコム: LINKS.外為どっとコム,
        SBI_FXトレード: LINKS.SBI_FXトレード,
      },
      CFD口座: {
        DMM_CFD: LINKS.DMM_CFD,
      },
      クレジットカード: {
        三井住友カードNL: LINKS.三井住友カードNL,
        楽天プレミアムカード: LINKS.楽天プレミアムカード,
        PayPayカード: LINKS.PayPayカード,
      },
      保険: {
        ライフネット生命: LINKS.ライフネット生命,
        保険見直しラボ: LINKS.保険見直しラボ,
      },
      格安SIM: {
        楽天モバイル: LINKS.楽天モバイル,
      },
    },
    blog: {
      type: "hatena",
      hatenaEmail: "hzeefh2u4h.z5vbahlsjcgn6@blog.hatena.ne.jp",
      hatenaUrl: "https://takataka634.hatenablog.com/",
    },
    writerPersona: "クレカ・FX・保険を自分で何枚も契約・比較してきたお金の最適化好きの個人ブロガー。実際に申し込んで使った体験ベースで、デメリットも正直に書く",
    targetReader: "クレカ・FX・保険を具体的に申し込む・乗り換える・見直すか迷っている20〜50代",
    twitterHashtags: ["クレジットカード", "FX", "ポイ活", "保険見直し", "節約"],
  },

  {
    id: "emergency",
    name: "住まいの緊急トラブル",
    topics: [
      "賃貸でトイレが詰まったとき大家に連絡する前にやった3つのこと",
      "キッチンの排水溝が逆流したとき自分で解決した手順【業者を呼ぶ基準】",
      "エアコンから水漏れしたとき自分で直せたケースと業者が必要なケース",
      "洗濯機の排水エラーが出たとき最初に確認すべき場所",
      "玄関の鍵が回らない・抜けないときの応急処置と業者の費用相場",
      "給湯器のお湯が出ないとき自分で確認する手順【凍結・リセット】",
      "トイレの水が止まらないときタンク内で確認すべき部品",
      "排水溝の臭いが上がってくる原因と自分でできる対処法",
      "賃貸の水漏れは誰の負担？大家・管理会社への連絡手順と費用",
      "蛇口からポタポタ水漏れするときの応急処置と必要な部品",
      "停電したとき分電盤（ブレーカー）で確認する手順",
      "排水管が詰まったときラバーカップ（スッポン）の正しい使い方",
      "ウォシュレットが反応しないときに確認する3か所",
      "お風呂の排水が流れないときに自分でできる詰まり解消法",
      "窓ガラスが割れたときの応急処置と賃貸での連絡先",
      "洗面台の下から水漏れしたとき最初に止めるべき場所",
      "トイレタンクに水が溜まらないときの原因と対処手順",
      "エアコンが効かないとき業者を呼ぶ前に試す確認ポイント",
      "賃貸で網戸が破れた・外れたときの自分での直し方と費用負担",
      "鍵を紛失したときの対応手順と賃貸での交換費用の目安",
    ],
    affiliateLinks: {
      水回り・トラブル業者: {
        生活110番: LINKS.生活110番,
        イエコマ: LINKS.イエコマ,
        ミツモア: LINKS.ミツモア,
      },
      工具・部品: {
        Amazon水回り用品: LINKS.Amazon水回り用品,
      },
    },
    blog: {
      type: "hatena",
      hatenaEmail: "hzeefh2u4h.z5vbahlsjcgn6@blog.hatena.ne.jp",
      hatenaUrl: "https://takataka634.hatenablog.com/",
    },
    writerPersona: "賃貸暮らしで水回り・住宅設備のトラブルを何度も自分で対処してきた実体験ブロガー。まず自分で試せること、業者を呼ぶべき判断基準、賃貸での費用負担を具体的に書く",
    targetReader: "今まさに住まいのトラブルが起きて急いで解決法を探している人",
    twitterHashtags: ["賃貸", "水漏れ", "トラブル", "暮らしの知恵", "DIY"],
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
