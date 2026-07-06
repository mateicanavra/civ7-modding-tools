# Domino 079: Native Validation Surfaces

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Detail

#### Domino 79: Native Validation Surfaces

Status: closed on `codex/habitat-native-validation-surfaces`.

Purpose: close stale packet-needed state for runtime/source validation rows
whose existing Habitat-native validation surfaces are the correct owner rails.

Disposition receipt:

| Rule id | Action | Receipt |
| --- | --- | --- |
| `require_owner_workflow_for_host_protected_surfaces` | Retained Habitat file-layer host-surface guard; row is now live no-action authority. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-native-validation-surfaces.md` |
| `validate_boundary_taxonomy_against_workspace_graph` | Retained Habitat boundary taxonomy script; row is now live no-action authority. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-native-validation-surfaces.md` |
| `verify_docs_site_link_integrity` | Retained docs-site native link-integrity validation; row is now live no-action authority. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-native-validation-surfaces.md` |
| `verify_habitat_cli_smoke_contract` | Retained Habitat Toolkit CLI smoke validation; row is now live no-action authority. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-native-validation-surfaces.md` |
| `validate_docs_site_config_inputs` | Retained docs-site native config-shape validation; row is now live no-action authority. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-native-validation-surfaces.md` |
| `verify_visualization_runtime_build_artifacts` | Retained MapGen visualization runtime preflight; row is now live no-action authority. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-native-validation-surfaces.md` |

Moves it forward:

- Removes stale remediation work from the queue without mutating correct
  authority.
- Keeps workspace metadata, docs-site, CLI smoke, host-surface, and runtime
  preflight checks in Habitat-native rails instead of pushing them into package
  behavior tests.
- Separates native validation surfaces from Grit source matching and Nx
  project-boundary enforcement.

Closure note:

- Focused Habitat checks passed for all six retained rules.
