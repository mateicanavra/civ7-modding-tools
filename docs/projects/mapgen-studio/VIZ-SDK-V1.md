# VIZ SDK v1 — Robust visualization metadata + multi-projection model

**Status:** Proposed (maximal design + draft solutions)
**Date:** 2026-02-01

This document proposes a *maximal* overhaul of the visualization “SDK” and metadata contracts so MapGen Studio’s visualization pipeline becomes:
- meaningful and varied (multiple projections per logical layer),
- correct for continuous fields (no more “everything clamps to 0..1”),
- explicit about coordinate spaces (tile vs mesh vs world),
- registry-driven (declare semantics instead of guessing from `layerId`),
- stable across both streaming (VizSink) and dump replay (manifest).

It is intentionally architecture-heavy and implementation-ready (schema drafts + migration plan), but does not implement the changes yet.

---

## 0) Problem statement (what’s “wrong” today)

### 0.1 The `viz-01..05` branches added dumps, not meaningful multi-projection visualization

Recent Graphite stack branches:
- `dev-mapgen-studio-ui-refactor-viz-01-foundation-layers` (PR #907)
- `dev-mapgen-studio-ui-refactor-viz-02-morphology-layers` (PR #908)
- `dev-mapgen-studio-ui-refactor-viz-03-hydrology-layers` (PR #909)
- `dev-mapgen-studio-ui-refactor-viz-04-ecology-layers` (PR #910)
- `dev-mapgen-studio-ui-refactor-viz-05-placement-layers` (PR #911)

What landed was almost entirely pipeline-side emissions in `mods/mod-swooper-maps/src/recipes/standard/stages/**` (grid/points/segments dumps).

That work is useful plumbing, but it did not (and structurally could not) deliver:
- “multiple projections per layer”
- correct continuous field semantics by default
- richer layer types like continuous scalar fields and vector fields rendered meaningfully

### 0.2 Why “multiple projections per layer” is currently impossible

MapGen Studio currently defines “data type” as `layer.layerId`:
- `apps/mapgen-studio/src/features/viz/dataTypeModel.ts` uses `const dataTypeId = layer.layerId`.

It defines “render modes” as `kind` plus optional `meta.role`:
- `renderModeId = role ? \`${kind}:${role}\` : kind`.

Therefore the only way for Studio to show multiple “projections/render modes” for a single logical layer is:
- multiple manifest entries with the *same* `layerId`, but different `kind` and/or `meta.role`, **or**
- a viewer-side projection registry that supplies multiple projections without requiring pipeline duplication.

The current pipeline emissions are 1:1 (`layerId` → one representation kind), so Studio sees one render mode per data type and cannot provide the “multiple projections” experience.

### 0.3 Continuous fields are visually broken by design

Studio’s continuous palette mapping clamps raw values to `[0, 1]`:
- `apps/mapgen-studio/src/features/viz/presentation.ts` does `const t = Math.max(0, Math.min(1, value));`

This means any real domain field like elevation (`i16`) or discharge (`f32`) saturates and appears flat/meaningless.

Studio *does* compute basic stats (min/max) elsewhere in the rendering path, but those stats are not used to normalize the value domain for color mapping.

### 0.4 The most embarrassing missing capabilities (representative examples)

- **Multi-projection per data type** (the user expectation):
  - Example: “elevation” should be renderable as a tile-fill raster, contours, slope, hillshade, and/or binned classifications without duplicating pipeline dumps.
- **Continuous fields** that look correct by default:
  - Example: rainfall/discharge should have sane normalization and legend semantics.
- **Continuous vector fields**:
  - Example: wind/current (U,V) should render as arrows/streamlines, not as unrelated scalar grids.
- **Identity + variants**:
  - Pipeline already supports `fileKey` (variants), but Studio’s current identity habits are at risk of collapsing distinct variants unless `layer.key` is treated as opaque identity end-to-end (see `docs/projects/mapgen-studio/resources/seams/SEAM-VIZ-DECKGL.md`).

---

## 1) What we actually want (capability-oriented)

### 1.1 The user’s intended ask (reconstructed)

1) Make the visualization pipeline *meaningful and varied*, not “a list of dumped arrays”.
2) Provide multiple projections per logical layer (data type), without requiring the pipeline to dump multiple redundant payloads.
3) Make continuous fields (scalar + vector) first-class and correct by default.
4) Tighten the visualization SDK/metadata so it is robust, extensible, and consistent across:
   - Web Worker streaming runs (VizSink)
   - dump replay viewer (manifest + binary payloads)

### 1.2 Architectural principles

- **Viewer-defined projections by default.**
  - The pipeline emits canonical data products (representations).
  - The viewer provides multiple renderings (projections) of those same products.
  - The pipeline only emits multiple representations when they are truly distinct products (e.g., expensive derived layers you don’t want computed client-side).

- **Explicit semantics; no “guessing” based on `layerId`.**
  - Coordinate space, scale, and legend semantics should be declared or registry-resolved (not ad-hoc code checks).

- **Stable identity**
  - `layerKey` is unique identity.
  - `dataTypeId` is stable semantic identity.
  - Variants are deliberate and coexist safely.

---

## 2) Proposal: the VIZ SDK v1 model (3-layer separation)

The root fix is a clean separation of concerns:

1) **Data type identity** (semantic): “what is this?”
   - `dataTypeId` (stable): e.g. `hydrology.hydrography.discharge`

