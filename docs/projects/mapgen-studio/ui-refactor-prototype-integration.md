# MapGen Studio UI Refactor - Prototype Integration Plan

Source prototype (reference-only, do not wire directly): `apps/mapgen-studio/src/DELETE-WHEN-DONE/mapgen-studio-prototype-magic-patterns`

This document explains:
- What the prototype UI *means* (its intended mental model)
- How it maps to the current Studio runner/viz architecture
- The missing/changed data contracts needed to wire real data into it
- A phased integration plan that keeps the engine recipe-agnostic and avoids performance regressions

## 0) Non-negotiables (constraints)

- Studio engine is **recipe-agnostic**.
  - No baked-in assumptions like "standard", "foundation", or stage-specific naming in shared engine/UI primitives.
  - Stage/step/layer/projection are *concepts*; their *IDs* and ordering come from the loaded recipe.
- "Layers" represent **distinct data**; "projections" are **render transforms over that data**.
  - A layer may have multiple projections.
  - Projections should be a small stable vocabulary (built-in), optionally extended by recipes.
- "Stages" are the top-level organizing principle.
  - Steps belong to stages.
  - Selected step drives available layers; selected layer drives available projections.
- React owns **UI state and intent**; it does not own the WebGL render loop.
  - deck.gl stays imperative/hosted (current `DeckCanvas` / `renderDeckLayers` approach).
  - Viz ingestion remains external-store based (useSyncExternalStore-style) and RAF-coalesced.
- Workers remain long-lived dedicated workers with cooperative cancel.
  - The UI sends thin messages (seed, map size, config override patch), not giant "effective configs".

## 1) Prototype mental model (what we are adopting)

Prototype composition (`src/App.tsx`):
- **Header**: world settings (mode/map size/player count/resources) + view controls
- **Left panel**: recipe selection + config editing + "enable overrides"
- **Right panel**: explorer (Stage -> Step -> Layer) + view toolbar (Fit, Edges, Projection)
- **Footer**: status + seed + reroll + run

Prototype state buckets:
- Generation state: status + world settings + recipe settings + pipeline config
- View state: selectedStage, selectedStep, selectedLayer, selectedProjection (+ showGrid/showEdges)

Important prototype intent:
- Stage selector is primary; step selector is stage-scoped; layer list is step-scoped.
- Projections are explicitly selectable and are not "data".

## 2) Current Studio architecture (real data + contracts)

Current entrypoint: `apps/mapgen-studio/src/App.tsx`

### 2.1 Browser runner (worker)

- Worker lives at `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts`
- Inputs:
  - recipeId
  - seed
  - map size + dimensions + latitude bounds
  - `configOverrides` (sparse patch)
- Worker behavior:
  - merges patch onto recipe default config (`mergeDeterministic`)
  - validates via `normalizeStrict` against recipe schema
  - compiles + runs recipe
  - streams viz layers as events (upserts) by stepId

### 2.2 Viz store + deck.gl rendering

- Viz state is derived from:
  - stream manifest (browser mode) or dump manifest (dump mode)
  - current selection (selectedStepId + selectedLayerKey)
- Render pipeline:
  - `useVizState` resolves selected layer entry, loads assets, renders deck.gl layers via `renderDeckLayers`
  - There's no notion of "projection" yet; rendering is implicit based on `VizLayerEntryV0.kind`

### 2.3 Recipe artifacts (UI-side) vs runtime recipes (worker-side)

UI-side artifacts: `apps/mapgen-studio/src/recipes/catalog.ts`
- currently: `{ id, label, configSchema, defaultConfig }`
- used for: config overrides UI and recipe dropdown

Worker-side runtime recipes: `apps/mapgen-studio/src/browser-runner/recipeRuntime.ts`
- used only in worker / runner boundary

## 3) The critical mismatches (prototype vs reality)

### 3.1 Stage and step lists cannot be derived from config

Prototype derives stages from `Object.keys(config)`.
Reality: recipe default config is frequently sparse (e.g. `{}`), and schema defaults do not materialize stages.

Therefore: the UI must get stage ordering + step list from **recipe artifacts metadata**, not from the config object.

### 3.2 "Layer" in the prototype is not the same as a stream layer entry

Reality has `VizLayerEntryV0` entries keyed by:
- stepId
- layerId (semantic ID)
- kind (grid/points/segments)
- optional fileKey (unique discriminator)

