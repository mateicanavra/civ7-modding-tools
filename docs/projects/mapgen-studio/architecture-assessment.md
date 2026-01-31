# MapGen Studio Architecture Assessment (React + Web Workers + deck.gl)

Date: 2026-01-31  
Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-EZRA-M1-mapgen-studio-arch-audit`  
Branch: `agent-EZRA-M1-mapgen-studio-arch-audit`

This is an **architecture / integration health assessment** of MapGen Studio as a browser-native pipeline runner + visualization engine.

Goal: identify the most impactful misuses / mismatches in our current React + worker + deck.gl integration, and outline a refactor direction that makes the system more reliable, modular, and scalable (performance + correctness), while preserving the “recipes + reroll” product loop.

Non-goals:
- This doc is not a full implementation plan, nor a full spec of future features.
- This doc does not propose visual design changes.

## Sources / context (read first)

- Capability + intent docs:
  - `docs/projects/mapgen-studio/BROWSER-RUNNER-V0.1.md`
  - `docs/projects/mapgen-studio/BROWSER-ADAPTER.md`
  - `docs/projects/mapgen-studio/resources/seams/SEAM-RECIPES-ARTIFACTS.md`
  - `docs/projects/mapgen-studio/resources/seams/SEAM-VIZ-DECKGL.md`
  - `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`
  - `docs/projects/mapgen-studio/reviews/REVIEW-M1.md`
- Investigation scratchpads captured verbatim:
  - `.scratch/agent-Ezra.scratch.md`
  - `.scratch/agent-alex-worker.scratch.md`
  - `.scratch/agent-bella-deckgl.scratch.md`
  - `.scratch/agent-cam-react.scratch.md`
  - `.scratch/agent-drew-modularity.scratch.md`

## Current architecture (what exists today)

### Primary dataflow (live runner)

At a high level, Studio is already shaped like the “pure browser pipeline” described in `docs/projects/mapgen-studio/BROWSER-RUNNER-V0.1.md`:

1. Main thread (React) starts a run with seed + config overrides.
2. Web Worker runs a bundled recipe and emits:
   - run lifecycle / step progress events
   - visualization layer upserts (`viz.layer.upsert`) containing metadata + binary payloads (typed arrays)
3. Main thread ingests those events into an in-memory “manifest/state”, then builds deck.gl `Layer[]`.
4. A deck.gl host renders those layers.

Current wiring (simplified):

```text
React (main thread)
  App.tsx
    -> Runner hook/controller
         -> WorkerClient (postMessage)
              -> pipeline.worker.ts (compile/run recipe)
                   -> trace + viz sink
                        -> postMessage(viz.layer.upsert, Transferables)
         <- Worker events
    -> Viz ingest/model (manifest + selection)
         -> Deck layer build (render.ts)
              -> Deck host (DeckCanvas.tsx) renders WebGL
