# MapGen Studio: `App.tsx` Refactor Plan

This document is a **comprehensive plan** to refactor `apps/mapgen-studio/src/App.tsx` into a structure that is:
- **Readable** (clear “what lives where”)
- **Stable** (low-risk extractions first; minimal behavioral churn)
- **Aligned with our direction** (browser runner, worker→deck.gl streaming, `VizSink`, optional dump replay)
- **Not prematurely locking in** the final long-term feature/routing/state architecture

It is intentionally written to be **updated** as more upstack work lands (especially around config overrides / nodes).

Related context:
- Architecture spike: `docs/projects/mapgen-studio/resources/SPIKE-mapgen-studio-arch.md`
- V0.1 runner spec: `docs/projects/mapgen-studio/BROWSER-RUNNER-V0.1.md`
- Browser adapter surface: `docs/projects/mapgen-studio/BROWSER-ADAPTER.md`
- V0.1 slice: config overrides UI→worker: `docs/projects/mapgen-studio/V0.1-SLICE-CONFIG-OVERRIDES-UI-WORKER.md`
- Roadmap: `docs/projects/mapgen-studio/ROADMAP.md`

---

## 1) Current state: what `App.tsx` owns today

`apps/mapgen-studio/src/App.tsx` is currently a single-file “vertical slice” that mixes:

### A) App/state orchestration
- Top-level modes: `"browser"` (worker runner) vs `"dump"` (replay viewer).
- UI state: selected step/layer, view state (pan/zoom), toggles (mesh edges, background grid), era index slider.
- Browser-run lifecycle: start run, cancel run, interpret worker events, keep selection “pinned” across reruns.
- Config overrides lifecycle: enable/disable overrides, edit via schema-driven form or raw JSON, validate/narrow on run.

### B) Dump loading (viewer path)
- Folder selection via `showDirectoryPicker` + fallback directory upload.
- `manifest.json` parsing and file-map normalization.
- Data loading from files (`ArrayBuffer`, `text`).

### C) Viz model + semantics
- “V0 manifest” model in the React app (`VizManifestV0`, `VizLayerEntryV0`, formats, bounds).
- Era-derived layer selection (`foundation.tectonicHistory.eraN.*`).
- “Step/layer key” conventions.

### D) Rendering logic
- Hex coordinate transforms (odd-r / odd-q), bounds estimation, fit-to-bounds.
- Scalar decoding and value → color mapping (including categorical plate palettes).
- Layer builders (deck.gl `PolygonLayer`, `ScatterplotLayer`, `PathLayer`).
- Mesh-edge overlay and background reference grid.

### E) UI markup
- All controls (mode, seed, map size, run/cancel, pickers, toggles).
- Error banner + status overlays.
- Legend content and formatting.
- Styling via inline styles.
- Schema-driven config editor (RJSF) + “advanced JSON” textarea for overrides.

This is already ~1.6k LOC and will continue to grow as we add:
- More config override surfaces (additional recipes, pipeline override nodes)
- More layer types and richer inspector UI
- More modes/features (graph view, diffing, export/replay, etc.)

---

## 2) Constraints and guiding principles

### What we should optimize for now
- **Extract without redesign**: separate responsibilities into modules, but keep the top-level UX and state shape mostly stable.
- **Low-risk**: prefer “move code” and “rename for clarity” over logic changes.
- **Keep optionality**: avoid picking a router/state library in the refactor unless we explicitly decide to.
- **Stay aligned with specs**: the direction is “browser runner first-class; dumps are optional/export/debug”.

### What we should not do in this refactor
- Introduce Tailwind/shadcn/ui in the same change (plan for it; don’t couple it).
- Re-architecture into a full feature-sliced app + router + global store (that’s a larger step).
- Extract a new monorepo package (`packages/mapgen-viz`, etc.) as part of the first refactor. (We should plan for it, but the first move should be internal extraction.)

---

## 3) Target shape (near-term) vs (long-term)

### Near-term target (refactor outcome)
Keep `App.tsx` as the entrypoint, but reduce it to:
- “page composition” (layout + wiring)
- “state orchestration” (small, explicit)
- calls to extracted hooks/services for:
  - dump loading
  - worker runner
  - deck layer construction
  - legend computation

Expected `App.tsx` size after refactor: **~250–450 LOC**.

