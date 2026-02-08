# Phase 4 Execution Plan (Recorded Verbatim)

Date: 2026-02-08

## Metadata

- Base branch: `agent-ORCH-harden-M2-ecology-architecture-alignment`
- Base commit: `ea44e56a4`
- Phase 4 branch: `agent-ORCH-phase4-m2-ecology-issues-prework-handoff`
- Phase 4 worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-ORCH-phase4-m2-ecology-issues-prework-handoff`

## Agent Roster

- ORCH (integrator): apply doc alignment edits, ensure nuance preservation, coordinate workers, commit, and author final handoff doc.
- Agent 1 (default): dedicated doc/spec alignment review.
- Agent 2 (worker): milestone -> local issue docs (docs only).
- Agent 3 (worker): prework sweep (docs only).

## Verbatim Plan

PLEASE IMPLEMENT THIS PLAN:
# Phase 4 Plan: M2 Ecology Implementation Prep (Docs Alignment → Issues → Prework → Handoff)

## Summary (And Implementation Posture)
**Phase 4 outcome:** Convert the hardened M2 milestone into **execution-ready local issue docs** with all embedded prework prompts resolved, plus a **committed orchestrator handoff**. This is the “last prep stage” before real code work.

**Posture for implementation after Phase 4:** We are “ready to start coding” by picking up `LOCAL-TBD-PR-M2-001` and proceeding in the M2-defined slice order, with minimal black-ice (only explicit residual open questions, if any).

## Inputs (Authoritative)
- Hardened milestone (Phase 3):  
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-ORCH-harden-M2-ecology-architecture-alignment/docs/projects/pipeline-realism/milestones/M2-ecology-architecture-alignment.md`
- Canonical spike/feasibility package (paper trail):  
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-ORCH-harden-M2-ecology-architecture-alignment/docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/`
- Required workflows (execute, do not treat as “guidance”):
  - `/Users/mateicanavra/.codex-rawr/prompts/dev-milestone-to-issues.md`
  - `/Users/mateicanavra/.codex-rawr/prompts/dev-prework-sweep.md`
- Repo conventions/templates:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-ORCH-harden-M2-ecology-architecture-alignment/docs/_templates/issue.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-ORCH-harden-M2-ecology-architecture-alignment/docs/process/LINEAR.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-ORCH-harden-M2-ecology-architecture-alignment/docs/process/GRAPHITE.md`

## Locked Directives (Used as Decisions)
- Maximal greenfield refactor shape (compute substrate + atomic per-feature ops), behavior-preserving.
- Ops import `rules/**` for behavior policy; steps never import rules.
- Generic helpers live in shared core MapGen SDK libs; look there first.
- Do **not** reindex Narsil MCP.
- Avoid ADRs as primary sources (ADRs older than ~10 days are non-authoritative).
- “Proceed anyway” hygiene posture: if the user’s primary checkout is dirty, do not touch it; operate only in our dedicated worktree.

## Outputs (Phase 4 Deliverables)
1. **Docs aligned** so implementation has one canonical “active set”.
2. **Local issue docs** for `LOCAL-TBD-PR-M2-001..016` under:  
   `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/<phase4-wt>/docs/projects/pipeline-realism/issues/`
3. **M2 milestone doc refactored to an index** that links to the issue docs.
4. **All prework prompts executed and removed** from the issue docs (results appended).
5. **Committed handoff prompt/runbook** for the next orchestrator agent (repo-tracked).

## Worktree + Branch (Single Shared Phase 4 Worktree; Sequential Agents)
We run Phase 4 in a **new** isolated worktree based on the Phase 3 tip.

1. Primary checkout hygiene (record-only; do not fix):
   - `git status`, `gt ls`, `git branch --show-current`, `git worktree list`
   - If not clean: do nothing; proceed using the worktree below.

2. Create Phase 4 worktree:
   - Base branch: `agent-ORCH-harden-M2-ecology-architecture-alignment`
   - New branch: `agent-ORCH-phase4-m2-ecology-issues-prework-handoff`
   - Worktree dir:
     - `WORKTREES_ROOT="/Users/mateicanavra/Documents/.nosync/DEV/worktrees"`
     - `"$WORKTREES_ROOT/wt-agent-ORCH-phase4-m2-ecology-issues-prework-handoff"`
   - Commands:
     - `gt sync --no-restack`
     - `git worktree add -b agent-ORCH-phase4-m2-ecology-issues-prework-handoff "$WORKTREES_ROOT/wt-agent-ORCH-phase4-m2-ecology-issues-prework-handoff" agent-ORCH-harden-M2-ecology-architecture-alignment`
     - `cd "$WORKTREES_ROOT/wt-agent-ORCH-phase4-m2-ecology-issues-prework-handoff"`

