# Phase Record

## Phase

- Project: Habitat Harness deep refactor
- Phase: Check and baseline cutover
- Owner: Effect-first implementation lane
- Branch/Graphite stack: `agent-DRA-effect-check-baseline-cutover` stacked on `agent-DRA-effect-grit-apply-cutover`
- Started: 2026-06-19
- Status: implementation in progress

## Objective

- Target movement: migrate check and baseline decisions onto Effect services.
- Non-goals: CheckReport v1 changes.
- Done condition: check and baseline matrices pass with fake providers and
  command smoke.

## Verification

- Commands run:
  - `bun run --cwd tools/habitat-harness test -- test/service/check-service.test.ts`
  - `bun run --cwd tools/habitat-harness test -- test/lib/baseline.test.ts test/lib/check-summaries.test.ts`
  - `bun run --cwd tools/habitat-harness test -- test/service/service-architecture.test.ts`
  - `bun run --cwd tools/habitat-harness test -- test/service/check-service.test.ts test/service/service-architecture.test.ts test/lib/baseline.test.ts test/lib/check-summaries.test.ts`
  - `bun run --cwd tools/habitat-harness check`
  - `./node_modules/.bin/biome check --write .`
  - `./node_modules/.bin/biome check --write tools/habitat-harness/src/domains/baseline-authority tools/habitat-harness/src/domains/structural-check tools/habitat-harness/src/service/impl.ts tools/habitat-harness/test/service/check-service.test.ts tools/habitat-harness/test/service/service-architecture.test.ts`
  - `bun run openspec -- validate deep-habitat-effect-check-baseline-cutover --strict`
  - `bun run biome:ci`
  - `bun run openspec:validate`
  - `git diff --check`
  - `bun run habitat check --tool file-layer --json`
  - `bun run habitat check --tool command-check --json`
  - `bun run habitat check --tool format-check --json`
  - `bun run habitat check --tool import-boundaries --json`
  - `bun run habitat check --rule arch-test-core-purity --json`
  - `bun run habitat check --tool target-check --json`
  - `bun run habitat check --json`
- Evidence boundary:
  - Baseline and structural-check source ownership moved from `src/lib/**` to
    `src/domains/**`.
  - `check` service procedures now consume the `StructuralCheck` Effect service
    provided by the Habitat service layer instead of importing the
    `lib/check-report` adapter.
  - `StructuralCheck` now consumes a named `BaselineAuthority` Effect domain
    service for the active check/baseline service path.
  - Existing baseline and summary behavior is covered by the focused tests.
  - CLI service-path smokes passed for `file-layer`, `command-check`,
    `format-check`, `import-boundaries`, and `target-check`.
  - Command-rule execution was made sequential in the active structural-check
    path so Nx-backed target checks do not contend with each other during
    aggregate check runs.
  - The full `bun run habitat check --json` command now completes. It exits 1
    because Grit-backed `pattern-check` reports `GritCommandFailed` / exit 130
    after the Grit command window; that is the remaining aggregate blocker.
  - Remaining implementation work: replace baseline context side-effect options
    and direct Git/fs/time calls with Effect providers/resources; repair the
    Grit-backed pattern-check aggregate failure.
