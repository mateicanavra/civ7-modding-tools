# Standard Tag Catalog Retired Token Garbage Collection

Status: closed on `codex/habitat-standard-tag-catalog-retired-token-gc`

## Purpose

Delete `prohibit_standard_tag_catalog_legacy_morphology_effect_gates` without
replacement. The rule guarded retired `landmassApplied` and `coastlinesApplied`
engine morphology effect-gate names inside the standard recipe tag catalog.

## Selected Row

| Rule id | Outcome |
| --- | --- |
| `prohibit_standard_tag_catalog_legacy_morphology_effect_gates` | Deleted without replacement. |

## Decision

The selected predicate is a retired-literal assertion. The current standard
tag catalog is already derived from the closed source constants in
`mods/mod-swooper-maps/src/recipes/standard/tag-contracts.ts`, and that source
does not expose `effect:engine.landmassApplied` or
`effect:engine.coastlinesApplied`.

Keeping this packet would preserve old migration vocabulary as live law. The
honest end state is deletion, not package-owned tests, not a replacement MJS
script, and not a new negative Habitat assertion.

## Exclusions

| Rule id | Reason |
| --- | --- |
| `prohibit_morphology_stage_legacy_effect_gates` | Retained. It is an existing morphology-stage recurrence guard over a concrete source scope. |
| `prohibit_migrated_consumer_effect_gating_tokens` | Retained. It guards a migrated map-consumer contract from retired gates in one known source scope. |
| `require_standard_recipe_map_effect_name_suffixes` | Retained. It is the positive-ish Grit rail for current `effect:map.*` suffix shape in `tag-contracts.ts`. |

## Verification

- Pre-delete `bun habitat check --rule prohibit_standard_tag_catalog_legacy_morphology_effect_gates --json`
- Source scan confirmed the retired engine morphology gates are absent from
  `standard/tags.ts`, `standard/tag-contracts.ts`, and live standard-recipe
  source outside Habitat rule packets.
- `bun habitat check --rule prohibit_morphology_stage_legacy_effect_gates --json`
- `bun habitat check --rule prohibit_migrated_consumer_effect_gating_tokens --json`
- `bun habitat check --rule require_standard_recipe_map_effect_name_suffixes --json`
- Deleted-id absence proof over live `.habitat/**/rule.json`
- Live manifest/current JSON/process ledger coverage reconciliation
- `bun habitat classify .habitat`
- `bun run --cwd tools/habitat analyze:execution-surface`
- `git diff --check`

## Record

The canonical operational record is
`.habitat/workstreams/rule-remediation-layer1-action-matrix.json`; this receipt
does not duplicate the action matrix.