Prototype "layer" is a *data type* and must not encode its projection/render form.

Therefore: Studio needs a representation like:
- `LayerId` (data type; stable)
- `ProjectionId` (render transform; small stable vocabulary)
- `LayerDatasetKey` (optional: data variants like fileKey/era slices; only if we must surface them)

### 3.3 Projections must be explicit

Currently, "projection" is implicit (kind -> renderer).
Prototype requires a projection selector.

Therefore: `renderDeckLayers` must accept a `projectionId` (and possibly parameters), and selection state must include it.

### 3.4 Stage -> step -> layer -> projection hierarchy must be first-class

Today:
- selection is stepId + layerKey
- UI is header-centric, not stage-centric

Target:
- stage is the top container
- steps are stage-scoped
- selected step drives layers
- selected layer drives projections

## 4) Proposed data contracts (recipe-agnostic)

### 4.1 Stage/step identity

Add a recipe-agnostic parsing utility (and avoid hardcoding recipe names):

- `StageId`: opaque string
- `StepId`: opaque string (existing)
- `StepRef`: `{ stepId: StepId; stageId: StageId; stepLabel: string; stageLabel?: string }`

Default rule (fallback):
- `stageId = stepId.split('.').slice(0, -1).join('.')` (if no '.', stageId = stepId)
- `stepLabel = stepId.split('.').slice(-1)[0] ?? stepId`

Preferred rule:
- recipe artifacts provide explicit stage/step ordering and labels (see below).

### 4.2 Viz layer model (data vs projection)

Introduce a UI-level model separate from `VizLayerEntryV0`:

- `LayerId`: semantic data ID (use `VizLayerEntryV0.layerId`)
- `ProjectionId`: stable render vocabulary (examples; final list comes from prototype + needs)
  - `hex-fill` (grid -> filled hexes)
  - `heatmap` (grid -> smooth heatmap)
  - `points` (points -> scatter)
  - `segments` (segments -> lines)
  - `categorical` (grid/points/segments -> categorical palette)
  - `continuous` (grid/points/segments -> continuous palette)

Notes:
- `VizLayerEntryV0.kind` is **not** the projection. It constrains which projections are possible.
- A recipe can opt into projections by tagging layer meta (e.g. `meta.palette`, `meta.categories`, `meta.space`).
- `meta.role` remains for tooling overlays (edgeOverlay etc.), not for stage/step naming.

### 4.3 Expand recipe artifacts to support the UI (without importing runtime)

Extend `RecipeArtifacts` with a UI descriptor bundle:

```
type RecipeArtifacts = {
  id: StudioRecipeId;
  label: string;
  configSchema: unknown;
  defaultConfig: unknown;
  studio?: {
    stages: Array<{
      stageId: string;
      label: string;
      steps: Array<{ stepId: string; label: string }>;
    }>;
    // Optional: declared layer catalog per step (preferred for pre-run browsing),
    // otherwise Studio derives layers from the run manifest after execution.
    viz?: {
      // A stable, recipe-owned mapping that says:
      // for a given step, which layerIds exist, and which projections are meaningful.
      steps?: Array<{
        stepId: string;
        layers: Array<{
          layerId: string;
          label?: string;
          group?: string;
          projections?: Array<{ id: string; label: string }>;
        }>;
      }>;
    };
  };
}
```

Key point: this keeps Studio agnostic (it consumes a generic structure), while letting recipes define stage/step ordering and layer/projection availability.

## 5) Integration plan (phased, safe, mechanical)

This is intentionally staged so we can land incremental PRs and keep Studio runnable.

### Phase 1 - Introduce "UI model" adapters (no UI overhaul yet)

Goal: create the data model the prototype wants, derived from existing runtime + artifacts.

Deliverables:
- `apps/mapgen-studio/src/features/uiModel/stageStepModel.ts`
  - derive stage list + steps list:
    - prefer `recipeArtifacts.studio.stages`
    - fallback: derive from current manifest stepIds via parsing
- `apps/mapgen-studio/src/features/uiModel/layerProjectionModel.ts`
  - derive layer list for selected step:
    - group manifest layers by `layerId` (data type)
  - derive projection list for selected layer:
    - based on `VizLayerEntryV0.kind` + `meta.palette/categories/space`
    - optionally augmented by `recipeArtifacts.studio.viz`

