# Agent A — Morphology 4-Stage Split

## Scope
Exhaustive inventory of **in-repo references** to the old Morphology stage IDs / config keys:
- `morphology-pre`
- `morphology-mid`
- `morphology-post`

…and the **required update points** for the hard cutover to the 4-stage braid:
- `morphology-coasts`
- `morphology-routing`
- `morphology-erosion`
- `morphology-features`

Source of truth for target IDs + step/knob allocation: `docs/projects/morphology-4stage-split/INVESTIGATION-PLAN.md`.

## Stage ID Remap (Hard Cutover)
Old stage IDs/config keys to delete everywhere (no compatibility):
- `morphology-pre` -> `morphology-coasts`
- `morphology-mid` -> split across:
- `morphology-coasts` (for `rugged-coasts`)
- `morphology-routing` (for `routing`)
- `morphology-erosion` (for `geomorphology`)
- `morphology-post` -> `morphology-features`

Step re-bucketing (file moves implied):
- `landmass-plates` moves from `morphology-pre` -> `morphology-coasts`
- `rugged-coasts` moves from `morphology-mid` -> `morphology-coasts`
- `routing` moves from `morphology-mid` -> `morphology-routing`
- `geomorphology` moves from `morphology-mid` -> `morphology-erosion`
- `islands`, `volcanoes`, `landmasses` move from `morphology-post` -> `morphology-features`

Knob re-bucketing (config keys move stages):
- `seaLevel`, `coastRuggedness`, `shelfWidth` -> `morphology-coasts`
- (none) -> `morphology-routing`
- `erosion` -> `morphology-erosion`
- `volcanism` -> `morphology-features`

## Stage IDs As Recipe Contracts (Load-Bearing)
These hardcode stage IDs and must be updated to the new 4-stage set.

- `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
Stage imports + ordering (lines 21-33, 29-42) and strict config schema keys (lines 57-72) currently enumerate:
  - `"morphology-pre"`, `"morphology-mid"`, `"morphology-post"` (lines 60-62)
Required updates:
  - Replace stage modules + stage list with 4 new stage modules in the desired order.
  - Replace `STANDARD_RECIPE_CONFIG_SCHEMA` keys with:
    - `"morphology-coasts"`, `"morphology-routing"`, `"morphology-erosion"`, `"morphology-features"`

## Stage IDs Inside Stage Definitions (Load-Bearing)
These hardcode stage IDs via `createStage({ id: ... })` and must be replaced by the new IDs.

- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/index.ts`
`id: "morphology-pre"` (line 42)
Required updates:
  - Stage is replaced by `morphology-coasts` stage definition and should include both `landmass-plates` + `rugged-coasts` in its schema/steps list.

- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/index.ts`
`id: "morphology-mid"` (line 50)
Required updates:
  - This stage is deleted and replaced by three stages: `morphology-coasts`, `morphology-routing`, `morphology-erosion`.

- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/index.ts`
`id: "morphology-post"` (line 44)
Required updates:
  - Stage is replaced by `morphology-features` stage definition.

## Stage Directory Moves (Even When No Strings Match)
These directories are named after stage IDs; hard cutover implies renames/splits (even if file contents don’t include the stage ID string).

Current stage directory file inventories (for planned relocation):

- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/artifacts.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/steps/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/steps/landmassPlates.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/steps/landmassPlates.contract.ts`
Required updates:
  - Rename/move to `.../morphology-coasts/` (and co-locate `rugged-coasts`).

- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/ruggedCoasts.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/ruggedCoasts.contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/routing.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/routing.contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/geomorphology.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/geomorphology.contract.ts`
Required updates:
  - Split into:
    - `.../morphology-coasts/steps/ruggedCoasts*`
    - `.../morphology-routing/steps/routing*`
    - `.../morphology-erosion/steps/geomorphology*`

- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/steps/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/steps/islands.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/steps/islands.contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/steps/volcanoes.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/steps/volcanoes.contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/steps/landmasses.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/steps/landmasses.contract.ts`
Required updates:
  - Rename/move to `.../morphology-features/`

## Config Keys (Maps + Presets): `morphology-pre/mid/post` Objects Must Move
These are stage-scoped config objects and must be migrated to the new stage ids.

Maps (all contain stage config keys):
- `mods/mod-swooper-maps/src/maps/shattered-ring.ts`
- `mods/mod-swooper-maps/src/maps/sundered-archipelago.ts`
- `mods/mod-swooper-maps/src/maps/swooper-desert-mountains.ts`
- `mods/mod-swooper-maps/src/maps/swooper-earthlike.ts`

Presets (all contain stage knob keys):
- `mods/mod-swooper-maps/src/maps/presets/realism/earthlike.config.ts`
- `mods/mod-swooper-maps/src/maps/presets/realism/old-erosion.config.ts`
- `mods/mod-swooper-maps/src/maps/presets/realism/young-tectonics.config.ts`

Knob routing changes required:
- `morphology-pre.knobs.seaLevel` → `morphology-coasts.knobs.seaLevel`
- `morphology-mid.knobs.coastRuggedness` → `morphology-coasts.knobs.coastRuggedness`
- `morphology-mid.knobs.shelfWidth` → `morphology-coasts.knobs.shelfWidth`
- `morphology-mid.knobs.erosion` → `morphology-erosion.knobs.erosion`
- `morphology-post.knobs.volcanism` → `morphology-features.knobs.volcanism`

Advanced config routing changes required:
- `morphology-pre.advanced["landmass-plates"]` → `morphology-coasts.advanced["landmass-plates"]`
- `morphology-mid.advanced["rugged-coasts"]` → `morphology-coasts.advanced["rugged-coasts"]`
- `morphology-mid.advanced.routing` → `morphology-routing.advanced.routing`
- `morphology-mid.advanced.geomorphology` → `morphology-erosion.advanced.geomorphology`
- `morphology-post.advanced.islands` → `morphology-features.advanced.islands`
- `morphology-post.advanced.volcanoes` → `morphology-features.advanced.volcanoes`
- `morphology-post.advanced.landmasses` → `morphology-features.advanced.landmasses`

## Imports That Reference `.../morphology-pre/artifacts.*`
These should be migrated to a stable non-stage-named module (recommended target):
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology/artifacts.ts` (new)

