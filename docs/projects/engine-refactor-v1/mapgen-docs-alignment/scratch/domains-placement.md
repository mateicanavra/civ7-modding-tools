<toc>
  <item id="local-plan" title="Local plan"/>
  <item id="contracts" title="Contracts + artifacts"/>
  <item id="code-sources" title="Code sources"/>
  <item id="doc-sources" title="Doc/spec sources"/>
  <item id="drift" title="Drift + risks"/>
</toc>

# Scratch: MapGen domain — Placement

## Questions
- Domain contract surface (inputs/outputs)?
- What stage/step(s) does Placement own in the standard recipe?
- What cross-domain dependencies exist (and are they intended)?

## Local plan (this pass)
1. Confirm stage boundary + artifact shapes (`placementInputs` and `placementOutputs`).
2. Reconcile “decision vs field mutation” posture in `docs/system/libs/mapgen/placement.md` with current step implementations.
3. Cross-check engine-refactor-v1 placement ADRs against current reality (especially effects and verification contracts).
4. Note any “engine-coupled” placement calls that must be treated as adapters/effects in docs.

## Docs found

## Code touchpoints
- Domain implementation (mod-owned): `mods/mod-swooper-maps/src/domain/placement/*`
- Domain ops (compile/runtime): `mods/mod-swooper-maps/src/domain/placement/ops.ts`
- Standard recipe stage: `mods/mod-swooper-maps/src/recipes/standard/stages/placement/index.ts`
- Placement artifacts: `mods/mod-swooper-maps/src/recipes/standard/stages/placement/artifacts.ts`

## Notes
- Standard recipe ordering: `placement` stage is last (see `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`).
- Notable artifact ids:
  - `artifact:placementInputs`
  - `artifact:placementOutputs`
