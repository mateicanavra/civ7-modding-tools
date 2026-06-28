# design-sync notes — mapgen-studio

Repo-specific gotchas for future re-syncs. Append a bullet whenever something
non-obvious comes up.

## Shape & wiring
- **App shape, not a published library.** `apps/mapgen-studio` is a Vite app; `package.json` has no `main`/`module`/`exports`/`types`. So this runs in **synth/source mode** with a curated `--entry` (`.design-sync/ds-entry.tsx`) that re-exports the DS surface. The curated entry is what scopes the bundle — the converter's auto-synth would `export *` from every `.tsx` under `src/` (server daemon, deck.gl workers, features) and blow up the bundle. Never drop `cfg.entry`.
- **PKG_DIR anchor.** `cfg.entry` also anchors `PKG_DIR` (the converter walks up from the entry to the nearest named `package.json` → `apps/mapgen-studio`). Without `--entry`, `PKG_DIR` would resolve to `node_modules/mapgen-studio` (nonexistent) and discovery fails.
- **Run from the package dir.** All converter commands run with cwd = `apps/mapgen-studio` so `.ds-sync/`, `ds-bundle/`, and `.design-sync/` stay package-local. `--node-modules ./node_modules` (react/react-dom live there; the repo root has none).
- **Config home = the package.** `.design-sync/` lives in `apps/mapgen-studio/`, not the repo root.

## Components
- 26 components pinned in `cfg.componentSrcMap`: 15 shadcn primitives (`src/components/ui/`) + 11 composites (`src/ui/components/`, incl. `fields/FieldRow`). `OptionSelect` and `StageViewTabs` are NOT in the composites barrel, hence the explicit re-exports in `ds-entry.tsx`.
- Composites are prop-driven/presentational but value-import a few `../../features/*` helpers (status enums, `SchemaConfigForm` (rjsf), `civ7Setup` config helpers). Those get bundled — that's their real composition.

## CSS / Tailwind v4
- Tailwind v4 CSS-first (`src/index.css`: `@import "tailwindcss"` + `@theme inline` tokens). Utilities are generated on-demand, so the **compiled** CSS is the source of truth, not `src/index.css`.
- `cfg.cssEntry = .design-sync/compiled.css` — a STABLE copy of the app's compiled stylesheet (the hashed `dist/assets/index-*.css`). The dist filename is content-hashed and changes every build, so we copy it to a stable path.
- **Re-sync risk:** `compiled.css` must be refreshed from a fresh `vite build` before re-syncing, or it goes stale vs. the components. Also, authored previews that use utility classes NOT present anywhere in the app source won't be in this CSS — if previews render unstyled, recompile Tailwind scanning `src/**` + `.design-sync/previews/**` (see Re-sync risks).
- Brand fonts (Inter, JetBrains Mono) ship in `dist/assets/*.woff2` via `@fontsource/*`; the compiled CSS carries their `@font-face`.

## Authoring learnings (folded from waves A–D + the panels)

- **shadcn `Tooltip` throws/renders BLANK without a `TooltipProvider` ancestor** — and **no error is printed** in the capture log (the cell just comes up empty). Any component that uses `Tooltip`/`TooltipTrigger`/`TooltipContent` needs a `TooltipProvider` above it. Affected previews (all fixed by wrapping the preview surface in `<TooltipProvider>` from the bundle): `ViewControls`, `WaterStatsSection`, `AppHeader`, `GameConsole`, `RecipePanel`, `ExplorePanel`. `AppFooter` self-provides one internally. This is ALSO a design-agent usage requirement → carried into `conventions.md`. (We chose per-preview wraps over a global `cfg.provider` to avoid clearing every already-`good` grade.)
- **Overlays portal their own dark `bg-popover` surface** — `Select`/`DropdownMenu`/`Popover`/`Tooltip`/`Dialog` need NO `Demo` backdrop. Author ONE open-state story (`defaultOpen` / `open`); `cardMode: single` + viewport overrides are set in config. Set `Select`'s `value=` so the open list shows the selected check/highlight.
- **Inline (non-portal) components need the dark `Demo`/`Dock` wrapper** (`bg-background text-foreground`, inline-style layout). Token utilities confirmed in the compiled CSS: `bg-background/card/popover/muted/input-background`, `text-foreground/muted-foreground`, `border-border/-subtle/-strong`, `text-data` (11px), `text-label` (10px uppercase eyebrow), `font-mono` (JetBrains), `font-medium`. For effects without a guaranteed utility, use `style={{ ...: "var(--token, fallback)" }}`.
- **Faint-by-design hairlines**: `Separator` (border-subtle) and the `ScrollArea` thumb (border-strong) nearly vanish on `bg-background` — flank them with a lighter `bg-card`/`bg-muted` panel. Vertical `Separator` needs a definite parent height; `ScrollArea` needs a fixed root height + content taller than it for the thumb to appear. `Tabs` active state is a `border-primary` underline; use `defaultValue` (not `value`) for a static-renderable selected tab.
- **Absolute-positioned composites** (`AppFooter`/`AppHeader` = `absolute top/bottom-4`; `StageViewTabs` = `absolute`) must be framed in a `relative` sized container.
- **Mocks are runtime-only** (esbuild, not typechecked) — pass just the fields read at render. `WaterStatsSection`/`ExplorePanel` water summary rows read `rowKey`/`label`/`counts` (a semantic key, not `layers`/`default`/`debug`) + `layerRefs[]` with `layerKey`/`dataTypeKey`/`label`/`presentation.categoryLabel`/`presentation.palette.activeColor`; divergence keys matching `/mismatch|reject|drift/i` with value>0 render amber. `AppHeader.setupConfig` needs `playerOptions: []` (falls back) + `savedConfig: {id, displayName}`. `RecipePanel` renders its rjsf config form when `configCollapsed={false}` with a valid RJSFSchema + matching config; `configCollapsed={true}` skips rjsf.

