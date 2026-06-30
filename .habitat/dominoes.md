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
7. `.habitat/AUTHORITY.md`, `.habitat/AUTHORITY-TREE-SHAPE.md`,
   `.habitat/AUTHORITY-TOOL-SEPARATION.md`, `.habitat/ARTIFACT-KINDS.md`, and
   `.habitat/SUBJECT-CATEGORIES.md`.
8. Completed slice frames such as `.habitat/AUTHORITY-DOMAIN-KIND-SLICE.md`
   as precedent and evidence, not as the next active selector.
9. Current `.habitat` tree shape, generic packet role files, Toolkit behavior,
   and fresh command evidence.
10. Historical branch, PR, and session context as discovery material only.

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
| 8. Define artifact kinds | Check, fix, generate, and migrate were recorded as mutability and execution intent kinds. |
| 9. Define authority tree shape | The current transitional niche, blueprint, category, kind, and packet path was documented. |
| 10. Flatten and correct the tree | Layer buckets collapsed into the current visible authority-tree projection. |
| 11. Bridge selected package callers | Curated selected-rule execution proved package callers can route through Habitat without direct `.habitat` script paths. |
| 12. Retire source-check as a driver | Source-check-shaped work was moved or demoted enough that it no longer owns the next plan. |
| 13. Extract mixed command checks | Mixed command-check packets were split enough to prove proof-class separation and stop treating the junk drawer as the center. |
| 14. Close triage/residual owner cleanup | Triage packets and residual owners were removed, moved, or retained honestly enough to expose the ontology problem. |
| 15. Polish authority ontology and frame | The ontology and operating frame now name Habitat, blueprint, instance, capability, niche, and proof-class separation as the governing model. |
| 16. Normalize packet role metadata | Child files use generic role names, `rule.json` stopped carrying owner-tool/detect/scope duplication, and packet `category.md` files are gone. |
| 17. Make rule manifests location independent | `rule.json` now owns stable rule identity, current placement inventory facts, explicit runner file references, and explicit artifact references; Toolkit discovery no longer depends on the packet path grammar. |
| 18. Frame bounded authority slice work | `AUTHORITY-SLICE-FRAME.md` now governs bounded kind-family slices, supersedes broad pilot-corpus selection, and sets the Recipe Kind Pocket as the first working example. |
| 19. Move the Recipe Kind Pocket | Standard-recipe evidence was physically moved into `recipe`, `recipe-stage`, `recipe-step`, `swooper-maps-standard-recipe`, and coarse `mapgen-pipeline` contexts while preserving rule IDs and execution behavior. |
| 20. Select the Domain Operation Kind Pocket | Re-reading the changed Recipe slice selected `domain-operation` and bounded strategy-file pressure as the next slice; `AUTHORITY-DOMAIN-OPERATION-SLICE.md` now specifies the implementation boundary. |
| 21. Move the Domain Operation Kind Pocket | The misplaced map projection/effect dependency guard moved into `domain-operation`; foundation strategy rows stayed contextual with consolidation pressure instead of becoming blueprints by path inheritance. |
| 22. Unnest Rule Packet Paths | Category and artifact-kind directories were removed from live packet paths, leaving location-independent manifests in flatter blueprint/context lanes. |
| 23. Split Affirmed Blueprints From Candidates | Affirmed Recipe and Domain Operation pockets moved to top-level `.habitat/blueprints/`; not-yet-affirmed niche-local blueprint-shaped inventories were renamed `_blueprints/` so they no longer visually claim blueprint authority. |
| 24. Move the Domain Kind Pocket | Domain public-surface and direct domain-root rules moved into affirmed `.habitat/blueprints/domain/`; the mixed config validator stayed contextual, and the standard-recipe tag cleanup moved to the standard-recipe context instead of becoming domain authority. |
| 25. Frame contextual remainder slices | `AUTHORITY-REMAINDER-SLICE-FRAME.md` now governs how to reassess concrete-context remainders after parent kinds have moved, with morphology selected as the first method seed. |
| 26. Move the Morphology Remainder Pocket | All twelve morphology-domain primary rows were reviewed and physically moved to `.habitat/civ7/mapgen/domains/morphology/_remainder/`; their manifests now mark `placement.blueprint` as `_remainder`, none fit `domain` or `domain-operation` as whole-rule authority, and none remained honest intentional `morphology/rules` authority. |
| 27. Move the Foundation Remainder Pocket | The foundation-domain pocket was reviewed against `domain` and `domain-operation`; six rules stayed as intentional foundation currentness or retired-token context, six rules moved to `.habitat/civ7/mapgen/domains/foundation/_remainder/`, and no foundation label, strategy-file row, or legacy cleanup row was promoted into blueprint authority. |
| 28. Normalize Niche Child Context Lanes | Concrete domain contexts now live as child niches under `.habitat/civ7/mapgen/domains/`: `foundation/rules`, `foundation/_remainder`, `morphology/_remainder`, and `ecology/rules`. The move removes context directories from under `rules/` or root `_remainder/` without changing rule identity or behavior. |
| 29. Sort Direct Foundation Domain Rows | The remaining direct `prohibit_foundation_*` rows under parent `.habitat/civ7/mapgen/domains/rules/` were reviewed and physically sorted: two moved to `.habitat/civ7/mapgen/domains/foundation/rules/`, six moved to `.habitat/civ7/mapgen/domains/foundation/_remainder/`, none stayed parent-domain authority, and none moved to `domain` or `domain-operation`. |
| 30. Sort Remaining Direct Domains-Lane Rows | The remaining direct rows under parent `.habitat/civ7/mapgen/domains/rules/` were reviewed and physically sorted: one moved to affirmed `domain-operation`, three hydrology rows moved to `.habitat/civ7/mapgen/domains/hydrology/_remainder/`, one mixed morphology/config validator moved to `.habitat/civ7/mapgen/domains/morphology/_remainder/`, and the retired narrative-swatches stage-token row moved out of the domains lane to the standard-recipe context. No row stayed under parent `domains/rules`. |

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
means each manifest-owned `runner.files` and `artifacts.baseline` path exists
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

