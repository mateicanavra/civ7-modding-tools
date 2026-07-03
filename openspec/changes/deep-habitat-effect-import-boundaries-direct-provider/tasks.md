# Tasks

## 1. Baseline

- [x] 1.1 Confirm `import-boundaries` declares direct command metadata in its
  rule record.
- [x] 1.2 Confirm `ruleGraphAlias` overrides `import-boundaries` into an Nx
  `boundaries` dependency.
- [x] 1.3 Confirm the standalone `boundaries` target carries ESLint cache flags.

## 2. Implementation

- [x] 2.1 Remove the `import-boundaries` graph alias override.
- [x] 2.2 Remove the workspace graph dependency special-case for
  `import-boundaries`.
- [x] 2.3 Move ESLint boundary cache flags into the `import-boundaries`
  workspace-tool policy.
- [x] 2.4 Update the workspace-tool materialization expectation.

## 3. Verification

- [x] 3.1 `bun run biome check --write tools/habitat-harness/src/config/habitat-config.ts tools/habitat-harness/src/domains/rule-registry/graph.ts tools/habitat-harness/src/domains/workspace-graph-integration/states.ts tools/habitat-harness/test/lib/workspace-tools.test.ts`
- [x] 3.2 `bun run --cwd tools/habitat-harness test -- test/lib/workspace-tools.test.ts test/rules/registry/facts.test.ts test/lib/workspace-graph.test.ts`
- [x] 3.3 `/usr/bin/time -p bun tools/habitat-harness/bin/dev.ts check --rule import-boundaries`
- [x] 3.4 `bun run --cwd tools/habitat-harness check`
- [x] 3.5 `bun run openspec -- validate deep-habitat-effect-import-boundaries-direct-provider --strict`
- [x] 3.6 `bun run check`
- [x] 3.7 `git diff --check`
- [x] 3.8 `bun run openspec:validate`

## 4. Follow-Up Dominoes

- [ ] 4.1 Rename the active `pattern-check`/`grit:check` surfaces to the actual
  source-check owner or route runtime diagnostics back through native Grit.
- [ ] 4.2 Build a shared SourceIndex so source-check rules filter indexed facts
  instead of retraversing AST helpers per rule.
- [ ] 4.3 Delete stale raw vendor helpers that bypass providers.
