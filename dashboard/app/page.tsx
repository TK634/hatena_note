"use client";

import { useEffect, useState } from "react";

interface StatsResponse {
  genres: { id: string; name: string }[];
  todayStatus: Record<string, "success" | "failure" | "pending">;
  last7Days: { date: string; count: number }[];
  cost: { month: string; spend: number; budget: number; remaining: number };
  totalPosts: number;
}

const STATUS_META: Record<string, { label: string; className: string }> = {
  success: {
    label: "成功",
    className: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  },
  failure: {
    label: "失敗",
    className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  },
  pending: {
    label: "未実行",
    className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  },
};

export default function HomePage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/stats", { cache: "no-store" });
      if (!res.ok) throw new Error("読み込みに失敗しました");
      setStats(await res.json());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (error) {
    return <p className="text-sm text-red-600 dark:text-red-400">{error}</p>;
  }
  if (!stats) {
    return <p className="text-sm text-gray-500">読み込み中...</p>;
  }

  const maxCount = Math.max(1, ...stats.last7Days.map((d) => d.count));
  const costRatio = stats.cost.budget > 0 ? (stats.cost.spend / stats.cost.budget) * 100 : 0;

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-bold">ホーム</h1>
        <button onClick={load} className="text-xs font-medium text-brand dark:text-blue-400">
          更新
        </button>
      </header>

      <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400">今日の投稿ステータス</h2>
        <ul className="space-y-2">
          {stats.genres.map((g) => {
            const status = stats.todayStatus[g.id] ?? "pending";
            const meta = STATUS_META[status];
            return (
              <li key={g.id} className="flex items-center justify-between">
                <span className="text-sm">{g.name}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${meta.className}`}>
                  {meta.label}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
          今月のAPIコスト（{stats.cost.month}）
        </h2>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold">${stats.cost.spend.toFixed(2)}</p>
            <p className="text-xs text-gray-500">予算 ${stats.cost.budget.toFixed(2)}</p>
          </div>
          <p className="text-sm text-gray-500">残り ${stats.cost.remaining.toFixed(2)}</p>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div
            className="h-full rounded-full bg-brand"
            style={{ width: `${Math.min(100, costRatio)}%` }}
          />
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
          直近7日の投稿数（累計{stats.totalPosts}件）
        </h2>
        <div className="flex items-end justify-between gap-2">
          {stats.last7Days.map((d) => (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-20 w-full items-end">
                <div
                  className="w-full rounded-t bg-brand/80 dark:bg-blue-500/70"
                  style={{ height: `${Math.max(4, (d.count / maxCount) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-500">{d.date}</span>
              <span className="text-[10px] font-semibold">{d.count}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
