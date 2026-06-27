# Proof Ledger

Status: focused proof passed for implemented splits; aggregate proof completed
with accepted current command-check reds.

## Focused Structure / Grit Proof

- `bun tools/habitat/bin/dev.ts check --rule prohibit_retired_studio_devlive_daemon_file --tool structure-check --json` passed.
- `bun tools/habitat/bin/dev.ts check --rule require_docs_site_root_inputs --tool structure-check --json` passed.
- `bun tools/habitat/bin/dev.ts check --rule validate_habitat_service_module_root_topology --tool structure-check --json` passed.
- `bun tools/habitat/bin/dev.ts check --rule prohibit_studio_rpc_eventhub_lifecycle_leaks --tool grit-check --json` passed.

## Residual Command Proof

- `bun tools/habitat/bin/dev.ts check --rule enforce_studio_dev_runner_topology --json` passed after shrinking.
- `bun tools/habitat/bin/dev.ts check --rule enforce_studio_rpc_eventhub_topology --json` passed after shrinking.
- `bun tools/habitat/bin/dev.ts check --rule validate_docs_site_config_inputs --json` passed after shrinking.
- `bun tools/habitat/bin/dev.ts check --rule validate_habitat_service_module_file_shape --json` passed after shrinking.

## Aggregate Proof

- `bun tools/habitat/bin/dev.ts check --tool structure-check --json` passed.
  The native runner now selects 4 rules:
  `preserve_standard_stage_topology_and_path_invariants`,
  `prohibit_retired_studio_devlive_daemon_file`,
  `require_docs_site_root_inputs`, and
  `validate_habitat_service_module_root_topology`.
- `bun tools/habitat/bin/dev.ts check --tool grit-check --json` passed overall.
  The existing `ensure_docs_checkout_paths_are_portable` advisory findings
  remain advisory.
- `bun tools/habitat/bin/dev.ts check --tool command-check --json` returned the
  current command-check reds below. These are accepted residuals for this wave,
  not hidden regressions from the structure split:
  - `verify_studio_recipe_artifacts_are_current`: stale generated Studio recipe
    artifacts / package-local freshness.
  - `validate_mapgen_docs_anchors_and_references`: existing docs anchor and
    reference debt.
  - `validate_boundary_taxonomy_against_workspace_graph`: existing
    graph/resource module-resolution failure in the command script.
- Execution-surface analytics regenerated and
  `docs/projects/habitat-harness/execution-surface-map/execution-surface-map.json`
  parsed successfully.
- All wave JSONL ledgers parsed successfully.
- `bun run --cwd tools/habitat check` passed.
- `nx run habitat:build` passed.
- `bun run --cwd tools/habitat test` passed.
