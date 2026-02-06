# Plan: M1 Foundation Maximal Cutover (Spec -> Milestone -> Issues -> Prework -> Readiness)

**Project:** `pipeline-realism`  
**Milestone:** `M1-foundation-maximal-cutover`  
**Status:** Draft / In Progress  
**Owner:** `agent-URSULA` (steward)  

This doc is the **single execution plan** for converting the existing maximal Foundation SPEC into an implementation-ready milestone + issue pack.

## Internal Checklist (Updated As Work Lands)

### Legacy Pass (s0–s5)

- [x] Slice 0: Setup + plan doc + scratchpad
- [x] Slice 1: Draft milestone from SPEC
- [x] Slice 2: Harden milestone
- [x] Slice 3: Expand milestone into local issue docs
- [x] Slice 4: Prework sweep (no dangling prompts)
- [x] Slice 5: Readiness report + doc stewardship pass
- [x] Submit planning stack (`gt submit --stack --draft`)

### Rebuild Pass (s7–s13) — Implementation-Ready Deepening (No Code Changes)

- [x] Slice s7: Issue doc sanitize (remove stray diff markers / syntax drift)
- [x] Slice s8: Rebuild milestone index (25 canonical issue-backed tasks + coverage + sequencing)
- [x] Slice s9: Deepen issues 001–005 (prepare)
- [x] Slice s10: Deepen issues 006–013 (foundation engine)
- [x] Slice s11: Deepen issues 014–025 (morphology cutover, gates, studio/viz, cleanup)
- [x] Slice s12: Link/dependency integrity pass (no changes required)
- [x] Slice s13: Update readiness report + update this plan doc

## Branch Stack Map (Fill In As Slices Are Created)

- Base: `agent-URSULA-M1-foundation-maximal-cutover`
- Slice 1: `agent-URSULA-M1-s1-draft-milestone`
- Slice 2: `agent-URSULA-M1-s2-harden-milestone`
- Slice 3: `agent-URSULA-M1-s3-issues`
- Slice 4: `agent-URSULA-M1-s4-prework-sweep`
- Slice 5: `agent-URSULA-M1-s5-readiness`
- Slice 6 (baseline for rebuild pass): `agent-URSULA-M1-s6-deepen-issues`
- Slice 7: `agent-URSULA-M1-s7-issue-doc-sanitize`
- Slice 8: `agent-URSULA-M1-s8-rebuild-milestone-index`
- Slice 9: `agent-URSULA-M1-s9-issues-prepare-deepened`
- Slice 10: `agent-URSULA-M1-s10-issues-foundation-engine-deepened`
- Slice 11: `agent-URSULA-M1-s11-issues-cutover-gates-cleanup-deepened`
- Slice 12: `agent-URSULA-M1-s12-link-integrity`
- Slice 13: `agent-URSULA-M1-s13-readiness-report`

## Canonical Inputs

- SPEC: `docs/projects/pipeline-realism/resources/spec/foundation-evolutionary-physics-SPEC.md`
- Decisions index: `docs/projects/pipeline-realism/resources/decisions/README.md`
- Migration slices:
  - `docs/projects/pipeline-realism/resources/spec/migration-slices/slice-01-prepare-new-artifacts-and-viz.md`
  - `docs/projects/pipeline-realism/resources/spec/migration-slices/slice-02-cutover-foundation-maximal.md`
  - `docs/projects/pipeline-realism/resources/spec/migration-slices/slice-03-cutover-morphology-consumption-and-cleanup.md`
- Stack integration constraints:
  - `docs/projects/pipeline-realism/resources/research/stack-integration-morphology-hydrology-wind-current.md`

## Full Plan (Verbatim)

PLEASE IMPLEMENT THIS PLAN:
# M1 Plan: Pipeline-Realism Foundation Maximal Cutover (Spec -> Milestone -> Issues -> Prework -> Readiness)

## Summary
We will produce an **implementation-ready execution pack** for **one milestone**:

- **Milestone:** `M1-foundation-maximal-cutover` (pipeline-realism project-local numbering)
- **Goal:** turn the existing maximal Foundation SPEC + migration slices into a hardened milestone doc, a full local issue set, and a prework-swept, "ready to implement" plan with zero "later" ambiguity.

We will do this via **one default steward agent ("URSULA")** working sequentially in **one persistent worktree + one Graphite stack**, creating a new Graphite slice per workflow phase and committing frequently.

## Source of Truth Inputs
- Maximal target spec: `docs/projects/pipeline-realism/resources/spec/foundation-evolutionary-physics-SPEC.md`
- Decisions (must remain consistent): `docs/projects/pipeline-realism/resources/decisions/README.md`
- Migration slices (phases inside M1, not separate milestones):
  - `docs/projects/pipeline-realism/resources/spec/migration-slices/slice-01-prepare-new-artifacts-and-viz.md`
  - `docs/projects/pipeline-realism/resources/spec/migration-slices/slice-02-cutover-foundation-maximal.md`
  - `docs/projects/pipeline-realism/resources/spec/migration-slices/slice-03-cutover-morphology-consumption-and-cleanup.md`
