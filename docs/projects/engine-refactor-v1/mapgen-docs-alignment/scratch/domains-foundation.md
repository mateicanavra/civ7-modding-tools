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
