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
- Accepted P2 follow-up: add owner-local tests for `morphology/plan-rough-lands`
  core invariants instead of relying only on pipeline-level relief accounting.
- Accepted P2 follow-up: align the `fractalRoughLand` contract wording with the
  strategy, where it contributes to rough-land scoring and clustering rather
  than only breaking ties.

## Downstream Non-Closure

`bun test test/pipeline/world-balance-stats.test.ts` still fails in the ecology
surface:

- `swooper-earthlike FEATURE_SAGEBRUSH_STEPPE habitat mismatch`: expected `0`,
  received `15`.
- `rainforest seed presence`: expected `8`, received `7`.

This was already a failing downstream surface before the rough-land owner slice
and remains a required ecology-feature realignment. The rough-land slice does
not hide or relax that failure.
