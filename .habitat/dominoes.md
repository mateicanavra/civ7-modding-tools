# Habitat Dominoes

Status: active sequence ledger for Habitat authority activation

This document records the next reviewable domino sequence for the Habitat
authority tree. It is governed by `.habitat/DOMINO-FRAME.md`; this ledger is
the execution-facing companion, not a replacement frame or exhaustive backlog.

## Status And Source Order

Use this source order when selecting or judging the next domino:

1. Direct user decisions and current repo instructions.
2. `.habitat/DOMINO-FRAME.md`.
3. `.habitat/AUTHORITY-ONTOLOGY.md` for blueprint, instance, capability, and
   niche concepts.
4. `.habitat/AUTHORITY-SLICE-FRAME.md` for bounded slice work.
5. `.habitat/AUTHORITY-REMAINDER-SLICE-FRAME.md` for contextual remainder
   slices after parent kinds have moved.
6. `.habitat/AUTHORITY-AUTONOMOUS-DOMINO-LOOP.md` for repeated bounded
   dominoes whose destinations already exist.
7. `.habitat/frames/*.md` for reusable method frames selected by the current
   domino.
8. `.habitat/AUTHORITY.md`, `.habitat/AUTHORITY-TREE-SHAPE.md`,
   `.habitat/AUTHORITY-TOOL-SEPARATION.md`, `.habitat/RULE-OPERATION-KINDS.md`, and
   `.habitat/SUBJECT-CATEGORIES.md`.
9. Completed slice frames such as `.habitat/AUTHORITY-DOMAIN-KIND-SLICE.md`
   as precedent and evidence, not as the next active selector.
10. Current `.habitat` tree shape, generic packet role files, Toolkit behavior,
   and fresh command evidence.
11. Historical branch, PR, and session context as discovery material only.

The center of gravity has moved. Package-script cleanup is not the active
driver anymore. Source-check retirement and mixed command-check extraction are
landed enough to stop driving the plan. The full-suite runner rebuild moves
later, after admitted authority exists and can project into execution.

The next regime is not another cleanup pass and not a broad corpus snapshot.
The authority model should now advance through bounded kind-family slices: pick
one known dependency pocket, move its rules toward the correct blueprint or
coarse remainder context, then re-read the changed structure before selecting
the next slice.

## Target Regime: Authority Activation

Authority Activation is the next whole regime for Habitat.

In this regime:

- Blueprint authority defines a constructible kind and the facts required to
  admit instances of that kind.
- Instance facts are declared by the instance, not inferred from runner history
  or packet path convenience.
- Capabilities attach to admitted instances when the blueprint allows them and
  the instance facts satisfy their requirements.
- Niches govern admission by accepted facts instead of acting only as folder
  jurisdictions.
- Execution tools are projections of admitted authority. They are adapters and
  evidence rails, not ontology sources.
- Transitional `rule.json` routing metadata either serves the migrated slice
  temporarily or gets pruned when admitted authority makes it redundant.

The destination is meaningfully different from the current tree: an agent can
start with one admitted instance, know its blueprint, capabilities, niche
admission basis, and narrow execution projection, and then author or inspect the
slice without reverse-engineering the old packet registry.

That destination is not a final global schema. It is a series of bounded
state-changing slices that teach the next slice what the current tree could not
teach before movement.

## Domino Selection Rule

Choose the largest bounded vertical slice that makes the next largest slice
more mechanical.

A good domino must do at least one of these:

- admit a concept into the authority model;
- move a fact from transitional metadata into its owning authority surface;
- delete, demote, or fence a misleading bridge;
- create a narrow projection adapter for admitted authority;
- provide proof that falsifies or validates the next ordering decision.

A scan, ledger, or design note only counts when it enables one of those moves
inside the same branch or explicitly proves that the branch must stop before
implementation.

Avoid horizontal cleanup unless it is necessary for the active bounded slice.
Avoid runner rebuilding until admitted authority exists for it to discover.

## Completed Domino Index

| Domino | Result |
| --- | --- |
| 1. Recover normative frame | Habitat was re-centered as the authority tree for repo structure and policy. |
| 2. Gather authority content | Scattered rule-like assets were gathered under `.habitat` while non-Habitat runtime workflows stayed with their consumers. |
| 3. Co-locate rule packets by subject | Rule records, patterns, baselines, and same-subject scripts were grouped into transition packets. |
| 4. Establish shallow niche jurisdictions | Packets moved under durable jurisdiction paths instead of runner, file-type, or defect labels. |
| 5. Normalize packet filenames | Rule packet files received consistent dot-pattern names for legibility. |
| 6. Separate mutating operations from checks | Read-only checks, repair operations, and generate operations stopped sharing one execution meaning. |
| 7. Migrate first MapGen static guardrails | Clear static architecture checks moved into Habitat-owned transitional packets. |
| 8. Define operation kinds | Check, fix, generate, and migrate were recorded as mutability and execution intent kinds. |
| 9. Define authority tree shape | The current transitional niche, blueprint, category, kind, and packet path was documented. |
| 10. Flatten and correct the tree | Layer buckets collapsed into the current visible authority-tree projection. |
| 11. Bridge selected package callers | Curated selected-rule execution proved package callers can route through Habitat without direct `.habitat` script paths. |
| 12. Retire source-check as a driver | Source-check-shaped work was moved or demoted enough that it no longer owns the next plan. |
| 13. Extract mixed command checks | Mixed command-check packets were split enough to prove proof-class separation and stop treating the junk drawer as the center. |
| 14. Close triage/residual owner cleanup | Triage packets and residual owners were removed, moved, or retained honestly enough to expose the ontology problem. |
| 15. Polish authority ontology and frame | The ontology and operating frame now name Habitat, blueprint, instance, capability, niche, and proof-class separation as the governing model. |
| 16. Normalize packet role metadata | Child files use generic role names, `rule.json` stopped carrying owner-tool/detect/scope duplication, and packet `category.md` files are gone. |
| 17. Make rule manifests location independent | `rule.json` now owns stable rule identity, current placement inventory facts, explicit runner file references, and explicit support file references; Toolkit discovery no longer depends on the packet path grammar. |
| 18. Frame bounded authority slice work | `AUTHORITY-SLICE-FRAME.md` now governs bounded kind-family slices, supersedes broad pilot-corpus selection, and sets the Recipe Kind Pocket as the first working example. |
| 19. Move the Recipe Kind Pocket | Standard-recipe evidence was physically moved into `recipe`, `recipe-stage`, `recipe-step`, `swooper-maps-standard-recipe`, and coarse `mapgen-pipeline` contexts while preserving rule IDs and execution behavior. |
| 20. Select the Domain Operation Kind Pocket | Re-reading the changed Recipe slice selected `domain-operation` and bounded strategy-file pressure as the next slice; `AUTHORITY-DOMAIN-OPERATION-SLICE.md` now specifies the implementation boundary. |
| 21. Move the Domain Operation Kind Pocket | The misplaced map projection/effect dependency guard moved into `domain-operation`; foundation strategy rows stayed contextual with consolidation pressure instead of becoming blueprints by path inheritance. |
| 22. Unnest Rule Packet Paths | Category and operation-kind directories were removed from live packet paths, leaving location-independent manifests in flatter blueprint/context lanes. |
| 23. Split Affirmed Blueprints From Candidates | Affirmed Recipe and Domain Operation pockets moved to top-level `.habitat/blueprints/`; not-yet-affirmed niche-local blueprint-shaped inventories were renamed `_blueprints/` so they no longer visually claim blueprint authority. |
| 24. Move the Domain Kind Pocket | Domain public-surface and direct domain-root rules moved into affirmed `.habitat/blueprints/domain/`; the mixed config validator stayed contextual, and the standard-recipe tag cleanup moved to the standard-recipe context instead of becoming domain authority. |
| 25. Frame contextual remainder slices | `AUTHORITY-REMAINDER-SLICE-FRAME.md` now governs how to reassess concrete-context remainders after parent kinds have moved, with morphology selected as the first method seed. |
| 26. Move the Morphology Remainder Pocket | All twelve morphology-domain primary rows were reviewed and physically moved to `.habitat/civ7/mapgen/domains/morphology/_remainder/`; their manifests now mark `placement.blueprint` as `_remainder`, none fit `domain` or `domain-operation` as whole-rule authority, and none remained honest intentional `morphology/rules` authority. |
| 27. Move the Foundation Remainder Pocket | The foundation-domain pocket was reviewed against `domain` and `domain-operation`; six rules stayed as intentional foundation currentness or retired-token context, six rules moved to `.habitat/civ7/mapgen/domains/foundation/_remainder/`, and no foundation label, strategy-file row, or legacy cleanup row was promoted into blueprint authority. |
| 28. Normalize Niche Child Context Lanes | Concrete domain contexts now live as child niches under `.habitat/civ7/mapgen/domains/`: `foundation/rules`, `foundation/_remainder`, `morphology/_remainder`, and `ecology/rules`. The move removes context directories from under `rules/` or root `_remainder/` without changing rule identity or behavior. |
| 29. Sort Direct Foundation Domain Rows | The remaining direct `prohibit_foundation_*` rows under parent `.habitat/civ7/mapgen/domains/rules/` were reviewed and physically sorted: two moved to `.habitat/civ7/mapgen/domains/foundation/rules/`, six moved to `.habitat/civ7/mapgen/domains/foundation/_remainder/`, none stayed parent-domain authority, and none moved to `domain` or `domain-operation`. |
| 30. Sort Remaining Direct Domains-Lane Rows | The remaining direct rows under parent `.habitat/civ7/mapgen/domains/rules/` were reviewed and physically sorted: one moved to affirmed `domain-operation`, three hydrology rows moved to `.habitat/civ7/mapgen/domains/hydrology/_remainder/`, one mixed morphology/config validator moved to `.habitat/civ7/mapgen/domains/morphology/_remainder/`, and the retired narrative-swatches stage-token row moved out of the domains lane to the standard-recipe context. No row stayed under parent `domains/rules`. |
| 31. Sort the Hydrology Remainder Pocket | The hydrology remainder was re-read after the domains-lane sort: two narrative/hydrology boundary rows moved to `.habitat/civ7/mapgen/domains/hydrology/rules/` as honest hydrology context authority, while the map-config key row stayed under `.habitat/civ7/mapgen/domains/hydrology/_remainder/` as map-authoring/public-config cleanup pressure needing a later owner or split. |
| 32. Sort the Ecology Context Pocket | The ecology context pocket was re-read against `domain`, `domain-operation`, and recipe-stage authority: two rows stayed under `.habitat/civ7/mapgen/domains/ecology/rules/` as honest ecology context authority, while the ecology op-contract quality validator moved to `.habitat/civ7/mapgen/domains/ecology/_remainder/` as missing positive domain-operation quality governance and stale context cleanup pressure. |
| 33. Sort the Standard-Recipe Context Pocket | The standard-recipe context pocket was re-read against `recipe`, `recipe-stage`, and `recipe-step` authority: all nine rows stayed under `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/` as honest standard-recipe context authority, with future split/generalization pressure named for manifest/runtime parity, public authoring surface, generated artifact parity, and tag-catalog naming. |
| 34. Frame Niche Lane Shaping | `.habitat/frames/NICHE-LANE-SHAPING-FRAME.md` now governs parent niche `rules/` lanes that need honest child holding lanes before deeper movement. The pipeline parent lane is the first target for the method. |
| 35. Shape The Pipeline Child Lanes | The direct parent `.habitat/civ7/mapgen/pipeline/rules/` rows were reviewed and physically sorted into child lanes: narrow runtime and contract source-surface rows moved to intentional child `rules/`, while broader runtime determinism/config, cutover, and config cleanup pressure moved to child `_remainder/`. No row stayed parent-pipeline authority, and no new blueprint, capability, admission, projection, import-law, package-graph, build, or runner authority was created. |
| 36. Gather the Mod-Map Blueprint Kind | `mod-map` was affirmed as the map-producing mod variant kind, with Swooper Maps as the current concrete instance. Generated entrypoint and shipped catalog rows moved to `.habitat/blueprints/mod-map/`; projection and placement rows moved to `.habitat/civ7/mapgen/map-output/_remainder/` instead of becoming sibling blueprints by label affinity. |
| 37. Reclaim Projection/Placement Remainders | The map-output projection/placement remainder was re-read with the Remainder Reclamation frame: three exact standard-recipe projection/placement rows and one foundation projection adjacent row moved to `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/`; the broad physics-to-map contract seam stayed under `.habitat/civ7/mapgen/map-output/_remainder/` as future split or projection-surface pressure. No `recipe-step`, `map-projection`, or `placement-outcome` authority was invented. |
| 38. Frame Or Split The Projection Contract Remainder | The retained broad projection contract row was behavior-preservingly split: physics-stage contract leakage and map-effect naming moved to the standard-recipe context, while the realized-map artifact namespace check stayed under map-output `_remainder` with `PROJECTION-CONTRACT-SURFACE-FRAME.md` preserved as surface evidence instead of the next active domino. |
| 39. Gather The Dependency-Tag Blueprint Kind | `dependency-tag` was affirmed as the constructible/governable kind for registered dependency-edge IDs. The whole-rule typed `requires`/`provides` constant guard moved to `.habitat/blueprints/dependency-tag/`; touched effect-tag, tag-catalog, projection-contract, config-surface, and artifact-contract labels were rejected as sibling blueprints for this slice, while context/projection/config/artifact-value rows stayed in their honest lanes. |
| 40. Sort Studio Blueprint Candidates Into Operating Niches | The Studio `_blueprints` lane was removed. Its eight packets moved whole into child operating-area niches: `devops`, `browser-worker`, `recipe-dag`, and `server`. This was structural rehoming with manifest path repair, not content-level cleanup, retirement, split, or blueprint admission. |
| 41. Sort The Standard Recipe Stage Context | The Swooper Maps standard-recipe lane was split into recipe-wide context `rules/`, stage-prefix context `stages/<prefix>/rules/`, and split-required `_remainder/`. Coherent context rules stayed live even when future generalization is needed; only predicates needing split/consolidation moved to `_remainder`. |
| 42. Establish And Sweep The Artifact Blueprint Kind | `artifact` was affirmed as the immutable MapGen data-product blueprint kind and `.habitat/blueprints/artifact/` was created. The 24 artifact-vocabulary manifest rows were re-read: no existing row moved to live artifact authority, because each whole predicate was dependency-tag, domain, domain-operation, mod-map, standard-recipe context, Studio context, build-output, or unresolved projection/artifact debt. |
| 43. Prune SDK/Core/Visualization False Blueprint Pockets | Source inspection confirmed Civ7 SDK, MapGen core, and MapGen visualization are separate package owners rather than an SDK parent with core/viz children. Four `_blueprints` packets were demoted into honest niche `rules/`: two MapGen core library rules, one Civ7 SDK mapgen subpath rule, and one MapGen visualization build-currentness rule. |
| 44. Correct SDK Taxonomy Lanes | The Civ7 modding SDK niche was renamed to `civ7/mod-sdk`, while MapGen core and visualization moved under `civ7/mapgen/sdk/{core,visualization}` as MapGen SDK package-surface lanes. The correction preserves package ownership without making the mod SDK the owner of MapGen internals. |
| 45. Close The Map-Output Niche | The stale `civ7/mapgen/map-output` niche was removed. `prohibit_realized_map_artifact_tags` moved into `blueprints/artifact` as artifact ID namespace authority, while the three mod-map generated/shipped output rows kept `blueprint=mod-map` and were contextualized by `civ7/mapgen/pipeline/swooper-maps-standard-recipe` instead of a renamed catch-all output niche. |
| 47. Sort Civ7 Resource Blueprint Candidates | The active `civ7/resources` `_blueprints` rows moved into `map-policy` and `civ7-types` child resource/package lanes rather than admitted blueprint kinds. |
| 48. Sort Civ7 Platform Blueprint Candidates | The active `civ7/platform` `_blueprints` rows moved into adapter, control-oRPC, direct-control session, and game-UI bridge child operating-area lanes rather than admitted blueprint kinds. |
| 49. Atomize Mixed Civ7 Remainder Rules | Seven mixed or superseded Civ7 `_remainder` packets were removed. Six split into twelve atomic live rules under their owning contexts, while the broad foundation advanced-fragment aggregate was consolidated into two existing foundation-stage rules. |
| 50. Consolidate Foundation Remainder Rules | Foundation strategy/rules-index duplicate guards were consolidated into broader live foundation context rules; helper-surface consolidation stayed in `_remainder` pending positive helper authority. |
| 51. Retire Clean Garbage-Collection Rule Residue | Five dead or absorbed cleanup guards were deleted, dropping the live corpus from 127 to 122; the Studio devlive cleanup guard stayed live because its survivor authority is not sealed. |
| 52. Admit Domain Operation Strategy Blueprint Authority | `domain-operation-strategy` was admitted as product-backed blueprint authority based on operation strategy envelope source/docs, but no live rule moved because current predicates are foundation-local, helper authority, or contract-quality pressure rather than every-valid-strategy authority. |

