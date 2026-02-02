# MapGen Studio: `App.tsx` Refactor Plan

This document is a **comprehensive plan** to refactor `apps/mapgen-studio/src/App.tsx` into a structure that is:
- **Readable** (clear “what lives where”)
- **Stable** (low-risk extractions first; minimal behavioral churn)
- **Aligned with our direction** (browser runner, worker→deck.gl streaming, `VizSink`, optional dump replay)
- **Not prematurely locking in** the final long-term feature/routing/state architecture

It is intentionally written to be **updated** as more upstack work lands (especially around config overrides / nodes).

Execution-grade companion (sliceable PR plan with acceptance criteria + verification):
- `docs/projects/mapgen-studio/resources/APP-TSX-REFACTOR-EXECUTION.md`

Update note (2026-01-29):
- `App.tsx` has expanded substantially (config overrides sidebar polish, schema presentation helpers, CSS, templates).
- Recipe artifacts for Studio are now built from `mods/mod-swooper-maps` and imported via `mod-swooper-maps/recipes/*`.
- Viz layers now carry embedded metadata (`meta?: VizLayerMeta`) for **labeling**, **legend/palette categories**, and **visibility** (default/debug/hidden). The UI derives labels/legend/colors from `meta` rather than maintaining a separate “contract vs internal” catalog.
- Treat “infinite recipes” as a hard requirement: adding new recipes should be a mechanical registration/artifacts task, not an app re-architecture.

Related context:
- Architecture spike: `docs/projects/mapgen-studio/resources/SPIKE-mapgen-studio-arch.md`
- V0.1 runner spec: `docs/projects/mapgen-studio/BROWSER-RUNNER-V0.1.md`
- Browser adapter surface: `docs/projects/mapgen-studio/BROWSER-ADAPTER.md`
- V0.1 slice: config overrides UI→worker: `docs/projects/mapgen-studio/V0.1-SLICE-CONFIG-OVERRIDES-UI-WORKER.md`
- Viz layer metadata source: `packages/mapgen-core/src/core/types.ts` (`VizLayerMeta`) and `packages/mapgen-core/src/dev/viz-meta.ts` (helpers for defining meta)
- Roadmap: `docs/projects/mapgen-studio/ROADMAP.md`

---

## 1) Current state: what `App.tsx` owns today

`apps/mapgen-studio/src/App.tsx` is currently a single-file “vertical slice” that mixes:

### A) App/state orchestration
- Top-level modes: `"browser"` (worker runner) vs `"dump"` (replay viewer).
- UI state: selected step/layer, view state (pan/zoom), toggles (edge overlay, background grid).
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
- **Layer-list UX**:
  - layer picker labels use `layer.meta?.label ?? layer.layerId`
  - `layer.meta?.visibility === "debug"` is surfaced in UI labeling (current behavior: suffix `", debug"`), but layers are not filtered by visibility yet
  - when `layer.meta?.categories` exists, legend and colors are categorical (meta-driven), otherwise fall back to heuristic legends (landmask/height/plates/etc.)
- **Config overrides UX**:
  - schema-driven form is primary
  - JSON editor is a fallback/advanced path
  - schema wrapper collapsing is presentation-only and must not change config shape
  - the top-level stage container remains visible and is not collapsed away
- **No import cycles**: keep the layering acyclic; runner/protocol and viz/ui concerns must not tangle.

### What we should not do in this refactor
- Introduce Tailwind/shadcn/ui in the same change (plan for it; don’t couple it).
- Re-architecture into a full feature-sliced app + router + global store (that’s a larger step).
- Extract additional new monorepo packages (`packages/mapgen-viz`, etc.) as part of the first refactor. (We should plan for it, but the first move should be internal extraction; recipe artifacts already exist via `mod-swooper-maps/recipes/*`.)

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

### Recommendation (updated): feature-based modules now
We now have enough real surface area (browser runner, dump viewer, config overrides, viz host) that a **feature-based** layout is the least risky long-term move and reduces cross-branch conflicts. This does **not** force routing or a global store; it just gives us stable seams.

Proposed near-term layout (inside the app):

```text
apps/mapgen-studio/src/
  App.tsx                     # shrinks to composition/wiring
  main.tsx

  app/                        # layout + global surfaces (no domain logic)
    AppShell.tsx
    Layout.tsx
    ErrorBanner.tsx

  features/
    appShell/                 # (optional) header/control bar pieces
    browserRunner/            # worker client + run orchestration + retention rules
    configOverrides/          # schema-driven form + JSON editor + presentation rules
    dumpViewer/               # folder picker + manifest decode + dump reader
    viz/                      # viz model + layer registry + deck.gl renderer

  shared/                     # small cross-feature helpers only
    errors.ts
    hooks.ts
    types.ts

  browser-runner/             # worker entry + protocol (already exists)
    pipeline.worker.ts
    protocol.ts
    worker-trace-sink.ts
    worker-viz-dumper.ts
```

