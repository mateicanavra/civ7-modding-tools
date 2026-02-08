# Phase 3 Plan (Recorded)

## Preamble

This file is the mandatory first action for Phase 3 hardening.

- Base branch: agent-ORCH-feasibility-ecology-arch-alignment
- Base commit: 15ea01ba01a56a85a4fecd384dd7860eea0582e2
- Working branch: agent-ORCH-harden-M2-ecology-architecture-alignment
- Worktree root: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-ORCH-harden-M2-ecology-architecture-alignment

## Agent Roster (Phase 3 Hardening)

| Agent | Axis | Scratch output |
| --- | --- | --- |
| ORCH | Integrator | N/A (writes final doc) |
| A | Ops catalog hardening (compute vs plan, atomic per feature) | `agent-ops-catalog.md` |
| B | Steps/stages + compiler binding seam (features-plan) | `agent-steps-compiler.md` |
| C | Gates, determinism, viz compatibility | `agent-gates-parity-viz.md` |
| D | Pipeline-realism stack tip compatibility (Foundation/Morphology) | `agent-upstream-compat.md` |

## Canonical Inputs (Spike + Feasibility)

All of these live under:
- `docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/`

Key files:
- `FEASIBILITY.md`
- `CONTRACT-MATRIX.md`
- `CONTRACTS.md`
- `PHASE-3-SKELETON.md`
- `GREENFIELD.md`
- `DECISIONS/README.md`

## Full Plan (Verbatim)

PLEASE IMPLEMENT THIS PLAN:
# Phase 3 Hardening Plan (Milestone-Equivalent): Ecology Architecture Alignment (Behavior-Preserving, Maximal Modularity)

## Summary

Phase 3 produces a single **decision-ready, spec-ready, milestone-equivalent plan document** for the Ecology refactor, suitable as the immediate input to Phase 4 (`dev-milestone-to-issues` + `dev-prework-sweep`), without writing production refactor code yet.

We will:
1. Re-ground on current canonical MapGen architecture/guidelines (avoid ADRs).
2. Convert the completed Spike + Feasibility package into an “M2”-style milestone doc with **explicit acceptance criteria, gates, sequencing slices, and per-issue hardening**.
3. Run a compatibility cross-check against the current **pipeline-realism** stack tip (Foundation/Morphology contract drift) and fold any deltas into the spec.
4. Finish with one hardened doc + scratch pads capturing evidence, open questions, and prework prompts.

## Locked Directives (Non-Negotiable, Used To Resolve Ambiguity)

These are treated as *decisions*, not open questions:
- Atomic per-feature ops (no multi-feature mega-ops).
- Compute substrate model: compute ops produce reusable layers; plan ops consume them to emit discrete intents/placements.
- Maximal modularity: design maximal ideal; recover performance later via substrate/caching.
- Rules posture: behavior policy lives in `rules/**` imported by ops; steps never import rules.
- Shared libs posture: generic helpers go in shared core MapGen SDK libs; look there first before creating helpers.
- Narsil posture: **do not reindex**; use native tools (`rg`, `git show`, direct reads) when needed.
- Docs posture: prioritize canonical specs/policies/guidelines; ADRs older than ~10 days are non-authoritative.

## Inputs (Existing Artifacts We Will Treat As Canonical For This Hardening)

Primary Ecology spike+feasibility package (branch `agent-ORCH-feasibility-ecology-arch-alignment`, commit `15ea01ba0`):
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/FEASIBILITY.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/CONTRACT-MATRIX.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/CONTRACTS.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/PHASE-3-SKELETON.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/GREENFIELD.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/DECISIONS/README.md`

Pipeline-realism style anchor (for how M2 should read):
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/docs/projects/pipeline-realism/milestones/M1-foundation-maximal-cutover.md`

Hardening workflow (must be followed/adapted as the backbone):
- `/Users/mateicanavra/.codex-rawr/prompts/dev-harden-milestone.md`

## Output (Phase 3 Deliverable)

### 1) One hardened milestone-equivalent doc (single file)
- Path: `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/docs/projects/pipeline-realism/milestones/M2-ecology-architecture-alignment.md`
- Status: “Planned” (this is plan-only, not execution)

### 2) Scratch pads (working, not canonical)
- Path: `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/_scratch/phase-3-hardening/`

## Worktree + Git Workflow (Graphite-Compatible, Hygiene-Strict)

