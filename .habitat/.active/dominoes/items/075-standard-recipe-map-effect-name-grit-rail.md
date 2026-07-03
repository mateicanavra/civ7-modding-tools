# Domino 075: Standard Recipe Map Effect Name Grit Rail

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Detail

#### Domino 75: Standard Recipe Map Effect Name Grit Rail

Status: closed on `codex/habitat-standard-recipe-map-effect-grit-rail`.

Purpose: replace a bespoke Habitat script for standard recipe map-effect suffix
validation with the native Grit source-check rail.

Disposition receipt:

| Rule id | Action | Receipt |
| --- | --- | --- |
| `require_standard_recipe_map_effect_name_suffixes` | Converted runner from Node script to packet-local Grit pattern; row is now live no-action source-check authority. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-standard-recipe-map-effect-name-grit-slice.md` |

Moves it forward:

- Applies the Grit/Nx/source-rail correction directly: static source literal
  naming belongs in Grit, not in package tests, not Nx, and not a custom MJS
  script.
- Preserves standard-recipe context authority without pretending this is a full
  dependency-tag or projection-surface positive authority.
- Removes one runtime/source-validation packet-needed row from the cascade.

Closure note:

- Current source passed with the Grit runner.
- A temporary `effect:map.landmassApplied` probe in `standard/tag-contracts.ts`
  failed the rule as expected and was removed.
