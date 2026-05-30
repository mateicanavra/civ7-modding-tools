## Why

The current tests can pass while maps visibly fail product expectations. They
cap some over-dense features and prove aggregate vegetation exists, but they
do not assert per-family visibility, habitat coherence, map identity, or
runtime lake fill as categorical product outcomes.

This change makes world-balance proof match how players judge the map:
Earthlike maps should have coherent climate-to-feature succession, desert
mountain maps should not become rainforest maps, archipelagos should emphasize
coastal/ocean ecology without reef carpets, and lakes should visibly fill.

## Target Authority Refs

- `docs/system/TESTING.md`: tests should prove behavior at the relevant
  boundary.
- `openspec/specs/mapgen-normalization-workstreams/spec.md`: shipped-map stats
  and materialization-order proof are normalization requirements.
- User direction: tests must be categorical, not one-off; configs must be
  updated with code.

## What Changes

- Extend the shared world-balance stats collector rather than duplicating
  bespoke runners.
- Add feature-family totals, per-feature counts, habitat/biome coherence
  signals, and lake final-state drift metrics.
- Strengthen shipped config/preset identity tests across seeds and map
  identities.
- Record runtime/deploy evidence in implementation tasks before closure.

## Forbidden Non-Goals

- No exact tile-count snapshots as balance proof.
- No one-seed oracle.
- No screenshot-only closure.
- No generic "quality score" that hides which invariant failed.
- No generated-output hand edits.

## Verification Gates

- focused world-balance stats tests;
- seed/config matrix tests;
- config/preset schema and identity tests;
- targeted/global OpenSpec validation;
- package check/build/deploy/runtime proof;
- `git diff --check`.
