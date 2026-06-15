# Mapgen Studio Root-Load Follow-up Phase Record

## State

- Branch/Graphite stack: `agent-F-mapgen-studio-root-load-followup` above
  `agent-F-cli-root-load-test-timeouts`.
- Change id: `mapgen-studio-root-load-followup`.
- Objective: remove the remaining H4 root-test proof blocker by stabilizing
  the second `mapgen-studio:test` root-load class without weakening existing
  assertions.
- Status: IMPLEMENTED AND LOCALLY VERIFIED; full H4 root-test proof was rerun
  after this repair and passed `mapgen-studio:test`, then failed in a separate
  `mod-swooper-maps:test` catalog-order proof. H4 task 2.4 remains open.

## Authority And Inputs

- Root `AGENTS.md`: keep generated outputs read-only, update adjacent records,
  and leave the worktree clean.
- H4 phase record: H4 task 2.4 remains open because full/root-load test proof
  fails only in `mapgen-studio:test` after the earlier DL-15/DL-16, first
  mapgen, and CLI repairs.
- `mapgen-studio-test-timeouts`: previous slice gave the project a scoped
  timeout and reduced the browser fixture to `32x20`, but heavy root load can
  still exceed the browser test's explicit 240s budget.
- `cli-root-load-test-timeouts`: CLI root-load timeouts are repaired; the
  remaining red class is independent.

## Opening Evidence

- Representative uncached root-load probe after the CLI timeout repair:
  `NX_DAEMON=false bunx nx run-many -t test
  --projects=@mateicanavra/civ7-cli,mapgen-studio,@internal/habitat-harness,mod-civ7-intelligence-bridge
  --parallel=4 --skip-nx-cache --outputStyle=static` failed in
  `mapgen-studio:test`, while CLI passed 53 files / 234 tests in 445.71s.
- The failing mapgen classes were:
  - `test/browserRunner/standardLayerVisibility.test.ts`: explicit 240s
    timeout at 241.738s.
  - `test/server/tunerSession.test.ts`: first shared-session FIN test failed
    with `(FiberFailure) UnknownException: An unknown error occurred in
    Effect.tryPromise`.
- A later full root probe replayed the same mapgen class; no H4 task 2.4 green
  claim has been made.

## Implementation Plan

1. Keep `standardLayerVisibility` on the standard recipe and preserve every
   asserted layer/invariant, but shrink the map dimensions further so the proof
   covers layer wiring rather than large-map runtime.
2. Keep the tuner test's one-connection and FIN assertions, but make cleanup
   deterministic with `finally` and replace the fixed 50ms FIN sleep with a
   bounded poll.
3. Verify focused tests first, then direct project, then representative
   uncached Nx load using `--excludeTaskDependencies` to avoid unrelated
   dependency rebuild churn.

## Verification

- Focused browser-worker probes:
  - `bunx vitest run --config vitest.config.ts --project mapgen-studio
    test/browserRunner/standardLayerVisibility.test.ts` passed with the
    intermediate `24x16` fixture, but the test body still took 204.70s under
    concurrent focused load, which was too close to the 240s cap.
  - The same focused command passed with `16x12` in 120.28s.
  - The same focused command passed with `12x8`/2 players in 37.83s, proving
    the same assertions still held at the smaller standard-recipe scale.
  - Final focused proof with `8x6`/2 players passed with exit 0 (1 file / 1
    test, 39.41s duration, test body 35.788s). The emitted logs showed
    `plotCount: 48`, placement surface output, resource placement output, and
    the unchanged layer assertions passed.
- Focused tuner proof:
  `bunx vitest run --config vitest.config.ts --project mapgen-studio
  test/server/tunerSession.test.ts` passed twice after the final tuner change:
  first in 180.98s total / 6.02s test time while the browser focused run was
  concurrent, then in 34.44s total / 1.28s test time after the final browser
  reduction.
- Direct project proof:
  - With the intermediate `12x8` fixture, `bunx vitest run --config
    vitest.config.ts --project mapgen-studio` passed 47 files / 233 tests in
    171.33s.
  - With the final `8x6` fixture, the same direct project command passed 47
    files / 233 tests in 131.53s. `standardLayerVisibility` passed inside that
    run with a 116.811s test body; `tunerSession` passed with the first
    shared-session FIN proof at 931ms.
- Representative load proof:
  - An intermediate `12x8` run passed:
    `NX_DAEMON=false bunx nx run-many -t test
    --projects=mapgen-studio,@mateicanavra/civ7-cli,@internal/habitat-harness,mod-civ7-intelligence-bridge
    --parallel=4 --skip-nx-cache --excludeTaskDependencies --outputStyle=static`.
    `mapgen-studio:test` passed 47 files / 233 tests in 350.45s; the browser
    proof passed in 190.111s and the tuner proof passed in 3.201s.
  - Final `8x6` representative proof used the same command and passed with
    exit 0 for all four targets. `mapgen-studio:test` passed 47 files / 233
    tests; `standardLayerVisibility` passed in 11.150s and the CLI target
    passed 53 files / 234 tests. Nx still reported `@mateicanavra/civ7-cli:test`
    as flaky because of prior failed history, but the command exited 0.
- OpenSpec validation:
  `bun run openspec -- validate mapgen-studio-root-load-followup --strict`
  passed.
- H4 cross-validation:
  `bun run openspec -- validate habitat-biome-hygiene --strict` passed.
- Full root-test proof after this repair:
  `NX_DAEMON=false bunx nx run-many -t test --outputStyle=static` failed with
  exit 1, but the repaired class stayed green: `mapgen-studio:test` passed 47
  files / 233 tests. The failed task is now `mod-swooper-maps:test`. A focused
  reproduction with `NX_DAEMON=false bunx nx run mod-swooper-maps:test
  --skip-nx-cache --outputStyle=static` fails only the morphology catalog
  ownership proof, where the domain config facade contains the same two
  allowed exports in Biome-organized order. This confirms the mapgen-studio
  slice's repair boundary and promotes the next root-test blocker into its own
  slice.
- Diff hygiene:
  `git diff --check` passed.
- Generated/protected drift check:
  `git diff --name-only | rg '(^|/)dist/|(^|/)types/|(^|/)mod/|^\.civ7/outputs/|src/maps/generated|packages/civ7-types/generated|civ7-tables\.gen\.ts|example-generated-mod|packages/cli/out\.svg' || true`
  returned no tracked generated/protected paths.

## Agent Review Notes

- Lagrange (`019ec1fa-0148-78c2-a2a4-5460544956e8`) independently confirmed
  the tuner-session shape: increase only the fake-tuner command timeout in the
  first proof, dispose the Effect runtime in `finally`, and poll for FIN
  without weakening the one-connection or FIN assertions.
- Peirce (`019ec1f9-5e87-7901-8427-94bf587e3d20`) independently confirmed the
  browser-runner shape: keep `mod-swooper-maps/standard`, not
  `browser-test`, because the lightweight recipe cannot preserve the ecology
  score-layer or placement land-mask assertions; shrink the fixture instead.

## H4 Carry-forward

- This slice clears the known second `mapgen-studio:test` root-load class under
  focused, direct project, and representative uncached Nx load evidence.
- A full root-test rerun after this slice passed `mapgen-studio:test` and
  exposed a separate `mod-swooper-maps:test` catalog-order proof failure. No
  full-root green claim is made from this slice alone; H4 task 2.4 remains open
  until the next blocker is repaired and root test passes.