- Integration constraints already captured:
  - `docs/projects/pipeline-realism/resources/research/stack-integration-morphology-hydrology-wind-current.md`

## Ground Rules (Hard)
- **Maximal-only**: no "optional artifacts" language; anything specified must be produced and consumed.
- **Break & migrate allowed**: do not preserve legacy contract shapes if they undermine the physics-first design.
- **Visualization != Validation**:
  - visualization = author understanding + tuning loop
  - validation/observability = determinism gates + invariants + regression detection
- **Worktree safety**: all edits must occur inside the URSULA worktree; absolute-path guard before any edits.

## Workflows / Commands (Baseline Discipline)
URSULA should read and follow these dev workflows as behavioral baselines:
- `/Users/mateicanavra/.claude/plugins/local/plugins/dev/commands/dev-loop-parallel.md` (loop discipline; one branch layer per unit)
- `/Users/mateicanavra/.claude/plugins/local/plugins/dev/commands/dev-spec-to-milestone.md`
- `/Users/mateicanavra/.claude/plugins/local/plugins/dev/commands/dev-harden-milestone.md`
- `/Users/mateicanavra/.claude/plugins/local/plugins/dev/commands/dev-milestone-to-issues.md`
- `/Users/mateicanavra/.claude/plugins/local/plugins/dev/commands/dev-prework-sweep.md`
- `/Users/mateicanavra/.claude/plugins/local/plugins/dev/commands/dev-post-milestone-docs.md`

Templates:
- `docs/_templates/milestone.md`
- `docs/_templates/issue.md`

## Output Directory Structure (Project-Scoped)
Create if missing:
- `docs/projects/pipeline-realism/milestones/`
- `docs/projects/pipeline-realism/issues/`
- `docs/projects/pipeline-realism/scratch/`
- `docs/projects/pipeline-realism/plans/` (exists on maximal branch; add a new plan doc)

## Primary Deliverables (End State)
1. **Milestone doc (single)**:
   - `docs/projects/pipeline-realism/milestones/M1-foundation-maximal-cutover.md`

2. **Local issue docs (many)**:
   - `docs/projects/pipeline-realism/issues/LOCAL-TBD-*.md`
   - Each uses `docs/_templates/issue.md` exactly.
   - Each includes a "no later" posture: if work exists, it's scoped, accepted, and verified, not deferred.

3. **Plan doc (the plan you are executing)**:
   - `docs/projects/pipeline-realism/plans/2026-02-04-spec-to-implementation-pack.md`
   - Contains:
     - this full plan (verbatim)
     - URSULA's internal checklist updated as phases complete
     - a compact "branch stack map" listing branch names + purpose

4. **Readiness report**:
   - `docs/projects/pipeline-realism/plans/2026-02-04-implementation-readiness-report.md`

5. **Scratchpad (non-canonical notes only)**:
   - `docs/projects/pipeline-realism/scratch/URSULA.md`

## Graphite / Worktree Setup
**Base branch:** `agent-codex-pipeline-realism-maximal-spec-v1`

**Worktrees root:** `WORKTREES_ROOT="/Users/mateicanavra/Documents/.nosync/DEV/worktrees"`

**Persistent worktree:**
- Branch: `agent-URSULA-M1-foundation-maximal-cutover`
- Worktree dir: `$WORKTREES_ROOT/wt-agent-URSULA-M1-foundation-maximal-cutover`

**Mandatory safety:**
- `gt sync --no-restack` before any branching.
- Patch-path guard:
  - `WORKTREE_ROOT="$(pwd -P)"`
  - all writes use absolute paths rooted at `$WORKTREE_ROOT`.

## Execution Plan (One Graphite Slice Per Phase)
URSULA creates one Graphite slice (branch layer) per phase, commits frequently within that phase, then moves to the next.

### Slice 0: Setup + Plan Doc + Scratchpad
Goal: establish the durable plan artifact before doing work.

Edits:
- Create:
  - `docs/projects/pipeline-realism/plans/2026-02-04-spec-to-implementation-pack.md`
  - `docs/projects/pipeline-realism/scratch/URSULA.md`
  - Ensure `docs/projects/pipeline-realism/milestones/` and `docs/projects/pipeline-realism/issues/` exist.

Commit:
- `docs(pipeline-realism): plan spec-to-implementation pack (M1)`

### Slice 1: Draft Milestone (Spec -> Milestone)
Goal: produce `M1-foundation-maximal-cutover.md` as a single milestone that contains:
- internal phases aligned to migration slices
- explicit workstreams and dependencies
- no hidden gaps vs SPEC

