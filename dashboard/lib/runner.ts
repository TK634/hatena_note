import { listGenres } from "./genres-parser";

export type RunGenre = "all" | string;

// このNodeプロセス内で同時に1つの実行しか許可しない簡易ロック
let running = false;

export function isRunActive(): boolean {
  return running;
}

export function setRunActive(value: boolean): void {
  running = value;
}

export function isValidRunGenre(genre: string): boolean {
  if (genre === "all") return true;
  return listGenres().some((g) => g.id === genre);
}

export function buildRunCommand(genre: RunGenre): { command: string; args: string[] } {
  if (genre === "all") {
    return { command: "npx", args: ["tsx", "run-all.ts"] };
  }
  return { command: "npx", args: ["tsx", "run.ts", genre] };
}
