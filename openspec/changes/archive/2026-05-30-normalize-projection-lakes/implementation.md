## Implementation Record

`normalize-projection-lakes` moves lake authority from Civ7 engine generation to
Hydrology-owned intent plus adapter projection evidence.

## What Changed

- Added `EngineAdapter.stampLakes(width, height, lakeMask)` with readback masks
  and counts in both `Civ7Adapter` and `MockAdapter`.
- Added Hydrology `plan-lakes` as an op-local contract/strategy. The strategy
  trusts the contract boundary for typed-array shape validation and only owns
  lake intent rules.
- Added `artifact:hydrology.lakePlan` and a `hydrology-hydrography/lakes` step.
- Moved `lakeiness` to `hydrology-hydrography`; it now maps to
  `planLakes.config.maxUpstreamSteps` instead of `map-hydrology` projection
  frequency.
- Updated `map-hydrology/lakes` to stamp `lakePlan` through the adapter and
  publish accepted/rejected projection evidence.
- Updated placement input derivation to consume `lakePlan` instead of
  `engineProjectionLakes`.
- Added a categorical map-stage guard: standard recipe stages may not call
  `adapter.generateLakes(...)`; only `map-hydrology/steps/lakes.ts` may call
  `adapter.stampLakes(...)`.
- Updated active hydrology, browser-adapter, testing, and deferral docs.

## Ownership Notes

- `plan-lakes` strategy config remains op-local. Domain-root Hydrology config
  remains a thin recipe-facing knob facade, not a strategy schema dumping
  ground.
- `map-hydrology` remains projection-only. It records engine readback but does
  not author lake truth.
- `generateLakes(...)` stays on the adapter interface as an existing Civ7 wrapper
  but is no longer used by the standard recipe lake path.

## Verification Evidence

- `bun run --cwd packages/civ7-adapter build`
- `bun run --cwd mods/mod-swooper-maps check`
- `bun run --cwd mods/mod-swooper-maps build`
- `bun run --cwd mods/mod-swooper-maps test -- test/hydrology/plan-lakes.test.ts test/hydrology-knobs.test.ts test/map-hydrology/lakes-store-water-data.test.ts test/map-hydrology/lakes-runtime-fill-drift.test.ts test/map-hydrology/lakes-area-recalc-resources.test.ts test/config/maps-schema-valid.test.ts test/config/presets-schema-valid.test.ts test/config/studio-presets-schema-valid.test.ts test/pipeline/map-stamping.contract-guard.test.ts test/pipeline/artifacts.test.ts test/pipeline/foundation-topology-lock.test.ts`
- `bun run lint:mapgen-recipe-imports`
- `bun run lint:domain-refactor-guardrails`
- `bun run openspec -- validate normalize-projection-lakes --strict`
- `bun run openspec:validate`
- `git diff --check`
