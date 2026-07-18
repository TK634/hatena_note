"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "ホーム", icon: "🏠" },
  { href: "/posts", label: "記事一覧", icon: "📰" },
  { href: "/run", label: "手動実行", icon: "▶️" },
  { href: "/topics", label: "トピック", icon: "🗂️" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)] dark:border-gray-800 dark:bg-gray-900/95">
      <ul className="mx-auto flex max-w-lg items-stretch justify-between">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-2 text-xs ${
                  active
                    ? "text-brand dark:text-blue-400 font-semibold"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <span className="text-lg leading-none">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
