#!/usr/bin/env bash
#
# Claude Code のトークン消費量をコミットメッセージのトレーラーとして付与する。
# lefthook の prepare-commit-msg フックから呼ばれる。
#
# セッション累計は ccusage から取得し、コミット単位の差分は
# 「同一セッション ID を持つ直近コミットのトレーラー」との引き算で求める。
# これにより差分計算用の状態ファイルを持たずに済む。
#
# 引数:
#   $1 - コミットメッセージファイルのパス
#   $2 - メッセージソース (message / template / merge / squash / commit)
#
# CLAUDE_CODE_SESSION_ID が未設定の場合（人手によるコミット）は何もしない。

set -euo pipefail

MSG_FILE="${1:-}"
MSG_SOURCE="${2:-}"

if [ -z "${CLAUDE_CODE_SESSION_ID:-}" ] || [ -z "$MSG_FILE" ] || [ ! -f "$MSG_FILE" ]; then
  exit 0
fi

# ccusage の起動方法を決める。mise で管理しているため PATH に無い場合は mise exec を使う
if command -v ccusage >/dev/null 2>&1; then
  ccusage_cmd=(ccusage)
elif command -v mise >/dev/null 2>&1; then
  ccusage_cmd=(mise exec -- ccusage)
else
  exit 0
fi

command -v jq >/dev/null 2>&1 || exit 0

# "in=1 cache-write=2 ..." 形式の文字列から指定キーの値を取り出す（無ければ 0）
field() {
  local key="$1" src="$2" value
  value=$(printf '%s' "$src" | tr ' ' '\n' | sed -n "s/^${key}=//p" | head -1)
  printf '%s' "${value:-0}"
}

# 差分を計算する。前回値が現在値を上回る異常時は 0 に丸める
diff_tokens() {
  local current="$1" previous="$2"
  if [ "$current" -gt "$previous" ]; then
    printf '%s' "$((current - previous))"
  else
    printf '0'
  fi
}

# 金額を表示用に整形する。ccusage が価格を解決できなかった場合は n/a とする
format_cost() {
  awk -v value="$1" -v resolved="$2" 'BEGIN {
    if (resolved + 0 <= 0) { print "n/a" } else { printf "$%.4f", value }
  }'
}

# --- セッション累計の取得 ---------------------------------------------------

# ccusage はセッション ID を period フィールドに格納する（--id は機能しないため jq で絞る）
usage=$("${ccusage_cmd[@]}" session --json 2>/dev/null |
  jq -r --arg sid "$CLAUDE_CODE_SESSION_ID" '
    .session[] | select(.period == $sid)
    | [
        .inputTokens, .cacheCreationTokens, .cacheReadTokens, .outputTokens,
        .totalCost, (.modelsUsed | join(","))
      ] | @tsv
  ' | head -1) || exit 0

# このセッションの消費がまだ記録されていない場合は何もしない
[ -n "$usage" ] || exit 0

IFS=$'\t' read -r cur_in cur_write cur_read cur_out cur_cost cur_models <<<"$usage"

# --- 同一セッションの直近コミットを探して差分を求める -----------------------

# amend や -c/-C では書き換え対象のコミット自身を除外し、その 1 つ前から辿る
base='HEAD'
if [ "$MSG_SOURCE" = 'commit' ]; then
  base='HEAD~1'
fi
git rev-parse --verify --quiet "$base" >/dev/null 2>&1 || base=''

prev_tokens=''
prev_cost=''
if [ -n "$base" ]; then
  prev_commit=$(git log "$base" -n 1 --format='%H' \
    --grep="^Claude-Code-Session-Id: ${CLAUDE_CODE_SESSION_ID}$" 2>/dev/null || true)
  if [ -n "$prev_commit" ]; then
    prev_tokens=$(git log "$prev_commit" -n 1 \
      --format='%(trailers:key=Claude-Code-Session-Tokens,valueonly)' 2>/dev/null || true)
    prev_cost=$(git log "$prev_commit" -n 1 \
      --format='%(trailers:key=Claude-Code-Session-Cost-Estimate,valueonly)' 2>/dev/null || true)
  fi
fi

commit_in=$(diff_tokens "$cur_in" "$(field in "$prev_tokens")")
commit_write=$(diff_tokens "$cur_write" "$(field cache-write "$prev_tokens")")
commit_read=$(diff_tokens "$cur_read" "$(field cache-read "$prev_tokens")")
commit_out=$(diff_tokens "$cur_out" "$(field out "$prev_tokens")")

# 前回のコストは "$1.2345" 形式で記録されている。n/a や未記録は 0 として扱う
prev_cost_value=$(printf '%s' "$prev_cost" | tr -d '$ \n' | grep -E '^[0-9]+(\.[0-9]+)?$' || printf '0')
commit_cost=$(awk -v a="$cur_cost" -v b="$prev_cost_value" 'BEGIN {
  d = a - b; if (d < 0) d = 0; printf "%.4f", d
}')

# --- トレーラーの付与 -------------------------------------------------------

cc_version=$(claude --version 2>/dev/null | awk '{ print $1 }' || true)

# --if-exists replace により amend でも既存トレーラーが二重にならない。
# ただし git はキー名を前方一致で比較するため、あるキーが別のキーの接頭辞に
# なってはならない（例: Claude-Code-Session は Claude-Code-Session-Tokens と
# 衝突して相互に上書きされる）。キーを追加する際は接頭辞の重複に注意すること。
git interpret-trailers --in-place --if-exists replace \
  --trailer "Claude-Code-Model: ${cur_models:-unknown}" \
  --trailer "Claude-Code-Effort: ${CLAUDE_EFFORT:-unknown}" \
  --trailer "Claude-Code-Version: ${cc_version:-unknown}" \
  --trailer "Claude-Code-Session-Id: ${CLAUDE_CODE_SESSION_ID}" \
  --trailer "Claude-Code-Session-Tokens: in=${cur_in} cache-write=${cur_write} cache-read=${cur_read} out=${cur_out}" \
  --trailer "Claude-Code-Session-Cost-Estimate: $(format_cost "$cur_cost" "$cur_cost")" \
  --trailer "Claude-Code-Commit-Tokens: in=${commit_in} cache-write=${commit_write} cache-read=${commit_read} out=${commit_out}" \
  --trailer "Claude-Code-Commit-Cost-Estimate: $(format_cost "$commit_cost" "$cur_cost")" \
  "$MSG_FILE"
