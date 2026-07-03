# Domino 091: Admit Foundation Helper Redeclaration Rail

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Detail

#### Domino 91: Admit Foundation Helper Redeclaration Rail

Status: closed on `codex/habitat-foundation-helper-rail-admission`.

Purpose: move `prohibit_foundation_duplicate_math_helper_redefinitions` out of
Foundation `_remainder` and into the live Foundation rules lane as an existing
Grit source rail.

Disposition receipt:

| Rule id | Action | Receipt |
| --- | --- | --- |
| `prohibit_foundation_duplicate_math_helper_redefinitions` | Moved from `foundation/_remainder` to `foundation/rules`; id preserved and Grit predicate repaired for typed helper declarations. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-foundation-helper-rail-admission.md` |

Moves it forward:

- Removes one stale positive-authority/deletion-pair row from the canonical
  remediation JSON.
- Treats helper redeclaration prevention as live Foundation context authority,
  not as a new blueprint-kind assertion.
- Keeps the rule in Habitat/Grit, where this exact intra-domain source-shape
  recurrence guard belongs.

Closure note:

- Focused pre- and post-move Habitat checks passed.
- A temporary typed `clampByte` helper declaration probe failed the repaired
  Grit rule and was removed.
- No package-owned tests, replacement MJS scripts, or broad helper blueprint
  authority were introduced.
