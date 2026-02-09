# Runbook: Phase 1 (Vision Capture)

## Goal

Capture the human intent as the top-level directive and ensure all downstream documents (architecture, topology, contracts, execution plan) are subordinate to it.

## Inputs

- Human vision as captured in `VISION.md`.

## Outputs

- `VISION.md` is complete and stable.
- Every other packet doc explicitly links to `VISION.md` and respects its non-negotiables.

## Agent Discipline

- Every agent must read `VISION.md` first.
- Agents must not propose shims, optional ops, disabled strategies, or chance/multiplier gating.

## Gates

`VISION.md` must explicitly include:
- optimization priorities
- earth-system-first stage boundaries
- architecture semantics (stage/step/op/strategy/rule)
- non-negotiables (no-fudging; determinism; no legacy; no silent skips)
