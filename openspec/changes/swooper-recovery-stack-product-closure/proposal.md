## Why

After exact authorship, final-surface parity, product acceptance, and any
targeted repairs close, the stack still needs deliberate product closure:
OpenSpec task state, proof ledgers, Graphite/PR state, stale packets, remote
predecessor disposition, and downstream docs must agree.

## Target Authority Refs

- `openspec/changes/swooper-stack-recovery-consolidation/workstream/branch-recovery-ledger.md`
- `openspec/changes/swooper-stack-recovery-consolidation/**`
- All proof and targeted repair changes created under this recovery lane
- `docs/process/GRAPHITE.md`

## What Changes

- Reconcile OpenSpec task and phase states across the recovery lane.
- Verify no P1/P2 review findings remain undispositioned.
- Submit or explicitly preserve Graphite/PR state according to repo workflow.
- Decide remote predecessor branch/PR disposition only after replacement
  durability is recorded.
- Promote stable learning to canonical docs, ADRs, deferrals, guards, tests, or
  skills where warranted.

## Requires

- Closed exact-authorship proof.
- Closed final-surface parity proof or classified residuals.
- Closed product acceptance proof.
- Closed targeted repairs or explicit out-of-scope disposition.

## Enables Parallel Work

- Subsequent product implementation categories can begin from clean durable
  state.

## Affected Owners

- OpenSpec recovery lane records.
- Graphite branch/PR state.
- Downstream docs/tests/guards only when stable facts changed.

## Forbidden Owners

- No product closure from local tests alone.
- No remote predecessor deletion before replacement durability is explicit.
- No stale handoff packet claiming current state.

## Stop Conditions

- Repo or relevant worktree is dirty without precise ownership.
- Any accepted P1/P2 review finding remains open.
- Graphite parent/branch state is ambiguous.
- Product proof records disagree with OpenSpec task state.

## Consumer Impact

The recovery stack becomes reviewable, resumable, and honest about what is
closed, submitted, merged, preserved, or deferred.

## Verification Gates

- `git status --short --branch`
- Graphite branch/stack inspection.
- `git diff --check`
- `bun run openspec:validate`
- Final proof ledger and review disposition audit.
