# Review Ledger

Status: synthesized review complete; updated after command-check split canary

| Finding | Severity | Disposition | Repair Evidence |
| --- | --- | --- | --- |
| Coverage review: canonical corpus must include exactly 73 rule records. | P1 | cleared | `mechanical-counts.json` records `ruleRecords: 73`; JSONL validation parses all canonical lanes. |
| Pre-canary coverage review: adapter crosswalk included exactly 33 centralized adapters. | P1 | cleared | The canary deleted 7 adapter files, the systematic burn-down deleted 25 more, and the final split deleted the last adapter. `mechanical-counts.json` now records `adapters: 0`. |
| Pre-canary source-check mismatch: 29 active source-check records vs 33 adapters. | P1 | cleared | The 4 stale command-check adapters were deleted, all 29 active source-check rules were converted to `grit-check`, and current state is 0 active source-check records with 0 adapters. |
| Quality review: weak non-Grit claims must be challenged. | P2 | cleared | Lane summaries identify Grit candidates aggressively and reserve non-Grit for package/runtime/generated/Nx/file-layer or split rows. |
| Quality review: broad command-check bundles must not be converted wholesale. | P2 | cleared | `needs_split` rows are listed in `matrix.md` and ordered in `next-grit-extraction-slices.md`. |
| Crosswalk review challenged `require_explicit_mapgen_sdk_opt_in` as mixed despite lane direct-Grit classification. | P2 | accepted | Canonical row changed to `needs_split`; mapgen-other lane summary records review-adjusted split. |
| Classification enum lacks exact labels for file-layer generated-zone and Nx graph-backed rules. | P3 | accepted with constraint | Kept requested enum unchanged; rows use `data_driven_import_path_rule` with notes. |
| Current adapters must not be preserved as target architecture. | P1 | cleared | Crosswalk marks active adapters as conversion targets and stale non-source adapters as delete/demote candidates. |
| Burn-down canary must prove Grit ownership before deleting active adapters. | P1 | cleared | `block_engine_runtime_imports_from_domain_ops`, `preserve_transport_pure_orpc_contracts`, and `prohibit_runtime_helper_redeclarations` passed source-check before conversion and grit-check after conversion. |
| Systematic burn-down must preserve row-level proof rather than batch-level proof. | P1 | cleared | Lane proof files under `grit-burn-down/lanes/` record pre-source-check, post-grit-check, and normal-selection proof per row. |
| `prohibit_runtime_calls_to_runvalidated` initially failed in one lane attempt. | P2 | accepted and repaired | The row was re-tested after lane integration, passed grit-check and normal selection without pattern changes, was converted, and its adapter was deleted. The lane proof row records the transient failure and repair. |
| `require_explicit_mapgen_sdk_opt_in` must not be bulk-converted as a whole row. | P1 | cleared | The final split removed the overlapping mapgen-core branch from the SDK packet, converted the residual SDK predicate to `grit-check`, deleted the last adapter, and deleted `rule-runtime.policy.mjs`. |
| Command-check split canary must not hide assertion-level owner changes. | P1 | cleared | `prohibit_cross_op_runtime_calls`, `require_public_ecology_surfaces_and_retired_topology_removal`, and `ensure_docs_checkout_paths_are_portable` now have assertion rows in `command-check-split-canary/canary-corpus.jsonl`; docs portability records the intentional narrowing from broad heuristic detection to apply-backed advisory rewrite diagnostics. |
