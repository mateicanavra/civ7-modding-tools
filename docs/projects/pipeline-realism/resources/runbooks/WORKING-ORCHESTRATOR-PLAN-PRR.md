# Working Orchestrator Plan (PRR) — No-Legacy Foundation ↔ Morphology Cutover

This is a working orchestration document for executing the canonical plan:

- Canonical execution plan: `docs/projects/pipeline-realism/plans/PLAN-no-legacy-foundation-morphology-refactor-2026-02-05.md`

This document is a runbook and posture aid. It does not supersede the canonical plan; it exists to preserve the orchestrator+worker execution loop and the intended posture in one place.

## Original Orchestrated Execution Plan (Verbatim)

PLEASE IMPLEMENT THIS PLAN:
# Orchestrated Execution Plan: No‑Legacy Foundation → Morphology Cutover (Pipeline Realism Remediation)

## Summary (Objective + Non‑Negotiables)
**Objective (behavioral outcome):** Morphology must derive **continents/landmask from Foundation’s physics/tectonics truth** (crust truth + provenance), eliminating the current “looks wired but behaves unchanged” hybrid seam (belts/mountains use new drivers while landmask remains noise/threshold driven).

**Posture (non‑negotiable):**
- **Forward‑only maximal physics.** No legacy compatibility, no shims, no dual paths, no shadow/compare surfaces.
- **Determinism + invariants are gates**, not debug tools.
- **Evidence bundle every slice** (fingerprints + stats + dumps), attached in PRs/threads as required by the plan doc.
- Willing to **break contracts** to achieve the single causal spine, as long as the end state is correct and green.

Canonical execution source: `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/docs/projects/pipeline-realism/plans/PLAN-no-legacy-foundation-morphology-refactor-2026-02-05.md`  
Workflow contract to follow: `/Users/mateicanavra/.claude/plugins/local/plugins/dev/commands/dev-loop-parallel.md` (single worktree + Graphite stack)

---

## Roles (Orchestrator vs Worker)

### Orchestrator (you asked me to be this)
I run a calm loop that keeps the worker moving slice-by-slice with taste and sequencing, not micromanagement.

Responsibilities:
1. Choose the next slice (in plan order, respecting Phase gates).
2. Kick off the worker on that slice using `dev-linear` (then interrupt to send a context packet).
3. Monitor primarily via the worker’s scratchpad (read file directly).
4. When the worker says “done”, do a high-level review for drift, gate compliance, and evidence attachments.
5. At slice boundaries:
   - request a concise continuity snippet from the worker
   - `/compact` the worker
   - move the **primary** checkout to the **stack tip** so code-intel can re-index the newest changes.

### Worker (one long-running agent): `GOBI`
Responsibilities:
- Use **one milestone worktree** for the whole effort (kept alive until the end).
- One Graphite branch per slice; commit often; keep each slice reviewable and green.
- Maintain scratch + planning discipline (below).
- Update the canonical plan doc by checking off slice items and preserving “truthy” resolved detail.
- Delete/clear scratch artifacts at the end of each slice so the repo/worktree isn’t left dirty.

---

## Planning + Scratch Discipline (Mandatory)
We will maintain three “planning surfaces” during execution:

1. **Canonical plan doc (repo-tracked):**
   - Add/maintain a **top-of-doc execution checklist** (checkbox tasks per slice).
   - Check items off as slices complete.
   - Any ambiguity resolved with evidence gets written back here.

2. **Overall in-memory plan (operational):**
   - As orchestrator, I keep the slice sequencing + dependency picture up to date (and re-state it to the worker only at slice boundaries).

3. **Per-slice in-memory plan (worker-owned):**
   - Worker keeps a short checklist and evolving notes while implementing the slice.

**Scratchpad file (worker-owned, not committed):**
- Location (in-repo so I can monitor):  
  `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/docs/projects/pipeline-realism/issues/GOBI.scratch.md`
