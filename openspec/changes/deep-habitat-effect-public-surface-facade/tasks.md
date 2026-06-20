# Tasks

## 1. Export Census

- [x] 1.1 Inventory every `src/index.ts` export and repo callsite.
- [x] 1.2 Classify each export using the design table.
- [x] 1.3 Record package `exports` and `files` implications.

## 2. Facade Creation

- [x] 2.1 Add `src/public/**` facade files listed in `design.md`.
- [x] 2.2 Move public schema/type exports to `src/public/**`.
- [x] 2.3 Replace internal source imports through the root barrel.
- [x] 2.4 Add public adapters only with named owner and closure action.

## 3. Verification

- [x] 3.1 Run `bun run --cwd tools/habitat-harness check`.
- [x] 3.2 Run `bun run --cwd tools/habitat-harness test`.
- [x] 3.3 Run `bun run openspec -- validate deep-habitat-effect-public-surface-facade --strict`.
- [x] 3.4 Run `bun run openspec:validate`.
- [x] 3.5 Run `git diff --check`.
