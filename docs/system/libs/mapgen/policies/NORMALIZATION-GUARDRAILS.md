<toc>
  <item id="purpose" title="Purpose"/>
  <item id="guard-map" title="Guard map"/>
  <item id="proof-boundary" title="Proof boundary"/>
  <item id="commands" title="Commands"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Normalization guardrails

## Purpose

These guardrails route completed architecture-normalization cleanup to the
current enforcement surface. They do not promote packet target shape by
themselves; each live guard is enabled only where source behavior and OpenSpec
implementation records already support the structure being checked. Rows
without a registered current check remain review obligations, not implied
mechanical coverage.

Supersedes the packet's "Guardrails To Add After Cleanup" table for implemented
G1-G9 enforcement scope:
`docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.

## Guard map

| Guard | Cleanup evidence | Current enforcement | What it proves |
| --- | --- | --- | --- |
| G1 milestone-prefixed tag ids | `normalize-authority-routing`, `normalize-placement-contracts` | Habitat `prohibit_milestone_prefixed_standard_recipe_tag_catalog_names` | Standard recipe source no longer depends on `M\d+_` tag/catalog identifiers. |
| G2 domain artifact root catalogs | `normalize-morphology-catalog-owners` | Habitat `prohibit_domain_artifacts_modules` | Domain source does not reintroduce `artifacts.ts` modules. This bounded rule does not claim a general `tags.ts` catalog prohibition. |
| G3 core purity | `normalize-core-studio-dx-boundaries` | Habitat `preserve_mapgen_core_runtime_neutrality` | `packages/mapgen-core/src` stays free of Civ7 adapter value imports, `/base-standard` imports, runtime globals, adapter creation, and unsafe engine casts. |
| G4 recipe deep imports | `normalize-import-boundaries` | Habitat `require_public_domain_surfaces_in_recipes_and_maps` | Recipes and maps consume the named public domain surfaces rather than private domain implementation modules. |
| G5 sibling stage `steps/` imports | `normalize-ecology-topology` | Habitat `prohibit_sibling_stage_private_step_imports` | Standard stages do not import sibling stages' private `steps/` modules. |
| G6 recipe doc stage drift | `normalize-ecology-topology` | No direct current rule. `verify_runtime_stage_order_matches_contract_manifest` checks runtime against `contract-manifest.ts`; `validate_mapgen_docs_anchors_and_references` checks MapGen doc anchors and reference policy. | No current registered rule proves that `STANDARD-RECIPE.md` stage order matches source; keep that source-doc comparison in review until a manifest owns it. |
| G7 superseded current-stage ids | `normalize-ecology-topology`, `normalize-projection-lakes` | No direct current doc-content rule. `require_public_ecology_surfaces_and_retired_topology_removal` and `require_morphology_config_facade_exports` protect source topology only. | No current registered rule decides whether evergreen prose presents a retired stage id as current source shape. |
| G8 hidden placement sub-concerns | `normalize-placement-contracts`, `normalize-placement-reconciliation` | Habitat `require_typed_placement_outcomes_before_apply` | Placement apply does not directly call official resource/discovery generators and typed outcomes exist before apply. |
| G9 wrapper-only `advanced` stage config | `normalize-config-surface` | Habitat `prohibit_wrapper_only_advanced_config` | Standard recipe source and map configs do not reintroduce persisted SDK-native `advanced` wrappers. |
| G10 visualization contract owner surfaces | `normalize-viz-contract-owners` | Habitat `require_shared_visualization_contracts_at_stage_surfaces` | No collection-wide `steps/viz.ts` hub exists. Recipe-root styles and stage/step projection ownership remain normative review and import-boundary concerns. |
| G11 SDK map runtime entrypoint boundary | `normalize-sdk-mapgen-runtime-entrypoint` | Habitat `require_explicit_mapgen_sdk_opt_in` | The SDK root remains runtime-neutral; Civ7 map runtime helpers are exposed only from the MapGen subpath. |

## Proof boundary

The focused Habitat checks below are structural evidence. They prove only the
bounded source or topology condition in their manifest; they do not prove
generated mod output, in-game behavior, future target architecture, legality
equivalence with Civ7 internals, or the unregistered G6/G7 doc-content claims.

OpenSpec archive entries remain implementation history. The long-lived
authority is this policy plus the domain/reference docs and ADRs named by each
completed implementation record.

## Commands

- `bun habitat check --rule prohibit_milestone_prefixed_standard_recipe_tag_catalog_names --rule prohibit_domain_artifacts_modules --rule preserve_mapgen_core_runtime_neutrality --rule require_public_domain_surfaces_in_recipes_and_maps --rule prohibit_sibling_stage_private_step_imports --rule require_typed_placement_outcomes_before_apply --rule prohibit_wrapper_only_advanced_config --rule require_shared_visualization_contracts_at_stage_surfaces --rule require_explicit_mapgen_sdk_opt_in`
- `bun habitat check --rule validate_mapgen_docs_anchors_and_references`

`habitat check` selects bounded rules with repeatable `--rule`; it has no
`--tool` selector. Use `--runner grit` only when the intended claim is every
registered Grit-backed rule, not this curated normalization set.

## Ground truth anchors

- Habitat rule-manifest discovery and owner registry: `.habitat/README.md` and
  `.habitat/index.json`
- Habitat Grit execution contract: `.habitat/AUTHORITY-TOOL-SEPARATION.md`
- Example bounded rule manifests:
  `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/prohibit_milestone_prefixed_standard_recipe_tag_catalog_names/rule.json` and
  `.habitat/blueprints/domain/prohibit_domain_artifacts_modules/rule.json`
- Normalization packet source table:
  `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
- OpenSpec implementation history: `openspec/changes/archive/`
