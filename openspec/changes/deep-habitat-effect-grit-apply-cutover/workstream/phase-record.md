# Phase Record

## Phase

- Project: Habitat Harness deep refactor
- Phase: Grit apply cutover
- Owner: Effect-first implementation lane
- Branch/Graphite stack: `agent-DRA-effect-grit-apply-cutover` stacked on `agent-DRA-effect-transaction-service-module`
- Started: 2026-06-19
- Last updated: 2026-06-20
- Status: provider cutover plus command-substrate cleanup in validation;
  current-tree pattern-check execution remains open

## Objective

- Target movement: migrate Grit check/apply execution onto provider resources.
- Non-goals: new Grit semantics or uncontrolled live writes.
- Done condition: Grit parser, scan-root, projection, and apply dry-run
  matrices pass without Grit adapter/apply callsites depending on
  `HabitatProcess`.

## Verification

- Commands run:
  - `bun run --cwd tools/habitat-harness check` - passed.
  - `bun run --cwd tools/habitat-harness test -- test/lib/grit-adapter.test.ts test/lib/pattern-apply.test.ts test/service/transactions-service.test.ts` - passed after extracting Effect-returning Grit diagnostic programs.
  - `bun run --cwd tools/habitat-harness test -- test/service/check-service.test.ts test/service/service-architecture.test.ts test/lib/rule-selection.test.ts test/lib/verify-service.test.ts` - passed after moving check report, baseline expansion, and rule execution into the Effect-oRPC check service module.
  - `bun run --cwd tools/habitat-harness test -- test/lib/grit-adapter.test.ts test/lib/pattern-apply.test.ts test/service/fix-service.test.ts test/service/transactions-service.test.ts test/lib/vendor-providers.test.ts` - passed.
  - `bun run --cwd tools/habitat-harness test -- test/lib/grit-adapter.test.ts test/lib/pattern-apply.test.ts test/service/transactions-service.test.ts` - passed after the check-service ownership slice.
  - `bun run --cwd tools/habitat-harness validate:grit-patterns` - passed.
  - `bun run habitat check --rule domain-deep-import-tests --json` - passed
    after moving the ignored-test import policy to native `command-check`.
  - `bun run openspec -- validate deep-habitat-effect-grit-apply-cutover --strict` - passed.
  - `bun run openspec:validate` - passed.
  - `bun run biome:ci` - passed.
  - `git diff --check` - passed.
- Not closed:
  - `bun run habitat check --tool pattern-check --json` still fails. The
    DDIT ignored-test expansion is no longer on this path; the remaining
    enforced failures are shared `GritCommandFailed` / exit 130 outcomes from
    the standard source Grit invocation, and docs-local reports an advisory
    provider/tool failure while keeping `ok:true`. This is a larger Grit
    current-tree execution-shape problem for the next service/check domino, not
    a DDIT expansion failure.

## Implementation Notes

- `GritProvider` now owns check and apply dry-run command construction inside
  the enclosed Grit adapter module.
- Grit check output parsing and Grit wire/acquisition types moved under
  `src/adapters/grit/provider/**`.
- Docs apply-backed diagnostics and transaction apply dry-runs consume
  `GritProvider` instead of `HabitatProcessLive`.
- Grit cache setup now uses `ensurePatternCacheRoot()` and
  `acquireTempDirectory()` instead of direct filesystem calls in Grit adapter
  code.
- Loose Grit-owned files no longer live at `src/lib/grit.ts`,
  `src/lib/grit-env.ts`, or `src/lib/grit-failures.ts`. Grit failures,
  machine-output environment, and command constants now live under
  `src/adapters/grit/provider/**`.
- The loose `src/providers/grit/**` tree is deleted. Grit provider resources,
  failure ADTs, constants, environment, and wire types are enclosed by the Grit
  adapter.
- The old `src/lib/habitat-process.ts` process facade and
  `src/lib/spawn.ts` sync command wrapper are deleted. Command request/result
  contracts, fake layers, and spawn-shaped projections are exported from
  `src/providers/command/**`.
- Grit diagnostic execution now has an Effect-returning program surface:
  `runGritRulesEffect`, `runGritDiagnosticOutcomesEffect`, and the docs
  apply-backed diagnostic program. Grit remains a provider capability under the
  service layer, not an oRPC module.
- Check report construction, baseline expansion, and rule execution moved to
  `src/service/modules/check/**`. The check service now yields Grit and command
  provider Effects directly under the Effect-oRPC service runtime; check
  execution no longer opens a nested runtime or delegates to the old rule
  executor.
- The old public check barrels no longer export active behavior entrypoints
  such as `createCheckReport`, `expandBaselines`, or `executeSelectedRules`.
  Report rendering, schemas, and pure staged scan-root selection remain
  non-executing helper surfaces.
- `domain-deep-import-tests` is no longer a Grit pattern. It is now a native
  TypeScript-AST `command-check` because the rule is an import-source policy
  over ignored test files, and forcing it through Grit produced pathological
  runtime without adding vendor value.
- The deleted DDIT Grit path allowed removal of the unused
  `expandIgnoredTestDirectories` registry field, scan-root expansion decision,
  adapter batching code, and diagnostic schema branch.
- Full `habitat check --tool pattern-check --json` was rerun after the user's
  restack. It still fails after about 127s with source-rule
  `GritCommandFailed` / exit 130 diagnostics, so current-tree Grit execution
  remains the next repair target rather than a discoveries-schema issue.
