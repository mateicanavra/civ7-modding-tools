# Status: Project doc (MapGen Studio)

This page is **not** canonical MapGen documentation.

Canonical entrypoints:
- `docs/system/libs/mapgen/MAPGEN.md`
- `docs/system/libs/mapgen/reference/STUDIO-INTEGRATION.md`
- `docs/system/libs/mapgen/reference/VISUALIZATION.md`
- `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`

# V0.1 In-Browser Runner Design (Foundation First, Pure Browser Pipeline)

This document proposes the **V0.1 MapGen Studio runner**: run the `browser-test` recipe (currently Foundation-only) entirely in a Web Worker and stream visualization outputs **directly** into deck.gl as in-memory data.

“Dumps” (folders containing `manifest.json` + binaries) remain valuable, but are explicitly **optional**: debug, tests, and export/sharing — not the core runtime mechanism for the normal browser loop.

## Goals (V0.1)

- Run the `browser-test` recipe (currently Foundation-only) end-to-end in a Web Worker with deterministic seed + config.
- Stream intermediate visualization layers as steps run via a first-class `VizSink` interface:
  - primary sink: `DeckGlSink` (Worker → in-memory → deck.gl)
  - optional sink: `DumpSink` (export/debug/tests)
- Support progress reporting and cancellation.
- Treat Civ7-derived tables (terrain/biome/feature indices, map sizes, etc.) as **bundled data packages** imported by the worker (no runtime fetching).

## Non-goals (V0.1)

- Full `standard` recipe parity in-browser.
- Perfect 1:1 Civ7 engine parity for engine-coupled calls (e.g., `buildElevation`, `recalculateAreas`, `validateAndFixTerrain`).
- Polished export/sharing UX (dump zip, OPFS persistence, etc.) beyond a minimal proof if needed.

## Core concepts

### `VizSink` (first-class)

`VizSink` is the contract between mapgen execution and visualization. It is intentionally **not** file-path based.

The worker runner provides a `VizSink` to the pipeline so steps can emit visualization products as they run. The sink implementation decides whether those products:
- are streamed live to the UI (`DeckGlSink`), or
- are written/packaged as a dump (`DumpSink`), or
- are ignored (`NullSink`).

Note: some existing instrumentation APIs use “dump” naming (e.g. `context.viz?.dumpPoints(...)`). In the pure browser pipeline, “dump” should be understood as “emit a visualization layer” — the naming can be cleaned up later without changing semantics.

### `DeckGlSink` (primary path)

`DeckGlSink` streams layer payloads from the worker to the main thread, where the React app maintains deck.gl layers directly from in-memory data.

Design constraints:
- Payloads should use transferables (e.g., `ArrayBuffer`) when large.
- Layer descriptors must have stable identifiers (`layerId`, `stepId`, etc.) so the UI can select/scrub/compare deterministically.
- Layer descriptors may include optional visualization metadata (`label`, `group`, `visibility`, `categories`) to improve UI readability without changing underlying data.
- The protocol must be versioned.

### `DumpSink` (optional path)

`DumpSink` is an *optional* sink that produces a replayable dump format for:
- regression testing fixtures
- sharing runs outside the live UI
- offline inspection

It should not be required for deck.gl rendering to function.

## High-level architecture

- **Main thread (React app):**
  - Owns UI state (selected layers, palette, viewport, step picker).
  - Starts/cancels runs.
  - Receives `viz.layer.upsert` events and updates in-memory layer state.
  - Renders deck.gl layers from in-memory layer state (no `manifest.json` required).

- **Worker:**
  - Runs `foundationRecipe.compile(...)` and `foundationRecipe.run(...)`.
  - Owns a browser-safe `EngineAdapter` instance (V0.1 can be `createMockAdapter(...)`-based).
  - Imports Civ7-derived tables as bundled modules.
  - Emits:
    - progress events (step start/end, timings)
    - visualization layer payloads via `VizSink`
    - optional debug trace events

## Recipe packaging and configurability (current posture)

### Bundled recipes (today)

In V0.1, recipes are **bundled into the Web Worker** as normal TS/ESM modules. This means:
- No server round-trips are required to “load” a recipe at runtime.
- Configuration can still be **provided at runtime** (UI → Worker message) and passed into `recipe.compile(env, config)` / `recipe.run(ctx, env, config, ...)`.

This is the recommended posture for early slices because it keeps the browser runner self-contained and minimizes new infrastructure.

### Runtime-loadable recipes (later; requires new architecture)

If we want “drop in a recipe without rebuilding” (e.g., OPFS import, drag-and-drop, etc.) in a fully browser-based setup, we will need a different mechanism than bundling TS modules, such as:
- a **serialized recipe IR** + interpreter in the worker, or
- dynamic module loading (which typically implies an HTTP URL, or more complex bundler/runtime support).

This is explicitly not required for V0.1 slices. Treat it as a later capability once pipeline coverage justifies it.

### Standard recipe as an export target

It is feasible to bundle the full `standard` recipe and still allow runtime config overrides. However:
- Running the full `standard` recipe in-browser also depends on BrowserAdapter capabilities beyond V0.1 (engine-coupled calls and additional Civ tables), so bundling it does not imply it will execute successfully yet.

