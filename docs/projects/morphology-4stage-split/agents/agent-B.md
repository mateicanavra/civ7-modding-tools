# Agent B — Morphology 4-Stage Split

## Scope
Inventory Studio + viz surfaces that depend on stage/step identifiers, focusing on what changes when Morphology stages are split (`morphology-pre/mid/post` → `morphology-{coasts,routing,erosion,features}`), and recommend an author-facing label strategy that stays legible even when full step ids change.

## Coupling Findings

### Full Step Id Is A Cross-Cutting Contract (Not Just A Display String)
- Full step ids are constructed as dot-joined segments with `stageId` and `stepId` as the last two parts: `${namespace}.${recipeId}.${stageId}.${stepId}`. `packages/mapgen-core/src/authoring/recipe.ts:58`
- Studio groups steps into stages (dump mode) by parsing that dot structure and taking `stageId = parts[-2]`, `stepId = parts[-1]`. `apps/mapgen-studio/src/shared/pipelineAddress.ts:10`
- Studio’s bundled `uiMeta` repeats the same full-step-id shape when generating `fullStepId` for browser-mode selection. `mods/mod-swooper-maps/scripts/generate-studio-recipe-types.ts:188`

### Studio Uses Two Different “Stage/Step Sources” Depending On Mode
- Browser mode stage list comes from recipe-authored `uiMeta` (build-time), with stage dropdown values = `stage.stageId`. `apps/mapgen-studio/src/App.tsx:424`
- Browser mode step dropdown values = `uiMeta.steps[*].fullStepId`, but the displayed label is only `uiMeta.steps[*].stepId` (contract id). `apps/mapgen-studio/src/App.tsx:440`
- Dump mode stage list comes from the viz manifest (`viz.pipelineStages`), built by parsing manifest step ids. `apps/mapgen-studio/src/features/viz/useVizState.ts:113`
- Dump mode step labels are `address.stepId` (last segment of the full step id), falling back to the raw step id if parsing fails. `apps/mapgen-studio/src/App.tsx:454`

### Viz Layer Identity Is StepId-Coupled By Design
- A viz `layerKey` is derived from `stepId` and begins with `${stepId}::...`. `packages/mapgen-viz/src/index.ts:204`
- Studio retention explicitly depends on that prefix convention (`pinnedLayerKey.startsWith(\`${pinnedStepId}::\`)`). `apps/mapgen-studio/src/features/browserRunner/retention.ts:8`
- Worker-emitted viz layers set `layer.stepId = trace.stepId` and compute `layerKey` via `createVizLayerKey({ stepId: trace.stepId, ... })`, so any full step id change implies layerKey change. `apps/mapgen-studio/src/browser-runner/worker-viz-dumper.ts:79`
- Disk dumps also derive filenames from `layerKey` (`slugify(layerKey)`), so changing full step ids changes dumped data filenames (manifest remains authoritative). `mods/mod-swooper-maps/src/dev/viz/dump.ts:150`

### Selection + Retention Behavior When Ids Don’t Match
- On rerun, Studio captures the current selection and clears the viz stream; it preserves the selected step iff `selectedStepId` is non-null, and preserves the selected layer iff the layerKey still “belongs” to that step via the prefix rule. `apps/mapgen-studio/src/App.tsx:482` and `apps/mapgen-studio/src/features/browserRunner/retention.ts:12`
- After a run finishes, if the selected step id is not present in the manifest, Studio resets selection to the first available step and clears the selected layer. `apps/mapgen-studio/src/features/viz/useVizState.ts:150`
- Consequence for the hard cutover: anything that “remembers” old full step ids (tests, trace configs, user mental model) will not map automatically; Studio will gracefully fall back to the first step/layer in the new manifest when ids no longer exist. `apps/mapgen-studio/src/features/viz/useVizState.ts:137`

