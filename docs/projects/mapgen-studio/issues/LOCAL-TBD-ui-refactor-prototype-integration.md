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

## Objective (what “done” means for this doc)
This document is the last prep pass before implementation of the UI refactor. “Done” for this doc means:
- The intended UI mental model is explicit and unambiguous.
- The scope boundaries are explicit (especially around “no pipeline changes”).
- The sequencing/DAG is clear and each slice has a verifiable “done” state.
- Any remaining uncertainty is surfaced as explicit prework prompts or open questions (not silently decided).

## Readiness checklist (before saying “go implement”)
- [x] Guardrails are accepted (no pipeline changes; browser-only world inputs).
- [x] UI-01 meta strategy is accepted (derive mapping from recipe source; no Studio heuristics).
- [x] Open questions are understood as “non-blocking unless they become blocking” (we start with Option A and escalate only if forced).

## Path variables (paper trail)
```yaml
vars:
  STUDIO: apps/mapgen-studio/src
  SWOOPER: mods/mod-swooper-maps/src
  SWOOPER_SCRIPTS: mods/mod-swooper-maps/scripts
  CORE: packages/mapgen-core/src
```

## Prototype packet location
- `apps/mapgen-studio/src/DELETE-WHEN-DONE/mapgen-studio-prototype-magic-patterns`

## Guardrails (non-negotiable)
**Pipeline semantics**
- Stages are stages, steps are steps, ops are ops.
- We can improve how Studio *maps and presents* these concepts, but we must not change pipeline internals/contracts as part of this refactor.

**Runtime boundaries**
- Map settings as UI inputs (e.g. `playerCount`, `resources`) are allowed only for Studio/browser runs (mock adapter / mock MapInfo).
- These must never become overridable inputs in engine-run contexts (engine MapInfo comes from the game UI).

**Import boundary**
- Studio UI must import recipe `*-artifacts` modules (schema/defaults/meta) and not runtime recipe modules (enforced by ESLint).
  - `eslint.config.js`

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

## Definitions (terms used consistently)
- **Recipe**: an authored pipeline definition (`createRecipe(...)`) with an ordered list of stages.
- **Stage**: an authored grouping of steps (`createStage({ id, steps, knobsSchema, public?, compile? })`).
- **Step (UI step)**: a **step contract** (`step.contract.id`) that appears as part of the pipeline and trace/viz stream. Not an op name.
- **Operation (op)**: a runtime function call within a step (internal detail). Ops may influence config naming but are not first-class in Studio’s UI.
- **Config focus path**: the *authored* location in recipe config that “corresponds to” a given stage/step for UI editing focus.

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

## Integration plan (implementation-ready work breakdown)
This section is “the contract”: each slice should be completable independently, should keep the codebase working, and should have clear verification.

**Sequencing / dependency graph**
```yaml
deps:
  UI-00: []
  UI-01: [UI-00]
  UI-02: [UI-01]
  UI-03: [UI-02]
  UI-04: [UI-03]
  UI-05: [UI-01, UI-02, UI-03, UI-04]
  UI-06: [UI-05]
  UI-07: [UI-06]
```

### UI-00 (docs): definitions + constraints are locked
**Acceptance criteria**
- [ ] This doc contains explicit definitions/guardrails, the mapping algorithm, and the work breakdown below.
- [ ] Open questions/prework prompts are explicit; no ambiguous “A/B/C” placeholders remain.

**Verification**
```bash
bun run check
```

### UI-01 (artifacts meta): generate “Studio recipe UI meta”
Generate **UI-facing meta** alongside schema/defaults in `*-artifacts` (so Studio can import it without pulling in runtime recipe modules).

**Acceptance criteria**
- [x] Each Studio recipe artifacts module exports `studioRecipeUiMeta` that includes:
  - stage order (from `recipe.stages`)
  - steps per stage (from `stage.steps`)
  - per-step `configFocusPathWithinStage` derived from the concrete algorithm above
- [x] Studio’s `RecipeArtifacts` type includes the meta and catalog wires it for each recipe.
- [x] Generator fails loudly if it cannot derive a total mapping for a stage (no silent fallbacks).

**In scope**
- Generator changes in `SWOOPER_SCRIPTS` and wiring into `STUDIO` catalog/types.
- Minimal shape that unblocks UI selectors and config focus (no “nice to have” fields yet).

**Out of scope**
- Any changes to pipeline runtime behavior.
- Any changes to trace/viz event format.

**Implementation guidance**
```yaml
files:
  - path: mods/mod-swooper-maps/scripts/generate-studio-recipe-types.ts
    notes: Emit a meta export into each `*-artifacts` module, plus matching `.d.ts` typing.
  - path: mods/mod-swooper-maps/src/recipes/standard/recipe.ts
    notes: This is the authoritative stage ordering source (do not duplicate order elsewhere).
  - path: packages/mapgen-core/src/authoring/stage.ts
    notes: Use `stage.steps`, `stage.public?`, and `stage.toInternal(...)` to derive mapping; no heuristics.
  - path: apps/mapgen-studio/src/recipes/catalog.ts
    notes: Extend `RecipeArtifacts` and wire meta into the Studio recipe catalog.
```

**Verification**
```bash
bun run check
```

**Prework prompts (only if needed during implementation)**
- Confirm stage mapping coverage: enumerate all stages in `mod-swooper-maps` recipes and ensure they are handled by Case A/B/C; if any fail, add an explicit override map *in the recipe module* (not in Studio).

### UI-02 (model): introduce shared “pipeline address” parsing
Add a Studio-side utility to reliably parse step ids into `{ recipeKey, stageId, stepId }` so selectors can group by stage/step.

