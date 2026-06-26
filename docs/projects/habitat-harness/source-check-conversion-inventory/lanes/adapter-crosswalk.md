# adapter-crosswalk Lane Inventory

Status: Agent 6 reviewed all original centralized source-check adapters; updated after the burn-down canary.

This lane is a crosswalk/review lane. It accounted for the original `33`
centralized `.rule.mjs` adapters under
`.habitat/_support/execution/source-check/adapters/` and maps them back to rule
records, adjacent patterns/checks, and runtime helper dependencies. After the
burn-down canary, `26` adapter files remain.

## Coverage

- `33` original adapters inspected.
- `7` adapters deleted in the canary.
- `26` adapter files remain.
- `26` remaining adapters map to active `ownerTool: source-check` rule records.
- `0` remaining adapters import anything except `../runtime/rule-runtime.policy.mjs`.

## Source-Check Rule-Record Adapters

These `26` adapters are still selected by source-check rule records and should
be removed by converting their predicate payload to Grit/pattern authority or,
for one mixed case, splitting first.

| Rule ID | Disposition | Split | Helper shape |
| --- | --- | --- | --- |
| `block_adapter_context_imports_from_domain_ops` | `grit_pattern_authority` | no | generic import/identifier/property helpers |
| `enforce_adapter_only_base_standard_imports` | `grit_pattern_authority` | no | generic import/path helpers |
| `preserve_mapgen_core_runtime_neutrality` | `grit_pattern_authority` | no | domain-specific path helper plus generic import/identifier/text helpers |
| `prohibit_bare_value_export_all_from_contract_surfaces` | `grit_pattern_authority` | no | generic export/import helpers |
| `prohibit_domain_ops_projection_effect_dependencies` | `grit_pattern_authority` | no | generic string literal/path helpers |
| `prohibit_empty_object_defaults_in_contract_schemas` | `grit_pattern_authority` | no | generic object property/path helpers |
| `prohibit_recipe_imports_in_domain_source` | `grit_pattern_authority` | no | generic sourceRefsMatching helper |
| `prohibit_relative_domain_reaches_from_recipes_and_maps` | `grit_pattern_authority` | no | domain-specific relative-domain import helper |
| `prohibit_retired_domain_root_catalogs` | `grit_pattern_authority` | no | path-only predicate |
| `prohibit_root_config_facade_imports_in_domain_ops` | `grit_pattern_authority` | no | generic sourceRefsMatching helper |
| `prohibit_runtime_calls_to_runvalidated` | `grit_pattern_authority` | no | generic call-expression helpers |
| `prohibit_runtime_local_config_default_merging` | `grit_pattern_authority` | no | generic empty-object/property-call helpers |
| `prohibit_runtime_orchestration_helpers_in_domain_ops` | `grit_pattern_authority` | no | generic call-expression helpers |
| `prohibit_runtime_validation_and_compiler_imports` | `grit_pattern_authority` | no | generic sourceRefsMatching helper |
| `prohibit_sibling_stage_private_step_imports` | `grit_pattern_authority` | no | generic sourceRefsMatching helper |
| `prohibit_wrapper_only_advanced_config` | `grit_pattern_authority` | no | property-name helper over TS/JSON |
| `require_domain_contract_roots_in_step_contracts` | `grit_pattern_authority` | no | generic sourceRefsMatching helper |
| `require_explicit_mapgen_sdk_opt_in` | `needs_split` | yes | domain-specific SDK/mapgen-core mixed helper |
| `require_public_domain_surfaces_in_recipes_and_maps` | `grit_pattern_authority` | no | generic sourceRefsMatching helper; overlaps another domain-surface rule |
| `require_runtime_domain_op_bundle_imports` | `grit_pattern_authority` | no | generic sourceRefsMatching helper |
| `require_sanctioned_direct_control_session_owners` | `grit_pattern_authority` | no | generic new-expression/test-path helpers plus policy allowlist |
| `require_shared_visualization_contracts_at_stage_surfaces` | `grit_pattern_authority` | no | domain-specific visualization contract helper |
| `require_studio_ui_recipe_artifact_imports` | `grit_pattern_authority` | no | generic sourceRefsMatching helper |
| `require_typed_dependency_and_effect_tag_constants` | `grit_pattern_authority` | no | domain-specific defineStep contract helper |
| `require_typed_placement_outcomes_before_apply` | `grit_pattern_authority` | no | generic call-expression/path helpers |
| `restrict_recipes_to_public_domain_surfaces` | `grit_pattern_authority` | no | generic import/export helpers; overlaps another domain-surface rule |

