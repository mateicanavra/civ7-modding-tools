id: LOCAL-TBD
title: MapGen Studio UI refactor — prototype integration prep
state: planned
priority: 1
estimate: 8
project: mapgen-studio
milestone: null
assignees: [codex]
labels: [ui, refactor]
parent: null
children: []
blocked_by: []
blocked: []
related_to: []
---

## TL;DR
- **No pipeline architecture changes**: stages remain stages, steps remain steps, and ops remain internal details (not first-class in the UI).
- Studio’s runtime/viz is already **step-contract-level** (step ids are full ids like `mod-swooper-maps.standard.foundation.mesh`).
- “Layers as data types” vs “projections as render modes” is a real mismatch with Studio today: the current viz stream treats **(layerId × kind × fileKey)** as the selectable unit.
- Prototype “World Settings” includes `playerCount` + `resources` strategy, while Studio today derives player counts from Civ7 `MapInfo` (via map size id) and always calls `adapter.generateResources(...)` with no mode.
- Stage/step ↔ config focus must be derived from the **authored recipe/stage source** (e.g. `createStage({ public, compile })` mappings), not from heuristics.
- Integration should be staged as: (1) generate “recipe UI meta” from recipe source into `*-artifacts`, (2) introduce a shared “pipeline address” model (recipe/stage/step), (3) add a “dataType + renderMode” view model over existing viz layers, (4) drop in the prototype UI, (5) wire it to the real runner/viz/config, then delete legacy UI.

## Prototype packet location
- `apps/mapgen-studio/src/DELETE-WHEN-DONE/mapgen-studio-prototype-magic-patterns`

## Current Studio (today) — relevant contracts
**Runner + viz stream**
- Browser runs stream `VizEvent`s from a Web Worker:
  - `apps/mapgen-studio/src/browser-runner/protocol.ts`
  - `apps/mapgen-studio/src/shared/vizEvents.ts`
  - `apps/mapgen-studio/src/features/viz/ingest.ts`
  - `apps/mapgen-studio/src/features/viz/model.ts`
- The viz selection unit is currently the “layer entry” (effectively **projection already baked in**):
  - key: `${stepId}::${layerId}::${kind}[::${fileKey}]`
  - kind: `grid | points | segments`
  - fileKey: stable suffix for multiple files per (stepId, layerId, kind)

**Stages already exist in authored recipes**
- MapGen Core authoring has explicit stages (separate from engine “phase”):
  - `packages/mapgen-core/src/authoring/recipe.ts` computes `fullStepId = <namespace>.<recipeId>.<stageId>.<stepId>`
- Current trace/viz does not carry `stageId` explicitly; it’s embedded in `stepId` (string).

## Prototype (intended UI) — relevant model
- Prototype view model:
  - `stage`: top-level selector (e.g. `foundation`, `morphology-pre`)
  - `step`: selected “step” drives available data types + render modes
  - `dataType` (formerly layer): “what data is visualized”
  - `renderMode` (formerly projection): “how data is transformed/rendered”
- Prototype config model mirrors current recipe public schemas: `stage.knobs` + `stage.advanced.<category>.<opName>` (example: `foundation.advanced.mesh.computeMesh`).

## Key mismatches to resolve
### 1) What is a “step” in the new UI?
Steps in the refactor are **step-contracts** (not ops). Ops remain internal implementation detail; the UI should not surface them as first-class entities.

**Implication for the prototype packet:** treat any “op-like step names” (e.g. `computeMesh`) as a prototype artifact; the integrated UI should instead offer real **step ids** (e.g. `mesh`, `crust`, `resource-basins`, etc.) and keep “op names” as optional labels/description text only when it helps a human connect a config field to an underlying op.

### 2) “Layers are data types” vs current viz layer entries
Today, “layers” in Studio already mix:
- pipeline artifacts (true data)
- pipeline-owned projections/mocks (e.g. `map.*` IDs)
- render representation (grid/points/segments) baked into selection

