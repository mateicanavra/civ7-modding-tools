# Status: Project doc (MapGen Studio)

This page describes implementation-oriented details and may drift.
It is **not** canonical MapGen visualization documentation.

Canonical entrypoints:
- `docs/system/libs/mapgen/reference/VISUALIZATION.md`
- `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`

# Viz SDK v1 (v1-only) — Visualization contract for MapGen Studio + MapGen pipeline

**Status:** Implemented
**Date:** 2026-02-01

This document describes the **implemented** v1 visualization contract used end-to-end:
- the MapGen pipeline emits layers (streaming + dump replay)
- MapGen Studio ingests a v1 manifest model and renders layers via deck.gl

**No legacy support:** MapGen Studio and the dump viewer only accept `manifest.json` with `version: 1`. There are **no adapters/shims** for older formats. See `apps/mapgen-studio/src/features/dumpViewer/manifest.ts`.

---

## 1) Source of truth (the contract package)

- Shared types + helpers: `packages/mapgen-viz/src/index.ts` (package: `@swooper/mapgen-viz`)
- Studio v1 model (re-export + local types): `apps/mapgen-studio/src/features/viz/model.ts`

---

## 2) Core concepts and invariants

### 2.1 Identity

- **`layerKey`** (`VizLayerKey`): canonical, stable identity of a layer within a run.
  - Producers generate it via `createVizLayerKey(...)` in `packages/mapgen-viz/src/index.ts`.
  - Studio treats it as **opaque** and uses it as the upsert key for streaming ingest:
    - `apps/mapgen-studio/src/features/viz/ingest.ts`
- **`dataTypeKey`** (`VizDataTypeKey`): stable semantic identity for the underlying data product.
  - Example: `"morphology.routing.flow"` or `"hydrology.wind.wind"`.
  - Multiple layers can share a `dataTypeKey` (e.g. seasonal variants).
- **`variantKey`** (`VizVariantKey`, optional): differentiates distinct variants of the same data product.
  - Example: `variantKey: "season:2"` in `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/steps/climateBaseline.ts`.

### 2.2 Coordinate space (UI name: **Space**)

Every layer declares its coordinate space via **`spaceId`**:
- tile spaces: `"tile.hexOddR"`, `"tile.hexOddQ"`
- non-tile spaces: `"mesh.world"`, `"world.xy"`

MapGen Studio’s Explore panel treats **`spaceId` as the Space selector**, and groups layers as:
`dataTypeKey → spaceId → kind[:role] → variantKey`

See:
- grouping model: `apps/mapgen-studio/src/features/viz/dataTypeModel.ts`
- UI controls: `apps/mapgen-studio/src/ui/components/ExplorePanel.tsx`

### 2.3 Layer kinds

`VizLayerKind` is one of:
- `grid`: scalar grid (tile space only, rendered as hex polygons)
- `points`: point geometry with optional scalar values
- `segments`: line segments with optional scalar values
- `gridFields`: multiple scalar grids with optional vector semantics

All layer kinds share the identity envelope (`VizLayerIdentityV1`):
- `kind`, `layerKey`, `dataTypeKey`, `variantKey?`, `stepId`, `phase?`, `spaceId`, `bounds`, `meta?`

---

## 3) Value semantics (continuous fields that look correct)

### 3.1 Scalar formats

Scalar fields are typed by `VizScalarFormat`:
`"u8" | "i8" | "u16" | "i16" | "i32" | "f32"`

### 3.2 `VizScalarField` (stats + valueSpec)

A scalar field is represented as:
- `format`: numeric encoding (typed array view)
- `data`: `VizBinaryRef` (`path` for dumps, `inline` for worker streaming)
- `stats?`: `min/max` (and optionally mean/stddev)
- `valueSpec?`: optional semantic hints for normalization / transforms / units

MapGen Studio uses `stats` (or computes min/max) to normalize continuous values correctly instead of clamping raw values to `[0,1]`:
- `apps/mapgen-studio/src/features/viz/presentation.ts`
- `apps/mapgen-studio/src/features/viz/deckgl/render.ts`

### 3.3 `VizValueSpec` (what Studio currently honors)

