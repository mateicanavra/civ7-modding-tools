# Domino 090: Delete Standard Tag Catalog Retired Effect-Gate Guard

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Detail

#### Domino 90: Delete Standard Tag Catalog Retired Effect-Gate Guard

Status: closed on `codex/habitat-standard-tag-catalog-retired-token-gc`.

Purpose: remove `prohibit_standard_tag_catalog_legacy_morphology_effect_gates`
as retired migration vocabulary rather than preserving old effect-gate names as
live Habitat law.

Disposition receipt:

| Rule id | Action | Receipt |
| --- | --- | --- |
| `prohibit_standard_tag_catalog_legacy_morphology_effect_gates` | Deleted without replacement. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-standard-tag-catalog-retired-token-gc.md` |

Moves it forward:

- Removes one stale positive-authority/deletion-pair row from the canonical
  remediation JSON.
- Applies the retired-literal state-collapse rule: the current tag catalog is
  constructible from closed source constants, so old `landmassApplied` and
  `coastlinesApplied` catalog names do not need a replacement negative rule.
- Keeps adjacent live recurrence guards separate: morphology-stage legacy
  effect gates and migrated map-consumer effect gates remain in their own
  honest source scopes.

Closure note:

- No package-owned tests, replacement MJS scripts, or new Habitat negative
  assertions were introduced.
- Focused checks for the retained adjacent rules passed after deletion.
