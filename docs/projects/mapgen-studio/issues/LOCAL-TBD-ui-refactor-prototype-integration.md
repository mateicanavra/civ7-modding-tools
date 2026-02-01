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
- The prototype’s mental model aligns with MapGen Core’s authored **recipe → stage → step-contract** structure, but its “step” selector is currently **op-level** (e.g. `computeMesh`) while Studio’s runtime/viz is **step-contract-level** (e.g. `foundation.mesh`).
- “Layers as data types” vs “projections as render modes” is a real mismatch with Studio today: the current viz stream treats **(layerId × kind × fileKey)** as the selectable unit.
- Integration should be staged as: (1) introduce a shared “pipeline address” model (recipe/stage/step), (2) add a “dataType + renderMode” view model over existing viz layers, (3) drop in the prototype UI, (4) wire it to the real runner/viz/config, then delete legacy UI.

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
Prototype “step” values are op-level names (e.g. `computeMesh`, `computeTectonicHistory`) derived from `stage.advanced.<category>.<opName>`.

Studio runtime/viz “stepId” is step-contract-level (e.g. `mod-swooper-maps.standard.foundation.mesh`), and layer emissions attach to that stepId.

**Options**
- **A) UI “step” = step-contract** (mesh/crust/tectonics/…): simplest wiring; differs from prototype naming.
- **B) UI “step” = op name (prototype)**, but selection maps to an owning step-contract:
  - display: `computeMesh`
  - internal: `{ stageId, category(stepContractId)=mesh, opId=computeMesh }`
  - data types/render modes are derived from the owning step-contract’s viz emissions (or from op-tagged emissions if we later tag them).
- **C) Split step-contracts so runtime steps become op-level** (largest/riskiest; not “mostly mechanical”).

**Provisional recommendation:** start with **B** (preserve prototype UX) without changing runtime execution; treat `category` as the real step-contract id and `step` as the selected op within that contract (used for config focus + future highlighting).

### 2) “Layers are data types” vs current viz layer entries
Today, “layers” in Studio already mix:
- pipeline artifacts (true data)
- pipeline-owned projections/mocks (e.g. `map.*` IDs)
- render representation (grid/points/segments) baked into selection

**Needed view-model layer:** `DataType` groups one or more underlying viz entries (“projections/render modes”) that share the same data identity.

**Provisional grouping rule (UI-only, no pipeline changes):**
- `dataTypeId := layerId` (stable, documented in `docs/projects/mapgen-studio/VIZ-LAYER-CATALOG.md`)
- `renderModeId := kind` (+ maybe `fileKey` when it meaningfully changes the visualization; otherwise treat `fileKey` as an internal variant)

This gets us to the intended mental model immediately, and later we can promote a real “projection id” into metadata if needed.

## Integration plan (high-level, Graphite branch map)
1) **UI-00 (docs):** lock down definitions + open questions
   - Add/update this issue doc; link to prototype packet; record mapping assumptions.
2) **UI-01 (model):** introduce shared “pipeline address” parsing
   - Add a small utility to parse full step ids into `{ recipeKey, stageId, stepContractId }`.
   - Expose stage+step groupings in the viz selectors (no UI overhaul yet).
3) **UI-02 (view model):** introduce `dataType` + `renderMode` selector model over current `VizManifestV0`
   - Derive:
     - available stages
     - available steps (grouped)
     - available data types (grouped by `layerId`)
     - available render modes (derived from underlying entries)
   - Keep `VizManifestV0` as-is initially; this is a pure adapter layer.
4) **UI-03 (UI shell):** land the prototype layout (header/left/right/footer) behind a feature flag or parallel route
   - Keep it fully controlled; wire to existing store/hook state.
   - Swap `DeckCanvas` in as the visualization background.
5) **UI-04 (wiring):** connect real data + run controls
   - Recipe selection + seed + map size → existing browser runner inputs.
   - Pipeline config editing → existing `recipeArtifacts.configSchema` + default config + overrides patching.
   - Stage selector → derived from recipe schema/compiled config keys.
   - “Step” selector → resolved per decision (A/B/C).
   - Data type + render mode → derived from viz manifest adapter.
6) **UI-05 (delete legacy):** remove old `AppHeader`-driven UI and any obsolete state
   - Keep dumps replay working.
7) **UI-06 (polish + docs):** update docs + tests
   - Update `docs/projects/mapgen-studio/VIZ-LAYER-CATALOG.md` only if IDs/groups change.
   - Add a minimal unit test for stepId parsing + dataType/renderMode derivation (vitest).

## Implementation Decisions
### Decide UI “step” semantics before wiring
- **Context:** Prototype step selector is op-level; Studio runtime is step-contract-level.
- **Options:** A/B/C (above).
- **Choice:** pending (need confirmation).
- **Risk:** picking the wrong level causes either major runtime refactors (if we later want C) or user-visible mismatch (if we choose A).

### Decide initial `renderModeId` vocabulary
- **Context:** Prototype has `renderMode` as a small stable set; Studio has `kind` + `fileKey`.
- **Options:** (1) `renderModeId := kind`, (2) `renderModeId := kind + fileKey`, (3) introduce explicit projection id in metadata/protocol.
- **Choice:** start with (1), treat `fileKey` as an internal variant; revisit if UI needs explicit toggles.
- **Risk:** hiding `fileKey` may strand access to useful variants; exposing it may explode the selector cardinality.

## Delegation (prototype agent handoff prompt)
If we want the prototype packet to be “drop-in” for Studio wiring, ask the prototyping agent to:
- Rename `RecipePanelProps.selectedStep` → `selectedStage` (the current usage already passes `view.selectedStage`).
- Change `StepOption` to carry both the user-facing `value` and an explicit owner id:
  - `owner: { stageId: string; stepContractId: string }`
  - keep `value` as op name (`computeMesh`) if we choose option B.
- Stop filtering `dataTypeOptions` via `dt.value === category`; instead accept `dataTypeOptions` already filtered/ordered by the host app.
- Make `renderModeOptions` support an extra `isAvailable`/`disabled` bit per mode so the host can show the stable vocabulary even when a mode isn’t possible for the selected data type.