Studio’s mapping behavior (see `resolveUnitValue` in `apps/mapgen-studio/src/features/viz/presentation.ts`):
- If `meta.palette === "categorical"` or `meta.categories` is present, values are treated as categorical.
- Otherwise, values are treated as continuous and mapped to a unit interval via:
  - optional `valueSpec.noData` (sentinel / NaN / none)
  - optional `valueSpec.transform` (identity/clamp/affine/piecewise/normalize)
  - `valueSpec.domain` (explicit/unit/fromStats) falling back to `{ kind: "fromStats" }` if stats exist
  - `valueSpec.scale` (`linear`/`log`/`symlog`)

---

## 4) Vector + multi-field grids (`gridFields`)

`gridFields` layers hold multiple named scalar fields (`fields: Record<string, VizScalarField>`).

Optionally, a `gridFields` layer can describe a vector field via:
```ts
vector?: { u: string; v: string; magnitude?: string }
```

When `vector` is present, Studio renders:
- a scalar base fill (typically `magnitude` if present, otherwise a chosen scalar field)
- a vector arrow overlay

Implementation:
- renderer: `apps/mapgen-studio/src/features/viz/deckgl/render.ts`
- worker streaming “auto-magnitude” helper for inline vector fields: `apps/mapgen-studio/src/browser-runner/worker-viz-dumper.ts`

---

## 5) Dump format (manifest + data folder)

### 5.1 Folder layout

A dump run folder contains:
- `manifest.json` (v1)
- `trace.jsonl` (optional, debugging)
- `data/*.bin` (binary payloads referenced by `manifest.json`)

Producer implementation (MapGen mod):
- dumper + manifest writer: `mods/mod-swooper-maps/src/dev/viz/dump.ts`

### 5.2 `VizManifestV1`

The manifest schema is `VizManifestV1` (see `packages/mapgen-viz/src/index.ts`):
- `version: 1`
- `runId`, `planFingerprint`
- `steps: Array<{ stepId; phase?; stepIndex }>`
- `layers: VizLayerEntryV1[]` (each includes `stepIndex`)

Dump viewer validation is strict:
- `apps/mapgen-studio/src/features/dumpViewer/manifest.ts`

---

## 6) Streaming format (worker → UI)

MapGen Studio streaming uses:

1) Worker emits trace events `viz.layer.emit.v1` carrying `VizLayerEmissionV1`:
   - `apps/mapgen-studio/src/browser-runner/worker-viz-dumper.ts`
2) Worker trace sink converts them to UI events `viz.layer.upsert` with `VizLayerEntryV1`:
   - `apps/mapgen-studio/src/browser-runner/worker-trace-sink.ts`
3) Main-thread store ingests/upserts by `layerKey`:
   - `apps/mapgen-studio/src/features/viz/ingest.ts`

Inline binary payloads are transferred using Transferables when possible:
- `collectTransferables(...)` in `apps/mapgen-studio/src/browser-runner/worker-trace-sink.ts`

---

## 7) End-to-end examples (real)

### 7.1 Plate movement vector field (tile space)

- Producer: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts`
  - Emits:
    - `foundation.plates.tileMovementU` (grid)
    - `foundation.plates.tileMovementV` (grid)
    - `foundation.plates.tileMovement` (gridFields with `vector: { u, v, magnitude }`)

### 7.2 Wind + current (mean + seasonal variants)

- Producer: `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/steps/climateBaseline.ts`
  - Emits mean vector fields:
    - `hydrology.wind.wind` (gridFields)
    - `hydrology.current.current` (gridFields)
  - Emits seasonal variants via `variantKey: season:<s>` for richer exploration:
    - `hydrology.wind.wind` + `variantKey: season:<s>`
    - `hydrology.current.current` + `variantKey: season:<s>`

### 7.3 Routing flow vectors

- Producer: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/routing.ts`
  - Emits:
    - `morphology.routing.flowDir` (grid)
    - `morphology.routing.flowAccum` (grid)
    - `morphology.routing.flow` (gridFields vector derived from flow receiver indices + accumulation magnitude)

---

## 8) Authoring guidance (producer-side)

### 8.1 Prefer `defineVizMeta(dataTypeKey, ...)`

Use `defineVizMeta` to standardize labels/groups/visibility without re-authoring boilerplate:
- `packages/mapgen-core/src/dev/viz-meta.ts`

### 8.2 When you want multiple “spaces” / representations

In Studio, multiple representations are expressed as **multiple layers that share a `dataTypeKey` but differ by**:
- `spaceId` (primary “Space” selector),
- and/or `kind` / `meta.role`,
- and/or `variantKey`.

This keeps `dataTypeKey` stable (semantic identity) while allowing multiple representations and variants without collisions.
