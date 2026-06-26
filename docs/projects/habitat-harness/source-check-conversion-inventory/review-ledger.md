# Review Ledger

Status: synthesized review complete; updated after burn-down canary

| Finding | Severity | Disposition | Repair Evidence |
| --- | --- | --- | --- |
| Coverage review: canonical corpus must include exactly 73 rule records. | P1 | cleared | `mechanical-counts.json` records `ruleRecords: 73`; JSONL validation parses all canonical lanes. |
| Pre-canary coverage review: adapter crosswalk included exactly 33 centralized adapters. | P1 | superseded by canary | The canary deleted 7 adapter files; `mechanical-counts.json` now records `adapters: 26` and `deletedAdapterRules` records the deleted set. |
| Pre-canary source-check mismatch: 29 active source-check records vs 33 adapters. | P1 | cleared by canary | The 4 stale command-check adapters were deleted and 3 active rules were converted to `grit-check`; current state is 26 active source-check records and 26 adapters. |
| Quality review: weak non-Grit claims must be challenged. | P2 | cleared | Lane summaries identify Grit candidates aggressively and reserve non-Grit for package/runtime/generated/Nx/file-layer or split rows. |
| Quality review: broad command-check bundles must not be converted wholesale. | P2 | cleared | `needs_split` rows are listed in `matrix.md` and ordered in `next-grit-extraction-slices.md`. |
| Crosswalk review challenged `require_explicit_mapgen_sdk_opt_in` as mixed despite lane direct-Grit classification. | P2 | accepted | Canonical row changed to `needs_split`; mapgen-other lane summary records review-adjusted split. |
| Classification enum lacks exact labels for file-layer generated-zone and Nx graph-backed rules. | P3 | accepted with constraint | Kept requested enum unchanged; rows use `data_driven_import_path_rule` with notes. |
| Current adapters must not be preserved as target architecture. | P1 | cleared | Crosswalk marks active adapters as conversion targets and stale non-source adapters as delete/demote candidates. |
| Burn-down canary must prove Grit ownership before deleting active adapters. | P1 | cleared | `block_engine_runtime_imports_from_domain_ops`, `preserve_transport_pure_orpc_contracts`, and `prohibit_runtime_helper_redeclarations` passed source-check before conversion and grit-check after conversion. |
