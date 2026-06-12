# Refresh flash fix: the root carries the navigation clear color

## Why

Refreshing the studio flashed bright white before the dark UI painted. The
user asked for an instrumented investigation ("record what renders when").
An earliest-inline-script sampler (sessionStorage, pre-guard placement)
captured the new document's paint-relevant state across reloads:

- **Before:** at parse-start the root element had `background: transparent`
  and `color-scheme: normal`, and stayed that way until Vite's JS-injected
  CSS landed (~138ms, DOMContentLoaded) — the flash-guard `<style>` only
  styled `<body>`. The browser's between-navigations clear color comes from
  the ROOT element's background and the document `color-scheme`; with both
  unset, every paintable moment in that window cleared to white. (The
  lingering "DeckGL background" the user noticed is the old page's
  GPU-composited canvas layer, released last during teardown.)
- **After:** by the first animation frame (~8ms) the root computes
  `rgb(13,13,17)` + `color-scheme: dark` — the unstyled window is gone
  before any paint opportunity.

## Target Authority Refs

- `docs/projects/mapgen-studio-redesign/pass-5-design-fixes.md` (X4)

## What Changes

- `index.html` flash guard gains `:root { color-scheme: dark; background:
  #0d0d11; }` (the guard previously styled only `body`); the theme script's
  light branch appends the matching root override (`color-scheme: light;
  background: #f2f2f7`), keeping light users symmetric. The guard stays
  unlayered-minimal (Pass-3 constraint) and in sync with index.css tokens.

## Impact

- Affected specs: `mapgen-studio`
- Affected code: `apps/mapgen-studio/index.html`
