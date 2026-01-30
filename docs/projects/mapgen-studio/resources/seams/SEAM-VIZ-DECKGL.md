# agent-viz-deckgl — deck.gl host seam + normalized viz model (scratch)

Update note (2026-01-29):
- This seam was originally written when the UI used a “contract vs internal/debug” layer catalog + toggle.
- The current stack has simplified this: viz layers now carry embedded `meta?: VizLayerMeta` (label/group/visibility/categories) and the UI derives picker labels/legend/colors from `meta` (no contract/internal toggle).
- Treat `VizLayerMeta` as the primary presentation surface; keep string-based heuristics as fallback only.

## 1) Files reviewed

- `apps/mapgen-studio/src/App.tsx`
- `apps/mapgen-studio/src/browser-runner/protocol.ts`
- `apps/mapgen-studio/src/browser-runner/foundation.worker.ts`
- `apps/mapgen-studio/src/browser-runner/worker-trace-sink.ts`
- `apps/mapgen-studio/src/browser-runner/worker-viz-dumper.ts`
- (context) `packages/mapgen-core/src/core/types.ts` (`VizDumper` contract, `fileKey` semantics)
- (context) `mods/mod-swooper-maps/src/dev/viz/dump.ts` (how dumps/`manifest.json` are produced)
- (context) `docs/system/libs/mapgen/pipeline-visualization-deckgl.md` (design intent for coordinate spaces + registry)

## 2) Viz responsibilities today (what it renders, how layers are built)

### What the “viz host” currently does (all inside `App.tsx`)

- Owns the **“manifest” model** (`VizManifestV0` + `VizLayerEntryV0`) used by both:
  - **dump viewer mode** (loads `manifest.json` + binaries from a selected folder)
  - **browser runner mode** (builds an in-memory manifest from worker messages)
- Owns **selection + derived state**:
  - active `stepId`
  - active `layerKey` (string)
  - layer list presentation rules:
    - picker labels and legend titles derive from `layer.meta?.label ?? layer.layerId`
    - `layer.meta?.visibility === "debug"` is surfaced in labeling (current behavior: suffix `", debug"`)
    - when `layer.meta?.categories` exists, legend + colors are categorical (meta-driven)
  - `effectiveLayer` indirection for tectonic-history “era” layers (parses `foundation.tectonicHistory.eraN.*`)
- Owns **rendering of deck.gl layers** from the selected layer:
  - `grid` → `PolygonLayer` (pointy-top hex polygons)
  - `points` → `ScatterplotLayer`
  - `segments` → `PathLayer`
  - optional overlays:
    - “mesh edges” overlay: `foundation.mesh.edges` rendered as a non-pickable `PathLayer`
    - background dot grid overlay (a `ScatterplotLayer`) computed from viewState/viewport
- Owns **coordinate transforms** (tile hex layouts):
  - “row-offset” (odd-r) vs “col-offset” (odd-q) handling
  - conversion from tile `(x,y)` to world `(px,py)` for both centers and arbitrary points
- Owns **color + legend logic**:
  - ad-hoc legend rules for `boundaryType`, crust type, plate ids
  - generic palette for scalar-ish values (clamped to 0..1)
  - special “plate palette” generation seeded by `runId:layerId` (categorical; tries to separate colors perceptually)
  - (newer) meta-driven categorical colors + legend when `layer.meta?.categories` is present
- Owns **bounds + fit logic**:
  - `fitToBounds` for view state
  - for grid layers: derives world bounds via `boundsForTileGrid(tileLayout, dims, tileSize)`
  - for points/segments: uses `bounds` included on the layer entry (assumed already in world space)

### How the “selected layer” turns into deck.gl

In `App.tsx` the “deck layers” computation is effectively:

1. Identify `effectiveLayer` (selected layer, possibly era-substituted).
2. Resolve data for that layer:
   - **dump mode:** read the binary from `fileMap` by path (`layer.path`, `positionsPath`, etc.) and decode to typed arrays.
   - **browser mode:** reuse the `ArrayBuffer` received from the worker and decode to typed arrays.
