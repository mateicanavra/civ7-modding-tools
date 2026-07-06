# Domino 050: Consolidate Foundation Remainder Rules

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Indexed Result

Foundation strategy/rules-index duplicate guards were consolidated into broader live foundation context rules; helper-surface consolidation stayed in `_remainder` pending positive helper authority.

## Detail

#### Domino 50 Disposition Receipt

This receipt instantiates `.habitat/.active/frames/REMAINDER-REMEDIATION-ACTION-FRAME.md`
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