Acceptance:
- No behavior change to current UI.
- Unit tests for stage parsing and layer grouping.

### Phase 2 - Add projection selection to viz state + renderer

Goal: keep the existing viz store, but add `selectedProjectionId` and wire it into rendering.

Deliverables:
- `apps/mapgen-studio/src/features/viz/vizStore.ts`
  - add `selectedProjectionId` + setter
  - selection reconciliation rules:
    - if projection becomes invalid for the selected layer, pick default
- `apps/mapgen-studio/src/features/viz/deckgl/render.ts`
  - accept `projectionId` and choose renderer accordingly

Acceptance:
- Existing runs render the same by default.
- Switching projections changes render style without changing underlying layer data.

### Phase 3 - Build the new layout as a parallel UI (feature-flagged)

Goal: mount the prototype-inspired UI without deleting the existing one yet.

Deliverables:
- `apps/mapgen-studio/src/app2/` (or `features/ui-next/`) with:
  - `AppHeader` replacement (world settings + view controls)
  - `RecipePanel` replacement (recipe selection + config editor)
  - `ExplorePanel` replacement (stage -> step -> layer + toolbar)
  - `AppFooter` replacement (status + seed + run controls)
- A single "adapter container" that binds:
  - browser runner actions
  - config overrides controller
  - viz state (including projection)
  - recipe artifacts (including stage/step metadata)

Acceptance:
- New UI loads, can run browser recipe, can switch stage/step/layer/projection, can fit view, can toggle edges/grid.
- No "UI flash then disappear" regressions (useSyncExternalStore snapshot stays cached/stable).

### Phase 4 - Replace config overrides UX with the prototype intent

Goal: make "enable overrides" cheap and make config editing reflect stage-first navigation.

Key simplification:
- Avoid deep "merge" work on click.
- Keep schema stable; avoid remounting thousands of nodes.
- Prefer editing values via a small, stage-scoped UI instead of a global schema form.

Implementation options (pick 1 after we wire the prototype layout):
1) Keep RJSF, but move it behind stage/step navigation and keep it mounted (visibility toggle only).
2) Replace RJSF with a recipe-provided "config surface descriptor" (preferred long-term).

Acceptance:
- Clicking "enable overrides" does not cause long main-thread stalls.
- Reroll/run does not trigger full UI refresh.

### Phase 5 - Delete old UI + cleanup

Goal: remove duplicate UI paths and make the prototype layout the only UI.

Deliverables:
- delete old `apps/mapgen-studio/src/app/*` header UI
- delete old overlays/controls that are no longer used
- remove the prototype reference folder under `DELETE-WHEN-DONE` once fully integrated

Acceptance:
- `bun run --cwd apps/mapgen-studio dev` works and UI is fully functional.
- Tests pass.

## 6) What I would ask the prototyping agent to change (if we delegate)

If we want the prototype components to drop into the real app with minimal churn, ask the prototyping agent to:

1) Make all "options" data-driven via props
   - Remove hardcoded `RECIPE_OPTIONS`, `LAYER_OPTIONS`, `PROJECTION_OPTIONS`, `KNOB_OPTIONS`
   - Replace with:
     - `recipes: Array<{ id; label }>`
     - `stages: Array<{ id; label; index }>`
     - `steps: Array<{ id; label; index; stageId }>`
     - `layers: Array<{ id; label; group? }>`
     - `projections: Array<{ id; label; icon? }>`

2) Remove derivation from `config` shape for stage/step lists
   - Stage/step lists must not depend on `Object.keys(config)` or `config[selectedStage].advanced`.

3) Rename "layer" + "projection" semantics to match our target model
   - layer = data type
   - projection = render transform

4) Keep local UI state only for "panel is collapsed" style toggles
   - All selection state (stage/step/layer/projection) should be controlled externally (props + callbacks).

5) Avoid cloning the full config on every keystroke
   - Replace `JSON.parse(JSON.stringify(config))` update strategy with a path-based patch callback:
     - `onConfigPatch(patch: { path: string[]; value: unknown })`

## 7) Immediate next action (for implementation work)

Before touching UI components, we should first add the missing recipe-agnostic model types and adapters (Phase 1), because:
- the prototype cannot be wired meaningfully until stage/step and layer/projection concepts exist in our data model
- we need to keep the engine recipe-agnostic while still enabling rich UI

