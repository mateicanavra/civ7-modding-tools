# V0.1 In-Browser Runner Design (Foundation First, Pure Browser Pipeline)

This document proposes the **V0.1 MapGen Studio runner**: run the Foundation recipe entirely in a Web Worker and stream visualization outputs **directly** into deck.gl as in-memory data.

“Dumps” (folders containing `manifest.json` + binaries) remain valuable, but are explicitly **optional**: debug, tests, and export/sharing — not the core runtime mechanism for the normal browser loop.

## Goals (V0.1)

- Run the `foundation` recipe end-to-end in a Web Worker with deterministic seed + config.
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

## Worker message protocol (proposal)

### Requests (main → worker)

- `run.start`
  - `recipeId`: `"foundation"`
  - `seed`: number
  - `dimensions`: `{ width, height }`
  - `latitudeBounds`: `{ topLatitude, bottomLatitude }`
  - `config`: recipe config input (V0.1: `{ foundation: {...} }`)
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

- Add a worker entry in MapGen Studio that can import and execute the Foundation recipe.
- Add worker/main protocol types and wiring (including `viz.layer.upsert`).
- Add a `VizSink` abstraction with at least `DeckGlSink` implemented; keep `DumpSink` optional/behind a flag.
- Add UI controls: seed, run, cancel, and a basic progress indicator.
