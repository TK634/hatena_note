import path from "path";

// dashboard/ の一つ上、auto-income/ のルートディレクトリ
export const ROOT_DIR = path.resolve(process.cwd(), "..");

export const POST_LOG_PATH = path.join(ROOT_DIR, "post-log.json");
export const COST_LOG_PATH = path.join(ROOT_DIR, "cost-log.json");
export const GENRES_TS_PATH = path.join(ROOT_DIR, "genres.ts");
export const AFFILIATE_LINKS_TS_PATH = path.join(ROOT_DIR, "affiliate-links.ts");
export const CRON_LOG_PATH = path.join(ROOT_DIR, "cron.log");