| Rule id | Bucket | Target or retained context | Source evidence | Reason | Proof needed/run | Reusable lesson |
| --- | --- | --- | --- | --- | --- | --- |
| `prohibit_rng_callback_state_in_ops` | existing blueprint authority | `blueprints/domain-operation` | `pattern.md` scans `mods/mod-swooper-maps/src/domain/*/ops/**/*.ts`; hydrology operation contracts document RNG crossing the op boundary as `rngSeed` data. | The whole rule governs valid domain operations generally: domain ops should reject ambient RNG callback/state surfaces. | selected-rule Grit proof passed; path refs exist | Cross-domain operation runtime discipline should move to `domain-operation` when the predicate applies to every operation module. |
| `prohibit_hydrology_climate_intervention_tokens` | external enforcement-surface pressure | `hydrology/_remainder` | `pattern.md` scans `src/domain/hydrology` plus standard recipe hydrology stages for `climate.swatches` and `climate.story`. | The row is a hydrology-plus-stage narrative intervention boundary guard; it is not parent domains authority and does not fit `domain-operation` because it also governs stage files. | selected-rule Grit proof passed; path refs exist | Hydrology rows that mix domain source and recipe stage source should defer until the hydrology context or recipe-stage owner is clearer. |
| `prohibit_hydrology_map_config_key_tokens` | cleanup/consolidation/split pressure | `hydrology/_remainder` | `pattern.md` scans map config source for retired hydrology climate, lakes, and rivers config keys. | The row is retired hydrology map-config cleanup, not parent domains authority or a `domain` kind contract as written. | selected-rule Grit proof passed; path refs exist | Retired map config key forbids should not remain parent-domain authority merely because the keys are domain-shaped. |
| `prohibit_hydrology_narrative_domain_imports` | missing positive kind governance | `hydrology/_remainder` | `pattern.md` scans hydrology domain and hydrology stage files for imports from `@mapgen/domain/narrative/*`. | The likely durable invariant is a positive public-surface/import boundary, but the current predicate is a narrow hydrology-to-narrative negative proxy. | selected-rule Grit proof passed; path refs exist | Cross-context import forbids should defer unless the whole rule can move to an affirmed import-law or public-surface owner. |
| `prohibit_narrative_swatches_stage_token` | honest standard-recipe context | `pipeline/swooper-maps-standard-recipe/rules` | `pattern.md` scans standard recipe source, maps, and tests for the retired `narrative-swatches` stage token. | The row governs current standard recipe topology cleanup; it should not create a narrative child context or stay in parent domains merely because the retired token includes `narrative`. | selected-rule Grit proof passed; path refs exist | Token labels are not owners; when a retired token belongs to recipe topology, move the row to recipe context even if it came from a domain lane. |
| `require_owned_domain_config_catalog_surfaces` | cleanup/consolidation/split pressure | `morphology/_remainder` | `check.mjs` verifies exact `src/domain/morphology/config.ts` facade exports and standard recipe tag-catalog tokens. | The rule mixes morphology config-facade currentness with standard recipe tag-catalog currentness, so no parent-domain or affirmed blueprint owner truthfully owns the whole predicate. | selected-rule Habitat script proof passed; path refs exist | Positive residual validators can still be `_remainder` when they mix two owners and should split later. |

## Remaining Dominoes

### 31. Sort The Hydrology Remainder Pocket

Purpose: re-read the new hydrology child niche now that direct parent domains
rows no longer hide the hydrology-specific pressure.

Done Means:

- Every row under `.habitat/civ7/mapgen/domains/hydrology/_remainder/`
  receives a disposition.