**Needed view-model layer:** `DataType` groups one or more underlying viz entries (“projections/render modes”) that share the same artifact identity.

**Provisional grouping rule (UI-only, no pipeline changes):**
- `dataTypeId := layerId` (stable, documented in `docs/projects/mapgen-studio/VIZ-LAYER-CATALOG.md`)
- `renderModeId := kind` plus a small stable suffix derived from meta when it meaningfully changes interpretation (e.g. `grid/categorical` vs `grid/continuous`, `segments/edgeOverlay` via `meta.role`)
- treat `fileKey` as a variant selector only when it meaningfully changes the semantic view (avoid exploding the selector cardinality by default)

This gets us to the intended mental model immediately, and later we can promote a real “projection id” into metadata if needed.

### 3) Prototype “World Settings” vs Studio runner inputs
Prototype’s `WorldSettings` includes:
- `mapSize` (maps to Studio’s `browserMapSizeId`)
- `mode` (`browser`/`dump`), already supported by Studio’s top-level mode
- `playerCount`
- `resources` (`balanced`/`strategic`)

Studio today:
- derives player counts from Civ7 `MapInfo` for the selected map size id (`PlayersLandmass1/2`, etc.)
- always calls `adapter.generateResources(width, height)` during placement (no strategy/mode)

**Decision (browser runner only):** `playerCount` + `resources` are **UI inputs** when running outside the Civ engine (MapGen Studio / mock adapter). They must not become “author config” and must not be required/overridable when running inside the real Civ engine.

Implementation direction:
- Browser runner: pass these values as **mock adapter/mapInfo inputs** so steps that query `MapInfo` see them.
- Engine runner: values come from the game UI + engine `MapInfo`; do not allow overrides.

## Mapping rules (recipe/stage/step ↔ config)
Goal: make “stage/step selection” first-class in the view while keeping “config” first-class for pre-generation, **without changing the pipeline**.

We cannot rely on naïve heuristics like `config[stageId].advanced[stepId]` because stages may compile authored config keys into different step ids (example: ecology stage compiles `resourceBasins` → step id `resource-basins`).

**Plan:** export “Studio recipe UI meta” alongside schema/defaults in `mod-swooper-maps/recipes/*-artifacts` (generated). That meta provides:
- stage order
- step ids per stage (step-contract ids)
- step → authored-config path mapping (where the config editor should focus)

The meta is derived from the authored recipe/stage definitions at build time (safe for Studio; does not touch pipeline runtime behavior).

### Concrete derivation algorithm (build-time; no pipeline changes)
We can (and should) derive mapping from the same authoring surfaces the pipeline uses:
- `createStage(...)` attaches `surfaceSchema` and wraps `compile(...)` via `toInternal(...)` (see `packages/mapgen-core/src/authoring/stage.ts`).
- Stages without `public` already expose step ids directly in their surface config keys (internal-as-public surface).
- Stages with `public + compile` may rename keys (camelCase → kebab-case, grouping under `advanced`, etc.).

For each stage contract:
1) Collect `stageId` and ordered `stepContractIds` from `stage.steps[].contract.id`.
2) Derive `stepId → authoredConfigPathWithinStage`:
   - **Case A (no `public`)**: surface keys are step ids → `pathWithinStage = [stepId]`.
   - **Case B (`public` has `advanced.{<stepId>: ...}`)**: detect `advanced` with properties matching step ids → `pathWithinStage = ["advanced", stepId]`.
   - **Case C (`public` uses non-step-id keys and `compile` maps them)**: invert the mapping by calling `stage.toInternal({ env: {}, stageConfig: { knobs: {}, ...sentinels } })` where each authored public key gets a unique sentinel value; then map each `rawSteps[stepId]` back to the authored key whose sentinel was forwarded.

If none of the cases can produce a one-to-one mapping for all `stepContractIds`, the generator should fail with a clear error and require an explicit per-stage override map in the recipe module (this keeps behavior correct and avoids “helpful” heuristics).

