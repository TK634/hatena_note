"use client";

import { useEffect, useRef, useState } from "react";

const GENRE_OPTIONS = [
  { id: "invest", label: "新NISA・証券" },
  { id: "fx-credit", label: "クレカ・FX・保険" },
  { id: "emergency", label: "住まいの緊急トラブル" },
  { id: "all", label: "全部まとめて" },
];

export default function RunPage() {
  const [selected, setSelected] = useState("invest");
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState("");
  const logRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    // 他のタブ・スケジュール実行が既に走っていないか確認
    fetch("/api/run", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setRunning(Boolean(data.running)))
      .catch(() => {});
  }, []);

  async function handleRun() {
    if (running) return;
    setRunning(true);
    setLog("");

    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ genre: selected }),
      });

      if (!res.body) {
        setLog(await res.text());
        return;
      }
      if (!res.ok && res.status === 409) {
        setLog(await res.text());
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        setLog((prev) => prev + decoder.decode(value, { stream: true }));
        logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
      }
    } catch (e) {
      setLog((prev) => prev + `\n通信エラー: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">手動実行</h1>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">ジャンルを選択</h2>
        <div className="grid grid-cols-2 gap-2">
          {GENRE_OPTIONS.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelected(g.id)}
              disabled={running}
              className={`rounded-lg border px-3 py-3 text-sm font-medium disabled:opacity-50 ${
                selected === g.id
                  ? "border-brand bg-brand/10 text-brand dark:border-blue-400 dark:bg-blue-400/10 dark:text-blue-400"
                  : "border-gray-200 text-gray-600 dark:border-gray-800 dark:text-gray-300"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleRun}
        disabled={running}
        className="w-full rounded-lg bg-brand py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        {running ? "実行中..." : "今すぐ生成・投稿"}
      </button>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">実行ログ</h2>
        <pre
          ref={logRef}
          className="h-80 overflow-y-auto whitespace-pre-wrap break-words rounded-lg bg-gray-900 p-3 text-xs leading-relaxed text-green-400"
        >
          {log || "（ここに実行ログが表示されます）"}
        </pre>
      </div>
    </div>
  );
}
