#!/usr/bin/env bash
# design-sync: (re)generate the converter's inputs for mapgen-studio.
# Idempotent. Invoked as cfg.buildCmd before package-build / resync.
#
# Why this exists: mapgen-studio is a Vite app, not a published component
# library, so the converter has no shipped dist entry or .d.ts tree. This
# regenerates both from source:
#   1. dist/             — fresh app build (compiled Tailwind CSS + @fontsource woff2)
#   2. dist/types/       — declaration tree the converter extracts real prop types from
#   3. dist/assets/_ds-compiled.css — compiled stylesheet with font url()s rewritten
#      to ./ (the originals are absolute /assets/ paths the converter can't resolve)
set -euo pipefail
cd "$(dirname "$0")/.."   # -> apps/mapgen-studio

# 1. App build → fresh dist. Skip with DS_SKIP_VITE=1 when dist is already current.
if [ "${DS_SKIP_VITE:-0}" != "1" ]; then
  bun run build
fi

# 2. Declaration tree (real prop contracts incl. inherited React/Radix props).
#    Declaration emit is BEST-EFFORT: tsconfig.dts.json sets noEmitOnError:false so
#    tsc still writes the .d.ts tree on type errors, but then EXITS non-zero — which
#    `set -e` would treat as fatal. Some app sources pulled into the include graph
#    carry pre-existing type issues that never surface in the esbuild app build
#    (e.g. src/lib/orpc.ts TS7056 "inferred type too long", reached via
#    PipelineStage's type-only useRecipeDagQuery import). Those must NOT abort the
#    converter: the emitted declarations still beat empty {[key]:unknown} contracts,
#    and the render-check + grading remain the real quality gates. So tolerate a
#    non-zero tsc exit.
node_modules/.bin/tsc -p .design-sync/tsconfig.dts.json \
  || echo "design-sync: tsc declaration emit reported errors (non-fatal; .d.ts still emitted)"

# 3. Resolvable copy of the compiled stylesheet, placed next to the fonts.
SRC="$(ls -1 dist/assets/index-*.css | head -1)"
sed 's#url(/assets/#url(./#g' "$SRC" > dist/assets/_ds-compiled.css

# 4. Dark-by-default. The studio is dark-only (index.html sets `.dark` pre-paint,
#    no prefers-color-scheme coupling), but the compiled CSS keeps the light
#    `:root` tokens as the default — so a preview/design with no `.dark` ancestor
#    renders light, misrepresenting the brand. Re-target the source `.dark` token
#    block onto `:root` and append it (cascade order → dark wins). `.dark` itself
#    is preserved upstream, so explicit toggling still works.
{
  echo ""
  echo "/* design-sync: dark-by-default (re-targeted from src/index.css .dark) */"
  awk '/^\.dark[ ]*\{/{f=1} f{print} f&&/^\}/{exit}' src/index.css | sed '1s/^\.dark[ ]*{/:root {/'
} >> dist/assets/_ds-compiled.css

echo "design-sync inputs ready: dist/types/ (.d.ts) + dist/assets/_ds-compiled.css (dark-default)"
