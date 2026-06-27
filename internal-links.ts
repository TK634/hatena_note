/**
 * 同ジャンルの過去記事タイトルを post-log.json から取得し、
 * 記事末尾に「関連記事」セクションとして内部リンクを追加する
 */
import * as fs from "fs";
import type { Article } from "./generate.js";

interface LogEntry {
  date: string;
  genreId: string;
  title: string;
  url: string;
}

export function appendInternalLinks(article: Article): Article {
  const logFile = "post-log.json";
  if (!fs.existsSync(logFile)) return article;

  const logs: LogEntry[] = JSON.parse(fs.readFileSync(logFile, "utf-8"));

  // 個別記事URL（/entry/ を含む）を持つものだけ対象にする。
  // トップページURLのままの記事をリンクすると全部トップに飛んでしまうため除外。
  const related = logs
    .filter(
      (l) =>
        l.genreId === article.genreId &&
        l.title !== article.title &&
        l.url.includes("/entry/")
    )
    .slice(-5)
    .reverse();

  if (related.length === 0) return article;

  const section =
    "\n\n---\n\n## 関連記事\n\n" +
    related.map((r) => `- [${r.title}](${r.url})`).join("\n") +
    "\n";

  return { ...article, content: article.content + section };
}
