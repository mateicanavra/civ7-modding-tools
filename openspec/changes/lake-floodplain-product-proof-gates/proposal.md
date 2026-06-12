## Why

Lakes currently show up, but product closure still needs exact final counters.
Floodplains need an active seed row, not an inactive zero-count map. River/lake
closure also needs a product matrix that prevents narrow technical passes from
being declared done.

## Target Authority Refs

- `openspec/changes/river-lake-adversarial-workstream-design/workstream/adversarial-agent-synthesis.md`
- `openspec/changes/swooper-earthlike-product-acceptance-proof/**`
- `openspec/changes/earthlike-visible-river-acceptance/**`

## What Changes

- Require exact log lake counters for accepted lake count, final water drift,
  and final lake-classification drift.
- Preserve an active floodplain-producing seed regression.
- Add product closure matrix gates for fixture, fast deterministic, Earthlike,
  holdout, mountain contrast, floodplain, and arid/no-signal scenarios.

## Requires

- Proof-class ledger.
- Existing lake readback and floodplain feature tests.
- Runtime visible proof for product river rows.

## Enables Parallel Work

- Product acceptance can close only when every row has an explicit pass/fail or
  scoped-out disposition.
- Lake/floodplain regressions can be debugged independently of river metadata.

## Affected Owners

- `mods/mod-swooper-maps/src/dev/diagnostics/live-parity.ts`
- `scripts/civ7-direct-control/verify-final-surface-parity.ts`
- Product acceptance OpenSpec ledgers
- Floodplain/lake focused tests

## Forbidden Owners

- No lake closure from `missing-exact-log`.
- No floodplain closure from an inactive zero-count seed.
- No full product closure while final-surface residuals lack disposition.

## Stop Conditions

- Exact logs omit lake counters.
- Floodplain active seed has no live floodplain-family feature evidence.
- Product matrix rows are missing reviewer disposition.

## Verification Gates

- Lake exact-counter tests.
- Floodplain active-seed live proof.
- Product matrix acceptance run.
- OpenSpec strict validation.
