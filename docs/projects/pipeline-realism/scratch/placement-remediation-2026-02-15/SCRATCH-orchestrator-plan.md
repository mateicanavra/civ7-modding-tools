# Orchestrator Plan - placement-remediation-2026-02-15

- Branch: codex/agent-D-placement-discovery-owned-catalog
- Parent: codex/agent-C-baseline-check-test-fixes
- Worktree: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-agent-D-placement-discovery-owned-catalog

## Objective
Fix discovery placement by removing defaults/runtime constant pulls; use adapter-owned constants/catalogs. Verify resource placement correctness remains intact. Drive full build/lint/check/test/deploy matrix green.

## Non-negotiables
- No discovery defaults concept.
- No runtime pulling of core discovery/resource constants for planning.
- Deterministic full-stamp-or-fail semantics preserved.
- Use narsil-mcp skill for official Civ resource investigation.

## Execution model
- One worker agent implements.
- Orchestrator reviews scratch updates and intervenes only on drift/blockers.