### H0) Primary checkout hygiene (blocking)
From `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools`:
```bash
git status
gt ls
git branch --show-current
git worktree list
```
Rules:
- If `git status` is not clean: stop (no stash/reset).
- Do not global-restack; default to `gt sync --no-restack` only when needed.

### H1) Create isolated worktree for Phase 3 docs hardening
Base branch (default, decision-complete): `agent-ORCH-feasibility-ecology-arch-alignment`

Branch name:
- `agent-ORCH-harden-M2-ecology-architecture-alignment`

Worktree dir:
- `WORKTREES_ROOT="/Users/mateicanavra/Documents/.nosync/DEV/worktrees"`
- `"$WORKTREES_ROOT/wt-agent-ORCH-harden-M2-ecology-architecture-alignment"`

Commands:
```bash
cd /Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools
gt sync --no-restack
WORKTREES_ROOT="/Users/mateicanavra/Documents/.nosync/DEV/worktrees"
git worktree add -b agent-ORCH-harden-M2-ecology-architecture-alignment \
  "$WORKTREES_ROOT/wt-agent-ORCH-harden-M2-ecology-architecture-alignment" \
  agent-ORCH-feasibility-ecology-arch-alignment
cd "$WORKTREES_ROOT/wt-agent-ORCH-harden-M2-ecology-architecture-alignment"
pwd -P
git rev-parse --show-toplevel
git branch --show-current
git log -1 --oneline
```

Edge case handling:
- If the worktree directory already exists: stop and ask before reuse/removal.
- If the branch already exists: create a new suffix branch `...-v2` rather than force-deleting.

### H2) Mandatory first step (before any other work in the worktree)
Create scratch dir and record the agreed Phase 3 plan verbatim:
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-ORCH-harden-M2-ecology-architecture-alignment/docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/_scratch/phase-3-hardening/00-plan.md`

`00-plan.md` contents must include:
- base branch + commit SHA used
- hardening branch + worktree absolute path
- agent roster + responsibilities
- link list to the canonical spike/feasibility docs
- the full Phase 3 plan (this document)

## Agent Team (Phase 3 Hardening)

We will use a small team to parallelize hardening inputs, with ORCH integrating into the single M2 doc.

All agents:
- Operate in the same Phase 3 worktree path: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-ORCH-harden-M2-ecology-architecture-alignment`
- Write only to scratch pads under: `/Users/.../docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/_scratch/phase-3-hardening/`
- Do not reindex Narsil MCP.
- Avoid ADRs as primary sources.

### Roster (4 + 1 dedicated compatibility check)

| Agent | Axis | Definition of Done | Scratch output |
|---|---|---|---|
| ORCH | Integrator | Produces final `M2-...md` doc, resolves all obvious decisions, converts remaining unknowns into explicit prework prompts | N/A (writes final doc) |
| A | Ops catalog hardening (compute vs plan, atomic per feature) | A full target Ecology op catalog + mapping from current ops to target ops, explicitly using `rules/**` for policy and identifying generic helpers that should live in core libs | `agent-ops-catalog.md` |
| B | Steps/stages + compiler binding seam (features-plan) | Step topology decision hardening + exact contract migration shapes (esp. “advanced planner toggles” + compiler prefill) + exact verification gates to prevent accidental “always on” ops | `agent-steps-compiler.md` |
| C | Gates, determinism, viz compatibility | A concrete gates section (commands + expected outcomes) and a parity strategy that’s behavior-preserving, including viz key invariants (`dataTypeKey`, `spaceId`, kinds) | `agent-gates-parity-viz.md` |
| D (dedicated) | Pipeline-realism stack tip compatibility (Foundation/Morphology) | A delta report: what changed upstream that Ecology assumes, whether Ecology plan needs contract updates, and exact edits needed in the M2 doc | `agent-upstream-compat.md` |

Agent brief addendum for ops-focused work (must be included in agent prompts):
- “Rules import”: any behavior policy must be factored into `rules/**` inside ops.
- “Core libs first”: before inventing helpers (clamp variants, rng helpers, array ops), search shared MapGen core libs; propose new helpers as part of plan only if truly missing.

Sync points (time-boxed):
- T+45 min: each agent posts first complete draft to scratch.
- T+90 min: second pass only on uncertain seams identified by ORCH.

## Phase 3 Execution (Hardening Workflow Applied End-to-End)

This phase follows `dev-harden-milestone` semantics, adapted because we are creating and hardening M2 in the same stage.