3. Normalize geometry to deck.gl’s world space:
   - `grid`: generate a hex polygon for each tile and attach the scalar value.
   - `points` / `segments`: for some layer IDs (currently only `foundation.plateTopology.*`) interpret positions/segments as tile XY and convert into world points; otherwise treat them as already in world.
4. Build deck.gl layer instances + overlays.

## 3) Data flow inventory

### What events/data come from worker (browser runner)

**Protocol:** `apps/mapgen-studio/src/browser-runner/protocol.ts`

- `run.started`: `{ runId, planFingerprint, runToken }`
- `run.progress`: `{ kind: "step.start" | "step.finish", stepId, phase?, stepIndex, durationMs? }`
- `viz.layer.upsert`:
  - `layer`: `{ kind, layerId, stepId, phase?, stepIndex, bounds, ...dims/count/valueFormat..., key }`
  - `payload`:
    - grid: `{ values: ArrayBuffer, valuesByteLength, format }`
    - points: `{ positions: ArrayBuffer, values?: ArrayBuffer, valueFormat? }`
    - segments: `{ segments: ArrayBuffer, values?: ArrayBuffer, valueFormat? }`
- `run.finished`
- `run.error`: structured error with optional stack/details

**Where they originate:**

- `foundation.worker.ts` injects `context.viz = createWorkerVizDumper()` (which emits trace events of shape `{ type: "layer.stream", ... }`).
- `worker-trace-sink.ts` maps trace events to the browser protocol, cloning typed arrays into `ArrayBuffer`s and transferring them to the main thread (`postMessage(..., transfer)`).

### What normalization happens in UI today

Inside `App.tsx` the runner messages are normalized into a “manifest-like” state:

- `run.started`:
  - initializes a new in-memory `VizManifestV0` with empty steps/layers.
  - note: `planFingerprint` is currently set to `runId` by the worker.
- `run.progress`:
  - only handles `step.start` (ignores `step.finish` today)
  - appends to `manifest.steps` if new
  - sets `selectedStepId` to the first seen step if not already set
- `viz.layer.upsert`:
  - converts `BrowserVizLayerEntry + payload` into `VizLayerEntryV0` (inline `ArrayBuffer`s)
  - upserts into `manifest.layers` by computed key `${stepId}::${layerId}::${kind}`
  - sets initial `selectedLayerKey` (first layer for the “desired” step)

This makes the UI behave like a **manifest viewer**, even in streaming mode.

### What the “layer registry” concept should be (and why)

Today, “registry logic” is scattered and implicit:

- coordinate-space choice is inferred from `kind` + `layerId` string prefixes
- layer labels/visibility/categories come from `layer.meta` when present; remaining heuristics still rely on `layerId` checks
- legend/palette choice is inferred from `layerId` string contains/endsWith checks
- overlay choice (mesh edges) is inferred from `layerId` prefixes + `kind`
- “era slider” behavior is inferred from a specific layerId regex

A **layer registry** should centralize these decisions so that:

- layer meaning (space, palette, legend, grouping) is **declared**, not guessed
- deck.gl rendering becomes a pure mapping from:
  - `(layer descriptor + resolved data + registry)` → `DeckGLLayer[]`
- both “dump viewer” and “browser runner” share the exact same visualization semantics.

Concretely: the registry should map a `layerId` (or pattern) to a `VizLayerDefinition`:

- `space`: `tileHexOddR | tileHexOddQ | meshWorld | ...`
- `visibility` + label/group: primarily from `VizLayerMeta` (debug/hidden tagging, label/group for picker grouping)
- `paletteId` / `scale`: `categorical(plateIds) | crustType | boundaryType | continuous(0..1?) | continuous(min/max?)`
- `legend`: structured legend model derived from scale + (optional) data stats
- `overlays`: e.g. `meshEdges` as an optional overlay dependency
- `controls`: e.g. `eraIndex` control for `tectonicHistory.eraN.*`
- `grouping`: how it appears in the layer list (domain/category/subcategory)

## 4) Hidden couplings with runner (timing, retention) and how to decouple

### Coupling A: “manifest is runner output”

`App.tsx` treats runner events as if the runner’s job is to “produce manifest entries”.
That bakes in dump-viewer semantics (steps/layers as lists) into the runtime path.

