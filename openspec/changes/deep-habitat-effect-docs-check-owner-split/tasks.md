# Tasks

## 1. Implementation

- [x] 1.1 Move `docs-local-checkout-paths` registry ownership from
  `source-check` to `command-check`.
- [x] 1.2 Add a docs-local checkout path lint script with path/line output.
- [x] 1.3 Parse docs-local command output back into per-file Habitat
  diagnostics.
- [x] 1.4 Remove the docs rule from the source-check policy module.
- [x] 1.5 Remove Markdown from source-check candidate extensions.
- [x] 1.6 Delete the duplicate Grit check pattern while retaining the apply
  rewrite pattern.

## 2. Verification

- [x] 2.1 `bun run biome check --write` on touched source/test/script files.
- [x] 2.2 `bun run --cwd tools/habitat-harness test -- test/rules/registry/contract.test.ts test/rules/registry/facts.test.ts`
- [x] 2.3 `bun run --cwd tools/habitat-harness validate:grit-patterns`
- [x] 2.4 `bun tools/habitat-harness/bin/dev.ts check --rule docs-local-checkout-paths --json`
- [x] 2.5 `bun tools/habitat-harness/bin/dev.ts check --tool source-check --json`
- [x] 2.6 `bun run openspec -- validate deep-habitat-effect-docs-check-owner-split --strict`
- [x] 2.7 `bun run --cwd tools/habitat-harness check`
- [x] 2.8 `bun run biome:ci`
- [x] 2.9 `git diff --check`

## 3. Follow-Up Dominoes

- [ ] 3.1 Add per-file source-check derived fact indexes for AST/text helper
  reuse.
- [ ] 3.2 Split source-check candidate extensions by rule family instead of one
  global extension set.
- [ ] 3.3 Move remaining source-check policy code toward generated per-rule
  predicate tables.
