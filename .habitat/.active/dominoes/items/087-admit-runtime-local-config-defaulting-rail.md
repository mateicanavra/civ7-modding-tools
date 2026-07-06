# Domino 087: Admit Runtime Local Config Defaulting Rail

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Detail

#### Domino 87: Admit Runtime Local Config Defaulting Rail

Status: closed on `codex/habitat-runtime-local-config-defaulting-rail`.

Purpose: resolve `prohibit_runtime_local_config_default_merging` without turning
runtime config/defaulting authority into package tests, a broad config
blueprint, or a custom script.

Disposition receipt:

| Rule id | Action | Receipt |
| --- | --- | --- |
| `prohibit_runtime_local_config_default_merging` | Moved from runtime `_remainder` to runtime `rules/` as live Grit source authority. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-runtime-local-config-defaulting-rail.md` |

Moves it forward:

- Removes one runtime/source-validation packet-needed row.
- Keeps static source-shape recurrence protection in Habitat/Grit.
- Preserves the compile/runtime boundary: stage compile helpers may translate
  public config into explicit runtime config; runtime steps and domain ops must
  not hide normalization behind local `?? {}` or `Value.Default(...)`.

Closure note:

- Focused Habitat check passed after the move.
- A temporary in-scope `args ?? {}` probe failed the rule and was removed.
- No package-owned tests or replacement MJS script were introduced.
