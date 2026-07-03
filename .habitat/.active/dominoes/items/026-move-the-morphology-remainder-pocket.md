# Domino 026: Move the Morphology Remainder Pocket

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Indexed Result

All twelve morphology-domain primary rows were reviewed and physically moved to `.habitat/civ7/mapgen/domains/morphology/_remainder/`; their manifests now mark `placement.blueprint` as `_remainder`, none fit `domain` or `domain-operation` as whole-rule authority, and none remained honest intentional `morphology/rules` authority.

## Detail

#### Domino 26 Disposition Receipt

This table is a receipt for physical sorting, not a second authority surface.
Every row below now lives under
`.habitat/civ7/mapgen/domains/morphology/_remainder/` and uses
`placement.blueprint: "_remainder"` so the manifest does not continue claiming
`morphology-domain` as blueprint authority.

| Rule id | Bucket | Target or retained context | Source evidence | Reason | Proof needed/run | Reusable lesson |
| --- | --- | --- | --- | --- | --- | --- |
| `preserve_morphology_contracts_and_overlay_ownership` | cleanup/consolidation/split pressure | `morphology/_remainder` | `check.mjs` checks morphology recipe contracts plus global HOTSPOTS publisher ownership. | The rule mixes recipe-stage contract assertions with narrative overlay ownership; it is not whole-rule `domain`, `domain-operation`, or honest morphology-domain context authority. | selected-rule Habitat script proof passed; path refs exist | Mixed contract-plus-owner guards should move to `_remainder` until split or projected. |
| `prohibit_legacy_morphology_config_keys` | cleanup/consolidation/retirement pressure | `morphology/_remainder` | `pattern.md` scans `src/maps/**` and `test/standard-run.test.ts` for retired config keys. | This is map/test legacy-token cleanup, not morphology-domain constructible authority. | selected-rule Grit proof passed; path refs exist | Retired map/test config tokens are cleanup pressure, not concrete-domain context authority. |
| `prohibit_legacy_morphology_effect_gating_tokens` | cleanup/consolidation/retirement pressure | `morphology/_remainder` | `pattern.md` scans standard recipe morphology stages and `tags.ts`. | The rule protects a standard-recipe cutover surface from retired effect gates; it does not govern valid domains or operations generally. | selected-rule Grit proof passed; path refs exist | Recipe-stage effect-gate cleanup should not remain in a concrete-domain context lane. |
| `prohibit_legacy_morphology_module_imports` | missing positive kind governance | `morphology/_remainder` | `pattern.md` scans all mod source for retired `@mapgen/domain/morphology/<legacy>` import paths. | The real invariant is a positive domain public-surface/import contract; the current rule is morphology-specific retired-path cleanup. | selected-rule Grit proof passed; path refs exist | Retired-path forbids can point to a future positive public-surface rule without being admitted as-is. |
| `prohibit_legacy_plate_driver_and_plot_mountains_dependencies` | cleanup/consolidation/split pressure | `morphology/_remainder` | `pattern.md` scans exact standard recipe contract and map-morphology step files. | The rule combines recipe contract dependencies and one plot-mountains implementation cleanup row, so no affirmed blueprint owns the whole predicate. | selected-rule Grit proof passed; path refs exist | Exact recipe callsite cleanup should defer until recipe-step or projection ownership is clearer. |
| `prohibit_morphology_dual_read_tokens` | cleanup/consolidation/retirement pressure | `morphology/_remainder` | `pattern.md` scans morphology-coasts recipe step files for dual-read tokens. | This is a transitional dual-read cleanup guard for one recipe-stage pocket, not morphology-domain authority. | selected-rule Grit proof passed; path refs exist | Dual-read migration guards belong in `_remainder` after review unless the owning migration surface exists. |
| `prohibit_morphology_hotspot_overlay_publishers` | external enforcement-surface pressure | `morphology/_remainder` | `pattern.md` scans morphology recipe stages; narrative source owns HOTSPOTS publishing. | The real ownership boundary is narrative/story-overlay publication versus morphology stage code, not `domain` or `domain-operation`. | selected-rule Grit proof passed; path refs exist | Cross-owner overlay publication rules need a future narrative/overlay or recipe-stage boundary owner. |
| `prohibit_morphology_overlay_implementation_reads` | missing positive kind governance | `morphology/_remainder` | `pattern.md` scans morphology recipe step implementations and exempts contracts. | The likely invariant is recipe-step implementation/contract separation, not morphology-domain ownership. | selected-rule Grit proof passed; path refs exist | Step implementation reads are better treated as missing recipe-step governance than domain context. |
| `prohibit_morphology_stage_config_bag_imports` | missing positive kind governance | `morphology/_remainder` | `pattern.md` scans morphology recipe stage files for `@mapgen/domain/config`. | The likely invariant is consumer-side domain config facade usage, but this rule is morphology-stage-scoped and too narrow to move as `domain`. | selected-rule Grit proof passed; path refs exist | Narrow consumer config-bag forbids should defer until the positive consumer contract is named. |
| `prohibit_morphology_story_overlay_contract_artifact` | external enforcement-surface pressure | `morphology/_remainder` | `pattern.md` scans morphology recipe step contracts for story overlay artifact dependencies. | The real boundary is story overlay ownership versus recipe-step contract dependencies; no affirmed domain blueprint owns the whole rule. | selected-rule Grit proof passed; path refs exist | Story/narrative artifact boundaries should not be hidden under concrete-domain labels. |
| `prohibit_runtime_continent_contract_tokens` | missing positive kind governance | `morphology/_remainder` | `pattern.md` scans morphology recipe contract/artifact files for runtime continent identifiers. | The rule is a negative proxy for recipe-step contract-vs-runtime artifact separation. | selected-rule Grit proof passed; path refs exist | Runtime-token forbids in contracts should become positive contract-surface rules later. |
| `prohibit_runtime_continent_step_tokens` | cleanup/consolidation/split pressure | `morphology/_remainder` | `pattern.md` scans morphology and hydrology recipe implementation files. | The rule is mixed across morphology and hydrology implementation cleanup, so it cannot remain honest morphology-domain context authority. | selected-rule Grit proof passed; path refs exist | Cross-domain implementation cleanup should move to `_remainder` unless split into true owners. |
