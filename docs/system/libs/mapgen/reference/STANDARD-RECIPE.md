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

1) `foundation`
2) `morphology-pre`
3) `morphology-mid`
4) `morphology-post`
5) `hydrology-climate-baseline`
6) `hydrology-hydrography`
7) `hydrology-climate-refine`
8) `ecology`
9) `map-morphology`
10) `map-hydrology`
11) `map-ecology`
12) `placement`

Note:
- “foundation/morphology/hydrology/ecology” stages are primarily **truth** producers.
- “map-*” and “placement” stages are primarily **projection** / engine-facing surfaces.

## Config surface (schema + posture)

The standard recipe publishes:

- `STANDARD_RECIPE_CONFIG_SCHEMA` (strict)
- `STANDARD_RECIPE_CONFIG` (default config)

Config is stage-scoped and must be strict (`additionalProperties: false`).

Stage-level posture:
- “advanced” baseline configs exist for some stages, with knobs applied last as deterministic transforms.

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
- Example stage schema/knobs posture: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts`
- Stage authoring contract: `packages/mapgen-core/src/authoring/stage.ts`
- Policy: truth vs projection: `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`
