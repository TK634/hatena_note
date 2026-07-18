"use client";

import { useEffect, useState } from "react";

interface GenreMeta {
  id: string;
  name: string;
  topics: string[];
}

interface LinkUsage {
  category: string;
  displayName: string;
  status: "active" | "pending";
}

export default function TopicsPage() {
  const [genres, setGenres] = useState<GenreMeta[] | null>(null);
  const [linksByGenre, setLinksByGenre] = useState<Record<string, LinkUsage[]>>({});
  const [activeGenre, setActiveGenre] = useState<string>("invest");
  const [newTopic, setNewTopic] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/topics", { cache: "no-store" });
      if (!res.ok) throw new Error("読み込みに失敗しました");
      const data = await res.json();
      setGenres(data.genres);
      setLinksByGenre(data.affiliateLinksByGenre);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd() {
    if (!newTopic.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ genreId: activeGenre, topic: newTopic }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "追加に失敗しました");
      setNewTopic("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(topic: string) {
    if (busy) return;
    if (!confirm(`このトピックを削除しますか？\n${topic}`)) return;
    setBusy(true);
    try {
      const res = await fetch("/api/topics", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ genreId: activeGenre, topic }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "削除に失敗しました");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  if (error) return <p className="text-sm text-red-600 dark:text-red-400">{error}</p>;
  if (!genres) return <p className="text-sm text-gray-500">読み込み中...</p>;

  const current = genres.find((g) => g.id === activeGenre) ?? genres[0];
  const links = linksByGenre[current.id] ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">トピック管理</h1>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {genres.map((g) => (
          <button
            key={g.id}
            onClick={() => setActiveGenre(g.id)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${
              activeGenre === g.id
                ? "bg-brand text-white"
                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {g.name}
          </button>
        ))}
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
          トピック一覧（{current.topics.length}件）
        </h2>
        <div className="mb-3 flex gap-2">
          <input
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder="新しいトピックを入力"
            className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          />
          <button
            onClick={handleAdd}
            disabled={busy || !newTopic.trim()}
            className="shrink-0 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            追加
          </button>
        </div>
        <ul className="max-h-96 space-y-2 overflow-y-auto">
          {current.topics.map((t, i) => (
            <li
              key={i}
              className="flex items-start justify-between gap-2 rounded-lg bg-gray-50 p-2 text-sm dark:bg-gray-800/60"
            >
              <span className="flex-1">{t}</span>
              <button
                onClick={() => handleDelete(t)}
                disabled={busy}
                className="shrink-0 text-xs font-medium text-red-600 disabled:opacity-50 dark:text-red-400"
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400">アフィリエイトリンクの状況</h2>
        {links.length === 0 ? (
          <p className="text-sm text-gray-500">このジャンルに紐づくリンクはありません</p>
        ) : (
          <ul className="space-y-1.5">
            {links.map((l, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span>
                  <span className="mr-1 text-xs text-gray-400">{l.category}</span>
                  {l.displayName}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    l.status === "active"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400"
                  }`}
                >
                  {l.status === "active" ? "提携済み" : "PENDING"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
