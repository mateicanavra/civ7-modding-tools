# MapGen Studio Roadmap

This roadmap describes the incremental path to a practical, external visualization workflow for Civ7 mapgen.

## Definitions (shared terminology)

- **VizSink**: the contract between mapgen execution and visualization. It is sink-driven (stream to UI, export to dump, ignore), not file-path driven.
- **DeckGlSink**: the primary VizSink implementation for MapGen Studio: Worker → in-memory data → deck.gl (no dump required for normal use).
- **Dump**: an *optional* export/replay artifact containing at minimum `manifest.json` and referenced payload files under `data/`. Dumps are valuable for tests, debugging, CI artifacts, and sharing — but are not required for in-browser visualization to function.
- **Layer**: a single visualizable artifact (grid/mesh/vector/points/polygons) described by the in-browser `VizSink` protocol and, when exported, by the dump manifest.
- **`layerId`**: stable identifier for a layer (recommended form: `<domain>.<name>`), used for UI selection and comparisons.
- **`runId` / `planFingerprint`**: identifiers for a particular execution; exact semantics must match the mapgen trace/plan implementation.
- **`outputsRoot`**: where dump folders are written *when dumps are enabled*. Dumps should not be required for the normal in-browser loop.

## North Star

MapGen Studio becomes the place to **run and inspect mapgen** via:
- a **fully in-browser pipeline** (Web Worker; no server round-trips),
- a **fast, rich viewer** (deck.gl) that renders from **in-memory data** streamed from the worker,
- optional export paths (dumps) for debugging, regression inspection, and sharing.

## V0 — Dump + deck.gl Viewer (Vertical Slice)

Goal: prove an export/replay workflow: **run once → produce dump artifact → view later**.

Implementation plan: `docs/projects/mapgen-studio/V0-IMPLEMENTATION-PLAN.md`.

### Deliverables

**1) Dump format + writer (pipeline-side)**
- A deterministic output folder per run:
  - `trace.jsonl` (events/spine; optional but recommended)
  - `manifest.json` (index of layers)
  - `data/*` (binary payloads + optional sidecars)
- Foundation-first: dump and visualize the plate-formation process “bottom-up”, capturing as many intermediate steps as practical.
- Minimum set (separate layers):
  - mesh (sites / adjacency where feasible)
  - plates (assignments + boundaries)
  - crust (cell-space + tile-space)

**2) MapGen Studio viewer MVP (browser-side)**
- Load a local/hosted dump folder (at minimum: `manifest.json`).
- Render multiple layer kinds as needed for Foundation (grid + points + segments).
- Minimal UI:
  - Layer picker
  - Step picker (plate formation process is step-by-step)
  - Legend/palette mapping for the layer
  - Fit-to-viewport / pan / zoom
  - Spatial reference background appropriate to the current view:
    - tile views: hex grid is visible (tile outlines)
    - mesh views: mesh edges + light dot grid so data does not “float” in empty space
    - (later) voronoi cell outlines when we can dump/derive polygons

**3) Operator workflow**
- A single command/workflow to produce a dump for a seed and open the viewer pointing at it.

### Acceptance Criteria
- A run dump can be produced deterministically for a given seed/plan.
- MapGen Studio can open that dump and render the grid layer reliably.
- The dump+viewer loop works without importing pipeline runtime code into the browser.

### Verification (V0)
- Producer: `manifest.json` is present and references at least one grid layer payload under `data/`.
- Viewer: MapGen Studio can load the dump and render the layer at correct dimensions with stable pan/zoom.
- Defaults: we typically validate on Civ7 **MAPSIZE_HUGE** (grid **106×66**).

### Non-goals (V0)
- Running the pipeline in-browser (Web Worker runner).
- Full step scrubbing, diffing runs, or deep layer taxonomy coverage.
- Complex geometry layers (rivers/paths/polygons/meshes) beyond the one proven slice.

## V0.1 — In-Browser Runner (Foundation First)

Goal: shift MapGen Studio from “replay viewer” to “run + inspect” for Foundation, entirely in the browser, with a pure Worker → in-memory → deck.gl loop.

Deliverables:
- Run Foundation in a Web Worker:
  - deterministic seed + MAPSIZE_HUGE 106×66 by default
  - progress reporting + cancellation
- Stream intermediate layers as steps run through `VizSink` (primary: `DeckGlSink`).
- Civ7-derived tables are bundled into the worker (generated offline from official resources).
- Optional export path (secondary): enable a `DumpSink` to produce a dump for tests/debug/sharing.

Design notes:
- Browser adapter capability spec: `docs/projects/mapgen-studio/BROWSER-ADAPTER.md`
- Worker runner design (V0.1): `docs/projects/mapgen-studio/BROWSER-RUNNER-V0.1.md`
- Current thin slice issue (implementation de-risker): `docs/projects/mapgen-studio/V0.1-SLICE-FOUNDATION-WORKER-DECKGL.md`

## V0.2 — In-Browser Runner (Full Pipeline)

Goal: run the full pipeline in-browser and keep the visualization surface coherent across phases.

Deliverables:
- Run stages beyond Foundation in the worker (Morphology → Placement).
- Define a stable in-browser “data products” interface between worker and viewer (`VizSink` + typed layer messages).
- Restore/extend visual reference layers per domain (tile vs mesh vs other spaces).

## Later (after the runner focus)

We are deferring the following (but keeping them in scope long-term):

### Replay/Exports + Sharing
- Keep “dump + replay” as an export mechanism from the in-browser runner (and/or from CLI runs).
- Shareable view state (deep links, presets).
- CI artifact integration (attach dumps to runs for regression inspection).

### Rich inspection
- Better legend/palette registry + hover inspection/value probe.
- Search and filters.
- Run comparison/diff tooling.

### Geometry deepening
- Vector/path and point layers beyond Foundation (rivers, faults, hotspots).
- Voronoi polygons / plate polygons where feasible (requires polygon geometry).