**Decouple by:**

- define a **viz ingest API** that accepts *events*, not “manifest mutation”
- keep the canonical unit as `VizEvent` (run/step/layer upserts), and let viz state *derive* a manifest/index view.

### Coupling B: Layer identity is recomputed and lossy

The protocol already includes `layer.key`, but `App.tsx` ignores it and rebuilds a key from `(stepId, layerId, kind)`.
This creates future collisions if the pipeline uses `VizDumper.fileKey` (already supported by `mapgen-core`) to emit multiple variants per step/layerId.

**Decouple by:**

- treat “layer identity” as an opaque, runner-provided `layerKey` (string) at the seam.
- define `VizLayerId` split into:
  - `layerKey` (unique identity)
  - `layerId` (stable semantic identifier, used for registry lookup)

### Coupling C: Coordinate space is guessed from `layerId`

The UI assumes:

- grid layers are in tile space (reasonable)
- `foundation.plateTopology.*` points/segments are in tile space (converted)
- other points/segments are already in “world” space (not converted)

This is brittle (a new layerId prefix changes rendering) and hides a key semantic: *space*.

**Decouple by:**

- add `space` into the layer descriptor (preferred), or
- compute it via registry rules in the viz module (acceptable), but not via ad-hoc checks in `App.tsx`.

### Coupling D: Step indices are “first-seen order”

Both the browser trace sink and the dump sink assign `stepIndex` when a step is first seen in tracing.
This is stable only if execution order is stable and tracing is exhaustive.

**Decouple by:**

- treat step ordering as a **presentation concern** (viz state can sort by `stepIndex` if present, else arrival order),
- and treat `stepIndex` as *advisory* (not required for correctness).

### Coupling E: Retention/selection depends on timing of stream

Selection logic is tied to streaming arrival:

- selected step may be “pinned” across reruns; layers arriving for the pinned step auto-select a layer
- “browser” mode re-run tries to retain selection while steps/layers stream back up to it

**Decouple by:**

- model selection as a separate, explicit `VizSelectionState` that is independent from ingest:
  - selection can be “desired” (`desiredStepId`, `desiredLayerKey`) even if not yet present
  - derived `activeSelection` resolves to the closest available choice
- expose “selection resolution” in `useVizState()` rather than ad-hoc refs in `App.tsx`.

## 5) Extraction proposal

### Suggested modules under `apps/mapgen-studio/src/features/viz/`

The goal is to pull *visualization host responsibilities* out of `App.tsx` while keeping runner code isolated.

Proposed module layout (documentation-only; names are suggestions):

- `apps/mapgen-studio/src/features/viz/model.ts`
  - normalized types: `VizEvent`, `VizRun`, `VizStep`, `VizLayer`, `VizLayerDataRef`, `VizSelectionState`, `VizLegendModel`
- `apps/mapgen-studio/src/features/viz/registry.ts`
  - `VizLayerRegistry` + default registry rules (layerId → definition: space/palette/legend/controls/overlays)
  - `tectonicHistory` era-family rule lives here (not in App)
- `apps/mapgen-studio/src/features/viz/ingest.ts`
  - reducer/state machine: `reduceVizState(state, event)`; stable indexing by `layerKey`
  - optional retention policies (e.g. max layers, drop old runs)
- `apps/mapgen-studio/src/features/viz/resolve.ts`
  - pluggable resolver for data references:
    - inline buffers from streaming
    - “dump folder” references (path → `ArrayBuffer`)
- `apps/mapgen-studio/src/features/viz/deckgl/render.ts`
  - pure mapping: `(vizState, selection, registry, resolver, viewParams) => { layers, stats, bounds }`
  - responsible for tile-hex geometry, mesh-edge overlay, background grid overlay
- `apps/mapgen-studio/src/features/viz/useVizState.ts`
  - public hook that binds the above together

### Normalized viz state model (IoC-friendly)

Key design principle: **runner pushes events; viz consumes them.**
Viz should not know “web worker” exists.

#### Proposed core types (sketch)

