# PLAN: M4 Ecology Continuum Team Fix-Review Loop (Agent TOMMY)

## Goal
Run one sequential `dev-loop-fix-review` pass across M4 (`T01..T27`) with team adjudication and single-writer Graphite mutations.

## Canonical Anchors
- Milestone: `docs/projects/pipeline-realism/milestones/M4-ecology-placement-physics-continuum.md`
- Shared review: `docs/projects/pipeline-realism/reviews/REVIEW-M4-ecology-placement-physics-continuum.md`
- Triage: `docs/projects/pipeline-realism/triage.md`
- Deferrals: `docs/projects/pipeline-realism/deferrals.md`
- Tip for reproducibility: `codex/prr-epp-s6-hardening-docs-tests`

## Team Ownership
- `worker-eco-core`: `M4-T01..M4-T13`
- `worker-hydro-bridge`: `M4-T14..M4-T19`
- `worker-epp-continuum`: `M4-T20..M4-T27`
- `worker-crosscut-risk`: cross-cutting PR/risk/supersedence/runtime-vs-viz audit
- `orchestrator (TOMMY)`: writer token, integration, stack safety, docs authority

## Required Workflow Contract
- Skills per worker: `pr-comments`, `git-worktrees`, `graphite` (optional `introspect`).
- Narsil posture: primary worktree only, no `hybrid_search`; validate with native tools.
- Graphite safety: no global restack; restack only scoped if needed.
- Fix branch naming: `agent-TOMMY-M4-TNN-fix-<slug>-<hash6>`.
- Worktree naming: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-TOMMY-M4-TNN-fix-<slug>-<hash6>`.

## Execution Phases
1. Bootstrap plan/scratch artifacts with timestamped start blocks.
2. Preflight mapping + baseline SHA snapshot for out-of-scope stacks.
3. Parallel adjudication wave (read-only) with PR comment context per task.
4. Orchestrator gate and frozen execution queue (`T01 -> T27`).
5. Sequential fix loop (single writer token): create fix branch/worktree, apply fix/doc-only disposition, update review+milestone(+triage/+deferrals), submit `gt ss --draft --ai`, cleanup worktree.
6. Final isolation validation + handoff summary.

## Continuation Re-anchor (Forward-only)
- Scope reset: complete remaining 19 tasks only; do not reopen completed fixes.
- Enforce absolute-path worker execution and preflight logging (`pwd`, `git rev-parse --show-toplevel`, `git branch --show-current`) per task handoff.
- Consolidate shared-doc traceability updates on `agent-TOMMY-m4-fix-bootstrap` due to missing M4 docs on early stack branches.
- Close each remaining task with a branch commit (code fix or disposition receipt), then submit scoped Graphite PRs.
