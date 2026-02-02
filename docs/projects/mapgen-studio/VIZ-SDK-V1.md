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
- Proposed v1 `dataTypeId`s (not current v0 layer IDs):
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

---

## 11) Worked examples (end-to-end, grounded in existing layer IDs)

These are intentionally based on layer IDs that exist today in the pipeline (see `docs/projects/mapgen-studio/VIZ-LAYER-CATALOG.md` and the `viz-01..05` stack). When something is “v1 proposed”, it is explicitly called out.

### 11.1 Continuous scalar field: `morphology.topography.elevation` (existing)

**Producer (today):**
- The Morphology pipeline emits this as a grid of `i16` via `context.viz?.dumpGrid(...)`.
- One concrete emission site: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/steps/landmassPlates.ts` (`layerId: "morphology.topography.elevation"`, `format: "i16"`).
- The producer already provides meaningful author intent via `meta` (`label: "Elevation (m)"`, `group`, etc.).

**Dump/stream (today):**
- Dump sink records a layer descriptor with `layerId` + `kind: "grid"` + `format: "i16"` + `dims` and a `data/*` payload reference.
- Streaming mode carries equivalent descriptors and buffers in-memory.

**Viewer (today):**
- Studio groups by `layerId`, but continuous rendering treats raw values as if they’re already normalized (effectively clamping raw values to `[0,1]`).

**v1 (proposed): value semantics + multi-projection**
- Treat `morphology.topography.elevation` as a continuous scalar with units “m” and a domain derived from stats (min/max) per run.
- Provide multiple viewer-defined projections over the same representation:
  - `grid.hexFill` (baseline)
  - `grid.hillshade` (derived; meaningfully varied without pipeline duplication)
  - `grid.contours` (derived; debug/validation)
  - `grid.slope` (derived; debug/validation)

**Why this is “maximal”:**
- It produces the variety you expect *without* bloating the pipeline surface area into “dump every projection as a separate layer”.

### 11.2 Vector field components: `hydrology.wind.windU` + `hydrology.wind.windV` (existing)

**Producer (today):**
- Hydrology already emits the U/V components as separate grid layers (`format: "i8"`):
  - `hydrology.wind.windU`
  - `hydrology.wind.windV`
  - plus `hydrology.current.currentU/currentV`
- One concrete emission site: `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/steps/climateBaseline.ts`.

**What’s missing (today):**
- The viewer lacks a concept of “this is one vector field”, so U/V show up as two unrelated scalar layers.

**v1 option A (proposed, preferred long-term): multi-field representation**
- Introduce a representation that can carry multiple named fields (`{ u, v }`) under one `dataTypeId`.
- This removes the need for UI composites and makes the “vector field” unit explicit and stable.
- The viewer can then offer true vector projections:
  - `gridFields.vectorArrows` (downsample + arrows)
  - `gridFields.streamlines` (optional; expensive)

**v1 option B (proposed, compatible short-term): registry-defined composite data type**
- Without changing the pipeline, allow the registry to define a composite data type that consumes multiple existing layers.
- Example composite: `hydrology.wind` consuming `hydrology.wind.windU` + `hydrology.wind.windV`.
- The UI presents one “Wind (vector)” entry with multiple projections, backed by two emitted grids.

**Why this is “maximal”:**
- It makes vector fields a first-class visualization surface (arrows/streamlines), which is a core part of making the pipeline “roar”.

### 11.3 Overlay role: `foundation.mesh.edges` as `edgeOverlay` (existing)

**Producer (today):**
- Foundation emits mesh geometry as:
  - `foundation.mesh.sites` (points)
  - `foundation.mesh.edges` (segments) with `meta.role: "edgeOverlay"` and debug visibility
- One concrete emission site: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/mesh.ts`.

**Viewer (today):**
- Studio already treats `meta.role === "edgeOverlay"` as a non-pickable toggleable overlay.

**v1 guidance (proposed):**
- Keep `role` as a *small stable vocabulary for tooling/overlays*.
- Prevent `role` from becoming a parallel “projection system”; projections remain registry-defined and composable.

---

## 12) Open questions (architectural, with recommendations)

This section is intentionally *not* a list of implementation todos. These are the few decisions that materially affect architecture, long-term health, and developer experience.

### 12.1 Where should the v1 “Viz SDK contract” live (package boundaries)?

**Question:** Do we keep the v1 contract in `packages/mapgen-core`, or extract a dedicated “mini SDK” package?

**Is this at the right level to answer here?** Yes.

**Why it matters:**
- If the contract is scattered (core types + studio-specific types + dump types), we will keep re-breaking identity/space/value semantics every time we add layers.
- The contract is shared by multiple producers (CLI runs, worker runs, dump sink) and multiple consumers (Studio ingest, dump viewer, tests).

**Recommendation (maximal, DX-first):**
- Create a small package (e.g. `packages/mapgen-viz`) that owns the v1 contract:
  - types: `VizLayerDescriptorV1`, `VizValueSpec`, `VizScalarStats`, `VizSpaceId`, `VizProjectionId`
  - minimal helpers: “value spec defaults”, “stats helpers”
- Update `packages/mapgen-core` to depend on this package for the viz contract types used by `VizDumper` and `VizLayerMeta`-adjacent helpers.
- Keep deck.gl specifics *out* of the shared package:
  - MapGen Studio owns the projection registry implementation and deck.gl mapping, but consumes the shared contract types.

This yields the tight “mini SDK” you asked for: one shared source of truth, strongly typed, not viewer-specific.

### 12.2 Do we allow *composite* (multi-layer) data types in the viewer model?

**Question:** Should the viewer’s notion of “data type” be allowed to consume multiple layer descriptors (composite data types), or must every data type map 1:1 to one emitted representation?

**Is this at the right level to answer here?** Yes.

**Why it matters:**
- Vector fields are naturally multi-buffer (U/V), and treating them as two unrelated scalar layers is exactly the failure mode we want to escape.
- Composites also unlock higher-level views like “wind vector field” without forcing immediate pipeline changes.

**Recommendation (maximal):**
- Yes: allow composite data types, but treat them as **viewer registry constructs**, not pipeline primitives.
- The registry should be able to define a composite by matching a small set of required component layers (e.g. `windU` + `windV`) and then exposing projections over the composite.
- Long-term, we should still move canonical composites into the pipeline as multi-field representations for stability and perf (but composites let us ship meaning quickly).

### 12.3 Should `spaceId` be explicit, inferred, or both?

**Question:** Do we require emitted layers to declare a coordinate space, or can the viewer infer via registry rules?

**Is this at the right level to answer here?** Yes.

**Why it matters:**
- Coordinate-space bugs are silent and expensive: they look like “the viz is wrong” even when the data is right.
- For DX, we want authors to not think about spaces unless it matters, but we also want correctness.

**Recommendation (maximal, inference-friendly but safe):**
- Support both, with a clear priority order:
  1) explicit `spaceId` on the layer descriptor (highest authority),
  2) registry-derived `spaceId` from `dataTypeId` patterns (back-compat + reasonable defaults),
  3) last-resort defaults (documented, and ideally only for legacy).
- For *new* layers (v1+), require either:
  - explicit `spaceId`, or
  - a registry rule that covers the `dataTypeId`.

This avoids forcing authors to redundantly annotate every layer, while still preventing “unknown space” drift.

### 12.4 Where should value-domain semantics live: on the layer, in the registry, or both?

**Question:** Should `ValueSpec` be emitted with the layer descriptor, or be provided by the registry (or both)?

**Is this at the right level to answer here?** Yes.

**Why it matters:**
- `ValueSpec` is *semantic intent* (units, scale, no-data), which is stable and should not depend on viewer implementation details.
- But we also want low author burden: don’t require redundant annotation when types and IDs already imply intent.

**Recommendation (maximal, type-inferred where safe):**
- Allow both, with a simple rule:
  - Producers may emit `valueSpec` when they know it (best for correctness and portability).
  - The viewer registry supplies defaults when omitted (best for back-compat and DX).
- Provide producer-side helpers so authors almost never hand-write `valueSpec`:
  - e.g. `defineContinuousScalarGridMeta({ units: \"m\" })` / `defineCategoricalGridMeta({ categories })`

### 12.5 Are stats required for continuous rendering?

**Question:** Do we require `stats.min/max` for continuous fields, or allow the viewer to compute them lazily?

**Is this at the right level to answer here?** Yes.

**Why it matters:**
- Correct continuous rendering depends on domains. Without stats, the viewer either lies (clamps) or pays scanning cost.
- For streaming runs, scanning in the main thread is a non-starter for large payloads.

**Recommendation (maximal, performance-safe):**
- Make stats “strongly expected” for continuous fields:
  - Required for streaming continuous layers (worker supplies stats with the payload).
  - Optional but recommended for dump manifests (viewer can compute on first load as a back-compat fallback).
- Treat “viewer computed stats” as legacy support, not the steady state.

### 12.6 Who owns projections and defaults: pipeline or viewer?

**Question:** Should the pipeline ever control projections (e.g. “default projection is hillshade”), or is that purely viewer-owned?

**Is this at the right level to answer here?** Yes.

**Why it matters:**
- We want multiple projections per data type, and we want to avoid pipeline bloat.
- We also want stable defaults so a new layer is immediately meaningful without UI fiddling.

**Recommendation (maximal, clean separation):**
- Projections are viewer-owned (registry-driven).
- The pipeline may optionally provide *hints* (e.g. suggested palette/units) via `meta`/`valueSpec`, but should not dictate projection availability.
- The viewer registry is the single place that decides:
  - default projection per data type (or composite),
  - additional available projections,
  - projection parameter defaults.

### 12.7 How hard do we version: v1 manifest/protocol cutover vs perpetual v0?

**Question:** Do we version-bump the viz manifest/protocol and ship an adapter, or keep v0 forever and “extend in place”?

**Is this at the right level to answer here?** Yes.

**Recommendation (maximal, long-term health):**
- Version-bump to v1 for the contract we actually want (identity split, value semantics, stats, explicit space).
- Keep a v0→v1 adapter in the viewer (and optionally in tooling) so old dumps continue to load.
- Avoid “extend v0 forever”: it will keep identity/space/value semantics ambiguous and force heuristics into core code paths.

### 12.8 What is the canonical layer identity: `layerKey` vs `(stepId, layerId, kind)`?

**Question:** In v1, do we require `layerKey` as the single source of identity everywhere, or continue deriving identity from `(stepId, layerId, kind)`?

**Is this at the right level to answer here?** Yes.

**Why it matters:**
- We already have the concept of variants (`fileKey`), and the moment producers emit multiple variants, derived keys will collide and silently drop data.
- Stable identity is foundational for store correctness, selection retention, and diffing.

**Recommendation (maximal, correctness-first):**
- Require `layerKey` as the canonical identity for v1 across:
  - streaming events,
  - dump manifests,
  - Studio ingest/store.
- Make `layerKey` opaque and producer-owned (the viewer does not “recompute” it).
- Provide producer-side helpers so authors never hand-construct keys:
  - keys should be deterministically derived from stable inputs (step + data type + representation + optional variant), but generated centrally to avoid drift.

### 12.9 How do we maximize DX without forcing fragile explicitness?

**Question:** Where should we draw the line between “explicit metadata” and “safe inference”, so the system remains ergonomic but correct?

**Is this at the right level to answer here?** Yes.

**Recommendation (maximal, TypeScript-first):**
- Prefer *typed constructors/helpers* that encode intent, and let defaults be inferred from the shape:
  - If `categories` are provided → categorical (no need to separately declare palette).
  - If `ValueSpec` is omitted but registry declares the data type continuous → continuous defaults apply (domain from stats).
  - If stats are present and `domain` is `fromStats` → normalization is automatic.
- Avoid inference from ad-hoc string heuristics in random places:
  - If we do infer from `dataTypeId`, it should be via a centralized registry rule (so it’s auditable and testable).
- Invest in a small set of producer-facing helpers that keep author burden near-zero:
  - `viz.grid.scalar(...)`, `viz.grid.categorical(...)`, `viz.grid.vectorField(...)`, `viz.points.scalar(...)`, etc.
  - These should set the minimal metadata needed for correctness (space/valueSpec/stats) while keeping call sites terse.
