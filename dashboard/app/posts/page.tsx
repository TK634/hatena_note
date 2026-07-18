"use client";

import { useEffect, useMemo, useState } from "react";

interface PostLogEntry {
  date: string;
  genreId?: string;
  title: string;
  url: string;
  tags: string[];
}

const GENRE_LABEL: Record<string, string> = {
  invest: "新NISA・証券",
  "fx-credit": "クレカ・FX・保険",
  emergency: "住まいの緊急トラブル",
};

export default function ArticlesPage() {
  const [posts, setPosts] = useState<PostLogEntry[] | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/logs", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setPosts(data.postLog))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  const genreIds = useMemo(() => {
    if (!posts) return [];
    return Array.from(new Set(posts.map((p) => p.genreId).filter(Boolean))) as string[];
  }, [posts]);

  const filtered = useMemo(() => {
    if (!posts) return [];
    if (filter === "all") return posts;
    return posts.filter((p) => p.genreId === filter);
  }, [posts, filter]);

  if (error) return <p className="text-sm text-red-600 dark:text-red-400">{error}</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">記事一覧</h1>

      <div className="flex flex-wrap gap-2">
        <FilterButton active={filter === "all"} onClick={() => setFilter("all")} label={`全部 (${posts?.length ?? 0})`} />
        {genreIds.map((id) => (
          <FilterButton
            key={id}
            active={filter === id}
            onClick={() => setFilter(id)}
            label={`${GENRE_LABEL[id] ?? id} (${posts?.filter((p) => p.genreId === id).length ?? 0})`}
          />
        ))}
      </div>

      {!posts ? (
        <p className="text-sm text-gray-500">読み込み中...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-500">記事がありません</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((post, i) => (
            <li
              key={i}
              className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                <span>{new Date(post.date).toLocaleString("ja-JP")}</span>
                {post.genreId && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 dark:bg-gray-800">
                    {GENRE_LABEL[post.genreId] ?? post.genreId}
                  </span>
                )}
              </div>
              <a
                href={post.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-brand dark:text-blue-400"
              >
                {post.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        active ? "bg-brand text-white" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
      }`}
    >
      {label}
    </button>
  );
}
