# SCRATCH Worker C — Placement Resources/Wonders/Discoveries

## Ownership
- Slices: S4, S5
- Branches: `codex/prr-epp-s4-resources-deterministic`, `codex/prr-epp-s5-placement-randomness-zero`
- Focus: Deterministic planning + stamping for resources, then wonders/discoveries.

## Working Checklist
- [ ] Add `plan-resources` op and placement resource plan artifact.
- [ ] Break adapter interface for resource IO (`get/set/canHaveResource`).
- [ ] Remove `generateResources` usage from placement apply path.
- [ ] Add deterministic natural wonder and discovery planners.
- [ ] Break adapter interface for deterministic wonder/discovery placement.
- [ ] Remove random engine generation calls from placement step.

## Decision Log
- 2026-02-14: Centralized odd-q cube conversion + wrapped hex distance into `@swooper/mapgen-core/lib/grid` (`oddqToCube`, `hexDistanceOddQPeriodicX`) and removed local math duplication from `placement/plan-resources` strategy. Determinism is preserved because the helper uses the same periodic-x wrap and cube max-norm distance math as before.
- 2026-02-14: Removed `minPriority01` thresholding from `placement/plan-resources` strategy/contract. The threshold was a non-physical compositional gate; planning now keeps physically valid land/non-lake candidates and relies on deterministic ranking + target count + spacing/share constraints for selection.

## Algorithm Notes
- Suitability ranking is unchanged: `priority = avg(fertility, hydro, stress, temperateSuitability)` with deterministic tie-breakers (`stress`, then `plotIndex`).
- Candidate pruning now uses only physical masks (`landMask === 1`, `lakeMask !== 1`); no additional heuristic cutoff is applied before sorting.
- Spacing still enforces wrapped odd-q hex distance (`hexDistanceOddQPeriodicX`) against already-selected placements.

## Audit Findings

### RNG surfaces inside the placement apply boundary
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/packages/civ7-adapter/src/civ7-adapter.ts:290-294` exposes `EngineAdapter.getRandomNumber`, the single permitted path that calls `TerrainBuilder.getRandomNumber` in the Civ7 runtime.
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/packages/civ7-adapter/src/civ7-adapter.ts:418-485` shows the placement-facing adapter methods (`addNaturalWonders`, `generateResources`, `generateDiscoveries`) delegating to the base-standard scripts (`natural-wonder-generator.js`, `resource-generator.js`, `discovery-generator.js`). Those scripts busy themselves with `TerrainBuilder.getRandomNumber` (e.g., `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/.civ7/outputs/resources/Base/modules/base-standard/maps/resource-generator.js:74-95`, `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/.civ7/outputs/resources/Base/modules/base-standard/maps/natural-wonder-generator.js:69-140`, `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/.civ7/outputs/resources/Base/modules/base-standard/maps/discovery-generator.js:45-62`) to scatter resources, pick wonder locations, and roll discovery types.
- Downstream TS code never re-invents RNG inside `applyPlacementPlan`; the `ExtendedMapContext` helpers (`/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/packages/mapgen-core/src/core/types.ts:369-387`) derive their seeds via `ctxRandom`, which itself calls `adapter.getRandomNumber`. Therefore the apply boundary is the deterministic cut point: RNG only flows through the adapter and the Civ7 scripts it triggers.

### Adapter interface touchpoints for resources/wonders/discoveries
- The adapter contract (`/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/packages/civ7-adapter/src/types.ts:383-424`) explicitly lists `addNaturalWonders`, `generateResources`, and `generateDiscoveries` as the placement-write primitives and documents their base-standard origins. Any Interface Break (new args, splits like `generateResourcesWithOptions`, or replacement of these calls with hand-rolled placement) tears every callsite in `applyPlacementPlan` and mocking fixtures.
- `MockAdapter` (`/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/packages/civ7-adapter/src/mock-adapter.ts:280-339` and `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/packages/civ7-adapter/src/mock-adapter.ts:694-756`) is the test harness for these hooks: it records call counts on `calls.addNaturalWonders`, `calls.generateResources`, and `calls.generateDiscoveries`, and its RNG defaults to `Math.random` unless overridden via `rng` (used in determinism tests). Brent changes to the interface (new method, rounding, required start positions, etc.) would mean updating this class and all tests that exercise `createMockAdapter` for placement.
- Tests rely on the bun prelude (`/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/packages/mapgen-core/test/setup.ts:11-44`) to stub the `/base-standard` scripts before the adapter even loads, so any new script alias (e.g., `placement-resources-v2.js`) would need a matching mock module.

### Placement outputs are placeholders today
- `applyPlacementPlan` returns `PlacementOutputsV1` at `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/placement/apply.ts:188-195`. Four of the five counters (`floodplainsCount`, `snowTilesCount`, `resourcesCount`, `discoveriesCount`) are hard-coded to zero, while only `naturalWondersCount` is sourced from the plan and `startsAssigned` is computed from the `assignStartPositions` helper; `methodCalls` is never populated. That means the current measurement is purely a checklist, not a reflection of what the engine placed.

### Tests/mocks that will need updates when the interface shifts
- `landmass-region-id-projection.test.ts` (lines `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps/test/placement/landmass-region-id-projection.test.ts:11-79`) rewires `createMockAdapter` to push `generateResources` and `setStartPosition` into `callOrder` and to assert that projection happens before the engine routines. Any removal/renaming of `generateResources` or parameter changes to the adapter methods causes the test to fail until it is updated.
- The bun test bootstrap (`/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/packages/mapgen-core/test/setup.ts:11-44`) mocks the scripts that `Civ7Adapter` imports (`natural-wonder-generator`, `resource-generator`, `discovery-generator`). Those mocks expect no arguments and must evolve whenever the adapter surface does (e.g., passing a `requestedWonders` array, or splitting discovery placement into two calls).
- The `MockAdapter.calls` ledger and `rng` stub become the canonical place for verifying resource/wonder/discovery invocations in unit tests, so breaking changes in the adapter signature must be mirrored in the call records and any helper utilities that consume them.

