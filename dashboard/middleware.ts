import { NextRequest, NextResponse } from "next/server";

// .env の DASHBOARD_USER / DASHBOARD_PASSWORD でBasic認証をかける
// 未設定の場合は開発しやすさを優先して認証をスキップする
export function middleware(request: NextRequest) {
  const user = process.env.DASHBOARD_USER;
  const password = process.env.DASHBOARD_PASSWORD;

  if (!user || !password) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Basic ")) {
    const encoded = authHeader.slice("Basic ".length);
    const decoded = Buffer.from(encoded, "base64").toString("utf-8");
    const separatorIndex = decoded.indexOf(":");
    const reqUser = decoded.slice(0, separatorIndex);
    const reqPassword = decoded.slice(separatorIndex + 1);

    if (reqUser === user && reqPassword === password) {
      return NextResponse.next();
    }
  }

  return new NextResponse("認証が必要です", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="dashboard"' },
  });
}

export const config = {
  // manifest.json・アイコン・Service Workerは認証なしで配信する
  matcher: ["/((?!manifest.json|icons|sw.js|workbox-.*\\.js|favicon.ico).*)"],
};
