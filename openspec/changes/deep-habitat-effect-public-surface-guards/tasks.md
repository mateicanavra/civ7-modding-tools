# Tasks

## 1. Public Surface

- [ ] 1.1 Inventory current `src/index.ts` exports and consumers.
- [ ] 1.2 Remove internal provider/runtime/test exports from the public facade.
- [ ] 1.3 Reconcile `tools/habitat-harness/package.json` `exports` and `files`.
- [ ] 1.4 Update tests to import internals through allowed test-only paths or feature public surfaces.

## 2. Guards

- [ ] 2.1 Add guard for forbidden `Effect.run*` locations.
- [ ] 2.2 Add guard for direct process/fs/time/env imports outside providers.
- [ ] 2.3 Add guard for new `src/lib` feature logic.
- [ ] 2.4 Add guard for provider leaks through public exports.
- [ ] 2.5 Add guard for authored-artifact boundary drift.

## 3. Realignment

- [ ] 3.1 Update Habitat project docs to point at the Effect-first architecture.
- [ ] 3.2 Update packet index and downstream records for completed migrations.
- [ ] 3.3 Record remaining deferrals only with triggers.

## 4. Validation

- [ ] 4.1 Run `bun run habitat check --tool habitat --json`.
- [ ] 4.2 Run `bun run --cwd tools/habitat-harness check`.
- [ ] 4.3 Run `bun run --cwd tools/habitat-harness test`.
- [ ] 4.4 Run `bun run openspec -- validate deep-habitat-effect-public-surface-guards --strict`.
- [ ] 4.5 Run `bun run openspec:validate`.
- [ ] 4.6 Run `git diff --check`.
