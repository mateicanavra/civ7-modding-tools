<toc>
  <item id="purpose" title="Purpose"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Narrative domain (legacy router)

## Purpose

“Narrative” is legacy naming.

Target posture: narrative/playability work is **Gameplay-owned** (Narrative is absorbed into Gameplay).

Canonical doc:

`docs/system/libs/mapgen/reference/domains/GAMEPLAY.md`

## Ground truth anchors

- Target absorption posture (Gameplay owns Narrative): `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/plans/gameplay/APPENDIX-SCOPE-AND-ABSORPTION.md`
- Standard recipe stage list (Narrative absent today): `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
- Narrative domain exists but is not currently wired:
  - `mods/mod-swooper-maps/src/domain/narrative/index.ts`
  - `mods/mod-swooper-maps/src/domain/narrative/ops/contracts.ts`
