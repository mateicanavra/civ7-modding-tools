<toc>
  <item id="local-plan" title="Local plan"/>
  <item id="contracts" title="Contracts + artifacts"/>
  <item id="code-sources" title="Code sources"/>
  <item id="doc-sources" title="Doc/spec sources"/>
  <item id="drift" title="Drift + risks"/>
</toc>

# Scratch: MapGen domain — Ecology

## Questions
- Domain contract surface (inputs/outputs)?
- What stage/step(s) does Ecology own in the standard recipe?
- What cross-domain dependencies exist (and are they intended)?

## Local plan (this pass)
1. Confirm stage boundaries and config surfaces (`ecology` and `map-ecology`).
2. Enumerate artifacts and their ownership boundaries (soils, biomes, resource basins, feature intents).
3. Reconcile the “feature placement ownership” boundary with placement + engine behavior:
   - `docs/system/libs/mapgen/ecology.md`
   - `docs/system/libs/mapgen/placement.md`
4. Note any places the current implementation still leaks “cross-domain heuristics” (if any) and whether docs acknowledge it.

## Docs found

## Code touchpoints
- Domain implementation (mod-owned): `mods/mod-swooper-maps/src/domain/ecology/*`
- Domain ops (compile/runtime): `mods/mod-swooper-maps/src/domain/ecology/ops.ts`
- Standard recipe stages:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/index.ts`
- Ecology artifacts: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts`

## Notes
- Standard recipe ordering (stages): `ecology` → `map-ecology` (see `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`).
- Notable artifact ids (from `ecology/artifacts.ts`):
  - `artifact:ecology.biomeClassification`
  - `artifact:ecology.soils`
  - `artifact:ecology.resourceBasins`
  - `artifact:ecology.featureIntents`
