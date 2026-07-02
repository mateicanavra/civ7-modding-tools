# Architecture Authority Corpus

Status: evidence artifact

## Authority Order

1. direct user decisions in the active thread;
2. active prework frame and scope/decision-book files;
3. Civ7 architecture/product authority and ADRs;
4. current source, callers, tests, generated/runtime evidence;
5. Narsil, KNIP, `rg`, and Git history as evidence.

## Active Workstream Authority

The prework frame defines the selected question as liveness and ownership for
`mods/mod-swooper-maps/src/domain/narrative/**`.

The domain scope defines a domain as recipe-independent map-generation truth
and public domain surface. Recipe ordering, stage projection, adapter/runtime
behavior, official Civ7 catalogs, generic mechanics, and Gameplay/playability
ownership route to separate authority surfaces.

The owner-boundaries decision book says Gameplay/narrative material routes
through a Gameplay/story-artifact owner-law domino before movement into a model
slot. The move-class book provides a `Gameplay/narrative owner-law` disposition
for material whose exact public surface and destinations are not yet named.

## Controlling Architecture Evidence

| Source | Evidence | Implication |
| --- | --- | --- |
| `docs/system/libs/mapgen/reference/domains/GAMEPLAY.md` | Gameplay is the final mapgen layer for playable outcomes and absorbs legacy Narrative and Placement, with `domain/resources` retained for resource planning. Current standard recipe has placement and no separate narrative stage. | Story/playability material belongs to a Gameplay/story-artifact law before it can be reintroduced as owned structure. |
| `docs/system/ADR.md` ADR-008 | `domain/resources` owns resource planning; future Gameplay consolidation may absorb starts/discoveries/wonders orchestration but does not re-own resources. | Narrative cleanup does not move resource planning. |
| `docs/system/ADR.md` ADR-009 | Placement deterministic plan/reconcile is the current regime; engine readbacks are evidence. | Discovery/start/wonder placement concerns stay in placement/adapter/resource lanes until a Gameplay law supersedes them. |
| `docs/system/mods/swooper-maps/architecture.md` | Current architecture is physics-first; map and placement stages project artifacts to engine state. | Narrative overlays are not current core physics authority. |
| `docs/projects/engine-refactor-v1/architecture-normalization-sources/architecture-normalization-review-independent.md` | Current `domain/narrative` has zero recipe wiring and empty ops; prior review described it as dead-code/DX trap. | The empty domain shell is deletion evidence, not target ownership. |
| `docs/projects/engine-refactor-v1/resources/spike/spike-narrative-overlays-load-bearing.md` | Historical spike described former `narrative-pre`/`narrative-mid` stages as load-bearing, then framed target story as optional and decoupled. | Treat this as historical context; current recipe source determines live wiring. |

## Current Source Authority

`mods/mod-swooper-maps/src/recipes/standard/recipe.ts` imports and compiles
domain ops for ecology, foundation, hydrology, morphology, placement, and
resources. It does not import or compile narrative domain ops.

The current standard stage tree has no `narrative-pre` or `narrative-mid`
source directory. Current tests under `mods/mod-swooper-maps/test/story/**`
still exercise the root narrative barrel, overlay helpers, corridor behavior,
and orogeny behavior.

## Owner Criteria

| Material | Owner criterion | Current narrative implication |
| --- | --- | --- |
| Empty domain registration and empty ops | Delete as duplicate/dead authority after caller proof. | `ops.ts`, `ops/contracts.ts`, and `ops/index.ts` are deletion candidates. |
| Story motif APIs, story-entry artifacts, and derived overlay views | Gameplay/story-artifact owner-law domino. | Behavior-bearing story code has no Domino 001 destination until that owner law exists. |
| Recipe/stage ordering and stage config | Owning recipe/stage. | Current recipe contains no narrative stage to own this code. |
| Runtime engine/API behavior | Adapter or explicit runtime integration. | Helpers reading adapter-backed context cannot become pure domain law by path alone. |
| Resource planning | `domain/resources` per ADR-008. | Narrative cleanup leaves resource planning untouched. |
| Test-only compatibility surface | Delete or preserve only with named target law. | Current story tests prove test liveness, not production ownership. |

## Architecture Implication

The high-confidence disposition is:

- remove `domain/narrative/**` from the Domino 001 executable source corpus;
- treat behavior-bearing story logic as a later Gameplay/story-artifact law if
  it is retained conceptually;
- treat current root/domain/config narrative barrels as collars to remove when
  the implementation slice deletes the narrative source;
- keep placement, resources, adapter, and Civ7 UI narrative-control code outside
  this packet.
