# Domino 030: Sort Remaining Direct Domains-Lane Rows

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Indexed Result

The remaining direct rows under parent `.habitat/civ7/mapgen/domains/rules/` were reviewed and physically sorted: one moved to affirmed `domain-operation`, three hydrology rows moved to `.habitat/civ7/mapgen/domains/hydrology/_remainder/`, one mixed morphology/config validator moved to `.habitat/civ7/mapgen/domains/morphology/_remainder/`, and the retired narrative-swatches stage-token row moved out of the domains lane to the standard-recipe context. No row stayed under parent `domains/rules`.

## Detail

#### Domino 30 Disposition Receipt

This table is a receipt for physical sorting, not a second authority surface.
Every direct row that started under parent
`.habitat/civ7/mapgen/domains/rules/` has now moved out of that parent lane.
Rows moved under `_remainder/` use `placement.blueprint: "_remainder"` and are
reviewed but not final. The standard-recipe row intentionally left the domains
lane because its whole rule meaning is recipe topology cleanup, not narrative
domain authority.

Domino 31 supersedes the two hydrology rows in this receipt that were first
parked under `hydrology/_remainder`: after the hydrology re-read,
`prohibit_hydrology_climate_intervention_tokens` and
`prohibit_hydrology_narrative_domain_imports` moved to `hydrology/rules` as
honest hydrology context authority. Keep this table as the Domino 30
parent-lane sorting receipt, not as the current hydrology final state.

| Rule id | Bucket | Target or retained context | Source evidence | Reason | Proof needed/run | Reusable lesson |
| --- | --- | --- | --- | --- | --- | --- |
| `prohibit_rng_callback_state_in_ops` | existing blueprint authority | `blueprints/domain-operation` | `pattern.md` scans `mods/mod-swooper-maps/src/domain/*/ops/**/*.ts`; hydrology operation contracts document RNG crossing the op boundary as `rngSeed` data. | The whole rule governs valid domain operations generally: domain ops should reject ambient RNG callback/state surfaces. | selected-rule Grit proof passed; path refs exist | Cross-domain operation runtime discipline should move to `domain-operation` when the predicate applies to every operation module. |
| `prohibit_hydrology_climate_intervention_tokens` | external enforcement-surface pressure | `hydrology/_remainder` | `pattern.md` scans `src/domain/hydrology` plus standard recipe hydrology stages for `climate.swatches` and `climate.story`. | The row is a hydrology-plus-stage narrative intervention boundary guard; it is not parent domains authority and does not fit `domain-operation` because it also governs stage files. | selected-rule Grit proof passed; path refs exist | Hydrology rows that mix domain source and recipe stage source should defer until the hydrology context or recipe-stage owner is clearer. |
| `prohibit_hydrology_map_config_key_tokens` | cleanup/consolidation/split pressure | `hydrology/_remainder` | `pattern.md` scans map config source for retired hydrology climate, lakes, and rivers config keys. | The row is retired hydrology map-config cleanup, not parent domains authority or a `domain` kind contract as written. | selected-rule Grit proof passed; path refs exist | Retired map config key forbids should not remain parent-domain authority merely because the keys are domain-shaped. |
| `prohibit_hydrology_narrative_domain_imports` | missing positive kind governance | `hydrology/_remainder` | `pattern.md` scans hydrology domain and hydrology stage files for imports from `@mapgen/domain/narrative/*`. | The likely durable invariant is a positive public-surface/import boundary, but the current predicate is a narrow hydrology-to-narrative negative proxy. | selected-rule Grit proof passed; path refs exist | Cross-context import forbids should defer unless the whole rule can move to an affirmed import-law or public-surface owner. |
| `prohibit_narrative_swatches_stage_token` | honest standard-recipe context | `pipeline/swooper-maps-standard-recipe/rules` | `pattern.md` scans standard recipe source, maps, and tests for the retired `narrative-swatches` stage token. | The row governs current standard recipe topology cleanup; it should not create a narrative child context or stay in parent domains merely because the retired token includes `narrative`. | selected-rule Grit proof passed; path refs exist | Token labels are not owners; when a retired token belongs to recipe topology, move the row to recipe context even if it came from a domain lane. |
| `require_owned_domain_config_catalog_surfaces` | cleanup/consolidation/split pressure | `morphology/_remainder` | `check.mjs` verifies exact `src/domain/morphology/config.ts` facade exports and standard recipe tag-catalog tokens. | The rule mixes morphology config-facade currentness with standard recipe tag-catalog currentness, so no parent-domain or affirmed blueprint owner truthfully owns the whole predicate. | selected-rule Habitat script proof passed; path refs exist | Positive residual validators can still be `_remainder` when they mix two owners and should split later. |