Milestone content requirements:
- Title + ID: `M1-foundation-maximal-cutover`
- Summary: one paragraph linking the milestone to the maximal SPEC + decisions index.
- Scope: clearly "current -> target" mapping.
- Workstreams (each becomes a cluster of issues):
  1. Prepare plumbing + artifact scaffolding + viz enablement (slice-01)
  2. Foundation maximal engine cutover (slice-02)
  3. Morphology consumption cutover + cleanup (slice-03)
  4. Validation/observability gates (D09r enforcement as "done means")
  5. Visualization/tuning loop deliverables (author-facing)
  6. Units/scaling + artifact catalog/schema versioning stabilization
  7. Integration constraints (morphology/hydrology stage naming + downstream assumptions)
- Acceptance Criteria: milestone-level, verifiable, includes determinism gates.
- Sequencing & Parallelization Plan:
  - one "spine stack" (must land first)
  - parallel stacks that can proceed once scaffolding is in place
- Risks: explicit, with mitigation tasks as issues (not "later")

Commit:
- `docs(pipeline-realism): draft M1 milestone from maximal spec`

### Slice 2: Harden Milestone (Milestone Hardening Pass)
Goal: convert the M1 milestone draft into "execution-shaped":
- every milestone task is phrased as an issue-sized deliverable or a parent issue
- every dependency is explicit
- every bridge has a deletion target ("no legacy left")
- any ambiguity becomes a prework prompt embedded in an issue doc (never left in the milestone)

Commit:
- `docs(pipeline-realism): harden M1 milestone`

### Slice 3: Expand Into Issues (Milestone -> Issue Docs)
Goal: create a full issue set that is navigable and Linear-sync ready:
- `LOCAL-TBD-...` files using `docs/_templates/issue.md`
- dependency metadata filled (`blocked_by`, `blocked`, etc.)
- each issue references the exact spec section(s) it implements and the artifact(s) it affects

Rules:
- Use parent issues when a unit is too large (e.g., "Implement mantle forcing artifact + solver") and create child issues for subcomponents.
- Keep the milestone doc as the index: checkbox list linking to issue doc paths.

Commit:
- `docs(pipeline-realism): expand M1 into local issue docs`

### Slice 4: Prework Sweep (No Dangling Prework Prompts)
Goal: run a "no later" sweep:
- remove or resolve any "Prework Prompt (Agent Brief)" sections
- convert open prompts into explicit issues (or explicit acceptance criteria inside the owning issue)

Commit:
- `docs(pipeline-realism): complete prework sweep for M1 issues`

### Slice 5: Readiness Report + Doc Stewardship
Goal: ensure the milestone pack can be implemented without thrash.

Edits:
- Create `docs/projects/pipeline-realism/plans/2026-02-04-implementation-readiness-report.md` containing:
  - what to implement first (recommended stack ordering)
  - biggest risks + verification gates
  - minimal "definition of done" checklist for M1
  - explicit "do not drift" anchors: artifact catalog, schema/versioning, dataTypeKeys, determinism policy
- Run a doc stewardship pass:
  - fix any broken links introduced by the issue generation
  - ensure visualization/validation separation remains explicit in docs
  - ensure stage names and artifact IDs match current canonical domain docs/code

Commit:
- `docs(pipeline-realism): M1 implementation readiness report`

## Submission
- `gt submit --stack --draft` for the entire planning stack.

## Acceptance Criteria
- `docs/projects/pipeline-realism/milestones/M1-foundation-maximal-cutover.md` exists and is hardened.
- `docs/projects/pipeline-realism/issues/` contains a complete issue set with dependencies and verification.
- No dangling prework prompts remain.
- Readiness report exists and is internally consistent with the maximal SPEC and decisions.
- No "optional artifacts" language exists in the execution pack.

---

# URSULA Orchestration Brief (Send As Agent Prompt)
You are URSULA (default agent). Your mission is to produce an implementation-ready execution pack for **pipeline-realism M1** by converting the maximal SPEC into one hardened milestone doc + many issue docs + prework sweep + readiness report.

Rules:
- Work only inside your worktree. Use patch-path guard with absolute paths.
- Use Graphite slices: one branch layer per phase; commit often.
- No "optional artifacts", no "later". Convert ambiguity into explicit issue work.
- Keep scratch in `docs/projects/pipeline-realism/scratch/URSULA.md`; only finalize into milestone/issues/plans.

Inputs:
- `docs/projects/pipeline-realism/resources/spec/foundation-evolutionary-physics-SPEC.md`
- `docs/projects/pipeline-realism/resources/spec/migration-slices/*`
- `docs/projects/pipeline-realism/resources/decisions/README.md`

Outputs:
- `docs/projects/pipeline-realism/milestones/M1-foundation-maximal-cutover.md`
- `docs/projects/pipeline-realism/issues/LOCAL-TBD-*.md`
- `docs/projects/pipeline-realism/plans/2026-02-04-spec-to-implementation-pack.md` (contains the full plan you're executing)
- `docs/projects/pipeline-realism/plans/2026-02-04-implementation-readiness-report.md`
