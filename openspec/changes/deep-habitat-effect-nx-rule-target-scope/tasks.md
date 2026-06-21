# Tasks

## 1. Baseline

- [x] 1.1 Confirm pattern-check rules alias to the broad `grit:check` target.
- [x] 1.2 Confirm file-layer rules alias to the broad `generated:check` target.
- [x] 1.3 Confirm registry rule metadata already carries path coverage for
  scoped rules.

## 2. Implementation

- [x] 2.1 Remove broad aliases for pattern-check and file-layer rule targets.
- [x] 2.2 Build direct rule target inputs from rule path coverage and owning
  implementation surfaces.
- [x] 2.3 Keep workspace-wide inputs for `workspace-gate` and
  `unresolved-metadata` rules.
- [x] 2.4 Keep baseline exception metadata out of Nx file inputs.
- [x] 2.5 Repair `rng-authority-static` registry metadata so prose is not stored
  in `exceptionPath`.

## 3. Verification

- [x] 3.1 `bun run biome check --write tools/habitat-harness/src/plugin/nx-plugin.ts tools/habitat-harness/src/domains/rule-registry/graph.ts .habitat/rules/rng-authority-static/rule.json`
- [x] 3.2 `nx show project mod-swooper-maps --json`
- [x] 3.3 `nx run mod-swooper-maps:habitat:rule:domain-engine-imports`
- [x] 3.4 `nx run mod-swooper-maps:habitat:rule:rng-authority-static`
- [x] 3.5 `bun run --cwd tools/habitat-harness check`
- [x] 3.6 `bun run openspec -- validate deep-habitat-effect-nx-rule-target-scope --strict`
- [x] 3.7 `bun run openspec:validate`
- [x] 3.8 `bun run biome:ci`
- [x] 3.9 `bun run check`
- [x] 3.10 `git diff --check`
- [x] 3.11 `bun run --cwd tools/habitat-harness test -- test/rules/registry/contract.test.ts test/rules/registry/facts.test.ts test/lib/rule-selection.test.ts`

## 4. Follow-Up Dominoes

- [ ] 4.1 Make root `check` use Nx orchestration without duplicating broad
  Habitat/Grit/Biome work.
- [ ] 4.2 Tighten `workspace-gate` and `unresolved-metadata` rules into
  precise path coverage where the rule semantics allow it.
- [ ] 4.3 Measure and reduce Nx project-graph startup cost for
  `habitat:rule:<id>` target runs.
