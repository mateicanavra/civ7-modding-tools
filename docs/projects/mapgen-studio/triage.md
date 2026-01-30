# Mapgen Studio Triage

## Open Risks
- Config overrides JSON can be applied one run late, making validation/repro unreliable (see REVIEW-M1 RFX-01).
- Segment-layer bounds ignore half the coordinates, so fit/viewport can clip segments in both live runs and dumps (see REVIEW-M1 RFX-02).
