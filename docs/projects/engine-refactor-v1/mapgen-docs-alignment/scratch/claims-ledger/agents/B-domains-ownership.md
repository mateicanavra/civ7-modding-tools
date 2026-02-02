<toc>
  <item id="scope" title="Scope"/>
  <item id="rows" title="Candidate rows"/>
  <item id="anchors" title="Preferred anchors"/>
</toc>

# Agent B — Domains + ownership (claims working sheet)

## Scope

Audit interpretive claims related to:
- which domains are canonical MapGen domains (Foundation/Morphology/Hydrology/Ecology/…),
- domain boundaries / ownership (MapGen vs Gameplay),
- standard recipe stages/steps naming and whether specific stages are “canonical”.

Hotspot: Narrative + Placement posture. If target authority says they dissolve into Gameplay or are forbidden/legacy, MapGen docs must not present them as canonical target posture.

Goal: produce **ledger rows** (not prose) that can be merged into `../CLAIMS-LEDGER.md`.

## Candidate rows

Add rows here in the same format as the ledger table:
- `claimId`
- `docPath`
- `quotedClaim`
- `claimType`
- `state`
- `anchors`
- `recommendedEdit`
- `notes`

### Rows (draft)

| claimId | docPath | quotedClaim | claimType | state | anchors | recommendedEdit | notes |
|---|---|---|---|---|---|---|---|
| B-NARR-001 | `docs/system/libs/mapgen/reference/domains/NARRATIVE.md` | “Narrative is the target-canonical domain intended to encode “story overlays”…“ | ownership | TARGET-DRIFT | `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/plans/gameplay/APPENDIX-SCOPE-AND-ABSORPTION.md`, `docs/projects/engine-refactor-v1/resources/spec/SPEC-architecture-overview.md` | Reframe page posture: Narrative/playability is Gameplay-owned; “Narrative domain” is legacy naming. | P0/P1: avoid encoding wrong ownership. |
| B-NARR-002 | `docs/system/libs/mapgen/reference/domains/NARRATIVE.md` | “Narrative is **not** included as a stage.” | behavior | CURRENT-CORRECT | `mods/mod-swooper-maps/src/recipes/standard/recipe.ts` | None (keep). | Still valuable “what is” signal. |
| B-PLAC-001 | `docs/system/libs/mapgen/reference/domains/PLACEMENT.md` | “Placement is the pipeline boundary where “map content” becomes “gameplay outcomes”…“ | ownership | TARGET-DRIFT | `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/plans/gameplay/APPENDIX-SCOPE-AND-ABSORPTION.md` | Rename posture in doc to “Gameplay (placement phase)” and mark Placement as legacy domain naming. | Stage may still be called `placement`; ownership is Gameplay. |
| B-PLAC-002 | `docs/system/libs/mapgen/reference/domains/PLACEMENT.md` | “Placement provides: `effect:engine.placementApplied`…” | behavior | CURRENT-CORRECT | `mods/mod-swooper-maps/src/recipes/standard/tags.ts`, `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/placement/contract.ts` | None (keep). | Verified tag exists + is provided by the placement step. |

## Preferred anchors

Target authority (what should be):
- `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/WORKFLOW.md`
- `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/references/phase-2-modeling.md`

Canonical system docs (what we currently claim is canonical):
- `docs/system/libs/mapgen/reference/domains/**`
- `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`
