# Review Ledger

Status: active.

| Finding | Severity | Disposition | Repair Evidence |
| --- | --- | --- | --- |
| Do not treat every `structure/check` path as `structure-check` ownership. | P1 | accepted | Graph/taxonomy, stage order, runtime parity, package JSON, Nx target shape, and evaluated config rows remain non-structure. |
| `enforce_studio_dev_runner_topology` contained one pure file absence branch. | P2 | repaired | Added `prohibit_retired_studio_devlive_daemon_file`; removed the file-existence assertion from the command script. |
| `enforce_studio_rpc_eventhub_topology` was source-token/call-shape authority, not file topology. | P2 | repaired | Added `prohibit_studio_rpc_eventhub_lifecycle_leaks`; retained only positive RPC handler mount proof in command-check. |
| `validate_habitat_service_module_file_shape` cannot fully move to TOML v1. | P2 | accepted | Root topology moved; recursive suffix and router OR residuals remain command-check. |
| Domain aggregate topology fragments need explicit accepted root lists before TOML authoring. | P2 | deferred | Recorded in domain lane and corpus instead of guessing from profile auto-detection. |
| Round 1 prep ledger lacked exact command-script branch locators. | P1 | repaired | `mechanical-extraction-inputs.jsonl` now includes `commandBranchLocator` with script, line range, and anchors for every row. |
| Round 1 prep ledger lacked future destination proof commands/templates. | P1 | repaired | Rows now include `currentEvidenceCommands` and `futureProofCommands`; future commands use `<new-...-rule-id>` placeholders where the rule id is created in Round 2. |
| Aggregate script had current branches missing from the prior corpus. | P2 | repaired | Added `milestone-prefixed-recipe-tag-catalogs`, `domain-refactor-example-heightfield-buffer`, and `domain-refactor-example-map-artifacts-effects`. |
| Several broad Grit rows were too coarse for mechanical implementation. | P2 | repaired | Split broad hydrology, foundation, morphology, strategy-import, and global sweep rows into narrower assertion rows. |
| `foundation-tectonics-strategy-imports` mixed Grit-shaped import bans with required-import currentness. | P2 | repaired | Split into shim-import ban, nonlocal-import ban, and required `../rules` import currentness rows. |
| `focused-tectonics-op-contracts` mixed a legacy-token ban with positive required operation currentness. | P2 | repaired | Split into `foundation-legacy-aggregate-tectonics-ban` and `focused-tectonics-op-contracts-currentness`. |
| `global-full-profile-source-bans` hid a structure topology branch for domain `artifacts.ts` modules. | P2 | repaired | Split `domain-artifacts-modules` as `structure-check`; other global branches now have individual owners. |
| Retained package-local validator rows did not expose proof class structurally. | P2 | repaired | Rows now carry `extractionInputs.proofClass` for retained/currentness/package-local rows. |
| `ecology-canonical-module-shape` still mixes topology with schema-description/JSDoc quality. | P2 | accepted as explicit split task | Left as the only `ready-for-split-implementation` row with structure and non-structure parts named. |
| `migrated-consumer-effect-gating-bans` was routed through morphology even though it checks a `map-hydrology` consumer contract. | P3 | repaired | Target packet hint now points to the standard-recipe consumer boundary and records `consumerOwner`. |
