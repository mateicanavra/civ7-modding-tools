# Domino 084: Placement Apply Grit Rail

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Detail

#### Domino 84: Placement Apply Grit Rail

Status: closed on `codex/habitat-placement-apply-grit-rail`.

Purpose: resume the cascade for one deterministic split-by-owner row and close
it as an already-atomized terminal placement apply Grit rail.

Disposition receipt:

| Rule id | Action | Receipt |
| --- | --- | --- |
| `require_typed_placement_outcomes_before_apply` | Retained existing terminal `placement/apply.ts` Grit rail; row is now live no-action authority. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-placement-apply-grit-rail.md` |

Moves it forward:

- Separates terminal apply typed-outcome consumption from resource/discovery
  materialization substeps without creating a new rule split.
- Reduces the split-by-owner packet-needed count by one without making a
  product/architecture semantic decision.

Closure note:

- Focused Habitat check passed.
- A temporary `generateOfficialResources()` probe in terminal apply failed the
  Grit rule and was removed.
