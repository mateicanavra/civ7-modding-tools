# Worktree Hygiene

Worktrees are often the difference between a clean Graphite drain and a
confusing local state explosion.

## Facts

- A worktree is a checkout, not branch ownership.
- A branch can be checked out in only one worktree at a time.
- Removing a worktree removes the directory, not the branch or Graphite
  metadata.
- Dirty worktrees can hide user work, generated artifacts, conflict leftovers,
  or another agent's active lane.

## Pre-Mutation Gate

Before any Graphite mutation:

```bash
git worktree list --porcelain
git status --short --branch
```

For every in-scope worktree, answer:

- Which branch is checked out?
- Is it dirty?
- Is it detached?
- Is it part of the target stack, a protected adjacent owner lane, or unrelated
  clutter?
- Would it pin a branch Graphite wants to prune/delete?

## Cleanup Choices

| Situation | Action |
| --- | --- |
| Clean disposable worktree on an already-retired branch | `git worktree remove <path>` |
| Dirty worktree with relevant WIP | Commit, stash with explicit message, or hand off before mutation. |
| Dirty generated artifacts only | Prefer regenerate/clean through repo scripts or stash if owner accepts. |
| Worktree owned by another active lane | Do not remove; coordinate. |
| Branch deletion blocked by checkout | Remove/move the worktree only after dirty/ownership checks. |

Use `git worktree remove --force` only when you have already inspected dirty
state and know no wanted work will be lost.

## Closure

At the end of a drain or cleanup:

```bash
git worktree list --porcelain
git status --short --branch
gt log short --no-interactive
```

Report:

- remaining worktrees and dirty counts;
- branches merged/drained;
- branches intentionally kept live;
- branches retired/deleted;
- any branch still pinned by a worktree.
