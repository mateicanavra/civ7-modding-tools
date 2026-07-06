# Domino 077: Existing Grit Rails Reconciliation

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Detail

#### Domino 77: Existing Grit Rails Reconciliation

Status: closed on `codex/habitat-existing-grit-rails-reconciliation`.

Purpose: close stale packet-needed state for source-validation rows that
already use the correct packet-local Grit source-check rail.

Disposition receipt:

| Rule id | Action | Receipt |
| --- | --- | --- |
| `prohibit_foundation_projection_legacy_motion_source` | Retained existing Grit rail; row is now live no-action source-check authority. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-existing-grit-rails-reconciliation.md` |
| `prohibit_morphology_stage_legacy_effect_gates` | Retained existing Grit rail; row is now live no-action source-check authority. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-existing-grit-rails-reconciliation.md` |

Moves it forward:

- Removes stale remediation work from the queue without mutating correct
  authority.
- Keeps concrete recurrence-risk source-token checks in Habitat/Grit.
- Leaves broader tag/effect family positive authority as a separate future
  slice.

Closure note:

- Focused Habitat checks passed for both retained rules.
