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

- `archive`: obsolete/superseded; should move under `docs/_archive/**` (preserve history).
- `route`: keep file but convert it to a short router (“This is legacy; go here instead”), then point to canonical docs.
- `keep`: still useful and non-conflicting; may add a small “Status” header clarifying its scope.
- `update`: still needed but has conflicting guidance; must be corrected to align with canonical docs and/or target authority.

## Deprecation manifest (candidates)

> This table is intentionally conservative: being in the list does **not** automatically mean “archive it”.
> It means “it’s MapGen-adjacent and likely to cause confusion unless explicitly handled.”

| path | status | why obsolete / risky | replaced by (canonical) | notes |
|---|---|---|---|---|
| `docs/projects/mapgen-studio/V0-IMPLEMENTATION-PLAN.md` | archive | V0 plan docs read as actionable instructions, but Studio + viz posture has now moved to the canonical MapGen spine and current Studio code. | `docs/system/libs/mapgen/MAPGEN.md`, `docs/system/libs/mapgen/reference/STUDIO-INTEGRATION.md`, `docs/system/libs/mapgen/pipeline-visualization-deckgl.md` | Archive as “implementation history”; keep as provenance only. |
| `docs/projects/mapgen-studio/V0.1-SLICE-FOUNDATION-WORKER-DECKGL.md` | archive | Slice planning doc; likely conflicts with current deck.gl viewer implementation + naming (`layer` → `dataType`, `projection` → `renderMode`). | `docs/system/libs/mapgen/pipeline-visualization-deckgl.md` | Replace with a router or archive; prefer archive if fully superseded. |
| `docs/projects/mapgen-studio/V0.1-SLICE-TILESPACE-HEIGHT-LANDMASK-DECKGL.md` | archive | Early viz slice planning; may describe deprecated layer taxonomy. | `docs/system/libs/mapgen/pipeline-visualization-deckgl.md` | Same. |
| `docs/projects/mapgen-studio/V0.1-SLICE-CONFIG-OVERRIDES-UI-WORKER.md` | archive | Early config-overrides planning; Studio UI + schema-defaulting posture has evolved. | `docs/system/libs/mapgen/tutorials/run-standard-recipe-in-studio.md`, `docs/system/libs/mapgen/tutorials/tune-a-preset-and-knobs.md` | Archive as history; optionally add a short pointer to current tutorial docs. |
| `docs/projects/mapgen-studio/BROWSER-RUNNER-V0.1.md` | update/keep | Could still be useful as deep design notes, but it must not contradict the canonical Studio seam docs and must clearly label itself as project doc. | `docs/system/libs/mapgen/reference/STUDIO-INTEGRATION.md` | Candidate for “keep with explicit Status header + ‘See canonical’ links”. |
| `docs/projects/mapgen-studio/BROWSER-ADAPTER.md` | update/keep | Potentially still relevant, but must not be treated as canonical SDK docs. | `docs/system/libs/mapgen/reference/STUDIO-INTEGRATION.md` | Likely “keep” with framing. |
| `docs/projects/mapgen-studio/VIZ-SDK-V1.md` | update | If it defines viz contracts that differ from current `@swooper/mapgen-viz` and Studio dump viewer reality, it’s a conflict risk. | `docs/system/libs/mapgen/reference/VISUALIZATION.md`, `docs/system/libs/mapgen/pipeline-visualization-deckgl.md` | Needs parity check once viz implementation stack stabilizes. |
| `docs/projects/mapgen-studio/VIZ-LAYER-CATALOG.md` | update/keep | Useful, but if it uses old terminology (layer/projection) it should be updated or labeled as historical. | `docs/system/libs/mapgen/pipeline-visualization-deckgl.md` | Might become an appendix linked from canonical viz doc (if still accurate). |
| `docs/projects/mapgen-studio/VIZ-DECLUTTER-SEMANTICS-GREENFIELD-PLAN.md` | keep/archive | Plan doc; may still guide future viz work. Risk is being mistaken as current contract. | `docs/system/libs/mapgen/pipeline-visualization-deckgl.md` | Prefer keep but add top “Status: project plan; canonical contract is …”. |
| `docs/projects/mapgen-studio/ROADMAP.md` | keep | Roadmap is legitimate, but should route readers to canonical contracts so it’s not used as “how to”. | `docs/system/libs/mapgen/MAPGEN.md` | Add explicit “canon lives here” link. |
| `docs/projects/mapgen-studio/architecture-assessment.md` | keep/archive | Assessment docs are useful but can confuse “current” vs “target”. | `docs/system/libs/mapgen/architecture/ARCHITECTURE.md` | Consider “keep with framing”. |
| `docs/system/mods/swooper-maps/architecture.md` | update | If it gives usage guidance that duplicates/collides with canonical MapGen docs, add explicit routing and remove prescriptive instructions. | `docs/system/libs/mapgen/MAPGEN.md` | This is mod-level doc; should focus on mod structure, not MapGen SDK contracts. |
| `docs/system/mods/swooper-maps/vision.md` | keep | Vision-level doc is OK; ensure it doesn’t prescribe old architecture. | `docs/system/libs/mapgen/MAPGEN.md` | Add a “See canonical MapGen docs” link if missing. |
| `docs/system/ADR.md` (MapGen/viz sections) | keep | ADRs are canonical decisions; they should remain but may need explicit links to the canonical doc spine. | `docs/system/libs/mapgen/pipeline-visualization-deckgl.md` | Keep; add cross-links only if they help. |

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