## Integration plan (high-level, Graphite branch map)
1) **UI-00 (docs):** lock down definitions + open questions
   - Add/update this issue doc; link to prototype packet; record mapping assumptions.
2) **UI-01 (artifacts meta):** generate “Studio recipe UI meta”
   - Extend `mods/mod-swooper-maps/scripts/generate-studio-recipe-types.ts` to emit `*-artifacts` exports that include:
     - stage order (from `recipe.stages`)
     - steps per stage (from `stage.steps`)
     - per-step `configFocusPath` (from the derivation algorithm above)
   - Update `apps/mapgen-studio/src/recipes/catalog.ts` `RecipeArtifacts` to include this meta.
3) **UI-02 (model):** introduce shared “pipeline address” parsing
   - Add a small utility to parse full step ids into `{ recipeKey, stageId, stepContractId }`.
   - Expose stage+step groupings in the viz selectors (no UI overhaul yet).
4) **UI-03 (view model):** introduce `dataType` + `renderMode` selector model over current `VizManifestV0`
   - Derive:
     - available stages
     - available steps (grouped)
     - available data types (grouped by `layerId`)
     - available render modes (derived from underlying entries)
   - Keep `VizManifestV0` as-is initially; this is a pure adapter layer.
5) **UI-04 (UI shell):** land the prototype layout (header/left/right/footer) behind a feature flag or parallel route
   - Keep it fully controlled; wire to existing store/hook state.
   - Swap `DeckCanvas` in as the visualization background.
6) **UI-05 (wiring):** connect real data + run controls
   - Recipe selection + seed + map size → existing browser runner inputs.
   - Pipeline config editing → existing `recipeArtifacts.configSchema` + default config + overrides patching.
   - Stage selector → derived from recipe schema/compiled config keys.
   - “Step” selector → resolved per decision (A/B/C).
   - Data type + render mode → derived from viz manifest adapter.
7) **UI-06 (delete legacy):** remove old `AppHeader`-driven UI and any obsolete state
   - Keep dumps replay working.
8) **UI-07 (polish + docs):** update docs + tests
   - Update `docs/projects/mapgen-studio/VIZ-LAYER-CATALOG.md` only if IDs/groups change.
   - Add a minimal unit test for stepId parsing + dataType/renderMode derivation (vitest).

## Implementation Decisions
### UI step semantics
- **Choice:** steps are step-contracts (ops are not first-class in the UI).
- **Risk:** prototype packet needs small rewiring to match this mental model (acceptable; prototype is an intent signal, not a pipeline contract).

### Decide initial `renderModeId` vocabulary
- **Context:** Prototype has `renderMode` as a small stable set; Studio has `kind` + `fileKey`.
- **Options:** (1) `renderModeId := kind`, (2) `renderModeId := kind + fileKey`, (3) introduce explicit projection id in metadata/protocol.
- **Choice:** start with (1), treat `fileKey` as an internal variant; revisit if UI needs explicit toggles.
- **Risk:** hiding `fileKey` may strand access to useful variants; exposing it may explode the selector cardinality.

## Delegation (prototype agent handoff prompt)
If we want the prototype packet to be “drop-in” for Studio wiring, ask the prototyping agent to:
- Rename `RecipePanelProps.selectedStep` → `selectedStage` (the current usage already passes `view.selectedStage`).
- Update `StepOption` to represent **step contracts** (not ops):
  - `value: string` is the step-contract id (e.g. `resource-basins`)
  - `label: string` can be a human label (e.g. `Resource basins`)
  - `category: string` can be the stage id (or a UI grouping label), not an op/category
- Stop filtering `dataTypeOptions` via `dt.value === category`; instead accept `dataTypeOptions` already filtered/ordered by the host app.
- Make `renderModeOptions` support an extra `isAvailable`/`disabled` bit per mode so the host can show the stable vocabulary even when a mode isn’t possible for the selected data type.
