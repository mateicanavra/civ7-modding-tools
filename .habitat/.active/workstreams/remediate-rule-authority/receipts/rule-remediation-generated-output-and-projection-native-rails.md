# Rule Remediation: Generated Output And Projection Native Rails

Status: closed on `codex/habitat-generated-output-projection-rails`

## Slice

Selected rules:

- `block_studio_config_leakage_into_shipped_catalog`
- `validate_generated_map_entrypoint_contracts`
- `ensure_studio_worker_bundle_is_browser_safe`
- `require_projection_calls_in_projection_steps`

Action class: runtime/source validation.

## Decision

No authority-state mutation is required. These rows were marked as needing
runtime/source validation, but their current Habitat scripts are the correct
rails for their proof shapes.

They validate generated output, built bundle output, generated entrypoint
currentness, and required projection callsites. Those are not package-test
junk-drawer concerns, Nx project-boundary concerns, or single-pattern Grit
source-shape checks.

## Rule Outcomes

| Rule | Outcome |
| --- | --- |
| `block_studio_config_leakage_into_shipped_catalog` | Retain generated mod catalog leakage guard over shipped XML/modinfo output. |
| `validate_generated_map_entrypoint_contracts` | Retain generated map entrypoint contract validator over canonical config envelopes and hashes. |
| `ensure_studio_worker_bundle_is_browser_safe` | Retain Studio browser-worker built-bundle preflight. |
| `require_projection_calls_in_projection_steps` | Retain map projection owner-callsite/currentness validator over exact projection files. |

## Exclusions

| Row | Reason |
| --- | --- |
| `preserve_decomposed_foundation_contract_surfaces` | Mixed required contract/artifact presence and import-source proof across foundation files; requires separate deeper source-validation design. |
| `preserve_evidence_provenance_labels` | Generated resource proof depends on unavailable official resources submodule in this worktree. |
| `prohibit_runtime_local_config_default_merging` | Runtime config/defaulting remainder row remains broader and needs handler-scope narrowing before mutation. |

## Proof

- `bun habitat check --rule block_studio_config_leakage_into_shipped_catalog --json`
  passed.
- `bun habitat check --rule validate_generated_map_entrypoint_contracts --json`
  passed.
- `bun habitat check --rule ensure_studio_worker_bundle_is_browser_safe --json`
  passed.
- `bun habitat check --rule require_projection_calls_in_projection_steps --json`
  passed.
- Direct source/output token scans matched the retained proof shape where
  applicable.

## Proof Limit

This slice does not replace generated-output validation with package tests,
does not create positive projection authority, and does not split map-output or
mod-map semantics. It only repairs the canonical remediation matrix so
already-correct native Habitat validation surfaces are not kept in the
packet-needed queue.
