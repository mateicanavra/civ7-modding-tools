# Feasibility Stage Plan (Recorded)

This file records the agreed execution plan for the **Ecology feasibility + spec-prep** stage.
It is written **before** any other feasibility research actions.

## Run Metadata

- Base branch: `agent-ORCH-spike-ecology-arch-alignment`
- Feasibility branch: `agent-ORCH-feasibility-ecology-arch-alignment`
- Feasibility worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-ORCH-feasibility-ecology-arch-alignment`

Notes:
- The feasibility worktree directory disappeared unexpectedly mid-session and was recreated from the feasibility branch.
  - The feasibility branch still existed; no committed feasibility work was lost.
  - Any uncommitted feasibility scratch docs were recreated in this directory.

## Locked Directives (Non-Negotiable)

- **Atomic per-feature ops:** each feature family is a distinct op; no multi-feature mega-ops.
- **Compute substrate model:** shared **compute ops** produce reusable layers; **plan ops** consume them to emit discrete intents/placements.
  - Reference model (in-repo): Morphology `compute-*` substrate ops + `plan-*` ops.
    - `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps/src/domain/morphology/ops/compute-substrate/contract.ts`
- **Maximal modularity:** aim for the maximal ideal modular architecture; do not pre-optimize performance (recover via substrate + caching later).
- **Docs posture:** prioritize canonical MapGen guidelines/specs/policies; avoid ADRs as primary references; treat ADRs older than ~10 days as non-authoritative.
- **Ops design posture:** ops import **rules** for behavioral policy; step code does not import rules.
- **Shared libs posture:** if a helper is generic (usable across many ops/domains), it belongs in shared core MapGen SDK libs; look there first before inventing (e.g., clamp variants).
- **Narsil posture:** do **not** reindex Narsil MCP (other agents are using it); use native tools (`rg`, file reads) for anything missing from the index.

## Agent Roster (Planned)

This feasibility stage was designed to run with up to 4 peer agents, but this session may be constrained by the global agent thread limit.
If agents cannot be spawned, ORCH will fill these scratch pads directly while keeping the same deliverable structure.

- Agent A: Step↔Op contract feasibility (`agent-contract-binding.md`)
- Agent B: Compute substrate + op modularity (`agent-compute-substrate.md`)
- Agent C: Tags/effects + downstream gating (`agent-effects-consumers.md`)
- Agent D: Parity + determinism (`agent-parity.md`)

## Full Plan (Verbatim)

PLEASE IMPLEMENT THIS PLAN:
# Dev Spike Feasibility Plan: Ecology Architecture Alignment (Spec-Ready Prework)

## Summary
This stage converts the completed Ecology architecture-alignment spike into a **feasibility verdict + spec-ready refactor blueprint**, without writing production refactor code yet.

We will:
1. Re-ground in canonical MapGen guidelines/specs/policies (not old ADRs).
2. Lock the feasibility-stage “north star” into explicit **decisions + contract matrices**.
3. Prove feasibility by tracing the hard seams (step↔op binding, compiler normalization, artifacts/buffers, effects/tags, viz keys, determinism).
4. Produce a “Phase 3-ready” package: enough clarity that the *next* stage can harden into a full implementation plan with minimal uncertainty.

## Feasibility Stage Definition Of Done (What “Spec Ready” Means Here)
By the end of this stage we will have:
- A written feasibility verdict (“feasible”, “feasible with caveats”, or “blocked”) grounded in code evidence.
- A locked **target contract matrix** for the behavior-preserving refactor (steps ↔ ops ↔ artifacts/buffers ↔ tags/effects).
- A locked **module/ops catalog** for Ecology in the compute-vs-plan + atomic-per-feature posture.
- A small set of explicit **decision packets** resolving the remaining “this-or-this” choices.
- A parity strategy for “no behavior change” (tests + dump/diff harness + invariants), and a clear risk register.
- A Phase 3 “implementation plan skeleton” (not hardened) describing workstreams + candidate slice boundaries + verification gates.

## Worktree + Git Workflow (Strict Hygiene)
We keep primary checkout untouched and run everything in a dedicated worktree/branch.

- Primary worktree must be clean (no stashing/resetting).
- Base branch: `agent-ORCH-spike-ecology-arch-alignment`
- Feasibility branch/worktree: `agent-ORCH-feasibility-ecology-arch-alignment` in `wt-agent-ORCH-feasibility-ecology-arch-alignment`

## Execution Plan (Feasibility Workflow, End-to-End)

### Phase F1: Authority + Architecture Re-ground (No ADR Drift)
Outputs (scratch):
- `01-authority-stack.md`

### Phase F2: Current-State Feasibility Audit (Evidence Pass)
Outputs (scratch):
- `02-feasibility-audit.md`

### Phase F3: Target Spec Locking (Compute Substrate + Atomic Ops, Behavior-Preserving)
Outputs (canonical):
- `FEASIBILITY.md`
- `CONTRACT-MATRIX.md` (if needed)

### Phase F4: Decision Packets (Resolve Remaining “This-or-This”)
Outputs (canonical):
- `DECISIONS/*`

### Phase F5: Minimal Experiments (Only If They Reduce Uncertainty)
Outputs (scratch + summary in FEASIBILITY):
- `03-experiments.md`

### Phase F6: Phase-3-Ready Skeleton (Not The Full Implementation Plan)
Outputs (canonical):
- `PHASE-3-SKELETON.md`

### Phase F7: Workflow Doc Alignment
Update (navigation/pointers, no duplication):
- `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/plans/ecology/ECOLOGY.md`
- `.../spike-ecology-current-state.md`
- `.../spike-ecology-modeling.md`

