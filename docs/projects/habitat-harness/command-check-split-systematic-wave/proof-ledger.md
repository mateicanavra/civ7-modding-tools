# Proof Ledger

Status: closed after integration proof.

## Preflight

- Domain lane preflight: four target rules were already green and stayed green after the wave.
- Pipeline lane preflight: `preserve_standard_stage_topology_and_path_invariants` was red on stale `foundation` topology assumptions; `prohibit_ecology_fudge_terms_and_legacy_generator_surfaces` was green before conversion.
- Studio/projection lane preflight: selected command rules were green before shrinking; adjacent generated-currentness checks were known red outside this wave.
- Platform/docs lane preflight: `block_unapproved_base_standard_boundary_leaks` was red on map-policy provenance strings; `validate_mapgen_docs_anchors_and_references` had pre-existing anchor/reference failures.

## Focused Rule Proof

- `bun tools/habitat/bin/dev.ts check --rule enforce_adapter_only_base_standard_imports --json` passed and proves the retained platform runtime-import boundary.
- `bun tools/habitat/bin/dev.ts check --rule prohibit_ecology_fudge_terms_and_legacy_generator_surfaces --tool grit-check --json` passed after conversion.
- `bun tools/habitat/bin/dev.ts check --rule preserve_standard_stage_topology_and_path_invariants --json` passed after updating the stage topology to the decomposed foundation stage IDs.
- `bun tools/habitat/bin/dev.ts check --rule prohibit_misplaced_projection_adapter_calls --tool grit-check --json` passed after extracting misplaced projection adapter calls to Grit.
- `bun tools/habitat/bin/dev.ts check --rule require_projection_calls_in_projection_steps --json` passed after shrinking it to required callsite/materialization assertions.
- `bun tools/habitat/bin/dev.ts check --rule prohibit_recipe_dag_runtime_source_dependencies --tool grit-check --json` passed after extracting direct runtime/generated dependency bans to Grit.
- `bun tools/habitat/bin/dev.ts check --rule require_recipe_dag_contract_metadata --json` passed after shrinking it to contract-surface and import-graph validation.
- `bun tools/habitat/bin/dev.ts check --rule validate_mapgen_docs_anchors_and_references --json` still fails with pre-existing docs anchor/reference failures; no code path in this wave attempted to hide or downgrade that.

## Companion Rule Proof

- `enforce_adapter_only_base_standard_imports` is the accepted replacement owner for `block_unapproved_base_standard_boundary_leaks` runtime import authority.
- `prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases` remains the owner for legacy stage alias bans removed from `preserve_standard_stage_topology_and_path_invariants`.
- `prohibit_misplaced_projection_adapter_calls` is the accepted source-shape companion split from `require_projection_calls_in_projection_steps`.
- `prohibit_recipe_dag_runtime_source_dependencies` is the accepted source-shape companion split from `require_recipe_dag_contract_metadata`.

## Aggregate Proof

Final aggregate proof from the integration run:

- `bun tools/habitat/bin/dev.ts check --tool grit-check --json` passed; `ensure_docs_checkout_paths_are_portable` still reports advisory findings.
- `bun tools/habitat/bin/dev.ts check --tool command-check --json` failed only on accepted aggregate failures listed below.
- `bun run --cwd tools/habitat check` passed.

## Tooling Proof

- Execution-surface analytics regenerated after the split.
- `execution-surface-map.json` parses as JSON.
- `assertion-corpus.jsonl` and all lane JSONL files parse line-by-line.
- `git diff --check` passes.

## Accepted Aggregate Failures

The command-check aggregate may still report known red checks that are outside this wave:

- `validate_mapgen_docs_anchors_and_references`: stale/missing docs anchors and workspace alias warnings.
- `verify_studio_recipe_artifacts_are_current`: generated Studio recipe artifacts are not current.
- `validate_boundary_taxonomy_against_workspace_graph`: workspace graph/taxonomy consistency remains a non-Grit validator issue.

These failures are not caused by the split wave and should remain visible until their owning workstreams fix them.
