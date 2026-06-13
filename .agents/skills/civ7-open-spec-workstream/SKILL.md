---
name: civ7-open-spec-workstream
description: |
  Use in the Civ7 Modding Tools repo when running a bounded workstream or OpenSpec-style phase from authority grounding through spec/proposal, review, implementation, verification, downstream realignment, and handoff. Trigger phrases include "open spec", "workstream", "phase record", "spec-driven implementation", "multi-agent implementation wave", "artifact worker", "OpenSpec worker", "delegated artifact edits", "review disposition", "downstream realignment", or "compaction-safe handoff".
---

# Civ7 Open Spec Workstream

## Purpose

Use this skill when you are responsible for a bounded Civ7 workstream that must survive across agents, compactions, Graphite branches, reviews, and downstream changes.

This skill is the operational anchor for a phase loop:

```text
ground -> define spec/change -> review -> implement -> verify -> realign -> close or hand off
```

It does not define architecture or product authority. It coordinates movement toward already-grounded authority.

## Authority Order

Use `references/source-map.md` to resolve active authority for every phase.
This repo has an `openspec/` tree for implementation change management. Treat
OpenSpec artifacts as downstream records that slice, validate, and archive
work toward accepted product and architecture authority.

For MapGen / Swooper Maps normalization, the controlling baseline remains
`docs/projects/engine-refactor-v1/architecture-normalization-packet.md` unless
a completed promotion explicitly moves a decision into evergreen docs, ADRs,
or OpenSpec specs.

## When To Use

- Turning an architecture/product review into bounded implementation phases.
- Starting, applying, reviewing, repairing, closing, or handing off a spec-driven phase.
- Coordinating owner, implementer, reviewer, and downstream-update roles.
- Writing phase records, review ledgers, downstream realignment ledgers, closure checklists, or next packets.
- Running multi-agent implementation or verification waves.
- Keeping a dedicated artifact worker agent alongside a workstream owner so
  OpenSpec/workstream documents stay current without pulling the owner away
  from implementation synthesis.

## Non-Goals

- Do not use this to redesign architecture or product authority.
- Do not use it to store long-term product rules; update canonical docs, accepted project baselines, ADRs, deferrals, or the relevant authority skill for durable rules.
- Do not use it to authorize shims, fallbacks, silent skips, dual paths, broad compatibility lanes, or generated-output hand edits.
- Do not treat proposal-only or code-only work as a complete phase.

## Default Workflow

1. **Open the workstream.** Check Git/Graphite/worktree state, active project/spec artifacts, dirty files, authority docs, and relevant repo-local skills.
2. **Select the next phase.** Derive a bounded phase from controlling authority and active project goals. Name prerequisites, enabled parallel work, stop conditions, and evidence.
3. **Re-analyze current state.** Inspect code, tests, docs, generated outputs, and active project artifacts touched by the phase.
4. **Define or repair the spec/change.** Create or update OpenSpec changes under `openspec/changes/<change-id>/` for implementation slices. Use project-local phase artifacts under `docs/projects/<project>/workstream/<phase>/` only when the slice is deliberately not an OpenSpec change yet.
5. **Run pre-code review.** Review authority, product ownership, architecture boundaries, task readiness, shortcut language, testing, and sequencing.
6. **Prime an artifact worker when useful.** For long phases, use
   `references/delegated-artifact-worker.md` and
   `assets/openspec-artifact-worker-prompt.md` to keep one grounded worker
   available for phase-record, task, ledger, and checklist edits.
7. **Implement the phase.** Keep edits inside the phase write set and update task/state artifacts immediately when facts change.
8. **Verify and repair.** Run focused gates, disposition findings, and repair accepted blockers.
9. **Realign downstream work.** Update dependent project specs, docs, issue plans, tests, guards, and Next Packets when assumptions changed.
10. **Close or hand off.** Commit according to Graphite workflow, leave repo clean, and write a zero-context continuation packet if work continues.

