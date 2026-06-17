# Studio Effect State-Machine Closeout

## Why

The recovery workstream needs final closure only after packet records, scenario rows, proof labels, review dispositions, docs, Graphite state, and worktree hygiene are aligned.

## What Changes

- Reconcile every scenario and error-boundary row to final status.
- Promote only accepted durable documentation.
- Record Graphite/worktree state and distinguish local proof from submitted/product proof.

## Non-Goals

- No runtime implementation in closeout; blockers reopen owning packets.
- No generated/deployed output edits.
- No inferred product proof.

## Verification Gates

- `bun run openspec -- validate studio-effect-state-machine-closeout --strict`
- `bun run openspec:validate`
- `bun run habitat classify <changed paths>` and returned targets
- `gt ls`, `gt status`, `git worktree list`, and `git status --short --branch`
