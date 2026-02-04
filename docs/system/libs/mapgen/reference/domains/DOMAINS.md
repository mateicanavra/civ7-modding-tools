<toc>
  <item id="purpose" title="Purpose"/>
  <item id="domain-index" title="Domain index (canonical)"/>
  <item id="how-to-read" title="How to read these pages"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Domains (MapGen)

## Purpose

Define the canonical, target-architecture-first documentation surface for MapGen’s **domain model**:
- what each domain owns,
- where it runs in the standard recipe,
- what artifacts/tags it requires and provides,
- and what is considered truth vs projection.

This section is the intended “source of truth” for domain boundaries and contracts.

## Domain index (canonical)

Truth-first simulation domains:

- Foundation: [`docs/system/libs/mapgen/reference/domains/FOUNDATION.md`](/system/libs/mapgen/reference/domains/FOUNDATION.md)
- Morphology: [`docs/system/libs/mapgen/reference/domains/MORPHOLOGY.md`](/system/libs/mapgen/reference/domains/MORPHOLOGY.md)
- Hydrology: [`docs/system/libs/mapgen/reference/domains/HYDROLOGY.md`](/system/libs/mapgen/reference/domains/HYDROLOGY.md)
- Ecology: [`docs/system/libs/mapgen/reference/domains/ECOLOGY.md`](/system/libs/mapgen/reference/domains/ECOLOGY.md)

Gameplay / engine-facing integration domain (target):

- Gameplay: [`docs/system/libs/mapgen/reference/domains/GAMEPLAY.md`](/system/libs/mapgen/reference/domains/GAMEPLAY.md)

Legacy domain naming (mapping only; not target-canonical domains):

- Placement (legacy name for Gameplay’s placement phase): [`docs/system/libs/mapgen/reference/domains/PLACEMENT.md`](/system/libs/mapgen/reference/domains/PLACEMENT.md)
- Narrative (legacy name; absorbed into Gameplay): [`docs/system/libs/mapgen/reference/domains/NARRATIVE.md`](/system/libs/mapgen/reference/domains/NARRATIVE.md)

## How to read these pages

Each domain page is structured as:

- **Stages**: which standard recipe stages correspond to the domain boundary.
- **Contract**: required/provided artifacts + tags (and whether anything is mutated in-place).
- **Truth vs projection**: how to interpret outputs (simulation truth vs engine-facing projections).
- **Ops surface**: which op contracts the domain exposes (used by steps and by config compilation).
- **Ground truth anchors**: file paths + symbols you can use to verify the doc against code.

## Ground truth anchors

- Standard recipe stage order: `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`
- Standard recipe composition: `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
- Step contract model: `docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md`
- Policy: truth vs projection: `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`
