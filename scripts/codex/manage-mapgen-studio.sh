#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(git -C "$SCRIPT_DIR/../.." rev-parse --show-toplevel)"
APP_DIR="$ROOT/apps/mapgen-studio"
PATH="$ROOT/node_modules/.bin:$PATH"
STATE_DIR="$ROOT/.mapgen-studio/codex-environment"
STATE_FILE="$STATE_DIR/instance.env"
ACTION="${1:-status}"

usage() {
  cat <<'EOF'
Usage: scripts/codex/manage-mapgen-studio.sh <start|stop|status>

Starts and stops only the MapGen Studio instance owned by this worktree.
Its tmux session and port pair are derived from the worktree path and recorded
under .mapgen-studio/, which is ignored by Git.
EOF
}

die() {
  echo "Error: $*" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || die "required command '$1' is not on PATH"
}

hash_worktree() {
  printf '%s' "$ROOT" | shasum -a 256 | awk '{print $1}'
}

is_valid_session() {
  [[ "$1" =~ ^[A-Za-z0-9_-]+$ ]]
}

is_valid_port() {
  [[ "$1" =~ ^[0-9]+$ ]] && (( "$1" >= 1024 && "$1" <= 65535 ))
}

port_is_free() {
  ! lsof -nP -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1
}

read_state_value() {
  local key="$1"
  [[ -f "$STATE_FILE" ]] || return 0
  awk -F= -v key="$key" '$1 == key { print $2; exit }' "$STATE_FILE"
}

load_state() {
  TMUX_SOCKET="$(read_state_value TMUX_SOCKET)"
  SESSION="$(read_state_value SESSION)"
  FRONTEND_PORT="$(read_state_value FRONTEND_PORT)"
  DAEMON_PORT="$(read_state_value DAEMON_PORT)"

  if [[ -z "$TMUX_SOCKET$SESSION$FRONTEND_PORT$DAEMON_PORT" ]]; then
    return 1
  fi

  is_valid_session "$TMUX_SOCKET" && is_valid_session "$SESSION" \
    && is_valid_port "$FRONTEND_PORT" && is_valid_port "$DAEMON_PORT" \
    || die "invalid Studio state at $STATE_FILE; inspect it before removing it"
  return 0
}

tmux_for_worktree() {
  tmux -L "$TMUX_SOCKET" "$@"
}

write_state() {
  mkdir -p "$STATE_DIR"
  umask 077
  printf 'TMUX_SOCKET=%s\nSESSION=%s\nFRONTEND_PORT=%s\nDAEMON_PORT=%s\n' \
    "$TMUX_SOCKET" "$SESSION" "$FRONTEND_PORT" "$DAEMON_PORT" >"$STATE_FILE"
}

