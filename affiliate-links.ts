/**
 * アフィリエイトリンクの一元管理ファイル
 *
 * ここが唯一の「本物のリンク置き場」。ジャンル定義（genres.ts）はここから参照する。
 * 新しい提携が承認されたら、このファイルに1行追加するだけで記事に反映される。
 *
 * ルール:
 * - 未提携・未取得のリンクは値を "PENDING" にしておく（記事には出力されない）
 * - A8のリンクは「広告リンク作成 → テキスト素材」の href URL をそのまま貼る
 * - Amazonは https://www.amazon.co.jp/dp/ASIN/?tag=タグ-22 形式
 */

export const PENDING = "PENDING"; // 未取得の印（REPLACE_と同様に出力されない）

export const LINKS = {
  // ===== A8.net 提携済み（2026-06-08 提携） =====
  DMM_CFD: "https://px.a8.net/svt/ejp?a8mat=4B5R02+1JDC1E+1WP2+NTJWY", // 新規登録+1取引 14,200円
  松井証券: "https://px.a8.net/svt/ejp?a8mat=4B5R02+29KENM+3XCC+69HAA", // 新規口座開設 1,000円（NISA訴求素材052）
  DMM株: "https://px.a8.net/svt/ejp?a8mat=4BCL3T+42GNLE+1WP2+15Q9SI", // 登録＋1取引 10,000円（素材009・2026-09-27提携）
  GMOとくとくBB_WiMAX: "https://px.a8.net/svt/ejp?a8mat=4B7U10+CM9RCI+50+3H3TCI", // WiMAX5G 5,100円（素材013・EPC50以上）
  BIGLOBE_WiMAX: "https://px.a8.net/svt/ejp?a8mat=4B7U10+DCGTYQ+B4+2BD44I", // 申込 5,000円（素材002・EPC50以上）
  MONSTER_MOBILE: "https://px.a8.net/svt/ejp?a8mat=4B7U10+DKSWFM+348K+3YW8WI", // 開通 2,000〜3,000円（素材001）
  おきらくホームWiFi: "https://px.a8.net/svt/ejp?a8mat=4B7U10+CWE4MQ+348K+44UKYA", // 開通 4,000円（素材001・個人向け）
  auひかり: "https://px.a8.net/svt/ejp?a8mat=4B7U10+DRY3OY+42Y0+5YJRM", // 開通 30,000円（素材001・EPC50以上）
  GMOとくとくBBドコモ光: "https://px.a8.net/svt/ejp?a8mat=4B7U10+ESUZ76+50+54MIOY", // 利用開始 9,000〜17,000円（素材010・EPC50以上）
  楽天モバイル: "https://px.a8.net/svt/ejp?a8mat=4B5R02+2DQFW2+5W58+5YRHE", // 新規利用 7,000円（素材002・EPC50以上）
  楽天アフィリエイト: "https://rpx.a8.net/svt/ejp?a8mat=4B5Q89+BPIX2Q+2HOM+6C1VM&rakuten=y&a8ejpredirect=http%3A%2F%2Fhb.afl.rakuten.co.jp%2Fhgc%2F0ea62065.34400275.0ea62066.204f04c0%2Fa26060722857_4B5Q89_BPIX2Q_2HOM_6C1VM%3Fpc%3Dhttp%253A%252F%252Fwww.rakuten.co.jp%252F%26m%3Dhttp%253A%252F%252Fm.rakuten.co.jp%252F", // 楽天市場 全商品対象（素材064・EPC7.08）
  お名前ドットコム: PENDING,  // 提携済み・リンク未取得

  // ===== 申請中（提携申請済み・承認待ち） =====
  松井証券iDeCo: "https://px.a8.net/svt/ejp?a8mat=4B7SGU+18NJ5E+3XCC+BXIYQ", // 口座開設申込 500円（素材004・承認済み）
  三井住友カードNL: PENDING,  // 2026-07-03申請 → 9/27時点で参加中リストに無し（未承認）
  GMOクリック証券FX: PENDING, // 2026-07-05申請 → 9/27時点で参加中リストに無し（未承認）
  SBI_FXトレード: PENDING,    // 2026-07-05申請 → 9/27時点で参加中リストに無し（未承認）

  // ===== 2026-09-27 申請（NISA・資産運用系） =====
  ガーデン: PENDING,             // 貯蓄の無料相談 初回面談10,250円 EPC118 確定率57%
  AllAbout家計相談所: PENDING,   // 無料相談11,279円 EPC1,448 確定率72%
  ファインドイットFP相談: PENDING, // FP無料相談13,000円 EPC127 確定率42%
  保険コンパス: PENDING,         // FP相談 オンライン8,000円/来店12,000円
  マネイロ: PENDING,             // セミナー1,200円・面談6,000円 EPC3.49
  アットセミナー: PENDING,       // 女性向けマネーセミナー参加7,000円 EPC21
  ひふみ投信: PENDING,           // 口座開設＋買付完了15,000円（条件重め）
  ALTERNA: PENDING,              // 口座開設＋10万円以上取引10,000円 EPC54 確定率62%
  GMOクリック証券: PENDING,      // 証券口座申込3,000円
  株プレゼント: PENDING,         // メルマガ登録230円（低単価・紐付けなし）
  ウェルスコーチ: PENDING,       // 不動産投資 面談15,000円（ブログ内容と不一致のため紐付けなし）
  RENOSY: PENDING,               // 不動産投資 資料請求13,534円（同上・紐付けなし）

  // ===== 未提携（承認され次第リンクを貼る） =====
  楽天証券: PENDING,
  SBI証券: PENDING,
  楽天カード: PENDING,
  楽天プレミアムカード: PENDING,
  PayPayカード: PENDING,
  マネーフォワードME: PENDING,
  外為どっとコム: PENDING,    // A8に無し（他ASPの可能性・優先度低）
  ライフネット生命: PENDING,
  保険見直しラボ: PENDING,
  生活110番: PENDING,       // 緊急トラブル系の最優先提携先
  イエコマ: "https://px.a8.net/svt/ejp?a8mat=4B7SGT+FDP5DE+31YC+61C2Q", // 戸建メンテナンス（関東・東北・静岡）素材014
  イエコマ排水管クリーニング: "https://px.a8.net/svt/ejp?a8mat=4B7SGT+FDP5DE+31YC+61JSI", // 排水管クリーニング訴求 素材015
  イエコマ洗濯機水漏れ対策: "https://px.a8.net/svt/ejp?a8mat=4B7SGT+FDP5DE+31YC+787AA", // 洗濯機の水漏れ安心訴求 素材214
  ミツモア: PENDING,

  // ===== Amazon（アソシエイト審査通過後にタグを確認） =====
  Amazon水回り用品: "https://www.amazon.co.jp/s?k=ラバーカップ&tag=tk634-22",
} as const;

export type LinkName = keyof typeof LINKS;

/** 有効な（取得済みの）リンクか */
export function isActiveLink(url: string): boolean {
  return url !== PENDING && !url.includes("REPLACE_");
}
