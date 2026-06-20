# Phase Record

## Phase

- Project: Habitat Harness deep refactor
- Phase: Hook runtime domain drain
- Owner: Effect-first implementation lane
- Branch/Graphite stack: `agent-DRA-effect-hook-runtime-cutover` stacked on `agent-DRA-effect-transformation-transaction-domain`
- Started: 2026-06-19
- Last updated: 2026-06-20
- Status: implementation complete; Graphite submit pending

## Objective

- Target movement: make hook runtime contracts, staged-worktree policy,
  resource decisions, pre-push base resolution, lifecycle capture, and command
  tracing a named domain under `src/domains/hook-runtime/**`.
- Non-goals: making hooks authoritative proof.
- Done condition: `src/lib/hook-runtime/**` is deleted with no wrapper or
  facade, hook service consumes the domain directly, current stream/exit
  behavior is preserved, and tests pin local-only hook output plus architecture
  boundaries.

## Verification

- `bun run --cwd tools/habitat-harness check` - passed.
- `bun run --cwd tools/habitat-harness test -- test/lib/hooks.test.ts test/service/hook-service.test.ts test/service/service-architecture.test.ts test/commands/habitat-commands.test.ts` - passed.
- `bun run --cwd tools/habitat-harness test -- test/service/hook-service.test.ts test/service/service-architecture.test.ts test/commands/habitat-commands.test.ts test/lib/hooks.test.ts` - passed.
- `bun run --cwd tools/habitat-harness test -- test/service/hook-service.test.ts test/service/service-architecture.test.ts test/commands/habitat-commands.test.ts test/lib/hooks.test.ts test/lib/rule-selection.test.ts` - passed; 63 tests.
- `bun run --cwd tools/habitat-harness test` - passed.
- `bun run biome:ci` - passed.
- `bun run habitat hook pre-commit` - passed; emitted local-only workstation
  feedback notice and no staged Biome/pattern work in the current tree.
- `bun run openspec -- validate deep-habitat-effect-hook-runtime-cutover --strict` - passed.
- `bun run openspec:validate` - passed.
- `git diff --check` - passed.
- Review repair: the hook service contract accepts empty `base` strings so the
  existing hook runtime semantics for empty `--base` are preserved instead of
  failing service input validation.
- Review repair: D0 now refuses both `D0-package-export-symbol-runhook` and
  `D0-package-export-source-hooks-internal`, so deleting `src/lib/hooks.ts`
  does not leave its old helper/type exports under-dispositioned.
- Review repair: hook service tests now cover both pre-push and pre-commit
  through the in-process Habitat service client.
- Evidence boundary: hook runtime is now domain-owned; provider/resource
  substitutions for Git, Biome, Grit, filesystem, clock, and command execution
  remain later drains.
