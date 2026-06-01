# Rough-Land Proof

## Local Terrain Stats

- Scout case: Swooper Earthlike, seed `1018`, `106x66`.
- Result after `morphology/plan-rough-lands`:
  - planned mountains: `7.991%`
  - planned hills: `17.999%`
  - planned rough-land hills: `17.924%`
  - final mountains: `6.535%`
  - final non-volcano mountains: `5.639%`
  - final hills: `15.982%`
  - final flat terrain: `72.853%`
  - final non-volcano rough terrain: `21.621%`
- Stable `80x50` Swooper Earthlike seed matrix
  `[1,2,3,42,99,1234,7777,1018]`:
  - planned hills: `17.94-18.00%`
  - final hills: `14.56-16.61%`
  - final flat terrain: `71.42-79.58%`
  - final non-volcano rough terrain: `16.42-23.22%`

## Commands

- `bun test test/pipeline/terrain-relief-diagnostics.test.ts test/pipeline/terrain-relief-balance.test.ts`
  - passed, `3` tests.
- `bun test test/morphology/m11-mountains-physics-anchored.test.ts test/morphology/m12-mountains-present.test.ts`
  - passed, `3` tests.
- `bun test test/morphology/plan-rough-lands.test.ts`
  - passed, `2` tests.
- `bun run --cwd packages/sdk build`
  - passed; required so generated map imports resolve current SDK dts.
- `bun run --cwd mods/mod-swooper-maps check`
  - passed.
- `bun run openspec -- validate morphology-rough-land-owner --strict`
  - passed.
- `bun run openspec:validate`
  - passed, `30` items.
- `git diff --check`
  - passed.

## Review Findings

- Fresh peer review found no P1 issues for this slice.
- Accepted P2 repaired: added owner-local tests for `morphology/plan-rough-lands`
  core invariants instead of relying only on pipeline-level relief accounting.
- Accepted P2 repaired: aligned the `fractalRoughLand` contract wording with the
  strategy, where it contributes to rough-land scoring and clustering rather
  than only breaking ties.

## Downstream Ecology Follow-Up

The rough-land owner slice initially left broad ecology-feature gates failing:

- `swooper-earthlike FEATURE_SAGEBRUSH_STEPPE habitat mismatch`: expected `0`,
  received `15`.
- `rainforest seed presence`: expected `8`, received `7`.

The follow-up downstream repair on `codex/morphology-peer-review-repairs`
resolved this without changing terrain proof: vegetation planning now rejects
placements outside broad feature habitat, Swooper Earthlike reef/rainforest
thresholds are realigned, and the stale atoll habitat fixture matches the
current off-shelf atoll scorer. `bun test test/pipeline/world-balance-stats.test.ts`
now passes.

## Target-Map Runtime Proof

- Branch/head before proof-record update:
  `codex/morphology-peer-review-repairs@2528bd75994a`.
- Fresh deploy command: `bun run --cwd mods/mod-swooper-maps deploy`.
- Controlled setup/start proof:
  `bun run verify:studio-run-in-game:live -- --mutate --map-script '{swooper-maps}/maps/swooper-earthlike.js' --map-size MAPSIZE_STANDARD --seed 1018 --game-seed 1018 --from-running-game exit-to-shell --timeout-ms 10000 --wait-timeout-ms 180000 --poll-interval-ms 2000`.
- Verifier proof id: `studio-run-in-game-live-proof-mpufnk77-239f`.
- Runtime map: Swooper Earthlike standard map, seed `1018`, `84x54`,
  `4536` plots, turn `1`.
- Engine terrain readback after fresh deploy:
  `{0:98,1:278,2:1234,3:1083,4:1815,5:28}` for mountain, hill, flat, coast,
  ocean, and navigable river.
- Runtime land shares: mountains `5.98%`, hills `16.97%`, flats `75.34%`,
  navigable rivers `1.71%`.
- Engine elevation/cliff readback: elevation min `0`, max `1420`, mean
  `200.498`; `994` cliff crossings; `0` cliff errors.
- Stale-output boundary: a pre-deploy controlled run of the same seed read back
  only `5` hills, but the deployed bundle did not yet contain
  `morphology/plan-rough-lands`. After deploy, the same seed read back `278`
  hills, so the earlier result is classified as stale deployed output rather
  than current Morphology failure.