### P1) “Immediately introspect skills/workflows” (required first action after `00-plan.md`)
Read (do not summarize verbatim; extract constraints and required sections):
- `/Users/mateicanavra/.codex-rawr/prompts/dev-harden-milestone.md`
- `/Users/mateicanavra/.codex-rawr/prompts/dev-milestone-to-issues.md`
- `/Users/mateicanavra/.codex-rawr/prompts/dev-prework-sweep.md`
- Skills: architecture, graphite, git-worktrees, diataxis, deep-search, mental-map, typescript, narsil-mcp

Output (scratch):
- `/Users/.../_scratch/phase-3-hardening/01-workflow-constraints.md`
Content:
- required hardening sections checklist
- formatting constraints (YAML lists, path roots)
- “no ADRs” sourcing posture reminder
- “no Narsil reindex” reminder

### P2) Draft M2 milestone skeleton (create the doc outline before hardening)
Create the M2 doc with:
- Goal, status, owner
- Scope and out-of-scope
- Draft issue hierarchy grouped by slices (Prepare → Cutover → Cleanup)
- Empty placeholders under each issue for acceptance/scope/verification/guidance/prework/open questions

This skeleton should be derived from:
- `/Users/.../PHASE-3-SKELETON.md`
- `/Users/.../FEASIBILITY.md`
- `/Users/.../GREENFIELD.md`
- `/Users/.../DECISIONS/*.md`

Critical decision baked into the skeleton (maximal but behavior-preserving):
- Keep the two-stage posture: `ecology` truth + `map-ecology` gameplay.
- Keep stage ids + step ids stable in Phase 3 execution work, unless a step split is required for correctness; modularity is achieved primarily via ops.

### P3) Build the “issue inventory” inside M2 (stable IDs, no hidden gaps)
Inside the M2 doc, create a stable issue index with IDs (example convention):
- `LOCAL-TBD-PR-M2-001` … `LOCAL-TBD-PR-M2-0NN`

Recommended parent issue groups (maximal modularity, but still behavior-preserving):
1. Preflight + parity baselines (build order, ecology test suite, determinism spot-check posture).
2. Contract freeze + compatibility surfaces (artifact ids/schemas, step ids, viz keys, effect tags).
3. Compiler-owned op binding migration (remove direct imports, enforce `contract.ops`).
4. Compute substrate introduction (new compute ops + intermediate layers; naming + ownership).
5. Atomic per-feature planning ops (split mega-ops: `planVegetation`, `planVegetatedFeaturePlacements`, `planWetFeaturePlacements`, `planAquaticFeaturePlacements`, `planVegetationEmbellishments`, `planReefEmbellishments`).
6. Artifact mutability posture (explicitly preserve publish-once mutable handle behavior where it exists, or specify an explicit migration with proof).
7. Gameplay materialization + effects/tags (plot-effects effect guarantee, downstream gating correctness).
8. Guardrails (lint/import bans, contract enforcement checks, docs pointers, “no step deep imports”).
9. Upstream compatibility adjustments (Foundation/Morphology contract deltas folded in).

For each group, include child issues per feature family and per mega-op split where it reduces ambiguity.

### P4) Harden each issue (dev-harden-milestone checklist, but with maximal decisions)
For every issue in M2, fill:
- Acceptance Criteria (verifiable)
- Scope boundaries (explicit in/out)
- Verification methods (commands; do not invent; use the known ecology build+test sequence)
- Implementation guidance (YAML `files:` list + patterns to follow/avoid)
- Paper trail references (link to feasibility docs and relevant code paths)
- Prework prompts (only when genuinely unknown; otherwise decide now and record)

Hardening principle (user directive override):
- Prefer making a decision when it’s implied by locked directives or already decided in feasibility decision packets.
- Use prework prompts only for facts that require additional discovery (e.g., “what exact upstream contract changed?”), not for avoidable indecision.

### P5) Compatibility check integration (dedicated agent D)
Agent D produces a delta report against the pipeline-realism stack tip:
- What Foundation/Morphology artifacts or fields changed that Ecology consumes.
- Whether `artifact:morphology.topography` or other upstream artifacts changed schema/semantics.
- Whether ecology step requires/provides lists need updating.
- Whether any viz key namespaces changed.

ORCH then:
- Updates M2 doc “Assumptions” and “Upstream compatibility” section.
- Adds explicit prework prompts if the delta can’t be resolved at planning time.

