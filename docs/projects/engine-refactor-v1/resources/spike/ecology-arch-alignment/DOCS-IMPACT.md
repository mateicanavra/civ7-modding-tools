# DOCS IMPACT (Diataxis)

This spike produces a project-scoped research artifact under `docs/projects/engine-refactor-v1/resources/spike/`.
If we later execute the refactor, some docs may need updates/promotions.

## Diataxis Classification

- **Explanation** (why + mental model):
  - `docs/system/libs/mapgen/explanation/ARCHITECTURE.md`
  - `docs/system/libs/mapgen/explanation/DOMAIN-MODELING.md`
  - This spike’s `CURRENT.md`, `TARGET.md`, `REFRACTOR-TARGET-SHAPE.md`, `GREENFIELD.md`

- **Reference** (what is / contracts / ids):
  - `docs/system/libs/mapgen/reference/domains/ECOLOGY.md`
  - `docs/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md`
  - This spike’s `CONTRACTS.md`, `DRIFT.md`, `DECKGL-VIZ.md`

- **How-to guides** (task completion):
  - This spike’s `HARDENING.md` (parity harness guidance)

- **Tutorials** (learning-by-doing):
  - None introduced by this spike.

## If/When The Refactor Lands (Expected Updates)

- If step ids/artifact ids/op ids change (they should not for “no behavior change”), update:
  - `docs/system/libs/mapgen/reference/domains/ECOLOGY.md`
  - `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`

- If we choose an explicit artifact mutability posture for `artifact:ecology.biomeClassification`, reflect it in:
  - `docs/system/libs/mapgen/reference/domains/ECOLOGY.md` (contract section)

- If `plot-effects` gains an effect tag or other gating semantics, update:
  - `mods/mod-swooper-maps/src/recipes/standard/tags.ts` (and any relevant reference docs)

- If we add new viz keys or migrate existing keys, update:
  - `docs/system/libs/mapgen/pipeline-visualization-deckgl.md` (viz taxonomy + compatibility guidance)

## Notes

- This spike is intentionally project-scoped; any durable, evergreen rule changes should be promoted into the canonical system docs (reference/policy/spec) rather than left in spike form.
- For future work, prioritize canonical MapGen guidelines/specs/policies over ADRs; treat ADRs older than ~10 days as non-authoritative for behavior/architecture direction.
