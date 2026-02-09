# Runbook: Phase 8 (Implementation via Graphite + Worktrees)

## Goal

Execute M3 as a set of reviewable, parallelizable slices with no legacy shims left behind.

This runbook is a guide for the later execution workflow (not performed on this docs-only branch).

## Inputs / Sources of Truth

- Packet authority:
  - `../EXECUTION-PLAN.md`
  - `../TOPOLOGY.md`
  - `../CONTRACTS.md`
- Milestone + issues:
  - `docs/projects/pipeline-realism/milestones/M3-ecology-physics-first-feature-planning.md`
  - `docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M3-*.md`

## Execution Posture

- Graphite stacks + worktrees only (no ad-hoc branches).
- Ops are atomic and never call ops.
- Steps orchestrate and may emit viz, but do not encode planning logic.
- No legacy shims/dual paths: cut over, delete, and harden gates.

Tooling:
- Prefer `$narsil-mcp` for semantic discovery (no `hybrid_search`).
- Keep primary checkout on latest commits to keep MCP index fresh.

## Suggested Slice/Stack Layout

- Stack A (sequential unblockers):
  - M3-002 -> M3-003
- Stack B/C/D (parallel planners after scoreLayers + base occupancy):
  - M3-004, M3-005, M3-006, M3-007
- Stack Final (sequential integration + deletion):
  - M3-008 -> M3-009

## Gates (non-negotiable)

- Determinism:
  - fixed-seed dump reruns are identical via `diag:diff`
- No-fudging:
  - static scans are clean (allowlist only for tie-break utilities)
- Projection strictness:
  - stamping does not drop placements; rejections fail tests/diagnostics

## Do Not Do

- Do not restack or reparent other active stacks.
- Do not introduce "optional ops" or "disabled strategies" as new concepts.
- Do not keep chance/multiplier paths behind a config flag; delete them.

