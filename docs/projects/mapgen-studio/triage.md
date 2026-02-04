# Status: Project tracker (MapGen Studio)

This page is a project-local triage list and may drift.
It is **not** canonical MapGen documentation.

Canonical entrypoints:
- `docs/system/libs/mapgen/MAPGEN.md`
- `docs/process/LINEAR.md`

# Mapgen Studio Triage

## Open Risks
- Config overrides JSON can be applied one run late, making validation/repro unreliable (see REVIEW-M1 RFX-01).
- Segment-layer bounds ignore half the coordinates, so fit/viewport can clip segments in both live runs and dumps (see REVIEW-M1 RFX-02).
- Viz layer keys collide when `fileKey`/`valuesPath` differ, making some layers unselectable (see REVIEW-M1 RFX-03).
- Viz selection refs mutate during render; StrictMode can desync selection state (see REVIEW-M1 RFX-03).
- Dump folder picker can throw on browsers that only support `values()` (see REVIEW-M1 RFX-04).
- `selectedStepId` can drift stale when manifest changes, causing step selection to snap back on later runs (see REVIEW-M1 PV-05).
