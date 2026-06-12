## Why

The river/lake recovery lane needs to be reframed before more implementation.
The current execution goal is tied to a stale workstream path, the prior
implementation narrowed the closure claim below the product outcome, and the
remaining work spans upstream hydrology truth, Civ-facing projection, Studio/Civ
parity, and rendered product acceptance. A correct next step is not another
local patch. It is a grounded redesign of the workstream itself.

This redesign starts from authority and physical reality:

- Morphology owns terrain and basin precursors.
- Hydrology owns canonical flow routing, discharge, river truth, and lake truth.
- `@civ7/map-policy` owns pure Civ facts, catalog semantics, and compliance
  tables only.
- `map-*` stages own projection/materialization/evidence only.

The redesign must also predeclare physically plausible expectations and explicit
proof boundaries so the lane cannot be closed again on code-level or readback
evidence alone while visible rivers are still missing in product reality.

## Target Authority Refs

- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
- `docs/system/libs/mapgen/reference/domains/HYDROLOGY.md`
- `openspec/changes/river-lake-adversarial-workstream-design/**`
- `openspec/changes/upstream-drainage-routing-repair/**`
- `openspec/changes/hydrology-river-network-metrics/**`
- `openspec/changes/map-rivers-navigable-coherence/**`
- `openspec/changes/river-lake-proof-class-ledger/**`
- `openspec/changes/river-runtime-visible-proof/**`
- `openspec/changes/lake-floodplain-product-proof-gates/**`
- `openspec/changes/studio-river-lake-inspector-dx/**`
- `openspec/changes/swooper-earthlike-product-acceptance-proof/**`
- `openspec/changes/civ7-map-policy-final-surface-parity/**`
- `openspec/changes/earthlike-visible-river-acceptance/**`
- Root `AGENTS.md`

## What Changes

- Frame a new durable river/lake recovery objective and closure boundary.
- Re-ground the workstream in product authority, architecture authority, and
  physical river/lake expectations before more execution.
- Reconcile the redesign against the already-installed river/lake OpenSpec
  change inventory so follow-on execution uses real change ids instead of chat
  memory or parallel planning lanes.
- Define the bounded change train needed to recover:
  - upstream hydrology routing/truth,
  - generated-map hydrology metrics,
  - Civ semantic surface parity,
  - projection/materialization behavior,
  - proof-class separation,
  - Studio/Civ same-run proof,
  - rendered visible-river and lake/floodplain acceptance,
  - and stable user-facing knobs and inspector DX.
- Replace stale or wrong-owner assumptions in the plan rather than preserving
  them as compatibility requirements.
- Emit a new execution-ready change sequence and handoff boundary.

## Requires

- Live authority and current repo state review.

## Enables Parallel Work

- Targeted implementation slices for hydrology truth, Civ-policy parity,
  projection/materialization, parity proof, and acceptance closure.

## Affected Owners

- `mods/mod-swooper-maps/**` hydrology, morphology, and projection owners
- `packages/map-policy/**`
- Studio/runtime proof owners where verification requires it
- OpenSpec workstream and acceptance-proof records

## Forbidden Owners

- No new wrong-owner selectors or projection policy inside `map-*` stages.
- No Civ readback or screenshots promoted into authored hydrology truth.
- No preserving legacy length-threshold behavior only because it is public today.
- No closure from unit tests, stats, or terrain readback alone.

## Verification Gates

- OpenSpec strict validation for this redesign change.
- Authority-grounded workstream records with explicit hard core, exterior,
  falsifier, proof classes, and closure boundary.
- An execution change train whose slices each name owner, write set, proof
  gates, and stop conditions.
