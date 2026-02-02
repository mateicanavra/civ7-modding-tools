<toc>
  <item id="tldr" title="TL;DR"/>
  <item id="changes" title="What changed"/>
  <item id="open" title="Open follow-ups"/>
</toc>

# Slice 13B report — Deprecation/archiving execution (MapGen docs alignment)

## TL;DR

This slice reduces “search collision” between project/history docs and the canonical MapGen doc spine by:
- archiving legacy Studio slice docs (preserving history) while leaving router stubs in place, and
- adding explicit non-canonical Status framing + canonical pointers to MapGen-adjacent project/mod docs.

## What changed

### 1) Executed archiving via script (bulk move policy)

- Script: `docs/projects/engine-refactor-v1/mapgen-docs-alignment/scripts/execute_deprecation_archiving.py`
- Source of truth: `docs/projects/engine-refactor-v1/mapgen-docs-alignment/DEPRECATION-MANIFEST.md` (`status == archive`)

Archived (moved under `docs/_archive/**` with router stubs left at original paths):
- `docs/projects/mapgen-studio/V0-IMPLEMENTATION-PLAN.md`
- `docs/projects/mapgen-studio/V0.1-SLICE-FOUNDATION-WORKER-DECKGL.md`
- `docs/projects/mapgen-studio/V0.1-SLICE-TILESPACE-HEIGHT-LANDMASK-DECKGL.md`
- `docs/projects/mapgen-studio/V0.1-SLICE-CONFIG-OVERRIDES-UI-WORKER.md`

### 2) Added explicit “not canonical” framing to reduce doc collisions

Added a top-level Status framing and canonical pointers to MapGen-adjacent docs that are likely to be found by search
and mistaken as canonical:
- MapGen Studio project docs under `docs/projects/mapgen-studio/**`
- Swooper Maps mod docs under `docs/system/mods/swooper-maps/**`

### 3) Updated the manifest to reflect final decisions

Updated `docs/projects/engine-refactor-v1/mapgen-docs-alignment/DEPRECATION-MANIFEST.md` to reflect:
- executed archives (with destinations),
- “keep (framed)” dispositions for relevant project/mod docs,
- and explicit canonical pointers to the MapGen doc spine.

## Open follow-ups

- Triaging additional MapGen-adjacent docs not yet listed in the manifest (especially under `docs/projects/mapgen-studio/**/` and `docs/system/**`).
- Slice 13C (post-merge): Viz terminology/codepath parity updates to canonical viz docs under `docs/system/libs/mapgen/**`.
