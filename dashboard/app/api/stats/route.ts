import { getTodayStatusByGenre, getLast7DaysPostCounts, getCostSummary } from "@/lib/stats";
import { readPostLog } from "@/lib/logs";
import { listGenres } from "@/lib/genres-parser";

export async function GET() {
  const genres = listGenres().map((g) => ({ id: g.id, name: g.name }));
  const todayStatus = getTodayStatusByGenre();
  const last7Days = getLast7DaysPostCounts();
  const cost = getCostSummary();
  const totalPosts = readPostLog().length;

  return Response.json({
    genres,
    todayStatus,
    last7Days,
    cost,
    totalPosts,
  });
}