## Worker message protocol (proposal)

### Requests (main → worker)

- `run.start`
  - `recipeId`: `"foundation"`
  - `seed`: number
  - `mapSizeId`: Civ7 map size id (e.g., `MAPSIZE_HUGE`) and derived `dimensions`
  - `dimensions`: `{ width, height }`
  - `latitudeBounds`: `{ topLatitude, bottomLatitude }`
  - `config`: recipe config input (V0.1: typically `browser-test` with explicit defaults + optional overrides)
  - `trace`: `{ enabled: boolean; steps?: Record<string, "verbose" | "normal"> }`
- `run.cancel`
  - `runId` (or a client-generated token)

### Events (worker → main)

- `run.started`
  - `runId`, `planFingerprint`, `recipeId`, `dimensions`
- `run.progress`
  - `kind`: `"step.start" | "step.end"`
  - `stepId`, `phase?`, `stepIndex`
  - `timingMs?`
- `viz.layer.upsert`
  - `descriptor`: stable metadata (id, kind, space, dims, palette hints, tags)
  - `payload`: kind-specific payload, using transferables for large buffers
- `run.finished`
  - `runId`
- `run.error`
  - `runId?`, `message`, `stack?`

### Layer payloads (V0.1 minimum)

V0.1 should support only what Foundation needs to prove the end-to-end loop. The exact set is allowed to start small (1–2 layers).

Recommended “minimal” layer kinds:
- `grid.tile` (tile-space scalar field, e.g. plate id / crust classification)
- `points.mesh` (mesh-space points with optional scalar attributes)
- `segments.mesh` (mesh-space line segments)

Protocol guidance:
- Keep descriptors small and stable; avoid duplicating large derived geometry.
- Prefer sending numeric arrays and reconstructing deck.gl-friendly structures on the main thread when feasible.

## Determinism and replay guarantees (V0.1)

V0.1 should guarantee:
- Given identical `{ seed, dimensions, latitudeBounds, recipe config }`, the worker produces:
  - the same `planFingerprint`
  - the same `runId`
  - the same sequence of layer descriptors (`layerId`, `stepIndex` ordering)
  - payload buffers that are byte-identical (where possible)

Practical requirements:
- Use `ctxRandom(...)` consistently (already true for Foundation).
- Ensure adapter `getRandomNumber(max,label)` is deterministic.
- Avoid non-deterministic sources in worker (Date/Math.random without seeding).

Replay/export posture:
- The primary “replay” mechanism for the browser loop is re-running deterministically from `{ seed, config }`.
- Dumps are an optional export/debug artifact produced by `DumpSink` (not required to render).

## Minimal implementation approach (no pipeline refactors)

### Adapter choice (V0.1)

Foundation requires only:
- deterministic `getRandomNumber`
- terrain/biome/feature name→index lookups during context creation

The simplest V0.1 posture is:
- use `createMockAdapter({ ... })` from `@civ7/adapter`
- provide:
  - `width`, `height`
  - a browser-safe `rngFn(max,label)` implementation
  - Civ7-derived index tables from bundled data packages (see `BROWSER-ADAPTER.md`)

### Visualization plumbing (worker-local)

Implement worker-local sinks:

- **`DeckGlSink` (worker)**
  - Converts pipeline visualization calls (e.g., `dumpPoints`, `dumpSegments`) into `viz.layer.upsert` messages.
  - Transfers large buffers using `postMessage(..., [arrayBuffer])`.

- **`DumpSink` (worker; optional)**
  - Converts the same visualization calls into a dump format (e.g., `manifest.json` + binaries),
    but only when explicitly enabled (debug/tests/export).
  - May share conversion code with `DeckGlSink` (descriptor + payload encoding).

This keeps generation code unchanged: Foundation steps already call `context.viz?.dumpPoints(...)` / `dumpSegments(...)`.

## Civ7-derived tables (bundled, no runtime fetch)

V0.1 should assume:
- Civ7 resource XML is extracted offline via scripts.
- Output tables are checked into the repo (or generated as part of the build) as TS/JSON modules.
- The worker imports these modules directly (no runtime HTTP fetch, no Studio-provided injection).

This allows browser runs to be self-contained and consistent across deployments.

## Known bundling constraints (must avoid)

- Never import `@civ7/adapter/civ7` (it imports Civ7 `/base-standard/...` runtime modules).
- Never import mod dev tooling (`mods/mod-swooper-maps/src/dev/viz/*`) into the browser bundle (it uses `node:fs`, `node:path`, `Buffer`, `process`).
- Avoid importing `packages/mapgen-core/src/authoring/maps/index.ts` in the browser (it assumes Civ7 globals like `engine` + `GameplayMap`).

## V0.1 “minimal changes needed” checklist

- Add a worker entry in MapGen Studio that can import and execute the `browser-test` recipe (Foundation-only).
- Add worker/main protocol types and wiring (including `viz.layer.upsert`).
- Add a `VizSink` abstraction with at least `DeckGlSink` implemented; keep `DumpSink` optional/behind a flag.
- Add UI controls: seed, run, cancel, and a basic progress indicator.
