## Why

The final product target is not only parity. The map must look and play like a
beautiful, physically grounded Swooper Earthlike world in Studio and in Civ.
Existing diagnostic gates are useful, but product acceptance needs fresh stable
seed/size evidence tied to exact authorship and classified final surfaces.

## Target Authority Refs

- `openspec/changes/swooper-stack-recovery-consolidation/workstream/branch-recovery-ledger.md`
- `openspec/changes/earthlike-balance-diagnostic-gates/**`
- `openspec/changes/swooper-world-balance-recovery/**`
- `openspec/changes/civ7-map-policy-final-surface-parity/**`

## What Changes

- Define stable seed/size acceptance set for product proof.
- Run product-visible acceptance for mountain regions, rivers/floodplains,
  resources, wonders, starts, vegetation, coasts/shelves, archipelagos, and
  Studio visualization.
- Pair screenshots, stats, diagnostics, and live readback for the same
  exact-authorship runs.
- Open targeted repair workstreams only from concrete failing proof rows.

## Requires

- `studio-civ7-exact-authorship-proof`
- `civ7-map-policy-final-surface-parity`
- Existing Earthlike diagnostic gates

## Enables Parallel Work

- Evidence-gated targeted repair categories.
- Final stack product closure after all acceptance rows pass or are
  dispositioned with source-backed scope.

## Affected Owners

- `mods/mod-swooper-maps/**` for proof-backed mapgen behavior gaps
- `apps/mapgen-studio/**` for visualization/projection/legend acceptance gaps
- OpenSpec proof and review ledgers

## Forbidden Owners

- No acceptance from screenshots alone.
- No acceptance from numeric tests alone.
- No tuning without exact-authorship and final-surface proof inputs.

## Stop Conditions

- Exact-authorship proof is missing or stale.
- Final-surface deltas remain unclassified.
- Product acceptance criteria cannot distinguish product issue, visualization
  issue, live materialization issue, and expected policy behavior.

## Consumer Impact

Users get a Studio and Civ experience where the selected Swooper Earthlike map
is both exact and visibly good.

## Verification Gates

- Stable-seed diagnostics and screenshots.
- Exact-authorship proof for the accepted runs.
- Full-grid or classified live readback for accepted runs.
- Focused tests for any repaired acceptance row.
- OpenSpec strict validation.
