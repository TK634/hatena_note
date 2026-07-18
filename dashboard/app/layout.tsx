import type { Metadata, Viewport } from "next";
import BottomNav from "@/components/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "自動収益化ダッシュボード",
  description: "はてなブログ自動投稿・アフィリエイト収益化システムの管理ダッシュボード",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "収益化ダッシュボード",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="dark:[color-scheme:dark]">
      <body className="min-h-dvh antialiased">
        <div className="mx-auto max-w-lg px-4 pb-24 pt-4">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}
