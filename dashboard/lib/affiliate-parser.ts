import fs from "fs";
import { AFFILIATE_LINKS_TS_PATH } from "./paths";

export interface AffiliateLinkStatus {
  key: string;
  status: "active" | "pending";
  note?: string;
}

/** affiliate-links.ts の LINKS = { ... } を解析し、キーごとの提携状況を返す */
export function listAffiliateLinkStatus(): Record<string, AffiliateLinkStatus> {
  const text = fs.readFileSync(AFFILIATE_LINKS_TS_PATH, "utf-8");

  const keyIdx = text.indexOf("export const LINKS = {");
  const startIdx = keyIdx + "export const LINKS = {".length;
  const endIdx = text.indexOf("} as const;", startIdx);
  const content = text.slice(startIdx, endIdx === -1 ? undefined : endIdx);

  const lineRe = /^[ \t]*(\S+):\s*(PENDING|"(?:[^"\\]|\\.)*")\s*,?[ \t]*(?:\/\/\s*(.*))?$/gm;
  const result: Record<string, AffiliateLinkStatus> = {};
  let m: RegExpExecArray | null;
  while ((m = lineRe.exec(content))) {
    const [, key, value, note] = m;
    result[key] = {
      key,
      status: value === "PENDING" ? "pending" : "active",
      note: note?.trim() || undefined,
    };
  }
  return result;
}
