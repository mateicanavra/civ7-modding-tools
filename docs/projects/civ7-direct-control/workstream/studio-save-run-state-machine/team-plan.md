# Team Plan

## Objective

Use peer review lanes to find and close state-machine gaps around Studio
Save/Deploy, Browser Run, Run in Game, deploy/load proof, and UI recovery.

## Lanes

- Runtime/operational lane: verify deployed file/log boundaries and identify
  stale-worktree or reload hazards.
- Code-flow lane: trace save, deploy, browser run, Run in Game, queueing, and
  cleanup ownership.
- UI-state lane: inspect visible controls, disabled states, stale status, and
  user recovery paths.
- Spec/test lane: convert gaps into OpenSpec requirements and focused tests.

## Artifact Contract

Agents write findings to this directory as markdown reports. The owner
consolidates findings into `review-ledger.md`, `proof-ledger.md`, and the
OpenSpec tasks before closure.

## Accountability

The owner owns final synthesis, implementation, verification, Graphite stack
shape, and repository cleanliness.
