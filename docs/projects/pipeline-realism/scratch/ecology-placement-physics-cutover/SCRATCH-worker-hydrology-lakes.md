# SCRATCH Worker B — Hydrology Lakes

## Ownership
- Slice: S3
- Branch: `codex/prr-epp-s3-lakes-deterministic`
- Focus: Deterministic lake planning from hydrography truth.

## Working Checklist
- [ ] Add `plan-lakes` op under hydrology domain.
- [ ] Add `artifact:hydrology.lakePlan` and wire contracts.
- [ ] Replace engine random lake generation path with deterministic stamping.
- [ ] Remove lake frequency knobs/fudge from map-hydrology stage/contracts.
- [ ] Update lake tests to assert deterministic sink/outlet behavior.

## Decision Log
- None yet.
