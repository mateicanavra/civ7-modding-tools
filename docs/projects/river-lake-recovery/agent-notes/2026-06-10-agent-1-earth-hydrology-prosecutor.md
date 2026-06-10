# Agent 1 - Earth Hydrology Prosecutor

Goal: attack physical plausibility and benchmark definitions before any tuning.

Inquiry design:

- Primary question: what Earth constraints must the generator respect before
  local output can be called representative?
- Evidence policy: external hydrology datasets and peer-reviewed/official
  summaries outrank current generator behavior.
- Falsifier: one scalar river-density threshold is treated as sufficient.

Findings:

- Benchmarks must be grouped by regime, map scale, and visible feature floor.
- Headwater/minor channels should dominate truth-network length on wet maps.
- Non-perennial channels are common globally and should not be a rare edge case.
- Endorheic and closed-basin outcomes are normal in arid/interior worlds.
- Lake area should usually be low-single-digit land share, not near-zero and
  not unconstrained.

Risks:

- Civ tile scale forces stylization; the workstream needs an explicit
  stylization ledger.
- Local seed metrics can calibrate only after external expectations are set.
