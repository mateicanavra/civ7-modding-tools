#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(git -C "$SCRIPT_DIR/../.." rev-parse --show-toplevel)"
APP_DIR="$ROOT/apps/mapgen-studio"
PATH="$ROOT/node_modules/.bin:$PATH"
STATE_DIR="$ROOT/.mapgen-studio/codex-environment"
STATE_FILE="$STATE_DIR/instance.env"
ACTION="${1:-status}"
START_TOKEN=""
WAIT_SECONDS=120

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

service_is_healthy() {
  curl --connect-timeout 1 --max-time 2 --fail --silent --show-error "$1" \
    >/dev/null 2>&1
}

daemon_is_healthy() {
  curl --connect-timeout 1 --max-time 2 --fail --silent --show-error "$1" \
    2>/dev/null \
    | EXPECTED_REPO_ROOT="$ROOT" bun -e '
        const health = JSON.parse(await Bun.stdin.text());
        if (health?.ok !== true || health?.repoRoot !== process.env.EXPECTED_REPO_ROOT) {
          process.exit(1);
        }
      ' >/dev/null 2>&1
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

claim_state() {
  mkdir -p "$STATE_DIR"
  ( umask 077
    set -o noclobber
    printf 'START_TOKEN=%s\nTMUX_SOCKET=%s\nSESSION=%s\nFRONTEND_PORT=%s\nDAEMON_PORT=%s\n' \
      "$START_TOKEN" "$TMUX_SOCKET" "$SESSION" "$FRONTEND_PORT" "$DAEMON_PORT" \
      >"$STATE_FILE"
  ) 2>/dev/null
}

start_owns_state() {
  [[ -n "$START_TOKEN" && "$(read_state_value START_TOKEN)" == "$START_TOKEN" ]]
}

recorded_start_is_running() {
  local token pid
  token="$(read_state_value START_TOKEN)"
  pid="${token%%-*}"
  [[ -n "$token" && "$pid" =~ ^[0-9]+$ ]] && kill -0 "$pid" 2>/dev/null
}

cleanup_failed_start() {
  local exit_code=$?

  trap - EXIT INT TERM
  # The state token owns cleanup, including the gap immediately after tmux starts.
  if start_owns_state \
    && tmux_for_worktree has-session -t "$SESSION" 2>/dev/null; then
    tmux_for_worktree kill-session -t "$SESSION" || true
  fi
  if start_owns_state; then
    rm -f "$STATE_FILE" || true
  fi
  exit "$exit_code"
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

wait_for_services() {
  local frontend_url="http://127.0.0.1:$FRONTEND_PORT/"
  local daemon_url="http://127.0.0.1:$DAEMON_PORT/healthz"
  local deadline=$((SECONDS + WAIT_SECONDS))

  while (( SECONDS < deadline )); do
    if service_is_healthy "$frontend_url" && daemon_is_healthy "$daemon_url"; then
      return 0
    fi
    sleep 1
  done

  echo "Timed out waiting for $frontend_url and $daemon_url." >&2
  echo "--- daemon pane ---" >&2
  tmux_for_worktree capture-pane -t "$SESSION:daemon" -p -S -120 >&2 || true
  echo "--- vite pane ---" >&2
  tmux_for_worktree capture-pane -t "$SESSION:vite" -p -S -120 >&2 || true
  return 1
}

start() {
  # $$ is process-unique across concurrent Bash 3 start invocations.
  START_TOKEN="$$-$RANDOM"

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
    if recorded_start_is_running; then
      die "another start invocation owns the worktree-owned Studio instance"
    fi
    if ! port_is_free "$FRONTEND_PORT" || ! port_is_free "$DAEMON_PORT"; then
      echo "Recorded ports are now in use without the recorded tmux session; selecting a new pair."
      choose_available_instance
    fi
    rm -f "$STATE_FILE"
  else
    choose_available_instance
  fi

  echo "Building MapGen Studio..."
  nx run mapgen-studio:build

  if ! port_is_free "$FRONTEND_PORT" || ! port_is_free "$DAEMON_PORT"; then
    echo "Selected ports became occupied during the build; selecting a new pair."
    choose_available_instance
  fi
  if tmux_for_worktree has-session -t "$SESSION" 2>/dev/null; then
    die "private Studio session '$SESSION' already exists without current ownership state"
  fi

  # Keep launch ownership transactional until both services prove ready.
  trap cleanup_failed_start EXIT
  trap 'exit 130' INT
  trap 'exit 143' TERM
  claim_state \
    || die "another start invocation claimed the worktree-owned Studio instance"
  echo "Starting worktree-owned Studio session '$SESSION' on $FRONTEND_PORT/$DAEMON_PORT..."
  # The user-level zsh startup file changes to $HOME, so create a private
  # session first and set its shell before launching any worktree commands.
  tmux_for_worktree new-session -d -s "$SESSION" -n bootstrap "sleep 60"
  tmux_for_worktree set-option -t "$SESSION" default-shell /bin/bash
  # Isolate Nx task coordination from any standard Studio session in this worktree.
  tmux_for_worktree new-window -t "$SESSION" -n daemon \
    "cd '$ROOT' && NX_WORKSPACE_DATA_DIRECTORY='$STATE_DIR/nx-workspace-data' STUDIO_DAEMON_PORT='$DAEMON_PORT' nx run mapgen-studio:serve-daemon"
  tmux_for_worktree new-window -t "$SESSION" -n vite \
    "cd '$APP_DIR' && STUDIO_DEV_PORT='$FRONTEND_PORT' STUDIO_DEV_RPC_TARGET='http://127.0.0.1:$DAEMON_PORT' bun vite"
  tmux_for_worktree kill-window -t "$SESSION:bootstrap"
  wait_for_services
  trap - EXIT INT TERM
  echo "MapGen Studio is running."
  echo "  Frontend: http://127.0.0.1:$FRONTEND_PORT/"
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
  local unhealthy=0

  if ! load_state; then
    echo "No worktree-owned MapGen Studio instance is recorded."
    return 1
  fi

  printf 'Session: %s\nFrontend: http://127.0.0.1:%s/\nDaemon: http://127.0.0.1:%s/\n' \
    "$SESSION" "$FRONTEND_PORT" "$DAEMON_PORT"
  if command -v tmux >/dev/null 2>&1 && tmux_for_worktree has-session -t "$SESSION" 2>/dev/null; then
    echo "tmux: running"
  else
    echo "tmux: not running"
    unhealthy=1
  fi

  if command -v curl >/dev/null 2>&1 \
    && service_is_healthy "http://127.0.0.1:$FRONTEND_PORT/"; then
    echo "frontend: healthy"
  else
    echo "frontend: not healthy"
    unhealthy=1
  fi

  if command -v curl >/dev/null 2>&1 \
    && command -v bun >/dev/null 2>&1 \
    && daemon_is_healthy "http://127.0.0.1:$DAEMON_PORT/healthz"; then
    echo "daemon: healthy"
  else
    echo "daemon: not healthy"
    unhealthy=1
  fi

  return "$unhealthy"
}

case "$ACTION" in
  start) start ;;
  stop) stop ;;
  status) status ;;
  -h|--help|help) usage ;;
  *) usage >&2; exit 2 ;;
esac
