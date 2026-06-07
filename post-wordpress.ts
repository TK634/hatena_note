/**
 * WordPress REST API への自動投稿
 *
 * 対応サイト: WordPress.com / 自己ホスト型WordPress（REST API有効）
 *
 * .env に設定:
 *   WP_URL=https://your-site.com
 *   WP_USERNAME=admin
 *   WP_APP_PASSWORD=xxxx xxxx xxxx xxxx  （WordPress管理画面 > ユーザー > アプリケーションパスワードで生成）
 */
import type { Article } from "./generate.js";
import type { Genre } from "./genres.js";

interface WpPost {
  id: number;
  link: string;
}

export async function postToWordPress(article: Article, genre: Genre): Promise<string> {
  const wpUrl = process.env.WP_URL;
  const wpUser = process.env.WP_USERNAME;
  const wpPass = process.env.WP_APP_PASSWORD;

  if (!wpUrl || !wpUser || !wpPass) {
    console.log("   ⏭ WordPress スキップ（WP_URL/WP_USERNAME/WP_APP_PASSWORD 未設定）");
    return "";
  }

  const token = Buffer.from(`${wpUser}:${wpPass}`).toString("base64");
  const apiUrl = `${wpUrl.replace(/\/$/, "")}/wp-json/wp/v2/posts`;

  const body = {
    title: article.title,
    content: markdownToWpBlocks(article.content),
    status: "publish",
    categories: [],
    tags: article.tags,
    meta: {
      _yoast_wpseo_metadesc: article.title,
      _yoast_wpseo_focuskw: article.tags[0] ?? "",
    },
  };

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WordPress投稿失敗 (${res.status}): ${err.slice(0, 200)}`);
  }

  const post = (await res.json()) as WpPost;
  console.log(`   ✅ WordPress に投稿完了: ${post.link}`);
  return post.link;
}

function markdownToWpBlocks(md: string): string {
  // WordPress Gutenberg ブロック形式に変換
  const lines = md.split("\n");
  const blocks: string[] = [];

  for (const line of lines) {
    if (line.startsWith("### ")) {
      blocks.push(`<!-- wp:heading {"level":3} -->\n<h3>${inline(line.slice(4))}</h3>\n<!-- /wp:heading -->`);
    } else if (line.startsWith("## ")) {
      blocks.push(`<!-- wp:heading {"level":2} -->\n<h2>${inline(line.slice(3))}</h2>\n<!-- /wp:heading -->`);
    } else if (line.startsWith("# ")) {
      blocks.push(`<!-- wp:heading {"level":1} -->\n<h1>${inline(line.slice(2))}</h1>\n<!-- /wp:heading -->`);
    } else if (line.startsWith("- ")) {
      blocks.push(`<!-- wp:list-item -->\n<li>${inline(line.slice(2))}</li>\n<!-- /wp:list-item -->`);
    } else if (line.trim() === "---") {
      blocks.push(`<!-- wp:separator -->\n<hr class="wp-block-separator"/>\n<!-- /wp:separator -->`);
    } else if (line.trim() !== "") {
      blocks.push(`<!-- wp:paragraph -->\n<p>${inline(line)}</p>\n<!-- /wp:paragraph -->`);
    }
  }

  return blocks.join("\n\n");
}

function inline(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
}
