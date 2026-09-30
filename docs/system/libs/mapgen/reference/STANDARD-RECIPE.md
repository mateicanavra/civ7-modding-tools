<toc>
  <item id="purpose" title="Purpose"/>
  <item id="scope" title="Scope + ownership"/>
  <item id="contract" title="Contract (what is guaranteed)"/>
  <item id="stage-order" title="Stage order (current)"/>
  <item id="completion-topology" title="Completion topology"/>
  <item id="config" title="Config surface (schema + posture)"/>
  <item id="domains" title="Domains + ops registry"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Standard recipe (Swooper Maps)

## Purpose

Define the canonical “standard recipe” contract as a reference point for:

- pipeline composition,
- domain boundaries,
- and Studio’s default end-to-end run.

## Normalization status

Active MapGen / Swooper Maps normalization work is governed by
`docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
This reference records the current standard recipe surface, but parts of it are
known to be transitional during the OpenSpec change train:

- Config posture uses flat, closed stage surfaces. Internal stages use
  `{ knobs?, [stepId]?: stepConfig }`; compiled stages use
  `{ knobs?, [publicKey]?: publicConfig }`. A compiled stage with no authored
  controls persists exactly `{}` while still compiling fixed step config.
  Persisted SDK-native `advanced` wrappers and fictional empty knobs are rejected.
- Import boundaries and guardrails are updated by their respective
  `openspec/changes/normalize-*` slices.

When this page conflicts with the normalization packet during that workstream,
follow the packet and the controlling OpenSpec slice, then update this page in
the topic slice that changes the underlying source.

## Scope + ownership

The standard recipe is **content-owned** (not SDK-owned):

- Recipe implementation lives in the reusable Standard content package:
  `plugins/mod/map/swooper-physics/**`. Civ7 file generation and deployment live
  separately under `apps/mods/map/swooper-physics/**`.
- The core SDK (`@swooper/mapgen-core`) provides the authoring/runtime mechanism.

## Contract (what is guaranteed)

- The standard recipe is authored via the MapGen authoring SDK (`createRecipe`, `createStage`, `createStep`).
- Stage order is explicit in `contract-manifest.ts`; recipe composition is checked against it.
- Config surface is strict and stage-scoped.
- Selected plans validate exact artifact authorities and typed engine-transaction completions.
- Domain routers contribute one canonical executable operation surface to recipe composition.

## Stage order (current)

The names below are stable runtime stage IDs. Physical source roots use semantic
family nesting and do not need to mirror those hyphenated identities. The current
stage order is:

1. `foundation-mantle`
2. `foundation-lithosphere`
3. `foundation-tectonics`
4. `foundation-orogeny`
5. `foundation-projection`
6. `morphology-coasts`
7. `morphology-routing`
8. `morphology-erosion`
9. `morphology-islands`
10. `morphology-shelf`
11. `hydrology-climate-baseline`
12. `hydrology-hydrography`
13. `morphology-features`
14. `hydrology-climate-refine`
15. `ecology-pedology`
16. `ecology-biomes`
17. `map-morphology`
18. `map-hydrology`
19. `map-elevation`
20. `map-rivers`
21. `ecology-features`
22. `map-ecology`
23. `placement`

The five `foundation-*` stages are a sibling family decomposed from the former
single `foundation` stage; their steps run in the same order, so output is
byte-identical (see the FOUNDATION domain reference for the stage→step map).
The `morphology-shelf` stage computes the continental shelf after
`morphology-islands` finalizes island ground and landmass decomposition, so every
new island and microcontinent receives coherent coast and shelf evidence.
Hydrography then runs one `network` step for the selected physical model.
Certified Earthlike computes water on final ground before `morphology-features`
selects exposed mountains and volcanoes outside wet bodies and reserved dry
channels. Original ground and marine geography remain unchanged; climate
refinement and terrestrial ecology use the appropriate original-marine or
exposed-land population rather than one interchangeable water mask.

Note:

- “foundation-\*/morphology-\*/hydrology/ecology-\*” stages are primarily **truth** producers.
- “map-\*” and “placement” stages are primarily **projection** / engine-facing surfaces.

## Completion topology

The Standard catalog contains only transactions whose successful mutation of
invisible Civ7 state is consumed by a later selected step and cannot be replaced
by an admitted outcome artifact.

