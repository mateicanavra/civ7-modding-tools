#!/usr/bin/env bash
set -euo pipefail

if ! command -v gitleaks >/dev/null 2>&1; then
  echo "Gitleaks is required (CI pins 8.28.0); install it before running check:privacy." >&2
  exit 2
fi

cd "$(git rev-parse --show-toplevel)"
config="$PWD/.gitleaks.toml"
snapshot="$(mktemp -d)"
trap 'rm -rf "$snapshot"' EXIT

# Current tracked bytes only: no history, untracked data, or submodule contents.
git ls-files --stage -z |
while IFS= read -r -d '' entry; do
  mode="${entry%% *}"
  path="${entry#*$'\t'}"
  [[ "$mode" == 160000 ]] && continue
  [[ -e "$path" || -L "$path" ]] || continue
  if [[ -L "$path" ]]; then
    mkdir -p "$snapshot/$(dirname "$path")"
    readlink "./$path" > "$snapshot/$path"
  else
    printf './%s\0' "$path"
  fi
done |
  tar -cf - --null --no-recursion -T - |
  tar -xf - -C "$snapshot"

gitleaks dir "$snapshot" --config "$config" --no-banner --redact \
  --ignore-gitleaks-allow --gitleaks-ignore-path "$snapshot" "$@"
