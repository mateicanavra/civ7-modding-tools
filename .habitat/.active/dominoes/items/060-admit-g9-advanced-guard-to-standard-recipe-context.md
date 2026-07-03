# Domino 060: Admit G9 Advanced Guard To Standard Recipe Context

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Detail

#### Domino 60: Admit G9 Advanced Guard To Standard Recipe Context

Status: closed on `codex/habitat-g9-advanced-guard-context`.

Purpose: close the G9 wrapper-only `advanced` guard packet without deleting the
guard or moving stale key pressure into package tests.

Disposition receipt:

| Rule id | Action | Reason | Receipt |
| --- | --- | --- | --- |
| `prohibit_wrapper_only_advanced_config` | moved from `pipeline/config/_remainder` to `swooper-maps-standard-recipe/rules` | Current G9 guardrail docs explicitly retain this Habitat source-shape guard for standard recipe source and map configs. It is not garbage, and it is not a package-test assertion. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-g9-advanced-guard-context-slice.md` |

Moves it forward:

- Removes one `_remainder` row by admitting it to the honest current context.
- Keeps source schemas/config compilation as behavior authority while Habitat
  owns the source-shape recurrence guard.
- Avoids creating a broad config blueprint before that authority exists.

Closure note:

- The proof claim is placement/context admission for the existing G9 Grit guard.
- The slice does not create generic config authority and does not replace the
  guard with package tests.