## Reference Map

| Reference | Path | Open When |
|---|---|---|
| Source map | `references/source-map.md` | Resolving authority, stale inputs, and artifact location |
| Phase loop | `references/phase-loop.md` | Running one phase end to end |
| Team and review lanes | `references/team-and-review-lanes.md` | Coordinating agents, reviewers, and repair loops |
| Delegated artifact worker | `references/delegated-artifact-worker.md` | Setting up a standing worker for OpenSpec/workstream document edits |
| Artifact contracts | `references/artifact-contracts.md` | Creating phase records, ledgers, closure checklists, and handoffs |
| Failure patterns | `references/failure-patterns.md` | Work is busy but not converging |
| Validation checks | `references/validation-checks.md` | Checking phase readiness and closure |

## Asset Map

| Asset | Path | Use When |
|---|---|---|
| Phase record | `assets/phase-record.md` | Starting or resuming a phase |
| Review disposition ledger | `assets/review-disposition-ledger.md` | Tracking findings through repair or rejection |
| Downstream realignment ledger | `assets/downstream-realignment-ledger.md` | Recording affected downstream assumptions and patch/no-patch disposition |
| Closure checklist | `assets/closure-checklist.md` | Closing a phase |
| Next packet | `assets/next-packet.md` | Handing off incomplete work |
| Artifact worker prompt | `assets/openspec-artifact-worker-prompt.md` | Priming a standing worker agent for workstream artifact edits |

## Core Invariants

<invariants>
<invariant name="owner-owns-continuity">The workstream owner owns synthesis, phase state, review disposition, proof claims, repo state, downstream realignment, and closure.</invariant>
<invariant name="phase-is-full-loop">A phase includes analysis, spec/change definition, review, implementation, verification, realignment, and cleanup. Proposal-only or code-only work is incomplete.</invariant>
<invariant name="spec-is-downstream">Project specs and OpenSpec-style artifacts express implementation movement toward authority. They cannot soften or replace product/architecture authority.</invariant>
<invariant name="openspec-is-installed">Use the repo-local OpenSpec CLI via `bun run openspec -- ...` or `bun run openspec:validate`; do not rely on global installation for repo verification.</invariant>
<invariant name="dominoes-control-sequence">For MapGen normalization, OpenSpec changes derive from the accepted packet dominoes unless a later accepted authority record changes the order.</invariant>
<invariant name="no-shortcut-language">Fallback, shim, temporary, optional, dual path, compatibility lane, only-if-needed, and silent skip language blocks implementation until removed or explicitly authorized.</invariant>
<invariant name="review-findings-are-control-inputs">Material reviewer findings require disposition. Accepted P1/P2 findings block dependent implementation until repaired.</invariant>
<invariant name="realignment-is-required">Each phase must account for downstream docs, tests, specs, issue plans, generated-output assumptions, and future work.</invariant>
<invariant name="delegation-does-not-transfer-ownership">Delegated artifact edits reduce owner context load, but the workstream owner still owns synthesis, proof claims, review disposition, and final closure.</invariant>
<invariant name="compaction-state-is-written">Live phase state must be recoverable from files, commits, and Next Packets without replaying chat.</invariant>
<invariant name="pause-is-not-close">A paused phase may hand off with a Next Packet, but it is not closed, green, or archived.</invariant>
<invariant name="clean-repo-closure">A phase does not close with unexplained dirty files, untracked artifacts, stale running agents, or incomplete review state.</invariant>
</invariants>

## Quick Start

1. Read `references/source-map.md` and `references/phase-loop.md`.
2. Load `civ7-product-authority` and/or `civ7-architecture-authority` as needed.
3. Choose the OpenSpec change id and workstream artifact location.
4. Copy `assets/phase-record.md`.
5. Define the spec/change and review lanes before code.
6. Implement, verify, realign downstream work, commit, and close cleanly.
