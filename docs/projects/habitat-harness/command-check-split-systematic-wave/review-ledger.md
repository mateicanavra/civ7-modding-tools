# Review Ledger

Status: closed after Grit review and proof audit.

| Finding | Severity | Disposition | Repair Evidence |
| --- | --- | --- | --- |
| Do not force topology/currentness checks into Grit just because a script contains text scans. | P1 | accepted | `preserve_standard_stage_topology_and_path_invariants`, `enforce_studio_dev_runner_topology`, and `verify_standard_recipe_public_authoring_surface` remain non-Grit ownership after assertion review. |
| `block_unapproved_base_standard_boundary_leaks` broad shell scan was not equivalent to import authority. | P1 | accepted | Deleted the stale command packet and retained `enforce_adapter_only_base_standard_imports` as the structural import boundary. |
| `require_projection_calls_in_projection_steps` mixed forbidden source-shape assertions with required callsite/currentness assertions. | P1 | repaired | Added `prohibit_misplaced_projection_adapter_calls`; shrunk the original command check to required owner/materialization proof. |
| `require_recipe_dag_contract_metadata` mixed direct runtime import bans with local import-graph closure. | P1 | repaired | Added `prohibit_recipe_dag_runtime_source_dependencies`; retained the graph validator in the original command check. |
| Pipeline ecology policy looked mixed but all retained executable branches were structural token/source predicates. | P2 | repaired | Converted `prohibit_ecology_fudge_terms_and_legacy_generator_surfaces` to Grit and deleted the bespoke command script. |
| Domain aggregate bundles are too broad for one safe wave. | P2 | accepted | The domain lane left four rows in `needs_split`; they require follow-up packets rather than inline shrinking. |
| Docs anchor validator contains separable Markdown shape rules, but current red is reference existence. | P2 | accepted | `validate_mapgen_docs_anchors_and_references` remains command-check; future work should split source-shape Markdown assertions separately. |
| Assertion corpus must remain parseable and complete. | P1 | repaired | `assertion-corpus.jsonl` merges 91 lane rows from the four lane JSONL files and validates line-by-line. |
