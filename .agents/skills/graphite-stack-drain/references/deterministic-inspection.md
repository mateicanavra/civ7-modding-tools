# Deterministic Inspection

Run inspection before stack mutation and after each major cleanup/drain phase.

## Minimum Capture

```bash
git status --short --branch
git worktree list --porcelain
gt sync --no-restack --no-interactive
gt log short --no-interactive
node .agents/skills/graphite-stack-drain/scripts/graphite-stack-census.mjs \
  --repo-root "$PWD" \
  --output /tmp/graphite-stack-census.json
```

The census script reads:

- Git common dir and top-level path.
- `.git/.graphite_cache_persist` for Graphite branch metadata and parentage.
- `.git/.graphite_pr_info` when available.
- Local and origin refs.
- Worktree occupancy and dirtiness.
- `gt log short --no-interactive` only for Graphite's displayed
  `needs restack` marker.

## Why Not Parse `gt ls` As Topology?

`gt ls` is useful for humans and for Graphite's displayed restack marker, but
its bottom-anchored ASCII drawing can make separate root stacks look like one
giant nested stack. Use Graphite cache parentage as the topology source, then
use `gt ls` as display evidence.

## Root Stack Terms

- **Root stack**: a Graphite-tracked branch whose parent is trunk, usually
  `main`. Traverse its children to get the stack/subtree.
- **Split**: a branch with more than one Graphite child.
- **Leaf**: a branch with no Graphite children.
- **Subtree leaf**: a terminal branch inside a root stack's subtree. Do not call
  a whole visible mini-stack a leaf.
- **Outside root model**: a cached branch that is not reachable from a trunk
  child; investigate before cleanup.

## Inspection Questions

Answer these before mutation:

1. Which worktrees are dirty, detached, or occupying branches we want to delete?
2. Which root stacks are live owner lanes, support stacks, source stacks,
   recovery/adoption sinks, or tooling lanes?
3. Which branches have PR evidence, remote refs, local-only status, or restack
   markers?
4. Which splits/leaves are real subtrees versus merely display artifacts?
5. Which source branches have explicit accounting moves, and which are still
   unaccounted?

## Patch Overlap Checks

Use patch overlap when stacks look parallel or one may have superseded another:

```bash
node .agents/skills/graphite-stack-drain/scripts/patch-overlap.mjs \
  --repo-root "$PWD" \
  --left <branch-a> \
  --right <branch-b> \
  --output /tmp/patch-overlap.json
```

Interpretation:

- High patch equivalence suggests mechanical duplication or replay.
- High file overlap with low patch equivalence suggests semantic conflict or
  independent implementation.
- Commit timing helps decide whether one stack took over from another.

Patch overlap is evidence. It is not automatic accounting.
