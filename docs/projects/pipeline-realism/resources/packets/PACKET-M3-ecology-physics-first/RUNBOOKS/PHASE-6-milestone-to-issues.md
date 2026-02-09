# Runbook: Phase 6 (Milestone -> Local Issues)

## Goal

Produce a full local issue corpus where each leaf issue is implementation-ready and contains the acceptance/verification needed for later Graphite + worktree execution.

## Inputs / Sources of Truth

- Milestone:
  - `docs/projects/pipeline-realism/milestones/M3-ecology-physics-first-feature-planning.md`
- Packet authority:
  - `../EXECUTION-PLAN.md`
  - `../TOPOLOGY.md`
  - `../CONTRACTS.md`

## Outputs

- Issues exist:
  - `docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M3-*.md`
- Each issue contains:
  - deliverables
  - acceptance criteria
  - verification commands
  - breadcrumbs (paths/symbols)

## Agent Assignments (Phase 6)

- Orchestrator only (preferred) to keep coherence.
- Optionally:
  - ARCH/SCORE/PLAN agents can propose breadcrumbs, but orchestrator writes the final issue docs.

## Gates

- No `## Prework Prompt (Agent Brief)` sections remain in M3 issues.
- Each issue has explicit dependencies (blocked_by/blocked) that match the slice ordering.

## Do Not Do

- Do not leave placeholder issue docs in the repo (they create false confidence).

