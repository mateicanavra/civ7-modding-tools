# Proposal: Deep Habitat Effect Verify Graph Cutover

## Summary

Move verify, workspace graph, and Nx affected execution onto Effect services and
the Nx/Git providers while preserving verify receipt semantics.

## What Changes

- Move verify source into `src/domains/proof-contract/**` and
  `src/domains/workspace-graph-integration/**`.
- Move workspace graph contracts into the domain/provider split defined by the
  hardened Effect-first tree, leaving command-specific receipt projection in
  the verify-facing command contract.
- Route affected target proof and execution through `NxProvider`.

## What Does Not Change

- `nx affected` remains a scope reducer, not full architecture proof.
- Verify still runs Habitat checks before affected execution.
- No verify receipt field change without D0 row update.

## Verification Gates

- `bun run --cwd tools/habitat-harness test -- test/lib/verify-receipt.test.ts test/lib/workspace-graph.test.ts`
- `bun run habitat verify --json`
- `bun run openspec -- validate deep-habitat-effect-verify-graph-cutover --strict`
- `git diff --check`
