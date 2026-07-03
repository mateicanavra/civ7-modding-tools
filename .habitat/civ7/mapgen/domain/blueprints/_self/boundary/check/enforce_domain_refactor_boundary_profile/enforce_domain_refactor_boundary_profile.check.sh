#!/bin/bash
#
# Domain Refactor Guardrails
# Enforces refactor-only boundary rules for domains that have been migrated to ops.
#

set -euo pipefail

REPO_ROOT="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
cd "$REPO_ROOT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=== Domain Refactor Guardrails ==="
echo ""

# Residual guardrail profile:
# - boundary (default): keeps this aggregate script pre-commit safe while
#   extracted Habitat rules own the proven boundary and topology branches.
# - full: retains only branches whose extraction proof is still incomplete.
DOMAIN_REFACTOR_GUARDRAILS_PROFILE="${DOMAIN_REFACTOR_GUARDRAILS_PROFILE:-boundary}"

echo "Profile: ${DOMAIN_REFACTOR_GUARDRAILS_PROFILE}"
echo ""

# Comma-separated list of refactored domains, e.g. "ecology,foundation"
# Default: auto-detect domains with ops roots.
if [ -n "${REFRACTOR_DOMAINS:-}" ]; then
  IFS=',' read -r -a DOMAINS <<< "$REFRACTOR_DOMAINS"
else
  DOMAINS=()
  for ops_dir in mods/mod-swooper-maps/src/domain/*/ops; do
    if [ -d "$ops_dir" ]; then
      DOMAINS+=("$(basename "$(dirname "$ops_dir")")")
    fi
  done
fi

if [ ${#DOMAINS[@]} -eq 0 ]; then
  echo -e "${YELLOW}No refactored domains configured; skipping guardrails.${NC}"
  exit 0
fi

violations=0

run_rg() {
  local label="$1"
  local pattern="$2"
  shift 2
  local opts=()
  local paths=()
  local in_paths=false
  for arg in "$@"; do
    if [ "$arg" = "--" ]; then
      in_paths=true
      continue
    fi
    if [ "$in_paths" = true ]; then
      paths+=("$arg")
    else
      opts+=("$arg")
    fi
  done

  if [ ${#paths[@]} -eq 0 ]; then
    echo -e "${YELLOW}Skip ${label}: no paths provided.${NC}"
    return
  fi

  local hits
  local opts_count=${#opts[@]}
  if [ "$opts_count" -eq 0 ]; then
    hits=$(rg -n "$pattern" "${paths[@]}" 2>/dev/null || true)
  else
    hits=$(rg -n "${opts[@]}" "$pattern" "${paths[@]}" 2>/dev/null || true)
  fi
  if [ -n "$hits" ]; then
    echo -e "${RED}ERROR: ${label}${NC}"
    echo "$hits" | sed 's/^/  /'
    echo ""
    violations=$((violations + 1))
  fi
}

run_files() {
  local label="$1"
  shift
  local hits
  hits=$(rg --files "$@" 2>/dev/null || true)
  if [ -n "$hits" ]; then
    echo -e "${RED}ERROR: ${label}${NC}"
    echo "$hits" | sed 's/^/  /'
    echo ""
    violations=$((violations + 1))
  fi
}

check_exported_jsdoc() {
  local label="$1"
  shift
  local files=("$@")
  if [ ${#files[@]} -eq 0 ]; then
    echo -e "${YELLOW}Skip ${label}: no files provided.${NC}"
    return
  fi

  local hits=""
  for file in "${files[@]}"; do
    if [ ! -f "$file" ]; then
      continue
    fi
    local file_hits
    file_hits=$(awk -v file="$file" '
      function ltrim(line) { sub(/^[[:space:]]+/, "", line); return line }
      function is_export_fn(line) { return line ~ /^[[:space:]]*export[[:space:]]+function[[:space:]]/ }
      function is_jsdoc_end(line) { return ltrim(line) == "*/" }
      function is_jsdoc_start(line) { return index(ltrim(line), "/**") == 1 }
      {
        lines[NR] = $0
      }
      END {
        for (i = 1; i <= NR; i++) {
          if (is_export_fn(lines[i])) {
            j = i - 1
            while (j > 0 && lines[j] ~ /^[[:space:]]*$/) j--
            if (j == 0 || !is_jsdoc_end(lines[j])) {
              print file ":" i ":" lines[i]
              continue
            }
            k = j
            while (k > 0 && !is_jsdoc_start(lines[k])) k--
            if (k == 0) {
              print file ":" i ":" lines[i]
            }
          }
        }
      }
    ' "$file")
    if [ -n "$file_hits" ]; then
      hits+="${file_hits}"$'\n'
    fi
  done

  if [ -n "$hits" ]; then
    echo -e "${RED}ERROR: ${label}${NC}"
    echo "$hits" | sed 's/^/  /'
    echo ""
    violations=$((violations + 1))
  fi
}

