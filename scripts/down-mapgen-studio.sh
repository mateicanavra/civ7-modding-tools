#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="$ROOT/apps/mapgen-studio"
SESSION="${MAPGEN_STUDIO_TMUX_SESSION:-mapgen-studio-runner}"
FRONTEND_PORT="${STUDIO_DEV_PORT:-5173}"
DAEMON_PORT="${STUDIO_DAEMON_PORT:-5174}"

usage() {
  cat <<EOF
Usage: bun run dev:mapgen-studio:down [--session NAME]

Stops MapGen Studio dev runtime:
  1. kills the configured Studio tmux session;
  2. kills any other tmux session whose panes are clearly running Studio;
  3. stops listeners on ${FRONTEND_PORT}/${DAEMON_PORT}.

Environment:
  MAPGEN_STUDIO_TMUX_SESSION  tmux session name (default: mapgen-studio-runner)
  STUDIO_DEV_PORT             Vite frontend port (default: 5173)
  STUDIO_DAEMON_PORT          daemon port (default: 5174)
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --session)
      SESSION="${2:?--session requires a name}"
      shift 2
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: required command '$1' is not on PATH." >&2
    exit 1
  fi
}

kill_port_listeners() {
  local port="$1"
  local pids
  pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -z "$pids" ]]; then
    return 0
  fi

  echo "Stopping listener(s) on port $port: ${pids//$'\n'/ }"
  kill $pids 2>/dev/null || true

  for _ in {1..20}; do
    if [[ -z "$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)" ]]; then
      return 0
    fi
    sleep 0.25
  done

  pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -n "$pids" ]]; then
    echo "Force-stopping listener(s) on port $port: ${pids//$'\n'/ }"
    kill -9 $pids 2>/dev/null || true
  fi
}

studio_tmux_sessions() {
  local session_name
  local pane_path
  local pane_command
  local start_command
  local sessions=()

  if ! tmux list-sessions >/dev/null 2>&1; then
    return 0
  fi

  while IFS=$'\t' read -r session_name pane_path pane_command start_command; do
    if [[ "$session_name" == "$SESSION" ]] ||
      [[ "$session_name" == *mapgen-studio* ]] ||
      [[ "$session_name" == *studio-runner* ]] ||
      [[ "$pane_path" == "$APP_DIR"* ]] ||
      [[ "$start_command" == *"mapgen-studio:serve-daemon"* ]] ||
      [[ "$start_command" == *"STUDIO_DEV_RPC_TARGET"* && "$pane_command" == "bun" ]]; then
      sessions+=("$session_name")
    fi
  done < <(tmux list-panes -a -F $'#{session_name}\t#{pane_current_path}\t#{pane_current_command}\t#{pane_start_command}' 2>/dev/null || true)

  printf "%s\n" "${sessions[@]}" | sort -u
}

require_cmd lsof
require_cmd tmux

echo "Stopping MapGen Studio tmux sessions/listeners..."
while IFS= read -r tmux_session; do
  if [[ -n "$tmux_session" ]]; then
    echo "Killing tmux session: $tmux_session"
    tmux kill-session -t "$tmux_session" 2>/dev/null || true
  fi
done < <(studio_tmux_sessions)

kill_port_listeners "$FRONTEND_PORT"
kill_port_listeners "$DAEMON_PORT"

echo "MapGen Studio is down."
