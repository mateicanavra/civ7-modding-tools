<toc>
  <item id="local-plan" title="Local plan"/>
  <item id="contracts" title="Contracts + artifacts"/>
  <item id="code-sources" title="Code sources"/>
  <item id="doc-sources" title="Doc/spec sources"/>
  <item id="drift" title="Drift + risks"/>
</toc>

# Scratch: MapGen domain — Foundation

## Questions
- Domain contract surface (inputs/outputs)?
- What stage/step(s) does Foundation own in the standard recipe?
- What cross-domain dependencies exist (and are they intended)?

## Local plan (this pass)
1. Confirm stage boundary + public config surface: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts`.
2. Enumerate owned artifacts + their schemas: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts`.
3. Trace step contracts (`requires`/`provides`) to verify dependencies and intended ordering.
4. Reconcile with target posture in `docs/system/libs/mapgen/foundation.md` and engine-refactor-v1 spec/ADRs; note drift explicitly.

## Docs found

## Contracts + artifacts (standard recipe)

Stage module:
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts`
  - Stage id: `foundation`
  - Config posture:
    - Public config is `foundation.advanced.*` (per-step baselines).
    - Knobs (`plateCount`, `plateActivity`) apply last as deterministic transforms.

Step contracts (requires/provides are *artifact-gated;* no `field:*` or `effect:*` tags in Foundation today):
- `mesh`
  - Requires: —
  - Provides artifacts: `artifact:foundation.mesh`
  - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/mesh.contract.ts`
- `crust`
  - Requires artifacts: `artifact:foundation.mesh`
  - Provides artifacts: `artifact:foundation.crust`
  - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/crust.contract.ts`
- `plate-graph`
  - Requires artifacts: `artifact:foundation.mesh`, `artifact:foundation.crust`
  - Provides artifacts: `artifact:foundation.plateGraph`
  - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateGraph.contract.ts`
- `tectonics`
  - Requires artifacts: `artifact:foundation.mesh`, `artifact:foundation.crust`, `artifact:foundation.plateGraph`
  - Provides artifacts:
    - `artifact:foundation.tectonicSegments`
    - `artifact:foundation.tectonicHistory`
    - `artifact:foundation.tectonics`
  - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.contract.ts`
- `projection`
  - Requires artifacts:
    - `artifact:foundation.mesh`, `artifact:foundation.crust`, `artifact:foundation.plateGraph`, `artifact:foundation.tectonics`
  - Provides artifacts:
    - `artifact:foundation.plates`
    - `artifact:foundation.tileToCellIndex`
    - `artifact:foundation.crustTiles`
  - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.contract.ts`
- `plate-topology`
  - Requires artifacts: `artifact:foundation.plates`
  - Provides artifacts: `artifact:foundation.plateTopology`
  - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateTopology.contract.ts`

## Code touchpoints
- Domain implementation (mod-owned): `mods/mod-swooper-maps/src/domain/foundation/*`
- Domain ops (compile/runtime): `mods/mod-swooper-maps/src/domain/foundation/ops.ts`
- Standard recipe stage: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts`
- Foundation artifacts: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts`
- Foundation step modules: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/*`

## Notes
- Standard recipe ordering: `foundation` stage runs first (`mods/mod-swooper-maps/src/recipes/standard/recipe.ts`).
- Notable artifact ids (non-exhaustive; see `.../foundation/artifacts.ts`):
  - `artifact:foundation.mesh`, `artifact:foundation.crust`, `artifact:foundation.plates`
  - `artifact:foundation.plateGraph`, `artifact:foundation.tectonics`
  - `artifact:foundation.tileToCellIndex`, `artifact:foundation.crustTiles`
  - `artifact:foundation.tectonicSegments`, `artifact:foundation.tectonicHistory`, `artifact:foundation.plateTopology`

## Doc/spec sources (authority)

- Domain conceptual doc: `docs/system/libs/mapgen/foundation.md`
- Target deferral note: ADR-ER1-007 (Foundation split deferral): `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-007-foundation-surface-is-artifact-based-m4-uses-monolithic-artifact-foundation-split-deferred-per-def-014.md`

## Drift + risks

- Foundation is currently “artifact-only gated”. The target architecture also includes fields/buffers, but Foundation can remain artifact-based as long as it publishes stable tensor artifacts and keeps mutation local.
- The core SDK defines additional foundation artifact tag constants and helpers in `packages/mapgen-core/src/core/types.ts`; docs should clarify which ones are “legacy convenience exports” vs “contract authority” (mod-owned artifacts are the contract authority today).