Dependency rules (keep the graph acyclic):
- `app/*` composes `features/*` and may depend on `shared/*`.
- `features/*` may depend on `shared/*`.
- `features/viz/*` consumes runner outputs via a narrow, runner-agnostic event model; avoid importing runner internals.
- `browser-runner/*` (worker + protocol) must not import from React/app/features.
- If code needs to run on both UI and worker sides, keep it in a **pure TS** module (no DOM, no React) and ensure the worker bundle check still passes.

`mod-swooper-maps/recipes/*` is a critical input to this structure:
- Treat “recipes” as **artifacts** (`recipeId`, `configSchema`, `defaultConfig`, metadata), not as a “special case” hard-coded into the app.
- The config overrides feature must be recipe-agnostic so “add a recipe” is a mechanical registration/artifacts task, not an app re-architecture.

---

## 5) Seam inventory (what we’re extracting) + reference docs

The seam investigations are captured verbatim (from sub-agents) here:
- `docs/projects/mapgen-studio/resources/seams/SEAM-APP-SHELL.md`
- `docs/projects/mapgen-studio/resources/seams/SEAM-BROWSER-RUNNER.md`
- `docs/projects/mapgen-studio/resources/seams/SEAM-CONFIG-OVERRIDES.md`
- `docs/projects/mapgen-studio/resources/seams/SEAM-DUMP-VIEWER.md`
- `docs/projects/mapgen-studio/resources/seams/SEAM-RECIPES-ARTIFACTS.md`
- `docs/projects/mapgen-studio/resources/seams/SEAM-VIZ-DECKGL.md`

This plan references them for detailed “don’t break” constraints and proposed module APIs.

---

## 6) Migration plan (how to execute the refactor safely)

This should be done as a **stack of small PRs** (Graphite-friendly), each with a tight diff.

### 6.1 Recommended sequencing (updated with latest `App.tsx`)
Given the latest `App.tsx` changes, config overrides is now the single biggest, most cohesive subsystem, and it also has the strongest invariants. That makes it the best “first extraction” to reduce `App.tsx` size quickly while minimizing coupling risk.

Recommended order (conceptual):
1) Extract **config overrides** (CSS + templates + schema presentation + validate/narrow + JSON editor) as a unit.
2) Extract **browser runner** hook/client (worker lifecycle + request building + retention semantics + error normalization).
3) Extract **viz** state + deck.gl renderer (layer registry/selection, legend derivation, rendering adapters).
4) Extract **dump viewer** (folder picker + manifest decode + dump reader) as its own mode.
5) Extract **app shell** (layout/markup) last, once the logic is out.

### 6.2 What each extraction should look like (target module boundaries)

#### A) `features/configOverrides/*`
Primary reference: `docs/projects/mapgen-studio/resources/seams/SEAM-CONFIG-OVERRIDES.md`.

High-level split:
- `features/configOverrides/shared/*` (worker-safe, pure TS)
  - schema normalization helpers used by the form and/or worker (if needed)
  - JSON parse + strict validate/narrow wrappers (`normalizeStrict`)
- `features/configOverrides/ui/*` (React + RJSF + CSS blob)
  - panel + tab switch + templates + CSS (move as a unit)
- `features/configOverrides/useConfigOverrides.ts` (feature state machine)

Do **not** change behavior:
- UI currently starts from a full base config object, while the worker treats `configOverrides` as a patch merged into `defaultConfig` (arrays replace, objects deep-merge). Preserve this behavior in the refactor; any shift to “pure patch editing” should be an explicit later decision.
- schema wrapper collapsing is presentation-only (stage container preserved)
- JSON tab blocks running when invalid; form tab may rely on worker validation
- worker remains the authority for merge semantics and final strict validation

#### B) `features/browserRunner/*`
Primary reference: `docs/projects/mapgen-studio/resources/seams/SEAM-BROWSER-RUNNER.md`.

Key design constraints to preserve:
- cancel semantics are currently “hard terminate” (`worker.terminate()`); `run.cancel` exists in the protocol but is not handled by the worker today
- rerun retention uses pinned selection refs with an explicit “pending” UX while streaming

Target modules:
- `features/browserRunner/workerClient.ts` (non-React wrapper around worker + run token filtering)
- `features/browserRunner/useBrowserRunner.ts` (React hook exposing state + start/cancel)
- `features/browserRunner/retention.ts` (pinning rules; isolate the subtle semantics so they’re testable)
- `features/browserRunner/adapter.ts` (maps `BrowserRunEvent` → runner-agnostic `VizEvent` for viz ingestion)

#### C) `features/viz/*`
Primary reference: `docs/projects/mapgen-studio/resources/seams/SEAM-VIZ-DECKGL.md`.

