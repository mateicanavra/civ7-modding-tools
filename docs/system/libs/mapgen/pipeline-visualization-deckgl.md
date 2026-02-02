<toc>
  <item id="definitions" title="Definitions"/>
  <item id="spaces" title="Coordinate spaces"/>
  <item id="purpose" title="Purpose"/>
  <item id="trace" title="Trace posture (current)"/>
  <item id="architecture" title="System architecture"/>
  <item id="primitives" title="Viz primitives (implemented)"/>
  <item id="taxonomy" title="Layer taxonomy"/>
  <item id="viewer" title="Viewer design (implemented)"/>
  <item id="changes" title="Future enhancements"/>
  <item id="verification" title="Verification"/>
  <item id="questions" title="Open questions"/>
</toc>

# Pipeline Visualization (deck.gl)

> **System:** Mapgen diagnostics and external visualization.
> **Scope:** Capture per-step artifacts/buffers as streaming upserts and/or replayable dumps and render them in a deck.gl viewer.
> **Status:** Canonical (current; implementation + conventions)

## Definitions

- **Dump folder**: replayable output containing `manifest.json` plus payloads under `data/`.
- **`outputsRoot`**: where dump folders are written (implementation chooses the root; the contract only assumes a per-run folder containing `manifest.json`).
- **`runId`**: run identity used by trace/dumps. Current implementation: `runId === planFingerprint`.
- **`planFingerprint`**: plan identity (hash of plan inputs); see `packages/mapgen-core/src/engine/observability.ts`.
- **`dataTypeKey`**: stable semantic identity for a data product (e.g. `"hydrology.wind.wind"`).
- **`layerKey`**: canonical, opaque identity for a layer within a run (used for streaming upserts and dump replay identity).
- **`spaceId`**: explicit coordinate space (“projection” selector in the Studio UI).

## Coordinate Spaces (critical for “why does it look rotated?”)

Mapgen produces data in multiple coordinate systems. The viewer must not “guess” a single space.

### Tile space (game map grid)

- Discrete tiles: `(x, y)` where `0 ≤ x < width`, `0 ≤ y < height`.
- For Civ7, tiles are hexes; MapGen Studio renders tile grids as **pointy-top, row-offset** hexes (“Civ-like wide map”).
- Typical tile-space tensors: `foundation.plates.tile*`, `foundation.crustTiles.*`.

### Mesh space (foundation “plates mesh”)

- A set of irregular sites (points) plus adjacency relationships; this is built via a **Delaunay/Voronoi-style construction**:
  - Delaunay edges define neighbor connectivity.
  - Voronoi cells are the dual partition of space around sites.
- In this codebase, the “mesh” artifact currently dumps:
  - site coordinates (`siteX/siteY`)
  - neighbor connectivity (`neighborsOffsets` + `neighbors` CSR)
  - derived per-cell fields (crust/tectonics/etc)
- **Important:** mesh-space coordinates are not the same as tile `(x, y)` coordinates. If you plot mesh points in tile space, the result will look skewed/rotated.

### Projection (mesh → tile)

- A dedicated step (Foundation `projection`) produces `tileToCellIndex` (nearest cell per tile).
- Tile-space arrays derived from mesh-space arrays must use this mapping to “sample” mesh fields into tile fields.

## Purpose

We want a **diagnostics + visualization system** that can:
- stream layers during live runs (Studio), and/or
- replay any run later from dumps,
while keeping the viewer **external** to the pipeline runtime.

Key goals:

- **Live inspection:** see layers as steps execute (streaming upserts).
- **External replay:** run once, inspect later (dump folders).
- **Layered inspection:** show buffers (e.g., temperature), indices (e.g., biome IDs), and derived fields (e.g., mountain masks).
- **Deterministic provenance:** every layer is tagged with stable ids (`runId`/`planFingerprint`, step id, phase, layer keys).
- **Zero coupling to runtime:** pipeline must not depend on deck.gl.

---

## Trace posture (current)

Trace is the **event spine** for both streaming and dumps:

- Steps emit visualization data via `context.viz?.dump*` methods (preferred) which call `trace.event(...)` under the hood.
- `TraceScope.event(...)` is gated behind `verbose` (`packages/mapgen-core/src/trace/index.ts`), so visualization emission is also gated.
- Runners choose a `VizDumper` implementation that matches their transport:
  - **Studio worker** uses inline binary refs and forwards events to the UI (`viz.layer.upsert`).
  - **Node/dev dump** writes binary payloads to disk and indexes them in a manifest.

Hard rule:
- Step implementations should not invent new visualization event envelopes; use the `VizDumper` surface.

---

## System Architecture (Data Flow)

```
Pipeline run (steps call context.viz?.dump*)
  → trace session (runId + planFingerprint; currently the same value)
  → step.event payloads (viz layer emissions)
  → sink(s):
       - browser/Studio: forward as `viz.layer.upsert` (Transferables)
       - node/dev: write trace.jsonl + manifest.json + data/
  → deck.gl viewer:
       - live: render streamed upserts
       - replay: load manifest + data
```

**Key property:** the viewer never runs pipeline code; it consumes serialized outputs (streamed or replayed).

---

## Viz primitives (implemented)

### 1) `VizDumper` (step-facing surface)

Steps emit visualization data through `VizDumper` methods (e.g. `dumpGrid`, `dumpPoints`, `dumpGridFields`).

Implemented dumpers:

- **Studio worker dumper** (streaming; inline payloads): `apps/mapgen-studio/src/browser-runner/worker-viz-dumper.ts`
- **Node/dev dump dumper** (replay; path payloads): `mods/mod-swooper-maps/src/dev/viz/dump.ts` (`createVizDumper`)

