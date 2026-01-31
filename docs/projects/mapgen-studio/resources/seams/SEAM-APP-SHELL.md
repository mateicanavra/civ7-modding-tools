# agent-app-shell (scratch)

Mission scope: identify “app shell” (layout/composition) responsibilities currently embedded in `apps/mapgen-studio/src/App.tsx`, plus couplings to feature logic (runner/viz/config overrides). Propose what `App.tsx` should shrink to after a refactor (documentation only).

## 1) Files reviewed

- `apps/mapgen-studio/src/main.tsx`
- `apps/mapgen-studio/src/App.tsx`
- `apps/mapgen-studio/src/browser-runner/protocol.ts`
- `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts`
- `apps/mapgen-studio/src/browser-runner/worker-trace-sink.ts`
- `apps/mapgen-studio/src/browser-runner/worker-viz-dumper.ts`
- `apps/mapgen-studio/src/civ7-data/civ7-tables.gen.ts` (skim; data source for worker adapter)

## 2) Shell responsibilities today (as implemented in `App.tsx`)

`App.tsx` currently contains *both* the app shell *and* most of the “features” it hosts (browser-runner, dump viewer, config overrides editor, viz renderer). The shell-ish responsibilities in that file are:

- **Top-level frame + layout**
  - Owns the `100vh` app frame and “header/toolbar + main canvas” structure.
  - Owns responsive breakpoint (`isNarrow` derived from measured container width) and changes layout/spacing accordingly.
  - Owns “main region” positioning (`position: relative`) and hosts overlays as absolutely-positioned panels.
- **Global UI chrome**
  - App title + mode subtitle (“Browser Runner (V0.1 Slice)” vs “Dump Viewer (V0)”).
  - Global control bar pattern + baseline styles (`controlBaseStyle`, `buttonStyle`) as inline React styles.
- **Global error surface**
  - Single `error: string | null` state used for *everything* (dump loading, worker failures, async layer decoding, config validation failures).
  - Renders a global error banner (preformatted multiline) immediately under the header.
- **Overlay hosting and positioning**
  - Hosts a left-side “Config overrides” overlay panel (absolute positioned, z-indexed) when in browser mode.
  - Hosts a right-side legend overlay (absolute positioned) and a bottom-right run/viewport status overlay.
  - All overlays are hard-coded to the current canvas container and use inline styling (backgrounds, borders, blur/backdrop, shadows).
- **Entrypoint composition**
  - `apps/mapgen-studio/src/main.tsx` is trivial; all “what is the app” composition happens inside `App.tsx`.

Put differently: the current “app shell seam” is *not* a seam; it’s the same component that owns platform concerns (layout/overlays/errors) and feature behaviors (runner, dump viewer, viz decode, override editing).

## 3) Hidden couplings with features (runner/viz/overrides)

These are the couplings that make `App.tsx` hard to shrink without first introducing explicit boundaries.

### A. Browser runner (Web Worker) couplings

- **Worker lifecycle is owned by the UI**: `startBrowserRun()` constructs the worker, wires handlers, and encodes request parameters; “Cancel” kills the worker via `terminate()` (no protocol-level cancel is used).
- **Selection “pinning” is tied to streaming behavior**: the “keep UI pinned while re-running from step 0” behavior depends on:
  - `selectedStepIdRef/selectedLayerKeyRef` capturing selection across re-runs,
  - `browserRunning` influencing when selection should be auto-reset,
  - message ordering assumptions from the worker trace sink (steps first, then layers).
- **Protocol/type drift risk**: `App.tsx` imports `BrowserRunEvent` / `BrowserRunRequest` from `browser-runner/protocol.ts`, but re-declares its own `Bounds`, `VizScalarFormat`, `VizLayerEntryV0`, and `VizManifestV0`. This creates a quiet “two sources of truth” problem for viz payload shape and bounds semantics.

### B. Viz renderer couplings (deck.gl + layer semantics)

