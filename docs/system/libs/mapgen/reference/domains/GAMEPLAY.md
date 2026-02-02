<toc>
  <item id="purpose" title="Purpose"/>
  <item id="status" title="Wiring status (today)"/>
  <item id="scope" title="Scope (target)"/>
  <item id="contract" title="Contract (current + target posture)"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Gameplay domain

## Purpose

Gameplay is the **final mapgen layer** that turns “world physics outputs” into “playable game outcomes”:
- starts/regions,
- resources/wonders/discoveries,
- and any gameplay-owned narrative/playability surfaces.

Target posture: Gameplay **absorbs** the legacy Narrative and Placement domains. Pipeline stage names may remain `placement` / `narrative-*` as a naming convention, but ownership is Gameplay.

## Wiring status (today)

In the current standard recipe:
- a `placement` stage exists and applies gameplay outcomes (starts/resources/etc).
- a separate `narrative` stage is not included.

## Scope (target)

Authoritative scope and absorption plan lives in:
- `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/plans/gameplay/APPENDIX-SCOPE-AND-ABSORPTION.md`

## Contract (current + target posture)

Current (standard recipe) provides an engine-facing “placement applied” effect tag and related debug artifacts (see legacy naming page):
- `docs/system/libs/mapgen/reference/domains/PLACEMENT.md`

Target posture:
- Gameplay owns the API/schema for any narrative/playability surfaces.
- Physics domains must not model or depend on “Narrative as a separate domain”; any such wiring is transitional only.

## Ground truth anchors

- Target posture (absorption plan): `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/plans/gameplay/APPENDIX-SCOPE-AND-ABSORPTION.md`
- Standard recipe stage list: `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`
- Standard recipe composition: `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
- Current placement stage contracts: `mods/mod-swooper-maps/src/recipes/standard/stages/placement/**`
