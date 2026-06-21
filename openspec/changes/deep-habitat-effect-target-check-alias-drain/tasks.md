# Tasks

## 1. Implementation

- [x] 1.1 Rename active `target-check` rule metadata to `nx`.
- [x] 1.2 Replace the rule-registry target-check variant with an Nx
      graph-target variant.
- [x] 1.3 Remove the `target-check` workspace-tool alias.
- [x] 1.4 Update rule graph facts, Nx plugin graph facts, and tests.
- [x] 1.5 Mark the prior Nx provider identity follow-up items complete.

## 2. Verification

- [x] 2.1 `bun run --cwd tools/habitat-harness test -- test/lib/workspace-tools.test.ts test/lib/rule-selection.test.ts test/rules/registry/facts.test.ts test/rules/registry/contract.test.ts`
- [x] 2.2 `bun run --cwd tools/habitat-harness check`
- [x] 2.3 `bun run openspec -- validate deep-habitat-effect-target-check-alias-drain --strict`
- [x] 2.4 `bun run openspec -- validate deep-habitat-effect-nx-provider-identity --strict`
- [x] 2.5 `bun run openspec:validate`
- [x] 2.6 `bun run biome:ci`
- [x] 2.7 `git diff --check`
- [x] 2.8 `! rg -n '"ownerTool": "target-check"|ownerTool === "target-check"|\\["target-check"' .habitat tools/habitat-harness/src tools/habitat-harness/test`
- [x] 2.9 `bun tools/habitat-harness/bin/dev.ts check --rule import-boundaries --json`
