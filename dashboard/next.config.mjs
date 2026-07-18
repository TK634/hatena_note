import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // post-log.json 等は auto-income/ ルート（親ディレクトリ）にあるため、
    // standalone出力時にファイルトレースの探索範囲を親まで広げる
    outputFileTracingRoot: process.cwd() + "/..",
  },
};

export default withPWA(nextConfig);
