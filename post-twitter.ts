import { TwitterApi } from "twitter-api-v2";
import type { Article } from "./generate.js";

export async function postToTwitter(
  article: Article,
  blogUrl: string,
  genreHashtags: string[] = []
): Promise<void> {
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_SECRET!,
  });

  // ジャンルのハッシュタグを優先し、記事タグで補完（280字制限内で収める）
  const hashtags = [...new Set([...genreHashtags, ...article.tags])]
    .slice(0, 5)
    .map((t) => `#${t}`)
    .join(" ");
  const tweet = `【新着記事】${article.title}\n\n${hashtags}\n\n${blogUrl}`;

  await client.v2.tweet(tweet.slice(0, 280));
  console.log(`   ✅ Xに投稿完了`);
}