### P6) Coherence review pass (milestone-level)
Run the `dev-harden-milestone` coherence checks explicitly:
- Internal consistency: issue scopes don’t overlap, dependencies form a DAG, references correct.
- Completeness: no hidden work needed to achieve acceptance criteria.
- Safety: slice boundaries leave repo working; cutover has gates; cleanup has deletion targets.
- “Maximal, no optional later”: every ambiguity becomes either a decision or a prework prompt with expected output.

If needed, add a short `## Coherence Review Notes` section at the bottom of M2 with remaining concerns.

## “Gates” (What the Hardened M2 Doc Must Specify)

The M2 doc must include a **Gates** section with concrete commands and expected outcomes. Minimum set (known-good baseline from feasibility):
- `bun run --cwd /Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/packages/civ7-adapter build`
- `bun run --cwd /Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/packages/mapgen-viz build`
- `bun run --cwd /Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/packages/mapgen-core build`
- `bun --cwd /Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps test test/ecology`

M2 must also specify at least one “no behavior change” parity gate beyond tests, for example:
- determinism fingerprinting on a fixed seed
- stable viz key inventory checks (`dataTypeKey` list diff is empty)
- “no step deep imports” enforcement (`rg` pattern expected zero hits)

## Important Planned Interface/Contract Changes (Documented in M2, Not Implemented in Phase 3)

M2 must explicitly list planned contract impacts (even if behavior-preserving):
- Step contract updates to eliminate direct op imports and ensure compiler-owned op envelope normalization.
- New/renamed op ids to achieve atomic per-feature ops + compute substrate.
- Any new intermediate compute artifacts (if we decide to publish substrate layers for reuse/viz).
- `plot-effects` effect tag addition.
- Explicit statement of the publish-once mutable handle posture for `artifact:ecology.biomeClassification`.

## Test Scenarios (What M2 Must Cover)

M2 must enumerate scenarios that will be used later to validate behavior preservation:
- Baseline: standard recipe on a fixed seed, verify artifact-level diffs are empty for preserved surfaces.
- “Advanced planner toggles”: with and without `vegetatedFeaturePlacements` / `wetFeaturePlacements`, verify the compiler prefill modeling does not turn features on by default.
- Artifact mutability: confirm `biome-edge-refine` ordering and in-place mutation behavior is unchanged.
- Gameplay boundaries: adapter writes occur at the same step boundaries and effect tags match expectations.
- Studio/viz: `dataTypeKey` inventory for ecology stages unchanged (or intentionally migrated with a mapping table).

## Phase 3 Acceptance Criteria (This Stage Is Done When…)

- The single M2 doc exists at `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/docs/projects/pipeline-realism/milestones/M2-ecology-architecture-alignment.md`.
- M2 is decision/spec-ready:
  - Every issue has acceptance criteria, scope, verification, implementation guidance, and paper trail references.
  - Open questions are explicit and minimized.
  - Remaining unknowns are captured as prework prompts with clear expected outputs.
- M2 includes a complete slice plan (Prepare → Cutover → Cleanup) with explicit gates per slice.
- Upstream compatibility review is complete and integrated (or explicitly captured as prework prompts).
- Scratch pads exist and are clearly labeled as non-canonical working documents.

## Edge Cases / Branches (Must Be Handled Explicitly During Phase 3)

- Worktree already exists: stop and ask before reuse/removal.
- Branch tip drift during hardening: record base commit SHA in `00-plan.md` and in M2 “Assumptions”.
- Narsil results missing/stale: do not reindex; fall back to `rg`, `git show`, and direct file reads.
- Pipeline-realism upstream changes are mid-flight: document compatibility against a specific branch+SHA, and add a prework prompt to re-validate once upstream lands.

## Assumptions (Defaults Chosen So The Plan Is Decision-Complete)

- We will name the hardened doc “M2” and place it under pipeline-realism milestones: `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/docs/projects/pipeline-realism/milestones/M2-ecology-architecture-alignment.md`.
- We will run Phase 3 doc hardening on a new worktree branch based on `agent-ORCH-feasibility-ecology-arch-alignment`.
- Stage posture remains two-stage (`ecology` truth, `map-ecology` gameplay).
- We preserve external artifact ids and viz keys as compatibility surfaces unless M2 explicitly defines a migration table and gates for them.

## Skills/workflows explicitly used in Phase 3 planning

- Skills: architecture, deep-search, mental-map, diataxis, typescript, deck-gl, narsil-mcp (no reindex), graphite, git-worktrees
- Workflows: dev-harden-milestone (primary), dev-milestone-to-issues (Phase 4 input), dev-prework-sweep (Phase 4/5 follow-through)
