# Grit Adapter Burn-Down Workstream

Status: implementation complete; closure proof pending

## Frame

Objective: convert the remaining adapter-backed rows that are already classified as Grit pattern authority, then delete their source-check adapters so the confusing `.rule.mjs` execution layer collapses.

Future state for this slice:

- `source-check` active adapter count drops from `26` to `1` or to the smallest defensible residual set.
- Converted rules run through `grit-check` via normal Habitat rule selection.
- The one known residual, `require_explicit_mapgen_sdk_opt_in`, remains explicitly blocked as `needs_split` unless a lane proves a smaller safe conversion.
- `rule-runtime.policy.mjs` remains only if at least one active adapter remains; if no active adapters remain, it becomes eligible for deletion in a final closure step.

Non-goals:

- Do not split mixed command-check bundles.
- Do not move pattern examples or fixtures out of `.pattern.md`.
- Do not redesign the Habitat loader.
- Do not convert non-Grit dispositions.

Hard core:

- Grit pattern authority replaces source-check adapters only where row-level proof passes.
- Current adapter code is evidence of old execution behavior, not target architecture.
- Rows stay visible; groups reduce execution cost but never erase row obligations.

Falsifier:

- A row that passes source-check but fails grit-check is not mechanically convertible in this wave.
- A row with no pattern authority is not a Grit conversion candidate.
- A row whose predicate includes non-source runtime behavior must stop for split work.

## Authority Order

1. Current user instruction to run a systematic peer-agent burn-down.
2. `AGENTS.md` and `docs/process/GRAPHITE.md`.
3. `habitat:systematic-workstream` and `civ7-habitat-dra-workstream` guidance.
4. `docs/projects/habitat-harness/source-check-conversion-inventory/canary-insights.md`.
5. `docs/projects/habitat-harness/source-check-conversion-inventory/corpus.jsonl`.
6. `docs/projects/habitat-harness/source-check-conversion-inventory/matrix.md`.
7. Current `.rule.json`, `.pattern.md`, adapter files, and fresh command behavior.

## Single-Agent Process

One agent owns one lane from start to finish:

1. Read the required sources in `lane-conversion-playbook.md`.
2. Extract assigned rows from `corpus.jsonl`.
3. Filter to rows with `ownerTool: source-check` and `primaryDisposition: grit_pattern_authority`.
4. For each row, confirm the `.rule.json`, pattern file, and central adapter exist.
5. Run pre-edit source-check proof for every eligible row.
6. Convert only rows whose pre-edit proof passes.
7. Delete only the matching central adapter for converted rows.
8. Run post-edit grit-check proof and normal rule-selection proof per row.
9. Revert only the failed row if post-edit proof fails.
10. Write a lane JSONL proof artifact under `grit-burn-down/lanes/`.
11. Report converted, skipped, and blocked rows with exact proof labels.

## Team Lanes

Lane agents work in disjoint authority-tree scopes and disjoint proof files:

| Lane | Assigned rows |
| --- | --- |
| `mapgen-domain` | `block_adapter_context_imports_from_domain_ops`, `prohibit_recipe_imports_in_domain_source`, `prohibit_relative_domain_reaches_from_recipes_and_maps`, `prohibit_retired_domain_root_catalogs`, `prohibit_root_config_facade_imports_in_domain_ops`, `prohibit_runtime_orchestration_helpers_in_domain_ops`, `require_domain_contract_roots_in_step_contracts`, `require_public_domain_surfaces_in_recipes_and_maps`, `restrict_recipes_to_public_domain_surfaces` |
| `mapgen-pipeline` | `prohibit_bare_value_export_all_from_contract_surfaces`, `prohibit_empty_object_defaults_in_contract_schemas`, `prohibit_runtime_calls_to_runvalidated`, `prohibit_runtime_local_config_default_merging`, `prohibit_runtime_validation_and_compiler_imports`, `prohibit_sibling_stage_private_step_imports`, `prohibit_wrapper_only_advanced_config`, `require_runtime_domain_op_bundle_imports`, `require_shared_visualization_contracts_at_stage_surfaces`, `require_typed_dependency_and_effect_tag_constants` |
| `mapgen-other` | `preserve_mapgen_core_runtime_neutrality`, `prohibit_domain_ops_projection_effect_dependencies`, `require_studio_ui_recipe_artifact_imports`, `require_typed_placement_outcomes_before_apply` |
| `platform-resources` | `enforce_adapter_only_base_standard_imports`, `require_sanctioned_direct_control_session_owners` |
| `holdback-review` | `require_explicit_mapgen_sdk_opt_in` and final residual-runtime deletion readiness |

## Closure Proof

After lane work is integrated, run:

```bash
bun tools/habitat/bin/dev.ts check --tool source-check
bun tools/habitat/bin/dev.ts check --tool grit-check
bun run --cwd tools/habitat analyze:execution-surface -- --repo-root ../.. --out-json ../../docs/projects/habitat-harness/execution-surface-map/execution-surface-map.json --out-md ../../docs/projects/habitat-harness/execution-surface-map/execution-surface-map.md --out-anatomy-md ../../docs/projects/habitat-harness/execution-surface-map/execution-surface-anatomy.md
node -e 'JSON.parse(require("fs").readFileSync("docs/projects/habitat-harness/execution-surface-map/execution-surface-map.json","utf8"))'
git diff --check
bun run --cwd tools/habitat check
```

Static closure assertions:

```bash
find .habitat/_support/execution/source-check/adapters -name '*.rule.mjs' | wc -l
find .habitat -path '*/blueprints/*' -name '*.rule.mjs'
rg "source-check" .habitat/**/*.rule.json
```

If only `require_explicit_mapgen_sdk_opt_in` remains source-check-owned, record why it remains in the review ledger and next-slice notes.

## Closure Outcome

Lane agents converted 25 rows and deleted 25 adapters. The only residual source-check row is `require_explicit_mapgen_sdk_opt_in`; the holdback review records that it must split before the last adapter and runtime can be deleted.
