import { listGenres, addTopic, deleteTopic, listAffiliateLinkUsageByGenre } from "@/lib/genres-parser";
import { listAffiliateLinkStatus } from "@/lib/affiliate-parser";

export async function GET() {
  const genres = listGenres();
  const usageByGenre = listAffiliateLinkUsageByGenre();
  const linkStatus = listAffiliateLinkStatus();

  const affiliateLinksByGenre: Record<
    string,
    { category: string; displayName: string; status: "active" | "pending" }[]
  > = {};

  for (const [genreId, usages] of Object.entries(usageByGenre)) {
    affiliateLinksByGenre[genreId] = usages.map((u) => ({
      category: u.category,
      displayName: u.displayName,
      status: linkStatus[u.linksKey]?.status ?? "pending",
    }));
  }

  return Response.json({ genres, affiliateLinksByGenre });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const genreId = body?.genreId as string | undefined;
  const topic = body?.topic as string | undefined;

  if (!genreId || !topic || !topic.trim()) {
    return Response.json({ error: "genreId と topic は必須です" }, { status: 400 });
  }

  try {
    addTopic(genreId, topic);
    return Response.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const body = await request.json().catch(() => null);
  const genreId = body?.genreId as string | undefined;
  const topic = body?.topic as string | undefined;

  if (!genreId || !topic) {
    return Response.json({ error: "genreId と topic は必須です" }, { status: 400 });
  }

  try {
    deleteTopic(genreId, topic);
    return Response.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 400 });
  }
}