```

Concrete entrypoints (today):
- UI orchestrator: `apps/mapgen-studio/src/App.tsx`
- Worker client: `apps/mapgen-studio/src/features/browserRunner/workerClient.ts`
- Worker protocol: `apps/mapgen-studio/src/browser-runner/protocol.ts`
- Worker implementation: `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts`
- Bundled recipe catalog (UI-safe artifacts): `apps/mapgen-studio/src/recipes/catalog.ts`
- Bundled recipe runtime selector (worker-only): `apps/mapgen-studio/src/browser-runner/recipeRuntime.ts`
- Main-thread ingest + render build: `apps/mapgen-studio/src/features/viz/useVizState.ts`, `apps/mapgen-studio/src/features/viz/deckgl/render.ts`
- Deck host: `apps/mapgen-studio/src/features/viz/DeckCanvas.tsx`

### Secondary dataflow (dump viewer)

Studio also supports a dump viewer path (folder / manifest replay) for inspection and regression workflows. This is valuable, but it introduces an important architectural tension:

- “Live runner” wants **high-frequency in-memory updates** and **low-latency UI**.
- “Dump viewer” wants **stable serialized artifacts** and **replay semantics**.

When the same types and reducers serve both, we need to be explicit about which behaviors are “live-only” (coalescing, lossy) vs “dump-accurate” (lossless, replay).

### State ownership (what should live where)

Today, some responsibilities are blurred (especially around ingest/render cadence). This is the clean target split:

| Concern | Owner (target) | Notes |
|---|---|---|
| Recipe runtime execution | Worker | CPU-heavy, deterministic, cancelable. |
| Run lifecycle + protocol | Runner controller (main) | Owns worker, cancellation, request ids, metrics. |
| Ingest model (layers manifest) | Viz store (main) | External store; RAF-gated commits for live runs. |
| User selection (step/layer) | Viz store (main) | Atomic with ingest updates; no render-time ref hacks. |
| Palette/legend UI state | React (main) | Cheap UI state. |
| Camera/viewState | Deck engine (main) | Avoid routing through React during interactions. |
| Deck layer instances | Deck engine + layer factory (main) | Caching + stable ids; updateTriggers for attribute recompute. |

## Observed problems (misuse / mismatch), ordered by leverage

This section is intentionally blunt: these are the issues that most threaten correctness, performance, modularity, and future evolution.

### 1) Worker boundary is not “systematized” yet (protocol, lifecycle, backpressure)

Symptoms:
- Protocol declares `run.cancel`, but worker does not implement cancellation handling (so “cancel” is effectively “terminate and restart worker”).
- Worker is recreated per run; cancellation works by hard-termination, not by a first-class cancel token.
- Worker can post many events (progress + multiple `viz.layer.upsert`), but main thread does not consistently gate/aggregate them to the browser’s render cadence.
- Worker copies buffers (clone then transfer) to avoid detaching engine-owned arrays; safe, but can add significant extra memory bandwidth cost for large layers.

Why this matters:
- Without a crisp “runner subsystem” contract, UI behavior becomes tightly coupled to accidental details: message ordering, event frequency, worker restarts, and buffer ownership quirks.
- Without backpressure, worker message rate can indirectly drive React updates and/or deck layer rebuilds (even if we try to abort/yield), creating jitter and hard-to-debug “sometimes slow” behavior.

Direction:
- Treat the worker integration as a subsystem with a stable protocol surface:
  - request/response ids
  - explicit cancellation semantics (cancel token, generation counters)
  - explicit “latest-only” vs “lossless” delivery guarantees
  - consistent “finished” / “failed” events (and ensure they always happen)

### 2) “Streaming ingest” and “deck layer building” are not cleanly separated

Symptoms:
- Worker events are reduced into a manifest, and then `renderDeckLayers` does heavy compute to turn those manifest entries into deck.gl layers.
- The heavy compute is not always aligned with user-visible needs (e.g., updates can trigger rebuilds even when the selected layer didn’t change, or when the change is irrelevant to the current view).
- There is abort/yield logic, but it is doing damage control: it’s still main-thread work under load.

Why this matters:
- This is the central performance risk area: if the pipeline becomes more instrumented (more layers), this architecture creates direct pressure on the UI thread.
- It also causes architecture drift: “manifest format” becomes defined by deck rendering concerns instead of being an engine-agnostic viz model.

Direction:
- Split into three explicit layers:
  1) `VizIngest` (event reducer): converts protocol events into a normalized in-memory model
  2) `VizStore` (delivery + scheduling): owns backpressure and notifies React/deck at controlled times
  3) `DeckLayerFactory` (render mapping): converts the active model (often only “selected layer + overlays”) into deck.gl layers with caching

### 3) Main-thread rendering build still has “heavy geometry churn” footguns

Symptoms (examples):
- Grid rendering uses polygons per tile (object arrays) and can be expensive to rebuild.
- Some mesh overlays are built from arrays that can be large and are rebuilt frequently.

Why this matters:
- Building large JS object graphs is one of the fastest ways to lose frame time in a WebGL app, even if the GPU work is fine.
- deck.gl can be fast, but only if data is stable and you avoid accidental recomputation.

Direction (progressive options):
- Near-term: cache geometry that is invariant per map size (hex grid) and per layer identity (segments/points); update only the color/value attributes when possible.
- Mid-term: replace polygon-per-tile with a more GPU-friendly approach:
  - a custom instanced hex layer, or
  - a texture/bitmap approach when acceptable (not always, given Civ’s hex geometry and picking needs).

### 4) React architecture has correctness hazards (StrictMode mismatch, ref mutation, selection drift)

Symptoms:
- Dev and prod semantics differ: React StrictMode is disabled in dev but enabled in prod (per notes in `apps/mapgen-studio/src/main.tsx`). This is high risk: StrictMode is where we see lifecycles and concurrency hazards early.
- Some refs that influence ingest/render decisions are mutated during render (a known StrictMode hazard).
- Selection state syncing is partially handled (step selection may update when fallback occurs; layer selection may not).
- `AppHeader` (and some panels) trend toward “god components” with prop drilling and boolean mode flags.

Why this matters:
- A pipeline UI must be robust under frequent state changes: reroll, resize, selection, palette changes, and fast streaming updates.
- Any StrictMode hazard or “render-time mutation” will surface as flaky, unreproducible UI bugs (especially once we turn StrictMode back on for dev).

Direction:
- Make StrictMode safe by construction:
  - no ref mutation during render
  - worker lifecycle managed by effects with cleanup
  - deck host created/disposed in effects, not in render paths
- Move complex UI surfaces to provider-driven composition (compound components / context) to reduce prop drilling and mode booleans.

### 5) Package boundaries are leaky (recipe runtime pulled into UI bundle)

Previously:
- Studio UI imported recipe runtime directly, which risked pulling heavy runtime code into the main bundle.
  (This was both a modularity smell and a bundle-size/perf risk.)

Why this matters:
- Bundle size (especially main thread) matters for fast iteration and for stable performance on mid-tier devices.
- The UI should depend on stable “recipe artifacts” (schema/defaults/metadata), not on runtime recipe code.

Current direction (implemented):
- Split “recipe artifacts for UI” from “recipe runtime for worker”:
  - UI imports JSON schema + defaults via `apps/mapgen-studio/src/recipes/catalog.ts` (artifacts-only).
  - Worker imports runtime modules via `apps/mapgen-studio/src/browser-runner/recipeRuntime.ts`.
  - Runner protocol includes `recipeId` so the worker can remain recipe-agnostic at the protocol boundary.
  - Lint rules prevent accidental UI imports of runtime recipe modules.

### 6) Specific correctness bugs are symptoms of the same architectural pressures

These are not “architecture” in isolation, but they are high-signal because they come from the same root causes (blurred boundaries, mixed responsibilities, missing invariants):

- Config overrides can crash due to a template rendering a raw object as a React child:
  - `apps/mapgen-studio/src/features/configOverrides/rjsfTemplates.tsx`
- Layer identity/selection can collide or desync:
  - layer key collisions (missing `fileKey`/`valuesPath` discriminator): `apps/mapgen-studio/src/features/viz/model.ts`
  - selection refs mutated during render (StrictMode hazard): `apps/mapgen-studio/src/features/viz/useVizState.ts`
- Dump viewer directory picker fallback can throw in browsers that only expose `values()`:
  - `apps/mapgen-studio/src/features/dumpViewer/pickers.ts`

Fixing these tactically is worthwhile, but the strategic fix is to (a) separate concerns and (b) enforce invariants (stable identity, StrictMode-safe lifecycles, single source of truth for selection + ingest).

## What’s working (keep / double down)

These are architecture choices that are directionally correct and worth preserving.

### Deck host uses core `Deck` (imperative), not `@deck.gl/react`

`apps/mapgen-studio/src/features/viz/DeckCanvas.tsx` uses core `Deck`. This is a good fit for our workload because it keeps camera/controller interactions out of React re-render loops.

Key invariant to preserve:
- React should be used to own “what to show” and high-level app state, but not to re-render the entire deck tree on every pointer move.

deck.gl-specific best-practice guardrails we should explicitly adopt:
- Stable `Layer.id` is non-negotiable (identity + state preservation).
- Keep `data` references stable unless semantics change; avoid inline `filter/map` in render paths.
- Use `updateTriggers` when accessors close over changing values.
- Keep `pickable: false` by default; enable only where needed.

### Typed arrays / binary attributes are already in play

Where we are already using typed arrays for points/segments, we are on the right path. This is the foundation for scaling up layer counts and dataset sizes.

### Viz metadata contract exists (use it more)

`VizLayerMeta` in `packages/mapgen-core/src/core/types.ts` (space, palette, categories, showGrid) is the correct place to capture “how should this layer be interpreted”.

The UI should depend on meta, not heuristics.

## Target architecture (recommended)

This is the architectural shape that best fits “agnostic recipe runner + browser viz engine”.

### Subsystems and responsibilities

1) Recipe Catalog (main thread, UI-safe)
- Owns: available recipe ids, schema/defaults artifacts, labels/groups, docs links.
- Does NOT import: recipe runtime code.

2) Runner Controller (main thread, compute boundary owner)
- Owns: worker lifecycle, request/response protocol, cancellation semantics, metrics.
- Exposes: `startRun({recipeId, seed, overrides})`, `cancelRun(runId)`, events stream.
- Guarantees: consistent run termination event, generation counters to ignore stale responses.

3) Viz Store (main thread, scheduling + derived state)
- Owns: ingest reducer, selection state, and backpressure/coalescing.
- Exposes: `useSyncExternalStore`-compatible subscribe/getSnapshot API for React.
- Commits: at most once per animation frame for “live updates” (unless explicitly in “lossless” mode).

4) Deck Engine (main thread, imperative WebGL host)
- Owns: `Deck` instance and interaction callbacks.
- Consumes: a small “render model” (selected layer + overlays + palette + viewport).
- Uses: caching and stable layer ids to avoid reallocations.

### Import direction (must be enforced)

Hard rule: UI must not import worker-only/runtime pipeline modules.

Suggested constraints:
- `apps/mapgen-studio/src/browser-runner/**` can import recipe runtime modules.
- `apps/mapgen-studio/src/**` (non-worker code) can only import recipe artifacts.
- Worker should avoid broad barrel imports (prefer narrow subpath exports).

Enforcement options:
- ESLint rules: forbid runtime recipe imports (e.g. `mod-swooper-maps/recipes/*`) outside worker-only files.
- Bundle policy check: explicitly scan main bundle and worker bundle separately (and name the check accordingly).

## Refactor slices (phased, stack-friendly)

These are intended as small, reviewable layers (Graphite-friendly), ordered by value/effort ratio.

### Slice 1: Make the runner contract real (protocol + cancellation + metrics)

- Implement `run.cancel` handling in the worker (even if we keep “terminate worker” as fallback).
- Add `requestId` / `runId` / `generation` semantics everywhere.
- Ensure `run.finished` fires exactly once per run, on both success and failure.
- Add lightweight metrics in events (durationMs, bytesOut).

### Slice 2: Introduce `VizStore` with RAF-gated commits (backpressure)

- Move ingest out of React state-chains into an external store.
- Coalesce worker events and commit only the latest state once per frame.
- Ensure selection state updates are atomic with manifest updates (no partial sync).

### Slice 3: Fix StrictMode hazards and align dev/prod semantics

- Remove render-time ref mutation patterns (move them to `useEffect` / `useLayoutEffect`).
- Make worker lifecycle StrictMode-safe (effects + cleanup).
- Re-enable StrictMode in dev once deck integration is safe; avoid “dev differs from prod”.

### Slice 4: ResizeObserver for viewport sizing

- Replace window-only resize handling with `ResizeObserver` on the actual container.
- Ensure deck is told the correct `width/height` and any “fit bounds” uses the same measured size.

### Slice 5: Split recipe artifacts from recipe runtime (bundle boundary)

- Export schema/defaults artifacts from the mod package (or a dedicated artifacts package).
- Update Studio UI to consume artifacts only.
- Add lint rules / checks to prevent UI importing recipe runtime modules.

### Slice 6: Rendering build performance (cache + GPU-friendly grid)

- Cache invariant geometry (hex grid vertices by map size) and reuse across runs.
- Consider a custom instanced hex layer to avoid polygon object churn.
- Ensure deck.gl layer ids are stable and updateTriggers are used where needed.

### Slice 7: Formalize “agnostic pipeline runner” plugin shape

- Make “runner” and “viz sink” pluggable, but with clear constraints:
  - worker-runner is the default implementation
  - dump-viewer is a different ingestion source
  - both feed the same `VizStore` API, but may choose different delivery guarantees

## Measurement plan (optional, but recommended before big refactors)

Before large refactors, we should quantify where time/memory goes so we can:
- validate that changes improve real bottlenecks
- detect regressions early

High-level plan is captured separately (next action after this doc).
