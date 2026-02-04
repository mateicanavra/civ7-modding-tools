# Foundation refactor planning packet: sources (realism)

Date: 2026-02-03

Goal: identify the *current* (recent) “big plan” documents for making Foundation more physically realistic (mantle/lid posture; magma + water as drivers), so we can finish planning a Foundation refactor.

## Primary documents (recent, plan-scale)

1) `docs/projects/engine-refactor-v1/resources/spike/spike-foundation-realism-gaps.md`
- Last modified (git): 2026-01-24 (`6d4188c39`)
- Why this is likely “the big plan”:
  - It’s an evidence-backed remediation spike for Foundation realism (mesh → crust → plates → tectonics → projection).
  - It contains a concrete “Candidate slices” section and a synthesized plan-ready direction.
  - It explicitly names a mantle-scale driver option: “basin-weighted” plate partitioning using a low-frequency mantle/basin driver field.
- Companion deep dives (same spike set):
  - `docs/projects/engine-refactor-v1/resources/spike/foundation-realism/plate-partition-realism.md`
  - `docs/projects/engine-refactor-v1/resources/spike/foundation-realism/tectonic-segments-and-history.md`
  - `docs/projects/engine-refactor-v1/resources/spike/foundation-realism/polar-caps-as-plates.md`
  - `docs/projects/engine-refactor-v1/resources/spike/foundation-realism/crust-load-bearing-prior.md`
  - `docs/projects/engine-refactor-v1/resources/spike/foundation-realism/validation-and-observability.md`

2) `docs/projects/engine-refactor-v1/resources/spike/spike-foundation-realism-open-questions-alternatives.md`
- Last modified (git): 2026-01-24 (`6d4188c39`)
- Why it matters:
  - It takes the same realism spike and turns it into explicit decision points with alternatives + recommendations.
  - It is effectively the “decision packet” counterpart to the gaps/remediation spike.

## Canonical contract baseline (not new, but authoritative)

`docs/system/libs/mapgen/reference/domains/FOUNDATION.md`
- Last modified (git): 2026-02-02 (`ae4e15c29`)
- Use this as the contract/ownership anchor while planning changes suggested by the realism spike.

## Secondary prior art (mantle field concept, legacy)

`docs/system/libs/mapgen/_archive/LEGACY-mapgen-earth-forces-and-layer-contracts.md`
- Last modified (git): 2025-12-10 (`a9192b64a`)
- Useful as prior art for a lightweight mantle proxy field (“mantle pressure bumps”) and coupled wind/currents fields.

## Imported proposals (agent-authored, older PR; useful for reconciliation)

These were imported from an older PR commit for comparison/reconciliation with the M11 realism spike set:

- `docs/projects/pipeline-realism/resources/packets/foundation-proposals/unified-foundation-refactor.md`
- `docs/projects/pipeline-realism/resources/packets/foundation-proposals/tectonic-evolution-engine.md`
- `docs/projects/pipeline-realism/resources/packets/foundation-proposals/first-principles-crustal-evolution.md`
- `docs/projects/pipeline-realism/resources/packets/foundation-proposals/foundation-domain.md`
- `docs/projects/pipeline-realism/resources/packets/foundation-proposals/foundation-domain-improvements.md`
- Provenance: `docs/projects/pipeline-realism/resources/packets/foundation-proposals/README.md`

## Imported proposals (agent-authored, “spec packet”; useful for reconciliation)

These were imported from another historical commit (proposal + supporting specs that previously lived in `docs/system/libs/mapgen/_archive/`):

- `docs/projects/pipeline-realism/resources/packets/foundation-refactor-proposal-packet/raw/docs/system/libs/mapgen/foundation-refactor-proposal.md`
- `docs/projects/pipeline-realism/resources/packets/foundation-refactor-proposal-packet/raw/docs/system/libs/mapgen/_archive/foundation-tectonic-evolution-spec.md`
- `docs/projects/pipeline-realism/resources/packets/foundation-refactor-proposal-packet/raw/docs/system/libs/mapgen/_archive/foundation-first-principles-lid-to-continents-spec.md`
- `docs/projects/pipeline-realism/resources/packets/foundation-refactor-proposal-packet/raw/docs/system/libs/mapgen/_archive/foundation-plate-motion-and-partition-spec.md`
- `docs/projects/pipeline-realism/resources/packets/foundation-refactor-proposal-packet/raw/docs/system/libs/mapgen/_archive/foundation-crust-assembly-spec.md`
- `docs/projects/pipeline-realism/resources/packets/foundation-refactor-proposal-packet/raw/docs/system/libs/mapgen/_archive/foundation-resolution-authoring-spec.md`
- `docs/projects/pipeline-realism/resources/packets/foundation-refactor-proposal-packet/raw/docs/system/libs/mapgen/_archive/foundation-projection-and-morphology-consumption-spec.md`
- `docs/projects/pipeline-realism/resources/packets/foundation-refactor-proposal-packet/raw/docs/system/libs/mapgen/_archive/foundation-improvement-proposal.md`
- Provenance: `docs/projects/pipeline-realism/resources/packets/foundation-refactor-proposal-packet/README.md`

## Deprecated / Not In This Packet (Explicitly)

These are intentionally *not* used as primary sources for the Foundation realism/refactor plan:

- `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/plans/foundation/spike-foundation-modeling.md`
  - Still useful as Phase-2 model-first posture, but it is not the most recent “realism upgrade” plan-scale doc set.
- `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/plans/morphology/_archive/v2/spike-morphology-modeling-gpt-addendum-scope.md`
  - Useful for “no overlay inputs + physics-first hotspots” framing, but it’s Morphology-scoped and not the current Foundation realism plan spine.
