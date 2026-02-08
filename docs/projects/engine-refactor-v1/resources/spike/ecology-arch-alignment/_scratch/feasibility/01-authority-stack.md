# Authority Stack (Feasibility)

Goal: list which documents are treated as canonical vs supporting for this feasibility stage, and explicitly avoid ADR drift.

## Canonical (Primary; constraints)

- MapGen architecture + layering:
  - `docs/system/libs/mapgen/explanation/ARCHITECTURE.md`
- MapGen domain modeling (ops/steps/stages; contracts; ownership):
  - `docs/system/libs/mapgen/explanation/DOMAIN-MODELING.md`
  - `docs/projects/engine-refactor-v1/resources/spec/SPEC-step-domain-operation-modules.md`
  - `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`
- Policies:
  - Truth vs projection: `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`
  - Schemas/validation: `docs/system/libs/mapgen/policies/SCHEMAS-AND-VALIDATION.md`
- Viz posture:
  - `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`

## Supporting (Evidence/examples; must not override canonical)

- Domain references:
  - `docs/system/libs/mapgen/reference/domains/ECOLOGY.md`
  - `docs/system/libs/mapgen/reference/domains/MORPHOLOGY.md`
  - `docs/system/libs/mapgen/reference/domains/HYDROLOGY.md`
  - `docs/system/libs/mapgen/reference/domains/PLACEMENT.md`
- Repo workflow:
  - `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/WORKFLOW.md`
  - `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/references/*`
- Code (ground truth):
  - `mods/mod-swooper-maps/src/domain/ecology/**`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/**`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/**`

## Explicit Avoids

- ADRs are not a primary source of truth in this stage.
- Treat ADRs older than ~10 days as non-authoritative for behavior/architecture direction.

## Locked Directives (Restated)

- Atomic per-feature ops (no multi-feature mega-ops).
- Compute substrate model: compute ops (shared layers) vs plan ops (discrete intents/placements).
- Maximal modularity target (performance later via substrate/caching).

