## Why

D3 says placement should split at real product/effect contracts, not helper
boundaries. The broad placement apply step hides multiple gameplay products,
but splitting it mechanically would create fake dependency chains. This slice
exposes real placement products before typed resource/discovery reconciliation.

## Target Authority Refs

- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`: D3,
  Problem Layer 5, Domino 4, Guardrail G8.
- `openspec/config.yaml`: placement splits only at real product/effect
  contracts.
- `openspec/specs/mapgen-normalization-workstreams/spec.md`: placement splits
  at product/effect contracts.

## What Changes

- Split placement into contract-bounded product/effect steps where the product
  has an artifact, effect surface, consumer impact, and verification boundary.
- Candidate products include natural wonders, resources, starts, discoveries,
  and advanced starts.
- Keep maintenance operations transactional unless they gain independent
  consumers or contracts.
- Preserve current resource/discovery projection semantics until the D4
  reconciliation slice.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mapgen-normalization-workstreams`: separates D3 product/effect contract
  decomposition from D4 typed reconciliation.

## Dependencies

- Requires: `normalize-import-boundaries`, `normalize-projection-lakes`.
- Enables parallel work: D4 typed reconciliation, G8 guard, placement docs
  realignment.

## Forbidden Non-Goals

- No helper-by-helper step explosion.
- No fake `requires -> provides` chains that only duplicate array order.
- No D4 gating for resources/discoveries in this slice.
- No maintenance-operation promotion without a real product/effect contract.

## Impact

- Affected owners: placement stage, placement domain ops/contracts, placement
  artifacts/effects, tests, docs.
- Expected write set:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/placement/**`
  - placement domain operation modules as needed
  - placement artifact/effect schemas
  - placement tests and docs
- Protected paths: resource/discovery typed reconciliation, unrelated ecology
  or hydrology behavior, generated outputs.
- Stop conditions:
  - a proposed step has no artifact, effect, consumer, or verification surface;
  - splitting changes transactional maintenance behavior without a product
    decision;
  - resource/discovery typed outcomes are required before the split can
    preserve behavior.
- Verification gates:
  - placement product contract tests;
  - behavior preservation tests for unchanged maintenance operations;
  - docs showing which products are independent steps;
  - `bun run openspec -- validate normalize-placement-contracts --strict`;
  - `bun run openspec:validate`;
  - `git diff --check`.
