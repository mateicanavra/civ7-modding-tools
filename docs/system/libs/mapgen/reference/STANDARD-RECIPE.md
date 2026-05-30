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

- Config posture uses the packet's flat default stage surface
  `{ knobs?, [stepId]?: stepConfig }`; persisted SDK-native `advanced` wrappers
  are rejected.
- Ecology, placement, lake projection, import boundaries, and guardrails are
  updated by their respective `openspec/changes/normalize-*` slices.

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

1. `foundation`
2. `morphology-coasts`
3. `morphology-routing`
4. `morphology-erosion`
5. `morphology-features`
6. `hydrology-climate-baseline`
7. `hydrology-hydrography`
8. `hydrology-climate-refine`
9. `ecology`
10. `map-morphology`
11. `map-hydrology`
12. `map-ecology`
13. `placement`

Note:

- “foundation/morphology-\*/hydrology/ecology” stages are primarily **truth** producers.
- “map-\*” and “placement” stages are primarily **projection** / engine-facing surfaces.

## Config surface (schema + posture)

The standard recipe publishes:

- `STANDARD_RECIPE_CONFIG_SCHEMA` (strict)
- `STANDARD_RECIPE_CONFIG` (default config)

Config is stage-scoped and must be strict (`additionalProperties: false`).

Stage-level posture:

- Wrapper-only `advanced` stage surfaces have been removed. Step overrides live
  at `<stageId>.<stepId>`.
- `map-morphology` still uses `public + compile` as a genuine public transform
  from public keys (`plotCoasts`, `plotContinents`, `mountains`,
  `plotVolcanoes`, `buildElevation`) to kebab-case step ids. It is not a
  wrapper-only compatibility surface.

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
