## Implementation Record

This slice replaces resource/discovery official-generator authority with typed
adapter intent materialization.

Implemented surfaces:

- `@civ7/adapter` now exports resource/discovery placement intent, outcome,
  rejection, and mismatch types from its public entrypoint.
- `EngineAdapter`, `Civ7Adapter`, and `MockAdapter` expose
  `placeResourceIntent` and `placeDiscoveryIntent`.
- Final placement publishes:
  - `artifact:placement.resourcePlacementOutcomes`
  - `artifact:placement.discoveryPlacementOutcomes`
- Resource reconciliation accepts typed engine feasibility rejections, but
  fails hard on wrong-type resource readback.
- Discovery reconciliation accepts only typed adapter acceptance/rejection
  because Civ7 does not expose resource-like discovery readback.
- Final placement no longer calls `generateOfficialResources` or
  `generateOfficialDiscoveries` as accepted truth for resource/discovery
  outcomes.

The implementation deliberately does not port all Civ7 legality rules into
MapGen. Civ7 feasibility remains adapter-owned; MapGen owns deterministic
intent and typed reconciliation evidence.

## Test Posture

D4 closure evidence uses recipe-level placement execution for MapGen behavior.
Tests do not call `applyPlacementPlan` directly or seed placement step artifacts
as the D4 harness. Direct adapter unit tests are limited to the adapter package,
where the adapter boundary itself is the unit under review.

## Authority Updates

Updated authority surfaces:

- `docs/system/libs/mapgen/reference/domains/PLACEMENT.md`
- `docs/system/mods/swooper-maps/architecture.md`
- `docs/system/mods/swooper-maps/adrs/adr-002-plot-tagging-adapter.md`
- `openspec/changes/normalize-placement-contracts/implementation.md`

No new deferral was recorded. The retained complexity is intentional: resources
and discoveries stay in final placement for now because their independent
product boundaries are not yet split, while typed outcome artifacts make the
authority boundary auditable.

## Validation

- `bun run --cwd packages/civ7-adapter check`
- `bun run --cwd packages/civ7-adapter build`
- `bun run --cwd mods/mod-swooper-maps check`
- `bun test packages/civ7-adapter/test/placement-outcomes.test.ts packages/civ7-adapter/test/discovery-constants.test.ts`
- `bun run --cwd mods/mod-swooper-maps test -- test/map-hydrology/lakes-area-recalc-resources.test.ts test/placement/placement-does-not-call-generate-snow.test.ts test/placement/resources-landmass-region-restamp.test.ts test/placement/landmass-region-id-projection.test.ts test/placement/plan-ops.test.ts test/placement/placement-contracts.test.ts test/standard-run.test.ts` (27 tests)
- `bun run lint:mapgen-recipe-imports`
- `bun run lint:domain-refactor-guardrails`
- `bun run lint:mapgen-docs` (passes with the existing three `@mapgen/*`
  documentation warnings)
- `bun run openspec -- validate normalize-placement-reconciliation --strict`
- `bun run openspec:validate`
- `git diff --check`
