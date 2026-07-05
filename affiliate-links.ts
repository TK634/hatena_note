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
  GMOとくとくBB_WiMAX: "https://px.a8.net/svt/ejp?a8mat=4B7U10+CM9RCI+50+3H3TCI", // WiMAX5G 5,100円（素材013・EPC50以上）
  BIGLOBE_WiMAX: "https://px.a8.net/svt/ejp?a8mat=4B7U10+DCGTYQ+B4+2BD44I", // 申込 5,000円（素材002・EPC50以上）
  MONSTER_MOBILE: "https://px.a8.net/svt/ejp?a8mat=4B7U10+DKSWFM+348K+3YW8WI", // 開通 2,000〜3,000円（素材001）
  おきらくホームWiFi: "https://px.a8.net/svt/ejp?a8mat=4B7U10+CWE4MQ+348K+44UKYA", // 開通 4,000円（素材001・個人向け）
  auひかり: "https://px.a8.net/svt/ejp?a8mat=4B7U10+DRY3OY+42Y0+5YJRM", // 開通 30,000円（素材001・EPC50以上）
  GMOとくとくBBドコモ光: "https://px.a8.net/svt/ejp?a8mat=4B7U10+ESUZ76+50+54MIOY", // 利用開始 9,000〜17,000円（素材010・EPC50以上）
  楽天モバイル: "https://px.a8.net/svt/ejp?a8mat=4B5R02+2DQFW2+5W58+5YRHE", // 新規利用 7,000円（素材002・EPC50以上）
  楽天アフィリエイト: PENDING, // 提携済み・リンク未取得
  お名前ドットコム: PENDING,  // 提携済み・リンク未取得

  // ===== 申請中（提携申請済み・承認待ち） =====
  松井証券iDeCo: PENDING,     // 2026-07-03申請 新規口座開設申込 500円・審査あり
  三井住友カードNL: PENDING,  // 2026-07-03申請 審査あり
  GMOクリック証券FX: PENDING, // 2026-07-05申請 審査あり
  SBI_FXトレード: PENDING,    // 2026-07-05申請 審査あり

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
