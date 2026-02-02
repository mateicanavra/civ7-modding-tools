<toc>
  <item id="definitions" title="Definitions"/>
  <item id="spaces" title="Coordinate spaces"/>
  <item id="purpose" title="Purpose"/>
  <item id="trace" title="Trace posture"/>
  <item id="architecture" title="System architecture"/>
  <item id="primitives" title="Dump primitives"/>
  <item id="taxonomy" title="Layer taxonomy"/>
  <item id="viewer" title="Deck.gl viewer design"/>
  <item id="changes" title="Pipeline changes"/>
  <item id="verification" title="Verification"/>
  <item id="questions" title="Open questions"/>
</toc>

# Pipeline Visualization (deck.gl)

> **System:** Mapgen diagnostics and external visualization.
> **Scope:** Capture per-step artifacts/buffers as post-run dumps and render them in a deck.gl viewer.
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

We want a **post-generation visualization system** that can replay any run and show how each layer (buffers, artifacts, and indices) evolves through the pipeline. The viewer must operate **externally** from the pipeline runtime, consuming **logs/trace/dumps** emitted during a run.

Key goals:

- **External replay:** run once, inspect later.
- **Layered inspection:** show buffers (e.g., temperature), indices (e.g., biome IDs), and derived fields (e.g., mountain masks).
- **Deterministic provenance:** every layer is tagged with run/step/plan fingerprints.
- **Zero coupling to runtime:** pipeline must not depend on deck.gl.

---

## Can We Use Trace as-is?

We can keep the existing trace system as the **primary event spine** and add **lightweight dump primitives** on top:

- **Trace already supports** run/step events and allows custom payloads via `trace.event(...)` in step scopes.
- **Trace sinks are pluggable**, so we can implement a sink that writes **JSONL events + a binary data directory**.
- **Missing piece:** a standardized, structured **layer dump format** that references large buffers without bloating the trace stream.

### Conclusion

- **No new runtime primitive is required** to emit diagnostics: the trace system is enough.
- **One new convention is needed:** a **layer dump manifest** + optional helpers to write binary payloads.

### Constraint to make explicit (avoid drift)

If the runtime’s trace implementation gates `step.event` behind “verbose”, then layer dumps emitted via `trace.event(...)` will also be gated. The dump sink design must either:
- reference the runtime behavior explicitly (e.g. `packages/mapgen-core/src/trace/index.ts`), and
- document that dumps require verbose tracing for the instrumented steps, or
- provide an additional non-verbose dump path (still without impacting pipeline correctness).

---

## System Architecture (Data Flow)

```
Pipeline run
  → trace session (runId + planFingerprint; currently the same value)
  → step.event payloads (metadata only)
  → dump sink writes:
       - trace.jsonl   (events)
       - manifest.json (layer index)
       - data/         (binary arrays)
  → deck.gl viewer loads manifest + data
```

**Key property:** the viewer never runs pipeline code; it replays serialized outputs.

---

## Dump primitives (implemented)

### 1) Trace sink (writes `trace.jsonl` + `manifest.json` + `data/`)

The dump sink is implemented in the MapGen mod:
- `mods/mod-swooper-maps/src/dev/viz/dump.ts`

It consumes trace events and writes a per-run folder with:
```
<outputsRoot>/<runId>/
  trace.jsonl
  manifest.json
  data/
    *.bin
```

### 2) Manifest contract: `VizManifestV1`

The manifest schema is `VizManifestV1` from `@swooper/mapgen-viz` (`packages/mapgen-viz/src/index.ts`).
MapGen Studio only accepts `manifest.json` with `version: 1` (no compatibility adapters).

### 3) Layer dump event convention: `viz.layer.dump.v1`

Layer dumps are emitted via `trace.event(...)` with a v1 payload:
- `type: "viz.layer.dump.v1"`
- `layer: VizLayerEmissionV1`

See the producer implementation in `mods/mod-swooper-maps/src/dev/viz/dump.ts`.

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

## Deck.gl Viewer Design

### Viewer App Shape

A standalone web app (or an extension of MapGen Studio) that can load a dump folder:

- **Input:** `manifest.json` + `trace.jsonl` + binary data.
- **UI:** layer list, time/era controls, palette controls, min/max/legend.
- **Playback:** step-by-step overlay of layer changes.

### Deck.gl Layer Mapping

| Layer kind | deck.gl layer | Notes |
|---|---|---|
| Grid | `PolygonLayer` (hexes) or `BitmapLayer` | Current implementation uses hex polygons to match Civ; a texture-based approach can come later for speed. |
| Mesh | `ScatterplotLayer` + `PathLayer` | Sites as points, neighbors as segments (Delaunay adjacency). Voronoi polygons require additional geometry dumps. |
| Vector | `PathLayer` | Rivers, rifts, corridors. |
| Point | `ScatterplotLayer` | Seeds, hotspots, volcanoes. |
| Polygon | `PolygonLayer` | Plate/continent extents. |

### Layer Loading Path

The authoritative implementation is MapGen Studio’s v1 loader + renderer:
- dump manifest validation: `apps/mapgen-studio/src/features/dumpViewer/manifest.ts`
- binary reference resolution: `apps/mapgen-studio/src/features/viz/model.ts`
- deck.gl rendering: `apps/mapgen-studio/src/features/viz/deckgl/render.ts`

---

## What Needs to Change in the Pipeline?

### Minimal changes (preferred)

- **Add a dump sink** implementation (no changes to core trace primitives).
- **Introduce optional helpers** to format layer payloads consistently.
- **Emit layer dump events** for core artifacts/buffers (guarded by trace verbosity).

### Optional enhancements

- **Step-level opt-in registry** (e.g., `diagnostics.layers` for a step).
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

## Implementation Sequence (Suggested)

1. Add a **trace dump sink** that writes `trace.jsonl` + `manifest.json` + `data/`.
2. Add **layer dump helpers** in mapgen-core (format + validation).
3. Emit layer dumps for the core pipeline (Foundation → Placement).
4. Build a **deck.gl viewer** (standalone or MapGen Studio).
5. Add palette definitions + legend mapping docs.

## Verification (proposal → implementation)

- Add a small deterministic test that runs a tiny plan with a dump sink and asserts:
  - `manifest.json` exists,
  - at least one `layers[]` entry exists,
  - the referenced `path` exists and byte length matches `dims × sizeof(format)`.

---

## Open Questions

- **Binary format:** raw typed arrays + sidecar JSON vs Arrow/Parquet.
- **File size controls:** snapshot every step vs key steps only.
- **Layer privacy:** remove any user identifiers from dumps.
