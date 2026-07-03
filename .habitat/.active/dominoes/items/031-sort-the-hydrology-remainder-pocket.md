# Domino 031: Sort the Hydrology Remainder Pocket

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Indexed Result

The hydrology remainder was re-read after the domains-lane sort: two narrative/hydrology boundary rows moved to `.habitat/civ7/mapgen/domains/hydrology/rules/` as honest hydrology context authority, while the map-config key row stayed under `.habitat/civ7/mapgen/domains/hydrology/_remainder/` as map-authoring/public-config cleanup pressure needing a later owner or split.

## Detail

#### Domino 31 Disposition Receipt

This table is a receipt for physical sorting, not a second authority surface.
The hydrology pocket now distinguishes intentional hydrology context authority
from deferred map-authoring/public-config pressure. Rows under
`.habitat/civ7/mapgen/domains/hydrology/rules/` use
`placement.blueprint: "_self"` and remain concrete hydrology context rules.
The remaining row under `.habitat/civ7/mapgen/domains/hydrology/_remainder/`
uses `placement.blueprint: "_remainder"` and is reviewed but not final.

| Rule id | Bucket | Target or retained context | Source evidence | Reason | Proof needed/run | Reusable lesson |
| --- | --- | --- | --- | --- | --- | --- |
| `prohibit_hydrology_climate_intervention_tokens` | honest hydrology context | `hydrology/rules` | `pattern.md` scans `src/domain/hydrology` plus standard hydrology stages for `climate.swatches` and `climate.story`; hydrology stage contracts publish deterministic climate/hydrography artifacts rather than narrative interventions. | The whole rule is hydrology-specific narrative-boundary currentness. It does not fit `domain`, `domain-operation`, or `recipe-stage` as a universal rule, but leaving it in `_remainder` would hide intentional hydrology context authority. | selected-rule Grit proof passed; path refs exist | Mixed domain-plus-stage scans can still be honest context when the entire predicate protects one concrete context boundary. |
| `prohibit_hydrology_narrative_domain_imports` | honest hydrology context | `hydrology/rules` | `pattern.md` scans hydrology domain and hydrology stage files for imports from `@mapgen/domain/narrative/*`; current hydrology stage contracts import hydrology and adjacent stage artifacts, not narrative internals. | The whole rule protects hydrology from narrative-domain coupling. Existing domain public-surface rules do not own this hydrology-to-narrative boundary, and promoting it to a blueprint would over-generalize. | selected-rule Grit proof passed; path refs exist | Cross-context import forbids may remain honest context when no affirmed import-law/public-surface owner exists and the rule is intentionally concrete. |
| `prohibit_hydrology_map_config_key_tokens` | cleanup/consolidation/split pressure | `hydrology/_remainder` | `pattern.md` scans `src/maps/**/*.ts` for retired hydrology climate, lakes, and rivers config keys; source shows `lakes`, `rivers`, `climate-baseline`, and `climate-refine` are legitimate stage/public-config vocabulary outside the map-source scan shape. | The row is not hydrology context authority as a whole; it guards map-authoring/config text and likely needs a future public-config/map-config owner, split, or retirement. Moving it to `domain`, `recipe-stage`, or `hydrology/rules` would preserve the wrong owner. | selected-rule Grit proof passed; path refs exist | Map-config token cleanup should not be hidden under concrete-domain context after review unless the map/public-config owner is explicit. |