Downstream stage contracts importing `.../morphology-pre/artifacts.js` (must update):
- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/contract.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/contract.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/pedology/contract.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/resource-basins/contract.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/steps/climateBaseline.contract.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/steps/climateRefine.contract.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/steps/rivers.contract.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/contract.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.contract.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/steps/lakes.contract.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/buildElevation.contract.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotCoasts.contract.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotContinents.contract.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotMountains.contract.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/steps/plotVolcanoes.contract.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/plot-landmass-regions/contract.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/geomorphology.contract.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/routing.contract.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/steps/ruggedCoasts.contract.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/steps/islands.contract.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/steps/landmasses.contract.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/steps/volcanoes.contract.ts`

Tests importing `.../morphology-pre/artifacts.js` (same path update):
- `mods/mod-swooper-maps/test/hydrology-seasonality-modes.test.ts`
- `mods/mod-swooper-maps/test/morphology/earthlike-coasts-smoke.test.ts`
- `mods/mod-swooper-maps/test/ecology/biomes-step.test.ts`
- `mods/mod-swooper-maps/test/ecology/features-owned.helpers.ts`

## Tests That Hardcode Stage IDs / Config Keys
These must change for the hard cutover (either as stage config keys, stage ordering assertions, or full step IDs).

- `mods/mod-swooper-maps/test/standard-recipe.test.ts`
Asserts stage ordering list includes `morphology-pre/mid/post` (lines 19-32). Must be replaced with the new 4-stage IDs.

- `mods/mod-swooper-maps/test/m11-config-knobs-and-presets.test.ts`
Uses stage keys `"morphology-pre"`, `"morphology-mid"`, `"morphology-post"` in config inputs and assertions. Must be re-bucketed to the new stages.

- `mods/mod-swooper-maps/test/support/standard-config.ts`
Defines a large config object with `"morphology-pre"`, `"morphology-mid"`, `"morphology-post"` blocks (see around lines ~389/402/426). Must be re-bucketed to the new stages.

- `mods/mod-swooper-maps/test/morphology/shelf-width-knob.test.ts`
Imports rugged-coasts from `.../morphology-mid/steps/ruggedCoasts.js` and references `"morphology-mid"` config. Must move to `morphology-coasts`.

- `mods/mod-swooper-maps/test/morphology/contract-guard.test.ts`
Hardcodes stage roots and explicitly references `morphology-pre/artifacts.ts` and `morphology-pre/mid/post` directories multiple times (e.g., lines 24-28). Must be updated to the new stage dirs.

- `mods/mod-swooper-maps/test/pipeline/map-stamping.contract-guard.test.ts`
Treats `morphology-pre/mid/post` as “physics stages” and enumerates them as roots (lines 23-31, and again later). Must include the new 4-stage set.

- `mods/mod-swooper-maps/test/morphology/tracing-observability-smoke.test.ts`
Builds full step IDs with `full("morphology-pre" | "morphology-mid" | "morphology-post", ...)` (lines 34-43). Must be updated so verbose step IDs match the new stage IDs hosting those steps.

## Studio (Stage Keys As Config Keys)
Stage IDs appear as config keys in the Studio prototype defaults and should be updated to keep the UI aligned.

- `apps/mapgen-studio/src/ui/data/defaultConfig.ts`
Uses `'morphology-pre'` (line 80) and `'morphology-mid'` (line 111) as stage keys; must be replaced with the new stage keys and re-bucket advanced config accordingly.

- `apps/mapgen-studio/src/ui/utils/formatting.ts`
Docstring example references `'morphology-pre'` (line 11); should update to a current stage ID (e.g., `morphology-coasts`) to avoid stale examples.

- `apps/mapgen-studio/src/ui/types/index.ts`
Comment references `'morphology-pre'` as an example stage key (around line 192 in file); should update for consistency.

## Scripts (Stage Roots Enumeration)
- `scripts/lint/lint-domain-refactor-guardrails.sh`
Morphology stage roots are hardcoded (line 196) as:
`.../morphology-pre .../morphology-mid .../morphology-post`
Required update:
  - Replace with:
`.../morphology-coasts .../morphology-routing .../morphology-erosion .../morphology-features`

## Docs That Reference Old Stage IDs / Paths
Canonical-ish docs (should update as part of the hard cutover, if we’re keeping docs accurate):
- `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`
- `docs/system/libs/mapgen/reference/domains/MORPHOLOGY.md`
- `docs/system/libs/mapgen/reference/domains/FOUNDATION.md` (references morph stages as dependency examples)
- `docs/system/libs/mapgen/reference/ARTIFACTS.md` (example paths point at `.../morphology-pre/...`)
- `docs/system/libs/mapgen/how-to/add-a-new-artifact.md`
- `docs/system/libs/mapgen/tutorials/tune-a-preset-and-knobs.md`

Project docs (likely referenced by current work; should update):
- `docs/projects/mapgen-studio/VIZ-DECLUTTER-SEMANTICS-GREENFIELD-PLAN.md`
- `docs/projects/mapgen-studio/viz-greenfield/morphology.md`
- `docs/projects/mapgen-studio/issues/LOCAL-TBD-ui-refactor-prototype-integration.md`
- `docs/projects/mapgen-studio/issues/LOCAL-TBD-pipeline-viz-surface.md`
- `docs/projects/mapgen-orographic-precipitation/spike-feasibility.md`

Archives / older project history (optional; will remain stale unless intentionally cleaned up):
- `docs/_archive/VIZ-SDK-V1.md`
- `docs/system/libs/mapgen/_archive/realism-knobs-and-presets.md`
- Many occurrences under `docs/projects/engine-refactor-v1/**` (if we care, re-run `rg -l \"morphology-(pre|mid|post)\" docs/projects/engine-refactor-v1`)

## Breadcrumb Commands (Reproduce Inventory)
- `rg -n \"morphology-(pre|mid|post)\" apps mods scripts docs --glob \"!.civ7/**\"`
- `rg -l \"morphology-(pre|mid|post)\" apps mods scripts --glob \"!.civ7/**\"`
- `rg -l \"morphology-pre/artifacts\" mods/mod-swooper-maps -S`
- `find mods/mod-swooper-maps/src/recipes/standard/stages/morphology-* -maxdepth 3 -type f -print`
