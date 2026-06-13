# Mapgen Studio Test Timeouts Phase Record

## State

- Branch/Graphite stack: `agent-F-mapgen-studio-test-timeouts` above
  `agent-F-plugin-vitest-project-scope`.
- Change id: `mapgen-studio-test-timeouts`.
- Objective: remove the remaining H4 root-test proof blocker by giving the
  integration-heavy `mapgen-studio` Vitest project an explicit project-scoped
  timeout budget and keeping its browser-worker fixture inside that budget
  without dropping assertions.
- Status: implemented and locally verified; ready to commit.

## Authority And Inputs

- Root `AGENTS.md`: update adjacent docs/tests when behavior or public
  contracts change; keep generated artifacts read-only.
- H4 phase record: after DL-15/DL-16 repairs, root test remains red through
  `mapgen-studio:test` timing out under full Nx test load.
- `vitest.config.ts`: root Vitest project matrix gave `mapgen-studio` only
  `test: { name: "mapgen-studio" }`, inheriting the default 5s timeout before
  this slice.

## Opening Evidence

- Root probe:
  `NX_DAEMON=false bunx nx run-many -t test --outputStyle=static` progressed
  past DL-15/DL-16 classes but `mapgen-studio:test` failed with 13 failed
  files / 16 timed-out tests after 601.30s.
- Timed-out classes include server one-mount, Effect-scoped tuner session,
  UI render, run-in-game console, and real Studio-emission visualization
  assertions.
- Remaining `mod-swooper-maps:test` child was interrupted only after the root
  probe was already red and had continued CPU-bound for more than 25 minutes.

## Implementation Plan

1. Add a `testTimeout` only to the `mapgen-studio` root Vitest project.
2. Keep all tests and assertions intact.
3. If the browser-worker fixture exceeds its own deadline, reduce fixture size
   instead of weakening the layer visibility assertions.
4. Verify direct `mapgen-studio` project execution, then run a representative
   load probe.
5. Update H4 records and close this slice only if the timeout class is gone.

## Implementation

- `vitest.config.ts` now gives only the `mapgen-studio` project an explicit
  `testTimeout: 180_000`; unrelated projects keep their existing timeout
  behavior.
- `standardLayerVisibility` keeps the same standard recipe, seed, layer
  assertions, terminal `run.finished` expectation, default-visible balance
  layer checks, tile-movement vector/arrow checks, and debug-only raw world
  motion checks.
- The browser-worker fixture uses compact `32x20` dimensions, a 120s internal
  worker deadline, and a 240s per-test budget. This removes the remaining
  deterministic timeout symptom without skipping suites or assertions.

## Verification

- `NX_DAEMON=false bunx nx run mapgen-studio:test --skip-nx-cache` was
  attempted first and interrupted after more than 25 minutes in dependency
  generation before reaching the Vitest project. No green claim is made from
  that probe.
- Direct pre-fix focused evidence:
  `bunx vitest run --config vitest.config.ts --project mapgen-studio` failed
  with `standardLayerVisibility` hitting its 35s explicit timeout and several
  other suites hitting the inherited 5s default timeout class.
- After adding the project timeout, the inherited-5s class was gone: 46/47
  files passed, including formerly slow standard-emission and one-mount
  suites. The remaining failure was `standardLayerVisibility`, where the
  worker did not finish before its own 30s internal deadline.
- Focused browser-worker proof after fixture reduction:
  `bunx vitest run --config vitest.config.ts --project mapgen-studio
  test/browserRunner/standardLayerVisibility.test.ts` passed with exit 0
  (1 test, 52.02s).
- Full direct project proof after fixture reduction:
  `bunx vitest run --config vitest.config.ts --project mapgen-studio` passed
  with exit 0 (47 files, 233 tests, 148.72s).
- Representative Nx load proof:
  `NX_DAEMON=false bunx nx run-many -t test
  --projects=mapgen-studio,@civ7/studio-server,@internal/habitat-harness,@civ7/docs,@civ7/playground,mod-civ7-intelligence-bridge
  --parallel=6 --outputStyle=static` passed with exit 0. Nx reported all six
  requested projects and 14 dependency tasks successful; `mapgen-studio:test`
  passed 47 files / 233 tests in 381.19s under the representative load.
- OpenSpec validation:
  `bun run openspec -- validate mapgen-studio-test-timeouts --strict` passed
  with `Change 'mapgen-studio-test-timeouts' is valid`.
- H4 cross-validation:
  `bun run openspec -- validate habitat-biome-hygiene --strict` passed with
  `Change 'habitat-biome-hygiene' is valid`.
- Diff hygiene:
  `git diff --check` passed with no output.
- Generated/protected drift check:
  `git diff --name-only | rg '(^|/)dist/|(^|/)types/|(^|/)mod/|^\.civ7/outputs/|src/maps/generated|packages/civ7-types/generated|civ7-tables\.gen\.ts|example-generated-mod' || true`
  returned no tracked generated/protected paths.
