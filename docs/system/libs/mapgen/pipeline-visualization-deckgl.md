<toc>
  <item id="definitions" title="Definitions"/>
  <item id="spaces" title="Coordinate spaces"/>
  <item id="purpose" title="Purpose"/>
  <item id="projection" title="Projection posture"/>
  <item id="architecture" title="System architecture"/>
  <item id="primitives" title="Viz primitives (implemented)"/>
  <item id="taxonomy" title="Data type taxonomy"/>
  <item id="viewer" title="Viewer design (implemented)"/>
  <item id="changes" title="Future enhancements"/>
  <item id="verification" title="Verification"/>
  <item id="questions" title="Open questions"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Pipeline Visualization (deck.gl)

> **System:** Mapgen diagnostics and external visualization.
> **Scope:** Project completed step evidence into streaming upserts and/or replayable dumps, then render it in a deck.gl viewer.
> **Status:** Canonical (current; implementation + conventions)

## Definitions

- **Dump folder**: replayable output containing `manifest.json` plus payloads under `data/`.
- `outputsRoot`: where dump folders are written (implementation chooses the root; the contract only assumes a per-run folder containing `manifest.json`).
- `runId`: unique execution-attempt identity assigned by Core and shared by trace and facet sinks; repeated attempts of one plan receive different values.
- `planFingerprint`: plan identity (hash of plan inputs); see [`docs/system/libs/mapgen/reference/GLOSSARY.md`](/system/libs/mapgen/reference/GLOSSARY.md) and `packages/mapgen-core/src/engine/observability.ts`.
- `dataTypeKey`: stable semantic identity for a data product (e.g. `"hydrology.wind.wind"`).
- `layerKey`: canonical, opaque identity for a layer within a run (used for streaming upserts and dump replay identity).
- `variantKey`: optional disambiguator for variants within the same semantic data product (UI label: “Variant”).
- `spaceId`: explicit coordinate space (UI label: “Space”).
- `renderModeId`: UI grouping key derived from `kind[:role]` (e.g. `"grid"`, `"segments:edgeOverlay"`).

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
- In this codebase, the mesh visualization projects:
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
- **Correlated provenance:** every layer carries its unique `runId`, stable `planFingerprint`, exact `stageId` + `stepId`, and layer keys.
- **Zero coupling to runtime:** pipeline must not depend on deck.gl.

---

## Projection posture

Visualization is optional evidence projected after a step succeeds:

- A step authors `viz: ({ result, config, dimensions }) => VizProjection[]` beside its `run`.
- Core invokes the projector only after declared providers are admitted and only when the execution
  environment supplies a visualization sink.
- Projectors are synchronous and pure. They may borrow completed typed arrays but cannot observe a
  runtime context, trace scope, adapter, store, sink, or execution identity.
- The environment sink attaches Core-owned run and step identity, materializes binary references,
  and streams or persists the result.
- Visualization projection and sink failures are diagnostic; they cannot change generation success.

Trace remains a separate progress and structured-debug channel. Trace verbosity does not enable or
disable visualization.

---

## System Architecture (Data Flow)

```
step.run succeeds and declared providers are admitted
  → optional createStep({ viz }) projector returns portable VizProjection[]
  → execution-owned sink attaches run/step identity and materializes binary refs
       - browser/Studio: inline refs → `viz.layer.upsert` (Transferables)
       - node/dev: path refs → manifest.json + data/
  → consumers:
       - Studio: render streamed upserts
       - diagnostic tooling: read manifest + data for replay and comparison
```

**Key properties:** recipe algorithms never observe a visualization sink, and the viewer never runs
pipeline code. Studio consumes serialized outputs, not recipe palette names or domain policy.

---

## Viz primitives (implemented)

### 1) Portable projections (step-facing surface)

`VizProjection` is the closed environment-neutral union for grids, field groups, points, and
segments. `@swooper/mapgen-viz` owns projection contracts, validation, materialization, shared
geometry, and reusable pure scalar/vector projection helpers.

The Standard recipe owns semantic style selection in `recipes/standard/viz.ts`. Its style names
resolve to portable colors before projection crosses the recipe boundary. Category identities that
are meaningful only to one stage or step remain local to that owner.

### 2) Facet sinks (environment boundary)

Implemented sinks:

- **Studio worker sink**: `apps/mapgen-studio/src/browser-runner/worker-viz-facet-sink.ts`
  - copies each exact typed-array view into an inline buffer,
  - materializes `VizLayerEmissionV2`,
  - posts `viz.layer.upsert` with Transferables.
- **Node diagnostic dump sink**: `packages/mapgen-diagnostics/src/dump.ts`
  - writes exact binary views under `data/`,
  - materializes path-backed layers and updates `manifest.json`.

Trace sinks independently record progress and structured events. They do not transport
visualization layers.

### 3) Manifest contract: `VizManifestV2`

The replay manifest schema is `VizManifestV2` from `@swooper/mapgen-viz` (`packages/mapgen-viz/src/index.ts`).
`@swooper/mapgen-diagnostics` readers admit only `manifest.json` with `version: 2`; Studio builds
the same manifest shape from live worker events rather than loading path-backed dumps.

---

## Data Type Taxonomy (How Studio groups visualization)