## Deleted Adapters

These adapters were deleted in the burn-down canary after confirming the
command-check rows still pass or the active source-check rows pass as
`grit-check`.

| Adapter | Current rule owner | Current executable surface | Disposition |
| --- | --- | --- | --- |
| `block_engine_runtime_imports_from_domain_ops` | `grit-check` | `.pattern.md` | converted canary |
| `preserve_transport_pure_orpc_contracts` | `grit-check` | `.pattern.md` | converted canary |
| `prohibit_runtime_helper_redeclarations` | `grit-check` | `.pattern.md` plus `.apply.pattern.md` | converted canary |
| `prohibit_ambient_rng_in_authored_generation` | `command-check` | `.check.mjs` plus `.pattern.md` | stale adapter deleted |
| `prohibit_cross_op_runtime_calls` | `command-check` | `.check.mjs` plus `.pattern.md` | stale adapter deleted |
| `prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases` | `command-check` | `.check.mjs` plus `.pattern.md` | stale adapter deleted |
| `require_public_ecology_surfaces_and_retired_topology_removal` | `command-check` | `.check.mjs` plus `.pattern.md` | stale adapter deleted |

## Runtime Helper Dependency Map

The runtime has two different kinds of exports. The generic AST support can be
replaced by Grit execution mechanics. The domain-specific helpers are policy
payload currently hidden in `rule-runtime.policy.mjs` and must be ported into
patterns or split before deleting the runtime.

Generic support:

- AST/fact collection: `importRefs`, `exportedConstNames`, `newExpressions`,
  `callExpressions`, `propertyCallExpressions`, `callNodes`,
  `propertyAccesses`, `identifierUses`, `stringLiterals`, `objectProperties`,
  `matchingNodes`.
- Diagnostics/path/text support: `diagnostic`, `lineFor`, `pathMatches`,
  `linesMatching`, `firstMatchingLine`, `escapeRegExp`, `isTestPath`.
- Convenience predicates: `sourceRefsMatching`, `emptyObjectNullish`,
  `propertyNameOccurrences`.

Domain-specific predicate payload hidden in the runtime:

- `isMapgenCoreProductionSource`
- `isRngAuthorityScope`, `rngAuthorityLines`, `isAllowedRngAuthorityHit`
- `isActiveEcologyStagePath`, `isRetiredEcologyPath`
- `isSwooperRuntimeSource`, `cutoverShimSurfaceLines`,
  `cutoverLegacyStageLines`, `cutoverDualStageLines`
- `relativeDomainImportDiagnostics`
- `sdkMapgenEntrypointDiagnostics`
- `stageContractDependencyDiagnostics`
- `vizContractOwnershipDiagnostics`
- `schemaExportsFromControlIndex`
- `helperRedeclarations`

## Notable Split Or Consolidation Candidates

- `require_explicit_mapgen_sdk_opt_in` should split before conversion. It mixes
  SDK opt-in/public entrypoint policy with a mapgen-core adapter-import ban that
  overlaps `preserve_mapgen_core_runtime_neutrality`.
- `require_public_ecology_surfaces_and_retired_topology_removal` remains a
  mixed command-check predicate after its stale adapter deletion. Its current
  command-check rule combines active ecology public-surface imports with
  retired topology file removal.
- `require_public_domain_surfaces_in_recipes_and_maps` and
  `restrict_recipes_to_public_domain_surfaces` overlap. Convert/extract first,
  then consolidate the public-domain allowlist semantics.

## First Grit Candidates

Start with adapters that are pure `sourceRefsMatching` or direct call/path
checks and already have adjacent `.pattern.md` authority:

1. `prohibit_recipe_imports_in_domain_source`
2. `prohibit_root_config_facade_imports_in_domain_ops`
3. `prohibit_runtime_validation_and_compiler_imports`
4. `prohibit_sibling_stage_private_step_imports`
5. `require_domain_contract_roots_in_step_contracts`
6. `require_runtime_domain_op_bundle_imports`
7. `require_studio_ui_recipe_artifact_imports`
8. `require_typed_placement_outcomes_before_apply`

These should give the fastest state collapse because the `.rule.mjs` adapter is
only a one-call bridge from rule record to a predicate already represented as
Grit-pattern authority.