2) **Representation / encoding** (bytes): “what do we have?”
   - `representation.kind`: `grid | points | segments` (today)
   - future extensibility: `polygons | mesh | rasters | tensors | …`

3) **Projection / render mode** (viewer transform): “how do we want to see it?”
   - `projectionId`: e.g. `grid.hexFill`, `grid.contours`, `segments.arrows`, `points.density`, `grid.vectorFieldArrows`
   - projections are *viewer-side* transforms; they should not require pipeline duplication.

### 2.1 Terminology mapping to current code

- Current `layerId` ≈ **`dataTypeId`** (semantic identifier).
- Current `kind` ≈ **representation.kind**.
- Current `meta.role` is currently overloaded risk:
  - It should remain a *semantic hint for overlays/tooling* (e.g. `edgeOverlay`), not a projection selector.
  - Projections should be their own concept (registry-driven).

---

## 3) Viz metadata: make semantics explicit (maximal)

### 3.1 Value semantics: stop treating raw numbers as “already normalized”

Introduce a stable `ValueSpec` for any layer that has numeric values (grid values, point values, segment values):

```ts
export type VizScaleType = "categorical" | "linear" | "log" | "symlog" | "quantile";

export type VizNoDataSpec =
  | { kind: "none" }
  | { kind: "sentinel"; value: number }
  | { kind: "nan" };

export type VizValueDomain =
  | { kind: "unit"; min: 0; max: 1 }
  | { kind: "explicit"; min: number; max: number }
  | { kind: "fromStats" }; // requires stats

export type VizValueTransform =
  | { kind: "identity" }
  | { kind: "clamp"; min: number; max: number }
  | { kind: "normalize"; domain: VizValueDomain }
  | { kind: "affine"; scale: number; offset: number }
  | { kind: "piecewise"; points: Array<{ x: number; y: number }> };

export type VizValueSpec = {
  scale: VizScaleType;
  domain: VizValueDomain;
  noData?: VizNoDataSpec;
  transform?: VizValueTransform;
  units?: string; // optional UX affordance
};
```

### 3.2 Stats: required for correct continuous rendering

Add stats as either:
- embedded metadata (small), or
- sidecar payload (large / richer histograms).

Minimum viable (and good enough for 90% of fields):

```ts
export type VizScalarStats = {
  min: number;
  max: number;
  // Optional “nice to have”:
  mean?: number;
  stddev?: number;
};
```

Maximal (future-friendly) stats:

```ts
export type VizHistogram = { bins: number[]; min: number; max: number };
export type VizScalarStatsV2 = VizScalarStats & {
  hist?: VizHistogram;
  p01?: number;
  p50?: number;
  p99?: number;
};
```

### 3.3 Coordinate space: make it a contract

