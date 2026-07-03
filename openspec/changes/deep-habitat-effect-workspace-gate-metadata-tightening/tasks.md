# Tasks

## 1. Implementation

- [x] 1.1 Remove false `workspace-gate` coverage from generated-zone file-layer rules with exact protected paths.
- [x] 1.2 Remove false `project-owner` coverage from generated-zone file-layer rules whose path relevance is exact-path based.
- [x] 1.3 Tighten `mapgen-docs` coverage to its checked docs tree.
- [x] 1.4 Leave genuinely repo-wide workspace gates unchanged.
- [x] 1.5 Realign the owner-check input-scope follow-up record.
- [x] 1.6 Add the inferred `.habitat` artifact project to the boundary taxonomy.

## 2. Verification

- [x] 2.1 `bun run --cwd tools/habitat-harness test -- test/rules/registry/contract.test.ts test/lib/classify.test.ts test/lib/boundary-taxonomy.test.ts`
- [x] 2.2 `nx show project @internal/habitat-harness --json`
- [x] 2.3 `bun tools/habitat-harness/bin/dev.ts check --owner @internal/habitat-harness --json`
- [x] 2.4 `bun run openspec -- validate deep-habitat-effect-workspace-gate-metadata-tightening --strict`
- [x] 2.5 `bun run openspec -- validate deep-habitat-effect-owner-check-input-scope --strict`
- [x] 2.6 `bun run biome:ci`
- [x] 2.7 `git diff --check`
- [x] 2.8 `bun run --cwd tools/habitat-harness validate:boundary-taxonomy`
