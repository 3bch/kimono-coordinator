#!/usr/bin/env bash
# Claude Code のステータスライン表示スクリプト
# 標準入力で受け取った JSON からモデル名・effort・コンテキスト使用率を英語で表示する
set -euo pipefail

input="$(cat)"

model="$(printf '%s' "$input" | jq -r '.model.display_name // "unknown"')"
# effort は reasoning effort に対応したモデルのときだけ含まれる
effort="$(printf '%s' "$input" | jq -r '.effort.level // empty')"
used_percentage="$(printf '%s' "$input" | jq -r '.context_window.used_percentage // empty')"

if [ -n "$effort" ]; then
  model="$model ($effort)"
fi

if [ -n "$used_percentage" ]; then
  # 小数を四捨五入して整数の百分率にする
  context="$(printf '%.0f' "$used_percentage")% used"
else
  context="n/a"
fi

printf 'Model: %s | Context: %s' "$model" "$context"
