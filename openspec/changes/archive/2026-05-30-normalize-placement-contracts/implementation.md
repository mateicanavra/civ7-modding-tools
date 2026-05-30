## Implementation Record

This slice promotes the first real placement product boundary:
`place-natural-wonders`.

Natural wonders were promoted because they already have:

- an upstream deterministic plan artifact: `artifact:placement.naturalWonderPlan`
- a materialized product artifact: `artifact:placement.naturalWonderPlacement`
- an effect surface: `effect:placement.naturalWondersPlaced`
- full-stamp-or-fail verification
- a downstream consumer: final placement requires the effect and artifact

Resource, discovery, start, and advanced-start work was intentionally not
promoted in this slice. Resource and discovery planning already has plan
artifacts, but projection still delegates feasibility to official Civ
generators; typed outcomes and rejection reasons belong to
`normalize-placement-reconciliation` and are superseded there. Start assignment
feeds discovery materialization in the same runtime sequence and has no
independent downstream consumer yet. Advanced-start assignment remains an
engine-side terminal effect without an artifact consumer.

Maintenance operations remain transactional inside final placement:

- floodplain application
- terrain validation
- area recalculation
- water cache storage
- landmass-region restamping before typed resource materialization
- fertility recalculation

Those operations are ordered engine maintenance required for the placement
transaction; no independent artifact/effect/consumer contract currently
justifies splitting them into separate recipe steps.

## Validation

- `bun run --cwd mods/mod-swooper-maps check`
- `bun run --cwd mods/mod-swooper-maps build`
- `bun run --cwd mods/mod-swooper-maps test -- test/placement/placement-contracts.test.ts test/placement/placement-does-not-call-generate-snow.test.ts test/placement/resources-landmass-region-restamp.test.ts test/placement/plan-ops.test.ts test/placement/landmass-region-id-projection.test.ts test/standard-run.test.ts test/standard-recipe.test.ts test/pipeline/artifacts.test.ts`
- `bun run lint:mapgen-recipe-imports`
- `bun run lint:domain-refactor-guardrails`
- `bun run lint:mapgen-docs` (passes with the existing three `@mapgen/*` documentation warnings)
- `bun run openspec -- validate normalize-placement-contracts --strict`
- `bun run openspec:validate`
- `git diff --check`
