# Phase Record: Habitat Structure Check Runner

## Objective

Build one native Habitat runner for file-tree topology and prove it with the
standard-stage canary.

## Source Order

1. Current user direction.
2. Root `AGENTS.md`.
3. `.habitat/AUTHORITY-TOOL-SEPARATION.md`.
4. `docs/projects/habitat-harness/structure-check/structure-check-runner-spec-shape.md`.
5. Command-check split canary/systematic-wave records.
6. Current Habitat registry, runner, and service code.

## Owners

- `structure-check`: current-tree filesystem topology.
- Grit: source syntax, imports, exports, source tokens.
- Nx: graph/task ordering.
- package validators/tests: runtime behavior, generated equivalence, package
  semantics.
- command-check: residual bespoke assertions not yet assigned to a narrower
  owner.

## Non-Goals

- No new CLI subcommand.
- No topology logic hidden behind command execution.
- No source regex, graph traversal, freshness, or package execution in
  `structure-check`.
- No full conversion wave.

## Write Set

- `tools/habitat/src/**`
- `tools/habitat/test/**`
- `tools/habitat/package.json`
- `bun.lock`
- `.habitat/**/preserve_standard_stage_topology_and_path_invariants/**`
- `.habitat/**/verify_standard_recipe_declared_stage_keys/**`
- `.habitat/SUBJECT-CATEGORIES.md`
- `openspec/changes/habitat-structure-check-runner/**`
- structure-check prep docs if implementation differs from the prep shape.

## Proof Classes

- Registry/schema proof: `tools/habitat` registry tests.
- Evaluator proof: fake read-port TOML/evaluator tests.
- Execution proof: native execution test plus CLI structure-check canary.
- Build proof: `tools/habitat` typecheck and `nx run habitat:build`.
- Change-management proof: OpenSpec validation.
