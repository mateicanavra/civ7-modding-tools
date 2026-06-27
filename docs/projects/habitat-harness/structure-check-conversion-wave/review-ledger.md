# Review Ledger

Status: active.

| Finding | Severity | Disposition | Repair Evidence |
| --- | --- | --- | --- |
| Do not treat every `structure/check` path as `structure-check` ownership. | P1 | accepted | Graph/taxonomy, stage order, runtime parity, package JSON, Nx target shape, and evaluated config rows remain non-structure. |
| `enforce_studio_dev_runner_topology` contained one pure file absence branch. | P2 | repaired | Added `prohibit_retired_studio_devlive_daemon_file`; removed the file-existence assertion from the command script. |
| `enforce_studio_rpc_eventhub_topology` was source-token/call-shape authority, not file topology. | P2 | repaired | Added `prohibit_studio_rpc_eventhub_lifecycle_leaks`; retained only positive RPC handler mount proof in command-check. |
| `validate_habitat_service_module_file_shape` cannot fully move to TOML v1. | P2 | accepted | Root topology moved; recursive suffix and router OR residuals remain command-check. |
| Domain aggregate topology fragments need explicit accepted root lists before TOML authoring. | P2 | deferred | Recorded in domain lane and corpus instead of guessing from profile auto-detection. |
