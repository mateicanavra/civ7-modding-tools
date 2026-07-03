# Domino 029: Sort Direct Foundation Domain Rows

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Indexed Result

The remaining direct `prohibit_foundation_*` rows under parent `.habitat/civ7/mapgen/domains/rules/` were reviewed and physically sorted: two moved to `.habitat/civ7/mapgen/domains/foundation/rules/`, six moved to `.habitat/civ7/mapgen/domains/foundation/_remainder/`, none stayed parent-domain authority, and none moved to `domain` or `domain-operation`.

## Detail

#### Domino 29 Disposition Receipt

This table is a receipt for physical sorting, not a second authority surface.
Every direct `prohibit_foundation_*` row that started under parent
`.habitat/civ7/mapgen/domains/rules/` has now moved out of that parent lane.
Rows retained under `.habitat/civ7/mapgen/domains/foundation/rules/` are
intentional foundation-context authority. Rows moved under
`.habitat/civ7/mapgen/domains/foundation/_remainder/` use
`placement.blueprint: "_remainder"` and remain reviewed but not final.

| Rule id | Bucket | Target or retained context | Source evidence | Reason | Proof needed/run | Reusable lesson |
| --- | --- | --- | --- | --- | --- | --- |
| `prohibit_foundation_decomposed_ops_legacy_internal_imports` | honest foundation context | `foundation/rules` | `pattern.md` scans decomposed foundation tectonics operation directories for legacy `compute-tectonic-history` internal imports. | The rule protects foundation's specific decomposed-operation migration history; it is not parent `domain` or reusable `domain-operation` authority as a whole. | selected-rule Grit proof passed; path refs exist | Foundation-specific decomposition currentness can stay contextual when the row guards one concrete migration history. |
| `prohibit_foundation_legacy_aggregate_tectonic_op_surface` | honest foundation context | `foundation/rules` | `pattern.md` scans foundation `ops/contracts.ts` and `ops/index.ts` for the retired aggregate tectonic-history op surface. | The rule is a foundation op-registry companion to the existing aggregate-history context guard, not a domain-wide contract. | selected-rule Grit proof passed; path refs exist | A concrete context can own sharper companion guards around its retired public surfaces. |
| `prohibit_foundation_duplicate_math_helper_redefinitions` | cleanup/consolidation/split pressure | `foundation/_remainder` | `pattern.md` scans selected foundation operation strategies, indexes, and projection helpers for duplicated clamp/math helper declarations. | The row is helper-surface consolidation pressure around canonical foundation math helpers, not final context authority or operation-kind law. | selected-rule Grit proof passed; path refs exist | Helper consolidation rows should defer until the positive helper/import surface is named. |
| `prohibit_foundation_rules_tectonics_shim_reexports` | cleanup/consolidation/split pressure | `foundation/_remainder` | `pattern.md` scans decomposed foundation operation `rules/**/*.ts` for shared `lib/tectonics` re-export shims. | This is a stronger rules-index shim cleanup row overlapping existing foundation `_remainder`; moving it to `domain-operation` would promote operation-internal path grammar. | selected-rule Grit proof passed; path refs exist | Stronger duplicate rows can move to `_remainder` without pretending the final consolidation happened. |
| `prohibit_foundation_stage_cast_merge_hacks` | cleanup/consolidation/split pressure | `foundation/_remainder` | `pattern.md` scans standard-recipe foundation stage indexes for wrapper-era cast/merge fallback fragments. | The row is foundation stage cleanup and overlaps existing advanced-cast remainder pressure; it does not govern valid domains or operations generally. | selected-rule Grit proof passed; path refs exist | Recipe-stage cleanup tied to one concrete domain should not stay in parent domain rules. |
| `prohibit_foundation_stage_sentinel_passthrough` | cleanup/consolidation/split pressure | `foundation/_remainder` | `pattern.md` scans standard-recipe foundation stage indexes for retired Studio sentinel passthrough tokens. | The row is a subset of stage cleanup pressure and has no final owner until recipe-stage/studio projection cleanup is addressed. | selected-rule Grit proof passed; path refs exist | Sentinel/studio passthrough rows are projection cleanup pressure, not domain authority by label. |
| `prohibit_foundation_strategy_nonlocal_imports` | cleanup/consolidation/split pressure | `foundation/_remainder` | `pattern.md` scans decomposed foundation operation strategies for imports outside authoring, local contract, and local rules. | Strategy locality is operation-internal pressure, but this foundation-specific row cannot become `domain-operation` without admitting `operation-strategy` or a positive import-law surface. | selected-rule Grit proof passed; path refs exist | Strategy-file locality rows remain `_remainder` unless source proves whole-rule operation-kind authority. |
| `prohibit_foundation_strategy_shared_tectonics_lib_imports` | cleanup/consolidation/split pressure | `foundation/_remainder` | `pattern.md` scans decomposed foundation operation strategies for direct shared `lib/tectonics` imports. | This is a narrower strategy shim cleanup row overlapped by the nonlocal-import rule and existing strategy-shim remainder pressure. | selected-rule Grit proof passed; path refs exist | Duplicate strategy shim guards should sort physically before later consolidation or retirement. |
