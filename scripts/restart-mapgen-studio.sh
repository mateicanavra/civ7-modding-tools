#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="$ROOT/apps/mapgen-studio"
PATH="$ROOT/node_modules/.bin:$PATH"
SESSION="${MAPGEN_STUDIO_TMUX_SESSION:-mapgen-studio-runner}"
FRONTEND_PORT="${STUDIO_DEV_PORT:-5173}"
DAEMON_PORT="${STUDIO_DAEMON_PORT:-5174}"
RPC_TARGET="${STUDIO_DEV_RPC_TARGET:-http://127.0.0.1:${DAEMON_PORT}}"
RUN_BUILD=1
WAIT_SECONDS=45

usage() {
  cat <<EOF
Usage: bun run restart:mapgen-studio [--no-build] [--build] [--session NAME] [--timeout SECONDS]

Restarts MapGen Studio end to end:
  1. optionally builds mapgen-studio through Nx;
  2. stops the existing tmux session and listeners on ${FRONTEND_PORT}/${DAEMON_PORT};
  3. starts the Studio daemon and Vite frontend in a detached tmux session;
  4. waits until the frontend answers HTTP 200 and daemon health is OK.

Environment:
  MAPGEN_STUDIO_TMUX_SESSION  tmux session name (default: mapgen-studio-runner)
  STUDIO_DEV_PORT             Vite frontend port (default: 5173)
  STUDIO_DAEMON_PORT          daemon port (default: 5174)
  STUDIO_DEV_RPC_TARGET       frontend RPC target (default: http://127.0.0.1:<daemon port>)
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-build)
      RUN_BUILD=0
      shift
      ;;
    --build)
      RUN_BUILD=1
      shift
      ;;
    --session)
      SESSION="${2:?--session requires a name}"
      shift 2
      ;;
    --timeout)
      WAIT_SECONDS="${2:?--timeout requires seconds}"
      shift 2
      ;;
    -h|--help)
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

wait_for_services() {
  local frontend_url="http://localhost:${FRONTEND_PORT}/"
  local daemon_url="http://127.0.0.1:${DAEMON_PORT}/healthz"
  local deadline=$((SECONDS + WAIT_SECONDS))
  local frontend_status
  local daemon_status

  while (( SECONDS < deadline )); do
    frontend_status="$(curl -sS -o /dev/null -w "%{http_code}" "$frontend_url" 2>/dev/null || true)"
    daemon_status="$(curl -sS -o /dev/null -w "%{http_code}" "$daemon_url" 2>/dev/null || true)"
    if [[ "$frontend_status" == "200" && "$daemon_status" == "200" ]]; then
      return 0
    fi
    sleep 1
  done

  echo "Timed out waiting for frontend $frontend_url and daemon $daemon_url." >&2
  echo "Last frontend status: ${frontend_status:-unreachable}; daemon status: ${daemon_status:-unreachable}" >&2
  echo "--- daemon pane ---" >&2
  tmux capture-pane -t "${SESSION}:daemon" -p -S -120 >&2 || true
  echo "--- vite pane ---" >&2
  tmux capture-pane -t "${SESSION}:vite" -p -S -120 >&2 || true
  return 1
}

require_cmd bun
require_cmd curl
require_cmd tmux
require_cmd nx

cd "$ROOT"

if [[ "$RUN_BUILD" == "1" ]]; then
  echo "Building MapGen Studio..."
  nx run mapgen-studio:build
fi

echo "Stopping existing MapGen Studio session/listeners..."
MAPGEN_STUDIO_TMUX_SESSION="$SESSION" \
  STUDIO_DEV_PORT="$FRONTEND_PORT" \
  STUDIO_DAEMON_PORT="$DAEMON_PORT" \
  bash "$ROOT/scripts/down-mapgen-studio.sh"

echo "Starting MapGen Studio tmux session '$SESSION'..."
# Daemon runs via the Habitat-owned Nx target, whose command resolves
# @civ7/studio-server to source and follows the repo-owned dev topology.
tmux new-session -d -s "$SESSION" -n daemon -c "$ROOT" \
  "STUDIO_DAEMON_PORT='$DAEMON_PORT' nx run mapgen-studio:serve-daemon"
tmux new-window -t "$SESSION" -n vite -c "$APP_DIR" \
  "STUDIO_DEV_PORT='$FRONTEND_PORT' STUDIO_DEV_RPC_TARGET='$RPC_TARGET' bun vite"

wait_for_services

echo "MapGen Studio is running."
echo "  Frontend: http://localhost:${FRONTEND_PORT}/"
echo "  Daemon:   http://127.0.0.1:${DAEMON_PORT}/"
echo "  tmux:     tmux attach -t ${SESSION}"
lsof -nP -iTCP:"$FRONTEND_PORT" -iTCP:"$DAEMON_PORT" -sTCP:LISTEN
