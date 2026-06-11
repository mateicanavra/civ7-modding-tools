# State Model

This skill uses a small state model so operators do not mix together Git facts,
Graphite facts, PR facts, human accounting, and action plans.

## Baseline Facts

Baseline facts are observed, not decided.

| Axis | Meaning | Source |
| --- | --- | --- |
| Git local | Local branch exists and points at a commit. | `git for-each-ref refs/heads` |
| Git remote | Matching remote branch exists. | `git for-each-ref refs/remotes/origin` |
| Worktree occupancy | A worktree has this branch checked out or detached at a head. | `git worktree list --porcelain` |
| Worktree dirtiness | Checked-out files differ from HEAD. | `git status --short --branch --porcelain=v1` |
| Graphite local tracking | Branch exists in Graphite cache/metadata. | `.git/.graphite_cache_persist` |
| Graphite parentage | Parent/children according to Graphite metadata. | Graphite cache branch metadata |
| Graphite restack display | Branch is marked by Graphite as needing restack. | `gt log short --no-interactive` |
| PR/submission | PR numbers, states, remote submission evidence. | Graphite PR cache, GitHub/Graphite APIs if available |

Display smart defaults. In a local stack view, "local branch exists" and
"Graphite-tracked locally" are usually default facts and do not need labels
unless absent. Show labels for meaningful deltas: dirty, detached, remote,
submitted/open PR, merged/closed PR, needs restack, untracked, or local-only.

## Accounting Overlay

Accounting is sparse and operator-authored. It records moves that matter for
cleanup or integration; it does not mirror every fact.

### Source-side states

| State | Meaning |
| --- | --- |
| `needs-adoption` | Known source work must be handled before cleanup. |
| `adopted` | Source work was incorporated into a sink. |
| `superseded` | Source work is intentionally replaced by another branch/stack. |
| `excluded` | Source work is intentionally not carried forward. |
| `reference-only` | Source remains useful as historical/context evidence, not as a merge target. |

### Sink-side states

| State | Meaning |
| --- | --- |
| `adoption-sink` | Destination branch/stack/mainline that receives accepted source intent. |

Do not use persistent half-states for partial adoption. If only part of a
source has moved, split the source into smaller branch or stack-slice endpoints
and record separate `needs-adoption`, `adopted`, `superseded`, or `excluded`
states for those slices.

Use explicit methods when known:

- `as-is`: source landed without semantic rewrite.
- `cherry-pick`: a commit or patch was replayed mechanically.
- `semantic`: behavior/intent was reimplemented or translated.
- `merge`: landed through the normal Graphite PR/merge path.
- `drop`: excluded intentionally.

## Actions

Actions are commands or decisions, not states.

| Action | When |
| --- | --- |
| `submit` | Branch/stack is ready to create/update PRs. |
| `merge` | Submitted PRs are ready to merge through Graphite. |
| `sync-no-restack` | Refresh remote/PR/prune state without opportunistic global restack. |
| `restack-targeted` | A kept stack must rebase onto updated trunk or parent. |
| `fold` | A branch should be absorbed into its parent. |
| `rename-before-submit` | A survivor branch needs a semantic name before PR creation. |
| `delete-graphite-branch` | A local branch and Graphite metadata are terminally retired. |
| `remove-worktree` | A checked-out worktree is stale or disposable and blocks cleanup. |

## Forbidden Conflations

- "Merged PR" is not the same as "source adopted" unless the merged PR is the
  accepted source of record.
- "Patch equivalent" is evidence, not disposition.
- "Local-only" is not bad by itself; it only becomes actionable after you know
  whether the branch is live, submit-ready, superseded, or disposable.
- "Needs restack" does not mean "safe to restack globally".
- "Leaf" must mean terminal branch in the Graphite parent tree. If a visible
  terminal item represents a subtree or mini-stack, name it as a subtree.
