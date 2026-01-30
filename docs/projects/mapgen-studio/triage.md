# Mapgen Studio Triage

## Open Risks
- Config overrides JSON can be applied one run late, making validation/repro unreliable (see REVIEW-M1 RFX-01).
- Segment-layer bounds ignore half the coordinates, so fit/viewport can clip segments in both live runs and dumps (see REVIEW-M1 RFX-02).
- Viz layer keys collide when `fileKey`/`valuesPath` differ, making some layers unselectable (see REVIEW-M1 RFX-03).
- Viz selection refs mutate during render; StrictMode can desync selection state (see REVIEW-M1 RFX-03).
