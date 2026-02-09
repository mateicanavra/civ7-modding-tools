# Runbook: Phase 4 (Spec Packet -> Milestone)

## Goal

Convert the packet into the canonical M3 milestone doc without diluting constraints.

## Inputs / Sources of Truth

- Packet authority:
  - `../README.md`
  - `../EXECUTION-PLAN.md`
  - `../TOPOLOGY.md`
  - `../CONTRACTS.md`

## Outputs

- Milestone exists:
  - `docs/projects/pipeline-realism/milestones/M3-ecology-physics-first-feature-planning.md`
- Milestone is explicitly framed as:
  - "M3 that remediates M2"
  - behavior-changing realism cutover

## Agent Assignments (Phase 4)

- Orchestrator only.

## Gates

- Milestone references the packet as authority (the milestone is derived, not peer).
- Milestone scope includes:
  - stage split
  - `scoreLayers` artifact contract
  - deterministic planners + ordering
  - strict projection stamping
  - deletion of legacy chance/multiplier paths

## Do Not Do

- Do not introduce new decisions in the milestone; decisions live in the packet.