check_schema_descriptions() {
  local label="$1"
  shift
  local files=("$@")
  if [ ${#files[@]} -eq 0 ]; then
    echo -e "${YELLOW}Skip ${label}: no files provided.${NC}"
    return
  fi

  local missing=()
  for file in "${files[@]}"; do
    if [ ! -f "$file" ]; then
      continue
    fi
    if rg -q "Type\\.Object\\(" "$file" && ! rg -q "description" "$file"; then
      missing+=("$file")
    fi
  done

  if [ ${#missing[@]} -gt 0 ]; then
    echo -e "${RED}ERROR: ${label}${NC}"
    printf '%s\n' "${missing[@]}" | sed 's/^/  /'
    echo ""
    violations=$((violations + 1))
  fi
}

stage_roots_for_domain() {
  local domain="$1"
  # Boundary mode does not require stage roots. Stage/contract checks are part of "full".
  if [ "$DOMAIN_REFACTOR_GUARDRAILS_PROFILE" = "boundary" ]; then
    echo ""
    return
  fi
  case "$domain" in
    ecology) echo "mods/mod-swooper-maps/src/recipes/standard/stages/ecology" ;;
    foundation) echo "mods/mod-swooper-maps/src/recipes/standard/stages/foundation" ;;
    morphology) echo "mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts mods/mod-swooper-maps/src/recipes/standard/stages/morphology-routing mods/mod-swooper-maps/src/recipes/standard/stages/morphology-erosion mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features" ;;
    narrative) echo "" ;;
    hydrology) echo "mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine" ;;
    placement) echo "mods/mod-swooper-maps/src/recipes/standard/stages/placement" ;;
    *)
      echo ""
      ;;
  esac
}

allow_stage_rootless_full_domain() {
  local domain="$1"
  case "$domain" in
    # Narrative runtime stages are not wired into the standard recipe topology in this stack.
    narrative) return 0 ;;
    *) return 1 ;;
  esac
}

for domain in "${DOMAINS[@]}"; do
  domain="${domain//[[:space:]]/}"
  if [ -z "$domain" ]; then
    continue
  fi
  ops_root="mods/mod-swooper-maps/src/domain/${domain}/ops"
  if [ ! -d "$ops_root" ]; then
    echo -e "${YELLOW}Skip '${domain}' residual scans: missing ops root ${ops_root}${NC}"
    continue
  fi

  stage_roots=()
  read -r -a stage_roots <<< "$(stage_roots_for_domain "$domain")"
  if [ "$DOMAIN_REFACTOR_GUARDRAILS_PROFILE" = "full" ]; then
    if [ ${#stage_roots[@]} -eq 0 ] && allow_stage_rootless_full_domain "$domain"; then
      echo -e "${YELLOW}Skip stage residual scans for '${domain}' (no runtime stage roots configured).${NC}"
    fi
  fi

  echo -e "${YELLOW}Checking domain: ${domain}${NC}"

  if [ "$DOMAIN_REFACTOR_GUARDRAILS_PROFILE" = "full" ]; then
    # Ecology is the canonical exemplar for the stricter op/step module rules.
    if [ "$domain" = "ecology" ]; then
    ecology_contract_files=()
    while IFS= read -r file; do
      [ -n "$file" ] && ecology_contract_files+=("$file")
    done < <(
      rg --files \
        -g "mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/**/contract.ts" \
        -g "mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/**/*.contract.ts" \
        -g "mods/mod-swooper-maps/src/domain/ecology/ops/**/contract.ts"
    )
    check_schema_descriptions "Contract schema descriptions (ecology)" "${ecology_contract_files[@]}"

    ecology_doc_targets=()
    while IFS= read -r file; do
      [ -n "$file" ] && ecology_doc_targets+=("$file")
    done < <(
      rg --files \
        -g "mods/mod-swooper-maps/src/domain/ecology/ops/**/rules/**/*.ts" \
        -g "mods/mod-swooper-maps/src/domain/ecology/ops/**/strategies/**/*.ts" \
        -g "mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/**/*.ts"
    )
    check_exported_jsdoc "Exported function JSDoc (ecology)" "${ecology_doc_targets[@]}"

  fi
  fi
done

if [ "$violations" -gt 0 ]; then
  echo -e "${RED}Guardrails failed with ${violations} violation group(s).${NC}"
  exit 1
fi

echo -e "${GREEN}Domain refactor guardrails passed.${NC}"
