# Domino 040: Sort Studio Blueprint Candidates Into Operating Niches

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Indexed Result

The Studio `_blueprints` lane was removed. Its eight packets moved whole into child operating-area niches: `devops`, `browser-worker`, `recipe-dag`, and `server`. This was structural rehoming with manifest path repair, not content-level cleanup, retirement, split, or blueprint admission.

## Detail

#### Domino 40 Disposition Receipt

This table is a receipt for structural rehoming, not a second authority
surface. The packets moved whole so the old Studio `_blueprints` labels no
longer imply blueprint authority. Packet-level content sorting, split,
cleanup, retirement, and future blueprint-kind generalization remain deferred.

| Rule id | Start path | Target path | Placement reason | Deferred cleanup signal |
| --- | --- | --- | --- | --- |
| `enforce_studio_dev_runner_topology` | `.habitat/civ7/mapgen/studio/_blueprints/dev-runner/enforce_studio_dev_runner_topology` | `.habitat/civ7/mapgen/studio/devops/rules/enforce_studio_dev_runner_topology` | Governs Studio development execution topology: Nx dev/daemon targets, Vite watch boundaries, and retired package script surfaces. | Revisit if devops and server runtime need a shared or split positive operational contract. |
| `prohibit_retired_studio_devlive_daemon_file` | `.habitat/civ7/mapgen/studio/_blueprints/dev-runner/prohibit_retired_studio_devlive_daemon_file` | `.habitat/civ7/mapgen/studio/devops/rules/prohibit_retired_studio_devlive_daemon_file` | Guards retired Studio dev-live daemon surface as part of the devops lane. | Retire later if the positive devops topology check fully subsumes it. |
| `ensure_studio_worker_bundle_is_browser_safe` | `.habitat/civ7/mapgen/studio/_blueprints/worker-bundle/ensure_studio_worker_bundle_is_browser_safe` | `.habitat/civ7/mapgen/studio/browser-worker/rules/ensure_studio_worker_bundle_is_browser_safe` | Governs the MapGen Studio browser worker bundle as a Studio subsystem, not a generic worker blueprint. | Revisit if a future worker blueprint kind admits shared browser-worker requirements. |
| `prohibit_recipe_dag_runtime_source_dependencies` | `.habitat/civ7/mapgen/studio/_blueprints/recipe-dag-service/prohibit_recipe_dag_runtime_source_dependencies` | `.habitat/civ7/mapgen/studio/recipe-dag/rules/prohibit_recipe_dag_runtime_source_dependencies` | Governs Studio recipe-DAG service imports and contract-only metadata source use. | Revisit if recipe-DAG boundary rules split into service, contract-source, or artifact-consumption subrules. |
| `require_recipe_dag_contract_metadata` | `.habitat/civ7/mapgen/studio/_blueprints/recipe-dag-service/require_recipe_dag_contract_metadata` | `.habitat/civ7/mapgen/studio/recipe-dag/rules/require_recipe_dag_contract_metadata` | Governs the Recipe DAG import graph and contract metadata requirements for the Studio subsystem. | Revisit when recipe contract metadata becomes positive blueprint or capability authority. |
| `require_studio_ui_recipe_artifact_imports` | `.habitat/civ7/mapgen/studio/_blueprints/recipe-artifact-supply/require_studio_ui_recipe_artifact_imports` | `.habitat/civ7/mapgen/studio/recipe-dag/rules/require_studio_ui_recipe_artifact_imports` | The UI consumes recipe artifacts from the same recipe-DAG contract/supply subsystem rather than runtime recipe modules. | Split later if UI artifact consumption becomes broader than the recipe-DAG lane. |
| `enforce_studio_rpc_eventhub_topology` | `.habitat/civ7/mapgen/studio/_blueprints/rpc-daemon/enforce_studio_rpc_eventhub_topology` | `.habitat/civ7/mapgen/studio/server/rules/enforce_studio_rpc_eventhub_topology` | Governs the Studio server daemon mounting RPC through runtime context; `rpc-daemon` is an implementation role, not the niche. | Revisit if Studio server runtime grows finer child niches for RPC, EventHub, or daemon lifecycle. |
| `prohibit_studio_rpc_eventhub_lifecycle_leaks` | `.habitat/civ7/mapgen/studio/_blueprints/rpc-daemon/prohibit_studio_rpc_eventhub_lifecycle_leaks` | `.habitat/civ7/mapgen/studio/server/rules/prohibit_studio_rpc_eventhub_lifecycle_leaks` | Governs EventHub lifecycle ownership inside the Studio server runtime context. | Split later if lifecycle ownership becomes a broader server-runtime capability rule. |
