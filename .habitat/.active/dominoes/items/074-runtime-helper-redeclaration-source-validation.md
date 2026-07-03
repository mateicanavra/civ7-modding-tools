# Domino 074: Runtime Helper Redeclaration Source Validation

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Detail

#### Domino 74: Runtime Helper Redeclaration Source Validation

Status: closed on `codex/habitat-runtime-helper-redeclaration-source`.

Purpose: close the source/baseline contradiction for the already-admitted
MapGen core helper redeclaration Grit rule.

Disposition receipt:

| Rule id | Action | Receipt |
| --- | --- | --- |
| `prohibit_runtime_helper_redeclarations` | Repaired source and Grit pattern; row is now live no-action authority. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-runtime-helper-redeclaration-source-slice.md` |

Moves it forward:

- Keeps helper redeclaration enforcement in Habitat/Grit, not MJS and not
  package-owned tests.
- Removes the local `compute-shelf-mask` `clamp01` helper while preserving its
  non-finite fallback semantics via `clampPct(..., 0, 1, 0)`.
- Repairs the Grit pattern so TypeScript return-typed helper declarations are
  caught.

Closure note:

- A temporary in-scope probe proved the repaired Grit pattern fails on
  `function clamp01(value: number): number`.
- Broader helper declarations under domain `rules/` folders remain excluded;
  that would be a separate positive-helper authority slice, not this
  source-validation repair.
