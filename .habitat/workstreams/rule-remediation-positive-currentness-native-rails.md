# Rule Remediation: Positive Currentness Native Rails

Status: closed on `codex/habitat-positive-currentness-rails`

## Slice

Selected rules:

- `enforce_studio_rpc_eventhub_topology`
- `preserve_decomposed_foundation_contract_surfaces`
- `preserve_evidence_provenance_labels`

Action class: runtime/source validation.

## Decision

No authority-state mutation is required. These rows were marked as needing
runtime/source validation, but their current Habitat scripts are the correct
rails for positive source topology/currentness and generated-output label proof.

They are not package-test candidates. They validate source topology, required
positive contract/artifact presence, import-source currentness, and generated
output provenance labels.

## Rule Outcomes

| Rule | Outcome |
| --- | --- |
| `enforce_studio_rpc_eventhub_topology` | Retain Studio server topology validator for the daemon `createStudioRpcHandler(context)` mount. |
| `preserve_decomposed_foundation_contract_surfaces` | Retain foundation decomposed contract-surface validator over operation names, artifact tags, strategy rule imports, and projection currentness. |
| `preserve_evidence_provenance_labels` | Retain map-policy generated-output provenance label validator. |

## Exclusions

| Row | Reason |
| --- | --- |
| `enforce_formatting_and_import_hygiene` | Focused check is currently red from broad workspace formatting/import drift; cannot close as retained proof. |
| `prohibit_runtime_local_config_default_merging` | Broad runtime/config `_remainder` Grit rule still needs handler-scope narrowing or positive config authority before admission. |

## Proof

- `bun habitat check --rule enforce_studio_rpc_eventhub_topology --json`
  passed.
- `bun habitat check --rule preserve_decomposed_foundation_contract_surfaces --json`
  passed.
- `bun habitat check --rule preserve_evidence_provenance_labels --json`
  passed.

## Proof Limit

This slice does not move validation into package-owned tests, create new
positive authority, or split broader config/defaulting rules. It only repairs
the canonical remediation matrix so already-correct native Habitat validation
surfaces are not kept in the packet-needed queue.
