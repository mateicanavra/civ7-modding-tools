# MapGen Studio: `App.tsx` Refactor Plan

This document is a **comprehensive plan** to refactor `apps/mapgen-studio/src/App.tsx` into a structure that is:
- **Readable** (clear “what lives where”)
- **Stable** (low-risk extractions first; minimal behavioral churn)
- **Aligned with our direction** (browser runner, worker→deck.gl streaming, `VizSink`, optional dump replay)
- **Not prematurely locking in** the final long-term feature/routing/state architecture

It is intentionally written to be **updated** as more upstack work lands (especially around config overrides / nodes).

Update note (2026-01-29):
- `App.tsx` has expanded substantially (config overrides sidebar polish, schema presentation helpers, CSS, templates).
- `packages/browser-recipes/` (`@mapgen/browser-recipes`) now exists and is the beginning of the “many recipes” story.
- Treat “infinite recipes” as a hard requirement: adding new recipes should be a mechanical registration/artifacts task, not an app re-architecture.

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
- Config overrides presentation layer (must remain presentation-only):
  - CSS blob for form typography + separators + stage cards.
  - RJSF templates (`FieldTemplate`, `ObjectFieldTemplate`, `ArrayFieldTemplate`).
  - Schema normalization/wrapper collapsing (collapse redundant single-child wrappers, but preserve the top-level stage container).

This is already ~2.5k LOC and will continue to grow as we add:
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

### Invariants we must preserve (non-negotiable)
- **Browser-first**: pipeline runs in a Web Worker; no server round-trips for normal operation.
- **In-memory viz**: runtime path is worker → streamed payloads → deck.gl; dumps are optional.
- **Bundling guardrails**: worker bundle stays browser-safe (keep `check:worker-bundle` green).
- **Determinism**: seed/config → deterministic outputs; merge semantics are deterministic and safe.
- **Retention UX**: reruns retain selected step + layer; seed reroll auto-runs; cancellation semantics unchanged.
- **Config overrides UX**:
  - schema-driven form is primary
  - JSON editor is a fallback/advanced path
  - schema wrapper collapsing is presentation-only and must not change config shape
  - the top-level stage container remains visible and is not collapsed away
- **No import cycles**: keep the layering acyclic; runner/protocol and viz/ui concerns must not tangle.

### What we should not do in this refactor
- Introduce Tailwind/shadcn/ui in the same change (plan for it; don’t couple it).
- Re-architecture into a full feature-sliced app + router + global store (that’s a larger step).
- Extract additional new monorepo packages (`packages/mapgen-viz`, etc.) as part of the first refactor. (We should plan for it, but the first move should be internal extraction; `packages/browser-recipes/` is already an input and stays.)

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

### Recommendation (updated): split into `features/*` now
We now have enough real surface area (browser runner, dump viewer, config overrides, viz host) that a **feature-based** layout is the least risky long-term move and reduces cross-branch conflicts. This does **not** force routing or a global store; it just gives us stable seams.

Proposed near-term layout (inside the app):

```text
apps/mapgen-studio/src/
  App.tsx                     # shrinks to composition/wiring
  main.tsx

  app/                        # app shell composition (no domain logic)
    AppShell.tsx
    ErrorBanner.tsx

  features/
    browser-runner/           # worker client + run orchestration
    config-overrides/         # schema-driven form + JSON editor + presentation rules
    viz/                      # deck.gl canvas + layer model + builders
    dump-viewer/              # folder picker + manifest decode (optional mode)

  shared/                     # small cross-feature helpers only
    format.ts
    hooks.ts
    types.ts

  browser-runner/             # worker entry + protocol (already exists)
    foundation.worker.ts
    protocol.ts
    worker-trace-sink.ts
    worker-viz-dumper.ts
```

Dependency rules (keep the graph acyclic):
- `app/*` composes `features/*` and may depend on `shared/*`.
- `features/*` may depend on `shared/*`.
- `features/viz/*` consumes “runner events” via a narrow adapter boundary; avoid importing runner internals.
- `browser-runner/*` (worker + protocol) must not import from React/app/features.

`packages/browser-recipes/` is a critical input to this structure:
- The app should treat “recipes” as data/artifacts (`recipeId`, `defaultConfig`, `configSchema`, optional presentation hints).
- The config overrides feature should be recipe-agnostic so adding recipes is a mechanical registration step.

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

### Updated sequencing recommendation (post config sidebar work)
Given the latest `App.tsx` changes, config overrides is now the single biggest, most cohesive subsystem, and it also has the strongest invariants. That makes it the best “first extraction” to reduce `App.tsx` size quickly while minimizing coupling risk.

Recommended order (conceptual):
1) Extract **config overrides** (CSS + templates + schema presentation + validate/narrow + JSON editor) as a unit.
2) Extract **browser runner** hook/client (worker lifecycle + request building + error normalization).
3) Extract **viz** host/builders (deck.gl canvas, layer registry/selection, legend derivation).
4) Extract **dump viewer** (folder picker + manifest decode) as its own mode.
5) Extract **app shell** (layout/markup) last, once the logic is out.

The layers below are still valid; treat them as a “mechanical move” checklist, but prefer starting with the config overrides slice even if it means doing “Layer 4.5” earlier than “Layer 2/3”.

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
Config overrides must scale to “many recipes” without the app architecture changing every time.

What exists today (and should be preserved):
- A schema-driven form (RJSF) is the primary editor; JSON textarea is the fallback.
- Schema “flattening” is presentation-only (collapse redundant wrappers, preserve the stage container).
- The runner request includes `configOverrides`; the worker deep-merges deterministically and validates via `normalizeStrict`.

What we should refactor toward (to satisfy “infinite recipes”):
- Make config overrides **recipe-agnostic**.
- Introduce a `RecipeId` and a recipe artifacts interface consumed by both UI + worker:
  - `id`, `title`
  - `defaultConfig`
  - `configSchema`
  - optional `presentationHints` (if needed to tune the schema flattening without changing config shape)
- The config overrides feature should operate on `(recipeId, baseConfig, schema, overrides)` as `unknown` at the boundary, and only narrow/validate using the recipe’s schema.

This turns “add a recipe” into a mechanical change:
- add a new recipe artifacts module (likely in `@mapgen/browser-recipes`)
- register it in a shared registry the app/worker can import
- no changes needed to the config overrides UI internals

Isolation plan (where the code should live after refactor):
- `features/config-overrides/model.ts` — state shape (enabled, tab, overrides source-of-truth) that supports multiple recipes
- `features/config-overrides/schema-presentation.ts` — wrapper collapsing + “transparent paths” logic (presentation-only)
- `features/config-overrides/form-templates.tsx` — RJSF templates (Object/Field/Array)
- `features/config-overrides/form-styles.ts` — current CSS blob (keep intact initially)
- `features/config-overrides/validate.ts` — parse JSON + validate/narrow + format errors (shared by UI + runner-start)

### 7.2.1 Protocol shape for “many recipes”
Today the browser runner protocol is effectively specialized around a single recipe/config type.
To scale to many recipes, we should expect to evolve the request envelope to include:
- `recipeId: RecipeId`
- `configOverrides?: unknown` (validated/narrowed against the recipe’s schema on both sides)

The app can still remain type-safe locally by narrowing `unknown` using the selected recipe’s artifacts; the protocol boundary should remain stable and not require UI/worker to share a giant union of every recipe config type.

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
  - preserves the config overrides presentation-only flattening behavior (stage container visible; redundant wrappers collapsed)
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
