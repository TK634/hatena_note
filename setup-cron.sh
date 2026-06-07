#!/bin/bash
# 7ジャンルを時間をずらして毎日自動投稿するcronを設定する

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="$SCRIPT_DIR/cron.log"
NODE_BIN="/usr/local/bin/node"
TSX="$SCRIPT_DIR/node_modules/.bin/tsx"

echo "現在のcrontabをクリア（auto-income関連のみ）..."
crontab -l 2>/dev/null | grep -v "auto-income" | crontab -

# ジャンルごとに1時間ずらして投稿（9時〜15時）
JOBS=(
  "0 9 * * * cd $SCRIPT_DIR && $NODE_BIN $TSX run.ts invest >> $LOG_FILE 2>&1 # auto-income"
  "0 10 * * * cd $SCRIPT_DIR && $NODE_BIN $TSX run.ts side-hustle >> $LOG_FILE 2>&1 # auto-income"
  "0 11 * * * cd $SCRIPT_DIR && $NODE_BIN $TSX run.ts career >> $LOG_FILE 2>&1 # auto-income"
  "0 12 * * * cd $SCRIPT_DIR && $NODE_BIN $TSX run.ts health >> $LOG_FILE 2>&1 # auto-income"
  "0 13 * * * cd $SCRIPT_DIR && $NODE_BIN $TSX run.ts beauty >> $LOG_FILE 2>&1 # auto-income"
  "0 14 * * * cd $SCRIPT_DIR && $NODE_BIN $TSX run.ts realestate >> $LOG_FILE 2>&1 # auto-income"
  "0 15 * * * cd $SCRIPT_DIR && $NODE_BIN $TSX run.ts fx-credit >> $LOG_FILE 2>&1 # auto-income"
)

CRONTAB=$(crontab -l 2>/dev/null)
for JOB in "${JOBS[@]}"; do
  CRONTAB="$CRONTAB
$JOB"
done
echo "$CRONTAB" | crontab -

echo "✅ cronを設定しました（7ジャンル / 毎日9〜15時）:"
echo "   09:00 - 投資・節約"
echo "   10:00 - 副業・フリーランス"
echo "   11:00 - 転職・キャリア"
echo "   12:00 - 健康・ダイエット"
echo "   13:00 - 美容・コスメ"
echo "   14:00 - 不動産・住宅ローン"
echo "   15:00 - FX・クレカ・保険"
echo ""
echo "確認: crontab -l"
echo "ログ: tail -f $LOG_FILE"