- Rows that truly govern `domain`, `domain-operation`, recipe-stage, standard
  recipe context, hydrology context, or import-law/public-surface pressure move
  to the smallest honest owner.
- Any remaining hydrology `_remainder` row names its later mechanical
  destination or split trigger.
- No hydrology packet is promoted to blueprint authority by label inheritance.

Moves It Forward:

- Tests the next child-context remainder after morphology and foundation, but
  on a smaller and sharper pocket.
- Separates hydrology context, hydrology recipe-stage pressure, map-config
  cleanup, and narrative/import-boundary pressure before broader pipeline
  projection work.
- Helps decide whether the next larger pocket is hydrology context, recipe
  public config, or import-law projection.

Dependencies:

- Domino 30 created the hydrology child `_remainder` lane and moved all direct
  hydrology rows out of parent `domains/rules`.
- Do not create a hydrology blueprint or capability in this slice.

Proof:

- Focused selected-rule proof for moved rows where applicable.
- Static scans prove moved manifests no longer point at stale paths.
- Review pass confirms hydrology labels, stage labels, and narrative labels
  were not promoted into ontology by folder inheritance.

### 32. Build Narrow Projection From Moved Authority

Purpose: let execution consume moved authority only after multiple slices give
it something honest to discover.

Done Means:

- One narrow adapter projects moved blueprint/context authority into the
  existing execution surface needed by the touched slices.
- The adapter is explicitly an adapter, not the authority source.
- Existing selected-rule or local Toolkit behavior still works for migrated and
  unmigrated slices.

Moves It Forward:

- Build only the projection path needed by moved slices.
- Preserve existing compatibility paths outside the migrated slice.
- Add diagnostics that distinguish admission failure from execution failure if
  the moved surface can exercise that distinction.
- Stop if implementation requires finalizing the full global schema.

Dependencies:

- Bounded kind-family slices have repeated enough to expose projection needs.

Proof:

- A focused command or local test exercises the slice projection.
- The proof does not claim broad `habitat check` correctness.
- Failure output, if touched, names the authority layer that failed.

### 33. Prune Transitional Packet Metadata For Moved Slices

Purpose: remove duplicated or misleading packet metadata once moved authority
owns the facts.

Done Means:

- Transitional metadata for moved slices is removed, demoted, or fenced.
- Remaining `rule.json` metadata is limited to runner compatibility or
  documented transitional use.
- The moved slice no longer teaches future agents that packet metadata is
  the conceptual source.

Moves It Forward:

- Start from duplicated facts exposed during bounded movement.
- Delete facts now owned by blueprint, instance, capability, or niche authority.
- Keep only metadata still needed by the narrow projection adapter.
- Update local docs if a reader would otherwise infer the old ownership model.

Dependencies:

- Narrow projection from moved authority has proved the projection can run.
- Duplicated facts have been identified before deletion.

Proof:

- Focused inspection shows migrated facts now have a single conceptual owner.
- Focused command proof still passes for moved slices.
- No unrelated packet cleanup is bundled into this branch.

### 34. Repeat Activation Slices

Purpose: prove the activation model across a second and third corpus before
making it the default shape.

Done Means:

- At least two additional bounded kind-family slices repeat the movement,
  projection, and pruning loop.
- Differences between slices are recorded as model refinements or explicit
  rejected generalizations.
- The authority model becomes easier to apply with each slice.

Moves It Forward:

- Pick the next corpus that stresses the weakest proven part of the pilot.
- Reuse the pilot shape where it held.
- Change the model only when a second slice produces source-backed pressure.
- Keep branch layers reviewable and vertically complete.

Dependencies:

- Transitional packet metadata has been pruned for moved slices.
- The first moved slices have a clear copyable pattern or named failure mode.

Proof:

- Each repeated slice has its own focused proof.
- Model changes are tied to concrete slice evidence.
- Review can compare slices without reconstructing the old packet history.

### 35. Rebuild Full-Suite Runner Discovery From Admitted Authority

Purpose: rebuild broad Habitat discovery only after authority admission has
enough real shape to discover.

Done Means:

- The broad runner discovers admitted authority rather than deriving ontology
  from packet paths.
- Default inclusion, selector behavior, diagnostics, and failure reporting use
  admitted blueprint, instance, capability, and niche facts.
- Compatibility metadata remains only for unmigrated slices or deliberate
  adapter boundaries.

Moves It Forward:

- Use repeated activation slices as the corpus for runner behavior.
- Keep selected-rule compatibility until migrated authority can replace it.
- Rebuild diagnostics around authority-layer failures.
- Retire legacy assumptions only when their migrated replacements exist.

Dependencies:

- Repeated activation slices prove the activation model across multiple slices.
- There is enough admitted authority to define default discovery honestly.

Proof:

- Focused runner tests cover admitted and non-admitted slices.
- Broad execution no longer fails because old registry assumptions leak into
  authority discovery.
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
