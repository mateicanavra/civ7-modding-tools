# Rule Remediation: Physics Map Projection Dependency Grit Rail

Status: closed on `codex/habitat-physics-map-dependency-grit-rail`

## Slice

Selected rule:

- `prohibit_map_projection_dependencies_in_physics_contracts`

Action class: runtime/source validation.

## Decision

Keep the rule as standard-recipe context authority, but remove the bespoke Node
runner. The predicate is a static source-shape check over selected standard
recipe physics contract files: those contracts must not require map projection
artifacts, map projection effects, or `MAP_PROJECTION_EFFECT_TAGS.map.*`.

That belongs in Habitat/Grit. Nx is not the owner because this is not a
project/module graph edge. Package-owned tests are not the owner because this
is source-shape architecture authority, not behavior.

## Change

- Preserved rule id, owner project, placement, category, support file, and
  message.
- Replaced the `habitat` Node script runner with a packet-local Grit pattern.
- Removed the old `check.mjs` runner.
- Added `scanRoots` for the standard recipe stage source root.

## Exclusions

| Row | Reason |
| --- | --- |
| `prohibit_foundation_projection_legacy_motion_source` | Already a separate Grit source rule for legacy foundation projection motion tokens. |
| `prohibit_morphology_runtime_continent_step_tokens` | Already a separate Grit source rule over morphology runtime continent tokens. |

## Proof

- `bun habitat check --rule prohibit_map_projection_dependencies_in_physics_contracts --json`
  passed with the Grit runner.
- Temporary negative probe `artifact:map.invalidProbe` in
  `foundation-tectonics/steps/tectonics.contract.ts` failed the rule at the
  expected file.
- The temporary probe was removed.

## Proof Limit

This slice does not settle the broader projection contract surface,
map-output ontology, or positive dependency-tag family authority. It only moves
an existing static source predicate onto the correct Habitat source-check rail.
