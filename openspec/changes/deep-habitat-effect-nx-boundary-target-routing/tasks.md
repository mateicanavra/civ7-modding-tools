# Tasks

## 1. Implementation

- [x] 1.1 Convert the `import-boundaries` rule row to graph-backed
      `target-check`.
- [x] 1.2 Route the rule to `@internal/habitat-harness:boundaries`.
- [x] 1.3 Remove the direct `import-boundaries` workspace tool policy.
- [x] 1.4 Remove `import-boundaries` from standalone command-owner registry
      types and tests.

## 2. Verification

- [x] 2.1 `bun run --cwd tools/habitat-harness test -- test/lib/workspace-tools.test.ts test/lib/rule-selection.test.ts test/rules/registry/facts.test.ts test/rules/registry/contract.test.ts`
- [x] 2.2 `bun run --cwd tools/habitat-harness check`
- [x] 2.3 `nx run @internal/habitat-harness:boundaries`
- [x] 2.4 `bun tools/habitat-harness/bin/dev.ts check --rule import-boundaries --json`
- [x] 2.5 `bun run openspec -- validate deep-habitat-effect-nx-boundary-target-routing --strict`
- [x] 2.6 `bun run openspec:validate`
- [x] 2.7 `bun run biome:ci`
- [x] 2.8 `git diff --check`
