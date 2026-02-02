<toc>
  <item id="tldr" title="TL;DR"/>
  <item id="scope" title="Scope"/>
  <item id="rules" title="Rules (how we decide)"/>
  <item id="rubric" title="Classification rubric"/>
  <item id="manifest" title="Deprecation manifest (candidates)"/>
  <item id="scan" title="Scan output (untriaged)"/>
  <item id="next" title="Next actions (follow-on slices)"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Deprecation manifest: MapGen-related docs outside the canonical spine

## TL;DR

We now have a canonical MapGen doc spine under `docs/system/libs/mapgen/**`.

To make that spine safe to treat as “primary source of truth” (for humans and agents), we still need an explicit sweep
of **other** MapGen-related docs/specs elsewhere in the repo and a manifest of:
- what should be **archived** (not deleted),
- what should be **kept but explicitly framed** (project history / planning docs),
- what should be **routed** to canonical docs (legacy entrypoints),
- and what should be **updated** to avoid conflicting guidance.

This file is the authoritative working manifest for that sweep.

## Scope

Included:
- Any non-archived docs under `docs/**` that contain **MapGen guidance** (how to run, how to extend, architecture/contracts),
  but do **not** live under `docs/system/libs/mapgen/**`.
- Project docs/specs that are likely to be found by agents (by search) and accidentally treated as canonical.

Excluded:
- `docs/_archive/**` (already archived; we may still add routers, but we don’t “re-archive” these).
- `docs/_sidebar.md` (auto-generated; do not edit).

## Rules (how we decide)

We keep a hard separation between:
- **WHAT IS**: current implementation posture (anchored to code paths/symbols), and
- **WHAT SHOULD BE**: target authority posture (anchored to workflow/spec docs).

We do **not** “decide architecture by doc-writing” during this sweep.

## Classification rubric

For each candidate doc:

- `archive`: obsolete/superseded; move contents under `docs/_archive/**` (preserve history) and leave a non-canonical router stub.
- `route`: keep file but convert it to a short router (“This is legacy; go here instead”), then point to canonical docs.
- `keep`: still useful and non-conflicting; may add a small “Status” header clarifying its scope.
- `update`: still needed but has conflicting guidance; must be corrected to align with canonical docs and/or target authority.

## Deprecation manifest (candidates)

> This table is intentionally conservative: being in the list does **not** automatically mean “archive it”.
> It means “it’s MapGen-adjacent and likely to cause confusion unless explicitly handled.”

