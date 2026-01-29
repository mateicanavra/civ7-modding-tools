# V0.1 In-Browser Runner Design (Foundation First)

This document proposes the **V0.1 MapGen Studio runner**: run Foundation in a Web Worker and stream intermediate visualization layers to the existing deck.gl viewer.

## Goals (V0.1)

- Run the `foundation` recipe in a Web Worker with deterministic seed + config.
- Stream intermediate layers as steps run (no “dump folder” required for the main loop).
- Support progress reporting and cancellation.
- Reuse the existing `VizManifestV0` + layer schema where possible to minimize viewer changes.

## Non-goals (V0.1)

- Full `standard` recipe parity in-browser.
- Export/share workflows beyond a basic “download dump” (defer to later).

## High-level architecture

- **Main thread (React app):**
  - Owns UI state (selected layers, palette, viewport, step picker).
  - Starts/cancels runs.
  - Maintains an in-memory `VizManifestV0` + `FileMap` compatible with the existing viewer loader.

- **Worker:**
  - Runs `foundationRecipe.compile(...)` and `foundationRecipe.run(...)`.
  - Owns a browser-safe `EngineAdapter` instance (V0.1 can be `createMockAdapter(...)`-based).
  - Emits:
    - progress events (step start/end, timings)
    - visualization layer payloads (grid/points/segments)
    - optional trace events (debug)

## Reusing the existing dump/viewer contract

MapGen Studio already understands:
- a `manifest.json`-shaped object (`VizManifestV0`)
- layer entries that reference binary payload paths under `data/*.bin`
- a “file map” of `path → File` (from directory upload)

V0.1 can keep this contract by treating the worker output as a **live dump**:

- Worker generates the same `VizLayerEntryV0` entries with deterministic `data/...` paths.
- Worker transfers the binary payload bytes for each referenced path.
- Main thread constructs `File` objects for each payload and inserts them into the `FileMap`.
- Main thread updates the in-memory `VizManifestV0` (steps + layers) and re-renders.

This avoids redesigning the viewer just to support streaming.

## Worker message protocol (proposal)

### Requests (main → worker)

- `run.start`
  - `recipeId`: `"foundation"`
  - `seed`: number
  - `dimensions`: `{ width, height }`
  - `latitudeBounds`: `{ topLatitude, bottomLatitude }`
  - `config`: recipe config input (V0.1: `{ foundation: {...} }`)
  - `trace`: `{ enabled: boolean; steps?: Record<string, \"verbose\" | \"normal\"> }`
- `run.cancel`
  - `runId` (or a client-generated token)

### Events (worker → main)

- `run.started`
  - `runId`, `planFingerprint`, `recipeId`, `dimensions`
- `run.progress`
  - `kind`: `"step.start" | \"step.end\"`
  - `stepId`, `phase?`, `stepIndex`
  - `timingMs?`
- `dump.step`
  - `{ stepId, phase?, stepIndex }`
- `dump.layer`
  - `entry`: `VizLayerEntryV0`
  - plus one or more payload blobs (as transferables):
    - `path` + `ArrayBuffer` for grids
    - `positionsPath`/`segmentsPath` + `ArrayBuffer`
    - optional `valuesPath` + `ArrayBuffer`
- `run.finished`
  - `runId`
- `run.error`
  - `runId?`, `message`, `stack?`

## Determinism and replay guarantees (V0.1)

V0.1 should guarantee:
- Given identical `{ seed, dimensions, latitudeBounds, recipe config }`, the worker produces:
  - the same `planFingerprint`
  - the same `runId`
  - the same sequence of `dump.layer` payloads

Practical requirements:
- Use `ctxRandom(...)` consistently (already true for Foundation).
- Ensure adapter `getRandomNumber(max,label)` is a pure function of `(seed,label)` (or equivalent deterministic strategy).
- Avoid non-deterministic sources in worker (Date/Math.random without seeding).

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
  - minimal index tables (or accept the mock defaults if they match required constants)

### Trace + viz plumbing

Implement two worker-local components:

- **`VizDumper` (browser)**
  - Produces the same `layer.dump` trace payloads as `mods/mod-swooper-maps/src/dev/viz/dump.ts`
  - Instead of writing files, it:
    - assigns deterministic `data/*.bin` paths
    - copies the bytes into fresh `ArrayBuffer`s
    - posts `dump.layer` events with both the manifest entry and the transferred bytes

- **`TraceSink` (browser)**
  - Receives `TraceEvent`s
  - Maintains step index assignment and a `VizManifestV0` in memory
  - Emits incremental `dump.step` / `run.progress` events

This keeps generation code unchanged: Foundation steps already call `context.viz?.dumpPoints(...)` / `dumpSegments(...)`.

## Known bundling constraints (must avoid)

- Never import `@civ7/adapter/civ7` (it imports Civ7 `/base-standard/...` runtime modules).
- Never import mod dev tooling (`mods/mod-swooper-maps/src/dev/viz/*`) into the browser bundle (it uses `node:fs`, `node:path`, `Buffer`, `process`).
- Avoid importing `packages/mapgen-core/src/authoring/maps/index.ts` in the browser (it assumes Civ7 globals like `engine` + `GameplayMap`).

## V0.1 “minimal changes needed” checklist

- Add a worker entry in MapGen Studio that can import and execute the Foundation recipe.
- Add worker/main protocol types and wiring.
- Add browser implementations of `VizDumper` + `TraceSink` that stream layers into the existing viewer’s `VizManifestV0` + `FileMap` model.
- Add UI controls: seed, run, cancel, “verbose steps” toggle, and a basic progress indicator.