- **Viz layer interpretation depends on layer ID conventions**:
  - Special-cases are intentionally avoided; overlays/tooling should be driven by generic metadata (e.g. `meta.role === "edgeOverlay"`).
  - Legend/color mapping uses string heuristics (e.g., `boundaryType`, “crust type”, “plate id”), not an explicit metadata contract.
- **View fitting depends on feature-specific bounds math**:
  - `setFittedView` and `boundsForTileGrid` are invoked from selection logic and layer changes (shell-level user interactions trigger feature-level fit behavior).
- **Dump mode and browser mode share a “manifest + layers” UI surface**:
  - Both modes render the same deck.gl viewport and selection controls, but differ in how `manifest` is populated (file-map vs streamed payloads).

### C. Config overrides couplings (schema + editor UI)

- **Config schema normalization/rendering lives inside `App.tsx`**:
  - Custom RJSF templates, CSS string, schema normalization functions, and AJV validator instantiation are all in `App.tsx`.
- **Config validation is tied to runner**:
  - Uses `normalizeStrict` with `BROWSER_TEST_RECIPE_CONFIG_SCHEMA` and default `BROWSER_TEST_RECIPE_CONFIG`.
  - The “invalid JSON” path bubbles into global error state, affecting the entire app shell.

### D. Dump viewer couplings (file picking)

- **Platform capability branching is embedded in the component**:
  - Uses File System Access API (`showDirectoryPicker`) when available; falls back to `<input webkitdirectory>`.
- **Domain/path coupling**:
  - The header includes a user hint that references a specific repo output path: `mods/mod-swooper-maps/dist/visualization`.

## 4) Extraction proposal (target: `apps/mapgen-studio/src/app/`)

Goal: introduce an explicit app-shell boundary so `App.tsx` becomes “composition only”, while keeping code motion minimal and avoiding a reorg that would be thrown away when Tailwind/shadcn arrives.

### A. Proposed `src/app/` modules

Create a small “app” layer that owns layout/overlays/errors and delegates features to children:

- `apps/mapgen-studio/src/app/Providers.tsx`
  - Centralizes any cross-cutting providers (today: maybe none beyond `StrictMode` in `main.tsx`; tomorrow: theme, toasts, query client, feature flags).
  - Also a natural home for an `ErrorBoundary` (React error boundary, distinct from the current “error banner” string state).
- `apps/mapgen-studio/src/app/Layout.tsx`
  - Pure layout primitives for the shell frame:
    - `AppFrame` (100vh, background, flex column)
    - `AppHeader` / `ToolbarRow`
    - `MainStage` (relative container + sizing hook)
    - `OverlaySlot` / `OverlayPanel` (absolute panels)
    - `ErrorBanner` (render-only; takes string/children)
  - This is intentionally “dumb” and styling-oriented.
- `apps/mapgen-studio/src/app/AppShell.tsx`
  - Owns shell state and slotting:
    - `mode` selection (until a router exists)
    - global error surface (or an app-level “notice/toast” mechanism)
    - overlay open/close state (e.g., config drawer open)
  - Delegates mode-specific content to “pages” (see below).

Notes:
- The above is the minimal set to create a seam. It does **not** require migrating feature logic immediately; it just creates a place to move it to once ready.
- If a router is planned, `AppShell` becomes the route layout and `mode` becomes a route segment (`/browser`, `/dump`) instead of state.

### B. Where feature logic should live (naming sketch)

Even though this mission is “`src/app/` modules”, shrinking `App.tsx` depends on pulling feature logic out of the shell. A small, low-ceremony folder structure is enough:

- `apps/mapgen-studio/src/features/runner/…`
  - `BrowserRunnerPage.tsx` (controls + runner-specific overlays)
  - `useBrowserRunner.ts` (worker lifecycle + protocol wiring)
  - `BrowserConfigOverridesPanel.tsx` (the overlay panel; includes RJSF templates/CSS)
- `apps/mapgen-studio/src/features/dump/…`
  - `DumpViewerPage.tsx` (dump picker UX + wiring to manifest loader)
  - `useDumpLoader.ts` (directory pick/upload, file-map normalization, manifest load)