Current meta has `space?: "world" | "tile"`; keep the simple surface but define a stable vocabulary and/or IDs:

- `tile.hexOddR` (current Studio convention)
- `mesh.world` (foundation mesh site space)
- `world.xy` (generic planar)

`meta.space` can remain a hint, but the *real* truth should be provided by either:
- explicit `spaceId` on each layer descriptor, or
- registry rules keyed by `dataTypeId` patterns (see `SEAM-VIZ-DECKGL.md`), not ad-hoc heuristics in `App.tsx`.

---

## 4) Projections: registry-driven render modes (multiple per layer)

### 4.1 Projection registry: centralize “how to render”

Add a viewer-side registry that maps `dataTypeId` (or pattern) to:
- default projections
- allowed projections
- default scale/palette/legend semantics
- coordinate space (if not explicit on the layer)

This aligns with the already-written seam design:
- `docs/projects/mapgen-studio/resources/seams/SEAM-VIZ-DECKGL.md`

### 4.2 Example built-in projection catalog (maximal)

**Grid projections**
- `grid.hexFill` — tile hex fill (current default)
- `grid.bitmap` — texture-backed rendering (future perf path)
- `grid.contours` — isolines from scalar field
- `grid.hillshade` — derived shading from elevation-like fields
- `grid.slope` — derived gradient magnitude
- `grid.classify` — apply breaks (quantile/jenks/manual bins) and render categorical classes

**Points projections**
- `points.scatter` — scatterplot
- `points.density` — density heatmap (aggregated)
- `points.labels` — debug labeling mode

**Segments projections**
- `segments.lines` — path layer
- `segments.arrows` — direction arrows (requires per-segment direction or inferred order)
- `segments.widthByValue` — line width encodes values

**Vector field projections (new first-class capability)**
- `grid.vectorFieldArrows` — show U/V arrows sampled on a grid
- `grid.streamlines` — streamlines/particle advection visualization (more expensive; optional)

Key principle: these projections are *viewer transforms* that can be applied to the same underlying representation without requiring additional pipeline dumps.

---

## 5) Protocol + manifest: draft schema changes (v1)

### 5.1 Current v0 constraints

Today’s dump manifest and streaming model treat `layerId` as both:
- the semantic identifier, and
- the thing the UI groups by (data type).

And Studio derives render modes only from `kind[:role]`.

### 5.2 Proposed v1: split identity, semantics, representation

Draft `VizLayerDescriptorV1` (conceptual; can be used for both streaming and dump manifest):

```ts
export type VizLayerDescriptorV1 = {
  // identity
  layerKey: string; // unique and opaque; must be stable across ingest

  // semantics
  dataTypeId: string; // stable semantic id (today: layerId)
  label?: string;
  group?: string;
  visibility?: "default" | "debug" | "hidden";

  // space
  spaceId?: string; // preferred, explicit

  // representation
  kind: "grid" | "points" | "segments";
  dims?: { width: number; height: number }; // grid
  count?: number; // points/segments
  format?: "u8" | "i8" | "u16" | "i16" | "i32" | "f32";
  valueFormat?: "u8" | "i8" | "u16" | "i16" | "i32" | "f32";

  // value semantics
  valueSpec?: VizValueSpec;
  stats?: VizScalarStats; // optional but strongly recommended for continuous

  // overlays/tooling semantics
  role?: string; // keep for stable small vocab like "edgeOverlay"

  // structural context (unchanged)
  stepId: string;
  phase?: string;
  stepIndex?: number; // advisory
  bounds?: [number, number, number, number];
};
```

Draft `VizManifestV1`:

```ts
export type VizManifestV1 = {
  version: 1;
  runId: string;
  planFingerprint: string;
  steps: Array<{ stepId: string; phase?: string; stepIndex: number }>;
  layers: Array<VizLayerDescriptorV1 & { dataRef: VizDataRefV1 }>;
};

export type VizDataRefV1 =
  | { kind: "inline"; buffers: Record<string, ArrayBuffer> } // streaming
  | { kind: "paths"; paths: Record<string, string> }; // dump replay
```

