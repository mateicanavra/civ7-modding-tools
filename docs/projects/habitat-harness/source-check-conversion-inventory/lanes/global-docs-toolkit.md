# global-docs-toolkit Lane Inventory

Status: inspected

Agent 5 inspected every assigned `.rule.json` under `.habitat/{global,docs,habitat}/**`, all adjacent packet files, and rule-id matches against centralized source-check adapters. This lane has `12` rule records and `0` related source-check adapters.

## Summary

| Disposition | Count | Rules |
| --- | ---: | --- |
| `grit_pattern_authority` | 1 | `prohibit_product_scan_roots_in_grit_provider` |
| `data_driven_import_path_rule` | 4 | `enforce_workspace_import_boundaries`, `prohibit_pnpm_files_in_bun_workspace`, `require_owner_workflow_for_host_protected_surfaces`, `validate_habitat_service_module_file_shape` |
| `package_local_test_or_validator` | 5 | `enforce_formatting_and_import_hygiene`, `validate_boundary_taxonomy_against_workspace_graph`, `validate_docs_site_config_inputs`, `verify_docs_site_link_integrity`, `verify_habitat_cli_smoke_contract` |
| `needs_split` | 2 | `ensure_docs_checkout_paths_are_portable`, `validate_mapgen_docs_anchors_and_references` |
| `delete_or_demote` | 0 | none |

## Lane Findings

- No assigned rule has a source-check adapter; all `adapterPath` values are `null`.
- `prohibit_product_scan_roots_in_grit_provider` is already the clean model for this workstream: registry metadata plus an adjacent Grit pattern, with no command adapter.
- The two best split candidates are docs rules:
  - `ensure_docs_checkout_paths_are_portable`: the Grit pattern already owns the markdown rewrite/check shape, while the advisory command script duplicates diagnostic detection.
  - `validate_mapgen_docs_anchors_and_references`: markdown text-shape checks can likely become Grit, but anchor target existence remains validator behavior.
- The strongest non-Grit validators are runtime/tool or graph checks:
  - `verify_habitat_cli_smoke_contract` depends on executing the Habitat CLI and parsing JSON output.
  - `verify_docs_site_link_integrity` depends on Mintlify broken-link behavior in a temporary docs-site copy.
  - `validate_boundary_taxonomy_against_workspace_graph` depends on Nx graph metadata, package manifests, boundary config, and taxonomy docs together.
- The file-layer rows are already close to the desired simple model: rule metadata supplies file names or host-surface guard intent, and the runner owns staged path evaluation.

## First Grit Candidates From This Lane

1. `ensure_docs_checkout_paths_are_portable`
   - Convert the existing `.pattern.md` into the accepted authority path for detection/rewrite.
   - Then demote or delete the advisory command-check script once the Grit path is wired as the runnable/default proof.

2. `validate_mapgen_docs_anchors_and_references`
   - Split off markdown text-shape rules into Grit candidates: required top `<toc>`, required `## Ground truth anchors`, workspace alias mention bans/warnings, and local glossary-like term definitions.
   - Keep file-existence and router-target liveness in a validator unless Habitat gains a first-class reference-existence rule engine.

3. `prohibit_product_scan_roots_in_grit_provider`
   - Use as the example pattern for simple source-literal bans already expressed as Grit authority.

## Non-Grit Follow-Ups

- `validate_habitat_service_module_file_shape` should become a declarative file-tree/suffix allowlist rather than a large bespoke command script. Grit can cover some suffix bans, but a data-driven file-tree runner would collapse more state.
- `enforce_workspace_import_boundaries` should remain Nx/boundary-config backed. Do not duplicate graph import law in Grit.
- `validate_boundary_taxonomy_against_workspace_graph` should remain a graph/config/taxonomy validator, not a source pattern.
- `validate_docs_site_config_inputs`, `verify_docs_site_link_integrity`, and `verify_habitat_cli_smoke_contract` are runtime or package/tool validators; keep them out of the Grit extraction stream.

## Blockers

- None for this lane artifact.
- The classification enum has no exact value for existing file-layer staged-path guards or Nx graph-backed import-boundary authority. I used `data_driven_import_path_rule` for those rows and recorded the narrower meaning in row notes.
