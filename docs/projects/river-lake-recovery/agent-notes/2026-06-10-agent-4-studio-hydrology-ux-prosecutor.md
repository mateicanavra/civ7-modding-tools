# Agent 4 - Studio Hydrology UX Prosecutor

Goal: attack hydrology visualization, naming, status, and proof UX from the
user's perspective.

Inquiry design:

- Primary question: can a user tell why rivers/lakes/floodplains appear or do
  not appear for the run they launched?
- Evidence policy: same-run Studio state and live proof packets outrank raw
  layer availability.
- Falsifier: raw layers exist but the user cannot follow planned -> projected
  -> live -> rendered status.

Findings:

- Studio has many layers but lacks a proof ladder.
- `projectedRiverMask` and `engineRiverMask` need explicit roles and labels so
  users do not confuse projection plan with engine readback.
- Duplicating Hydrology truth layers under map-rivers grouping obscures owner
  boundaries.
- Lakes are closer, but exact counters/drift are not surfaced clearly enough.
- Floodplains need intent/applied/live product rows, not just score layers.

Risks:

- "Run in Game" can look complete while product proof rows are unresolved.
- Layer sprawl can hide a zero-river product failure behind many nonzero
  intermediate masks.
