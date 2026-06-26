# adapter-crosswalk Lane Inventory

Status: updated after systematic source-check adapter burn-down

This lane is a crosswalk/review lane. It accounted for the original `33`
centralized `.rule.mjs` adapters under
`.habitat/_support/execution/source-check/adapters/` and maps them back to rule
records, adjacent patterns/checks, and runtime helper dependencies.

## Coverage

- `33` original adapters inspected.
- `7` adapters deleted in the canary.
- `25` additional adapters deleted in the systematic burn-down.
- `1` adapter remains.
- `1` remaining adapter maps to an active `ownerTool: source-check` rule record.
- `0` remaining adapters import anything except `../runtime/rule-runtime.policy.mjs`.

## Remaining Source-Check Adapter

| Rule ID | Disposition | Split | Helper shape | Reason it remains |
| --- | --- | --- | --- | --- |
| `require_explicit_mapgen_sdk_opt_in` | `needs_split` | yes | domain-specific SDK/mapgen-core mixed helper | Mixes SDK opt-in/public entrypoint policy with a mapgen-core adapter-import ban that overlaps `preserve_mapgen_core_runtime_neutrality`. |

## Deleted Or Converted Adapters

These adapters were deleted after either stale-adapter proof or source-check-before
and grit-check-after proof:

- `block_adapter_context_imports_from_domain_ops`
- `block_engine_runtime_imports_from_domain_ops`
- `enforce_adapter_only_base_standard_imports`
- `preserve_mapgen_core_runtime_neutrality`
- `preserve_transport_pure_orpc_contracts`
- `prohibit_ambient_rng_in_authored_generation`
- `prohibit_bare_value_export_all_from_contract_surfaces`
- `prohibit_cross_op_runtime_calls`
- `prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases`
- `prohibit_domain_ops_projection_effect_dependencies`
- `prohibit_empty_object_defaults_in_contract_schemas`
- `prohibit_recipe_imports_in_domain_source`
- `prohibit_relative_domain_reaches_from_recipes_and_maps`
- `prohibit_retired_domain_root_catalogs`
- `prohibit_root_config_facade_imports_in_domain_ops`
- `prohibit_runtime_calls_to_runvalidated`
- `prohibit_runtime_helper_redeclarations`
- `prohibit_runtime_local_config_default_merging`
- `prohibit_runtime_orchestration_helpers_in_domain_ops`
- `prohibit_runtime_validation_and_compiler_imports`
- `prohibit_sibling_stage_private_step_imports`
- `prohibit_wrapper_only_advanced_config`
- `require_domain_contract_roots_in_step_contracts`
- `require_public_domain_surfaces_in_recipes_and_maps`
- `require_public_ecology_surfaces_and_retired_topology_removal`
- `require_runtime_domain_op_bundle_imports`
- `require_sanctioned_direct_control_session_owners`
- `require_shared_visualization_contracts_at_stage_surfaces`
- `require_studio_ui_recipe_artifact_imports`
- `require_typed_dependency_and_effect_tag_constants`
- `require_typed_placement_outcomes_before_apply`
- `restrict_recipes_to_public_domain_surfaces`

## Runtime Helper Dependency Map

The runtime has two different kinds of exports. The generic AST support can be
replaced by Grit execution mechanics. The only active domain-specific helper
payload now used by source-check is `sdkMapgenEntrypointDiagnostics`.

Generic support still present because the final adapter imports the runtime:

- AST/fact collection: `importRefs`, `exportedConstNames`, `newExpressions`,
  `callExpressions`, `propertyCallExpressions`, `callNodes`,
  `propertyAccesses`, `identifierUses`, `stringLiterals`, `objectProperties`,
  `matchingNodes`.
- Diagnostics/path/text support: `diagnostic`, `lineFor`, `pathMatches`,
  `linesMatching`, `firstMatchingLine`, `escapeRegExp`, `isTestPath`.
- Convenience predicates: `sourceRefsMatching`, `emptyObjectNullish`,
  `propertyNameOccurrences`.

Domain-specific predicate payload still blocking runtime deletion:

- `sdkMapgenEntrypointDiagnostics`

Domain-specific payload already removed from active adapter use by conversion:

- `isMapgenCoreProductionSource`
- `relativeDomainImportDiagnostics`
- `stageContractDependencyDiagnostics`
- `vizContractOwnershipDiagnostics`
- `schemaExportsFromControlIndex`
- `helperRedeclarations`

Domain-specific payload already removed from active adapter use by stale-adapter
deletion:

- `isRngAuthorityScope`, `rngAuthorityLines`, `isAllowedRngAuthorityHit`
- `isActiveEcologyStagePath`, `isRetiredEcologyPath`
- `isSwooperRuntimeSource`, `cutoverShimSurfaceLines`,
  `cutoverLegacyStageLines`, `cutoverDualStageLines`

## Next Move

Split `require_explicit_mapgen_sdk_opt_in`, convert the SDK opt-in predicate to
Grit, delete the final adapter, then delete `rule-runtime.policy.mjs` once no
runtime importers remain.