- Rules:
  - Write thinking/notes first; code second.
  - Update continuously while working.
  - At slice end: **wipe the file contents or delete it**, and confirm `git status` is clean.

(If `docs/projects/pipeline-realism/issues/` doesn’t exist, create it in the first slice; it’s just an untracked workspace. Keep it empty/clean at slice boundaries.)

---

## Branching / Naming / Worktree (Decision-Complete)
We follow `dev-loop-parallel` naming rules (agent prefix required) plus phase-readable suffixes.

**Pseudo-milestone key for naming:** `PRR` (Pipeline Realism Remediation)

**Single milestone worktree + stack base:**
- Trunk: `main`
- Milestone base branch: `agent-GOBI-PRR-milestone-no-legacy-foundation-morphology`
- Worktree root: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees`
- Milestone worktree path:  
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-GOBI-PRR-milestone-no-legacy-foundation-morphology`

**Slice branches (one per slice, stacked):**
1. `agent-GOBI-PRR-s00-phase-0-preflight-no-shadow-and-plan-readiness`
2. `agent-GOBI-PRR-s10-phase-a-foundation-truth-nondegenerate`
3. `agent-GOBI-PRR-s20-phase-b-landmask-grounded-in-crust-truth`
4. `agent-GOBI-PRR-s21-phase-b-erosion-no-hidden-reclass`
5. `agent-GOBI-PRR-s30-phase-c-belts-as-modifiers`
6. `agent-GOBI-PRR-s40-phase-d-observability-enforcement`
7. `agent-GOBI-PRR-s90-final-legacy-sweep-and-docs`

**Graphite submission flag:** always include `--ai` when submitting/updating PRs for the stack (use draft posture until we’re confident).

---

## Slice Map (What Each Slice Must Accomplish)

### Slice s00: Phase 0 + Plan Readiness (Blocking)
Purpose: ensure we can’t “fake progress” with dual/shadow/compare surfaces, and make the canonical plan doc execution-ready.

Required work in this slice:
- Make any concrete adjustments to the plan doc required for confidence:
  - add the top-of-doc slice checklist (checkboxes matching the slice list above)
  - add a short “Orchestrator loop” + “Worker per-slice loop” section (runbook style, not prose)
  - remove misleading/ambiguous notes if any remain (the plan doc should read as authoritative and current)
- Enforce Phase 0 gate:
  - `bun run --cwd mods/mod-swooper-maps test test/pipeline/no-shadow-paths.test.ts`
  - If it fails: delete/rename surfaced patterns (no shims), and if needed extend the guardrail patterns (per plan).
- Evidence bundle attached to the PR for this slice (see Evidence section below).

Acceptance:
- Phase 0 test green.
- Plan doc has a clear, checkable execution checklist.
- No shadow/dual/compare surfaces remain.

---

### Slice s10: Phase A — Foundation Truth Normalization + Degeneracy Elimination
Purpose: make “material evolution” real so Morphology can consume a non-degenerate crust truth spine.

Work must satisfy Phase A intent:
- Re-establish baseline probe evidence bundle (plan’s canonical `106 66 1337`), and ensure the “degenerate `crustTiles.type`” problem is addressed by making `type` derived/non-degenerate and/or promoting the continuous truth contract.
- Ensure provenance resets are non-trivial (frequency + spatial structure), and “events emit fields but don’t change state” dead-lever behavior is eliminated.
- Ensure Phase A gate bundle is green (plan-defined).

Also: start/complete Phase A review thread closures as the plan requires:
- #1077 (`PRRT_kwDOOOKvrc5swnXi`)
- #1078 (`PRRT_kwDOOOKvrc5swoFn`)
- #1083 (`PRRT_kwDOOOKvrc5swl4c`)

Acceptance:
- Phase 0 gate still green.
- Determinism suite green.
- Foundation gates green.
- Evidence bundle posted, and Phase A thread evidence posted per table in the plan.

---

