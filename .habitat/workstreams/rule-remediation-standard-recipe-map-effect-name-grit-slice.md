# Rule Remediation: Standard Recipe Map Effect Name Grit Rail

Status: closed on `codex/habitat-standard-recipe-map-effect-grit-rail`

## Slice

Selected rule:

- `require_standard_recipe_map_effect_name_suffixes`

Action class: runtime/source validation.

## Decision

Keep the rule as standard-recipe context authority, but remove the bespoke Node
runner. The predicate is a static source-shape check over
`mods/mod-swooper-maps/src/recipes/standard/tag-contracts.ts`: standard
recipe `effect:map.*` names must end in `Plotted`, `Built`, or
`ParityCaptured`.

That belongs in Habitat/Grit, not in package-owned tests and not in a custom
MJS script. Nx is not the owner because this is not a project/module graph
boundary; it is a source literal naming rail inside one owner file.

## Change

- Preserved rule id, owner project, placement, category, support file, and
  message.
- Replaced the `habitat` Node script runner with a packet-local Grit pattern.
- Removed the old `check.mjs` runner.
- Added `scanRoots` for the standard recipe source root.

## Exclusions

| Row | Reason |
| --- | --- |
| `prohibit_standard_tag_catalog_legacy_morphology_effect_gates` | Separate positive tag/effect family authority work. This slice only changes the existing map-effect suffix rail executor. |

## Proof

- `bun habitat check --rule require_standard_recipe_map_effect_name_suffixes --json`
  passed with the Grit runner.
- Temporary negative probe `effect:map.landmassApplied` in
  `standard/tag-contracts.ts` failed the rule at the expected file.
- The temporary probe was removed.

## Proof Limit

This slice does not define a full dependency-tag kind, a projection-surface
positive authority, or a product behavior change. It only moves an existing
static source predicate onto the correct Habitat source-check rail.