| path | status | why obsolete / risky | replaced by (canonical) | notes |
|---|---|---|---|---|
| `docs/projects/mapgen-studio/V0-IMPLEMENTATION-PLAN.md` | archive | V0 plan docs read as actionable instructions, but Studio + viz posture has now moved to the canonical MapGen spine and current Studio code. | `docs/system/libs/mapgen/MAPGEN.md`, `docs/system/libs/mapgen/reference/STUDIO-INTEGRATION.md`, `docs/system/libs/mapgen/pipeline-visualization-deckgl.md` | Archived as `docs/_archive/projects/mapgen-studio/V0-IMPLEMENTATION-PLAN.md`; router stub left in place. |
| `docs/projects/mapgen-studio/V0.1-SLICE-FOUNDATION-WORKER-DECKGL.md` | archive | Slice planning doc; conflicts with current deck.gl viewer implementation + terminology and can be mistaken as “how to run Studio”. | `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`, `docs/system/libs/mapgen/reference/VISUALIZATION.md` | Archived as `docs/_archive/projects/mapgen-studio/V0.1-SLICE-FOUNDATION-WORKER-DECKGL.md`; router stub left in place. |
| `docs/projects/mapgen-studio/V0.1-SLICE-TILESPACE-HEIGHT-LANDMASK-DECKGL.md` | archive | Early viz slice planning; likely describes deprecated layer taxonomy and workflows. | `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`, `docs/system/libs/mapgen/reference/VISUALIZATION.md` | Archived as `docs/_archive/projects/mapgen-studio/V0.1-SLICE-TILESPACE-HEIGHT-LANDMASK-DECKGL.md`; router stub left in place. |
| `docs/projects/mapgen-studio/V0.1-SLICE-CONFIG-OVERRIDES-UI-WORKER.md` | archive | Early config-overrides planning; Studio schema-defaulting and override posture evolved. | `docs/system/libs/mapgen/reference/STUDIO-INTEGRATION.md`, `docs/system/libs/mapgen/tutorials/run-standard-recipe-in-studio.md` | Archived as `docs/_archive/projects/mapgen-studio/V0.1-SLICE-CONFIG-OVERRIDES-UI-WORKER.md`; router stub left in place. |
| `docs/projects/mapgen-studio/BROWSER-RUNNER-V0.1.md` | update | Useful deep design notes, but it must not be mistaken as canonical runtime or current Studio UX. | `docs/system/libs/mapgen/reference/STUDIO-INTEGRATION.md`, `docs/system/libs/mapgen/MAPGEN.md` | Add top “Status: project doc” framing and route to canonical. |
| `docs/projects/mapgen-studio/BROWSER-ADAPTER.md` | update | Useful capability spec, but can be mistaken as canonical SDK contract. | `docs/system/libs/mapgen/reference/STUDIO-INTEGRATION.md`, `docs/system/libs/mapgen/MAPGEN.md` | Add top “Status: project doc” framing and route to canonical. |
| `docs/projects/mapgen-studio/VIZ-SDK-V1.md` | update | Reads like the canonical viz contract; must be framed as project/implementation notes so it doesn’t compete with the canonical MapGen spine. | `docs/system/libs/mapgen/reference/VISUALIZATION.md`, `docs/system/libs/mapgen/pipeline-visualization-deckgl.md` | Add top “Status: project doc” framing + explicit “canonical wins” pointer. |
| `docs/projects/mapgen-studio/VIZ-LAYER-CATALOG.md` | update | Useful catalog, but may use stale terminology and can be mistaken as canonical. | `docs/system/libs/mapgen/reference/VISUALIZATION.md`, `docs/system/libs/mapgen/pipeline-visualization-deckgl.md` | Add top “Status: project doc” framing. |
| `docs/projects/mapgen-studio/VIZ-DECLUTTER-SEMANTICS-GREENFIELD-PLAN.md` | keep | Legit plan doc; confusion risk is being treated as current contract. | `docs/system/libs/mapgen/reference/VISUALIZATION.md`, `docs/system/libs/mapgen/pipeline-visualization-deckgl.md` | Add top “Status: project plan” framing. |
| `docs/projects/mapgen-studio/ROADMAP.md` | keep | Roadmap is legitimate, but should route readers to canonical contracts so it’s not used as “how to”. | `docs/system/libs/mapgen/MAPGEN.md` | Add explicit “canon lives here” link. |
| `docs/projects/mapgen-studio/architecture-assessment.md` | keep | Assessment docs are useful but can confuse “current” vs “target”. | `docs/system/libs/mapgen/MAPGEN.md` | Add top “Status: project assessment” framing. |
| `docs/projects/mapgen-studio/resources/seams/SEAM-VIZ-DECKGL.md` | keep | Seam notes are useful but are not canonical contracts and contain dated implementation details. | `docs/system/libs/mapgen/reference/STUDIO-INTEGRATION.md`, `docs/system/libs/mapgen/pipeline-visualization-deckgl.md` | Add top “Status: project seam doc” framing. |
| `docs/projects/mapgen-studio/resources/seams/SEAM-DUMP-VIEWER.md` | keep | Seam notes are useful but are not canonical contracts and contain dated implementation details. | `docs/system/libs/mapgen/reference/STUDIO-INTEGRATION.md`, `docs/system/libs/mapgen/pipeline-visualization-deckgl.md` | Add top “Status: project seam doc” framing. |
| `docs/projects/mapgen-studio/resources/seams/SEAM-BROWSER-RUNNER.md` | keep | Seam notes are useful but are not canonical contracts and contain dated implementation details. | `docs/system/libs/mapgen/reference/STUDIO-INTEGRATION.md` | Add top “Status: project seam doc” framing. |
| `docs/system/mods/swooper-maps/architecture.md` | update | Mod-level doc can be found by search and mistaken as canonical MapGen SDK guidance. | `docs/system/libs/mapgen/MAPGEN.md`, `docs/system/libs/mapgen/reference/REFERENCE.md` | Add top “Status: mod doc; MapGen canon lives elsewhere” framing. |
| `docs/system/mods/swooper-maps/vision.md` | keep | Vision-level doc is OK; ensure it doesn’t prescribe old architecture and routes to canonical MapGen docs for SDK contracts. | `docs/system/libs/mapgen/MAPGEN.md` | Add a short “See canonical MapGen docs” pointer. |
| `docs/system/ADR.md` (MapGen/viz sections) | keep | ADRs are canonical decisions; keep as-is unless they materially contradict the canonical MapGen spine. | `docs/system/libs/mapgen/pipeline-visualization-deckgl.md` | Prefer no changes in Slice 13B. |

## Scan output (untriaged)

The curated table above is not exhaustive. For a machine-assisted, search-based candidate list (not triaged),
see:
- `docs/projects/engine-refactor-v1/mapgen-docs-alignment/scratch/deprecation-scan.md`

## Next actions (follow-on slices)

This manifest enables two follow-on slices (not done in this slice):

1) **Slice 13B — Execute archiving + routing**  
   - Move `archive` docs under `docs/_archive/**` (preserve structure), using a Python script (bulk move).
   - Convert `route` docs into minimal routers that point to canonical pages.
   - Add a short “Status” header to `keep/update` docs clarifying scope.

2) **Slice 13C — Viz parity pass (post-merge)**  
   - Once the `dev-viz-v1-*` implementation stack stabilizes/merges, update canonical viz docs to match:
     - UI terminology (`layer` vs `dataType`, `projection` vs `renderMode`),
     - any contract shape changes (if any),
     - and viewer workflow details.

## Ground truth anchors

- Canonical MapGen gateway: `docs/system/libs/mapgen/MAPGEN.md`
- Canonical Studio seam reference: `docs/system/libs/mapgen/reference/STUDIO-INTEGRATION.md`
- Canonical viz doc: `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`
- Claim/audit posture (no architecture invention): `docs/projects/engine-refactor-v1/mapgen-docs-alignment/SLICE-12A-CLAIMS-AUDIT-DIRECTIVE.md`
