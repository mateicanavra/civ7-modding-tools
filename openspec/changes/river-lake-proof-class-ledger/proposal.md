## Why

The previous workstream could report a top-level proof as complete while river
metadata was explicitly divergent. That is acceptable only if the completed
claim is scoped to exact authorship or terrain-row materialization, not product
acceptance. A proof-class ledger prevents that ambiguity.

## Target Authority Refs

- `openspec/changes/river-lake-adversarial-workstream-design/workstream/adversarial-agent-synthesis.md`
- `openspec/changes/earthlike-visible-river-acceptance/workstream/completion-audit.md`
- `openspec/changes/swooper-earthlike-product-acceptance-proof/**`
- `openspec/changes/studio-civ7-exact-authorship-proof/**`

## What Changes

- Add a river/lake proof taxonomy shared by live parity, product acceptance, and
  Studio/Civ proof packets.
- Separate exact-authorship completion from hydrology-truth, projection-plan,
  terrain-readback, metadata-readback, Studio-visible, Civ-rendered, lake-final,
  floodplain-active, and product-acceptance statuses.
- Update acceptance ledgers so a technical subclaim cannot be presented as full
  product closure.

## Requires

- Existing exact-authorship proof packet fields.
- Current live-parity river/lake reports.

## Enables Parallel Work

- Runtime visual proof can consume the taxonomy.
- Studio River Inspector can reuse the status vocabulary.
- Product closure can block on a clear status lattice.

## Affected Owners

- `mods/mod-swooper-maps/src/dev/diagnostics/live-parity.ts`
- `scripts/civ7-direct-control/verify-final-surface-parity.ts`
- `apps/mapgen-studio/src/server/runInGame/**`
- OpenSpec acceptance and closure ledgers

## Forbidden Owners

- No map tuning.
- No visual/UI work except status vocabulary consumption.
- No minor-river writer claim.

## Stop Conditions

- A proof packet has one `complete` status without per-claim statuses.
- `terrain-match-metadata-divergent` can be read as product success.
- Product acceptance can close while any required proof class is unresolved.

## Verification Gates

- Unit tests for status derivation.
- Fixture proof packets covering terrain-match/metadata-divergent,
  terrain-mismatch, missing exact authorship, missing visual proof, and product
  accepted states.
- OpenSpec strict validation.