- `VizEvent` (runner-agnostic)
  - `run.started` / `run.finished` / `run.error`
  - `step.upsert` (can represent start/finish; optional duration)
  - `layer.upsert` (descriptor + data reference)
- `VizLayerDataRef`
  - `inline`: `{ kind, buffer, format? }` (from streaming)
  - `asset`: `{ kind, uri, format?, byteLength? }` (from dump viewer / hosted replay)
  - (optional) `derived`: `{ kind, compute: () => ... }` for layers computed client-side
- `VizLayerDescriptor`
  - identity: `{ layerKey, layerId, kind }`
  - provenance: `{ runId, stepId, phase?, stepIndex? }`
  - geometry meta: `dims` (grid) / `count` (points/segments)
  - semantics: optionally `space`, `tags`, `paletteId` (or allow registry to supply them)
  - bounds: ideally `nativeBounds` + derived `worldBounds(space, layout)`

This enables:

- a single ingest pipeline for both dump and streaming
- multiple producers (worker, server replay, tests) feeding the same consumer

### `useVizState()` API shape (takes runner outputs/events; returns deck.gl-ready model)

The hook should accept **inputs**, not reach into worker state:

- an `ingest(event: VizEvent)` callback
- optional environment inputs:
  - `tileLayout` + (if needed) `tileSize`
  - `viewport` + `viewState` (for background grid overlay)
  - `resolver` for non-inline assets (dump mode)
  - `registry` override/injection

And return:

- `deckLayers: Layer[]` (already resolved for the current selection)
- `steps: VizStepSummary[]` and `layersForStep: VizLayerSummary[]`
- `selection: VizSelectionState` + setters (`setSelectedStepId`, `setSelectedLayerKey`, `setEraIndex`, etc.)
- `legend: VizLegendModel | null`
- `activeBounds: Bounds | null` (for “fit view” button)
- (optional) `status`: run state + loading states (`resolving`, `error`)

Important: this makes `App.tsx` responsible only for:

- creating a runner and adapting runner events → `VizEvent`
- wiring UI controls → `useVizState()` setters
- passing `deckLayers` to `<DeckGL />`

### Dependency rules (hard seam)

- `apps/mapgen-studio/src/features/viz/**`:
  - may import: deck.gl, small math helpers, shared types
  - must not import: `apps/mapgen-studio/src/browser-runner/**`
  - must not reference: `BrowserRunEvent`, `BrowserVizLayerPayload`, etc.
- `apps/mapgen-studio/src/browser-runner/**`:
  - owns worker protocol + trace sink + viz dumper injection
  - may export adapter helpers (e.g. `toVizEvent(msg): VizEvent`) but those should live outside `features/viz/`

This keeps “viz” reusable for:

- dump viewer mode
- worker streaming mode
- future server replay / CI artifacts

## 6) Risks + validation

### Risks

- **Coordinate-space regressions:** today’s implicit heuristics are easy to accidentally change; a registry makes this explicit but must be authored correctly.
- **Layer identity collisions:** if/when `VizDumper.fileKey` is used, the current `(stepId, layerId, kind)` key will collapse distinct layers; moving to `layerKey` is mandatory.
- **Memory pressure:** storing large `ArrayBuffer`s in React state works for V0 sizes but scales poorly; the extracted model should make retention policies explicit.
- **Async resolution complexity:** mixing inline buffers and file-backed buffers requires a resolver + caching; the current “promise in useMemo” approach is easy to duplicate incorrectly.
- **Step ordering correctness:** `stepIndex` is currently derived from event arrival; UI ordering should not assume it matches plan order unless the producer guarantees it.

### Validation checklist (for the seam, not implementation)

- **Equivalence check:** same seed + same layerId in dump vs browser runner renders identically (space, palette, legend, bounds).
- **Identity check:** two layers with same `layerId` but different `fileKey` can coexist (requires using `layerKey` end-to-end).
- **Selection retention:** re-run while pinned to a later step keeps selection “desired” until the layer appears, without flicker to earlier layers.
- **Overlay correctness:** mesh-edge overlay aligns with mesh-space layers only; background grid overlay remains stable under zoom/pan.
- **Failure handling:** `run.error` does not corrupt the previous run’s viz state unless explicitly reset.
