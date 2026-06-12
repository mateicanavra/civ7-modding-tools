# Agent 6 - Verification Closure Prosecutor

Goal: attack overclaiming and incomplete proof closure.

Inquiry design:

- Primary question: which proof rows are actually closed by same-run evidence,
  and which are still just local/code-level?
- Evidence policy: proof labels must be scoped to the boundary exercised.
- Falsifier: a lower proof class closes a higher product row.

Findings:

- Existing evidence covers pieces of Hydrology truth, projection plan, terrain
  readback, floodplain activity, and native writer probing; no run is a full
  product pass.
- `civ-rendered` requires exact branch/commit/run/config identity, sampled live
  coordinates, camera state, screenshot artifacts, and a visual verdict.
- No-signal cases are valid only as controls/dispositions, not positive passes.
- Lake and floodplain proof need exact counters and active rows.

Risks:

- Product closure can drift if Studio-visible, Civ-rendered, and reviewer rows
  are not explicit independent gates.
- A stale live map or old run id can invalidate an otherwise plausible proof.