| Provider | Completion | Consumer | External state consumed |
|---|---|---|---|
| `plot-coasts` | `map.coasts-plotted` | `plot-continents` | materialized coast terrain |
| `plot-continents` | `map.continents-plotted` | `plot-mountains`, `plot-volcanoes` | validated continent terrain |
| `plot-mountains` | `map.mountains-plotted` | `build-elevation` | projected mountain terrain |
| `plot-volcanoes` | `map.volcanoes-plotted` | `build-elevation` | projected volcano terrain |
| `build-elevation` | `map.elevation-built` | `plot-rivers` | current Civ7 elevation |
| `plot-rivers` | `map.rivers-plotted` | `plan-natural-wonders` | final native river surface |
| `plot-biomes` | `engine.biomes-applied` | `features-apply` | current engine biome classification |
| `features-apply` | `engine.features-applied` | `plan-natural-wonders` | admitted current feature surface |
| `place-natural-wonders` | `placement.natural-wonders-placed` | `prepare-placement-surface` | wonder-driven terrain mutations |
| `prepare-placement-surface` | `placement.surface-prepared` | `plan-resource-demands`, `observe-placement-parity` | maintained water, terrain, and area state |
| `place-resources` | `placement.resources-placed` | `place-discoveries` | current resource occupancy |
| `place-discoveries` | `placement.discoveries-placed` | `assign-advanced-starts` | discovery state consumed by fertility recalculation |

This table documents product causality; the typed step configs and selected-plan
compiler remain the executable authorities. Accepted lake projection and start
assignment use post-action outcome artifacts instead. The certified lake
artifact is the exact accepted physical water footprint, not a retained native
`isLake` snapshot. Advanced starts have no
completion because no selected consumer reads their resulting engine state.

## Config surface (schema + posture)

The standard recipe publishes:

- `STANDARD_RECIPE_CONFIG_SCHEMA` (strict)
- `STANDARD_RECIPE_CONFIG` (default config)

Config is stage-scoped and must be strict (`additionalProperties: false`).

Stage-level posture:

- Wrapper-only `advanced` stage surfaces have been removed. Step overrides live
  at `<stageId>.<stepId>`.
- Fixed projection `map-*` stages do not expose fictional empty knobs.
  `hydrology-hydrography.water` contains the `certified-sill-spill` identity
  and its four physical operation envelopes. `knobs.riverDensity` controls
  physical classification. There is no legacy solver, lake quota or fallback.
- `map-rivers` is configurationless: Core supplies its closed empty surface,
  with no redundant projection identity or selection controls. All shipped maps use this physical/native
  chain, preserving their own forcing and density settings. Retired config
  identities are refused rather than silently interpreted as current physics.
- `map-hydrology` projects final-refined rainfall and accepted lake water before
  `map-elevation` submits authored numeric elevation. `map-rivers` then writes
  every admitted dry MINOR/NAVIGABLE source, finalizing the authored network once.
  Immutable projection intent and later engine readback remain separate.
  Physical water, native lake category, and native numeric water level are not
  interchangeable. Final river-class readback does not establish directed-edge,
  through-lake navigation, or freshwater parity; production-native qualification
  remains separate from headless recipe proof.
- The fixed Swooper biome-to-Civ7 projection policy stays beside `plot-biomes`
  rather than becoming authored configuration.
- Mountain/foothill strategy config belongs to
  `morphology-features.mountains`. The `map-morphology.plot-mountains` step is
  projection-only and rejects truth-planning knobs/config.
- Placement exposes product-facing controls for natural wonders, discoveries,
  resources, starts, and the resource↔start support pass; the `resources`,
  `starts`, and `support` groups are derived from the owning op's default
  strategy config schema (no hand-shadowed schemas). Adapter resource catalogs
  and runtime player counts are supplied by the run environment rather than
  authored map config. Resource planning runs before start assignment;
  resource stamping runs after the support pass (`plan-resource-demands →
  select-resource-sites → assign-starts → adjust-resources →
  place-resources`). The final `placement`
  step consumes product artifacts; it does not rerun product materialization.
  See [`docs/system/libs/mapgen/reference/domains/PLACEMENT.md`](/system/libs/mapgen/reference/domains/PLACEMENT.md).

## Domains + ops registry

The standard recipe collects compile-time domain ops into a single registry:

- foundation ops
- morphology ops
- hydrology ops
- ecology ops
- placement ops

This registry is used during config compilation to bind op contracts to implementations by op id.

Domain contract references:

- [`docs/system/libs/mapgen/reference/domains/DOMAINS.md`](/system/libs/mapgen/reference/domains/DOMAINS.md)

## Ground truth anchors

- Standard recipe composition: `plugins/mod/map/swooper-physics/src/recipes/standard/recipe.ts`
- Standard completion catalog: `plugins/mod/map/swooper-physics/src/recipes/standard/completions.ts`
- Example stage schema/knobs posture: `plugins/mod/map/swooper-physics/src/recipes/standard/stages/foundation/mantle/index.ts`
- Stage authoring contract: `packages/mapgen-core/src/authoring/stage/create.ts`
- Policy: truth vs projection: `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`
