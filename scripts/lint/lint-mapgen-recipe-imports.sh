#!/bin/bash
#
# MapGen recipe import boundary guard.
# Keeps recipe assembly on named domain public surfaces.
#

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

RECIPE_ROOT="mods/mod-swooper-maps/src/recipes"

echo "=== MapGen Recipe Import Boundary ==="
echo ""

if [ ! -d "$RECIPE_ROOT" ]; then
  echo -e "${RED}ERROR: Missing recipe root: ${RECIPE_ROOT}${NC}"
  exit 2
fi

# First narrow rule: recipes may import a domain root plus the domain's public
# ops/config surfaces. Deep shared/ops/rules/strategy/type files need a named
# public owner before recipes can depend on them.
violations="$(
  rg -n \
    "@mapgen/domain/[^\"']+/(?!ops(?:\\.js)?[\"']|config(?:\\.js)?[\"'])[^\"']+" \
    "$RECIPE_ROOT" \
    -g "*.ts" \
    -P 2>/dev/null || true
)"

if [ -n "$violations" ]; then
  echo -e "${RED}ERROR: Recipe deep domain imports found.${NC}"
  echo "$violations" | sed 's/^/  /'
  echo ""
  echo "Allowed domain imports from recipes:"
  echo "  - @mapgen/domain/<domain>"
  echo "  - @mapgen/domain/<domain>/ops"
  echo "  - @mapgen/domain/<domain>/config.js"
  exit 1
fi

echo -e "${GREEN}MapGen recipe import boundary passed.${NC}"
