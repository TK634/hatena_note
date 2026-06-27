/**
 * Anthropic APIの月間利用額を実トークン数から積算し、
 * 月の予算（既定$4.5）を超えそうなら生成を止める安全装置。
 *
 * cost-log.json に { "2026-06": 1.23, ... } の形で月別累計(USD)を保存する。
 */
import * as fs from "fs";

// claude-haiku-4-5 の料金（USD / 100万トークン）
const PRICE_INPUT_PER_M = 1.0;
const PRICE_OUTPUT_PER_M = 5.0;

// 月の上限（$5を超えないよう余裕を持たせる）
export const MONTHLY_BUDGET_USD = 4.5;

const COST_FILE = "cost-log.json";

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7); // "YYYY-MM"
}

function readCosts(): Record<string, number> {
  if (!fs.existsSync(COST_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(COST_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function writeCosts(costs: Record<string, number>): void {
  fs.writeFileSync(COST_FILE, JSON.stringify(costs, null, 2));
}

/** 今月のこれまでの利用額(USD) */
export function getMonthlySpend(): number {
  return readCosts()[currentMonth()] ?? 0;
}

/** 予算に達していないか（true なら生成してよい） */
export function hasBudgetLeft(): boolean {
  return getMonthlySpend() < MONTHLY_BUDGET_USD;
}

/** API応答のusageから課金額を計算して今月の累計に加算し、加算後の累計を返す */
export function recordUsage(usage: { input_tokens?: number; output_tokens?: number } | null | undefined): number {
  const input = usage?.input_tokens ?? 0;
  const output = usage?.output_tokens ?? 0;
  const cost =
    (input / 1_000_000) * PRICE_INPUT_PER_M +
    (output / 1_000_000) * PRICE_OUTPUT_PER_M;

  const costs = readCosts();
  const month = currentMonth();
  costs[month] = (costs[month] ?? 0) + cost;
  writeCosts(costs);
  return costs[month];
}

// 単体実行: npx tsx cost-guard.ts  → 今月の利用額を表示
if (process.argv[1].endsWith("cost-guard.ts") || process.argv[1].endsWith("cost-guard.js")) {
  console.log(`今月の利用額: $${getMonthlySpend().toFixed(4)} / 上限 $${MONTHLY_BUDGET_USD}`);
}
