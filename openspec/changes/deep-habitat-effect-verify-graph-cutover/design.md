# Design: Deep Habitat Effect Verify Graph Cutover

## Domain Boundary

Owner: verify and workspace graph contracts.

Workspace graph owns project/task metadata reading and target-plan facts. Verify
owns command sequencing and receipt projection. Nx provider owns Nx command
construction and execution.

## Write Set

```text
tools/habitat-harness/src/domains/proof-contract/**
tools/habitat-harness/src/domains/workspace-graph-integration/**
tools/habitat-harness/src/providers/nx/**
tools/habitat-harness/src/providers/git/**
tools/habitat-harness/src/lib/verify/**
tools/habitat-harness/src/lib/workspace-graph/**
tools/habitat-harness/src/lib/workspace-graph.ts
tools/habitat-harness/src/lib/workspace-graph-contract.ts
tools/habitat-harness/src/commands/verify.ts
tools/habitat-harness/test/lib/verify-receipt.test.ts
tools/habitat-harness/test/lib/workspace-graph.test.ts
```

## Required Cutover

- `resolveVerifyBase` uses `GitProvider`.
- `readVerifyTargetPlan` uses workspace graph service and `NxProvider` target
  proof.
- `runAffectedVerification` uses `NxProvider`.
- Verify timestamps use `HabitatClock`.
- Receipt projection keeps bounded stdout/stderr previews.

## Stop Conditions

- `nx affected` is described as product or architecture proof.
- Verify shells out through `run` after closure.
- Workspace graph service contains feature-specific verify policy instead of
  project/task facts consumed by verify.
