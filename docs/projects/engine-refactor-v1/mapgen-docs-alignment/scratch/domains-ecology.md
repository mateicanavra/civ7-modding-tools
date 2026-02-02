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

## Contracts + artifacts (standard recipe)

Ecology “truth” stage:

- `ecology`
  - Stage module: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/index.ts`
  - Config posture:
    - Stage uses a `public` schema with friendly keys (`pedology`, `resourceBasins`, `biomes`, etc.)
    - Stage `compile(...)` maps those keys to the kebab-case step ids.
  - Step contracts (order):
    - `pedology`
      - Requires artifacts: `artifact:morphology.topography`, `artifact:climateField`
      - Provides artifacts: `artifact:ecology.soils`
      - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/pedology/contract.ts`
    - `resource-basins`
      - Requires artifacts: `artifact:ecology.soils`, `artifact:morphology.topography`, `artifact:climateField`
      - Provides artifacts: `artifact:ecology.resourceBasins`
      - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/resource-basins/contract.ts`
    - `biomes`
      - Requires artifacts:
        - `artifact:climateField`
        - `artifact:hydrology.cryosphere`
        - `artifact:morphology.topography`
        - `artifact:hydrology.hydrography`
      - Provides artifacts: `artifact:ecology.biomeClassification`
      - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/contract.ts`
    - `biome-edge-refine`
      - Requires artifacts: `artifact:ecology.biomeClassification`, `artifact:morphology.topography`
      - Provides artifacts: —
      - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/contract.ts`
    - `features-plan`
      - Requires artifacts:
        - `artifact:ecology.biomeClassification`
        - `artifact:ecology.soils`
        - `artifact:hydrology.hydrography`
        - `artifact:morphology.topography`
      - Provides artifacts: `artifact:ecology.featureIntents`
      - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts`

Gameplay projection stage:

- `map-ecology`
  - Stage module: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/index.ts`
  - Provides engine-facing `field:*` tags (typed array presence) and `effect:*` tags:
    - `field:biomeId` + `effect:engine.biomesApplied` via `plot-biomes`
    - `field:featureType` + `effect:engine.featuresApplied` via `features-apply`
  - Step contracts:
    - `plot-biomes`
      - Provides: `field:biomeId`, `effect:engine.biomesApplied`
      - Requires artifacts: `artifact:ecology.biomeClassification`, `artifact:morphology.topography`
      - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.contract.ts`
    - `features-apply`
      - Provides: `field:featureType`, `effect:engine.featuresApplied`
      - Requires artifacts: `artifact:ecology.featureIntents`
      - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/contract.ts`
    - `plot-effects`
      - Requires artifacts: `artifact:morphology.topography`, `artifact:ecology.biomeClassification`
      - Provides: —
      - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/contract.ts`

Tag registry (how `field:*` and verified `effect:*` works today):
- `mods/mod-swooper-maps/src/recipes/standard/tags.ts`
  - `field:*` tags are satisfied by checking `context.fields.<field>` is a typed array of the expected grid size.
  - Some `effect:*` tags are verified via `context.adapter.verifyEffect(...)` or custom satisfy functions (e.g. placement).

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

## Doc/spec sources (authority)

- Domain conceptual doc: `docs/system/libs/mapgen/ecology.md`
- Ownership boundary doc: `docs/system/libs/mapgen/placement.md` (Ecology ↔ Placement boundary)

## Drift + risks

- Several “truth artifacts” are effectively buffer handles (they contain typed arrays and are mutated/refined by later steps), even though publish is write-once. This should be called out explicitly as a convention.
- `biome-edge-refine` currently declares no provides; it likely mutates `artifact:ecology.biomeClassification` in-place. That is consistent with the “buffer handle” posture but must be taught carefully to avoid contributors assuming artifacts are deeply immutable snapshots.
