## Why

Multiple local branches, detached worktrees, and predecessor Graphite stacks
contained Swooper mapgen and Studio fixes. Some were already integrated, some
were stale, and some had only partial semantic deltas. Recovery needed to stop
redoing solved work and leave one current stack with explicit ownership.

## What Changes

- Record the DRA state capture and agent semantic audits.
- Integrate only in-scope semantic deltas that were missing from this stack.
- Record out-of-scope stacks so cleanup does not delete unrelated work.
- Capture new screenshot/deploy identity evidence as open follow-up, not as a
  hidden assumption.
- Preserve the product-first test authority from
  `openspec/changes/swooper-world-balance-recovery/` so the next mountain and
  river recovery does not regress to implementation-only tests.

## Forbidden Non-Goals

- Do not replay stale branch commits wholesale.
- Do not keep duplicate implementations or dead policy exports.
- Do not delete unrelated active stacks.
- Do not claim mountain-region visual quality is solved just because numeric
  tests pass.

## Verification Gates

- Focused code/tests for each atomic recovery changeset.
- OpenSpec validation.
- Clean Git/Graphite state after commit.
