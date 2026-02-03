# Agent C — Morphology 4-Stage Split

## Scope
- Draft decision packets for: (1) hard boundaries between the new truth stages, (2) what “Studio labels”/identity signals must remain stable during the split.
- Propose Graphite-friendly migration slices (prepare → cutover → cleanup) that respect the “hard cutover” constraint.

## Breadcrumbs
- Target split + invariants: `docs/projects/morphology-4stage-split/INVESTIGATION-PLAN.md:3-48`
- Current Standard stage order + schema stage keys: `mods/mod-swooper-maps/src/recipes/standard/recipe.ts:29-73`
- Current Morphology stage definitions (ids/knobs/steps):
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/index.ts:41-47`
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/index.ts:49-55`
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/index.ts:43-49`
- Publish-once handles today (topography/substrate): `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/steps/landmassPlates.ts:320-321`
- Coastline metrics publish site today: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/ruggedCoasts.ts:486-491`
- Islands step mutates land/water truth after coastline metrics: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/steps/islands.ts:37-49`
- No-water-drift invariant enforcement (projection-only): `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/assertions.ts:3-33`
- Studio uiMeta full step id includes stage id: `mods/mod-swooper-maps/scripts/generate-studio-recipe-types.ts:214-218`
- Studio display name derivation (kebab-case → Title Case): `apps/mapgen-studio/src/ui/utils/formatting.ts:7-18`
- Studio default config currently hardcodes old stage keys: `apps/mapgen-studio/src/ui/data/defaultConfig.ts:76-133`
- Existing viz group labels (should stay stable across the split):
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/steps/landmassPlates.ts:11-13`
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/ruggedCoasts.ts:19-21`
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/routing.ts:9-11`
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/geomorphology.ts:9-10`
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/steps/islands.ts:7-9`
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/steps/volcanoes.ts:16-18`
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/steps/landmasses.ts:8-10`

## Decision Packets

### DP-C-BOUNDARY-01: Canonical 4-Stage Truth Split (Stage Keys + Step Allocation)
**Status:** Proposed

**Context**
- The project goal is a hard cutover from `morphology-pre/mid/post` to `morphology-coasts/routing/erosion/features`. `docs/projects/morphology-4stage-split/INVESTIGATION-PLAN.md:3-13`
- Today, the step allocation is `morphology-pre: [landmass-plates]`, `morphology-mid: [rugged-coasts, routing, geomorphology]`, `morphology-post: [islands, volcanoes, landmasses]`. `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/index.ts:41-47` `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/index.ts:49-55` `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/index.ts:43-49`

**Decision**
- Adopt the target allocation exactly:
- `morphology-coasts`: `landmass-plates`, `rugged-coasts`
- `morphology-routing`: `routing`
- `morphology-erosion`: `geomorphology`
- `morphology-features`: `islands`, `volcanoes`, `landmasses`
- `docs/projects/morphology-4stage-split/INVESTIGATION-PLAN.md:17-41`

**Options**
1. Do the above (recommended).
2. Keep a 3-stage truth pipeline and only relabel (reject; does not meet the project goal). `docs/projects/morphology-4stage-split/INVESTIGATION-PLAN.md:3-13`
3. Move `islands` earlier so it is “covered” by routing/coasts artifacts (see DP-C-BOUNDARY-03 for why this is a separate decision). `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/steps/islands.ts:37-49`

**Recommendation**
- Option 1. It matches the stated target and minimizes algorithm churn: only stage keys and “which stage owns which step” change. `docs/projects/morphology-4stage-split/INVESTIGATION-PLAN.md:15-47`

**Notes**
- Standard recipe stage order changes are concentrated in `mods/mod-swooper-maps/src/recipes/standard/recipe.ts:29-73`.
- This is explicitly a hard cutover; config keys and step ids that include stage id will change. `docs/projects/morphology-4stage-split/INVESTIGATION-PLAN.md:13` `mods/mod-swooper-maps/scripts/generate-studio-recipe-types.ts:214-218`

### DP-C-BOUNDARY-02: Knob Ownership Per New Stage
**Status:** Proposed

**Context**
- The target plan assigns knobs per new stage. `docs/projects/morphology-4stage-split/INVESTIGATION-PLAN.md:17-39`
- Today’s knobs are attached to old stage ids:
- `morphology-pre` has `seaLevel`. `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/index.ts:31-39`
- `morphology-mid` has `erosion`, `coastRuggedness`, `shelfWidth`. `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/index.ts:37-47`
- `morphology-post` has `volcanism`. `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/index.ts:33-41`

**Decision**
- Re-home knobs to match the target split:
- `morphology-coasts.knobs`: `seaLevel`, `coastRuggedness`, `shelfWidth`. `docs/projects/morphology-4stage-split/INVESTIGATION-PLAN.md:17-23`
- `morphology-routing.knobs`: none. `docs/projects/morphology-4stage-split/INVESTIGATION-PLAN.md:24-29`
- `morphology-erosion.knobs`: `erosion`. `docs/projects/morphology-4stage-split/INVESTIGATION-PLAN.md:30-35`
- `morphology-features.knobs`: `volcanism`. `docs/projects/morphology-4stage-split/INVESTIGATION-PLAN.md:36-41`