### Long-term target (architecture)
Follow the architecture spike direction:
- `apps/mapgen-studio/src/features/*` (or `src/routes/*`) per mode
- dedicated visualization library surface (eventually `packages/mapgen-viz`)
- worker-first runner surface (eventually `packages/mapgen-browser-runner`)
- global state store (likely Zustand) + router (likely TanStack Router)

This refactor is designed so that the near-term modules can later be **moved wholesale** into features/packages with minimal churn.

---

## 4) Proposed file/directory layout (near-term extraction)

Create a “subsystem” structure inside `apps/mapgen-studio/src/` without committing to the final feature-slice layout yet:

```text
apps/mapgen-studio/src/
  App.tsx
  main.tsx
  browser-runner/              # worker entry + protocol (already exists)
    foundation.worker.ts
    protocol.ts
    worker-trace-sink.ts
    worker-viz-dumper.ts

  studio/                      # NEW: all app-facing logic extracted from App.tsx
    model/
      viz-v0.ts                # VizManifestV0, VizLayerEntryV0, formats, Bounds, keys
      tectonic-era.ts          # parse+resolve era layer IDs

    dump/
      file-map.ts              # FileMap, path normalization helpers
      load-dump.ts             # folder picker + webkitdirectory flow

    viz/
      hex-coords.ts            # odd-r/odd-q transforms, polygon, bounds
      fit.ts                   # fitToBounds, niceStep
      scalar.ts                # decodeScalarArray, min/max scan helpers
      palette.ts               # value->color mapping, plate palette generation
      legend.ts                # legendForLayer (pure)
      deckgl/
        build-layers.ts        # convert VizLayerEntryV0 -> deck.gl layer objects
        background-grid.ts     # background reference points layer builder

    runner/
      useBrowserRun.ts         # start/cancel run; receives BrowserRunEvent
      useRunSelection.ts       # selection pinning behavior on rerun

    ui/
      components/
        HeaderBar.tsx
        ErrorBanner.tsx
        ControlRow.tsx
        StepLayerControls.tsx
        LegendPanel.tsx
        StatusOverlay.tsx
      styles/
        inline.ts              # temporary inline style objects (centralized)
      types.ts                 # view models for UI components (props types)
```

Notes:
- `studio/` is a **holding area**. Later, it can be split into `features/` + shared libraries.
- `browser-runner/` stays as-is for now; the refactor extracts the **app-side orchestration** into `studio/runner/`.
- This keeps worker bundling unaffected (the worker is its own entry and imports only what it needs).

---

## 5) Extraction map: what moves where (from `App.tsx`)

### 5.1 Types and model glue
Move these out first because they’re broadly reused:
- `Bounds`, `VizScalarFormat`, `VizManifestV0`, `VizLayerEntryV0`
- `TileLayout`, `EraLayerInfo`, `Civ7MapSizePreset` and `CIV7_MAP_SIZES` helpers
- “layer key” convention: `${stepId}::${layerId}::${kind}`

Suggested exports:
- `studio/model/viz-v0.ts`
  - `type Bounds`, `type VizScalarFormat`
  - `type VizLayerEntryV0`, `type VizManifestV0`
  - `type TileLayout`
  - `type Civ7MapSizePreset`, `CIV7_MAP_SIZES`, `getCiv7MapSizePreset`, `formatMapSizeLabel`
  - `layerKey(...)`, `parseLayerKey(...)` (optional)

### 5.2 Dump loader (viewer mode)
Move:
- `stripRootDirPrefix`
- directory picker logic + fallback upload logic
- `FileMap` normalization
- `loadManifestFromFileMap`, `readFileAsText`, `readFileAsArrayBuffer`

Suggested:
- `studio/dump/file-map.ts`
  - `type FileMap`, `stripRootDirPrefix`, `normalizeDumpFileMap(...)`
- `studio/dump/load-dump.ts`
  - `openDumpFolder(...)` (returns `{ manifest, fileMap }`)
  - `loadDumpFromDirectoryUpload(files)` (returns `{ manifest, fileMap }`)
  - `readFileAsText`, `readFileAsArrayBuffer`

**Design note:** keep this API promise-based and UI-agnostic; don’t set React state in these helpers.

### 5.3 Browser run (worker-runner mode)
Move:
- `browserWorkerRef`, `browserRunTokenRef`, start/stop logic, event wiring
- “pinned selection” logic that retains selection across rerun until streamed layers arrive

