# Tasks

## 1. Public Surface

- [x] 1.1 Inventory current `src/index.ts` exports and consumers.
- [x] 1.2 Remove internal provider/runtime/test exports from the public facade.
- [x] 1.3 Reconcile `tools/habitat-harness/package.json` `exports` and `files`.
- [x] 1.4 Update tests to import internals through allowed test-only paths or feature public surfaces.

## 2. Guards

- [x] 2.1 Add guard for forbidden `Effect.run*` locations.
- [x] 2.2 Add guard for direct process/fs/time/env imports outside providers.
- [x] 2.3 Add guard for new `src/lib` feature logic.
- [x] 2.4 Add guard for provider leaks through public exports.
- [x] 2.5 Add guard for authored-artifact boundary drift.

## 3. Realignment

- [x] 3.1 Update Habitat project docs to point at the Effect-first architecture.
- [x] 3.2 Update packet index and downstream records for completed migrations.
- [x] 3.3 Record remaining deferrals only with triggers.

## 4. Validation

- [x] 4.1 Run `bun run habitat check --tool habitat --json`.
- [x] 4.2 Run `bun run --cwd tools/habitat-harness check`.
- [x] 4.3 Run `bun run --cwd tools/habitat-harness test`.
- [x] 4.4 Run `bun run openspec -- validate deep-habitat-effect-public-surface-guards --strict`.
- [x] 4.5 Run `bun run openspec:validate`.
- [x] 4.6 Run `git diff --check`.
