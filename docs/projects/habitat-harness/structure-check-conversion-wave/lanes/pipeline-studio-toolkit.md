# Pipeline / Studio / Toolkit Lane

Status: implemented the clean v1-safe splits.

Implemented:
- `prohibit_retired_studio_devlive_daemon_file`: structure-check split from `enforce_studio_dev_runner_topology`.
- `prohibit_studio_rpc_eventhub_lifecycle_leaks`: Grit split from `enforce_studio_rpc_eventhub_topology`.
- `validate_habitat_service_module_root_topology`: structure-check split from `validate_habitat_service_module_file_shape`.

Retained:
- Studio package JSON, Nx target, evaluated Vite config, and required env-token assertions remain command-check or future Nx/data-driven ownership.
- Studio RPC positive mount presence remains command-check.
- Service module recursive suffix/router-shape validation remains command-check because TOML v1 cannot express typed children, recursive suffix policy, or `router.ts` OR `router/`.
- Stage order and runtime/manifest parity remain command-check.

Proof is recorded in `proof-ledger.md`.