This index is intentionally compressed. Completed branches matter because they
changed what the next agent should do; they are not the active plan.

## Domino 26 Disposition Receipt

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

## Domino 27 Disposition Receipt

This table is a receipt for physical sorting, not a second authority surface.
Rows retained under `.habitat/civ7/mapgen/domains/foundation/rules/`
are intentional foundation-context authority. Rows moved under
`.habitat/civ7/mapgen/domains/foundation/_remainder/` use
`placement.blueprint: "_remainder"` so the manifest does not continue claiming
final foundation-context ownership.

Proof cells marked selected-rule proof passed mean
`bun tools/habitat/bin/dev.ts check --rule <id> --json` returned `ok: true`
and `status: "pass"` for that exact rule after the move. Path-reference proof
means each manifest-owned `runner.files` and `supportFiles.baseline` path exists
and points inside the row's physical lane.

| Rule id | Bucket | Target or retained context | Source evidence | Reason | Proof needed/run | Reusable lesson |
| --- | --- | --- | --- | --- | --- | --- |
| `preserve_decomposed_foundation_contract_surfaces` | honest foundation context | `foundation/rules` | `check.mjs` checks focused foundation op names, artifact tags, strategy `../rules` imports, and projection plate-motion/provenance currentness. | This is an intentional foundation decomposition/currentness guard; it is not a whole-rule `domain` or `domain-operation` move, but it truthfully governs the current foundation context. | selected-rule Habitat script proof passed; path refs exist | Positive currentness guards may stay contextual when they are intentionally about one concrete migration state. |
| `prohibit_foundation_advanced_cast_merge_fragments` | cleanup/consolidation/split pressure | `foundation/_remainder` | `pattern.md` scans standard-recipe foundation stage indexes for advanced cast/merge fragments, Studio sentinel tokens, and step passthroughs. | The rule is stage cleanup and overlaps adjacent split rows; it is not foundation-domain authority as a final context rule. | selected-rule Grit proof passed; path refs exist | Stage-index cleanup should move to `_remainder` when adjacent rows already expose the split. |
| `prohibit_foundation_contract_config_bags` | cleanup/consolidation/split pressure | `foundation/_remainder` | `pattern.md` scans foundation operation contracts and standard-recipe foundation step contracts for config-bag imports or `FoundationConfigSchema`. | The rule mixes domain-operation contract pressure with recipe-step contract pressure, so no affirmed blueprint owns the whole predicate. | selected-rule Grit proof passed; path refs exist | Mixed op-contract plus recipe-step contract guards should defer until split. |
| `prohibit_foundation_legacy_aggregate_tectonics` | honest foundation context | `foundation/rules` | `pattern.md` scans foundation entrypoint and standard-recipe tectonics contract for the retired aggregate `computeTectonicHistory` surface. | The rule encodes foundation's decomposition history; another valid domain could have a different aggregate history without violating `domain` or `domain-operation`. | selected-rule Grit proof passed; path refs exist | Foundation-specific migration history can remain intentional context authority when it is not mixed with another owner. |
| `prohibit_foundation_legacy_plate_kinematics` | honest foundation context | `foundation/rules` | `pattern.md` scans the foundation `compute-plate-graph` contract for retired kinematics fields. | The rule protects one foundation contract vocabulary; it is not a reusable operation-kind invariant. | selected-rule Grit proof passed; path refs exist | One-operation retired field guards can stay contextual when they are truly current vocabulary history. |
| `prohibit_foundation_projection_legacy_motion_source` | external enforcement-surface pressure | `foundation/_remainder` | `pattern.md` scans the standard-recipe foundation projection step for legacy plateGraph motion reads. | The rule governs recipe projection implementation/currentness, not foundation domain or domain-operation authority. | selected-rule Grit proof passed; path refs exist | Projection implementation cleanup should not stay in a concrete-domain context lane. |
| `prohibit_foundation_tectonics_rules_reexport_shims` | cleanup/consolidation/split pressure | `foundation/_remainder` | `pattern.md` scans foundation operation `rules/index.ts` files for shared `lib/tectonics` re-export shims. | This is operation-internal rules-index pressure and overlaps adjacent direct foundation shim rules; moving it to `domain-operation` would promote path grammar. | selected-rule Grit proof passed; path refs exist | Rules-index shim cleanup should defer until the operation-internal surface is named without creating a new blueprint. |
| `prohibit_foundation_tectonics_strategy_nonlocal_imports` | cleanup/consolidation/split pressure | `foundation/_remainder` | `pattern.md` scans selected foundation tectonics strategy files for nonlocal imports. | Strategy files are operation-internal pressure by default; the current predicate is foundation-specific and should not create `operation-strategy` authority. | selected-rule Grit proof passed; path refs exist | Strategy-file locality rows should sort to `_remainder` unless source proves a whole-rule operation-kind invariant. |
| `prohibit_foundation_tectonics_strategy_shim_imports` | cleanup/consolidation/split pressure | `foundation/_remainder` | `pattern.md` scans selected foundation tectonics strategy files for shared `lib/tectonics` imports. | This is foundation strategy shim cleanup, not whole-rule `domain-operation` authority. | selected-rule Grit proof passed; path refs exist | Strategy shim cleanup is not a blueprint candidate by file role alone. |
| `prohibit_legacy_compute_tectonics_token` | honest foundation context | `foundation/rules` | `pattern.md` scans foundation domain, foundation standard-recipe stages, and maps for the retired monolithic `computeTectonics` token. | The rule is a foundation-specific retired-token guard; another domain can differ without violating the affirmed kinds. | selected-rule Grit proof passed; path refs exist | Broad retired-token guards may remain context authority when the token history is concrete-domain-specific. |
| `prohibit_removed_foundation_profile_config_tokens` | honest foundation context | `foundation/rules` | `pattern.md` scans foundation domain, foundation stages, and maps for retired profile/config token names. | The rule protects foundation's current transition vocabulary and is not a domain-wide config ontology. | selected-rule Grit proof passed; path refs exist | Retired config-token history can be honest context when the context owns that migration history. |
| `prohibit_removed_foundation_wrap_polar_maturity_tokens` | honest foundation context | `foundation/rules` | `pattern.md` scans foundation domain, foundation stages, and maps for retired wrap, polar, and maturity token names. | The rule is a foundation-specific retired-token guard, not a reusable `domain` or `domain-operation` invariant. | selected-rule Grit proof passed; path refs exist | Do not move concrete-domain token history to a kind just because it scans operation files. |

## Domino 29 Disposition Receipt

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

## Domino 30 Disposition Receipt

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

## Domino 31 Disposition Receipt

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

## Domino 32 Disposition Receipt

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

## Domino 33 Disposition Receipt

This table is a receipt for explicit no-move retention, not a new authority
surface. Rows retained under
`.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/` are
intentional standard-recipe context authority. The re-read found kind-shaped
pressure, but no whole row is general enough to move into `recipe`,
`recipe-stage`, or `recipe-step` without turning this concrete standard recipe
into blueprint law.

| Rule id | Bucket | Target or retained context | Source evidence | Reason | Proof needed/run | Reusable lesson |
| --- | --- | --- | --- | --- | --- | --- |
| `preserve_standard_stage_topology_and_path_invariants` | honest standard-recipe context | `swooper-maps-standard-recipe/rules` | `structure.toml` owns the exact standard stage root, current active stage directories, entrypoint files, and retired/legacy stage directory bans. | This is concrete standard recipe topology and migration currentness. It is not `recipe-stage` kind law because another valid recipe could use a different stage set, naming scheme, or retired-stage history. | selected-rule Habitat structure proof passed; path refs exist | Exact stage-root inventories stay contextual until a generalized stage-topology rule exists. |
| `require_full_profile_domain_stage_roots` | honest standard-recipe context | `swooper-maps-standard-recipe/rules` | `structure.toml` requires a selected full-profile set of standard stage roots and explicitly exempts narrative/resources from the current check. | The row is an instance profile assertion for the current Swooper Maps standard recipe, not general recipe-stage authority. Moving it to a blueprint would promote one profile's domain composition. | selected-rule Habitat structure proof passed; path refs exist | Profile-specific stage presence rules should stay with the instance/context unless rewritten as a parameterized kind rule. |
| `verify_standard_recipe_declared_stage_keys` | honest standard-recipe context | `swooper-maps-standard-recipe/rules` | `check.mjs` textually extracts `orderStandardStages` keys from `recipe.ts` and compares them to a hard-coded standard stage id list. | The durable pressure is stage-order validity, but the current rule is exactly the standard recipe's accepted order. It is not reusable `recipe` authority as written. | selected-rule Habitat script proof passed; path refs exist | Hard-coded instance order checks are context authority, even when they hint at a future manifest-driven kind rule. |
| `verify_runtime_stage_order_matches_contract_manifest` | honest standard-recipe context with future `recipe` split pressure | `swooper-maps-standard-recipe/rules` | `check.ts` imports `STANDARD_STAGES` from `recipe.ts` and `standardStageContractManifest` from `contract-manifest.ts`, then compares runtime stage and step order. | Manifest/runtime parity is likely a recipe-kind invariant, but this executable is bound to the standard recipe implementation and manifest. The whole row should not move until the rule is abstracted over a recipe instance. | selected-rule Habitat script proof passed; path refs exist | Kind-shaped parity checks can stay contextual when their runner hard-codes one instance. |
| `verify_standard_recipe_public_authoring_surface` | honest standard-recipe context with future split pressure | `swooper-maps-standard-recipe/rules` | `check.ts` derives stage authoring models from `STANDARD_STAGES` and checks the exact `STANDARD_PUBLIC_KEYS`, strict schemas, focus paths, and raw envelope constraints. | The authoring-surface idea is kind-shaped, but the predicate is anchored by exact standard stage ids and public key lists. Moving it whole to `recipe-stage` would turn one recipe's public schema into blueprint authority. | selected-rule Habitat script proof passed; path refs exist | Public-surface validators need parameterization before promotion; exact public-key lists remain context authority. |
| `verify_standard_recipe_artifacts_match_source_stages` | honest standard-recipe context with future projection/artifact pressure | `swooper-maps-standard-recipe/rules` | `check.ts` compares derived standard recipe schema, UI metadata, defaults, and canonical map config normalization against generated `dist/recipes/standard-artifacts.js`. | The rule governs generated artifact parity for one recipe, including current defaults and a known raw-envelope exception. It is not final `recipe` or projection authority as a whole. | selected-rule Habitat script proof passed; path refs exist | Generated artifact parity should stay contextual until the projection surface is named and parameterized. |
| `prohibit_migrated_consumer_effect_gating_tokens` | honest standard-recipe context | `swooper-maps-standard-recipe/rules` | `pattern.md` scans one standard recipe map-hydrology step contract for retired morphology or engine effect-gating tokens. | This is migrated callsite cleanup for one standard recipe consumer contract. It is not `recipe-step` authority because another valid step could have different dependencies and history. | selected-rule Grit proof passed; path refs exist | Exact migrated-consumer cleanup can remain context authority when the whole predicate protects one known transition. |
| `prohibit_milestone_prefixed_standard_recipe_tag_catalog_names` | honest standard-recipe context with future tag-catalog naming pressure | `swooper-maps-standard-recipe/rules` | `pattern.md` scans standard recipe TypeScript files for milestone-prefixed tag catalog constants. | The stronger future rule may be a positive tag-catalog naming rule, but the current row is a narrow negative guard over the standard recipe. It should not become blueprint law by name alone. | selected-rule Grit proof passed; path refs exist | Negative naming cleanup should stay contextual until the positive naming surface exists. |
| `prohibit_narrative_swatches_stage_token` | honest standard-recipe context | `swooper-maps-standard-recipe/rules` | `pattern.md` scans standard recipe, maps, and tests for the retired `narrative-swatches` stage token. | Domino 30 already moved this out of the domains lane because the token is standard recipe topology cleanup, not narrative/domain ownership. It remains honest context authority, not `recipe-stage` kind authority. | selected-rule Grit proof passed; path refs exist | Token labels are not owners; retired topology tokens stay with the concrete topology until rewritten generally. |

## Domino 35 Disposition Receipt

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

## Domino 36 Disposition Receipt

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

## Domino 37 Disposition Receipt

This table is a receipt for remainder reclamation, not a new classification
ledger. The branch started from the map-output projection/placement remainder
after `mod-map` moved generated and shipped output authority away. Disposable
metrics and fresh review agents found one primary row that still needs a future
split or surface frame, three primary rows that are exact standard-recipe
context authority, and one adjacent foundation row with the same exact
projection-step proof shape. Rows moved under
`.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/` use
`placement.blueprint: "_self"`. The retained map-output row still uses
`placement.blueprint: "_remainder"`.