Suggested:
- `studio/runner/useBrowserRun.ts`
  - `useBrowserRun({ onManifestInit, onStepProgress, onLayerUpsert, onError, onFinished })`
  - returns `{ start, cancel, running, lastStep, manifest }`
  - encapsulates worker lifecycle and `runToken` filtering
- `studio/runner/useRunSelection.ts`
  - encapsulates the “keep selection if step exists / if rerunning keep pinned” rules

**Important:** keep the worker protocol types (`BrowserRunEvent`, `BrowserRunRequest`) sourced from `src/browser-runner/protocol.ts` (or later from a package).

### 5.4 Visualization math (pure utilities)
Move:
- clamp, niceStep
- hex coordinate conversions and bounds computation
- `fitToBounds`

Suggested:
- `studio/viz/fit.ts`: `clamp`, `niceStep`, `fitToBounds`
- `studio/viz/hex-coords.ts`: odd-r/odd-q conversions, `hexPolygonPointy`, `boundsForTileGrid`, etc.

### 5.5 Color/palette and legends (pure, deterministic)
Move:
- hash/rng, HSL→RGB, OKLab distance
- plate palette generation
- `colorForValue`, `legendForLayer`

Suggested:
- `studio/viz/palette.ts`: `colorForValue`, `buildPlateColorMap`, plate palette helpers
- `studio/viz/legend.ts`: `legendForLayer`

### 5.6 deck.gl layer builders (rendering adapters)
Move the “convert a `VizLayerEntryV0` into deck.gl layers” code out of `App.tsx`.

Suggested:
- `studio/viz/deckgl/build-layers.ts`
  - `buildVizLayers({ manifest, fileMap, effectiveLayer, tileLayout, overlays, onStats, onError }): Promise<Layer[]> | Layer[]`
  - returns “base layers” (main data) plus optional overlays (mesh edges).
- `studio/viz/deckgl/background-grid.ts`
  - `buildBackgroundGridLayer({ viewState, viewportSize, effectiveLayer, show }): ScatterplotLayer | null`

**Design note:** treat deck.gl as an adapter layer. Everything “domain semantic” (layer selection, palette semantics) should be outside of deckgl-specific code.

### 5.7 UI components (presentation)
Move these blocks into leaf components:
- header row, mode picker, seed+map size controls, run/cancel status
- step picker, layer picker, toggles, era slider
- legend panel, status overlay, error banner

Suggested component split (each should be mostly presentational + callbacks):
- `HeaderBar`
- `RunControls`
- `StepLayerControls`
- `LegendPanel`
- `StatusOverlay`
- `ErrorBanner`

**Styling posture:** centralize the existing inline styles into a single module `studio/ui/styles/inline.ts` so Tailwind/shadcn later becomes a mechanical replacement.

---

## 6) Migration plan (how to execute the refactor safely)

This should be done as a **stack of small PRs** (Graphite-friendly), each with a tight diff:

### Layer 1 — “Extract pure utilities + types”
- Add `studio/model/*` and `studio/viz/*` modules.
- Move pure functions/types, keep exports stable.
- Minimal edits to `App.tsx` (imports replaced, logic unchanged).

Risk: low.

### Layer 2 — “Extract dump loader”
- Add `studio/dump/*`.
- `App.tsx` keeps mode/state, but calls `openDumpFolder()` / `loadDumpFromDirectoryUpload()`.

Risk: low; verify dump mode still works.

### Layer 3 — “Extract deck.gl builders”
- Add `studio/viz/deckgl/*`.
- `App.tsx` uses `useMemo` + a small `useEffect` to resolve async layers (or introduce a tiny `useAsyncMemo` helper).

Risk: medium; ensure selection changes trigger rebuild correctly and errors surface.

### Layer 4 — “Extract browser runner hook”
- Add `studio/runner/useBrowserRun.ts`.
- `App.tsx` becomes an orchestrator: call `start()` / `cancel()`, receive manifest updates via callbacks.

Risk: medium; ensure worker termination semantics unchanged.

### Layer 4.5 — “Extract config overrides subsystem”
Now that schema-driven config overrides are implemented end-to-end (UI→worker), treat this as a self-contained extraction:
- Add `studio/config-overrides/*` (model + validation + UI composition).
- `App.tsx` should only keep **minimal wiring state** (open/closed, enabled, current config value) or delegate fully to a hook.