## Re-sync routine (one command, then grade)
1. `bash .design-sync/build-inputs.sh` (regenerates `dist/`, `dist/types/` .d.ts, and `dist/assets/_ds-compiled.css` with the dark-default + font-url rewrite). Use `DS_SKIP_VITE=1` only if `dist/` is already current.
2. Fetch the project's `_ds_sync.json` → `.design-sync/.cache/remote-sync.json`, then run the driver:
   `node .ds-sync/resync.mjs --config .design-sync/config.json --node-modules ./node_modules --entry .design-sync/ds-entry.tsx --out ./ds-bundle --remote .design-sync/.cache/remote-sync.json`
3. **Render check needs a browser**: there is NO playwright browser installed — set `DS_CHROMIUM_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"` (Homebrew `chromium` is a stale wrapper pointing at a non-existent app). The playwright JS is installed under `.ds-sync/node_modules` (`PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`).

## Re-sync risks (watch-list)
- **Generated build inputs are gitignored** (`dist/`, `dist/types/`, `dist/assets/_ds-compiled.css`) — on a fresh clone they're absent until `build-inputs.sh` runs. The converter depends on all three (synth entry, `.d.ts` extraction, `cssEntry`).
- **`build-inputs.sh` carries two hand-rolled steps** that are easy to lose: the `url(/assets/ → ./` font rewrite (else fonts dangle), and the `.dark`-block→`:root` dark-default append (else previews/designs render light). If `src/index.css`'s `.dark` block moves or is renamed, the awk extractor (`/^\.dark[ ]*\{/`) silently no-ops → light output.
- **`vite build` standalone** (step 1) was not exercised here (the committed `dist/` was already current); if it fails outside nx, build just `dist/` + the compiled CSS some other way before the converter.
- **`componentSrcMap` + `docsMap` enumerate all 25 components by hand** — a NEW component added to `src/components/ui` or `src/ui/components` will NOT appear until added to both maps (and `ds-entry.tsx` if not in an existing barrel). Grouping relies on path segments being generic (`components`/`ui`); a component in a NON-generic subdir (like the dropped `fields/FieldRow`) takes its dir name as the group regardless of `docsMap`.
- **`FieldRow` is intentionally excluded** (`componentSrcMap.FieldRow: null`) — a trivial flex-row layout helper. Re-add to both maps to bring it back.
- **Tooltip-provider per-preview wraps** (`AppHeader`/`GameConsole`/`RecipePanel`/`ExplorePanel` previews wrap in `<TooltipProvider>`): if upstream adds/removes Tooltip usage in a component, the corresponding preview wrap may need adding/removing (silent blank cell otherwise).
- **`RecipePanel`'s form story uses a hand-written RJSFSchema mock** — if the real config-schema shape or rjsf API drifts, that mock may need updating (the `RecipeSelection` collapsed story is the safe fallback).
- **`conventions.md` names tokens/classes/components** — every name was validated against the built CSS + `components/` tree at sync time. On re-sync the conventions-header step re-validates; fix any name the build no longer carries (the pre-compiled `styles.css` only contains utilities actually used by the app + previews).