| Rule id | Start path | Signals | Bucket | Target path | Whole-rule reason | Proof run | Next trigger |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `preserve_physics_to_map_projection_contracts` | `.habitat/civ7/mapgen/map-output/_remainder/preserve_physics_to_map_projection_contracts` | broad exact globs; script proof; high mixed-surface penalty | retained `_remainder` | `.habitat/civ7/mapgen/map-output/_remainder/preserve_physics_to_map_projection_contracts` | The whole rule spans physics-stage contracts, all mod source, `packages/mapgen-core/src`, realized-map artifact tags, and map-effect naming. It is too broad for `recipe`, `recipe-stage`, `recipe-step`, or standard-recipe context as one executable predicate. | selected-rule proof passed; path refs exist | Revisit when a projection contract surface is framed or when the row can be behavior-preservingly split into contract, tag-naming, and source-leakage owners. |
| `prohibit_misplaced_projection_adapter_calls` | `.habitat/civ7/mapgen/map-output/_remainder/prohibit_misplaced_projection_adapter_calls` | exact standard-stage paths; Grit proof; adapter-callsite predicate; medium mixed-surface penalty | honest standard-recipe context | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/prohibit_misplaced_projection_adapter_calls` | The whole rule hard-codes current standard recipe projection callsites, upstream physics-stage exclusions, and `tile.hexOddR` stage cleanup. It protects the current standard recipe topology rather than every valid recipe step. | selected-rule proof passed; path refs repaired | Revisit only after a parameterized projection-step or recipe-step callsite model exists. |
| `require_projection_calls_in_projection_steps` | `.habitat/civ7/mapgen/map-output/_remainder/require_projection_calls_in_projection_steps` | exact files; Habitat script proof; required projection/materialization tokens | honest standard-recipe context | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/require_projection_calls_in_projection_steps` | The executable asserts exact standard recipe files and exact `plotRivers` contract tokens. It is not reusable `recipe-step` blueprint authority as written. | selected-rule proof passed; path refs repaired | Revisit after projection-step parameterization or split work can name generic required-callsite governance. |
| `require_typed_placement_outcomes_before_apply` | `.habitat/civ7/mapgen/map-output/_remainder/require_typed_placement_outcomes_before_apply` | single exact file; Grit proof; typed placement outcome boundary | honest standard-recipe context | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/require_typed_placement_outcomes_before_apply` | The whole rule forbids direct official generator calls in one current standard placement apply file. It is a real step-boundary signal, but not enough to invent `placement-outcome` or promote a whole `recipe-step` rule. | selected-rule proof passed; path refs repaired | Revisit if direct official generator calls become a broader runtime, adapter, or parameterized step policy. |
| `prohibit_foundation_projection_legacy_motion_source` | `.habitat/civ7/mapgen/domains/foundation/_remainder/prohibit_foundation_projection_legacy_motion_source` | single exact projection step; adjacent Grit proof shape; low mixed-surface penalty | honest standard-recipe context | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/prohibit_foundation_projection_legacy_motion_source` | Domino 27 already identified this as recipe projection implementation cleanup, not foundation-domain authority. It shares the exact standard recipe projection-step ownership shape with the primary moved rows. | selected-rule proof passed; path refs repaired | Revisit only if a later projection-step surface absorbs the standard-recipe projection cleanup rows together. |
| `preserve_morphology_contracts_and_overlay_ownership` | `.habitat/civ7/mapgen/domains/morphology/_remainder/preserve_morphology_contracts_and_overlay_ownership` | morphology contracts plus narrative overlay ownership; high mixed-surface penalty | excluded from this slice | unchanged | The row mixes morphology contract assertions with HOTSPOTS/narrative overlay ownership and does not share the projection/placement destination or proof shape. | no-move review only | Future split or narrative/overlay boundary frame. |
| `prohibit_legacy_plate_driver_and_plot_mountains_dependencies` | `.habitat/civ7/mapgen/domains/morphology/_remainder/prohibit_legacy_plate_driver_and_plot_mountains_dependencies` | exact morphology contracts plus one map-morphology implementation file | excluded from this slice | unchanged | The row is adjacent-looking but still mixes morphology contract cleanup with one map-morphology implementation cleanup. It is not a clean projection/placement reclamation row without split work. | no-move review only | Future split may reclaim the `plotMountains` half into standard-recipe context. |
| `prohibit_morphology_overlay_implementation_reads` | `.habitat/civ7/mapgen/domains/morphology/_remainder/prohibit_morphology_overlay_implementation_reads` | morphology step implementations; overlay/story boundary | excluded from this slice | unchanged | The predicate is overlay implementation ownership, not projection/placement callsite ownership. | no-move review only | Future recipe-step implementation-boundary or story/overlay frame. |
| `prohibit_morphology_story_overlay_contract_artifact` | `.habitat/civ7/mapgen/domains/morphology/_remainder/prohibit_morphology_story_overlay_contract_artifact` | morphology contracts; story overlay artifact boundary | excluded from this slice | unchanged | The predicate is narrative/story artifact ownership, not projection/placement callsite ownership. | no-move review only | Future story/narrative artifact boundary frame. |

## Domino 38 Disposition Receipt

This table supersedes the Domino 37 retained-row state for
`preserve_physics_to_map_projection_contracts`. The broad packet no longer
exists. Its predicate families now live as separate rows so the physical tree
shows what was reclaimed and what still needs a new surface frame.

| Rule id | Start path | Signals | Bucket | Target path | Whole-rule reason | Proof run | Next trigger |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `prohibit_map_projection_dependencies_in_physics_contracts` | `.habitat/civ7/mapgen/map-output/_remainder/preserve_physics_to_map_projection_contracts` | exact standard physics-stage contract files; script proof; low split risk | honest standard-recipe context | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/prohibit_map_projection_dependencies_in_physics_contracts` | The predicate only forbids map artifact/effect dependencies in the current standard recipe's upstream physics contracts. It is not generic `recipe-step` authority because projection steps validly use map effects. | selected-rule proof passed; path refs exist | Revisit only if standard physics-stage contract families become parameterized recipe-stage or projection-surface authority. |
| `require_standard_recipe_map_effect_name_suffixes` | `.habitat/civ7/mapgen/map-output/_remainder/preserve_physics_to_map_projection_contracts` | exact standard tag-contract file; script proof; tag-catalog naming predicate | honest standard-recipe context | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/require_standard_recipe_map_effect_name_suffixes` | The predicate governs current standard recipe `effect:map.*` suffix families in `tag-contracts.ts`. It is tag-catalog context authority, not `mod-map` output authority and not every valid recipe step. | selected-rule proof passed; path refs exist | Revisit only if map effect tag naming becomes part of a broader projection contract surface. |
| `prohibit_realized_map_artifact_tags` | `.habitat/civ7/mapgen/map-output/_remainder/preserve_physics_to_map_projection_contracts` | scans all mod source and `packages/mapgen-core/src`; high cross-source boundary signal | retained `_remainder` with frame | `.habitat/civ7/mapgen/map-output/_remainder/prohibit_realized_map_artifact_tags` | The predicate forbids `artifact:map.realized.` across pure MapGen and mod source. No existing owner whole-fits that truth/projection boundary, so it stays visible debt rather than being smuggled into `recipe-step`, standard-recipe context, or `mod-map`. | selected-rule proof passed; path refs exist; baseline-integrity blocked by missing base registry `921075e9c` | Run `.habitat/frames/PROJECTION-CONTRACT-SURFACE-FRAME.md` to decide whether a narrow projection contract surface exists or this row becomes garbage-collection pressure. |

## Domino 39 Disposition Receipt

This table is a receipt for physical sorting, not a second authority surface.
`dependency-tag` is now an affirmed blueprint lane for MapGen dependency-edge
IDs. The slice moved only the row whose whole predicate governs dependency-tag
usage in `requires` and `provides`; touched rows that merely mention tags stay
in their current lanes until a later artifact, projection, config, or cleanup
slice can own them honestly.

