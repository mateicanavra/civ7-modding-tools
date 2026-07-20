# Planning Prerequisite And Retirement Audit 01

Status: closed; decisions accepted for semantic repair and serialized execution

Audit snapshot: 2026-07-09T20:28:39-04:00

## Assignments

| Lane | Agent/session | State | Owned lens |
| --- | --- | --- | --- |
| merge-before-restack candidates | Banach (`019f4966-002c-7262-a153-817c9b6c6a69`) | closed | Foundry, token, environment branch/PR/topology readiness |
| authorized retirement safety | Ramanujan (`019f4966-0281-72d1-815d-bc5486106352`) | closed | breakpoint and Earth-physics branch uniqueness, descendants, PRs, and deletion scope |
| readiness sequencing | Feynman (`019f4966-0120-7ed1-9a00-977bc1c6eeff`) | closed | readiness-stack validity, conflicts, and pre/post-Studio ordering |

All lanes were read-only. No agent changed files, refs, worktrees, Graphite, or
GitHub state.

## Accepted Decisions

### Pre-integration trunk cohort

| Branch | Observed tip/tree | Role | Decision |
| --- | --- | --- | --- |
| `codex/fix-local-environment-setup` | `dd335022965c` / `3819acdf1b8b` | hard operational prerequisite | close branch-local review and verification, submit, and merge before Studio source-history mutation |
| `codex/civ7-modding-foundry-architecture-draft` | `bf7b9f2519af` / `85bb423ad3bf` | hard future-authority prerequisite | select as the only Foundry sink because it is the main-root one-commit branch |
| `studio-ui-token-oklch` | `7cb8043348a4` / `db85a8613cca` | desired trunk stabilization | close its own outstanding live gate, then merge before the Stage 2 integration checkpoint so later browser review is not invalidated |

The environment and Foundry branches are independent semantic siblings.
Environment-first is an operational sequencing preference because it repairs
fresh-worktree/Habitat bootstrap before the remaining branch verification. The
token branch is not a Studio product dependency, but the accepted decision to
merge it makes it part of the exact refreshed-main checkpoint consumed by this
workstream.

`codex/civ7-foundry-target-authority@9f2e715fe1` has the same patch id
`eaa4f62833a4c220dbd877f1e81d591dc6d73f34` and identical three changed blobs
as the main-root Foundry sink. It remains an opening source/reference until
Stage 0 recovery and later source accounting permit retirement. It is never the
merge sink because doing so would also merge the runtime stack beneath it.

### Authorized retirement cohort

| Branch | Tip/tree | Unique branch-owned work | Decision |
| --- | --- | --- | --- |
| `codex/mapgen-breakpoint-explorer` | `fd53ac11bf92` / `5de8a605` | one unaccepted commit; patch id `baad7fe0` | delete locally through Graphite; no PR/remote exists |
| `codex/earth-physics-mapgen-foundation-investigation` | `7cce44db15e1` / `a8dcc2b5` | two unaccepted commits: `51a8f239c7b6`, `7cce44db15e1` | delete locally through Graphite; no PR/remote exists |

Neither branch has a worktree, Graphite descendant, remote branch, PR, accepted
consumer, or unique content admitted by the Studio workstream. Deletion is an
intentional discard of unaccepted investigation work, not evidence that it was
merged or superseded.

### Parked cohorts

- `studio_runner_parked` remains untouched and is already ancestral to `main`.
- `codex/readiness-final-aggregate-proof-green` and PRs `#2036` through `#2043`
  remain parked until the complete Studio sink stack is merged. Their current
  111-rule aggregate state predates the Studio/Habitat changes, the final local
  commit is not submitted, and the two stacks have real semantic conflicts in
  Grit provider/runtime files. After Studio merge, the readiness stack must be
  target-restacked, reconciled against the merged implementation, reverified,
  reviewed, and only then merged bottom to top.

## Mutation And Merge Constraints

- Serialize every Graphite/GitHub mutation under the global lease.
- Do not restack or rewrite any of the 13 opening Studio source refs before
  Stage 0 recovery is verified.
- The planning layer may be created as a new child of the unchanged opening tip;
  it must not restack that ancestry.
- Branch-local verification and review precede submission. Draft/mergeable with
  no checks or reviews is not merge readiness.
- After the accepted pre-integration cohort merges, detach or remove only its
  clean dedicated worktrees, then run one `gt sync --force --no-restack` from a
  clean primary checkout. Never adopt or clean unrelated dirty worktrees.
- Bind the workstream to final merged commits/trees and final handoff digest,
  not the provisional tips in this audit.

## Resume Consequence

This audit changes the digest-bound dependency graph and source/sink accounting.
After the trunk cohort and retirement cohort reach their intended states, repair
the semantic documents with actual terminal identities, run fresh affected
review lanes, and acquire a new semantic supervisor digest before committing
the planning layer.
