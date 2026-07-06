# Domino 080: Generated Output And Projection Native Rails

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Detail

#### Domino 80: Generated Output And Projection Native Rails

Status: closed on `codex/habitat-generated-output-projection-rails`.

Purpose: close stale packet-needed state for runtime/source validation rows
whose current Habitat scripts are the correct rails for generated output, built
bundle output, generated entrypoint currentness, and required projection
callsite proof.

Disposition receipt:

| Rule id | Action | Receipt |
| --- | --- | --- |
| `block_studio_config_leakage_into_shipped_catalog` | Retained generated mod catalog leakage guard; row is now live no-action authority. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-generated-output-and-projection-native-rails.md` |
| `validate_generated_map_entrypoint_contracts` | Retained generated map entrypoint contract validator; row is now live no-action authority. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-generated-output-and-projection-native-rails.md` |
| `ensure_studio_worker_bundle_is_browser_safe` | Retained Studio browser-worker built-bundle preflight; row is now live no-action authority. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-generated-output-and-projection-native-rails.md` |
| `require_projection_calls_in_projection_steps` | Retained map projection owner-callsite/currentness validator; row is now live no-action authority. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-generated-output-and-projection-native-rails.md` |

Moves it forward:

- Removes stale remediation work from the queue without mutating correct
  authority.
- Keeps generated-output and built-output currentness checks in Habitat-native
  rails instead of moving them into package-owned behavior tests.
- Separates required-presence/currentness proof from Grit source matching and
  Nx project-boundary enforcement.

Closure note:

- Focused Habitat checks passed for all four retained rules.
- Direct source/output token scans matched the retained proof shape where
  applicable.
