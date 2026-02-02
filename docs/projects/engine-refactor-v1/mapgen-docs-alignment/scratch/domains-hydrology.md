<toc>
  <item id="local-plan" title="Local plan"/>
  <item id="contracts" title="Contracts + artifacts"/>
  <item id="code-sources" title="Code sources"/>
  <item id="doc-sources" title="Doc/spec sources"/>
  <item id="drift" title="Drift + risks"/>
</toc>

# Scratch: MapGen domain — Hydrology

## Questions
- Domain contract surface (inputs/outputs)?
- What stage/step(s) does Hydrology own in the standard recipe?
- What cross-domain dependencies exist (and are they intended)?

## Local plan (this pass)
1. Treat `docs/system/libs/mapgen/hydrology-api.md` as the code-facing contract; verify it matches the current ops + artifacts.
2. Confirm stage boundaries and “knobs-last” posture (baseline/hydrography/refine + map-hydrology projection).
3. Enumerate op contracts under `mods/mod-swooper-maps/src/domain/hydrology/ops/*/contract.ts` and confirm step ownership boundaries.
4. Record any “truth vs projection” splits (Hydrology truth artifacts vs engine-facing projection steps).

## Docs found

## Code touchpoints
- Domain implementation (mod-owned): `mods/mod-swooper-maps/src/domain/hydrology/*`
- Domain ops (compile/runtime): `mods/mod-swooper-maps/src/domain/hydrology/ops.ts`
- Standard recipe stages:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/index.ts`
- Hydrology artifacts:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/artifacts.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/artifacts.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/artifacts.ts`

## Notes
- Standard recipe ordering (stages): `hydrology-climate-baseline` → `hydrology-hydrography` → `hydrology-climate-refine` → `map-hydrology`.
- Notable artifact ids (from stage artifact modules):
  - `artifact:climateField`
  - `artifact:hydrology.climateSeasonality`
  - `artifact:hydrology._internal.windField`
  - `artifact:hydrology.hydrography`
  - `artifact:hydrology.climateIndices`
  - `artifact:hydrology.cryosphere`
  - `artifact:hydrology.climateDiagnostics`