### Trace Verbosity Config Also Keys On Full Step Ids
- Tests demonstrate `env.trace.steps` is keyed by full step id strings like `mod-swooper-maps.standard.morphology-mid.routing`. `mods/mod-swooper-maps/test/morphology/tracing-observability-smoke.test.ts:34`
- Studio’s browser worker sets all compiled plan nodes to verbose by full step id (`plan.nodes[*].stepId`). `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts:141`

## Recommended Label Strategy (Author-Facing)

### Principle: Treat Ids As Opaque; Treat Labels As UX
- Keep using ids for wiring/selection (`stageId`, `fullStepId`, `layerKey`), but avoid displaying ids raw to authors except as optional debug text. `apps/mapgen-studio/src/App.tsx:424`
- Avoid encoding stage/step naming into viz `role`; it’s intended to be a small stable vocabulary like `"edgeOverlay"`, not recipe-step naming. `packages/mapgen-viz/src/index.ts:74`

### Stage Labels
- Continue deriving a human stage label from `stageId` by default (kebab → Title Case). Today this is `formatStageName(stageId)` and already used for stage dropdowns. `apps/mapgen-studio/src/ui/utils/formatting.ts:13` and `apps/mapgen-studio/src/App.tsx:424`
- For Morphology’s 4-way split, prefer short, semantic stage ids that format well:
- `morphology-coasts`, `morphology-routing`, `morphology-erosion`, `morphology-features` (so default formatting yields acceptable stage labels). `docs/projects/morphology-4stage-split/INVESTIGATION-PLAN.md`

### Step Labels
- Make “step label” be the contract `stepId` (last segment) formatted for humans, not the full step id.
- Today the viz UI extracts the last segment (`formatStepLabel`) but does not title-case it. `apps/mapgen-studio/src/features/viz/presentation.ts:35`
- Recommended: a consistent “title-cased step label” for both browser and dump modes (derived from `stepId`), so `landmass-plates` becomes `Landmass Plates` without depending on the stage id. `apps/mapgen-studio/src/App.tsx:440` and `apps/mapgen-studio/src/ui/utils/formatting.ts:13`

### Optional: Explicit Labels In `uiMeta` (If We Want More Than Title-Case)
- If we want labels that are not trivially derivable (e.g. `Geomorphology` → `Erosion` as the stage name changes, or richer display like `Landmass (Plates)`), add explicit `stageLabel` and `stepLabel` fields to `StudioRecipeUiMeta` at generation time.
- The natural choke point is the generator that currently emits `{ stageId, steps: [{ stepId, fullStepId, ... }] }`. `mods/mod-swooper-maps/scripts/generate-studio-recipe-types.ts:188`
- Dump mode won’t have `uiMeta` for arbitrary folders, so it should continue to fall back to derived labels from parsed ids. `apps/mapgen-studio/src/features/viz/useVizState.ts:118`

## Breadcrumbs
- `packages/mapgen-core/src/authoring/recipe.ts` (full step id construction)
- `mods/mod-swooper-maps/scripts/generate-studio-recipe-types.ts` (Studio `uiMeta` fullStepId generation)
- `apps/mapgen-studio/src/shared/pipelineAddress.ts` (dump-mode stage/step parsing)
- `apps/mapgen-studio/src/App.tsx` (browser vs dump stage/step sources; rerun retention)
- `packages/mapgen-viz/src/index.ts` (viz layerKey shape; meta role intent)
- `apps/mapgen-studio/src/features/browserRunner/retention.ts` (layer retention prefix coupling)
- `apps/mapgen-studio/src/browser-runner/worker-viz-dumper.ts` and `apps/mapgen-studio/src/browser-runner/worker-trace-sink.ts` (stepId → layer emission path)
- `mods/mod-swooper-maps/src/dev/viz/dump.ts` (disk dump filenames derived from layerKey)
- `mods/mod-swooper-maps/test/morphology/tracing-observability-smoke.test.ts` (trace verbosity keyed by full step id)
