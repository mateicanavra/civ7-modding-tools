# Restack Planning

Treat a meaningful restack as a look-ahead workstream, not a reflex command.

## When To Restack

Restack when:

- a kept stack must absorb updated trunk/main;
- Graphite submit requires it;
- a mid-stack edit changed descendants;
- folding/consolidation is complete and the stack is submit-ready;
- an owner lane intentionally wants to rebase over newly landed work.

Avoid restack when:

- the stack is a retired source route;
- the worktree is dirty;
- the stack belongs to another active owner;
- you do not know whether source branches are adopted, superseded, or live;
- the target stack is huge and should be folded first.

## Look-Ahead Checklist

Before `gt restack`:

1. Refresh census with `gt sync --no-restack` and the census script.
2. Identify the exact stack top and direction (`--downstack` or `--upstack`).
3. Check dirty worktrees and branch occupancy.
4. Compare file overlap between the stack and updated trunk or neighboring
   stacks.
5. Use patch-overlap for suspected parallel implementations.
6. Read the relevant commit messages/docs/specs for files likely to conflict.
7. Name semantic authorities for conflicts: which side owns behavior, schema,
   domain boundary, tooling, or proof records?

## Conflict Resolution Rules

- Do not resolve by "ours/theirs" unless the conflict is truly mechanical.
- Preserve intentional behavior from the owning workstream.
- Translate stale config or API shapes into the current authoritative boundary.
- Do not reintroduce deprecated files or fields merely because incoming commits
  touched them.
- If a conflict repeatedly applies the same transformation, consider whether
  folding or a scripted rewrite is more efficient.
- If a branch adds code to an intentionally phased-out surface, either move it
  to the new owner immediately or record an explicit follow-up for that owner.

## Command Pattern

```bash
gt sync --no-restack --no-interactive
gt restack --branch <intended-top> --downstack --no-interactive
```

If conflicts occur:

1. Resolve the current conflict semantically.
2. Run focused validation for the touched surface when practical.
3. Continue the Graphite rebase.
4. Stop if conflicts reveal a wrong strategy, hidden owner lane, or stale source
   stack that should be folded or retired instead.

## Closure

After restack:

- `git status --short --branch` is clean.
- `gt ls --no-interactive` shows expected restack state.
- Any conflict resolutions are documented in the workstream record or PR body.
- No unrelated stack was restacked opportunistically.
