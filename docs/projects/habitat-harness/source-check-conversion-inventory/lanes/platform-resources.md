# platform-resources Lane Inventory

Status: inspected by Agent 4

Assigned surface: `.habitat/civ7/{platform,resources}/**`

## Coverage

- Inspected 10 assigned rule records.
- Inspected 3 related source-check adapters:
  - `enforce_adapter_only_base_standard_imports.rule.mjs`
  - `preserve_transport_pure_orpc_contracts.rule.mjs`
  - `require_sanctioned_direct_control_session_owners.rule.mjs`
- Inspected adjacent `category.md`, baselines, patterns, and command/file-layer executors.
- All baselines in this lane are empty arrays.

## Disposition Summary

| Disposition | Count | Rows |
| --- | ---: | --- |
| `grit_pattern_authority` | 6 | `enforce_adapter_only_base_standard_imports`, `ensure_map_policy_dependency_independence`, `preserve_transport_pure_orpc_contracts`, `prohibit_adapter_local_legacy_generator_logic`, `require_narrow_game_ui_bridge_bootstrap`, `require_sanctioned_direct_control_session_owners` |
| `data_driven_import_path_rule` | 2 | `block_hand_edits_to_generated_civ7_types`, `block_hand_edits_to_generated_map_policy_tables` |
| `package_local_test_or_validator` | 1 | `preserve_evidence_provenance_labels` |
| `needs_split` | 1 | `block_unapproved_base_standard_boundary_leaks` |
| `delete_or_demote` | 0 | none |

## Key Findings

- The three source-check adapter-backed rows in this lane are ready Grit extraction candidates because each already has an adjacent `.pattern.md` that mirrors the adapter predicate.
- `block_unapproved_base_standard_boundary_leaks` should not be ported wholesale. Its real runtime-import boundary overlaps `enforce_adapter_only_base_standard_imports`, while its allowlist and broad string scan are transitional debt/provenance exceptions.
- Several command checks were mechanically seeded as package validators, but the inspected executors show structural source/path predicates:
  - `ensure_map_policy_dependency_independence` is pure import/export legality.
  - `prohibit_adapter_local_legacy_generator_logic` is path-scoped identifier/call/string matching.
  - `require_narrow_game_ui_bridge_bootstrap` is exact-file import/install shape plus forbidden token checks.
- The two file-layer rows are not Grit candidates. They protect generated zones from staged hand edits and should remain data-driven file/path rules until generated artifact protection has a clearer target model.
- `preserve_evidence_provenance_labels` is technically text-matchable, but the oracle is generated output correctness with regeneration as remediation. It should be reviewed as package-local generator verification before any Grit work.

## First Grit Candidates From This Lane

1. `enforce_adapter_only_base_standard_imports`: existing pattern, deletes one source-check adapter, and becomes the consolidation target for the duplicate shell boundary check.
2. `require_sanctioned_direct_control_session_owners`: existing pattern, simple constructor/path predicate, deletes one source-check adapter.
3. `preserve_transport_pure_orpc_contracts`: existing pattern, multiple clauses but one coherent contract/boundary owner, deletes one source-check adapter.
4. `ensure_map_policy_dependency_independence`: no pattern yet, but a straightforward import/export forbidden-specifier rule.
5. `prohibit_adapter_local_legacy_generator_logic`: no pattern yet, but straightforward path-scoped source matching.
6. `require_narrow_game_ui_bridge_bootstrap`: likely Grit, but should be proved after simpler conversions because it includes required-presence checks.

## Notable Split Candidates

- `block_unapproved_base_standard_boundary_leaks`
  - Keep/consolidate the runtime `/base-standard/` import boundary through `enforce_adapter_only_base_standard_imports`.
  - Demote or delete allowlisted broad string-scan debt once the synthesis layer confirms those files are not runtime import authority.

## Blockers

- No lane-local blockers.
- Cross-workstream synthesis needs a better disposition label for generated file-layer path protection; `data_driven_import_path_rule` is the closest allowed enum but does not name generated-zone protection cleanly.
