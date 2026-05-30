## Why

D4 requires typed resource/discovery intent reconciliation. The plan is
authority for typed intent, but projection must account for engine feasibility
with per-tile outcomes and typed rejection reasons. This must happen after
placement products have explicit contracts.

## Target Authority Refs

- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`: D4,
  Problem Layers 4 and 5, Domino 4.
- `openspec/config.yaml`: resources and discoveries require typed intent
  reconciliation.
- `openspec/specs/mapgen-normalization-workstreams/spec.md`: no naive
  `placed === planned` gate.

## What Changes

- Add adapter/materializer outcomes for resource and discovery projection with
  per-tile placed items and typed rejection reasons.
- Reconcile planned intent against engine-feasible placement.
- Fail on unexplained drift, wrong type/location, or untyped rejection.
- Update docs and ADR/deferral records that still describe best-effort
  official-generator behavior as accepted truth.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mapgen-normalization-workstreams`: records D4 as a typed reconciliation
  slice that depends on D3 contracts.

## Dependencies

- Requires: `normalize-placement-contracts`.
- Enables parallel work: G8 guard hardening for hidden placement sub-concerns,
  final proof-boundary docs, and placement truth/projection parity checks.

## Forbidden Non-Goals

- No naive count equality or `placed === planned` gate.
- No full Civ7 legality port unless separately scoped.
- No silent acceptance of untyped engine rejection.
- No broad placement decomposition beyond D4-owned resource/discovery surfaces.

## Impact

- Affected owners: placement resource/discovery product steps, adapter
  projection outcomes, placement artifacts, tests, docs, ADR/deferral records.
- Expected write set:
  - `packages/civ7-adapter/**`
  - placement resource/discovery step contracts and implementations
  - placement artifact/output schemas
  - placement tests and proof docs
  - affected ADR/deferral records
- Protected paths: non-resource/discovery placement products, ecology topology,
  lake adapter capability except shared outcome plumbing, generated outputs.
- Stop conditions:
  - adapter cannot observe placed items or rejection reasons;
  - a rejection reason cannot be typed without porting feasibility logic beyond
    the slice;
  - docs/ADRs conflict on whether official generator output is still accepted
    truth.
- Verification gates:
  - typed outcome tests for accepted rejection and mismatch failure;
  - resource/discovery reconciliation tests;
  - docs/ADR/deferral realignment;
  - `bun run openspec -- validate normalize-placement-reconciliation --strict`;
  - `bun run openspec:validate`;
  - `git diff --check`.
