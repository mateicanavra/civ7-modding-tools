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

# FAIL-LOUD guard for the theme-block extractions below. A positional text
# extractor (awk anchored at column 0) returns NOTHING — exit 0 — the instant the
# source selector moves/renames/wraps (e.g. into `@layer base {}` or `html.dark`).
# `set -euo pipefail` cannot see that: an empty pipe is still a success. That is the
# design-sync bug class — a silent no-op ships a degraded stylesheet (light-default,
# or a dead `.light` toggle) that the dark-only Storybook gate then waves through.
# So every extraction is asserted non-empty here and aborts the build if it vanished.
assert_theme_block() {
  # $1 = extracted block text; $2 = human description of what was extracted.
  if [ -z "$1" ]; then
    echo "design-sync: FATAL — theme extraction produced NOTHING for '${2}'." >&2
    echo "  The matching token block in src/index.css was moved, renamed, or wrapped" >&2
    echo "  (e.g. into @layer base {}), so the positional extractor matched zero lines." >&2
    echo "  Aborting rather than shipping a silently-degraded bundle. Fix the extractor" >&2
    echo "  selector (or the source), then re-run build-inputs.sh." >&2
    exit 1
  fi
}

# 1. App build → fresh dist. Skip with DS_SKIP_VITE=1 when dist is already current.
if [ "${DS_SKIP_VITE:-0}" != "1" ]; then
  bun run build
fi

# 2. Declaration tree (real prop contracts incl. inherited React/Radix props).
#    Clean stale declarations first: with DS_SKIP_VITE=1, Vite's emptyOutDir does
#    NOT run, so a renamed/deleted component would otherwise leave an orphaned
#    .d.ts that re-uploads a ghost contract to the design tool.
#    Declaration emit is BEST-EFFORT: tsconfig.dts.json sets noEmitOnError:false so
#    tsc still writes the .d.ts tree on type errors, but then EXITS non-zero — which
#    `set -e` would treat as fatal. Some app sources pulled into the include graph
#    carry pre-existing type issues that never surface in the esbuild app build
#    (e.g. src/lib/orpc.ts TS7056 "inferred type too long", reached via
#    PipelineStage's type-only useRecipeDagQuery import). Those must NOT abort the
#    converter: the emitted declarations still beat empty {[key]:unknown} contracts,
#    and the render-check + grading remain the real quality gates. So tolerate a
#    non-zero tsc exit.
rm -rf dist/types
node_modules/.bin/tsc -p .design-sync/tsconfig.dts.json \
  || echo "design-sync: tsc declaration emit reported errors (non-fatal; .d.ts still emitted)"

# 3. Resolvable copy of the compiled stylesheet, placed next to the fonts. Refuse
#    to GUESS which stylesheet: a polluted dist (stale build under DS_SKIP_VITE=1)
#    with more than one index-*.css would otherwise let `head -1` upload the wrong
#    (lexicographically-first, not newest) compiled CSS. Hard-error on 0 or >1.
CSS_COUNT="$(ls -1 dist/assets/index-*.css 2>/dev/null | wc -l | tr -d '[:space:]')"
if [ "$CSS_COUNT" = "0" ]; then
  echo "design-sync: FATAL — no dist/assets/index-*.css found. Run without DS_SKIP_VITE=1 to build the app first." >&2
  exit 1
fi
if [ "$CSS_COUNT" != "1" ]; then
  echo "design-sync: FATAL — ${CSS_COUNT} index-*.css files in dist/assets (stale/polluted dist); clean dist and rebuild:" >&2
  ls -1 dist/assets/index-*.css >&2
  exit 1
fi
SRC="$(ls -1 dist/assets/index-*.css | head -1)"
sed 's#url(/assets/#url(./#g' "$SRC" > dist/assets/_ds-compiled.css

# 4. Dark-by-default. The studio is dark-FIRST (index.html sets `.dark` pre-paint;
#    dark is the product default), but the compiled CSS keeps the light `:root`
#    tokens as the default — so a preview/design with no `.dark` ancestor renders
#    light, misrepresenting the brand. Re-target the source `.dark` token block
#    onto `:root` and append it (cascade order → dark wins). `.dark` itself is
#    preserved upstream, so explicit toggling still works.
DARK_ROOT="$(awk '/^\.dark[ ]*\{/{f=1} f{print} f&&/^\}/{exit}' src/index.css | sed '1s/^\.dark[ ]*{/:root {/')"
assert_theme_block "$DARK_ROOT" ".dark -> :root (dark default)"
{
  echo ""
  echo "/* design-sync: dark-by-default (re-targeted from src/index.css .dark) */"
  printf '%s\n' "$DARK_ROOT"
} >> dist/assets/_ds-compiled.css

# 5. Light toggle target. The studio is dark-FIRST, not dark-ONLY: src/index.css
#    ships a full, hand-tuned light palette on `:root` that step 4 makes
#    unreachable (its dark `:root` wins the cascade). Re-emit that authentic light
#    palette under `.light` so the design tool can switch to a real light theme —
#    a `.light` class on the shared render root re-skins the inline-rendered
#    components (custom properties inherit down). Dark stays the default; `.light`
#    only applies when explicitly set, and (equal specificity, later source order)
#    wins over the dark `:root` when present. Extracted from the source `:root`
#    block, so it can't drift from the app's real light tokens.
LIGHT_CLASS="$(awk '/^:root[ ]*\{/{f=1} f{print} f&&/^\}/{exit}' src/index.css | sed '1s/^:root[ ]*{/.light {/')"
assert_theme_block "$LIGHT_CLASS" ":root -> .light (light toggle)"
{
  echo ""
  echo "/* design-sync: authentic light palette (re-targeted from src/index.css :root -> .light) */"
  printf '%s\n' "$LIGHT_CLASS"
} >> dist/assets/_ds-compiled.css

echo "design-sync inputs ready: dist/types/ (.d.ts) + dist/assets/_ds-compiled.css (dark-default + .light toggle)"