choose_available_instance() {
  local digest seed offset slot
  digest="$(hash_worktree)"
  seed=$((16#${digest:0:6} % 1500))

  for ((offset = 0; offset < 1500; offset += 1)); do
    slot=$(((seed + offset) % 1500))
    FRONTEND_PORT=$((15000 + slot * 2))
    DAEMON_PORT=$((FRONTEND_PORT + 1))
    if port_is_free "$FRONTEND_PORT" && port_is_free "$DAEMON_PORT"; then
      TMUX_SOCKET="codex-mapgen-${digest:0:12}"
      SESSION="$TMUX_SOCKET"
      return 0
    fi
  done

  die "could not reserve an unused MapGen Studio port pair in 15000-17999"
}

wait_for_frontend() {
  local url="http://localhost:$FRONTEND_PORT/"
  local deadline=$((SECONDS + 45))

  while (( SECONDS < deadline )); do
    if curl --fail --silent --show-error "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done

  echo "Timed out waiting for $url." >&2
  echo "--- daemon pane ---" >&2
  tmux_for_worktree capture-pane -t "$SESSION:daemon" -p -S -120 >&2 || true
  echo "--- vite pane ---" >&2
  tmux_for_worktree capture-pane -t "$SESSION:vite" -p -S -120 >&2 || true
  return 1
}

start() {
  require_command bun
  require_command curl
  require_command lsof
  require_command shasum
  require_command tmux
  require_command nx

  if load_state; then
    if tmux_for_worktree has-session -t "$SESSION" 2>/dev/null; then
      echo "Worktree-owned Studio session '$SESSION' is already running."
      status
      return 0
    fi
    if ! port_is_free "$FRONTEND_PORT" || ! port_is_free "$DAEMON_PORT"; then
      echo "Recorded ports are now in use without the recorded tmux session; selecting a new pair."
      choose_available_instance
    fi
  else
    choose_available_instance
  fi

  write_state
  echo "Building MapGen Studio..."
  nx run mapgen-studio:build
  echo "Starting worktree-owned Studio session '$SESSION' on $FRONTEND_PORT/$DAEMON_PORT..."
  # The user-level zsh startup file changes to $HOME, so create a private
  # session first and set its shell before launching any worktree commands.
  tmux_for_worktree new-session -d -s "$SESSION" -n bootstrap "sleep 60"
  tmux_for_worktree set-option -t "$SESSION" default-shell /bin/bash
  tmux_for_worktree new-window -t "$SESSION" -n daemon \
    "cd '$APP_DIR' && STUDIO_DAEMON_PORT='$DAEMON_PORT' bun --conditions bun-source --watch src/server/daemon/daemon.ts"
  tmux_for_worktree new-window -t "$SESSION" -n vite \
    "cd '$APP_DIR' && STUDIO_DEV_PORT='$FRONTEND_PORT' STUDIO_DEV_RPC_TARGET='http://127.0.0.1:$DAEMON_PORT' bun vite"
  tmux_for_worktree kill-window -t "$SESSION:bootstrap"
  wait_for_frontend
  echo "MapGen Studio is running."
  echo "  Frontend: http://localhost:$FRONTEND_PORT/"
  echo "  Daemon:   http://127.0.0.1:$DAEMON_PORT/"
  echo "  tmux:     tmux -L $TMUX_SOCKET attach -t $SESSION"
}

stop() {
  if ! load_state; then
    echo "No worktree-owned MapGen Studio instance is recorded."
    return 0
  fi

  if command -v tmux >/dev/null 2>&1 && tmux_for_worktree has-session -t "$SESSION" 2>/dev/null; then
    echo "Stopping worktree-owned Studio tmux session '$SESSION'."
    tmux_for_worktree kill-session -t "$SESSION"
  else
    echo "No running tmux session named '$SESSION'; leaving any unrelated listeners untouched."
  fi

  rm -f "$STATE_FILE"
}

status() {
  local daemon_status

  if ! load_state; then
    echo "No worktree-owned MapGen Studio instance is recorded."
    return 0
  fi

  printf 'Session: %s\nFrontend: http://localhost:%s/\nDaemon: http://127.0.0.1:%s/\n' \
    "$SESSION" "$FRONTEND_PORT" "$DAEMON_PORT"
  if command -v tmux >/dev/null 2>&1 && tmux_for_worktree has-session -t "$SESSION" 2>/dev/null; then
    echo "tmux: running"
  else
    echo "tmux: not running"
    return 1
  fi

  if command -v curl >/dev/null 2>&1 && curl --fail --silent --show-error \
    "http://localhost:$FRONTEND_PORT/" >/dev/null; then
    echo "frontend: reachable"
  else
    echo "frontend: not reachable"
    return 1
  fi

  daemon_status="$(curl --silent --output /dev/null --write-out '%{http_code}' \
    "http://127.0.0.1:$DAEMON_PORT/" || true)"
  if [[ "$daemon_status" == "000" || -z "$daemon_status" ]]; then
    echo "daemon: not reachable"
    return 1
  fi
  echo "daemon: reachable (HTTP $daemon_status)"
}

case "$ACTION" in
  start) start ;;
  stop) stop ;;
  status) status ;;
  -h|--help|help) usage ;;
  *) usage >&2; exit 2 ;;
esac
