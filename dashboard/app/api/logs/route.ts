import { readPostLog, readCostLog } from "@/lib/logs";

export async function GET() {
  const postLog = readPostLog();
  const costLog = readCostLog();
  // 新しい記事から表示できるよう降順にして返す
  return Response.json({
    postLog: [...postLog].reverse(),
    costLog,
  });
}