| Rule id | Start path | Signals | Bucket | Target path | Whole-rule reason | Proof run | Next trigger |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `require_typed_dependency_and_effect_tag_constants` | `.habitat/blueprints/recipe-step/require_typed_dependency_and_effect_tag_constants` | `requires`/`provides`; string literal `artifact:*`, `field:*`, and `effect:*` dependency keys; Grit proof | affirmed dependency-tag blueprint | `.habitat/blueprints/dependency-tag/require_typed_dependency_and_effect_tag_constants` | The row forbids raw dependency-edge strings inside top-level step contract `requires` and `provides`. It governs dependency-tag use as a kind of edge ID, while preserving the artifact-contract-reference exception for artifact value authority. | selected-rule proof passed; path refs repaired | Generalize if dependency-tag rules later cover non-standard recipes or registry registration directly. |
| `prohibit_milestone_prefixed_standard_recipe_tag_catalog_names` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/prohibit_milestone_prefixed_standard_recipe_tag_catalog_names` | tag catalog naming; `field:*`; `effect:*` | retained honest standard-recipe context | unchanged | The row governs current standard-recipe catalog variable names, not dependency-tag validity across every tag definition. `tag-catalog` was rejected as a sibling blueprint in this slice. | no-move review; selected-rule proof not required | Revisit if catalog-file grammar becomes a dependency-tag blueprint rule instead of standard-recipe currentness. |
| `require_standard_recipe_map_effect_name_suffixes` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/require_standard_recipe_map_effect_name_suffixes` | `effect:map.*` suffix grammar in `tag-contracts.ts` | retained honest standard-recipe context | unchanged | The row governs current map-effect suffix families for the standard recipe. `effect:*` is a dependency-tag kind, but this predicate is current projection/tag-contract naming, not universal dependency-tag authority. | no-move review; selected-rule proof not required | Revisit if map effect naming becomes a positive dependency-tag naming rule or projection surface rule. |
| `prohibit_migrated_consumer_effect_gating_tokens` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/prohibit_migrated_consumer_effect_gating_tokens` | retired effect gates and one migrated lakes contract | retained honest standard-recipe context | unchanged | The row is exact migration/currentness pressure around one standard-recipe consumer contract, not dependency-tag kind governance. | no-move review; selected-rule proof not required | Revisit during cleanup or if retired effect gates are replaced by a positive dependency-tag lifecycle rule. |
| `prohibit_legacy_morphology_effect_gating_tokens` | `.habitat/civ7/mapgen/domains/morphology/_remainder/prohibit_legacy_morphology_effect_gating_tokens` | retired effect gates in morphology stages and standard tags | retained `_remainder` cleanup pressure | unchanged | The row is a negative migration cleanup guard for retired effect tokens. Moving it would turn concrete cutover history into blueprint authority. `effect-tag` was rejected as a sibling blueprint. | no-move review; selected-rule proof not required | Revisit during garbage collection or when positive dependency-tag lifecycle/deprecation rules exist. |
| `prohibit_realized_map_artifact_tags` | `.habitat/civ7/mapgen/map-output/_remainder/prohibit_realized_map_artifact_tags` | `artifact:map.realized.` namespace across mod and core source | retained `_remainder` projection/artifact pressure | unchanged | The row is unresolved realized-map truth/projection boundary pressure, not dependency-tag governance. `projection-contract` and `artifact-contract` were rejected as sibling blueprints in this slice. | no-move review; selected-rule proof not required | Revisit in artifact gathering or projection-surface/garbage decision. |
| `require_owned_domain_config_catalog_surfaces` | `.habitat/civ7/mapgen/domains/morphology/_remainder/require_owned_domain_config_catalog_surfaces` | mixed morphology config facade and tag catalog checks | retained `_remainder` mixed-owner pressure | unchanged | The row mixes config-surface and tag-catalog assertions, so no whole-rule dependency-tag move is truthful. `config-surface` was rejected as a blueprint in this slice. | no-move review; selected-rule proof not required | Revisit when config cleanup or dependency-tag catalog grammar is split. |
| `prohibit_domain_ops_projection_effect_dependencies` | `.habitat/blueprints/domain-operation/prohibit_domain_ops_projection_effect_dependencies` | `artifact:map.*` and `effect:map.*` inside domain ops | retained domain-operation authority | unchanged | The row governs operation purity: domain operations must not depend on map projection/effect tags. The owner is `domain-operation`, not dependency-tag. | no-move review; selected-rule proof not required | Revisit only if a future dependency-tag import/placement rule can absorb this without weakening operation authority. |

## Domino 40 Disposition Receipt

This table is a receipt for structural rehoming, not a second authority
surface. The packets moved whole so the old Studio `_blueprints` labels no
longer imply blueprint authority. Packet-level content sorting, split,
cleanup, retirement, and future blueprint-kind generalization remain deferred.

| Rule id | Start path | Target path | Placement reason | Deferred cleanup signal |
| --- | --- | --- | --- | --- |
| `enforce_studio_dev_runner_topology` | `.habitat/civ7/mapgen/studio/_blueprints/dev-runner/enforce_studio_dev_runner_topology` | `.habitat/civ7/mapgen/studio/devops/rules/enforce_studio_dev_runner_topology` | Governs Studio development execution topology: Nx dev/daemon targets, Vite watch boundaries, and retired package script surfaces. | Revisit if devops and server runtime need a shared or split positive operational contract. |
| `prohibit_retired_studio_devlive_daemon_file` | `.habitat/civ7/mapgen/studio/_blueprints/dev-runner/prohibit_retired_studio_devlive_daemon_file` | `.habitat/civ7/mapgen/studio/devops/rules/prohibit_retired_studio_devlive_daemon_file` | Guards retired Studio dev-live daemon surface as part of the devops lane. | Retire later if the positive devops topology check fully subsumes it. |
| `ensure_studio_worker_bundle_is_browser_safe` | `.habitat/civ7/mapgen/studio/_blueprints/worker-bundle/ensure_studio_worker_bundle_is_browser_safe` | `.habitat/civ7/mapgen/studio/browser-worker/rules/ensure_studio_worker_bundle_is_browser_safe` | Governs the MapGen Studio browser worker bundle as a Studio subsystem, not a generic worker blueprint. | Revisit if a future worker blueprint kind admits shared browser-worker requirements. |
| `prohibit_recipe_dag_runtime_source_dependencies` | `.habitat/civ7/mapgen/studio/_blueprints/recipe-dag-service/prohibit_recipe_dag_runtime_source_dependencies` | `.habitat/civ7/mapgen/studio/recipe-dag/rules/prohibit_recipe_dag_runtime_source_dependencies` | Governs Studio recipe-DAG service imports and contract-only metadata source use. | Revisit if recipe-DAG boundary rules split into service, contract-source, or artifact-consumption subrules. |
| `require_recipe_dag_contract_metadata` | `.habitat/civ7/mapgen/studio/_blueprints/recipe-dag-service/require_recipe_dag_contract_metadata` | `.habitat/civ7/mapgen/studio/recipe-dag/rules/require_recipe_dag_contract_metadata` | Governs the Recipe DAG import graph and contract metadata requirements for the Studio subsystem. | Revisit when recipe contract metadata becomes positive blueprint or capability authority. |
| `require_studio_ui_recipe_artifact_imports` | `.habitat/civ7/mapgen/studio/_blueprints/recipe-artifact-supply/require_studio_ui_recipe_artifact_imports` | `.habitat/civ7/mapgen/studio/recipe-dag/rules/require_studio_ui_recipe_artifact_imports` | The UI consumes recipe artifacts from the same recipe-DAG contract/supply subsystem rather than runtime recipe modules. | Split later if UI artifact consumption becomes broader than the recipe-DAG lane. |
| `enforce_studio_rpc_eventhub_topology` | `.habitat/civ7/mapgen/studio/_blueprints/rpc-daemon/enforce_studio_rpc_eventhub_topology` | `.habitat/civ7/mapgen/studio/server/rules/enforce_studio_rpc_eventhub_topology` | Governs the Studio server daemon mounting RPC through runtime context; `rpc-daemon` is an implementation role, not the niche. | Revisit if Studio server runtime grows finer child niches for RPC, EventHub, or daemon lifecycle. |
| `prohibit_studio_rpc_eventhub_lifecycle_leaks` | `.habitat/civ7/mapgen/studio/_blueprints/rpc-daemon/prohibit_studio_rpc_eventhub_lifecycle_leaks` | `.habitat/civ7/mapgen/studio/server/rules/prohibit_studio_rpc_eventhub_lifecycle_leaks` | Governs EventHub lifecycle ownership inside the Studio server runtime context. | Split later if lifecycle ownership becomes a broader server-runtime capability rule. |

## Domino 41 Disposition Receipt

This table is a receipt for semantic sorting inside the concrete Swooper Maps
standard-recipe context. It does not admit `standard recipe` as a blueprint.
Rows that are coherent whole predicates moved into the most precise context
`rules/` lane even if future cleanup, retirement, or generalization is still
needed. Rows moved to `_remainder/` are there because the current predicate
needs split/consolidation before it can be live context authority.

| Rule id | Start path | Bucket | Target path | Reason | Pending action |
| --- | --- | --- | --- | --- | --- |
| `preserve_standard_stage_topology_and_path_invariants` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/preserve_standard_stage_topology_and_path_invariants` | recipe-wide standard-recipe context | unchanged | Whole-recipe stage-root topology is coherent current context authority. | Generalize only if a later recipe-stage topology kind is parameterized. |
| `require_full_profile_domain_stage_roots` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/require_full_profile_domain_stage_roots` | recipe-wide standard-recipe context | unchanged | Full-profile stage presence is a whole standard recipe instance assertion. | Generalize only if profile composition becomes parameterized recipe authority. |
| `verify_standard_recipe_declared_stage_keys` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/verify_standard_recipe_declared_stage_keys` | recipe-wide standard-recipe context | unchanged | Stage-key order is checked against the whole current recipe declaration. | Generalize only if order validation becomes manifest-driven recipe authority. |
| `verify_runtime_stage_order_matches_contract_manifest` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/verify_runtime_stage_order_matches_contract_manifest` | recipe-wide standard-recipe context | unchanged | Runtime/manifest parity spans the whole current recipe. | Parameterize before moving to recipe-kind authority. |
| `verify_standard_recipe_public_authoring_surface` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/verify_standard_recipe_public_authoring_surface` | recipe-wide standard-recipe context | unchanged | Public authoring validation owns the whole current standard recipe public schema. | Parameterize before moving to recipe-stage or authoring-surface authority. |
| `verify_standard_recipe_artifacts_match_source_stages` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/verify_standard_recipe_artifacts_match_source_stages` | recipe-wide standard-recipe context | unchanged | Generated standard-recipe output parity spans the whole source recipe. | Revisit when projection/artifact authority is named and parameterized. |
| `prohibit_map_projection_dependencies_in_physics_contracts` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/prohibit_map_projection_dependencies_in_physics_contracts` | recipe-wide standard-recipe context | unchanged | The predicate spans multiple upstream physics stage prefixes, so `stages/map` would be misleading. | Revisit only if projection-surface authority can own the predicate generally. |
| `require_standard_recipe_map_effect_name_suffixes` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/require_standard_recipe_map_effect_name_suffixes` | recipe-wide standard-recipe context | unchanged | The predicate governs `standard/tag-contracts.ts`, not a stage-prefix directory. | Revisit if map-effect naming becomes positive dependency-tag or projection-surface authority. |
| `prohibit_milestone_prefixed_standard_recipe_tag_catalog_names` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/prohibit_milestone_prefixed_standard_recipe_tag_catalog_names` | recipe-wide standard-recipe context | unchanged | The predicate scans the standard recipe tag catalog surface as a whole. | Revisit if tag-catalog grammar becomes dependency-tag blueprint authority. |
| `prohibit_narrative_swatches_stage_token` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/prohibit_narrative_swatches_stage_token` | recipe-wide standard-recipe context | unchanged | The retired token guard spans standard recipe, maps, and tests rather than one stage prefix. | Retire when the retired token no longer needs protection. |
| `prohibit_foundation_projection_legacy_motion_source` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/prohibit_foundation_projection_legacy_motion_source` | foundation stage context | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/foundation/rules/prohibit_foundation_projection_legacy_motion_source` | The whole predicate is an exact standard foundation projection stage guard. | Revisit if later projection-step authority absorbs projection cleanup rows. |
| `prohibit_foundation_stage_cast_merge_hacks` | `.habitat/civ7/mapgen/domains/foundation/_remainder/prohibit_foundation_stage_cast_merge_hacks` | foundation stage context | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/foundation/rules/prohibit_foundation_stage_cast_merge_hacks` | The whole predicate scans standard foundation stage indexes for one coherent cast/merge guard. | Retire or consolidate if broader foundation stage cleanup absorbs it. |
| `prohibit_foundation_stage_sentinel_passthrough` | `.habitat/civ7/mapgen/domains/foundation/_remainder/prohibit_foundation_stage_sentinel_passthrough` | foundation stage context | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/foundation/rules/prohibit_foundation_stage_sentinel_passthrough` | The whole predicate scans standard foundation stage indexes for one coherent sentinel passthrough guard. | Retire or consolidate if broader foundation stage cleanup absorbs it. |
| `prohibit_foundation_advanced_cast_merge_fragments` | `.habitat/civ7/mapgen/domains/foundation/_remainder/prohibit_foundation_advanced_cast_merge_fragments` | foundation split remainder | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/foundation/_remainder/prohibit_foundation_advanced_cast_merge_fragments` | The predicate overlaps the narrower cast/merge and sentinel rows. | Split, consolidate, or retire after the narrower rows cover the separable predicates. |
| `prohibit_migrated_consumer_effect_gating_tokens` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/prohibit_migrated_consumer_effect_gating_tokens` | map stage context | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/map/rules/prohibit_migrated_consumer_effect_gating_tokens` | The whole predicate is scoped to one standard map-hydrology consumer contract. | Revisit during cleanup or dependency-tag lifecycle work. |
| `prohibit_misplaced_projection_adapter_calls` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/prohibit_misplaced_projection_adapter_calls` | map stage context | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/map/rules/prohibit_misplaced_projection_adapter_calls` | The whole predicate governs standard map-projection adapter callsite locality. | Revisit after projection-step or recipe-step callsite authority is parameterized. |
| `require_projection_calls_in_projection_steps` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/require_projection_calls_in_projection_steps` | map stage context | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/map/rules/require_projection_calls_in_projection_steps` | The runner checks exact standard map projection files as one coherent context guard. | Revisit after projection-step required-callsite governance is parameterized. |
| `require_typed_placement_outcomes_before_apply` | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/require_typed_placement_outcomes_before_apply` | placement stage context | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/placement/rules/require_typed_placement_outcomes_before_apply` | The whole predicate targets the standard placement apply step. | Revisit if the boundary becomes broader runtime, adapter, or step policy. |
| `prohibit_legacy_morphology_effect_gating_tokens` | `.habitat/civ7/mapgen/domains/morphology/_remainder/prohibit_legacy_morphology_effect_gating_tokens` | standard-recipe split remainder | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/_remainder/prohibit_legacy_morphology_effect_gating_tokens` | The predicate mixes morphology stage files with `standard/tags.ts`. | Split morphology-stage cleanup from tag-catalog cleanup, or retire when lifecycle rules exist. |
| `prohibit_legacy_plate_driver_and_plot_mountains_dependencies` | `.habitat/civ7/mapgen/domains/morphology/_remainder/prohibit_legacy_plate_driver_and_plot_mountains_dependencies` | standard-recipe split remainder | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/_remainder/prohibit_legacy_plate_driver_and_plot_mountains_dependencies` | The predicate mixes morphology contract dependency cleanup with one map-morphology implementation cleanup row. | Split contract cleanup from implementation cleanup before promoting either part. |
| `prohibit_morphology_dual_read_tokens` | `.habitat/civ7/mapgen/domains/morphology/_remainder/prohibit_morphology_dual_read_tokens` | morphology stage context | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/morphology/rules/prohibit_morphology_dual_read_tokens` | The whole predicate is a coherent morphology-stage dual-read guard. | Retire when the dual-read migration cleanup is obsolete. |
| `prohibit_morphology_hotspot_overlay_publishers` | `.habitat/civ7/mapgen/domains/morphology/_remainder/prohibit_morphology_hotspot_overlay_publishers` | morphology stage context | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/morphology/rules/prohibit_morphology_hotspot_overlay_publishers` | The current whole predicate guards morphology standard stage source from publishing HOTSPOTS overlays. | Revisit if story-overlay ownership becomes broader narrative or overlay authority. |
| `prohibit_morphology_overlay_implementation_reads` | `.habitat/civ7/mapgen/domains/morphology/_remainder/prohibit_morphology_overlay_implementation_reads` | morphology stage context | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/morphology/rules/prohibit_morphology_overlay_implementation_reads` | The current whole predicate guards morphology standard stage implementation files. | Revisit if recipe-step implementation/contract separation becomes positive authority. |
| `prohibit_morphology_stage_config_bag_imports` | `.habitat/civ7/mapgen/domains/morphology/_remainder/prohibit_morphology_stage_config_bag_imports` | morphology stage context | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/morphology/rules/prohibit_morphology_stage_config_bag_imports` | The whole predicate guards morphology standard stage files from config-bag imports. | Revisit when consumer-side config facade rules are named generally. |
| `prohibit_morphology_story_overlay_contract_artifact` | `.habitat/civ7/mapgen/domains/morphology/_remainder/prohibit_morphology_story_overlay_contract_artifact` | morphology stage context | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/morphology/rules/prohibit_morphology_story_overlay_contract_artifact` | The current whole predicate guards morphology standard step contracts. | Revisit if story/narrative artifact boundaries become positive authority. |
| `prohibit_runtime_continent_contract_tokens` | `.habitat/civ7/mapgen/domains/morphology/_remainder/prohibit_runtime_continent_contract_tokens` | morphology stage context | `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/morphology/rules/prohibit_runtime_continent_contract_tokens` | The whole predicate guards morphology standard contracts/artifact files from runtime continent identifiers. | Revisit when runtime-token forbids in contracts become positive contract-surface rules. |

### 42. Establish And Sweep The Artifact Blueprint Kind

Purpose: admit `artifact` as the real immutable data-product blueprint kind,
then use it as a concrete destination while re-reading the bounded current
artifact-vocabulary rule set. This is a staged domino, not a broad corpus
campaign.

Stage 1: artifact kind creation.

- Use `.habitat/frames/BLUEPRINT-KIND-GATHERING-FRAME.md` as the method frame.
- Affirm `artifact` from source-backed constructibility evidence:
  `docs/system/libs/mapgen/reference/ARTIFACTS.md`,
  `docs/system/libs/mapgen/how-to/add-a-new-artifact.md`,
  `packages/mapgen-core/src/authoring/artifact/**`,
  `packages/mapgen-core/src/core/types.ts`, and current Swooper Maps artifact
  definitions.
- Create `.habitat/blueprints/artifact/` as affirmed blueprint authority.
- Include artifact contracts inside artifact authority; do not create an
  `artifact-contract` sibling blueprint.
- Keep `dependency-tag` separate: `artifact:*` remains a dependency-tag prefix
  when the rule governs edge/tag ids rather than artifact values.

Stage 2: bounded artifact-vocabulary sweep.

- Analyze the `24` live rule manifests that currently mention artifact
  vocabulary.
- Decision set for each row:
  - move to `.habitat/blueprints/artifact/<rule-id>/` only when the whole
    predicate governs every valid artifact value/contract: stable id, schema,
    immutable publish/read behavior, artifact helper surface,
    producer/consumer contract, value-store semantics, or buffer exception;
  - keep the row in its current honest context when artifact language is
    incidental to another owner, such as dependency-tag, domain,
    domain-operation, mod-map, Studio recipe-DAG, standard-recipe parity, or
    generated-output hygiene;
  - if the rule clearly points at artifact blueprint authority but cannot move
    whole because it needs a split, rewrite, or inversion from current owner
    language, either leave it in the smallest honest `_remainder` with an
    explicit pending action or move it to an artifact-local `_remainder` only
    after documenting that lane as sorted artifact-blueprint debt, not live
    artifact authority;
  - do not introduce `_triage`; the existing `_remainder` lane is the visual
    marker for reviewed-but-not-admitted debt.
- Update `.habitat/frames/AUTHORITY-TREE-RULE-LEDGER.md` for every inspected
  row, including explicit non-moves and pending actions.
- Record the disposition receipt in this file so future agents can tell which
  artifact-vocabulary rows have been processed.

Current preflight metrics:

- Live rule manifests: `126`.
- Artifact-vocabulary live rule manifests: `24`.
- Artifact-vocabulary rows already in top-level blueprints: `7`.
- Artifact-vocabulary rows in context/remainder/candidate lanes: `17`.
- Artifact-vocabulary rows still under `_blueprints`: `1`
  (`verify_visualization_runtime_build_artifacts`, likely generic build output
  rather than product artifact authority).
- Source-side constructibility evidence is strong:
  `82` `defineArtifact(...)` calls, `70` `artifact:*` ids, `56` contract
  `artifacts: { ... }` blocks, and `261` `deps.artifacts` reads/publishes in
  current MapGen source scopes.

Done Means:

- `.habitat/blueprints/artifact/` exists.
- The bounded 24-row artifact-vocabulary set has been read and dispositioned.
- Whole-rule artifact authority moved to artifact.
- Artifact-pressure rows that cannot move whole have explicit pending actions
  in the ledger and, if physically moved under artifact `_remainder`, are
  clearly marked as not-yet-live blueprint authority.
- Non-fitting rows remain in honest existing authority lanes with evidence for
  why artifact is not their owner.
- The rule ledger and execution-surface map reflect the final tree.

Dependencies:

- Dependency-tag gathering has landed.
- The artifact term-closure migration has landed, so Habitat metadata no
  longer uses generic `artifact` as a rule category or operation concept.

Proof:

- Focused rule checks pass for the inspected 24-row artifact-vocabulary corpus.
- Manifest path proof and stale-reference scans pass.
- The final receipt distinguishes artifact value/contract authority from
  dependency-tag, projection, config, and garbage pressure.

Disposition receipt:

- Created `.habitat/blueprints/artifact/README.md` as the affirmed blueprint
  marker. No `rule.json` packet was admitted under the blueprint in this slice.
- Primary corpus is exactly the `24` live manifests whose `rule.json` text
  mentions artifact vocabulary. Adjacent runner/body-only artifact text was
  reviewed as exclusion evidence, not added to the primary manifest corpus.
- Runner/body-only exclusions: `prohibit_relative_domain_reaches_from_recipes_and_maps`
  stays domain public-surface authority; `require_domain_contract_roots_in_step_contracts`
  stays recipe-step authority; `prohibit_recipe_dag_runtime_source_dependencies`
  and `require_recipe_dag_contract_metadata` stay Studio recipe-DAG authority.
- No artifact-local `_remainder` was introduced. The one artifact-pressure row,
  `prohibit_realized_map_artifact_tags`, stays in `map-output/_remainder`
  because it is still unresolved projection/artifact debt, not live artifact
  blueprint authority.

| Rule | Final disposition | Why not artifact authority | Pending action |
| --- | --- | --- | --- |
| `require_typed_dependency_and_effect_tag_constants` | retained dependency-tag blueprint | `artifact:*` is dependency-edge vocabulary inside `requires`/`provides`, not artifact values. | Generalize only if dependency-tag rules later cover broader registry use. |
| `prohibit_domain_ops_projection_effect_dependencies` | retained domain-operation blueprint | Governs operation purity against map projection/effect keys in domain ops. | Revisit only if future dependency-tag import/placement rules absorb it without weakening operation authority. |
| `prohibit_domain_artifacts_modules` | retained domain blueprint | Bans retired domain `artifacts.ts` topology. | No artifact action; keep with domain topology. |
| `prohibit_domain_tag_artifact_shim_imports` | retained domain blueprint | Protects retired domain shim imports. | No artifact action; keep with domain public-surface governance. |
| `prohibit_retired_domain_root_catalogs` | retained domain blueprint | Domain-root tag/artifact catalogs are retired domain topology. | No artifact action; keep with domain-root topology cleanup. |
| `block_studio_config_leakage_into_shipped_catalog` | retained mod-map blueprint | Shipped catalog metadata is a mod-map output surface. | Keep with mod-map shipped catalog authority. |
| `validate_generated_map_entrypoint_contracts` | retained mod-map blueprint | Generated map entrypoint contracts are mod-map output authority. | Keep with mod-map generated entrypoint authority. |
| `preserve_decomposed_foundation_contract_surfaces` | retained foundation context rules | Artifact tags are one part of a foundation currentness guard. | Keep contextual until a future split names a positive artifact rule. |
| `preserve_morphology_contracts_and_overlay_ownership` | retained morphology `_remainder` | Mixed belt-driver contract and story-overlay ownership pressure. | Split or project through a future narrative/overlay boundary frame. |
| `prohibit_runtime_continent_step_tokens` | retained morphology `_remainder` | Runtime continent implementation-token cleanup; artifact language is incidental. | Split cross-domain implementation cleanup before promotion. |
| `prohibit_realized_map_artifact_tags` | retained map-output `_remainder` | Unresolved realized-map truth/projection pressure; not safe as artifact authority. | Run `PROJECTION-CONTRACT-SURFACE-FRAME.md` or decide garbage/projection owner. |
| `prohibit_legacy_plate_driver_and_plot_mountains_dependencies` | retained standard-recipe `_remainder` | Concrete retired dependency cleanup across selected standard-recipe files. | Split morphology contract cleanup from map-morphology implementation cleanup. |
| `prohibit_map_projection_dependencies_in_physics_contracts` | retained recipe-wide standard-recipe rules | Protects standard-recipe physics contracts from map projection dependencies. | Revisit only if physics contract families become parameterized projection-surface authority. |
| `verify_standard_recipe_artifacts_match_source_stages` | retained recipe-wide standard-recipe rules | Generated standard-recipe output parity is scoped to one recipe instance. | Keep contextual until projection/output parity is parameterized. |
| `prohibit_foundation_projection_legacy_motion_source` | retained foundation stage rules | Exact foundation projection step consumer guard. | Revisit only if a projection-step surface absorbs related cleanup rows. |
| `prohibit_migrated_consumer_effect_gating_tokens` | retained map stage rules | Guards one migrated map-hydrology consumer contract from retired gates. | Revisit during cleanup or dependency-tag lifecycle work. |
| `prohibit_misplaced_projection_adapter_calls` | retained map stage rules | Projection adapter callsite ownership, not artifact value authority. | Revisit after a parameterized projection-step or recipe-step callsite model exists. |
| `prohibit_morphology_dual_read_tokens` | retained morphology stage rules | Transitional morphology-coasts dual-read cleanup. | Retire when the migration cleanup is obsolete. |
| `prohibit_morphology_stage_config_bag_imports` | retained morphology stage rules | Morphology-stage import-boundary rule. | Revisit when consumer-side config facade rules are named generally. |
| `prohibit_morphology_story_overlay_contract_artifact` | retained morphology stage rules | Keeps narrative-owned story overlay artifacts out of morphology contracts. | Revisit if story/narrative artifact boundaries become positive authority. |
| `prohibit_runtime_continent_contract_tokens` | retained morphology stage rules | Contract/runtime-token separation in morphology contracts and artifact files. | Revisit when runtime-token forbids become positive contract-surface rules. |
| `ensure_studio_worker_bundle_is_browser_safe` | retained Studio browser-worker rules | Studio worker runtime safety; artifacts are allowed boundary text, not owner. | Revisit only if a future worker blueprint admits shared browser-worker requirements. |
| `require_studio_ui_recipe_artifact_imports` | retained Studio recipe-DAG rules | Studio UI/recipe-DAG import boundary for recipe artifacts. | Split later if UI artifact consumption becomes broader than recipe-DAG. |
| `verify_visualization_runtime_build_artifacts` | then-retained visualization `_blueprints` candidate; superseded by Domino 43 | Required `dist` build outputs, not product artifact contracts. | Process in targeted `_blueprints`/runtime-dependencies candidate pruning; completed by Domino 43 demotion to visualization `rules/`. |

Review disposition:

| Finding | Severity | Disposition | Repair Evidence |
| --- | --- | --- | --- |
| Reconcile the artifact row universe before moving anything. | P1 | accepted | Receipt defines 24 manifest-hit rows plus 4 runner/body-only exclusions. |
| Do not admit rows whose whole rule is dependency, domain, projection, generated-output, Studio, or context authority. | P1 | accepted | No live rule packet moved under `blueprints/artifact`. |
| Treat `prohibit_realized_map_artifact_tags` as projection/artifact debt, not live artifact authority. | P2 | accepted | Row retained in `map-output/_remainder`; ledger pending action updated. |
| Verification must prove movement, not just selection. | P2 | accepted | No rule movement occurred; closure proof uses corpus counts, path proof, classify, and diff checks. |

### 43. Run Targeted Garbage Or `_blueprints` Candidate Pruning

Purpose: delete, retire, demote, or fence misleading rows and candidate
destinations once the real dependency-tag and artifact destinations have been
tested or deliberately deferred.

Done Means:

- The targeted garbage or candidate-pruning input set is bounded by the
  preceding dependency-tag/artifact passes.
- Rows are removed only when behaviorless, duplicate, superseded by a positive
  rule, or explicitly retired.
- False `_blueprints` destinations touched by recent slices are demoted to
  honest niche `rules/`, `_remainder`, or active source owner lanes.
- No global `_blueprints` campaign runs without a bounded destination or
  garbage frame.

Moves It Forward:

- Apply the garbage pressure named in
  `.habitat/frames/DESTINATION-SIMPLIFICATION-FRAME.md`.
- Prefer deleting bad negative guards after a stronger positive rule exists.
- Prefer demoting fake candidates over preserving them as visual ontology.
- Leave config, adapter, projection, import-law, package-graph, and build
  surfaces out of blueprint authority unless a later frame admits a specific
  constructible owner.

Dependencies:

- Domino 42 exposes garbage or candidate pruning as the next highest-leverage
  move.

Proof:

- Deleted or demoted rows are named with the reason.
- Focused checks prove no behavior regression for retained rows.
- Static scans show touched fake destinations no longer appear as live
  `_blueprints` ambiguity.

Disposition receipt:

- Source-backed structure:
  - `packages/sdk` owns the Civ7 SDK authoring API and the explicit runtime-bound
    `@mateicanavra/civ7-sdk/mapgen` subpath.
  - `packages/mapgen-core` owns pure MapGen engine/core authoring, execution,
    helpers, artifacts, domains, recipes, compiler, and tracing.
  - `packages/mapgen-viz` owns shared visualization contract types and helpers
    consumed by MapGen Studio, dump tooling, and core/mod visualization emitters.
- Rejected nesting: SDK is not the parent of MapGen core or visualization.
  `@mateicanavra/civ7-sdk/mapgen` depends on MapGen core and the Civ7 adapter;
  it does not contain the core library or visualization contract package.
- Moved packets:

| Rule | From | To | Reason |
| --- | --- | --- | --- |
| `preserve_mapgen_core_runtime_neutrality` | `civ7/mapgen/core/_blueprints/mapgen-core-library` | `civ7/mapgen/core/rules` | Whole predicate protects `packages/mapgen-core` runtime neutrality; `mapgen-core-library` is not an admitted blueprint kind. |
| `prohibit_runtime_helper_redeclarations` | `civ7/mapgen/core/_blueprints/mapgen-core-library` | `civ7/mapgen/core/rules` | Whole predicate protects shared helpers exported by `@swooper/mapgen-core`; it is honest core-library niche authority. |
| `require_explicit_mapgen_sdk_opt_in` | `civ7/mapgen/sdk/_blueprints/mapgen-entrypoint` | `civ7/sdk/rules` | Whole predicate protects the Civ7 SDK root-vs-mapgen-runtime subpath boundary; it belongs directly under the SDK niche, not under MapGen and not under an extra SDK child niche. |
| `verify_visualization_runtime_build_artifacts` | `civ7/mapgen/visualization/_blueprints/runtime-dependencies` | `civ7/mapgen/visualization/rules` | Whole predicate checks visualization/runtime build-currentness; `runtime-dependencies` is not a blueprint kind. |

Residual scope:

- Platform, resources, docs, workspace, and toolkit `_blueprints` pockets remain
  for later bounded pruning. This slice intentionally clears only the
  SDK/core/visualization ambiguity and its directly dependent false blueprint
  pockets.

## Domino 44 Disposition Receipt

This receipt captures the SDK taxonomy correction requested after the initial
SDK/core/visualization pruning. It is a naming and grouping correction over the
already-demoted packets, not a new blueprint admission.

Source-backed structure:

- `packages/sdk` is the Civ7 modding SDK. Its Habitat authority lane is now
  `civ7/mod-sdk`, because its root concern is mod authoring, with the
  explicit runtime-bound `@mateicanavra/civ7-sdk/mapgen` subpath as an opt-in.
- `packages/mapgen-core` and `packages/mapgen-viz` are MapGen package surfaces.
  They now sit under `civ7/mapgen/sdk/{core,visualization}` to reflect the
  MapGen SDK grouping without implying ownership by the Civ7 mod SDK package.
- `map-output` is not touched in this slice. Its remaining physical
  `_remainder` row is still reserved for the projection contract surface frame.

Moved packets:

| Rule | From | To | Reason |
| --- | --- | --- | --- |
| `require_explicit_mapgen_sdk_opt_in` | `civ7/sdk/rules` | `civ7/mod-sdk/rules` | The predicate protects `packages/sdk` root-vs-mapgen-runtime subpath isolation, so the honest owner is the mod SDK lane. |
| `preserve_mapgen_core_runtime_neutrality` | `civ7/mapgen/core/rules` | `civ7/mapgen/sdk/core/rules` | The predicate protects the MapGen core package as part of the MapGen SDK package surface. |
| `prohibit_runtime_helper_redeclarations` | `civ7/mapgen/core/rules` | `civ7/mapgen/sdk/core/rules` | Shared deterministic helpers belong to the MapGen core package surface, not to the mod SDK. |
| `verify_visualization_runtime_build_artifacts` | `civ7/mapgen/visualization/rules` | `civ7/mapgen/sdk/visualization/rules` | The predicate checks MapGen visualization package/runtime dependency currentness under the MapGen SDK grouping. |

Residual scope:

- `.habitat/civ7/mapgen/map-output/_remainder/prohibit_realized_map_artifact_tags`
  remains the next focused projection-contract-surface decision.
- The three `mod-map` blueprint rows with `placement.niche:
  "civ7/mapgen/map-output"` remain for the following map-output cleanup, where
  their manifest niche should be reassessed separately from the physical
  remainder row.

## Domino 45 Disposition Receipt

This receipt closes the stale `map-output` lane after the SDK taxonomy
correction. It runs `PROJECTION-CONTRACT-SURFACE-FRAME.md` against the last
physical map-output remainder and updates the three remaining `mod-map`
manifests that still claimed `civ7/mapgen/map-output`.

Source-backed structure:

- `artifact:map.realized.*` is not a live projection surface. The canonical
  Phase 2 projection spec says `artifact:map.*` may describe stable projection
  or observation data products, `effect:map.*` describes execution guarantees,
  and `artifact:map.realized.*` must not be introduced.
- The realized namespace guard therefore belongs to the `artifact` blueprint
  as artifact ID namespace authority. No `projection-contract`,
  `artifact-contract`, `map-output`, or `map-projection` destination was
  created.
- The three `mod-map` rows still belong to the `mod-map` blueprint, but their
  stale `map-output` niche metadata did not justify a replacement
  `mod-integration` niche. The current predicates are tied to the Swooper Maps
  standard recipe lane: canonical map configs, `STANDARD_STAGES`, generated map
  entrypoints, and shipped catalog output.

Moved or recontextualized packets:

| Rule | From | To | Reason |
| --- | --- | --- | --- |
| `prohibit_realized_map_artifact_tags` | `civ7/mapgen/map-output/_remainder` | `blueprints/artifact` | The whole predicate governs an invalid artifact ID namespace. Positive projection semantics already live in the Phase 2 projection spec, so this does not need a new projection surface. |
| `block_studio_config_leakage_into_shipped_catalog` | `placement.niche: civ7/mapgen/map-output` | `placement.niche: civ7/mapgen/pipeline/swooper-maps-standard-recipe` | The guard protects generated/shipped catalog output for the current Swooper Maps standard recipe lane; it is not a standalone output niche or mod-integration area. |
| `protect_generated_map_entrypoints_from_hand_edits` | `placement.niche: civ7/mapgen/map-output` | `placement.niche: civ7/mapgen/pipeline/swooper-maps-standard-recipe` | Generated map entrypoints are produced from the current Swooper map config and standard recipe surface, while the reusable constructible kind remains `mod-map`. |
| `validate_generated_map_entrypoint_contracts` | `placement.niche: civ7/mapgen/map-output` | `placement.niche: civ7/mapgen/pipeline/swooper-maps-standard-recipe` | The executable imports `STANDARD_STAGES`, validates canonical map configs, and checks generated entrypoints; that is current standard-recipe context, not a generic output bucket. |

Residual scope:

- The physical `.habitat/civ7/mapgen/map-output/` lane is gone.
- Historical domino receipts may still mention map-output as the prior
  provisional lane; live manifests and current authority docs no longer do.

## Domino 47 Disposition Receipt

This receipt burns down the active `civ7/resources` `_blueprints` slice from
`UNDERSCORE-BLUEPRINT-BURNDOWN-FRAME.md`. It processes the `civ7-map-policy`
and `civ7-types` candidate pockets as resource/package operating areas, not as
affirmed blueprint kinds.

Metrics:

- Scoped `_blueprints` rows: 4.
- Candidate pockets processed: 2 (`civ7-map-policy`, `civ7-types`).
- Runner mix: 2 `habitat` file-layer generated-zone guards, 2 `habitat`
  script checks.
- Category mix: 3 `output`, 1 `boundary`.
- Source roots: `packages/civ7-map-policy/src/civ7-tables.gen.ts`,
  `packages/civ7-map-policy/src/**`, and `packages/civ7-types/generated/**`.
- Single-package/resource rows: 4.
- Cross-owner rows: 0.
- Deferred non-Civ7 rows inspected for hidden Civ7 resource authority: 12.
  Rows pulled into scope: 0.

Decision matrix:

| Rule | Decision | Destination | Reason | Pending action |
| --- | --- | --- | --- | --- |
| `block_hand_edits_to_generated_map_policy_tables` | move to child-niche rules | `civ7/resources/map-policy/rules` | Protects one official-resource-derived generated table surface for `@civ7/map-policy`; the remediation is the package verify/generate path, not a constructible blueprint instance. | Revisit only if protected generated-resource output becomes a parameterized generated-output capability or generator-owned rule. |
| `ensure_map_policy_dependency_independence` | move to child-niche rules | `civ7/resources/map-policy/rules` | Governs `@civ7/map-policy` package independence from runtime, MapGen, mods, Studio, and base-standard implementation imports. | Convert to a shared import-boundary enforcement surface only if later source-check extraction makes that destination explicit. |
| `preserve_evidence_provenance_labels` | move to child-niche rules | `civ7/resources/map-policy/rules` | Checks source-evidence labeling on the generated map-policy table; this is resource-derived package currentness, not a reusable blueprint kind. | Revisit if provenance validation moves into the map-policy generator or package-local verification target. |
| `block_hand_edits_to_generated_civ7_types` | move to child-niche rules | `civ7/resources/civ7-types/rules` | Protects the generated declaration surface owned by `@civ7/types`; `civ7-types` is a package/resource lane here, not a constructible blueprint kind. | Revisit only if external-resource generated declaration protection becomes a parameterized generated-output capability. |

Review lanes:

- Corpus auditor: every scoped resource `_blueprints` row received exactly one
  disposition, and `.habitat/civ7/resources/_blueprints` was removed.
- Semantic reviewer: no blueprint was admitted; `civ7-map-policy` and
  `civ7-types` were treated as child operating/resource lanes rather than kind
  names.
- Interface reviewer: manifests now point at the moved `baseline.json` and
  `check.ts` files under the new physical paths.
- Closure reviewer: the authority ledger records current placement, path,
  pending action, and Domino 47 evidence for all four rows.

Residual scope:

- `civ7/platform/_blueprints` is the next active Civ7 burndown loop and is
  handled by Domino 48 below.
- `docs`, `global/workspace`, and `habitat/toolkit` `_blueprints` rows remain
  deferred; none of their whole predicates hid Civ7 resource authority in this
  loop.

## Domino 48 Disposition Receipt

This receipt burns down the active `civ7/platform` `_blueprints` slice from
`UNDERSCORE-BLUEPRINT-BURNDOWN-FRAME.md`. It processes the adapter,
control-oRPC, direct-control session, and intelligence-bridge candidates as
platform operating areas, not as affirmed blueprint kinds.

Metrics:

- Scoped `_blueprints` rows: 5.
- Candidate pockets processed: 4 (`civ7-adapter`, `control-orpc`,
  `direct-control-session`, `intelligence-bridge`).
- Runner mix: 3 `grit`, 2 `habitat` script checks.
- Category mix: 5 `boundary`.
- Source roots: `packages/**/*.ts`, `packages/civ7-adapter/src/**`,
  `packages/civ7-control-orpc/src/modules/**/contract.ts`,
  `packages/civ7-control-orpc/src/index.ts`, `apps/**/*.ts(x)`,
  `packages/**/*.ts(x)`, and
  `mods/mod-civ7-intelligence-bridge/src/ui/civ7-intelligence-bridge.ts`.
- Single-package or single-surface rows: 3.
- Cross-owner platform-boundary rows: 2.
- Deferred non-Civ7 rows inspected for hidden Civ7 platform authority: 12.
  Rows pulled into scope: 0.

Decision matrix:

| Rule | Decision | Destination | Reason | Pending action |
| --- | --- | --- | --- | --- |
| `enforce_adapter_only_base_standard_imports` | move to child-niche rules | `civ7/platform/adapter/rules` | Guards the `@civ7/adapter` base-standard import boundary. The current Grit pattern covers package `.ts` import statements; it is adapter operating-area authority, not a full reusable adapter blueprint. | Broaden only if the Grit pattern is explicitly expanded beyond package `.ts` import forms. |
| `prohibit_adapter_local_legacy_generator_logic` | move to child-niche rules | `civ7/platform/adapter/rules` | Protects the current adapter package from growing product planning, RNG, or legacy generator logic. | Revisit only if adapter thinness becomes a shared adapter-kind rule with source-backed constructibility. |
| `preserve_transport_pure_orpc_contracts` | move to child-niche rules | `civ7/platform/control-orpc/rules` | Keeps control-oRPC contract files transport-pure while runtime control stays in procedures/services over direct-control ports. | Revisit if oRPC contract anatomy becomes a reusable service-contract blueprint. |
| `require_sanctioned_direct_control_session_owners` | move to child-niche rules | `civ7/platform/direct-control/session/rules` | Guards sanctioned direct-control session lifecycle owners across apps and packages. | Revisit if direct-control session lifecycle becomes a parameterized runtime capability rule. |
| `require_narrow_game_ui_bridge_bootstrap` | move to child-niche rules | `civ7/platform/game-ui-bridge/rules` | Guards the intelligence bridge mod bootstrap through the narrow `@civ7/control-orpc/game-ui` install surface. | Revisit if the bridge grows broader than the single narrow game-UI install surface. |

Review lanes:

- Corpus auditor: every scoped platform `_blueprints` row received exactly one
  disposition, and `.habitat/civ7/platform/_blueprints` was removed.
- Semantic reviewer: no blueprint was admitted; old candidate labels were
  treated as platform operating areas, package surfaces, or lifecycle surfaces.
- Interface reviewer: manifests now point at the moved `baseline.json`,
  `pattern.md`, and `check.ts` files under the new physical paths.
- Closure reviewer: the authority ledger records current placement, path,
  pending action, and Domino 48 evidence for all five rows.

Residual scope:

- The active Civ7 `_blueprints` burndown is complete: no
  `.habitat/civ7/**/_blueprints/**/rule.json` manifests remain.
- `docs`, `global/workspace`, and `habitat/toolkit` `_blueprints` rows remain
  deferred; none of their whole predicates hid Civ7 platform authority in this
  loop.

## Domino 49 Disposition Receipt

This receipt runs the Civ7 remainder atomicity pass requested after the
`_blueprints` burndown. The goal was not a metadata sweep. The goal was to
remove mixed-owner rule units that would pollute later category and inversion
sweeps.

Metrics:

- Starting Civ7 `_remainder` rows: 23.
- Mixed/split candidates processed: 7.
- Superseded aggregate rows removed: 7.
- New atomic live rules created: 12.
- Existing atomic rules widened to absorb a superseded aggregate: 2.
- Ending live rule manifests: 131.
- Ending Civ7 `_remainder` rows: 16.
- New child lanes introduced from source-backed owners:
  `civ7/mapgen/domains/narrative/rules` and
  `civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/hydrology/rules`.

Decision matrix:

| Old rule | Decision | Replacement / owner | Reason |
| --- | --- | --- | --- |
| `prohibit_foundation_contract_config_bags` | split and delete aggregate | `prohibit_foundation_op_contract_config_bags` in `civ7/mapgen/domains/foundation/rules`; `prohibit_foundation_step_contract_config_bags` in `civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/foundation/rules` | The old predicate mixed foundation domain operation contracts with standard-recipe foundation step contracts. |
| `require_owned_domain_config_catalog_surfaces` | split and delete aggregate | `require_morphology_config_facade_exports` in `civ7/mapgen/domains/morphology/rules`; `require_standard_recipe_tag_catalog_owner_tokens` in `civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules` | The old positive script mixed morphology config-facade exactness with standard recipe tag-catalog currentness. |
| `prohibit_runtime_continent_step_tokens` | split and delete aggregate | `prohibit_morphology_runtime_continent_step_tokens` in `stages/morphology/rules`; `prohibit_hydrology_runtime_continent_step_tokens` in `stages/hydrology/rules` | The old Grit rule mixed morphology implementation files with hydrology climate-baseline implementation files. |
| `preserve_morphology_contracts_and_overlay_ownership` | split and delete aggregate | `preserve_morphology_belt_driver_contracts` in `stages/morphology/rules`; `require_narrative_hotspot_overlay_owner` in `civ7/mapgen/domains/narrative/rules` | The old script mixed morphology belt-driver contract currentness with narrative HOTSPOTS overlay publisher ownership. |
| `prohibit_legacy_morphology_effect_gating_tokens` | split and delete aggregate | `prohibit_morphology_stage_legacy_effect_gates` in `stages/morphology/rules`; `prohibit_standard_tag_catalog_legacy_morphology_effect_gates` in standard-recipe `rules` | The old Grit rule mixed morphology stage source with the standard recipe tag catalog. |
| `prohibit_legacy_plate_driver_and_plot_mountains_dependencies` | split and delete aggregate | `prohibit_morphology_contract_legacy_plate_driver_dependencies` in `stages/morphology/rules`; `prohibit_map_morphology_legacy_plate_driver_dependencies` in `stages/map/rules` | The old Grit rule mixed morphology contract dependency cleanup with map-morphology projection implementation cleanup. |
| `prohibit_foundation_advanced_cast_merge_fragments` | consolidate and delete aggregate | Existing `prohibit_foundation_stage_cast_merge_hacks` and `prohibit_foundation_stage_sentinel_passthrough` in `stages/foundation/rules` | The old aggregate was already split by two narrower live foundation-stage rules; its missing named-token coverage was folded into those rules instead of creating a third duplicate. |

Review lanes:

- Foundation/config reviewer: confirmed the foundation config-bag row should
  split by source owner and must not be generalized into `domain-operation`.
- Morphology/recipe reviewer: confirmed the morphology/overlay/effect/plate
  rows should split by morphology stage, map stage, standard tag catalog, and
  narrative owner.
- Workstream owner disposition: no `_triage` lane was introduced; all new rows
  are live owner-context rules, and only source-backed child lanes were added.

Residual scope:

- The remaining Civ7 `_remainder` rows are no longer blocked by these seven
  mixed-owner aggregates.
- This slice deliberately did not perform the later metadata/category sweep.
  The next sweep should operate on the now-atomic corpus.

## Domino 50 Disposition Receipt

This receipt instantiates `.habitat/frames/REMAINDER-REMEDIATION-ACTION-FRAME.md`
for the reviewed Civ7 `_remainder` corpus and executes the first
implementation-ready slice: foundation consolidation and context admission.

Metrics:

- Starting live rule manifests: 131.
- Starting reviewed Civ7 `_remainder` rows: 16.
- Remainder action matrix rows recorded: 16.
- Selected foundation rows: 7.
- Moved from `_remainder` to `foundation/rules`: 2.
- Retired duplicate rule packets: 4.
- Retained foundation `_remainder` rows: 1.
- Ending live rule manifests: 127.
- Ending reviewed Civ7 `_remainder` rows: 10.

Selection rationale:

- The foundation cluster was the only source-qualified, implementation-ready
  high-confidence slice where deletion was strict consolidation rather than
  semantic invention.
- `prohibit_foundation_strategy_nonlocal_imports` already expresses the broad
  decomposed-strategy import boundary; the narrower strategy-shim/default-file
  rows were duplicate subsets.
- `prohibit_foundation_rules_tectonics_shim_reexports` already expresses the
  broad decomposed rules reexport boundary; the narrower rules-index shim row
  was a duplicate subset.
- `prohibit_foundation_duplicate_math_helper_redefinitions` stayed in
  `_remainder` because it points at a missing positive helper/import surface
  and should not be smuggled into `domain-operation` or generic math-helper
  authority.

Decision matrix:

| Rule | Remediation action | Decision | Destination / handling | Reason | Pending action |
| --- | --- | --- | --- | --- | --- |
| `prohibit_foundation_rules_tectonics_shim_reexports` | consolidation/dedup plus context admission | move to live foundation context | `.habitat/civ7/mapgen/domains/foundation/rules/prohibit_foundation_rules_tectonics_shim_reexports` | The whole predicate guards foundation decomposed operation `rules/**/*.ts` from re-exporting shared `lib/tectonics` shims. It is broad enough to subsume the narrower rules-index row without becoming `domain-operation` ontology. | Revisit only if an operation-internal rules surface becomes positive authority. |
| `prohibit_foundation_strategy_nonlocal_imports` | boundary inversion plus context admission | move to live foundation context | `.habitat/civ7/mapgen/domains/foundation/rules/prohibit_foundation_strategy_nonlocal_imports` | The whole predicate is the allowed import boundary for decomposed foundation strategy files: authoring, local contract, and local rules. It is foundation context authority, not a new `operation-strategy` blueprint. | Revisit only if a source-backed `operation-strategy` or positive strategy import-law surface is admitted. |
| `prohibit_foundation_strategy_shared_tectonics_lib_imports` | consolidation/dedup | retire duplicate | absorbed by `prohibit_foundation_strategy_nonlocal_imports` | Direct shared `lib/tectonics` strategy imports are already forbidden by the broader allowed-list predicate. | None; deleted as duplicate. |
| `prohibit_foundation_tectonics_rules_reexport_shims` | consolidation/dedup | retire duplicate | absorbed by `prohibit_foundation_rules_tectonics_shim_reexports` | `rules/index.ts` reexports are covered by the broader `rules/**/*.ts` reexport predicate. | None; deleted as duplicate. |
| `prohibit_foundation_tectonics_strategy_nonlocal_imports` | consolidation/dedup | retire duplicate | absorbed by `prohibit_foundation_strategy_nonlocal_imports` | The broader strategy import boundary covers `default.ts` and other decomposed strategy files. | None; deleted as duplicate. |
| `prohibit_foundation_tectonics_strategy_shim_imports` | consolidation/dedup | retire duplicate | absorbed by `prohibit_foundation_strategy_nonlocal_imports` | Shared `lib/tectonics` imports in default strategy files are already forbidden by the broader allowed-list predicate. | None; deleted as duplicate. |
| `prohibit_foundation_duplicate_math_helper_redefinitions` | positive authority creation | retain `_remainder` | unchanged | The row points at a missing positive helper/import surface around canonical foundation tectonics helpers. Current evidence is not enough to admit it as live context or blueprint authority. | Name the positive helper surface and prove consumers import it before deleting the negative proxy. |

Non-selected action groups recorded in the ledger:

- Map-config runtime/source-validation candidates:
  `prohibit_hydrology_map_config_key_tokens` and
  `prohibit_legacy_morphology_config_keys`.
- Deterministic authored-generation authority candidates:
  `prohibit_ambient_rng_in_authored_generation` plus split parts of
  `prohibit_ecology_fudge_terms_and_legacy_generator_surfaces`.
- Immediate garbage-collection candidate:
  `prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases`.
- Missing positive authority candidates:
  `validate_ecology_op_contract_quality`,
  `prohibit_wrapper_only_advanced_config`,
  `prohibit_legacy_morphology_module_imports`, and
  `prohibit_runtime_local_config_default_merging`.

Review disposition:

| Finding | Severity | Disposition | Repair evidence | Residual risk / follow-up |
| --- | --- | --- | --- | --- |
| Foundation duplicate strategy/default rows are strict subsets of the broader strategy import boundary. | P2 | accepted | Retired the three duplicate strategy rows and retained `prohibit_foundation_strategy_nonlocal_imports` under `foundation/rules`. | None for duplicate coverage; broader positive `operation-strategy` authority remains future work. |
| Foundation rules-index shim row is a strict subset of the broader rules reexport boundary. | P2 | accepted | Retired `prohibit_foundation_tectonics_rules_reexport_shims` and retained `prohibit_foundation_rules_tectonics_shim_reexports` under `foundation/rules`. | None for duplicate coverage; operation-internal rules surface remains future work. |
| Math-helper duplicate guard should not be admitted without a named positive helper surface. | P2 | accepted | `prohibit_foundation_duplicate_math_helper_redefinitions` remains in `_remainder`; ledger action matrix records positive-authority blocker. | Future helper/import surface domino. |
| Deterministic authored-generation is a bigger state reducer but is not implementation-ready until the mixed ecology/hydrology/placement row is split. | P3 | accepted as next-slice evidence | Ledger action matrix records the split/positive-authority blockers. | Candidate future domino after choosing whether to split RNG/generator clauses first. |
| Map-config token guards likely belong in native config validation, not Habitat domain rules. | P3 | accepted as next-slice evidence | Ledger action matrix records runtime/source-validation action for the two map-config rows. | Candidate future domino after proving native validation catches stale keys. |

Closure note:

- No new blueprint or niche was introduced.
- `.habitat/AUTHORITY-TREE-SHAPE.md` was not changed because the existing
  `foundation/rules` lane already existed.
- Execution-surface records were regenerated because rule paths changed.

### 51. Retire Clean Garbage-Collection Rule Residue

Purpose: execute the first clean Layer 2/Layer 3 garbage-collection slice from
the closed rule-remediation matrix, deleting only rules with source-backed
retirement packets and excluding the Studio devops row that still needs
survivor-authority work.

Controlling records:

- `.habitat/workstreams/rule-remediation-layer1-action-matrix.md`
- `.habitat/workstreams/rule-remediation-retirement-slice.md`

Decision matrix:

| Rule | Decision | Handling | Proof boundary | Residual follow-up |
| --- | --- | --- | --- | --- |
| `prohibit_domain_tag_artifact_shim_imports` | retire | deleted | source and consumer absence for retired `@mapgen/domain/tags` / `@mapgen/domain/artifacts` shim imports | Broader domain import/public-surface inversion remains separate. |
| `prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases` | retire | deleted | source absence plus stage topology/native no-shadow proof | No permanent cutover lane retained. |
| `prohibit_narrative_swatches_stage_token` | retire after absorption | deleted | standard recipe topology/manifest excludes retired `narrative-swatches` stage token | Standard topology inversion remains separate. |
| `require_full_profile_domain_stage_roots` | retire after absorption | deleted | standard recipe topology/manifest surfaces cover the stage-root set | Profile parameterization, if ever needed, is future authority work. |
| `prohibit_morphology_dual_read_tokens` | retire | deleted | source absence plus native no-shadow proof for completed dual-read cleanup | None. |
| `prohibit_retired_studio_devlive_daemon_file` | exclude | retained | file absence exists, but survivor authority is not sealed | Revisit in Studio devops topology repair/consolidation. |

Moves it forward:

- Removes five stale lexical, transitional, or absorbed cleanup guards from the
  live Habitat rule corpus.
- Drops the live rule count from 127 to 122.
- Keeps the blocked Studio devops cleanup rule visible instead of deleting it
  without a survivor authority.

Review disposition:

| Finding | Severity | Disposition | Repair evidence | Residual risk / follow-up |
| --- | --- | --- | --- | --- |
| Five retirement rows had clean source-backed deletion packets. | P2 | accepted | Deleted the five rule packets and moved their ledger entries to stale/retired references. | Execution-surface docs regenerated because rule paths changed. |
| `prohibit_retired_studio_devlive_daemon_file` was not safely retire-able. | P2 | accepted | Retained the rule; the retirement-slice record marks Layer 1 direct-deletion readiness stale for this row. | Studio devops topology repair/consolidation must decide survivor authority. |

Closure note:

- No new blueprint, niche, or catch-all bucket was introduced.
- This slice intentionally stopped before hairy semantic splits and positive
  kind/deletion pairs.
- The current corpus is ready for the next action-class slice after verification
  and Graphite closure.

### 52. Admit Domain Operation Strategy Blueprint Authority

Purpose: assert the product-backed blueprint destination for MapGen domain
operation strategies without forcing current foundation-local or helper
cleanup rules into the wrong authority.

Source-backed constructibility:

- MapGen op authoring docs require a strategy surface and bind operations with
  `defineOp({ ..., strategies })` plus `createOp(Contract, { strategies })`.
- The glossary and ops-module contract define ops as strategy envelopes used
  within steps.
- `packages/mapgen-core/src/authoring/op/contract.ts` requires strategy config
  schemas and builds the operation config envelope.
- `packages/mapgen-core/src/authoring/op/create.ts` rejects missing or unknown
  strategy implementations and dispatches normalize/run by selected strategy.
- `packages/mapgen-core/src/authoring/op/strategy.ts` defines
  `createStrategy` and the typed strategy implementation surface.
- Current source has 104 strategy implementation files and 104
  `createStrategy(...)` calls across foundation, morphology, hydrology,
  ecology, resources, and placement domains.

Disposition:

| Row | Decision | Reason | Follow-up |
| --- | --- | --- | --- |
| `domain-operation-strategy` | admit blueprint authority | The construct has independent source shape: strategy id, config schema, optional normalization, run function, and op-contract binding. | Future whole-rule strategy predicates can target `.habitat/blueprints/domain-operation-strategy/`. |
| `prohibit_foundation_strategy_nonlocal_imports` | no move | The predicate is a foundation-specific allowed import list, not every valid operation strategy. | Design a generic positive strategy-locality rule before moving or deleting this guard. |
| `prohibit_foundation_duplicate_math_helper_redefinitions` | no move | The predicate is helper-surface consolidation across strategy and non-strategy files. | Name positive helper/import authority before deletion or admission. |
| `validate_ecology_op_contract_quality` | no move | The predicate is ecology operation contract-quality pressure, not strategy implementation authority. | Define general operation contract-quality authority and repair stale ecology path coverage. |

Moves it forward:

- Creates `.habitat/blueprints/domain-operation-strategy/README.md` as the
  admitted authority lane.
- Updates `AUTHORITY-TREE-SHAPE.md` and supersedes the older
  `DESTINATION-SIMPLIFICATION-FRAME.md` exclusion.
- Converts the Layer 1 action matrix and former authority-tree rule ledger into
  one canonical JSON operational record so future metrics and process queries
  do not depend on brittle Markdown parsing or duplicated matrices.

Review disposition:

| Finding | Severity | Disposition | Repair evidence | Residual risk / follow-up |
| --- | --- | --- | --- | --- |
| `domain-operation-strategy` is constructible and product-backed. | P2 | accepted | Authority lane and tree-shape docs created. | Generic strategy-locality or strategy-contract rules still need decision packets before movement. |
| No current live rule moves whole into the new authority. | P2 | accepted | Explicit non-move dispositions recorded in slice, ledger, and blueprint README. | Avoid using `strategies/**/*.ts` scan roots as an owner test. |
| The old authority-tree rule ledger still looked like a second current-state matrix. | P2 | accepted | Absorbed its unique process data into `.habitat/workstreams/rule-remediation-layer1-action-matrix.json` under `processLedger`; replaced the Markdown ledger with a pointer. | None; JSON is the active source of truth. |

Closure note:

- No rule manifests, runners, support files, or execution-surface docs changed.
- This slice does not delete any negative guard and intentionally stops before
  positive-kind assertion/deletion pairs.
- The current live corpus remains 122 rules.

### 53. Unite Layer 2 Packet State Into Canonical Rule Matrix

Purpose: prevent a second source of truth for rule remediation state while
making Layer 2 resume/queue information parseable.

Disposition:

| Record | Decision | Reason | Follow-up |
| --- | --- | --- | --- |
| `.habitat/workstreams/rule-remediation-layer1-action-matrix.json` | extend canonical union | The same JSON record now owns the Layer 1 matrix, former process ledger, stale references, Layer 2 packet index, blockers, and next queue. | Future agents should query `layer2PacketIndex` instead of creating a separate packet-index table. |
| `.habitat/workstreams/rule-remediation-retirement-slice.md` | source reference repair | The receipt still named the archived Markdown matrix as its source. | Slice receipts may reference the canonical JSON, but they are not operational sources of truth. |

Moves it forward:

- Adds `layer2PacketIndex` inside the canonical JSON union record.
- Records the two closed Layer 2/3 slices: garbage collection and
  domain-operation-strategy authority admission.
- Records the only immediately implementation-ready slice as low-leverage
  metadata repair.
- Records the next packet candidates and sealed blockers without duplicating
  the full current rule matrix.

Closure note:

- No authority-tree rule packets, manifests, runners, support files, or source
  code changed.
- This is a process-ground-truth repair only; mutation still requires the
  appropriate Layer 3 slice record.

### 54. Packet Config-Key Native Schema Replacement

Purpose: complete the Layer 2 decision packet for the stale map-config key
guards without mutating the authority tree.

Status: superseded by Domino 55. The owner diagnosis remains useful evidence,
but the package negative-test proof strategy is no longer accepted.

Disposition:

| Rule | Decision | Reason | Layer 3 requirement |
| --- | --- | --- | --- |
| `prohibit_hydrology_map_config_key_tokens` | replace/narrow by source schema authority, not broad deletion | The Grit predicate overmatches: `lakes` is current public config under `hydrology-hydrography`, while stale stage/internal forms belong to canonical recipe/map config validation. | Superseded: do not add package negative tests as the replacement rail. Domino 55 returns this to Layer 2 for source-owned schema/key authority. |
| `prohibit_legacy_morphology_config_keys` | replace by source schema authority | `landmass` and `oceanSeparation` are stale lexical cleanup against old TS surfaces; current Morphology public schemas and canonical map config validation own rejection. | Superseded: do not add package negative tests as the replacement rail. Domino 55 returns this to Layer 2 for source-owned schema/key authority. |

Moves it forward:

- Records the full decision packet under
  `.habitat/workstreams/rule-remediation-layer1-action-matrix.json`
  `layer2PacketIndex.decisionPacketBatches`.
- Initially moved the config-key slice into the implementation-ready queue;
  Domino 55 corrected this and returned the slice to Layer 2.

Closure note:

- No rule packets, manifests, runners, support files, tests, or source files
  changed in this packet-only slice.
- This packet is no longer implementation-ready. The corrected next move is
  named in Domino 55.

### 55. Correct Config-Key Proof Owner

Purpose: repair Domino 54's proof model before any Layer 3 mutation can move
retired config-key pressure back into package-owned tests.

Status: superseded by Domino 56. The package-test correction remains
normative; the later state-collapse decision deletes the retired literal
assertions without replacement instead of returning them to Layer 2.

Disposition:

| Surface | Correction | Reason | Next action |
| --- | --- | --- | --- |
| `prohibit_hydrology_map_config_key_tokens` | returned to Layer 2 packet repair | The prior packet correctly found that the broad lexical predicate overmatches live public `hydrology-hydrography.lakes`, but incorrectly used package negative tests as the replacement rail. | Re-packet as source-owned schema/key authority, optionally protected by Habitat schema-surface authority, before narrowing or retiring the lexical proxy. |
| `prohibit_legacy_morphology_config_keys` | returned to Layer 2 packet repair | `landmass` and `oceanSeparation` are stale public-config tokens, but package tests must not become a junk drawer for retired property blacklists. | Decide whether existing closed public schemas are sufficient source authority, whether source key management needs strengthening, or whether Habitat should assert the schema surface structurally. |

Moves it forward:

- Corrects `.habitat/workstreams/rule-remediation-layer1-action-matrix.json`
  so `config-key native-schema replacement` is no longer marked
  implementation-ready.
- Initially added `config-key source schema authority replacement` back to the
  Layer 2 packet queue; Domino 56 superseded that by deleting the retired
  literals without replacement.
- Keeps the canonical JSON as the single operational source of truth; this
  receipt only explains the correction.

Authority basis:

- `.habitat/AUTHORITY.md` stops slices that use tests as structural gates
  without Habitat registration or explicit product-test classification.
- `.habitat/FRAME.md` separates Habitat structural authority from package
  behavior/API/validation tests and keeps proof classes separate.
- MapGen schema policy and config-compilation reference place unknown-key
  rejection in strict source schemas and compilation, not in per-token package
  test residue.

Closure note:

- No authority rule packets, runners, support files, package tests, or source
  files changed.
- The next config-key move is not Layer 3 deletion. It is a corrected Layer 2
  packet for source-owned schema/key authority or Habitat schema-surface
  authority.

### 56. Retire Config-Key Literal Assertions

Purpose: apply the state-collapse correction for retired config keys.

Disposition:

| Rule | Action | Reason | Record |
| --- | --- | --- | --- |
| `prohibit_hydrology_map_config_key_tokens` | deleted without replacement | Retired hydrology config-key literals do not need live negative assertions. The one live collision, `hydrology-hydrography.lakes`, proves the broad lexical rule is actively misleading. Valid key-space belongs to source schemas, TypeScript types, and config compilation. | `.habitat/workstreams/rule-remediation-config-key-retirement-slice.md` |
| `prohibit_legacy_morphology_config_keys` | deleted without replacement | `landmass` and `oceanSeparation` are retired public-config names, not likely recurrence risks that deserve Habitat law or package-test blacklists. Current Morphology config shape is structurally owned by closed public schemas and compilation. | `.habitat/workstreams/rule-remediation-config-key-retirement-slice.md` |

Moves it forward:

- Deletes two `_remainder` rule packets instead of replacing them with package
  negative tests or new Habitat negative assertions.
- Updates the canonical JSON row counts and retired-history records.
- Updates the rule remediation method frames so future agents treat retired
  literals as state-collapse candidates before inventing replacement rails.

Closure note:

- No package tests or source config behavior changed.
- The proof claim is authority-tree cleanup: retired literal assertions are
  gone, no replacement junk was added, and the config pipeline remains owned by
  source schemas, TypeScript types, and compilation.

## Domino 57: Repair Studio Recipe-DAG Owner Metadata

Status: closed on `codex/habitat-studio-recipe-dag-owner-repair`.

Purpose: close the remaining implementation-ready Layer 3 metadata slice by
repairing the lone Studio recipe-DAG rule whose predicate belonged to
`mapgen-studio` but whose manifest still declared `ownerProject: "habitat"`.

Disposition receipt:

| Rule id | Prior ownerProject | New ownerProject | Decision | Receipt |
| --- | --- | --- | --- | --- |
| `require_studio_ui_recipe_artifact_imports` | `habitat` | `mapgen-studio` | Metadata-only repair. Keep the accepted Studio recipe-DAG boundary predicate, placement, category, runner, support files, and deferred split trigger. | `.habitat/workstreams/rule-remediation-studio-recipe-dag-owner-slice.md` |

Moves it forward:

- Aligns the rule with adjacent Studio recipe-DAG rules already owned by
  `mapgen-studio`.
- Removes the last implementation-ready metadata-repair row from the canonical
  Layer 3 queue.
- Leaves the future semantic trigger intact: split only if UI artifact
  consumption becomes broader than the recipe-DAG lane.

Closure note:

- No source code, package tests, predicate text, category, placement, runner, or
  support files changed.
- The proof claim is ownership metadata alignment for Habitat routing and
  execution-surface projection.

## Domino 58: Replace G4 Recipe Domain Import Proxies With Positive Matrix

Status: closed on `codex/habitat-g4-domain-import-matrix`.

Purpose: close the next Layer 2 -> Layer 3 boundary-inversion slice by
collapsing three overlapping G4 recipe-domain import proxy rules into one
positive Grit import matrix.

Disposition receipt:

| Rule id | Action | Reason | Receipt |
| --- | --- | --- | --- |
| `require_public_domain_surfaces_in_recipes_and_maps` | preserved and narrowed to recipe-source G4 authority | This is the surviving positive import matrix for `mods/mod-swooper-maps/src/recipes/**`: allow domain root, `/ops`, `/ops/index.js`, and `/config.js`; forbid deeper alias tails and known relative reaches into `src/domain`. | `.habitat/workstreams/rule-remediation-domain-import-matrix-slice.md` |
| `prohibit_relative_domain_reaches_from_recipes_and_maps` | absorbed/deleted | The recipe-source predicate is covered by the survivor rule; map-source clauses are excluded from this first G4 enforcement because the accepted architecture packet only authorizes `src/recipes/**` at this stage. | `.habitat/workstreams/rule-remediation-domain-import-matrix-slice.md` |
| `restrict_recipes_to_public_domain_surfaces` | absorbed/deleted | The unknown-tail predicate is covered by the survivor rule's positive allowed-surface matrix. | `.habitat/workstreams/rule-remediation-domain-import-matrix-slice.md` |

Moves it forward:

- Replaces overlapping negative proxy packets with one Grit rule instead of a
  bespoke script or package-owned tests.
- Repairs the one current source violation by exporting
  `DEFAULT_ELEVATION_SCALE` from the public morphology ops surface and updating
  the standard recipe import to use that surface.
- Updates the canonical JSON so the current live corpus is 118 rules and the
  G4 packet no longer appears in the next Layer 2 queue.

Closure note:

- Nx project boundaries remain the project-plane owner; this slice is below
  that granularity and stays in Habitat/Grit.
- Map-source clauses remain excluded pending a map-specific authority decision.
- The next recorded move is Layer 2 packet selection from the canonical JSON.

## Domino 59: Derive Standard Recipe Stage Topology From Source Authority

Status: closed on `codex/habitat-standard-recipe-topology-rail`.

Purpose: close the standard recipe stage-root topology sub-slice without
collapsing it into the adjacent G9 wrapper-only `advanced` config guard.

Disposition receipt:

| Rule id | Action | Reason | Receipt |
| --- | --- | --- | --- |
| `preserve_standard_stage_topology_and_path_invariants` | preserved and converted from structure runner to source-derived script runner | Active standard recipe stage roots are already declared in `contract-manifest.ts` and the `orderStandardStages` call in `recipe.ts`; the old `structure.toml` repeated a hardcoded inventory and treated support hubs as required stage roots. | `.habitat/workstreams/rule-remediation-standard-recipe-topology-slice.md` |
| `prohibit_wrapper_only_advanced_config` | excluded and requeued | This row is G9 wrapper-only `advanced` recurrence pressure, not stage-root topology. It remains live until a separate consolidation/source-validation packet can absorb or replace it without package-test blacklist assertions. | `.habitat/workstreams/rule-remediation-standard-recipe-topology-slice.md` |

Moves it forward:

- Replaces a stale hardcoded stage-root list with a Habitat script that parses
  the runtime recipe and contract manifest source, compares their stage ids, and
  checks the filesystem topology.
- Keeps `ecology`, `foundation`, and `morphology` visible as support hubs rather
  than pretending they are active stages.
- Preserves the user correction that package tests are not junk drawers for
  retired or wrapper-key assertions.

Closure note:

- The proof claim is standard recipe stage-root topology, not stage order,
  step parity, config schema behavior, or support-hub rehoming.
- The next recorded move is a Layer 2 packet for G9 wrapper-only `advanced`
  guard consolidation from the canonical JSON.

## Domino 60: Admit G9 Advanced Guard To Standard Recipe Context

Status: closed on `codex/habitat-g9-advanced-guard-context`.

Purpose: close the G9 wrapper-only `advanced` guard packet without deleting the
guard or moving stale key pressure into package tests.

Disposition receipt:

| Rule id | Action | Reason | Receipt |
| --- | --- | --- | --- |
| `prohibit_wrapper_only_advanced_config` | moved from `pipeline/config/_remainder` to `swooper-maps-standard-recipe/rules` | Current G9 guardrail docs explicitly retain this Habitat source-shape guard for standard recipe source and map configs. It is not garbage, and it is not a package-test assertion. | `.habitat/workstreams/rule-remediation-g9-advanced-guard-context-slice.md` |

Moves it forward:

- Removes one `_remainder` row by admitting it to the honest current context.
- Keeps source schemas/config compilation as behavior authority while Habitat
  owns the source-shape recurrence guard.
- Avoids creating a broad config blueprint before that authority exists.

Closure note:

- The proof claim is placement/context admission for the existing G9 Grit guard.
- The slice does not create generic config authority and does not replace the
  guard with package tests.

## Domino 61: Retire Hardcoded Standard Stage-Key Freeze

Status: closed on `codex/habitat-retire-standard-stage-key-freeze`.

Purpose: remove duplicate hardcoded standard stage-key state after the standard
recipe topology rail became source-derived.

Disposition receipt:

| Rule id | Action | Reason | Receipt |
| --- | --- | --- | --- |
| `verify_standard_recipe_declared_stage_keys` | retired/deleted | The rule hardcoded the accepted stage id list and parsed `recipe.ts`; stage ids are now compared from `recipe.ts` and `contract-manifest.ts` by the topology rail, while runtime/contract parity remains live for stage and step order. | `.habitat/workstreams/rule-remediation-standard-stage-key-freeze-retirement-slice.md` |

Moves it forward:

- Removes one duplicate Habitat rule and one hardcoded stage-id list.
- Keeps the distinct topology, runtime/contract parity, generated artifact
  parity, and public authoring-surface checks intact.

Closure note:

- The proof claim is duplicate retirement only.
- This does not change the standard recipe stage set or generated outputs.

## Domino 62: Repair Studio DevOps Source-Watch Topology

Status: closed on `codex/habitat-studio-devops-topology-source-watch`.

Purpose: repair the Studio devops survivor rule to current source-watch daemon
authority, then retire the separate `devLive.ts` absence packet.

Disposition receipt:

| Rule id | Action | Reason | Receipt |
| --- | --- | --- | --- |
| `enforce_studio_dev_runner_topology` | preserved and repaired | The live `serve-daemon` target and source-watch handoff require `bun --conditions bun-source --watch src/server/daemon/daemon.ts`; the Habitat rule still expected the old plain Bun command. | `.habitat/workstreams/rule-remediation-studio-devops-topology-source-watch-slice.md` |
| `prohibit_retired_studio_devlive_daemon_file` | retired/deleted | The survivor devops topology rule now owns retired `src/server/daemon/devLive.ts` absence directly, so the single-file structure packet no longer owns a separate surface. | `.habitat/workstreams/rule-remediation-studio-devops-topology-source-watch-slice.md` |

Moves it forward:

- Removes the last direct retirement/garbage-collection row from the canonical
  queue.
- Aligns Studio devops authority with the source-watch daemon handoff.
- Keeps runtime hot-reload product proof out of this structural slice.

Closure note:

- The proof claim is structural devops topology, not a live daemon restart
  product test.

## Domino 63: Admit Morphology Public-Surface Import Boundary

Status: closed on `codex/habitat-morphology-public-surface-boundary`.

Purpose: replace the morphology `_remainder` retired-module import proxy with
live public-surface import authority, without turning a Grit-shaped predicate
into a Habitat script or package test.

Disposition receipt:

| Rule id | Action | Reason | Receipt |
| --- | --- | --- | --- |
| `prohibit_legacy_morphology_module_imports` | retired/replaced | The retired `@mapgen/domain/morphology/<legacy>` blacklist was a proxy for a missing public-surface import boundary. | `.habitat/workstreams/rule-remediation-morphology-public-surface-boundary-slice.md` |
| `require_morphology_public_surface_imports` | created/admitted | Non-domain consumers now have one live Grit rule that permits Morphology imports through the root, `/ops`, `/ops/index.js`, or `/config.js` surfaces. | `.habitat/workstreams/rule-remediation-morphology-public-surface-boundary-slice.md` |

Moves it forward:

- Removes the Morphology `_remainder` import-boundary row.
- Converts a retired-path negative assertion into live public-surface import
  authority.
- Keeps this as a Grit rule because the predicate is static import/export
  source shape.
- Leaves the existing G4 recipe-domain import matrix as recipe-wide authority;
  this row owns morphology-specific consumer relapse detection.

Closure note:

- Nx project boundaries remain project-plane authority and were not changed.
- No package-owned tests or bespoke Habitat script were introduced.

### 46. Resume Authority Activation Projection Work

Purpose: return to narrow projection, metadata pruning, and runner discovery
only after the next real destinations and major false destinations stop
distorting the authority tree.

Done Means:

- The authority tree has enough admitted dependency-tag, artifact, recipe,
  domain, domain-operation, and mod-map shape to justify projection work.
- Any projection adapter is explicitly an adapter, not the ontology source.
- The next runner or metadata change consumes admitted authority rather than
  deriving ontology from packet paths or stale manifests.

Moves It Forward:

- Build only the projection path needed by admitted slices.
- Prune transitional packet metadata when moved authority owns the facts.
- Rebuild broad runner discovery only after enough admitted authority exists.

Dependencies:

- Dependency-tag and artifact direction have been resolved.
- Garbage or candidate-pruning pressure no longer dominates the next move.

Proof:

- Focused Toolkit or selected-rule proof exercises the projected slice.
- Review can map runner behavior back to admitted authority, not path guesses.

## Reorder/Falsifier Gates

Reorder the sequence if any of these become true:

- A future bounded pocket cannot place most current evidence under a small set
  of kind blueprints or one coarse transitional context without inventing a
  broad replacement taxonomy.
- A bounded slice creates more new capability or niche buckets than
  blueprint-owned rules.
- A named variant such as `standard recipe` has to be treated as a blueprint
  for the slice to proceed.
- A slice requires MapGen runtime/product proof before authority movement can
  be observed.
- The narrow projection adapter cannot be built without a full runner rebuild.
- Two branches in a row add docs or ledgers without moving, admitting, pruning,
  deleting, demoting, or proving a concrete authority surface.

Stop and reframe if the work starts treating runner labels, packet names,
categories, or current folder paths as ontology instead of transition evidence.

## Closure Contract

Every branch in this sequence must close with:

- the before/after authority state named in plain language;
- the exact domino it advances or falsifies;
- proof classes labeled honestly;
- broad `habitat check` excluded from proof unless the branch is the runner
  rebuild domino;
- stale metadata, compatibility bridges, and deferred cleanups named if they
  remain in the touched slice;
- Graphite branch and commit state clean.

The user should be able to read the branch and know what changed in the model,
what became easier next, and what still has to be knocked down.
