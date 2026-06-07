#!/bin/bash
# 各ジャンルを時間をずらして毎日自動投稿するcronを設定する

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="$SCRIPT_DIR/cron.log"
NODE_BIN="/usr/local/bin/node"
TSX="$SCRIPT_DIR/node_modules/.bin/tsx"

echo "現在のcrontabをクリア（auto-income関連のみ）..."
crontab -l 2>/dev/null | grep -v "auto-income" | crontab -

# ジャンルごとに投稿時刻をずらす
# 投資・節約: 毎朝9:00
# 副業・フリーランス: 毎朝10:00
# 転職・キャリア: 毎朝11:00
CRON_INVEST="0 9 * * * cd $SCRIPT_DIR && $NODE_BIN $TSX run.ts invest >> $LOG_FILE 2>&1"
CRON_SIDE="0 10 * * * cd $SCRIPT_DIR && $NODE_BIN $TSX run.ts side-hustle >> $LOG_FILE 2>&1"
CRON_CAREER="0 11 * * * cd $SCRIPT_DIR && $NODE_BIN $TSX run.ts career >> $LOG_FILE 2>&1"

(crontab -l 2>/dev/null; echo "$CRON_INVEST"; echo "$CRON_SIDE"; echo "$CRON_CAREER") | crontab -

echo "✅ cronを設定しました:"
echo "   09:00 - 投資・節約"
echo "   10:00 - 副業・フリーランス"
echo "   11:00 - 転職・キャリア"
echo ""
echo "確認: crontab -l"
echo "ログ: tail -f $LOG_FILE"
