<toc>
  <item id="local-plan" title="Local plan"/>
  <item id="contracts" title="Contracts + artifacts"/>
  <item id="code-sources" title="Code sources"/>
  <item id="doc-sources" title="Doc/spec sources"/>
  <item id="drift" title="Drift + risks"/>
</toc>

# Scratch: MapGen domain — Morphology

## Questions
- Domain contract surface (inputs/outputs)?
- What stage/step(s) does Morphology own in the standard recipe?
- What cross-domain dependencies exist (and are they intended)?

## Local plan (this pass)
1. Confirm per-stage public config + knobs posture (pre/mid/post + map-morphology stages).
2. Enumerate artifacts + “buffer handles” (topography, routing, substrate, landmasses, coastline metrics).
3. Cross-check the conceptual doc posture:
   - `docs/system/libs/mapgen/morphology.md` (explicitly not Phase 2 contract authority)
   - Phase 2 specs referenced from that doc.
4. Note any mismatches between “aspirational morphology” docs and the current staged implementation.

## Docs found

## Code touchpoints
- Domain implementation (mod-owned): `mods/mod-swooper-maps/src/domain/morphology/*`
- Domain ops (compile/runtime): `mods/mod-swooper-maps/src/domain/morphology/ops.ts`
- Standard recipe stages:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-mid/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-post/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/index.ts`
- Morphology artifacts (partial): `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/artifacts.ts`

## Notes
- Standard recipe ordering (stages): `morphology-pre` → `morphology-mid` → `morphology-post` → `map-morphology` (see `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`).
- Notable artifact ids (from `morphology-pre/artifacts.ts`):
  - `artifact:morphology.topography`
  - `artifact:morphology.routing`
  - `artifact:morphology.substrate`
  - `artifact:morphology.coastlineMetrics`
  - `artifact:morphology.landmasses`
  - `artifact:morphology.volcanoes`
