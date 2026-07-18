import { spawn } from "child_process";
import { ROOT_DIR } from "@/lib/paths";
import { isRunActive, setRunActive, isValidRunGenre, buildRunCommand } from "@/lib/runner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ running: isRunActive() });
}

export async function POST(request: Request) {
  if (isRunActive()) {
    return new Response("すでに実行中です。完了までお待ちください。\n", { status: 409 });
  }

  const body = await request.json().catch(() => null);
  const genre = body?.genre as string | undefined;

  if (!genre || !isValidRunGenre(genre)) {
    return new Response("不正なジャンルが指定されました\n", { status: 400 });
  }

  const { command, args } = buildRunCommand(genre);
  setRunActive(true);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      const safeEnqueue = (text: string) => {
        if (!closed) controller.enqueue(encoder.encode(text));
      };

      const child = spawn(command, args, { cwd: ROOT_DIR, env: process.env });

      child.stdout.on("data", (chunk: Buffer) => safeEnqueue(chunk.toString()));
      child.stderr.on("data", (chunk: Buffer) => safeEnqueue(chunk.toString()));

      child.on("close", (code) => {
        safeEnqueue(`\n\n[終了コード: ${code ?? "unknown"}]\n`);
        closed = true;
        controller.close();
        setRunActive(false);
      });

      child.on("error", (err) => {
        safeEnqueue(`\n\n[実行エラー: ${err.message}]\n`);
        closed = true;
        controller.close();
        setRunActive(false);
      });
    },
    cancel() {
      setRunActive(false);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