Risk: medium; keep behavior identical:
- “form” and “json” tabs remain equivalent sources of truth
- invalid JSON/schema errors still prevent runs with the same user-facing messaging

### Layer 5 — “Extract UI components”
- Add `studio/ui/components/*`.
- Keep all state in `App.tsx` for now; pass props down.

Risk: medium (UI wiring). Keep it mechanical.

### Layer 6 (optional, later) — “Introduce a store + router”
Only after we’ve landed the internal modularization and we have clarity on modes:
- Add router (TanStack Router or React Router).
- Add store (Zustand) for cross-mode state (runs, selection, viewport).

Risk: higher; do intentionally.

---

## 7) Decision points (things we expect to revisit)

### 7.1 Protocol/types duplication
Today we have:
- `App.tsx` dump-oriented `VizManifestV0`
- `src/browser-runner/protocol.ts` streaming protocol types

Near-term: keep both; minimize churn.

Later: unify under a shared protocol library (likely `packages/mapgen-viz`) so:
- dump export + streaming share stable descriptors and payload shapes
- the app uses one “viz model” regardless of source (dump or live run)

### 7.2 Where config overrides live
Config overrides are now *real* and are part of the browser-runner workflow:
- The UI edits a typed config shape (currently `BrowserTestRecipeConfig`) via:
  - schema-driven form (RJSF), and/or
  - an advanced JSON textarea with validation/narrowing
- The runner request includes `configOverrides` (typed) and the worker:
  - deterministically deep-merges base config + overrides
  - validates with `normalizeStrict` and fails fast with readable errors

We should isolate this into a dedicated subsystem so it doesn’t keep inflating `App.tsx`:
- `studio/config-overrides/model.ts` — state shape + helpers for “enabled/tab/source-of-truth”
- `studio/config-overrides/validate.ts` — JSON parse + `normalizeStrict` narrowing + error formatting (shared by UI + runner-start)
- `studio/config-overrides/ConfigOverridesPanel.tsx` — the UI (RJSF + JSON textarea), no worker imports
- `studio/config-overrides/toRunRequest.ts` — “extract the overrides payload” for `BrowserRunStartRequest`

Later (once we support multiple recipes): promote to a feature slice (e.g. `features/runner/config-overrides/`) and/or define an explicit “public overrides” schema per recipe.

### 7.3 Async caching
The app currently does “async memo” and then sets `resolvedLayers`.
As layer count grows we’ll want:
- memoized decoding / derived geometry caches keyed by `layer.key`
- cancellation/ignore-stale results when selection changes rapidly

Plan: keep current behavior for now; add a small `useLatestPromise` helper if needed in Layer 3.

---

## 8) Acceptance criteria for the refactor (when we do it)

Behavioral:
- Browser runner mode still:
  - starts reliably
  - streams progress + layers
  - retains selection correctly across reruns
  - cancels cleanly
  - shows readable errors
  - applies config overrides correctly (and blocks invalid overrides)
- Dump mode still:
  - loads a run folder reliably via directory picker
  - renders the same layers as before

Maintainability:
- `App.tsx` reads as: “state + wiring + layout”, not math/rendering/protocol detail.
- No new transitive imports into the worker bundle from UI-only modules.

---

## 9) Validation checklist (per refactor layer)

Run (from repo root):
- `bun run --cwd apps/mapgen-studio build`
  - ensures TS + Vite build + worker bundling check still pass
- `bun run --cwd apps/mapgen-studio dev`
  - manual smoke:
    - start browser run and observe 1–2 layers stream
    - reroll seed; confirm selection behavior
    - open dump folder; confirm rendering and selection

If we add any new helper modules:
- ensure they are browser-safe (no Node APIs)
- ensure `tsconfig` strictness passes (`noUnusedLocals`, etc.)

---

## 10) Suggested follow-up: “graduation” path after internal refactor

Once config overrides and another viz domain land (i.e., the app has 2–3 real “modes”), we should graduate from `studio/` holding area into:
- `src/features/browser-runner/*`
- `src/features/dump-viewer/*`
- `src/features/pipeline-graph/*` (when ready)
- plus `src/shared/*` for cross-cutting UI and viz utilities

That is the point where router + global store become high-leverage rather than premature.
