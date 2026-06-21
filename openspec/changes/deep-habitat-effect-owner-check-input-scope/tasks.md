# Tasks

## 1. Baseline

- [x] 1.1 Confirm owner `habitat:check` targets use broad `habitatInputs()`.
- [x] 1.2 Confirm fan-out owner checks are slower because they spawn one Habitat
  CLI process per rule.
- [x] 1.3 Identify which owners still contain `workspace-gate` or
  `unresolved-metadata` rules.

## 2. Implementation

- [x] 2.1 Group rule registry records by owner while inferring Nx projects.
- [x] 2.2 Derive owner target inputs from owned rule target inputs.
- [x] 2.3 Fall back to broad Habitat inputs when any owned rule is broad.
- [x] 2.4 Keep owner and all-owner checks as single-process Habitat commands.
- [x] 2.5 Keep `tools/habitat-harness/src/**` as a Habitat-owned target input
  instead of a universal input on every downstream owner rule target.

## 3. Verification

- [x] 3.1 `bun run biome check --write tools/habitat-harness/src/plugin/nx-plugin.ts tools/habitat-harness/src/plugin/target-definitions.ts`
- [x] 3.2 `nx show project mod-swooper-maps --json`
- [x] 3.3 `nx show project @internal/habitat-harness --json`
- [x] 3.4 `nx show project @swooper/mapgen-core --json`
- [x] 3.5 `nx run mod-swooper-maps:habitat:check --outputStyle=static`
- [x] 3.6 `nx run @internal/habitat-harness:habitat:check:all --outputStyle=static`
- [x] 3.7 `bun run --cwd tools/habitat-harness check`
- [x] 3.8 `bun run openspec -- validate deep-habitat-effect-owner-check-input-scope --strict`
- [x] 3.9 `bun run openspec:validate`
- [x] 3.10 `bun run biome:ci`
- [x] 3.11 `bun run check`
- [x] 3.12 `git diff --check`
- [x] 3.13 `nx show projects --affected --uncommitted`
- [x] 3.14 `nx affected --targets=check,boundaries,generated:check,source:check,validate:boundary-taxonomy,validate:grit-patterns --excludeTaskDependencies --uncommitted --graph=stdout`
- [x] 3.15 `nx affected --targets=check,boundaries,generated:check,source:check,validate:boundary-taxonomy,validate:grit-patterns --excludeTaskDependencies --uncommitted --outputStyle=static`

## 4. Follow-Up Dominoes

- [ ] 4.1 Tighten `workspace-gate` and `unresolved-metadata` rule metadata where
  rule semantics are actually scoped.
- [ ] 4.2 Remove duplicate pre-push target composition so component checks are
  not run beside overlapping Habitat aggregate checks.
- [x] 4.3 Investigate Nx invocation/project-graph overhead before routing root
  `check` through Nx.
