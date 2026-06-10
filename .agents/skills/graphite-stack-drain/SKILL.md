---
name: graphite-stack-drain
description: |
  Use when managing complex Graphite stacks, worktrees, branch accounting, folding/consolidation, restacking, submit/merge drain loops, and cleanup across local stack topologies. This skill is generic: it is for Git + Graphite repositories, not Civ7-specific product decisions.
---

# Graphite Stack Drain

## Purpose

Use this skill when the problem is not "make one code change", but "make the
Graphite topology sane": many worktrees, stale or superseded source stacks,
local-only stacks, over-atomized branch chains, partial adoption/recovery
branches, PR/status confusion, or risky cleanup after merges.

The skill's job is to keep three things separate:

- **Facts**: Git refs, worktrees, Graphite cache parentage, Graphite restack
  markers, origin refs, and PR/submission diagnostics.
- **Accounting**: explicit operator-authored moves such as "this source branch
  was adopted by that sink branch", "this work was superseded", or "this branch
  is excluded by decision".
- **Actions**: submit, merge, sync, fold, restack, rename, delete, or remove a
  worktree.

Do not use this skill as a general Git tutorial, a product-domain authority, or
a reason to perform global restacks. It composes with repo-specific Graphite
docs and domain skills.

## Core Invariants

<invariants>
<invariant name="deterministic-census-first">Capture Graphite/Git/worktree state before mutating stack topology. Do not rely on bottom-anchored ASCII diagrams as the only source of truth.</invariant>
<invariant name="dirty-worktrees-gate-mutation">Dirty or ownership-ambiguous worktrees block sync, restack, fold, submit, delete, and cleanup unless changes are committed, parked, or explicitly excluded.</invariant>
<invariant name="facts-are-not-accounting">PR state, patch overlap, and Git reachability are diagnostics. They do not become source/sink accounting unless an operator records a move.</invariant>
<invariant name="source-and-sink-labels-differ">Label the source as adopted/superseded/excluded/reference. Label the destination as the adoption sink. Do not mark only the destination as "accounted".</invariant>
<invariant name="sync-no-restack-default">In multi-worktree or multi-agent repos, default to `gt sync --no-restack`; run targeted restacks only for stacks you intend to keep or submit.</invariant>
<invariant name="native-drain-first">For submit-ready stacks, use Graphite publish/merge/sync/prune behavior before manual deletion. Manual deletion is an allowlisted cleanup path, not the normal drain loop.</invariant>
<invariant name="fold-large-local-only-stacks">For very large local-only stacks, consolidate into semantic survivor branches before publishing, then run a targeted submit-readiness restack.</invariant>
<invariant name="retire-only-after-disposition">Do not delete source branches because they look old. Delete after merge, explicit supersession/adoption, exclusion, or terminal reference disposition is recorded.</invariant>
</invariants>

## Standard Workflow

1. **Frame the stack problem**: name the target stacks, non-target owner lanes,
   cleanup goal, and stop conditions.
2. **Run a stack census**: capture worktrees, dirty state, Graphite cache
   parentage, displayed restack markers, branch refs, origin refs, and PR
   diagnostics.
3. **Classify topology**: root stacks, splits, leaves, subtree leaves, local-only
   chains, submitted/open stacks, merged/closed/pruned candidates, and
   untracked branches.
4. **Compose accounting**: record explicit source-to-sink moves or terminal
   dispositions; keep accounting sparse and intentional.
5. **Choose the lane**:
   - submit-ready support stack: drain through Graphite;
   - stale source stack: adopt/supersede/exclude, then retire after sinks land;
   - large local-only stack: fold into semantic survivor branches before submit;
   - live owner stack: restack only with owner-aware look-ahead.
6. **Execute with Graphite-native commands**: fold, rename, targeted restack,
   submit, merge, sync, delete.
7. **Close cleanly**: clean worktrees, refreshed census, updated accounting,
   no stale branches left unexplained.

## Reference Map

| Reference | Open When |
| --- | --- |
| `references/state-model.md` | You need the vocabulary for facts, accounting, actions, and states. |
| `references/deterministic-inspection.md` | You need a repeatable snapshot or need to reconcile `gt ls` with Graphite metadata. |
| `references/drain-loop.md` | A stack is ready to submit/merge/prune through Graphite. |
| `references/folding-and-consolidation.md` | A local-only stack is too large or too atomized to submit as-is. |
| `references/restack-planning.md` | A stack needs restack and conflicts may require semantic resolution. |
| `references/cleanup-and-retirement.md` | You need to remove worktrees, delete Graphite branches, or retire source stacks. |
| `references/worktree-hygiene.md` | Worktree occupancy, dirtiness, or removal is part of the cleanup decision. |
| `references/adversarial-review-lanes.md` | A large drain/restack needs independent review for accuracy, clarity, quality, and operational usefulness. |
| `references/failure-patterns.md` | The work is getting confusing, circular, or overly manual. |

## Script Map

Scripts are intentionally small, JSON-first helpers. They are not a replacement
for the richer repo-local visualizer if one exists.

| Script | Purpose |
| --- | --- |
| `scripts/graphite-stack-census.mjs` | Read Git + Graphite cache facts and emit stack/root/split/leaf/worktree JSON. |
| `scripts/patch-overlap.mjs` | Compare two branches for ahead/behind, patch-equivalent commits, and file overlap. |
| `scripts/accounting-compose.mjs` | Validate a sparse accounting ledger and project source/sink labels onto a census. |

## Command Defaults

```bash
# Safe refresh in a parallel repo
gt sync --no-restack --no-interactive

# Submit-ready drain loop
gt ss --publish --ai --stack --no-interactive
gt merge --no-interactive
gt sync --no-restack --no-interactive

# Targeted restack only for the stack you intend to keep
gt restack --branch <top-branch> --downstack --no-interactive

# Fold the current branch into its parent
gt branch fold --no-interactive
```

## Quality Bar

Before making a closure claim, you should be able to answer:

- Which current facts came from Git, Graphite cache, `gt log short`, origin, PR
  diagnostics, or worktree status?
- Which accounting moves are operator-authored, and where are they recorded?
- Which branches are submit-ready, cleanup-ready, restack-needed, or explicitly
  out of scope?
- Which worktrees were removed or preserved, and why?
- Which stacks were intentionally not restacked because they are live owner
  lanes or retirement targets?

## Skills Used With This Skill

- `graphite`: command-level Graphite behavior and repo-specific Graphite docs.
- `git-worktrees`: worktree creation/removal, branch occupancy, and dirtiness.
- `framing-design` or equivalent: hard core, exterior, stop conditions.
- `team-design` or equivalent: adversarial review lanes for large restacks.
- Repo-specific product/domain skills: only when conflict resolution needs
  domain ownership, not for generic stack mechanics.
