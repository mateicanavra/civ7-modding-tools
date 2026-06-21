<toc>
  <item id="purpose" title="Purpose"/>
  <item id="scope" title="Scope + ownership"/>
  <item id="contract" title="Contract (what is guaranteed)"/>
  <item id="stage-order" title="Stage order (current)"/>
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

- Config posture uses flat stage surfaces. Stages without a public transform use
  `{ knobs?, [stepId]?: stepConfig }`; stages with an explicit public+compile
  transform use `{ knobs?, [publicKey]?: publicConfig }`. Persisted SDK-native
  `advanced` wrappers are rejected.
- Import boundaries and guardrails are updated by their respective
  `openspec/changes/normalize-*` slices.

When this page conflicts with the normalization packet during that workstream,
follow the packet and the controlling OpenSpec slice, then update this page in
the topic slice that changes the underlying source.

## Scope + ownership

The standard recipe is **content-owned** (not SDK-owned):

- Recipe implementation lives in the standard content package: `mods/mod-swooper-maps/**`.
- The core SDK (`@swooper/mapgen-core`) provides the authoring/runtime mechanism.

## Contract (what is guaranteed)

- The standard recipe is authored via the MapGen authoring SDK (`createRecipe`, `createStage`, `createStep`).
- Stage order is explicit in the recipe module (recipe is the ordering source of truth).
- Config surface is strict and stage-scoped.
- The recipe uses a tag registry (dependency validation) and an ops registry (by op id).

## Stage order (current)

The current stage order is:

1. `foundation-mantle`
2. `foundation-lithosphere`
3. `foundation-tectonics`
4. `foundation-orogeny`
5. `foundation-projection`
6. `morphology-coasts`
7. `morphology-routing`
8. `morphology-erosion`
9. `morphology-features`
10. `morphology-shelf`
11. `hydrology-climate-baseline`
12. `hydrology-hydrography`
13. `hydrology-climate-refine`
14. `ecology-pedology`
15. `ecology-biomes`
16. `map-morphology`
17. `map-hydrology`
18. `map-elevation`
19. `map-rivers`
20. `ecology-features`
21. `map-ecology`
22. `placement`

The five `foundation-*` stages are a sibling family decomposed from the former
single `foundation` stage; their steps run in the same order, so output is
byte-identical (see the FOUNDATION domain reference for the stage→step map).
The `morphology-shelf` stage computes the continental shelf after island
injection (post-features), so island peaks get true shelves.

Note:

- “foundation-\*/morphology-\*/hydrology/ecology-\*” stages are primarily **truth** producers.
- “map-\*” and “placement” stages are primarily **projection** / engine-facing surfaces.

## Config surface (schema + posture)

The standard recipe publishes:

- `STANDARD_RECIPE_CONFIG_SCHEMA` (strict)
- `STANDARD_RECIPE_CONFIG` (default config)

Config is stage-scoped and must be strict (`additionalProperties: false`).

Stage-level posture:

- Wrapper-only `advanced` stage surfaces have been removed. Step overrides live
  at `<stageId>.<stepId>`.
- Projection `map-*` stages expose semantic projection/materialization controls
  and compile empty runtime steps, readback, and fixed defaults internally.
  `map-hydrology` stamps static lake water before `map-elevation` builds engine
  elevation; `map-rivers` projects the Civ-visible navigable river terrain
  subset from Hydrology river truth after elevation is finalized and records
  engine readback separately.
- Mountain/foothill strategy config belongs to
  `morphology-features.mountains`. The `map-morphology.plot-mountains` step is
  projection-only and rejects truth-planning knobs/config.
- Placement exposes product-facing controls for natural wonders, discoveries,
  resources, starts, and the resource↔start support pass; the `resources`,
  `starts`, and `support` groups are derived from the owning op's default
  strategy config schema (no hand-shadowed schemas). Adapter resource catalogs
  and runtime player counts are supplied by the run environment rather than
  authored map config. Resource planning runs before start assignment;
  resource stamping runs after the support pass (`plan-resources →
  assign-starts → adjust-resources → place-resources`). The final `placement`
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

- Standard recipe composition: `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
- Example stage schema/knobs posture: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-mantle/index.ts`
- Stage authoring contract: `packages/mapgen-core/src/authoring/stage.ts`
- Policy: truth vs projection: `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`
