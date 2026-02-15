# PLAN: M4 Ecology Continuum Team Review Loop (Agent TOMMY)

## Goal
Run a single sequential `dev-loop-review` pass for M4 ecology/placement/physics continuum using a worker team with one writer token for all branch/doc mutations.

## Canonical Inputs
- Milestone key: `M4`
- Milestone source: context packet task list (27 tasks, explicit branch hints)
- Milestone doc: `docs/projects/pipeline-realism/milestones/M4-ecology-placement-physics-continuum.md`
- Shared review doc: `docs/projects/pipeline-realism/reviews/REVIEW-M4-ecology-placement-physics-continuum.md`
- Triage doc: `docs/projects/pipeline-realism/triage.md`
- Branch/worktree prefix: `agent-TOMMY-...`

## Team Ownership
- `worker-eco-core`: `M4-T01..M4-T13`
- `worker-hydro-bridge`: `M4-T14..M4-T19`
- `worker-epp-continuum`: `M4-T20..M4-T27`
- `worker-crosscut-risk`: cross-task runtime-vs-viz + unresolved PR thread risk analysis
- Orchestrator (`TOMMY`): writer token, conflict resolution, integration, and sequencing

## Writer-Token Loop
For each task in milestone order (`T01 -> T27`):
1. Confirm task checkbox implementation state.
2. Create review branch inserted immediately after work branch.
3. Open isolated review worktree and install dependencies.
4. Pull PR context (`gh pr view`, review comments, issue comments).
5. Review against issue doc (preferred) or milestone task text + packet continuity anchors.
6. Append review entry to shared review doc with exact section schema.
7. Commit review doc and submit/update review PR.
8. Update milestone task traceability note (`reviewBranch`, `reviewPR`).
9. Clean up only worktrees created in this run.

## Non-Negotiables
- Never commit on original work branch.
- Runtime/gameplay truth beats Studio appearance when conflicts exist.
- Capture supersedence when child-branch reality diverges from older plan docs.
- Preserve deterministic/no-randomness and no-fudge posture as primary review lens.
- Stop only if task->branch mapping becomes ambiguous.