Studio presents visualization by grouping concrete layer emissions into “data types”:

- **Data type**: `dataTypeKey` (stable semantic identity; what the thing *means*).
- **Space**: `spaceId` (coordinate system; where the numbers live).
- **Render mode**: derived `kind[:role]` (how the thing is rendered).
- **Variant**: `variantKey` (optional; multiple complementary variants of the same data type).

Each emitted entry in `manifest.layers[]` is still a **layer** (concrete emission), but Studio’s primary selector is the **data type**.

## Layer Taxonomy (What we render)

**Layer kinds:**

- **Grid layers** (tile fields): elevation, temperature, biome IDs, masks.
- **Mesh layers** (graph/fields): plate mesh sites, mesh neighbor edges, and per-cell tensors.
- **Vector layers** (paths): rivers, fault lines, corridors.
- **Point layers** (samples): craton seeds, hotspots, volcanoes.
- **Polygon layers** (regions): landmasses, plates.

**Sources:** completed step results and the admitted artifact/effect evidence used to produce those
results. A projector may derive presentation-only geometry or scalar variants, but it cannot mutate
generation state or synthesize missing product evidence.

---

## Viewer design (implemented)

MapGen Studio renders `viz.layer.upsert` events as they stream from the worker. Path-backed dump
capture, admission, binary reads, inventory, and neutral comparison belong to
`@swooper/mapgen-diagnostics`; Swooper's commands own Standard replay and product reporting.

### Deck.gl Layer Mapping

| Layer kind | deck.gl layer | Notes |
|---|---|---|
| Grid | `PolygonLayer` (hexes) or `BitmapLayer` | Current implementation uses hex polygons to match Civ; a texture-based approach can come later for speed. |
| Mesh | `ScatterplotLayer` + `PathLayer` | Sites as points, neighbors as segments (Delaunay adjacency). Voronoi polygons require additional geometry dumps. |
| Vector | `PathLayer` | Rivers, rifts, corridors. |
| Point | `ScatterplotLayer` | Seeds, hotspots, volcanoes. |
| Polygon | `PolygonLayer` | Plate/continent extents. |

### Authoritative loading + rendering implementation

MapGen Studio’s live v2 ingestion + renderer:
- manifest contract: `packages/mapgen-viz/src/index.ts`
- live manifest ingestion/state: `apps/mapgen-studio/src/features/viz/ingest.ts` and `apps/mapgen-studio/src/features/viz/vizStore.ts`
- binary reference resolution: `apps/mapgen-studio/src/features/viz/deckgl/render.ts`
- deck.gl rendering: `apps/mapgen-studio/src/features/viz/deckgl/render.ts`

---

## Future enhancements

- **Additional recipe-owned semantic styles** where repeated visual meaning justifies one portable
  color law.
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

1) Return the evidence needed for visualization from `run`; do not expose a sink to the algorithm.
2) Add a synchronous `viz` projector to the same `createStep(...)` call and return portable
   `VizProjection[]` values.
3) Pick stable ids and presentation semantics:
   - `dataTypeKey` for the semantic data product
   - `spaceId` for the coordinate space
   - optional `role`/`variantKey` for disambiguation
   - a recipe-owned semantic style or an owner-local exact category table
4) Verify both transports:
   - live streaming in Studio (upserts),
   - and replay via dumps (when produced).

## Verification

Live (Studio):
- Start Studio and run a recipe.
- Confirm `run.progress` events fire (step start/finish).
- Confirm `viz.layer.upsert` events appear for steps with a `viz` facet and that the rendered colors
  match the projection's resolved metadata.

Replay and comparison:
- Produce a dump folder using the package-owned node/dev dump harness from a Swooper runner.
- Confirm `<outputsRoot>/<runId>/manifest.json` exists and contains `layers[]`.
- Run a Swooper list, analyze, trace, or diff command and confirm it admits the v2 manifest through
  `@swooper/mapgen-diagnostics`.

---

## Open Questions

- **Binary format:** raw typed arrays + sidecar JSON vs Arrow/Parquet.
- **File size controls:** snapshot every step vs key steps only.

## Ground truth anchors

- Execution identity and plan fingerprint: `packages/mapgen-core/src/engine/observability.ts`
- Step facet contracts and dispatch: `packages/mapgen-core/src/engine/step-facets.ts`
- Portable projections and materialization: `packages/mapgen-viz/src/index.ts`
- Standard recipe semantic styles: `mods/mod-swooper-maps/src/recipes/standard/viz.ts`
- Studio visualization facet sink: `apps/mapgen-studio/src/browser-runner/worker-viz-facet-sink.ts`
- Studio progress trace sink: `apps/mapgen-studio/src/browser-runner/worker-trace-sink.ts`
- Studio worker protocol: `apps/mapgen-studio/src/browser-runner/protocol.ts`
- Viz manifest contract: `packages/mapgen-viz/src/index.ts`
- Studio viz manifest state: `apps/mapgen-studio/src/features/viz/vizStore.ts`
- Deck.gl renderer: `apps/mapgen-studio/src/features/viz/deckgl/render.ts`
- Node diagnostic capability: `packages/mapgen-diagnostics/src/index.ts`
- Viz contract routing: `docs/system/libs/mapgen/reference/VISUALIZATION.md`
