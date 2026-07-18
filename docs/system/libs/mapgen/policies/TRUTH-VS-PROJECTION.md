<toc>
  <item id="purpose" title="Purpose"/>
  <item id="audience" title="Audience"/>
  <item id="definitions" title="Definitions"/>
  <item id="rules" title="Rules (allowed / disallowed)"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Policy: truth vs projection

## Purpose

Keep the pipeline conceptually stable by separating:

- **Truth**: canonical “physics engine” products (domain primitives that other steps build upon).
- **Projection**: derived surfaces for gameplay/engine consumption, debug, or compatibility.

This policy prevents derived outputs from becoming accidental “sources of truth”.

## Audience

- Domain authors.
- Anyone writing steps that output engine-facing fields/effects.
- Documentation authors deciding where to document a concept.

## Definitions

- **Truth** stages produce artifacts that represent the canonical world-state primitives (e.g., plate meshes, crust, climate fields, biome assignments).
- **Projection** stages produce engine-facing fields/effects or debug-only summaries that can be re-derived from truth.

## Rules (allowed / disallowed)

### Allowed

- Projection steps depend on truth, not the other way around.
- Projection outputs are treated as recomputable and non-canonical.
- Debug overlays/snapshots can exist, but must be labeled derived/non-canonical.
- Adapter legality/readback calls can validate or materialize authored truth at
  projection boundaries.

### Disallowed

- Truth steps that depend on projection-only surfaces.
- Using debug overlays/snapshots as canonical pipeline products.
- Documenting projections as if they are the primary domain model.
- Using Civ7 engine RNG or official generator calls as inputs to authored truth.

### Adapter Surface Taxonomy

- **Authored entropy:** owned by MapGen Core via `ctxRandom(...)`,
  `deriveStepSeed(...)`, and `createLabelRng(...)` from `context.setup.mapSeed`.
- **Policy/legality/readback:** adapter calls such as `canHaveFeature`,
  `canHaveResource`, `getTerrainType`, `getFeatureType`, and `getResourceType`.
- **Projection/materialization:** adapter calls such as `setTerrainType`,
  `setBiomeType`, `setFeatureType`, `setResourceType`, `stampLakes`,
  `placeResourceIntent`, `placeDiscoveryIntent`, and `setStartPosition`.
- **Engine compatibility only:** `getRandomNumber` and official generators such
  as resource/discovery/snow/biome/start generators. Standard authored
  generation must not depend on these.

## Ground truth anchors

- Map setup and deterministic random ownership: `packages/mapgen-core/src/core/{map-setup,map-context,random}.ts`
- Target architecture posture for pipeline compilation and artifacts: `docs/projects/engine-refactor-v1/resources/spec/recipe-compile/architecture/00-fundamentals.md`
- Standard content package posture: `docs/projects/engine-refactor-v1/resources/spec/SPEC-standard-content-package.md`
