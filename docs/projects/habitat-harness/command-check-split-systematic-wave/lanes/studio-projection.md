# Studio Projection Lane

Status: implemented partial split for clear source-pattern branches.

Scope:
- `enforce_studio_dev_runner_topology`
- `require_projection_calls_in_projection_steps`
- `require_recipe_dag_contract_metadata`

## Summary

This lane split only assertions with clear Habitat source-pattern ownership.
The remaining graph, Nx target, config-execution, exact required-presence, and
Vite watch assertions stay in command checks because their proof is topology,
graph, or data-currentness rather than source-pattern matching.

Implemented Grit packets:

- `prohibit_misplaced_projection_adapter_calls` owns misplaced projection
  adapter calls, forbidden physics-stage engine projection reads, and odd-r
  tile callsites formerly embedded in
  `require_projection_calls_in_projection_steps`.
- `prohibit_recipe_dag_runtime_source_dependencies` owns direct recipe-DAG
  service runtime recipe imports and studio-contract runtime/helper source
  tokens formerly embedded in `require_recipe_dag_contract_metadata`.

Shrunk command packets:

- `require_projection_calls_in_projection_steps` now keeps required owner
  callsite presence and plotRivers materialization/contract tokens.
- `require_recipe_dag_contract_metadata` now keeps required direct contract
  surfaces plus the transitive local import-graph validator.

Unchanged packet:

- `enforce_studio_dev_runner_topology` remains command-check. Its assertions
  are Nx target topology, package script absence, retired file absence,
  source-token required presence, and evaluated Vite config watch ignores.
  Those are data-driven topology/config assertions, not clean Grit authority.

## Proof

Pre-change command checks passed for all three lane rows:

```bash
bun tools/habitat/bin/dev.ts check --rule enforce_studio_dev_runner_topology --json
bun tools/habitat/bin/dev.ts check --rule require_projection_calls_in_projection_steps --json
bun tools/habitat/bin/dev.ts check --rule require_recipe_dag_contract_metadata --json
```

Post-change targeted proof passed:

```bash
bun habitat classify .habitat/civ7/mapgen/studio/blueprints/recipe-dag-service/boundary/check/prohibit_recipe_dag_runtime_source_dependencies
bun habitat classify .habitat/civ7/mapgen/map-output/blueprints/map-projection/boundary/check/prohibit_misplaced_projection_adapter_calls
bun tools/habitat/bin/dev.ts check --rule prohibit_misplaced_projection_adapter_calls --json
bun tools/habitat/bin/dev.ts check --rule prohibit_recipe_dag_runtime_source_dependencies --json
bun tools/habitat/bin/dev.ts check --rule require_projection_calls_in_projection_steps --json
bun tools/habitat/bin/dev.ts check --rule require_recipe_dag_contract_metadata --json
```

One attempted combined classify command failed because `habitat classify`
accepts one path argument; the two single-path classify commands above replaced
it.

## Residual Work

- `enforce_studio_dev_runner_topology` should move only when Habitat has a
  durable data-driven topology/Nx-target assertion surface, or when the checks
  move to Nx metadata/package-local validation.
- `require_recipe_dag_contract_metadata` still contains a graph-aware validator.
  Do not encode its transitive graph closure in Grit.
- `require_projection_calls_in_projection_steps` still contains required
  callsite/token presence checks. Do not encode required absence/presence
  currentness as broad source patterns.
