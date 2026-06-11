# Failure Patterns

These patterns repeatedly cause Graphite cleanup work to become confusing or
dangerous.

## Topology Mistakes

- Treating `gt ls` ASCII layout as authoritative ancestry.
- Calling a whole subtree a "leaf" because the visual is compressed.
- Counting only an ancestor spine instead of the full root subtree.
- Ignoring worktree occupancy before deleting Graphite branches.
- Assuming Git reachability proves squash-merged work was not represented.

## State Model Mistakes

- Treating PR state as accounting state.
- Marking the sink as "accounted" while the source remains unlabeled.
- Showing both default and inverse labels, such as "local" and "not remote",
  until labels become noise.
- Using "merged" for semantic supersession.
- Letting "reference" or "retain" become a terminal state without a concrete
  next action.

## Execution Mistakes

- Restacking unrelated live stacks while trying to clean one stack.
- Running broad `gt sync` in a multi-worktree repo when `--no-restack` is the
  intended safe refresh.
- Creating a recovery/adoption sink without a ledger of what it adopted.
- Deleting source branches before the sink landed or before explicit
  local-only supersession was accepted.
- Fixing product code while the active task is stack hygiene.
- Leaving obsolete scripts or "v1" paths alongside the new workflow.

## Recovery Signals

Stop and reframe when:

- every answer introduces a new stack or branch name but not a disposition;
- the same conflict resolution repeats across many branches;
- a branch is dirty and nobody can name its owner;
- inspection output disagrees with what Graphite displays;
- the next action would delete metadata from a branch without an allowlist;
- the stack is too large to submit and no consolidation map exists.

## Better Defaults

- Say "source stack", "adoption sink", "submit-ready", "cleanup-ready", or
  "restack-needed"; avoid vague temporal names like "old stack".
- Use semantic names next to raw branch names.
- Keep live owner lanes separate until intentionally restacked.
- Prefer broad-stroke simplification first, details at the end.
