# Domino 027: Move the Foundation Remainder Pocket

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Indexed Result

The foundation-domain pocket was reviewed against `domain` and `domain-operation`; six rules stayed as intentional foundation currentness or retired-token context, six rules moved to `.habitat/civ7/mapgen/domains/foundation/_remainder/`, and no foundation label, strategy-file row, or legacy cleanup row was promoted into blueprint authority.

## Detail

#### Domino 27 Disposition Receipt

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