### Migration cut points & readiness gates
- `applyPlacementPlan` is the S4/S5 cutover boundary where gameplay-owned determinism hands off to the Civ7 engine. All deterministic planning (region labels, start assignments, artifact counts) must settle before the engine RNG-heavy routines run, because the adapter methods triggered there still leverage `TerrainBuilder.getRandomNumber`. `landmass-region-id-projection.test.ts` is already the regression gate that ensures the `setLandmassRegionId` projection runs before `generateResources`/`setStartPosition`, so reuse it as a validation point when wiring the deterministic resource plan.
- Placement outputs (`PlacementOutputsV1`) are the only artifact the stage emits about resource/wonder/discovery results; they currently contain placeholder zeros. When the new deterministic plan is wired, these fields (or the optional `methodCalls` array) must become the cut point that proves the deterministic placement logic produced the expected counts, because the actual adapter calls simply delegate to the engine and can no longer be inspected directly.

## S4 placement-step contract cleanup (2026-02-14)

### Findings
- `derive-placement-inputs/contract.ts` was importing `PlacementInputsConfigSchema` from `placement-inputs.ts`, which couples step config schema ownership to an artifact schema module instead of keeping the step contract self-contained.
- The runtime typing path in `derive-placement-inputs/inputs.ts` is already contract-anchored (`Static<typeof DerivePlacementInputsContract.schema>`), so once the contract schema is inlined, `buildPlacementInputs` and `createStep` stay aligned without extra type glue.

### Exact decisions
- Removed `PlacementInputsConfigSchema` import from `derive-placement-inputs/contract.ts`.
- Inlined a local `DerivePlacementInputsStepConfigSchema` in `derive-placement-inputs/contract.ts` using domain op config schemas directly:
  - `placement.ops.planWonders.config`
  - `placement.ops.planFloodplains.config`
  - `placement.ops.planResources.config`
  - `placement.ops.planStarts.config`
- Kept the schema strict (`additionalProperties: false`) and contract-local; no stage `public`/`compile` scaffolding was introduced.
- Kept `placement-inputs.ts` schema exports unchanged for artifact typing (`PlacementInputsV1Schema`/`placementConfig`) to avoid cross-layer coupling from artifact contracts back into step contracts.

## S4 deterministic resource stamping cutover — implementation update (2026-02-14)

### Files edited (owned scope)
- `packages/civ7-adapter/src/types.ts`
- `packages/civ7-adapter/src/civ7-adapter.ts`
- `packages/civ7-adapter/src/mock-adapter.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/placement/apply.ts`

### Implementation notes
- Added deterministic resource IO surface on `EngineAdapter`:
  - `getResourceType(x, y)`
  - `setResourceType(x, y, resourceType)`
  - `canHaveResource(x, y, resourceType)`
- Implemented Civ7 adapter boundary methods using Civ7 globals only (no algorithm logic in adapter):
  - Reads via `GameplayMap.getResourceType`.
  - Writes/validation via `ResourceBuilder.setResourceType` and `ResourceBuilder.canHaveResource`.
- Implemented mock adapter resource state:
  - Added internal `resources` buffer and new resource IO methods.
  - Added `calls.setResourceType` telemetry.
  - Added `resourcesPlaced` counter updated on set/clear transitions.
  - Added optional `canHaveResource` config hook.
- Placement apply cutover:
  - Removed `adapter.generateResources(width, height)` usage from placement apply.
  - Added deterministic stamping from `resourcePlan` placements/candidate types.
  - Placement now validates/rotates candidate types deterministically using plan-provided `preferredTypeOffset`.
  - Placement now records real `resourcesPlaced` count from stamped writes.
  - Updated placement outputs: `resourcesCount = resourcesPlaced`.
  - Updated engine-state publication to include real `resourcesPlaced`.
  - Preserved parity telemetry semantics (`resourcesAttempted`, `resourcesError`, `waterDriftCount`) and extended parity event with `resourcesPlaced`.
- Backward compatibility for direct test calls of `applyPlacementPlan(...)` without `resources`:
  - Added deterministic non-random fallback plan generation from non-water tiles to keep legacy direct-call tests functional while runtime path uses artifact `resourcePlan`.

### Command outputs
- `bun run --cwd packages/civ7-adapter check`
  - Output: `tsc --noEmit` (pass)

- `bun run --cwd mods/mod-swooper-maps check`
  - Output: `tsc --noEmit` (fail)
  - Error (unrelated to this slice / outside owned files):
    - `src/domain/placement/ops/plan-resources/strategies/default.ts(14,3): error TS2322 ... readonly [] is not assignable to mutable ...`

- `bun test mods/mod-swooper-maps/test/placement/resources-landmass-region-restamp.test.ts`
  - Result: pass

- `bun test mods/mod-swooper-maps/test/map-hydrology/lakes-area-recalc-resources.test.ts`
  - Result: pass

- `bun test mods/mod-swooper-maps/test/placement/placement-does-not-call-generate-snow.test.ts`
  - Result: pass

- `bun test mods/mod-swooper-maps/test/placement/landmass-region-id-projection.test.ts`
  - Result: fail (pre-existing branch issue outside owned files)
  - Error:
    - `derive-placement-inputs` contract schema collision (`schema already defines key "wonders" (declare it only via contract.ops)`) from `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/derive-placement-inputs/contract.ts`.
