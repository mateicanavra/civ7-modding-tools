# Phase Record

## Phase

- Project: Habitat Harness deep refactor
- Phase: Hook service ownership
- Owner: Effect-first implementation lane
- Branch/Graphite stack: `agent-DRA-effect-hook-service-ownership` stacked on `agent-DRA-effect-fix-service-module`
- Started: 2026-06-19
- Last updated: 2026-06-20
- Status: implementation complete; review repairs and Graphite submit pending

## Objective

- Target movement: make `habitat hook` an owned Effect-oRPC service module so
  Husky and the CLI call Habitat’s service surface and hook orchestration lives
  in the service module instead of direct lib orchestration.
- Non-goals: making hooks authoritative proof.
- Done condition: hook CLI routes through the service client, hook service
  owns command-level orchestration, the obsolete `lib/hooks` wrapper is
  removed, current stream/exit behavior is preserved, and tests pin local-only
  hook output plus architecture boundaries.

## Verification

- `bun run --cwd tools/habitat-harness check` - passed.
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
- Evidence boundary: service-module slice; hook provider/resource drainage
  remains the next hook runtime implementation unit.
