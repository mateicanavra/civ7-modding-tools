# CLI Root-Load Test Timeouts Phase Record

## State

- Branch/Graphite stack: `agent-F-cli-root-load-test-timeouts` above
  `agent-F-mapgen-studio-test-timeouts`.
- Change id: `cli-root-load-test-timeouts`.
- Objective: remove the next H4 root-test proof blocker by giving the
  integration-heavy oclif CLI Vitest project an explicit project-scoped
  timeout budget.
- Status: implemented and locally verified; ready to commit.

## Authority And Inputs

- Root `AGENTS.md`: update adjacent docs/tests when behavior or public
  contracts change; keep generated artifacts read-only.
- `packages/cli/AGENTS.md`: CLI uses oclif, direct-control for game commands,
  and `bun run test:cli`/Nx-backed test paths for package validation.
- H4 phase record: root build/parity is green, but H4 task 2.4 needs a full
  root test proof.
- `vitest.config.ts`: root Vitest project matrix previously gave `cli` only
  `test.name` plus `NODE_ENV`, inheriting the default 5s timeout.

## Opening Evidence

- Full root test after the mapgen timeout repair:
  `NX_DAEMON=false bunx nx run-many -t test --outputStyle=static` advanced
  past `mapgen-studio:test` (47 files / 233 tests passed in 381.19s) and then
  failed in the `cli` project. The wrapper was interrupted only after CLI was
  already red and another child target had continued running silently.
- Direct CLI proof:
  `bunx vitest run --config vitest.config.ts --project cli` passed with exit 0
  (53 files / 234 tests, 278.03s).
- Focused Nx CLI reproduction:
  `bunx nx run @mateicanavra/civ7-cli:test --outputStyle=static` failed with
  exit 1. The first failures were 5s timeouts in integration-heavy game command
  files; later assertion mismatches appeared in the same files after earlier
  timeouts left command/server work in flight.

## Implementation

- `vitest.config.ts` now gives only the `cli` project an explicit
  `testTimeout: 30_000`; unrelated projects keep their existing timeout
  behavior.
- No CLI command code, oclif metadata, direct-control behavior, assertions, or
  suites are changed.

## Verification

- Focused Nx CLI proof after the timeout budget:
  `bunx nx run @mateicanavra/civ7-cli:test --outputStyle=static` passed with
  exit 0. Nx ran the CLI test target and 8 dependency tasks; CLI passed 53
  files / 234 tests in 309.74s.
- Representative cache-backed root-load probe after the timeout budget:
  `NX_DAEMON=false bunx nx run-many -t test
  --projects=@mateicanavra/civ7-cli,mapgen-studio,@civ7/studio-server,@internal/habitat-harness,@civ7/docs,@civ7/playground,mod-civ7-intelligence-bridge
  --parallel=6 --outputStyle=static` passed with exit 0, but most task output
  was cache-backed, so it is secondary evidence only.
- Representative uncached load probe:
  `NX_DAEMON=false bunx nx run-many -t test
  --projects=@mateicanavra/civ7-cli,mapgen-studio,@internal/habitat-harness,mod-civ7-intelligence-bridge
  --parallel=4 --skip-nx-cache --outputStyle=static` failed with exit 1 in
  `mapgen-studio:test`, not CLI. In that same uncached run, CLI passed 53
  files / 234 tests in 445.71s. The remaining mapgen failures were
  `standardLayerVisibility` timing out at 240s and
  `Civ7TunerSession` failing its first shared-session test.
- Full root proof after the timeout budget:
  `NX_DAEMON=false bunx nx run-many -t test --outputStyle=static` again failed
  in `mapgen-studio:test` with the same two-mapgen-test class. The wrapper was
  interrupted only after the root proof was already red.
- Evidence boundary: this slice clears the CLI root-load timeout class. H4
  task 2.4 remains open because a separate mapgen root-load class is now the
  root-test blocker.
- OpenSpec validation:
  `bun run openspec -- validate cli-root-load-test-timeouts --strict` passed
  with `Change 'cli-root-load-test-timeouts' is valid`.
- H4 cross-validation:
  `bun run openspec -- validate habitat-biome-hygiene --strict` passed with
  `Change 'habitat-biome-hygiene' is valid`.
- Diff hygiene:
  `git diff --check` passed with no output.
- Generated/protected drift check:
  `git diff --name-only | rg '(^|/)dist/|(^|/)types/|(^|/)mod/|^\.civ7/outputs/|src/maps/generated|packages/civ7-types/generated|civ7-tables\.gen\.ts|example-generated-mod' || true`
  returned no tracked generated/protected paths.