### Slice s20: Phase B — Landmask Grounded in Foundation Truth (Numeric Gate Slice)
Purpose: replace noise/threshold-first landmask with a continent-scale classifier grounded in crust truth + provenance stability.

Work must do (plan B0–B1):
- Define “continent potential” as low-frequency function of crust truth + provenance stability.
- Replace threshold/noise-dominant landmask behavior with crust-truth-driven classifier.
- Ensure belts remain modifiers (not continent generators).

Numeric gate (blocking, per plan):
- Capture **Phase B baseline** + **Phase B after** with:
  - `diag:dump --label phase-b-baseline`
  - `diag:dump --label phase-b-after`
  - `diag:analyze -- <baselineOutputDir> <afterOutputDir>`
- Pass the plan’s delta-based formulas for component reduction + largestLandFrac increase + pctLand sanity bands.

Acceptance:
- Phase A gate bundle satisfied.
- Phase B compare evidence attached.
- Numeric gate passes.

---

### Slice s21: Phase B Cleanup — No Hidden Reclassification During Erosion (B2/Basin + Geomorphology)
Purpose: stop geomorphology from silently shredding connectivity via re-thresholding/reclassification, and delete any basin separation “truth” not derived from Foundation.

Work must do:
- Remove/redefine any land/water reclassification during erosion that is not explicitly derived from Foundation truth.
- Ensure the post-erosion landmask stays coherent (and does not re-shatter what s20 fixed).

Acceptance:
- Re-run Phase B compare (baseline vs after for this slice) and ensure gates remain satisfied post-erosion (per plan’s “geomorphology does not re-shatter coherence” constraints).
- Evidence bundle posted.

---

### Slice s30: Phase C — Belts as Modifiers (Unified Spine)
Purpose: belt drivers modulate, not generate continents; enforce positive-intensity seeding semantics.