3. Sanity-check:
   - `pwd -P`
   - `git rev-parse --show-toplevel`
   - `git branch --show-current`
   - `git log -1 --oneline`

Edge cases:
- If the worktree dir exists: stop and choose a `-v2` suffix (do not delete/reuse without explicit intent).
- If the branch exists: create `...-v2` (no force delete).

## Mandatory First Step (Before Any Other Work)
Write the Phase 4 plan (this document) into scratch:
- Scratch dir:  
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-ORCH-phase4-m2-ecology-issues-prework-handoff/docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/_scratch/phase-4/`
- File: `00-plan.md` (verbatim plan + base SHA + worktree path + agent roster)

Also create per-agent scratch files (empty placeholders upfront):
- `agent-doc-alignment.md`
- `agent-milestone-to-issues.md`
- `agent-prework-sweep.md`

## Agent Team (Sequential, Non-Overlapping Writes)

### Agent 1 (Default agent): Dedicated Doc/Spec Alignment Review
**Role:** Judge/architect/product-owner check.

**Reads (minimum set):**
- M2 milestone doc (Phase 3)
- Spike/feasibility package (`$SPIKE/*`)
- Pipeline-realism project structure docs: `docs/projects/pipeline-realism/PROJECT-pipeline-realism.md`, `triage.md` (if relevant)
- Any existing ecology workflow pointers (`docs/projects/engine-refactor-v1/.../plans/ecology/*.md`)
- Canonical mapgen ecology reference doc target: `docs/system/libs/mapgen/reference/domains/ECOLOGY.md` (for future update expectations)

**Outputs (scratch):** `agent-doc-alignment.md`
- Contradictions list: doc A vs doc B, with pointers and recommended “source of truth”
- Superseded/outdated docs inventory:
  - Action per doc: incorporate into M2/issues OR archive (with explicit “do not use” guidance)
- “Maximal greenfield + behavior-preserving” audit:
  - Confirm every greenfield intent in `GREENFIELD.md` is reflected in M2 issues (or explicitly listed as prework)
  - Confirm no behavior-changing work slipped in (or if it did: flag as contradiction)
- Concrete edit list:
  - Which files to edit/move, and the exact intended change (no vague advice)

**ORCH integration step:** Apply Agent 1 edits immediately, then commit:
- Archive policy:
  - Use `docs/_archive/projects/<project>/...` when moving truly superseded docs.
  - Do not move `_scratch/**`; instead add/ensure an explicit README warning: “scratch is not canonical; do not use for implementation.”
- Update any navigation docs to point to:
  - M2 milestone index doc
  - the generated issue docs (after step 2)

### Agent 2 (Worker agent): Milestone → Local Issue Docs
**Workflow:** Follow `/Users/mateicanavra/.codex-rawr/prompts/dev-milestone-to-issues.md` end-to-end, with one adaptation: the user’s instruction to execute Phase 4 is the explicit approval to proceed (so no extra confirmation pause).

**Scope decision (locked):**
- Project: `pipeline-realism`
- Milestone doc: `docs/projects/pipeline-realism/milestones/M2-ecology-architecture-alignment.md`
- Issue docs output dir: `docs/projects/pipeline-realism/issues/`
- Issue IDs: preserve `LOCAL-TBD-PR-M2-001..016` exactly.

**Doc extraction strategy (locked to avoid nuance loss):**
- Treat each `LOCAL-TBD-PR-M2-###` as a **leaf issue doc** carrying full detail from the milestone.
- Milestone doc becomes an **index**:
  - retains scope, gates, sequencing, and links
  - replaces each issue body with a summary + link to the issue doc

**Prework prompt handling:**
- Convert each `**Prework Prompt (Agent Brief)**` block into a proper heading in the issue doc:
  - `## Prework Prompt (Agent Brief)`
- Keep prompt text verbatim.

**Integrity steps (required):**
- Ensure issue front matter matches the repo template, including:
  - `project: pipeline-realism`
  - `milestone: M2-ecology-architecture-alignment`
  - `labels: [pipeline-realism]`
- Run link/dependency fixer script (read-only first; write only if needed):
  - `node /Users/mateicanavra/.codex/scripts/dev--linear-doc-issue-link-fixer.mjs --project docs/projects/pipeline-realism --ssot blocked_by`
  - If it reports issues: rerun with `--write`.

**Outputs (scratch):** `agent-milestone-to-issues.md`
- A table of created/updated issue docs with paths
- Any deviations required (should be none; if any, explain why)

**Commit expectation:**
- One commit (preferred) for “milestone → issues breakout” + milestone index refactor.

### Agent 3 (Worker agent): Prework Sweep (After Issues Exist)
**Workflow:** Follow `/Users/mateicanavra/.codex-rawr/prompts/dev-prework-sweep.md` end-to-end, docs-only.

**Scope identifier (locked):**
- `docs/projects/pipeline-realism/issues`

**Prompt execution order (locked):**
- Unblockers first:
  1. `LOCAL-TBD-PR-M2-001` viz-key inventory format decision
  2. `LOCAL-TBD-PR-M2-010` embellishment actual feature keys
  3. `LOCAL-TBD-PR-M2-015` external usages of legacy mega-ops
- Then any additional prompts found during the sweep.

**Rules:**
- Do not reindex Narsil; use `rg`, `git show`, direct file reads.
- Do not implement production refactor changes during prework; only resolve ambiguity and append findings to issue docs.
- Commit protocol per prompt:
  - Commit A: append results + tighten acceptance/testing/deps
  - Commit B: remove the completed `## Prework Prompt (Agent Brief)` section

**Outputs (scratch):** `agent-prework-sweep.md`
- Index of prompts found and resolved
- Any decisions made (with evidence pointers)

## Final Step: Committed Implementation Handoff Prompt (Repo-Tracked)
Create a committed handoff doc for the next orchestrator agent:

**Path (locked):**
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-ORCH-phase4-m2-ecology-issues-prework-handoff/docs/projects/pipeline-realism/resources/runbooks/HANDOFF-M2-ECOLOGY-IMPLEMENTATION.md`

**Content requirements:**
- Origin story and “why”: Ecology drift → refactor-only alignment to enable safe future behavior work
- Non-negotiables: atomic per-feature ops, compute substrate, maximal modularity, behavior preservation, rules posture, shared-libs-first, no ADR reliance, no Narsil reindex
- Canonical sources of truth (explicit):
  - M2 milestone index doc
  - M2 local issue docs directory
  - spike/feasibility package (paper trail only)
  - explicitly: “ignore `_scratch/**` except as historical context”
- Execution posture:
  - start with gates/guardrails/compiler seam issues
  - keep deterministic parity gates green
  - Graphite/worktree discipline for multi-agent implementation

Also update the M2 milestone index doc to link to this handoff.

## Phase 4 Acceptance Criteria
Phase 4 is complete when:
- [ ] Doc alignment review is complete and any required edits/archives are committed.
- [ ] `docs/projects/pipeline-realism/milestones/M2-ecology-architecture-alignment.md` is an index linking to local issue docs.
- [ ] Issue docs exist for `LOCAL-TBD-PR-M2-001..016` under `docs/projects/pipeline-realism/issues/`, with no meaning loss.
- [ ] `rg "^##\\s+Prework Prompt \\(Agent Brief\\)\\s*$" docs/projects/pipeline-realism/issues` returns zero matches.
- [ ] Handoff doc exists and is committed:
  - `docs/projects/pipeline-realism/resources/runbooks/HANDOFF-M2-ECOLOGY-IMPLEMENTATION.md`
- [ ] Worktree is clean (`git status` clean) and branch is left in a reviewable state (tracked in Graphite if appropriate).

## Skills / Methodologies Used (Phase 4)
- `git-worktrees`: isolated worktrees + safety mechanics
- `graphite`: stack-safe branching/commits, avoid global restacks
- `diataxis` + `docs-architecture`: doc alignment, archiving, canonical vs scratch separation
- `deep-search` + `mental-map`: prework prompt resolution + evidence grounding
- `linear-method`: issue doc conventions, front matter correctness

