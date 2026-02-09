# Runbook: Phase 3 (Packet Hardening + Consistency Sweep)

## Goal

Turn the packet into the single execution authority by removing inconsistencies and making the "no black ice" posture real.

## Inputs / Sources of Truth

- Packet:
  - `../README.md`
  - `../VISION.md`
  - `../ARCHITECTURE.md`
  - `../TOPOLOGY.md`
  - `../CONTRACTS.md`
  - `../EXECUTION-PLAN.md`
  - `../DECISIONS.md`
  - `../M2-REMEDIATION-MAP.md`

## Outputs

- Packet is self-consistent (no contradictions between topology and contracts).
- Packet is decision-complete (no TBD decisions).
- Packet includes the minimal "design space" section in `../ARCHITECTURE.md` to make the choice legible.

## Agent Assignments (Phase 3)

- Orchestrator only (preferred): avoid flooding context; do a single coherent pass.
- Optionally:
  - GATES agent to propose `rg` patterns and allowlists for no-fudging rails.

## Gates

- `rg -n "TBD" ../` is empty (except `LOCAL-TBD` id references).
- `../DECISIONS.md` stays small (no long debate transcripts).
- Packet uses consistent vocabulary (stage/step/op/strategy/rule, truth vs projection).

## Do Not Do

- Do not expand the authoring SDK.
- Do not introduce optional operations as a new concept.

