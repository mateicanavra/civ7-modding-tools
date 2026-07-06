# Domino 036: Gather the Mod-Map Blueprint Kind

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Indexed Result

`mod-map` was affirmed as the map-producing mod variant kind, with Swooper Maps as the current concrete instance. Generated entrypoint and shipped catalog rows moved to `.habitat/blueprints/mod-map/`; projection and placement rows moved to `.habitat/civ7/mapgen/map-output/_remainder/` instead of becoming sibling blueprints by label affinity.

## Detail

#### Domino 36 Disposition Receipt

This table is a receipt for affirming one blueprint kind and draining the
inspected map-output `_blueprints` pocket. `mod-map` is the affirmed
map-producing mod variant kind; Swooper Maps is the current concrete instance.
Rows under `.habitat/blueprints/mod-map/` are gathered blueprint authority
whose current runners still hard-code the Swooper instance until future
instance-anchor parameterization exists. Rows under
`.habitat/civ7/mapgen/map-output/_remainder/` are reviewed but not final; they
use `placement.blueprint: "_remainder"` and should not be read as accepted
`map-projection` or `placement-outcome` blueprints.

| Rule id | Bucket | Target or retained context | Source evidence | Reason | Proof needed/run | Reusable lesson |
| --- | --- | --- | --- | --- | --- | --- |
| `protect_generated_map_entrypoints_from_hand_edits` | affirmed blueprint authority | `blueprints/mod-map` | `rule.json` protects `mods/mod-swooper-maps/src/maps/generated/**`; generated map entrypoints are emitted from canonical map configs. | Generated map entrypoints are part of the constructible mod-map output bundle. The current rule is Swooper-rooted, but the invariant belongs to every valid generated-entrypoint map mod instance. | selected-rule proof passed; path refs exist | Generated-file guards can become blueprint authority when the files are required outputs of the constructible kind. |
| `validate_generated_map_entrypoint_contracts` | affirmed blueprint authority | `blueprints/mod-map` | `check.ts` compares config ids, generated ids, canonical envelopes, hashes, and `createMap` config shape against `src/maps/configs/**`, `src/maps/generated/**`, and standard recipe artifacts. | The whole rule governs the mod-map generated entrypoint contract between authored map configs and shipped map entry modules. It is not a standalone `generated-map-entrypoint` blueprint. | selected-rule proof passed; path refs exist | Instance-hard-coded validators may be gathered into a blueprint when the current instance is the only parameterization gap. |
| `block_studio_config_leakage_into_shipped_catalog` | affirmed blueprint authority | `blueprints/mod-map` | `check.ts` scans `mod/config/config.xml`, `mod/swooper-maps.modinfo`, and `mod/text/en_us/MapText.xml` for transient Studio config ids. | Shipped catalog metadata is a mod-map ship surface; the row is narrow negative governance, not a complete `shipped-map-catalog` blueprint. | selected-rule proof passed; path refs exist | A narrow guard can belong to the larger constructible kind without promoting the guard's old folder label. |
| `preserve_physics_to_map_projection_contracts` | projection/contract remainder | `map-output/_remainder` | `check.mjs` scans recipe stage contracts, mod source, mapgen-core source, and tag contracts for map projection contract leakage and effect naming. | The whole rule governs physics-to-map projection seams and recipe contract pressure, not the mod-map shell or generated/shipped output bundle. | selected-rule proof passed; path refs exist | Projection contract pressure should not become mod-map authority merely because its artifacts are map-shaped. |
| `prohibit_misplaced_projection_adapter_calls` | projection/recipe-step remainder | `map-output/_remainder` | `pattern.md` hard-codes standard recipe stage paths and allowed projection adapter callsites. | The rule is exact recipe projection callsite ownership; future owner may be recipe-step, projection authority, or split work, but not mod-map as written. | selected-rule proof passed; path refs exist | Adapter-call locality is not a blueprint by label; exact recipe-stage paths usually signal remainder until a positive owner exists. |
| `require_projection_calls_in_projection_steps` | projection/recipe-step remainder | `map-output/_remainder` | `check.mjs` asserts exact buildElevation, lakes, plotRivers, and plotRivers contract tokens. | The whole rule verifies specific projection step implementation and contract content, not every mod-map instance. | selected-rule proof passed; path refs exist | Required callsite validators stay out of a broader kind until parameterized by the owning step or projection surface. |
| `require_typed_placement_outcomes_before_apply` | placement-outcome remainder | `map-output/_remainder` | `pattern.md` targets one standard recipe placement apply file for direct official generator calls. | The rule is placement-step typed-outcome pressure; `placement-outcome` was not affirmed as a blueprint, and the row is not mod-map authority. | selected-rule proof passed; path refs exist | Typed outcome boundaries can be real pressure without earning a new blueprint in the current slice. |
