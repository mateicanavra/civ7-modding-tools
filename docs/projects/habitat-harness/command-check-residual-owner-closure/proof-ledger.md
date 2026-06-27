# Proof Ledger

Status: closed

| Minispec | Proof | Result | Notes |
| --- | --- | --- | --- |
| 1 | `bun tools/habitat/bin/dev.ts check --rule validate_ecology_op_contract_quality --json` | pass | New package-local ecology validator is green after adding missing JSDoc. |
| 2 | `bun tools/habitat/bin/dev.ts check --rule require_ecology_canonical_op_module_topology --tool structure-check --json` | pass | Structure-check now excludes support-only `score-shared` and no longer requires optional rule/type children for strategy-only op families. |
| 3 | `bun tools/habitat/bin/dev.ts check --rule validate_mapgen_docs_anchors_and_references --json` | pass | Validator moved to docs tooling and stale anchors were updated. |
| 4 | `nx run mod-swooper-maps:build:studio-recipes` | pass | Studio recipe artifacts are package/Nx build outputs, not Habitat authority. Nx reported the existing `control-direct:build-bundle` flaky-task warning but exited successfully. |
| 4 | `nx run mapgen-studio:check` | pass | Sequential run passed. The earlier parallel proof attempt hit a generated-output race in `control-direct:build-bundle`; this branch does not introduce a Studio check failure. |
| 5 | `bun tools/habitat/bin/dev.ts check --rule validate_boundary_taxonomy_against_workspace_graph --json` | pass | Executable moved to `tools/habitat/scripts`; `.habitat` no longer imports toolkit internals directly. |
| 6 | Remaining `command-check` category audit | complete | All current command-check packet `category.md` files now include `Residual owner class:` notes. |
| 7 | `bun run ci:architecture-strict-core` | pass | Root CI strict-core script now runs explicit `grit-check`, `structure-check`, and `command-check` owner checks instead of the deleted aggregate profile wrapper. |
| 7 | Execution-surface analytics regeneration | pass | Regenerated after the root script update; JSON parses and reports 124 rule records. |
| 7 | `bun run --cwd tools/habitat check` | pass | Toolkit typecheck passed after registry count and validator/tooling updates. |
| 7 | `bun run --cwd tools/habitat test` | pass | 34 files, 316 tests passed after updating the current registry count assertions to 124 total / 30 command-check records. |
| 7 | `nx run habitat:build` | pass | Habitat package build and oclif manifest generation passed. |
| 7 | `git diff --check` | pass | No whitespace errors. |