Both implementations:
- are gated by `trace.isVerbose`,
- emit `VizLayerEmissionV1`,
- and derive `layerKey` via `createVizLayerKey(...)`.

### 2) Trace sinks (transport)

Implemented sinks:

- **Studio worker sink** (streaming upserts): `apps/mapgen-studio/src/browser-runner/worker-trace-sink.ts`
  - Forwards `step.start`/`step.finish` to `run.progress`.
  - Forwards `viz.layer.emit.v1` step events to `viz.layer.upsert` (Transferables).
- **Node/dev dump sink** (writes dumps): `mods/mod-swooper-maps/src/dev/viz/dump.ts` (`createTraceDumpSink`)
  - Writes `trace.jsonl` and `manifest.json`, and indexes layers whose binary refs are `path`-based.

Note (current reality):
- Studio’s `VizDumper` emits `viz.layer.emit.v1`.
- The node/dev dump path uses `viz.layer.dump.v1`.
- Step code should not care: it calls `context.viz?.dump*`; the runner chooses the matching dumper + sink pair.

### 3) Manifest contract: `VizManifestV1`

The replay manifest schema is `VizManifestV1` from `@swooper/mapgen-viz` (`packages/mapgen-viz/src/index.ts`).
MapGen Studio’s dump viewer expects `manifest.json` with `version: 1`.

---

## Layer Taxonomy (What We Visualize)

**Layer kinds:**

- **Grid layers** (tile fields): elevation, temperature, biome IDs, masks.
- **Mesh layers** (graph/fields): plate mesh sites, mesh neighbor edges, and per-cell tensors.
- **Vector layers** (paths): rivers, fault lines, corridors.
- **Point layers** (samples): craton seeds, hotspots, volcanoes.
- **Polygon layers** (regions): landmasses, plates.

**Sources:**

- **Buffers:** mutable but snapshot-able (elevation, climate fields).
- **Artifacts:** immutable products (crust, plate graph, tectonic history).
- **Fields:** engine-facing outputs (biome IDs, terrain IDs).

---

## Viewer design (implemented)

MapGen Studio contains both viewer modes:

- **Live viewer**: renders `viz.layer.upsert` events as they stream from the worker.
- **Dump viewer**: loads `manifest.json` + referenced binary payloads and replays layers.

### Deck.gl Layer Mapping

| Layer kind | deck.gl layer | Notes |
|---|---|---|
| Grid | `PolygonLayer` (hexes) or `BitmapLayer` | Current implementation uses hex polygons to match Civ; a texture-based approach can come later for speed. |
| Mesh | `ScatterplotLayer` + `PathLayer` | Sites as points, neighbors as segments (Delaunay adjacency). Voronoi polygons require additional geometry dumps. |
| Vector | `PathLayer` | Rivers, rifts, corridors. |
| Point | `ScatterplotLayer` | Seeds, hotspots, volcanoes. |
| Polygon | `PolygonLayer` | Plate/continent extents. |

### Authoritative loading + rendering implementation

MapGen Studio’s v1 loader + renderer:
- dump manifest validation: `apps/mapgen-studio/src/features/dumpViewer/manifest.ts`
- binary reference resolution: `apps/mapgen-studio/src/features/viz/model.ts`
- deck.gl rendering: `apps/mapgen-studio/src/features/viz/deckgl/render.ts`

---

## Future enhancements

- **Step-level opt-in registry** (e.g., `diagnostics.layers` for a step) instead of “force everything verbose”.
- **Palette registry** in docs (shared legend definitions for IDs/fields).
- **Layer diff events** (for deltas vs full snapshots).

---

## Visualization of the Pipeline (Conceptual)

```
Foundation
  ├─ crust type / age / strength (grid)
  ├─ plates + boundaries (mesh + vector)
  └─ tectonic history (grid per era)

Morphology
  ├─ elevation / slope / erosion (grid)
  └─ landmass masks (grid + polygons)

Hydrology
  ├─ rainfall / temp / rivers (grid + vector)

Ecology
  ├─ biome IDs / soil signals (grid)

Placement
  └─ starts / wonders (points)
```

---

## What This Enables

- **Postmortem debugging:** compare two runs by diffing manifests.
- **Model transparency:** show why a biome landed where it did.
- **Authoring confidence:** validate knobs and presets visually.

---

## How to extend (add layers)

1) In the step you care about, emit via `context.viz?.dump*` (do not hand-roll trace envelopes).
2) Ensure the step is `verbose` (otherwise `TraceScope.event` suppresses viz emissions).
3) Pick stable ids:
   - `dataTypeKey` for the semantic data product
   - `spaceId` for the coordinate space
   - optional `role`/`variantKey` for disambiguation
4) Verify both transports:
   - live streaming in Studio (upserts),
   - and replay via dumps (when produced).

## Verification

Live (Studio):
- Start Studio and run a recipe.
- Confirm `run.progress` events fire (step start/finish).
- Confirm `viz.layer.upsert` events appear when a verbose step calls `context.viz?.dump*`.

Replay (dump viewer):
- Produce a dump folder using the node/dev dump harness (mod-owned).
- Confirm `<outputsRoot>/<runId>/manifest.json` exists and contains `layers[]`.
- Load the folder in Studio’s dump viewer and confirm layers render.

---

## Open Questions

- **Event envelope convergence:** unify `viz.layer.emit.v1` and `viz.layer.dump.v1` naming (or make sinks accept both).
- **Binary format:** raw typed arrays + sidecar JSON vs Arrow/Parquet.
- **File size controls:** snapshot every step vs key steps only.