Work must do (plan C0–C2):
- Enforce “positive-intensity only seeds diffusion” (thread #1087 / `PRRT_kwDOOOKvrc5swmNO`).
- Confirm belts modulate relief/coasts/mountains but do not create continents.
- Resolve “segments seed belts” semantics as either a Phase C change or an explicit deferral with deletion trigger (per plan; default is implement, not defer).

Acceptance:
- Belt diffusion seeding semantics proved by tests + evidence bundle.
- Thread closure evidence posted.

---

### Slice s40: Phase D — Observability as Enforcement
Purpose: turn observability into correctness enforcement, with clear tiers and no false diffs.

Work must do:
- Define/enforce gate tiers as per plan (Tier 1 contracts + budgets; CI determinism equivalence; promoted subset enforcement).
- Close Phase D threads with required evidence:
  - #1080 (`PRRT_kwDOOOKvrc5swnAd`) plateFitP90 uncapped proof
  - #1092 (`PRRT_kwDOOOKvrc5swmzA`) morphology correlation gate uses runtime-normalized config

Acceptance:
- Determinism suite green, foundation gates green.
- Evidence bundle attached.
- Phase D threads have in-thread evidence and closure triggers met.

---

### Slice s90: Final Sweep — No Legacy Remnants + Docs Cleanup (End-of-Project Requirement)
Purpose: ensure the repo reflects the forward-only posture in reality, not just intent.

Work must do:
- Full “legacy cleanup sweep”:
  - remove any remaining dual paths/shims/legacy remnants
  - remove dead-lever normalization traps if still present (per plan targets)
  - ensure Phase 0 guard patterns still hold (and expand if synonyms appeared)
- Documentation sweep:
  - canonical plan doc is fully checked off and “truthy”
  - resolved nuance stays in the plan doc (no rediscovery)
  - ensure no scratch files remain

Acceptance:
- Entire stack green.
- Plan doc matches the final reality.
- No leftover scratch artifacts; `git status` clean.
- All phase threads closed with evidence.

---

## Per-Slice Execution Loop (Worker Must Follow Every Time)
This is the **deterministic** slice loop (derived from the plan doc + workflow):

1. `gt sync --no-restack`
2. `gt create <slice-branch-name>`
3. Preflight:
   - `git status` clean (except the untracked scratchpad while in-flight)
   - ensure deps are available in the worktree (`bun install` if needed)
4. Implement (forward-only; include deletions; no shims).
5. Validate (minimum, every slice):
   - `bun run --cwd mods/mod-swooper-maps check`
   - `bun run --cwd mods/mod-swooper-maps test`
   - `bun run --cwd mods/mod-swooper-maps test test/pipeline/determinism-suite.test.ts`
   - `bun run --cwd mods/mod-swooper-maps diag:dump -- 106 66 1337 --label <slice-label>`
   - Plus any phase/thread-specific commands from the plan doc tables.
6. Evidence bundle (paste into PR description; see below).
7. `gt restack --upstack`
8. Submit/update PRs: `gt submit --stack --draft --ai`
9. Update the canonical plan doc checklist (check the slice item; add any resolved nuance).
10. End-of-slice hygiene:
   - wipe/delete `.../GOBI.scratch.md`
   - confirm `git status` clean

---

## Evidence Bundle (Every Slice, No Exceptions)
Attach to PR description (and to PRRT threads when a phase table requires it):

- `diag:dump` JSON: `{"runId":"...","outputDir":"..."}`
- `diag:analyze` JSON:
  - single-run form: `diag:analyze -- <outputDir>`
  - Phase B compare form: `diag:analyze -- <baselineOutputDir> <afterOutputDir>`
- Spot-check layers (as in plan):
  - `diag:list ... foundation.crustTiles.type` (or replacement derived view if `type` is demoted)
  - `diag:list ... morphology.topography.landMask`
- Determinism enforcement proof:
  - `bun run --cwd mods/mod-swooper-maps test test/pipeline/determinism-suite.test.ts` output excerpt (or CI excerpt)

---

## Important Public Contract / Interface Changes (Expected)
We should assume these changes will be real and potentially breaking (by design):
- Foundation: `crustTiles.type` becomes **derived view**, not truth; continuous crust truth fields (maturity/thickness/age/damage/etc.) become primary.
- Morphology: landmask algorithm becomes continent-scale classifier grounded in Foundation truth; noise demoted to secondary coast flavor.
- Observability: gating tiers hardened; determinism/invariant expectations may tighten.

---

## Test Scenarios / Acceptance (End State)
By the end of s90, we must be able to say (with evidence):
- Phase 0 guard is green (no shadow/dual/compare).
- Determinism suite is green (fingerprints stable).
- Foundation gates are green.
- Phase B numeric gate passes on the canonical probe (components materially reduced, largestLandFrac materially increased, pctLand sanity bands respected).
- Review threads listed in the plan are closed with in-thread evidence.
- No legacy remnants / dual semantics remain; docs are clean; worktree is clean.

---

## Assumptions / Defaults (Locked)
- Base branch is `main` (repo currently clean and on `main`).
- Graphite is available (`gt` present); we never run `gt sync` without `--no-restack`.
- We run the whole effort in **one** milestone worktree and one Graphite stack.
- We will treat `PRR` as the naming key for this remediation (since this is “milestone-style” without a single Linear milestone id).
- We submit PRs with `--ai` and keep them `--draft` by default until the stack is clearly stable.

## Synthesis Additions (Alternate Plan Nuance)

The alternate plan strengthens the posture in a few ways; we incorporate them as additions (workflow unchanged):

- Maintain an **Execution Log** section in the canonical plan doc tracking slice completion and evidence pointers (plus PR links).
- Split Phase A into two slices:
  - `s10`: Phase A core (crust truth non-degenerate + provenance resets non-trivial)
  - `s11`: Phase A thread closures (1077/1078/1083) with required in-thread evidence
- Treat any docs-only readiness as a first-class deliverable; if further runbook/doc adjustments are required later, land them as their own small commit at the start of the relevant slice.
