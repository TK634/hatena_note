#!/bin/bash
# launchdから呼ばれるラッパースクリプト
cd /Users/takahirosueoka/auto-income
set -a; source .env 2>/dev/null; set +a

/usr/local/bin/node node_modules/.bin/tsx run-all.ts >> /Users/takahirosueoka/auto-income/cron.log 2>&1
