import fs from "fs";
import { GENRES_TS_PATH } from "./paths";

/**
 * genres.ts はTypeScriptのソースファイルなので、ASTで丸ごと書き換えると
 * フォーマットが崩れるリスクがある。そのため「id: "xxx" ブロック内の
 * topics: [ ... ] 配列」だけをテキストとして特定し、範囲を限定して読み書きする。
 * トピック文字列に半角 [ ] が含まれない前提（現状のトピックは全角【】のみ使用）。
 */

export interface GenreMeta {
  id: string;
  name: string;
  topics: string[];
}

export interface AffiliateLinkUsage {
  category: string;
  displayName: string;
  linksKey: string;
}

function readGenresFile(): string {
  return fs.readFileSync(GENRES_TS_PATH, "utf-8");
}

function writeGenresFile(text: string): void {
  fs.writeFileSync(GENRES_TS_PATH, text, "utf-8");
}

/** id:"genreId" ブロックの [開始, 終了) 範囲をファイル全体のインデックスで返す */
function findGenreBlockRange(text: string, genreId: string): { start: number; end: number } {
  const idMarker = `id: "${genreId}"`;
  const start = text.indexOf(idMarker);
  if (start === -1) {
    throw new Error(`ジャンルが見つかりません: ${genreId}`);
  }

  const nextBlockRe = /\n {2}\{\s*\n {4}id: "/g;
  nextBlockRe.lastIndex = start;
  const nextMatch = nextBlockRe.exec(text);
  const arrayCloseIdx = text.indexOf("\n];", start);
  let end: number;
  if (nextMatch && (arrayCloseIdx === -1 || nextMatch.index < arrayCloseIdx)) {
    end = nextMatch.index;
  } else if (arrayCloseIdx !== -1) {
    end = arrayCloseIdx;
  } else {
    end = text.length;
  }
  return { start, end };
}

/** topics: [ ... ] の配列中身（[の直後 〜 ]の直前）のファイル内インデックス範囲 */
function findTopicsArrayRange(text: string, genreId: string): { arrayStart: number; arrayEnd: number } {
  const { start, end } = findGenreBlockRange(text, genreId);
  const block = text.slice(start, end);
  const keyIdx = block.indexOf("topics: [");
  if (keyIdx === -1) {
    throw new Error(`topics配列が見つかりません: ${genreId}`);
  }
  const arrayStartRel = keyIdx + "topics: [".length;
  const arrayEndRel = block.indexOf("]", arrayStartRel);
  if (arrayEndRel === -1) {
    throw new Error(`topics配列の終端が見つかりません: ${genreId}`);
  }
  return { arrayStart: start + arrayStartRel, arrayEnd: start + arrayEndRel };
}

function parseTopicsFromArrayContent(content: string): string[] {
  const matches = content.match(/"(?:[^"\\]|\\.)*"/g) ?? [];
  return matches.map((m) => JSON.parse(m) as string);
}

export function getGenreTopics(genreId: string): string[] {
  const text = readGenresFile();
  const { arrayStart, arrayEnd } = findTopicsArrayRange(text, genreId);
  return parseTopicsFromArrayContent(text.slice(arrayStart, arrayEnd));
}

function writeGenreTopics(genreId: string, topics: string[]): void {
  const text = readGenresFile();
  const { arrayStart, arrayEnd } = findTopicsArrayRange(text, genreId);
  const body = topics.map((t) => `      ${JSON.stringify(t)},`).join("\n");
  const replacement = `\n${body}\n    `;
  const newText = text.slice(0, arrayStart) + replacement + text.slice(arrayEnd);
  writeGenresFile(newText);
}

export function addTopic(genreId: string, topic: string): void {
  const trimmed = topic.trim();
  if (!trimmed) throw new Error("トピックが空です");
  const topics = getGenreTopics(genreId);
  topics.push(trimmed);
  writeGenreTopics(genreId, topics);
}

export function deleteTopic(genreId: string, topic: string): void {
  const topics = getGenreTopics(genreId);
  const filtered = topics.filter((t) => t !== topic);
  writeGenreTopics(genreId, filtered);
}

/** 全ジャンルの id/name/topics 一覧（画面④トピック管理用） */
export function listGenres(): GenreMeta[] {
  const text = readGenresFile();
  const idRe = /id:\s*"([^"]+)"/g;
  const ids: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = idRe.exec(text))) {
    ids.push(m[1]);
  }
  return ids.map((id) => {
    const { start, end } = findGenreBlockRange(text, id);
    const block = text.slice(start, end);
    const nameMatch = block.match(/name:\s*"([^"]+)"/);
    return {
      id,
      name: nameMatch ? nameMatch[1] : id,
      topics: getGenreTopics(id),
    };
  });
}

/** ジャンルごとに使用しているアフィリエイトリンク（カテゴリ・表示名・LINKSキー） */
export function listAffiliateLinkUsageByGenre(): Record<string, AffiliateLinkUsage[]> {
  const text = readGenresFile();
  const idRe = /id:\s*"([^"]+)"/g;
  const ids: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = idRe.exec(text))) {
    ids.push(m[1]);
  }

  const result: Record<string, AffiliateLinkUsage[]> = {};
  for (const id of ids) {
    const { start, end } = findGenreBlockRange(text, id);
    const block = text.slice(start, end);
    const keyIdx = block.indexOf("affiliateLinks: {");
    if (keyIdx === -1) {
      result[id] = [];
      continue;
    }
    // 波かっこの対応を数えて affiliateLinks オブジェクトの終わりを見つける
    let depth = 1;
    let i = keyIdx + "affiliateLinks: {".length;
    const contentStart = i;
    for (; i < block.length && depth > 0; i++) {
      if (block[i] === "{") depth++;
      else if (block[i] === "}") depth--;
    }
    const content = block.slice(contentStart, i - 1);

    const usages: AffiliateLinkUsage[] = [];
    let currentCategory = "";
    for (const line of content.split("\n")) {
      const categoryMatch = line.match(/^\s*([^\s:{}]+):\s*\{\s*$/);
      if (categoryMatch) {
        currentCategory = categoryMatch[1];
        continue;
      }
      const itemMatch = line.match(/^\s*([^\s:{}]+):\s*LINKS\.([^\s,}]+)/);
      if (itemMatch) {
        usages.push({ category: currentCategory, displayName: itemMatch[1], linksKey: itemMatch[2] });
      }
    }
    result[id] = usages;
  }
  return result;
}
