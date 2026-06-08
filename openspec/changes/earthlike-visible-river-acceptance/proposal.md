## Why

Visible river and floodplain failures are product blockers only when a proof row
ties them to the exact authored map and classifies whether the issue belongs to
hydrology truth, ecology/floodplain policy, Studio visualization, or Civ
materialization.

## Activation Gate

This change is evidence-gated. Do not implement it until
`civ7-map-policy-final-surface-parity` or
`swooper-earthlike-product-acceptance-proof` records a failing visible-river or
floodplain row.

## Target Authority Refs

- `openspec/changes/swooper-stack-recovery-consolidation/workstream/branch-recovery-ledger.md`
- `openspec/changes/swooper-earthlike-product-acceptance-proof/**`
- `openspec/changes/civ7-map-policy-final-surface-parity/**`
- Hydrology and ecology sections of the architecture normalization packet

## What Changes

- Isolate the failing row across authored hydrology truth, projected navigable
  rivers, floodplain-capable ecology truth, Studio rendering, and live readback.
- Repair only the owning layer proven by evidence.
- Add product-visible tests or diagnostics that fail on the captured row.

## Requires

- A concrete failing proof row.

## Enables Parallel Work

- Product acceptance rerun for rivers/floodplains.

## Affected Owners

- `mods/mod-swooper-maps/**` hydrology/ecology/map-rivers owners when proven.
- `apps/mapgen-studio/**` only for rendering/projection faults.

## Forbidden Owners

- No placement-owned floodplain truth.
- No Civ readback as authored river truth.
- No river tuning from screenshots alone.

## Stop Conditions

- The proof row cannot distinguish authoring, projection, visualization, and live
  materialization.
- The failing row is stale relative to current exact-authorship proof.

## Verification Gates

- Focused failing-row test or diagnostic.
- Same-run Studio screenshot plus live readback/classified delta.
- OpenSpec strict validation.
