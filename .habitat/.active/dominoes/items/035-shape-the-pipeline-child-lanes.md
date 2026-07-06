# Domino 035: Shape The Pipeline Child Lanes

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Indexed Result

The direct parent `.habitat/civ7/mapgen/pipeline/rules/` rows were reviewed and physically sorted into child lanes: narrow runtime and contract source-surface rows moved to intentional child `rules/`, while broader runtime determinism/config, cutover, and config cleanup pressure moved to child `_remainder/`. No row stayed parent-pipeline authority, and no new blueprint, capability, admission, projection, import-law, package-graph, build, or runner authority was created.

## Detail

#### Domino 35 Disposition Receipt

This table is a receipt for physical lane shaping, not a second authority
surface. The parent `.habitat/civ7/mapgen/pipeline/rules/` lane is now empty.
Rows under child `rules/` lanes are intentional current child-jurisdiction
authority. `pipeline/contracts/rules` is a contract/public-source-surface
jurisdiction, not a physical category directory or a claim that manifest
`category: "contract"` owns tree shape. Rows under child `_remainder/` lanes
are reviewed but not final and use `placement.blueprint: "_remainder"` so
cleanup, split, or future-surface pressure does not masquerade as stable
pipeline authority.

Proof cells marked selected-rule proof passed mean
`bun tools/habitat/bin/dev.ts check --rule <id> --json` returned `ok: true`
and `status: "pass"` for that exact rule after the move. Path-reference proof
means each manifest-owned `runner.files` and `supportFiles.baseline` path exists
and points inside the row's physical lane.

| Rule id | Bucket | Target or retained context | Source evidence | Reason | Proof needed/run | Reusable lesson |
| --- | --- | --- | --- | --- | --- | --- |
| `prohibit_ambient_rng_in_authored_generation` | cleanup/consolidation/split pressure | `pipeline/runtime/_remainder` | `check.mjs` scans `mods/mod-swooper-maps/src/domain` and `mods/mod-swooper-maps/src/recipes/standard` for engine RNG, `Math.random`, official generator calls, and internal RNG imports. | The row points at deterministic authored-generation pressure, but it scans broad domain and standard recipe source and is not clean runtime-handler authority as written. | selected-rule Habitat script proof passed; path refs exist | Broad determinism guards should park as runtime debt until rewritten as positive deterministic-generation governance or split by owner. |
| `prohibit_runtime_calls_to_runvalidated` | child authority | `pipeline/runtime/rules` | `pattern.md` scans recipe step implementations and domain operation strategies for `runValidated` calls. | The whole rule protects runtime layers from compile/authoring validation calls across recipe-step and domain-operation implementation surfaces. | selected-rule Grit proof passed; path refs exist | Cross-kind runtime/compile separation belongs in a runtime child lane until a later projection surface is admitted. |
| `prohibit_runtime_local_config_default_merging` | cleanup/consolidation/split pressure | `pipeline/runtime/_remainder` | `pattern.md` scans recipe step and broad domain op source for `?? {}` and `Value.Default(...)`. | The intended boundary is runtime consuming normalized config, but the current scan is broad enough that it should not become stable runtime `rules` authority before the handler surface is narrowed or split. | selected-rule Grit proof passed; path refs exist | Borderline runtime/config rules should move out of parent pipeline but remain visual debt until their source surface is precise. |
| `prohibit_runtime_validation_and_compiler_imports` | child authority | `pipeline/runtime/rules` | `pattern.md` scans recipe step implementations and domain operation strategies for TypeBox runtime/compiler and MapGen compiler validation imports. | The whole rule protects runtime implementation source from validation/compiler dependencies across existing recipe and domain operation kinds. | selected-rule Grit proof passed; path refs exist | Import bans that enforce runtime/compile separation can be honest runtime child authority without creating an import-law surface. |
| `prohibit_bare_value_export_all_from_contract_surfaces` | child authority | `pipeline/contracts/rules` | `pattern.md` scans recipe step contracts plus domain operation contracts, types, indexes, rules, and strategies for bare value `export *`. | The whole rule governs public contract-source-surface export hygiene across recipe-step and domain-operation lanes; it is not owned by either blueprint alone and does not make `contract` a physical category. | selected-rule Grit proof passed; path refs exist | Contract/public-source-surface hygiene can use a child lane when it intentionally spans multiple constructible kinds. |
| `prohibit_empty_object_defaults_in_contract_schemas` | child authority | `pipeline/contracts/rules` | `pattern.md` scans domain operation contract files and recipe step contract files for `default: {}` schema definitions. | The whole rule governs contract schema source-surface hygiene across both operation and step contracts; it is stable child authority, not a category directory, runtime rule, or context cleanup. | selected-rule Grit proof passed; path refs exist | Shared contract-schema rules should not stay in parent pipeline once a contracts source-surface jurisdiction is visible. |
| `prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases` | cleanup/consolidation/split pressure | `pipeline/cutover/_remainder` | `check.mjs` scans domain, standard recipe, and maps source for shim, dual-path, comparison, compatibility, and legacy stage-token surfaces. | The whole rule is cutover cleanup debt spanning multiple source families; a cutover label is not stable child `rules` authority or blueprint ontology. | selected-rule Habitat script proof passed; path refs exist | Cleanup-phase labels should park in `_remainder`, not in child `rules`, unless source proves ongoing intentional authority. |
| `prohibit_ecology_fudge_terms_and_legacy_generator_surfaces` | cleanup/consolidation/split pressure | `pipeline/runtime/_remainder` | `pattern.md` scans ecology, hydrology plan-lakes, placement, and standard recipe planning surfaces for fudge terms, local RNG helpers, and legacy generator calls. | The row points at deterministic runtime/planning pressure, but it is scoped to mixed ecology/hydrology/placement pockets and should split or generalize before becoming runtime `rules` authority. | selected-rule Grit proof passed; path refs exist | Source-planning cleanup that overlaps runtime purity should remain visual debt until rewritten as positive deterministic-generation governance or split by owner. |
| `prohibit_wrapper_only_advanced_config` | cleanup/consolidation/split pressure | `pipeline/config/_remainder` | `pattern.md` scans standard recipe and map config source for wrapper-only `advanced` config keys. | The row is map/recipe config cleanup pressure, not stable parent-pipeline authority and not final config ontology; it needs a future public-config/map-config owner, split, or retirement. | selected-rule Grit proof passed; path refs exist | Config-token cleanup should be separated from parent pipeline without prematurely creating a config blueprint or admission surface. |
