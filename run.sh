#!/bin/bash
# launchdから呼ばれるラッパースクリプト
cd /Users/takahirosueoka/auto-income
set -a; source .env 2>/dev/null; set +a

# caffeinate: 実行中はMacをスリープさせない。
# バッテリー駆動時は 8:50 の予約起動が数秒の DarkWake ですぐ再スリープし、
# 実行途中で通信が切れてタイムアウトしていた（2026-09-29〜10-01）。
#   -i: アイドルスリープ防止（バッテリーでも有効）  -s: システムスリープ防止（電源接続時）
/usr/bin/caffeinate -i -s /usr/local/bin/node node_modules/.bin/tsx run-all.ts >> /Users/takahirosueoka/auto-income/cron.log 2>&1
