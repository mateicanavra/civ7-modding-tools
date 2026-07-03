# Domino 032: Sort the Ecology Context Pocket

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Indexed Result

The ecology context pocket was re-read against `domain`, `domain-operation`, and recipe-stage authority: two rows stayed under `.habitat/civ7/mapgen/domains/ecology/rules/` as honest ecology context authority, while the ecology op-contract quality validator moved to `.habitat/civ7/mapgen/domains/ecology/_remainder/` as missing positive domain-operation quality governance and stale context cleanup pressure.

## Detail

#### Domino 32 Disposition Receipt

This table is a receipt for physical sorting, not a second authority surface.
Rows retained under `.habitat/civ7/mapgen/domains/ecology/rules/` are
intentional ecology-context authority. Rows moved under
`.habitat/civ7/mapgen/domains/ecology/_remainder/` use
`placement.blueprint: "_remainder"` and are reviewed but not final.

| Rule id | Bucket | Target or retained context | Source evidence | Reason | Proof needed/run | Reusable lesson |
| --- | --- | --- | --- | --- | --- | --- |
| `require_ecology_canonical_op_module_topology` | honest ecology context | `ecology/rules` | `structure.toml` checks ecology op module roots, ecology op `rules/index.ts` where `rules/` exists, and ecology op `strategies/index.ts`; current non-ecology domains have different helper and strategy shapes. | The row is operation-shaped evidence, but the executable rule is ecology-specific and exempts ecology-specific support material. Moving it to `domain-operation` now would turn an exemplar into global law before other domains satisfy the same anatomy. | selected-rule Habitat structure proof passed; path refs exist | Exemplar topology checks can stay contextual until a positive kind rule is implemented generally. |
| `require_public_ecology_surfaces_and_retired_topology_removal` | honest ecology context | `ecology/rules` | `pattern.md` checks active ecology recipe stages for direct ecology ops/rules imports and checks retired ecology stage directories stay empty. | The public-surface half overlaps domain boundary pressure, but the whole row is ecology-stage-specific and includes retired ecology topology cleanup. It is not truthful as a `domain`, `recipe-stage`, or `domain-operation` blueprint rule. | selected-rule Grit proof passed; path refs exist | Mixed public-surface plus retired-context cleanup can remain context authority when it protects one concrete migration state. |
| `validate_ecology_op_contract_quality` | missing positive kind governance and cleanup pressure | `ecology/_remainder` | `check.sh` delegates to `mods/mod-swooper-maps/scripts/validate-ecology-op-contract-quality.ts`, which checks ecology op schema descriptions and exported-function JSDoc plus a stale `recipes/standard/stages/ecology/steps` root. | The real invariant is positive domain-operation contract-quality governance, but the current implementation is ecology-only and includes stale path coverage. Keeping it in `ecology/rules` would hide generic quality pressure under a concrete context; moving it to `domain-operation` would over-generalize. | selected-rule Habitat script proof passed; path refs exist | Positive quality validators should move to `_remainder` when they point at a missing kind rule but are not implemented generally yet. |
