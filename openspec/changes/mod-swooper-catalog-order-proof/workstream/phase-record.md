# Mod Swooper Catalog Order Proof Phase Record

## State

- Branch/Graphite stack: `agent-F-mod-swooper-catalog-order-proof` above
  `agent-F-mapgen-studio-root-load-followup`.
- Change id: `mod-swooper-catalog-order-proof`.
- Objective: remove the current H4 full-root proof blocker by making the
  Swooper Maps morphology catalog ownership test exact about facade membership
  but independent of Biome-controlled export order.
- Status: IMPLEMENTED AND LOCALLY VERIFIED; full H4 root-test proof was rerun
  after this repair and failed in a separate generated recipe artifact race.

## Authority And Inputs

- Root `AGENTS.md`: keep generated outputs read-only, update adjacent records,
  and leave the worktree clean.
- `mods/mod-swooper-maps/AGENTS.md`: `mod/` is generated build output and must
  stay read-only; use package/root test commands for verification.
- `mods/mod-swooper-maps/src/AGENTS.md`: source entrypoints stay small and
  declarative; avoid source changes for a test-order issue.
- H4 phase record: H4 task 2.4 remains open because the full root-test proof
  now fails in `mod-swooper-maps:test` after the mapgen-studio root-load
  classes are repaired.

## Opening Evidence

- Full root proof after `mapgen-studio-root-load-followup`:
  `NX_DAEMON=false bunx nx run-many -t test --outputStyle=static` failed with
  exit 1. `mapgen-studio:test` passed 47 files / 233 tests. The failed task is
  `mod-swooper-maps:test`.
- Focused reproduction:
  `NX_DAEMON=false bunx nx run mod-swooper-maps:test --skip-nx-cache
  --outputStyle=static` failed only
  `test/morphology/catalog-ownership.test.ts` (`morphology catalog ownership >
  keeps the domain config facade limited to recipe-facing knobs`).
- The expected and received facade contents have the same two allowed export
  lines, `./shared/knobs.js` and `./shared/knob-multipliers.js`, in different
  order.

## Implementation Plan

1. Keep the source facade unchanged unless investigation finds real ownership
   drift.
2. Replace the literal file-string assertion with an exact set assertion over
   non-empty export lines.
3. Verify the focused proof first, then the direct Nx project, then update H4
   records before the next full root-test proof.

## Verification

- Focused proof:
  `bun test test/morphology/catalog-ownership.test.ts` from
  `mods/mod-swooper-maps` passed 3 tests / 6 expects.
- Direct Nx project proof:
  `NX_DAEMON=false bunx nx run mod-swooper-maps:test --skip-nx-cache
  --outputStyle=static` passed twice after the repair. The logged run at
  `/tmp/mod-swooper-maps-test-after-catalog-order-proof.log` passed 567 tests,
  2 skipped, 0 failed across 145 files with 31,867 expects.
- Generated/protected drift check after the Nx project proof returned no
  tracked generated/protected paths.
- Full root proof after this repair:
  `NX_DAEMON=false bunx nx run-many -t test --outputStyle=static` failed with
  exit 1. `mapgen-studio:test` passed 47 files / 233 tests, and the
  catalog-order proof no longer failed. The failed task remained
  `mod-swooper-maps:test` because `test/config/standard-recipe-artifact-guards.test.ts`
  saw an unhandled ENOENT reading
  `mods/mod-swooper-maps/dist/recipes/standard-artifacts.js` while root-load
  execution was also rebuilding `build:studio-recipes`. This is a separate
  generated recipe artifact race and the next H4 proof repair.

## H4 Carry-forward

- This slice clears the catalog facade order proof under focused and direct Nx
  project evidence.
- This is a temporary H4 root-proof repair, not the final home for the guard.
  The catalog ownership proof is a structural boundary check and should be
  migrated into Habitat-owned enforcement during H5/H6, then retired from the
  normal test suite after parity proof.
- No H4 task 2.4 green claim is made until the generated recipe artifact race
  is repaired and full root test passes.
