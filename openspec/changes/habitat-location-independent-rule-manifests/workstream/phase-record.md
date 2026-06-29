# Phase Record: Habitat Location-Independent Rule Manifests

## State

- Status: planning/design phase reviewed and ready for commit.
- Worktree:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-habitat-authority-tree-pruning-frame`.
- Branch: `codex/habitat-location-independent-manifest-plan`.
- Parent: `codex/habitat-derived-packet-execution`.
- OpenSpec change:
  `openspec/changes/habitat-location-independent-rule-manifests`.

## Objective

Produce a reviewed, implementation-ready plan for making Habitat live rules
location-independent by turning `rule.json` into the explicit rule manifest:
stable identity, current placement, and runner file references live in the
manifest, while path and sibling files stop being hidden sources of authority.

## Authority Order

1. Direct current user instructions.
2. Root `AGENTS.md` and repo process docs.
3. `.habitat/FRAME.md` and `.habitat/dominoes.md`.
4. Current Habitat code/tests as evidence.
5. OpenSpec records as downstream implementation-control artifacts.

## Skills Applied

- `habitat:systematic-workstream`
- `dev:refactor-typescript`
- `cognition:solution-design`
- `cognition:system-design`
- `dev:api-design`
- `cognition:investigation-design`
- `civ7-open-spec-workstream`

## Current Evidence

- The branch starts from the completed derived-runner slice.
- Current live `rule.json` records do not include `id`, `title`, `placement`, or
  authored `runner`.
- Current registry loading enriches records from path and sibling files.
- Current Nx registry loading repeats that enrichment.
- Current baseline and artifact-routing code still parse packet grammar.
- The next authority-tree move needs rules to move without changing identity or
  behavior.

## Review Plan

First-wave review agents:

| Lane | Status | Required output |
| --- | --- | --- |
| Manifest/API contract | complete | No P1/P2 blockers after repair; residual baseline and placement risks recorded. |
| Current-code coupling | complete | Path/sibling dependencies, baseline roots, artifact routing, Nx, hooks, generators, tests, and closure scans recorded. |
| OpenSpec/workstream shape | complete | P2 findings repaired with validation matrix, repo-relative commands, and non-claims. |
| Refactor/system pressure | complete | Corpus ledger gate, selector boundary, compatibility-ladder guard, and exhaustive dispatch requirements recorded. |

Accepted P1/P2 findings block this planning branch until repaired or rejected
with source evidence.

## Validation Results

| Gate | Status | Evidence | Non-claims |
| --- | --- | --- | --- |
| `bun run openspec -- validate habitat-location-independent-rule-manifests --strict` | passed | Fresh command on this branch. | Does not prove implementation correctness. |
| `bun run openspec:validate` | passed | Fresh full OpenSpec validation on this branch. | Does not prove source behavior or future ontology authority. |
| `git diff --check` | passed | Fresh command on this branch. | Whitespace proof only. |

## Reset Contract

After this plan is finalized and committed, close this first-wave review team.
Implementation starts with fresh agents grounded in this OpenSpec change and
the then-current branch state.
