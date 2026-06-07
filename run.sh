#!/bin/bash
# launchdから呼ばれるラッパースクリプト
cd /Users/takahirosueoka/auto-income
set -a; source .env 2>/dev/null; set +a
export ANTHROPIC_API_KEY HATENA_API_KEY

/usr/local/bin/node node_modules/.bin/tsx run.ts >> /Users/takahirosueoka/auto-income/cron.log 2>&1
