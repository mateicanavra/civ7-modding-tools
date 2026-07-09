#!/usr/bin/env bash
set -euo pipefail

unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_PREFIX

ROOT="$(git rev-parse --show-toplevel)"
ROOT="$(cd "$ROOT" && pwd -P)"
cd "$ROOT"

SUBMODULE_REL=".repos/effect"
EXPECTED_URL="https://github.com/Effect-TS/effect-smol.git"

if [[ ! -f ".gitmodules" ]]; then
  echo "effect-submodule: not configured (.gitmodules missing); nothing to check"
  exit 0
fi

CONFIGURED_PATH="$(git config -f ".gitmodules" --get "submodule.${SUBMODULE_REL}.path" 2>/dev/null || true)"
if [[ "$CONFIGURED_PATH" != "$SUBMODULE_REL" ]]; then
  echo "effect-submodule: not configured ($SUBMODULE_REL missing from .gitmodules); nothing to check"
  exit 0
fi

CONFIGURED_URL="$(git config -f ".gitmodules" --get "submodule.${SUBMODULE_REL}.url" 2>/dev/null || true)"
if [[ "$CONFIGURED_URL" != "$EXPECTED_URL" ]]; then
  echo "effect-submodule: unexpected URL for $SUBMODULE_REL" >&2
  echo "Expected: $EXPECTED_URL" >&2
  echo "Actual:   ${CONFIGURED_URL:-<missing>}" >&2
  exit 1
fi

GITLINK_ENTRY="$(git ls-files --stage -- "$SUBMODULE_REL")"
if [[ -z "$GITLINK_ENTRY" || "$GITLINK_ENTRY" == *$'\n'* ]]; then
  echo "effect-submodule: $SUBMODULE_REL does not have one recorded gitlink" >&2
  echo "Run: bun run effect:init" >&2
  exit 1
fi

read -r GITLINK_MODE RECORDED_COMMIT GITLINK_STAGE _ <<< "$GITLINK_ENTRY"
if [[ "$GITLINK_MODE" != "160000" || "$GITLINK_STAGE" != "0" ]]; then
  echo "effect-submodule: $SUBMODULE_REL is not a stage-0 gitlink" >&2
  echo "Run: bun run effect:init" >&2
  exit 1
fi

if [[ ! -d "$SUBMODULE_REL" ]]; then
  echo "effect-submodule: not initialized (directory missing)" >&2
  echo "Run: bun run effect:init" >&2
  exit 1
fi

if [[ -z "$(find "$SUBMODULE_REL" -mindepth 1 -maxdepth 1 -print -quit)" ]]; then
  echo "effect-submodule: not initialized (directory empty)" >&2
  echo "Run: bun run effect:init" >&2
  exit 1
fi

EXPECTED_TOPLEVEL="$(cd "$SUBMODULE_REL" && pwd -P)"
ACTUAL_TOPLEVEL="$(git -C "$SUBMODULE_REL" rev-parse --show-toplevel 2>/dev/null || true)"
SUPERPROJECT_TOPLEVEL="$(git -C "$SUBMODULE_REL" rev-parse --show-superproject-working-tree 2>/dev/null || true)"
EXPECTED_GIT_DIR="$(git rev-parse --git-path "modules/$SUBMODULE_REL")"
ACTUAL_GIT_DIR="$(git -C "$SUBMODULE_REL" rev-parse --absolute-git-dir 2>/dev/null || true)"
if [[ "$EXPECTED_GIT_DIR" != /* ]]; then
  EXPECTED_GIT_DIR="$ROOT/$EXPECTED_GIT_DIR"
fi

if [[ "$ACTUAL_TOPLEVEL" != "$EXPECTED_TOPLEVEL" ||
  "$SUPERPROJECT_TOPLEVEL" != "$ROOT" ||
  "$ACTUAL_GIT_DIR" != "$EXPECTED_GIT_DIR" ]]; then
  echo "effect-submodule: $SUBMODULE_REL is not the configured submodule checkout" >&2
  echo "The existing path was left unchanged. Move it aside, then run: bun run effect:init" >&2
  exit 1
fi

if [[ -n "$(git -C "$SUBMODULE_REL" status --porcelain=v1 --untracked-files=all)" ]]; then
  echo "effect-submodule: dirty source checkout; local edits were preserved" >&2
  exit 2
fi

ACTUAL_COMMIT="$(git -C "$SUBMODULE_REL" rev-parse HEAD)"
if [[ "$ACTUAL_COMMIT" != "$RECORDED_COMMIT" ]]; then
  echo "effect-submodule: checkout does not match the recorded gitlink" >&2
  echo "Expected: $RECORDED_COMMIT" >&2
  echo "Actual:   $ACTUAL_COMMIT" >&2
  echo "Run: bun run effect:init" >&2
  exit 3
fi

echo "effect-submodule: clean at $ACTUAL_COMMIT"
