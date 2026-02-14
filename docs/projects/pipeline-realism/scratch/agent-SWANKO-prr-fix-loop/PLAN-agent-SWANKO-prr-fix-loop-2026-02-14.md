# PRR Full-Chain Consolidated Review + Fix Stack Plan (Agent `SWANKO`)

Date: 2026-02-14

Canonical working review document:
- `docs/projects/pipeline-realism/reviews/REVIEW-PRR-stack-pr-comments.md`

Scope + provenance:
- Primary queue: PRR ledger (`REVIEW-PRR-stack-pr-comments.md`)
- Consolidation target: all still-relevant findings across the M1 -> PRR chain live in the canonical working review document above.
- Updating policy: only the canonical review doc + this plan + scratchpads are updated during the loop.

Two-pass workflow:

## Start-of-Run Output (required)
1. Milestone context doc: `docs/projects/pipeline-realism/milestones/M1-foundation-maximal-cutover.md`
2. Derived milestone review doc (context-only): `docs/projects/pipeline-realism/reviews/REVIEW-M1-foundation-maximal-cutover.md`
3. Canonical working review doc: `docs/projects/pipeline-realism/reviews/REVIEW-PRR-stack-pr-comments.md`
4. Parsed counts:
   - M1 tasks (context): 25
   - PRR review sections (primary): 46
   - PRR inline review-thread findings (primary actionable set): 21

## Phase 0: Preflight + Isolation
1. Confirm clean state in primary (ignored for all work, but sanity-check done): `git status --short --branch`, `gt ls`, `git worktree list`.
2. Create isolated worktree on `codex/prr-stack-pr-comments-ledger`:
   - Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-SWANKO-prr-stack-pr-comments-ledger`
3. In isolated worktree:
   - `gt sync --no-restack`
   - `bun install`
   - Baseline check: `bun run --cwd mods/mod-swooper-maps check`

## Phase 0.5: Mandatory Scratchpads
Directory:
- `docs/projects/pipeline-realism/scratch/agent-SWANKO-prr-fix-loop/`

Files:
- `PLAN-agent-SWANKO-prr-fix-loop-2026-02-14.md` (this file)
- `SCRATCH-review-pass.md`
- `SCRATCH-fix-pass.md`

Rule:
- Update scratchpads continuously while executing.
- Keep worktree clean by committing scratchpad + canonical review doc updates as part of the review/fix branches (no lingering uncommitted state).

## Phase 1: Review / Revalidation Pass (single branch)
1. Create review branch (inserted after `codex/prr-stack-pr-comments-ledger`):
   - `agent-SWANKO-PRR-ledger-review-full-chain`
2. Build a manifest from `REVIEW-PRR-stack-pr-comments.md` with:
   - `itemId`, `sourceBranch`, `prNumber`, `threadId`, `path:line`, `originalComment`, `snapshotDisposition`
3. Deterministic IDs:
   - For PRR ledger inline threads: `PRR-sXX-cYY`
   - For additional non-PRR but still-relevant chain items (e.g. M1 review fix-now, triage follow-ups): prefixed separately and recorded explicitly in the canonical review doc as "Additional chain findings". These do not replace PRR IDs.
4. Refresh live thread status via GraphQL for all PRR thread IDs:
   - Capture `isResolved`, `isOutdated`
5. Revalidate against current code + lineage docs.
6. Classify each item as exactly one of:
   - `fix`, `deferred`, `superseded`, `needs clarification`
7. Update canonical review doc with:
   - A dated section: `Full-chain Revalidation (2026-02-14, agent-SWANKO)`
   - Full manifest table + classifications + evidence notes.
8. Log command/results continuously in `SCRATCH-review-pass.md`.
9. Commit + submit review branch PR:
   - `gt submit --stack --draft --ai`

## Phase 2: Fix Pass (one fix slice per accepted fix item)
1. Iterate only `fix` items in source order.
2. Fix branch naming:
   - `agent-SWANKO-<itemId>-fix-<slug>`
3. Insert each fix branch sequentially after the prior branch in the chain:
   - review branch -> fix1 -> fix2 -> ...
4. Implement minimal change per fix item, including tests/docs when behavior/contracts change.
5. Update canonical review doc row for the item with:
   - `fixBranch`, commit SHA, PR URL, status `fixed`
6. If blocked mid-item:
   - Set to `needs clarification` in canonical review doc and stop implementation for that item.
7. Log implementation notes/commands in `SCRATCH-fix-pass.md`.
8. Commit + submit stack updates after each slice:
   - `gt submit --stack --draft --ai`

## Validation Gates
Per fix item:
- Targeted tests + `bun run --cwd mods/mod-swooper-maps check`

For foundation/morphology behavior changes:
- `bun run --cwd mods/mod-swooper-maps test test/pipeline/determinism-suite.test.ts`
- `bun run --cwd mods/mod-swooper-maps test test/pipeline/foundation-gates.test.ts`

Cadence:
- Every 3 fix slices: `bun run --cwd mods/mod-swooper-maps test`
- Before publish: `bun run --cwd mods/mod-swooper-maps check` and `bun run --cwd mods/mod-swooper-maps test`

## Completion + Cleanup
- No changes outside canonical review doc + plan/scratchpads.
- Remove only worktrees created for this loop.
- Ensure git status clean at the end of each slice.
