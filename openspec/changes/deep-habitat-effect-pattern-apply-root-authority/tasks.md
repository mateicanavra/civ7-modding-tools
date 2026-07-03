# Tasks

## 1. Implementation

- [x] 1.1 Add dry-run roots to apply admission metadata.
- [x] 1.2 Derive active apply transaction inputs from all registered rule ids,
      not only source-check facts.
- [x] 1.3 Preserve missing-rule refusal behavior for transaction input
      synthesis.
- [x] 1.4 Assert built-in apply transaction roots for domain imports and docs.

## 2. Verification

- [x] 2.1 `bun run --cwd tools/habitat-harness test -- test/rules/pattern-views.test.ts`
- [x] 2.2 `bun run --cwd tools/habitat-harness test`
- [x] 2.3 `bun run --cwd tools/habitat-harness check`
- [x] 2.4 `bun run openspec -- validate deep-habitat-effect-pattern-apply-root-authority --strict`
- [x] 2.5 `bun run biome:ci`
- [x] 2.6 `git diff --check`