This gives Studio the stable seam it needs:
- group by `dataTypeId` (semantic)
- enumerate projections from the registry (viewer-side), independent of the pipeline’s representation count
- use `stats` + `valueSpec` to correctly normalize continuous fields

### 5.3 Back-compat mapping (v0 → v1)

- `dataTypeId = layer.layerId`
- `layerKey = layer.key ?? getLayerKey(layer)` (but **prefer runner-provided key**)
- `spaceId` derived by registry rules (until pipeline declares it)
- `valueSpec.domain = fromStats` for continuous-by-default data types, once stats exist

---

## 6) “Maximal” implementation plan (migration slices)

This is the maximal roll-forward plan; individual sub-slices can still be stacked in Graphite.

### Slice A — Make continuous correct (viewer)

- Stop clamping raw values to `[0,1]` in the continuous palette path.
- Normalize using `stats.min/max` (computed or supplied).
- Ensure legend + hover show both:
  - raw value (original units), and
  - normalized t (0..1) only as an internal detail (if needed).

### Slice B — Projection registry (viewer)

- Define a `VizProjectionRegistry` that supplies:
  - available projections per `dataTypeId` and representation kind
  - default projection per `dataTypeId`
  - projection-specific params + UI controls (e.g., contour interval)
- Update the layer picker model to:
  - group by `dataTypeId`
  - select `projectionId` independently from representation kind

### Slice C — Identity + variants correctness

- Treat `layerKey` as the primary key everywhere in Studio ingest/store.
- Ensure variants (e.g., `fileKey`) can coexist in the same step and remain selectable.

### Slice D — ValueSpec + stats in protocol/manifest

- Extend the VizSink protocol to include `valueSpec` and `stats`.
- Extend the dump manifest (or sidecars) similarly.

### Slice E — Vector fields as first-class layers

- Define a vector-field representation:
  - either `kind: "gridVector"` (new kind), or
  - `kind: "grid"` with `buffers: { u: ..., v: ... }` (recommended for v1 extensibility)
- Implement projections:
  - `grid.vectorFieldArrows`
  - `grid.streamlines` (optional)

### Slice F — Pipeline emitters: emit canonical products; avoid projection duplication

- Audit stage emitters and classify each “layer” as either:
  - canonical data product (keep emitting)
  - viewer-derived projection (stop emitting; shift to projection registry)
- Keep the pipeline surface small and stable; let the viewer do the variety.

---

## 7) Where this aligns with existing repo docs (and why it’s not “new theory”)

This proposal is a consolidation of intent already present in the repo:

- `docs/projects/mapgen-studio/ROADMAP.md`
  - Defines VizSink, dump vs in-memory, and the need for coherent visualization across phases.
- `docs/projects/mapgen-studio/V0.1-SLICE-TILESPACE-HEIGHT-LANDMASK-DECKGL.md`
  - Explicitly calls out continuous scalar fields and suggests including min/max stats in the protocol.
- `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`
  - Emphasizes multi-space correctness and replayable dump architecture.
- `docs/projects/mapgen-studio/resources/seams/SEAM-VIZ-DECKGL.md`
  - Calls for registry-driven semantics, explicit spaces, and treating identity as opaque.
- `docs/projects/mapgen-studio/VIZ-LAYER-CATALOG.md`
  - Provides the canonical layer ID taxonomy; v1 should treat these as `dataTypeId`s.

---

## 8) Appendix: quick audit of the recent viz stack (“what actually landed”)