**Acceptance criteria**
- [x] Studio has a helper that parses *full* step ids (e.g. `mod-swooper-maps.standard.foundation.mesh`) into a structured address.
- [x] UI state/model uses `stageId` derived from parsing (not string slicing the last segment).

**Implementation guidance**
```yaml
files:
  - path: apps/mapgen-studio/src/features/viz/presentation.ts
    notes: Keep `formatStepLabel` for labels only; use structured parsing for grouping and identity.
  - path: apps/mapgen-studio/src/features/viz/model.ts
    notes: Keep manifest shape; add adapters/utilities around it.
```

**Verification**
```bash
bun run check
```

### UI-03 (view model): `dataType` + `renderMode` over existing viz manifest
Introduce a pure adapter layer that projects the current `VizManifestV0` into the prototype’s `dataType` + `renderMode` model without changing the viz protocol.

**Acceptance criteria**
- [x] “Data type” groups are stable and primarily keyed by `layerId` (with documented exceptions only).
- [x] Render mode is a small vocabulary derived from `kind` plus a stable suffix when semantics require it (e.g. `meta.role`).
- [x] `fileKey` does not explode the primary selector by default; it can be surfaced as a secondary variant only when needed.

**Verification**
```bash
bun run check
```

### UI-04 (UI shell): land the prototype layout (controlled)
Bring the prototype layout into the real Studio app as a controlled UI shell (no fake data), in parallel with the existing UI until wiring is complete.

**Acceptance criteria**
- [x] Prototype layout renders in Studio and uses controlled props/state.
- [x] Deck canvas remains the visualization surface.
- [x] Existing UI remains functional until UI-06.

**Verification**
```bash
bun run check
```

### UI-05 (wiring): connect runner/viz/config to the prototype UI
Wire the controlled prototype shell to real Studio state:
- recipe selection
- seed + mode + map size
- stage/step selectors derived from `studioRecipeUiMeta`
- config editing focus via `configFocusPathWithinStage`
- data type + render mode via the adapter from UI-03

**Acceptance criteria**
- [x] Selecting stage/step updates available data types and render modes (driven by the selected step’s outputs in the viz stream).
- [x] Config editor focuses the correct authored config location for the selected stage/step.
- [x] Browser-only world settings inputs do not leak into engine-run code paths.

**Verification**
```bash
bun run check
```

### UI-06 (delete legacy): remove old UI and obsolete state
Remove the legacy UI once the prototype shell is fully wired.

**Acceptance criteria**
- [x] Legacy UI components/state are removed.
- [x] Dumps replay mode continues to function.

**Verification**
```bash
bun run check
```

### UI-07 (polish + docs): tests + documentation updates
**Acceptance criteria**
- [ ] Add minimal unit tests for parsing + grouping logic (where the codebase’s existing test setup supports it).
- [ ] Update `docs/projects/mapgen-studio/VIZ-LAYER-CATALOG.md` only if selector identities/groups changed.

**Verification**
```bash
bun run check
```

## Milestone-level open questions (must stay explicit)
1) Render mode vocabulary: what is the minimal stable “projection/renderMode” set that works across future recipes without being too physics-specific?
   - Option A: `renderMode := kind` (start here; simplest).
   - Option B: `renderMode := kind + role` for a short allowlist of `meta.role` semantics.
   - Option C: promote an explicit projection id in viz meta/protocol (NOT in scope for this refactor unless forced).
2) `fileKey` surfacing: when should `fileKey` be a first-class toggle vs a hidden variant?
   - Guideline: only surface if it changes semantic meaning (not just “same data, different encoding”).

## Implementation Decisions
### UI step semantics
- **Choice:** steps are step-contracts (ops are not first-class in the UI).
- **Risk:** prototype packet needs small rewiring to match this mental model (acceptable; prototype is an intent signal, not a pipeline contract).

### Decide initial `renderModeId` vocabulary
- **Context:** Prototype has `renderMode` as a small stable set; Studio has `kind` + `fileKey`.
- **Options:** (1) `renderModeId := kind`, (2) `renderModeId := kind + fileKey`, (3) introduce explicit projection id in metadata/protocol.
- **Choice:** start with (1), treat `fileKey` as an internal variant; revisit if UI needs explicit toggles.
- **Risk:** hiding `fileKey` may strand access to useful variants; exposing it may explode the selector cardinality.

### Browser-only world settings
- **Choice:** Studio `playerCount` sets `MapInfo.PlayersLandmass1/2` (same value) for browser runs only.
- **Choice:** Studio `resourcesMode` is carried as `MapInfo.StudioResourcesMode` in browser runs only (currently informational; not consumed by the pipeline).
- **Risk:** these fields must never become overridable for engine-run contexts.

## Delegation (prototype agent handoff prompt)
If we want the prototype packet to be “drop-in” for Studio wiring, ask the prototyping agent to:
- Rename `RecipePanelProps.selectedStep` → `selectedStage` (the current usage already passes `view.selectedStage`).
- Update `StepOption` to represent **step contracts** (not ops):
  - `value: string` is the step-contract id (e.g. `resource-basins`)
  - `label: string` can be a human label (e.g. `Resource basins`)
  - `category: string` can be the stage id (or a UI grouping label), not an op/category
- Stop filtering `dataTypeOptions` via `dt.value === category`; instead accept `dataTypeOptions` already filtered/ordered by the host app.
- Make `renderModeOptions` support an extra `isAvailable`/`disabled` bit per mode so the host can show the stable vocabulary even when a mode isn’t possible for the selected data type.
