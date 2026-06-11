# Stack Drain Loop

Use the drain loop for a stack that is submit-ready or close to submit-ready.
Do not use it to force-clean live owner stacks or source stacks that were only
semantically adopted elsewhere.

## Preconditions

```bash
git status --short --branch
git branch --show-current
git worktree list --porcelain
gt sync --no-restack --no-interactive
gt ls --no-interactive
gt submit --dry-run --stack --branch <top-branch> --no-interactive
```

Resolve dirty worktrees and restack blockers before claiming the stack is
submit-ready.

## Canonical Loop

The RAWR loop is:

```bash
gt ss --publish --ai --stack --no-interactive
gt merge --no-interactive
gt sync --no-restack --no-interactive
gt ls --no-interactive
```

Repeat until the intended branches are merged and Graphite has pruned merged
local branches.

## What Not To Do During A Drain

- Do not restack after every single lower branch merge just because the stack is
  changing. Let Graphite merge/prune and then inspect.
- Do not run plain `gt sync` in a multi-worktree repo unless you intentionally
  want opportunistic restacks.
- Do not use manual `git branch -D` as the normal cleanup path.
- Do not globally restack unrelated stacks to "make the world current".

## Batching

If Graphite or review policy limits stack size:

1. Submit a bounded batch from the lower part of the stack or from the current
   top, according to Graphite's command behavior and repo convention.
2. Merge the submitted batch.
3. `gt sync --no-restack`.
4. Re-inspect before the next batch.

For very large local-only stacks, prefer folding/consolidation before creating
hundreds of PRs.

## Exit Criteria

- The intended stack branches are merged or have explicit terminal disposition.
- `gt ls` no longer shows stale merged branches that Graphite can prune.
- No relevant worktree remains dirty or pinned to a branch we intended to clean.
- The accounting ledger no longer marks those source branches as pending.