The `viz-01..05` branches primarily touched:
- Foundation: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/**`
- Morphology: `mods/mod-swooper-maps/src/recipes/standard/stages/{map-morphology/**,morphology-mid/**,morphology-post/**}`
- Hydrology: `mods/mod-swooper-maps/src/recipes/standard/stages/{hydrology-*/**,map-hydrology/**}`
- Ecology: `mods/mod-swooper-maps/src/recipes/standard/stages/{ecology/**,map-ecology/**}`
- Placement: `mods/mod-swooper-maps/src/recipes/standard/stages/placement/**`

There were no Studio-side changes to:
- add projection registries,
- normalize continuous fields correctly,
- introduce vector field layers.

So the gaps are expected outcomes of the current architecture, not failures of effort.

---

## 9) Reuse what we already have (and tighten it into a “mini SDK”)

This proposal is intentionally not a greenfield rewrite. We already have the right primitives; they are just missing a few decisive contracts and are currently split across “pipeline types”, “dump format”, and “viewer heuristics”.

### 9.1 Existing primitives to keep and build on

- **`VizLayerMeta`** (in `packages/mapgen-core`):
  - Keep as the primary “presentation surface” that pipeline authors touch.
  - Extend (v1) with value semantics (domain/no-data/scale) and optional stats.

- **`VizDumper`** (in `packages/mapgen-core`):
  - Keep as the core emission seam (already works for dump and can be mirrored in streaming).
  - Evolve to support multi-buffer payloads for vector fields (U/V) without forcing awkward “two unrelated scalar grids”.

- **`fileKey`** (already supported by dumper + manifest):
  - Keep as the “variant” mechanism (multiple variants per `(stepId, dataTypeId, kind)`).
  - Ensure Studio uses the runner-provided `layerKey` end-to-end so variants cannot collide.

- **`VizSink` / streaming model** (Studio + worker runner):
  - Keep the event-driven spine and the “external store” approach (ADR-003).
  - Move “semantics” (spaces/palettes/projections) out of ad-hoc render-time code into a registry.

### 9.2 “Mini SDK” as a real package (optional but recommended)

If we want this to be durable, it should not live as ad-hoc types in multiple places. The maximal version is to introduce a small, stable package (name TBD) that owns:

- shared types:
  - `VizLayerDescriptorV1`, `VizValueSpec`, `VizScalarStats`, `VizSpaceId`, `VizProjectionId`
- a default registry:
  - `defaultProjectionRegistry` for MapGen Studio
- helpers:
  - `defineVizMeta()` enhancements for value specs and common palettes

This could live as:
- `packages/mapgen-viz` (new), or
- as a new submodule under `packages/mapgen-core` if we want to keep the seam tight.

The key is: one canonical place for the “viz SDK contract”, imported by both producer and viewer.

---

## 10) Draft solutions (implementation-ready sketches, not yet implemented)

### 10.1 Fix continuous rendering immediately (Studio)

Replace “clamp raw value to 0..1” with “normalize using (min,max)”.

Desired behavior:
- if `meta.palette` is continuous (or auto-resolves to continuous) and `stats.min/max` exist:
  - map `value` → `t = (value - min) / (max - min)` then clamp `t` to [0,1]
- if stats are missing:
  - compute them once per layer (cache), or
  - request them from the worker (preferred for streaming).

### 10.2 Make projections first-class (Studio)

Add a `projectionId` selector (per data type) that selects from a registry rather than being limited to `kind[:role]`.

Important: representation kind still matters (a projection declares which representation kinds it supports), but projections are not “whatever the pipeline dumped”.

### 10.3 Vector fields as coherent layers (producer + viewer)

Add a new representation that can carry multiple named fields, e.g.:

```ts
type VizGridField = { format: VizScalarFormat; values: ArrayBufferView; stats?: VizScalarStats };

type VizGridFieldsLayer = {
  kind: "gridFields";
  dataTypeId: string;
  dims: { width: number; height: number };
  fields: Record<string, VizGridField>;
  meta?: VizLayerMeta;
};
```

Then define standard patterns:
- `hydrology.wind` as `{ u: ..., v: ... }`
- `hydrology.current` as `{ u: ..., v: ... }`

Viewer projections:
- `gridFields.vectorArrows` (downsample + render arrows)
- `gridFields.streamlines` (optional, expensive)

### 10.4 Keep the pipeline emit surface small and semantic

The maximal version still avoids “dump every projection”. Instead:
- pipeline emits the canonical base field(s) once,
- viewer offers multiple projections (contours/hillshade/arrows/classify/etc),
- pipeline only emits extra layers for *true* derived products we don’t want computed client-side (or that require engine adapters).
