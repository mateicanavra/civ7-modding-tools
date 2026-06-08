## Why

Player starts and nearby discoveries are product-visible only when the generated
map, Studio view, setup/start, and live readback agree. Starts can look viable
locally while live placement, island networks, or discovery distribution fail
the user experience.

## Activation Gate

This change is evidence-gated. Do not implement it until product acceptance or
parity proof records a failing starts/discoveries row or a missing readback
surface required to prove starts.

## Target Authority Refs

- `openspec/changes/swooper-stack-recovery-consolidation/workstream/branch-recovery-ledger.md`
- `openspec/changes/swooper-earthlike-product-acceptance-proof/**`
- Placement and discovery sections of the architecture normalization packet

## What Changes

- Prove start viability and discovery/readback behavior for exact-authored runs.
- Add direct-control or diagnostic readback only in the owning package if the
  current proof surface cannot observe starts/discoveries.
- Repair placement/discovery logic only from concrete failing rows.

## Requires

- Exact-authorship proof and failing/missing starts or discoveries evidence.

## Enables Parallel Work

- Product acceptance closure for starts and early exploration.

## Affected Owners

- `mods/mod-swooper-maps/**` placement/discovery owners when proven
- `packages/civ7-direct-control/**` only for missing readback wrappers

## Forbidden Owners

- No start repair from local stats alone.
- No caller-local readback scripts.
- No Civ readback as authored placement truth.

## Stop Conditions

- Live readback cannot identify starts/discoveries with enough confidence.
- Failing row cannot distinguish placement truth from live materialization or
  readback limitations.

## Verification Gates

- Same-run start/discovery diagnostics and live readback.
- Focused placement/discovery tests for repairs.
- OpenSpec strict validation.