- `apps/mapgen-studio/src/features/viz/…`
  - `VizStage.tsx` (DeckGL + viewstate + overlays like legend/status)
  - `vizTypes.ts` (single source of truth for `VizManifestV0` / entries; ideally share with `browser-runner/protocol.ts` instead of duplicating)
  - `legend.ts`, `colors.ts`, `hex.ts` (the current helpers in `App.tsx`)

This keeps `src/app/` small and avoids “big reorg”; it’s mostly moving code into obvious buckets.

### C. Minimal state remaining at the root after refactor

After introducing `src/app/AppShell.tsx`, `apps/mapgen-studio/src/App.tsx` should shrink to composition only:

- `App.tsx` responsibilities (target end state)
  - Construct providers and render the shell:
    - `<AppProviders><AppShell /></AppProviders>`
  - No Web Worker wiring, no deck.gl wiring, no schema/render logic, no file picking.
  - Ideally no state at all (or only route selection if `AppShell` isn’t introduced yet).

What “minimal state” is acceptable at the shell layer (`AppShell`) vs features:

- `AppShell` can keep:
  - high-level mode/route selection
  - global “error surface” policy (banner vs toast vs inline)
  - overlay slotting policy (where overlays live; escape hatches for z-index)
- Feature pages should keep:
  - worker + run parameters (seed/map size/config overrides)
  - manifest/layer selection state
  - view state + fit behavior (or a `viz` feature hook)
  - dump file picking/loading

### D. Preparing for Tailwind/shadcn later (without a big reorg now)

The main “Tailwind/shadcn readiness” move is to stop encoding the UI in ad-hoc inline styles sprinkled through feature logic. Without changing UI yet, create stable structural components and stable class hooks:

- Keep `Layout.tsx` as the only place that “knows” about spacing, borders, surfaces, z-index layers, and overlay placement.
- Use semantic wrappers + stable class names / `data-*` attributes (e.g. `data-shell="header"`, `data-overlay="legend"`) so Tailwind can be layered later without moving files again.
- Keep “panels” and “controls” as shallow components (e.g. `Panel`, `Button`, `Select`) even if they still render plain elements initially; later they can swap to shadcn components behind the same interface.
- Prefer one overlay root strategy early (either “inside MainStage relative container” or a portal root). If a portal root is likely with shadcn dialogs/sheets, add it in `Layout.tsx` now (even if only used by one overlay) to avoid re-touching every feature later.

## 5) Risks + validation

### Risks

- **Behavioral drift in “pinned selection while streaming”**: refactors that move runner logic must preserve the subtle interactions between `browserRunning`, the selection refs, and message handling order.
- **Type contract divergence**: today’s duplicated viz types (`protocol.ts` vs `App.tsx`) makes extraction risky; moving code without unifying types could freeze-in inconsistencies.
- **Overlay ownership ambiguity**: the config panel, legend, and status overlays are currently “shell-level” by placement but “feature-level” by content; extraction needs a clear policy (shell provides slots; features provide bodies).
- **Error handling semantics**: today’s single `error` banner is a blunt instrument; splitting into feature-local errors vs app-global errors can change what the user sees and when.
- **Mode switching lifecycle**: switching to dump mode force-stops the worker; this must remain true even when runner logic is extracted (otherwise dangling workers continue to stream).

### Validation (manual checks)

Suggested checklist after any extraction (no new behavior):

- Browser mode:
  - Run → observe step streaming updates and first layer auto-selection
  - Reroll seed triggers a run and changes runId
  - Cancel terminates run and stops updates
  - Config panel open/close works; enabling overrides affects subsequent runs
  - JSON overrides: invalid JSON shows a clear error without breaking the whole app
- Dump mode:
  - `showDirectoryPicker` path works when supported
  - `webkitdirectory` upload fallback still loads `manifest.json`
  - Selecting step/layer still fits view and renders legend/status
- Shared:
  - Error surfaces: worker errors, manifest parse errors, async decode errors all show somewhere obvious
  - Overlays: legend and status remain visible and correctly positioned over the viz canvas