Target architecture:
- define a runner-agnostic `VizEvent` ingest model
- maintain a normalized “layer registry” keyed by a unique `layerKey` (prefer protocol-provided identity; avoid recomputing a lossy key)
- isolate deck.gl rendering as an adapter layer
- treat **`VizLayerMeta`** as the first-class presentation surface:
  - label/group/description/visibility/categories should be taken from `layer.meta` when present
  - keep fallback heuristics (string-based rules) as a compatibility layer, not the primary source of truth

Target modules:
- `features/viz/model.ts` (normalized types: run/step/layer/selection/legend, `VizEvent`)
- `features/viz/ingest.ts` (reducer that applies `VizEvent`s; indexes by `layerKey`)
- `features/viz/registry.ts` (layer semantics, coordinate space, palette/legend rules)
- `features/viz/deckgl/render.ts` (pure mapping from state+registry+resolver → deck.gl layers)
- `features/viz/useVizState.ts` (ties ingest + selection + view fitting together)

Keep an eye on drift:
- today `App.tsx` duplicates viz types that also exist in worker/protocol; the refactor should consolidate this to a single source of truth on the UI side.

#### D) `features/dumpViewer/*`
Primary reference: `docs/projects/mapgen-studio/resources/seams/SEAM-DUMP-VIEWER.md`.

Target:
- separate “dump IO” (pick folder / build index / parse manifest / read payload by path) from viz rendering
- explicitly preserve “strip one leading segment” aliasing behavior (and decide how to surface collisions)

Target modules:
- `features/dumpViewer/pickers.ts` (directory picker + webkitdirectory ingestion)
- `features/dumpViewer/fileIndex.ts` (alias policy and collision detection)
- `features/dumpViewer/manifest.ts` (parse + minimal validation)
- `features/dumpViewer/reader.ts` (`DumpReader` interface for payload reads)
- `features/dumpViewer/useDumpLoader.ts` (React state machine)

#### E) `app/*` + `features/appShell/*`
Primary reference: `docs/projects/mapgen-studio/resources/seams/SEAM-APP-SHELL.md`.

Goal:
- stop mixing shell concerns (layout/overlays/global errors) with runner/viz/config logic
- make overlay placement a “shell provides slots; features provide bodies” policy

Target modules:
- `app/Layout.tsx` (overlay slots + z-index policy)
- `app/ErrorBanner.tsx` (render-only)
- `app/AppShell.tsx` (hosts mode selection until we introduce a router)

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
- add a new recipe artifacts module (today: under `mods/mod-swooper-maps/src/recipes/*`, exported via `mod-swooper-maps/recipes/*`)
- register it in a shared registry the app/worker can import
- no changes needed to the config overrides UI internals

Isolation plan (where the code should live after refactor):
- `features/configOverrides/model.ts` — state shape (enabled, tab, overrides source-of-truth) that supports multiple recipes
- `features/configOverrides/schemaPresentation.ts` — wrapper collapsing + “transparent paths” logic (presentation-only)
- `features/configOverrides/rjsfTemplates.tsx` — RJSF templates (Object/Field/Array)
- `features/configOverrides/formStyles.ts` — current CSS blob (keep intact initially)
- `features/configOverrides/validate.ts` — parse JSON + validate/narrow + format errors (shared by UI + runner-start)

### 7.2.1 Protocol shape for “many recipes”
Today the browser runner protocol is effectively specialized around a single recipe/config type.
To scale to many recipes, we should expect to evolve the request envelope to include:
- `recipeId: RecipeId`
- `configOverrides?: unknown` (validated/narrowed against the recipe’s schema on both sides)

Recommended reference for the “infinite recipes” registry shape (lazy loaders, artifacts interface, protocol-agnostic boundary):
- `docs/projects/mapgen-studio/resources/seams/SEAM-RECIPES-ARTIFACTS.md`

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
- `bunx turbo run build --filter=mapgen-studio`
  - ensures TS + Vite build + worker bundling check still pass
- `bun run dev:mapgen-studio`
  - manual smoke:
    - start browser run and observe 1–2 layers stream
    - reroll seed; confirm selection behavior
    - open dump folder; confirm rendering and selection

If we add any new helper modules:
- ensure they are browser-safe (no Node APIs)
- ensure `tsconfig` strictness passes (`noUnusedLocals`, etc.)

---

## 10) Suggested follow-up: “graduation” path after internal refactor

Once config overrides and another viz domain land (i.e., the app has 2–3 real “modes”), we should graduate from “mode state in `AppShell`” into:
- a router (likely TanStack Router), with explicit pages: `/browser`, `/dump`, etc.
- a small store (likely Zustand) only where cross-mode coordination is painful
- eventual extraction of long-lived libraries (e.g. `packages/mapgen-viz`, `packages/mapgen-browser-runner`) once the seams are stable

That is the point where router + global store become high-leverage rather than premature.
