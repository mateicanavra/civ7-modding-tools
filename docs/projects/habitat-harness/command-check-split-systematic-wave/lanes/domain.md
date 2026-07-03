# Domain Lane

Status: assertion extraction complete for the mapgen-domain `needs_split` lane.

Rows:

- `enforce_domain_refactor_boundary_profile`
- `preserve_decomposed_foundation_contract_surfaces`
- `preserve_morphology_contracts_and_overlay_ownership`
- `require_owned_domain_config_catalog_surfaces`

## Outcome

All four current command-check packets were inspected at `rule.json`, `category.md`,
baseline, check script, and adjacent Grit-rule level. Direct source surfaces were
sampled for exact facade exports, tag catalogs, foundation projection contracts,
foundation artifacts, morphology belt-driver contracts, and hotspot publisher
ownership.

No `.habitat` packet was changed in this lane pass. The reason is deliberate:
each check script still contains mixed branches after decomposition. Some
assertions are already delegated to narrower accepted Grit rules, some are clear
future Grit candidates, and some are exact topology/currentness checks that
should remain command/data-driven until a manifest-backed topology runner exists.
Shrinking a script now would hide remaining branches inside an underspecified
split.

## Existing-Rule Delegations

Focused proof passed for these already-owned assertions:

- `block_adapter_context_imports_from_domain_ops`
- `prohibit_domain_ops_projection_effect_dependencies`
- `prohibit_root_config_facade_imports_in_domain_ops`
- `block_engine_runtime_imports_from_domain_ops`
- `prohibit_cross_op_runtime_calls`
- `prohibit_runtime_orchestration_helpers_in_domain_ops`
- `prohibit_runtime_local_config_default_merging`
- `prohibit_runtime_validation_and_compiler_imports`
- `require_typed_dependency_and_effect_tag_constants`
- `prohibit_recipe_imports_in_domain_source`
- `restrict_recipes_to_public_domain_surfaces`
- `require_domain_contract_roots_in_step_contracts`

These rows should be deleted from the aggregate profile only when the remaining
profile-only topology, documentation, hydrology, foundation, and ecology branches
have their own dispositions and proof owners.

## Split Notes

- `enforce_domain_refactor_boundary_profile` is a transitional aggregate. Its
  boundary-mode assertions mostly duplicate existing Grit rules; full-mode
  branches mix topology, docs/schema quality, hydrology cleanup, foundation
  cleanup, and broad global source bans.
- `preserve_decomposed_foundation_contract_surfaces` should split into Grit
  cleanup bans, Grit import/re-export restrictions, and data-driven exact
  contract/artifact currentness checks.
- `preserve_morphology_contracts_and_overlay_ownership` should split into Grit
  cleanup bans plus a data-driven ownership/currentness packet for exact
  belt-driver and hotspot-publisher facts.
- `require_owned_domain_config_catalog_surfaces` should split into an existing
  root-config-facade import delegation, a new Grit source-name ban for milestone
  tag catalogs, and data-driven exact facade/export-token checks.

## Proof

Current packet proof before edits:

- `bun tools/habitat/bin/dev.ts check --rule enforce_domain_refactor_boundary_profile --json` passed.
- `bun tools/habitat/bin/dev.ts check --rule preserve_decomposed_foundation_contract_surfaces --json` passed.
- `bun tools/habitat/bin/dev.ts check --rule preserve_morphology_contracts_and_overlay_ownership --json` passed.
- `bun tools/habitat/bin/dev.ts check --rule require_owned_domain_config_catalog_surfaces --json` passed.

Focused existing-rule proof is recorded per assertion in `domain.jsonl`.
