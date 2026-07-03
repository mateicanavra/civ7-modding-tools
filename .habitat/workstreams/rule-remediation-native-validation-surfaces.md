# Rule Remediation: Native Validation Surfaces

Status: closed on `codex/habitat-native-validation-surfaces`

## Slice

Selected rules:

- `require_owner_workflow_for_host_protected_surfaces`
- `validate_boundary_taxonomy_against_workspace_graph`
- `verify_docs_site_link_integrity`
- `verify_habitat_cli_smoke_contract`
- `validate_docs_site_config_inputs`
- `verify_visualization_runtime_build_artifacts`

Action class: runtime/source validation.

## Decision

No authority-state mutation is required. These rows were marked as needing
runtime/source validation, but their current Habitat native validation surfaces
are the correct owner rails.

These are not package-test candidates. They validate workspace host policy,
cross-surface taxonomy metadata, docs-site configuration/link integrity, Habitat
CLI smoke contracts, and runtime dist preflight currentness. Those proof shapes
do not fit Grit static source matching or Nx project-boundary enforcement.

## Rule Outcomes

| Rule | Outcome |
| --- | --- |
| `require_owner_workflow_for_host_protected_surfaces` | Retain Habitat file-layer host-surface guard. |
| `validate_boundary_taxonomy_against_workspace_graph` | Retain Habitat boundary taxonomy script over package, Nx, boundary config, and taxonomy docs metadata. |
| `verify_docs_site_link_integrity` | Retain docs-site native link-integrity validation. |
| `verify_habitat_cli_smoke_contract` | Retain Habitat Toolkit CLI smoke validation. |
| `validate_docs_site_config_inputs` | Retain docs-site native config-shape validation. |
| `verify_visualization_runtime_build_artifacts` | Retain MapGen visualization runtime preflight for required built dist artifacts. |

## Exclusions

| Row | Reason |
| --- | --- |
| `enforce_formatting_and_import_hygiene` | Currently red from broad unrelated workspace formatting/import drift; not a clean retention closure. |
| `enforce_studio_rpc_eventhub_topology` | Currently reports existing serve-daemon command drift; requires its own topology slice. |
| `block_studio_config_leakage_into_shipped_catalog` | Generated catalog hygiene involves generator/output currentness and is not equivalent to these native metadata/config validation rails. |

## Proof

- `bun habitat check --rule require_owner_workflow_for_host_protected_surfaces --json`
  passed.
- `bun habitat check --rule validate_boundary_taxonomy_against_workspace_graph --json`
  passed.
- `bun habitat check --rule verify_docs_site_link_integrity --json` passed.
- `bun habitat check --rule verify_habitat_cli_smoke_contract --json` passed.
- `bun habitat check --rule validate_docs_site_config_inputs --json` passed.
- `bun habitat check --rule verify_visualization_runtime_build_artifacts --json`
  passed.

## Proof Limit

This slice does not change rule placement, create blueprint authority, or move
validation into package-owned tests. It only repairs the canonical remediation
matrix so already-correct native Habitat validation surfaces are not kept in the
packet-needed queue.