**Options**
1. Re-home knobs as above (recommended).
2. Keep the same knob keys under a “morphology-mid” bucket while moving steps (reject; contradicts hard cutover constraint and preserves the confusing author surface). `docs/projects/morphology-4stage-split/INVESTIGATION-PLAN.md:13`

**Recommendation**
- Option 1.

### DP-C-BOUNDARY-03: Routing Seams (Why Routing Must Be Its Own Stage)
**Status:** Proposed

**Context**
- `routing` today is a single step in `morphology-mid` that publishes `artifact:morphology.routing` for downstream erosion/hydrology. `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/index.ts:49-55` `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/routing.contract.ts:10-21`
- Future intent is to expand routing (basins/outlets/lakes) without mixing it into erosion knobs or coasts knobs.

**Decision**
- Keep routing as a distinct stage even if it remains a single step today (`morphology-routing`), explicitly reserving it for future expansion.

**Rationale**
- Avoid “same-kind” stage splits: routing owns a different conceptual primitive (flow graph) than erosion (surface relaxation) and coasts (shoreline classification).

### DP-C-STUDIO-01: Stage/Step Naming in Studio (Minimally Invasive)
**Status:** Proposed

**Context**
- Studio’s generated uiMeta uses `stageId` and `stepId`, and constructs `fullStepId` that includes `stage.id`. `mods/mod-swooper-maps/scripts/generate-studio-recipe-types.ts:214-218`
- Studio formats stage ids for display using kebab-case → Title Case. `apps/mapgen-studio/src/ui/utils/formatting.ts:7-18`
- The project explicitly expects full step ids to change, and suggests “author-facing labels” as the mitigation (not necessarily programmatic label fields). `docs/projects/morphology-4stage-split/INVESTIGATION-PLAN.md:46-47`

**Decision**
- Introduce explicit `stageLabel` and `stepLabel` fields in generated `uiMeta`, and update Studio UI to prefer these over derived formatting.

**Options**
1. Add explicit labels in uiMeta (recommended for “wow-factor legibility”).
2. Rely on stage ids + formatting only (less work, but poorer control over author-facing phrasing).

**Recommendation**
- Option 1, since the plan’s assumptions explicitly include “author-facing labels”.

### DP-C-STUDIO-02: Viz “Studio Labels” (Groups/Roles/DataTypeKey Stability)
**Status:** Proposed

**Context**
- The project requires viz `dataTypeKey` stability across the split. `docs/projects/morphology-4stage-split/INVESTIGATION-PLAN.md:44-46`
- Step-level viz labels are “Studio-facing” via `meta.label` and `meta.group` (e.g. `Morphology / Topography`, `Morphology / Shelf`). `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/steps/landmassPlates.ts:11-13` `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/ruggedCoasts.ts:19-21`
- These group strings are independent of stage id, so the split can keep Studio’s viz navigation stable if we avoid renaming them during file moves.

**Decision**
- Keep all existing `VizLayerMeta.group` strings unchanged during the 4-stage split.
- Keep all existing `dataTypeKey` prefixes unchanged (`morphology.*`, `map.morphology.*`). `docs/projects/morphology-4stage-split/INVESTIGATION-PLAN.md:44-46`

## Migration Slices (Prepare → Cutover → Cleanup)

### Slice 0: Prepare (No Stage-Key Behavior Change)
**Goal**
- Reduce cutover diff size by pre-positioning shared modules and new stage modules without switching the Standard recipe over yet.

**Typical contents**
- Create a stable “morphology shared” import surface for artifact definitions so downstream stages aren’t importing from `.../morphology-pre/...` forever.
- Optionally add new stage modules (`morphology-coasts`, `morphology-routing`, `morphology-erosion`, `morphology-features`) that reuse the existing step modules but are not referenced from `STANDARD_STAGES` yet.

**Acceptance checks**
- `bun run --cwd mods/mod-swooper-maps check`
- `bun run --cwd mods/mod-swooper-maps test`

### Slice 1: Cutover (Flip Standard Recipe Stage Keys)
**Goal**
- Perform the hard cutover: Standard recipe uses the 4 new stage ids, and the old stage ids are no longer accepted.

**Required changes (by contract surface)**
- Update Standard recipe stage list and config schema keys. `mods/mod-swooper-maps/src/recipes/standard/recipe.ts:29-73`
- Update Studio recipe artifacts generation outputs by regenerating (since uiMeta fullStepId includes stage id). `mods/mod-swooper-maps/scripts/generate-studio-recipe-types.ts:214-218`
- Update Studio app defaults that reference old stage keys. `apps/mapgen-studio/src/ui/data/defaultConfig.ts:76-133`

**Acceptance checks**
- `bun run --cwd mods/mod-swooper-maps run build:studio-recipes` (regenerate; do not hand-edit generated output)
- `bun run --cwd mods/mod-swooper-maps test`

### Slice 2: Cleanup (Delete Old Stage Keys + Docs Follow-through)
**Goal**
- Remove legacy `morphology-pre/mid/post` stage modules and update docs that describe the Standard recipe mapping.

**Acceptance checks**
- `rg -n \"morphology-pre|morphology-mid|morphology-post\" -S` only matches intended archives
- `bun run --cwd mods/mod-swooper-maps test`
