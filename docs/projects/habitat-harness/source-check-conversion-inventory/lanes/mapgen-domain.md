# mapgen-domain Lane Inventory

Status: inspected lane findings

Agent lane: `.habitat/civ7/mapgen/domain/**`

## Coverage

- Inspected `17` assigned rule records.
- Inspected `12` related centralized source-check adapters.
- Classified `11` rows as `grit_pattern_authority`.
- Classified `6` rows as `needs_split`.
- Found no primary `package_local_test_or_validator`, `data_driven_import_path_rule`, or `delete_or_demote` rows in this lane.

## Main Read

Most source-check-backed domain rules are already Grit-shaped. They enforce
path-scoped import/export, identifier, property access, call-expression, or
filename predicates, and many already have adjacent `.pattern.md` files that
mirror the adapter behavior.

The confusing part of this lane is not the source-check rows. It is the
command-check bundles that combine several assertion types in one script:
source bans, exact file-content expectations, topology/currentness checks, and
transitional profile mechanics.

## First Grit Candidates

These are the cleanest next extraction targets from this lane:

| Rule | Why first |
| --- | --- |
| `prohibit_retired_domain_root_catalogs` | Pure filename predicate with existing Grit pattern. |
| `block_engine_runtime_imports_from_domain_ops` | Pure non-type import predicate with existing Grit pattern. |
| `prohibit_root_config_facade_imports_in_domain_ops` | Pure import/export/dynamic-import source predicate with existing Grit pattern. |
| `prohibit_runtime_orchestration_helpers_in_domain_ops` | Pure call-expression predicate with existing Grit pattern. |
| `require_public_domain_surfaces_in_tests` | No pattern yet, but it is just path-scoped test import/export matching. |

Also extract after splitting:

- `prohibit_cross_op_runtime_calls`: move the import/export/dynamic source
  predicate to Grit and consolidate duplicated `ops.bind`/`runValidated` checks
  with `prohibit_runtime_orchestration_helpers_in_domain_ops`.
- `require_public_ecology_surfaces_and_retired_topology_removal`: move active
  ecology import/export bans and retired-path detection to Grit; handle active
  stage-root existence separately.

## Split Candidates

| Rule | Split reason |
| --- | --- |
| `enforce_domain_refactor_boundary_profile` | Transitional shell profile with boundary/full modes, duplicate checks, topology checks, docs/schema checks, and domain-specific leftovers. |
| `preserve_decomposed_foundation_contract_surfaces` | Mixes legacy text bans, import allowlists, exact required contract/tag contents, projection-source currentness, and migration cleanup. |
| `preserve_morphology_contracts_and_overlay_ownership` | Mixes legacy text/import bans, overlay ownership, exact contract expectations, and consumer currentness checks. |
| `prohibit_cross_op_runtime_calls` | The source predicate is Grit-ready, but the command script also scans orchestration calls already owned by a narrower rule. |
| `require_owned_domain_config_catalog_surfaces` | Mixes config facade exact exports, op import bans, milestone tag bans, and required owner token presence. |
| `require_public_ecology_surfaces_and_retired_topology_removal` | Grit-ready source/retired-path predicates are bundled with active root existence checks. |

## Notable Overlaps

- `enforce_domain_refactor_boundary_profile` overlaps several narrower packets
  in this same lane and should not survive as a permanent broad profile.
- `prohibit_cross_op_runtime_calls` overlaps
  `prohibit_runtime_orchestration_helpers_in_domain_ops` for local orchestration
  calls.
- `restrict_recipes_to_public_domain_surfaces` and
  `require_public_domain_surfaces_in_recipes_and_maps` are complementary rather
  than exact duplicates: one catches unknown deep domain tails, the other catches
  deep ops/rules/strategies surfaces.

## Blockers

No blockers for this lane artifact.

Synthesis should account for two ownerTool mismatches: `prohibit_cross_op_runtime_calls`
and `require_public_ecology_surfaces_and_retired_topology_removal` are
`command-check` records but also have centralized source-check adapters and
adjacent Grit patterns.
