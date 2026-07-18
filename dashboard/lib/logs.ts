import fs from "fs";
import { POST_LOG_PATH, COST_LOG_PATH } from "./paths";

export interface PostLogEntry {
  date: string;
  genreId?: string;
  title: string;
  url: string;
  tags: string[];
  ogpImagePath?: string;
}

export type CostLog = Record<string, number>; // "YYYY-MM" -> USD累計

// cost-guard.ts と同じ値（月の予算上限）
export const MONTHLY_BUDGET_USD = 4.5;

function readJson<T>(filePath: string, fallback: T): T {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

export function readPostLog(): PostLogEntry[] {
  return readJson<PostLogEntry[]>(POST_LOG_PATH, []);
}

export function readCostLog(): CostLog {
  return readJson<CostLog>(COST_LOG_PATH, {});
}

export function currentMonthKey(date = new Date()): string {
  return date.toISOString().slice(0, 7);
}

export function todayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}
