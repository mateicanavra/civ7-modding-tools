# <Decision Title> Workstream

Status: draft decision packet

This packet runs prework item `<N>` from
`../inventory.md`.

Decision:

```text
<copy the exact Decision line from inventory.md>
```

The controlling method is:

- `../frame.md`
- `../single-prework-decision-frame.md`

## Objective

Produce a row-level decision for every path, symbol, and collar covered by this
inventory item.

Accepted outcomes:

- qualified for Slice 001 with an exact destination and governing law;
- reference update required before execution, with the exact owner reference
  named;
- out of Slice 001, assigned to a named later owner-law domino;
- implementation-gated, with the exact reference update named before source
  movement;
- executable now through an execution slice tied to this packet;
- delete action with consumer proof.

## Authority Order

1. direct user decisions in the active session;
2. active `.habitat/scopes/**` scope, file, and pattern documents plus any
   scope/file/pattern documents still local to this workstream;
3. shared decision-book criteria in this workstream;
4. canonical Civ7 product and architecture authority;
5. current source, callers, tests, and generated/runtime evidence;
6. Git history and stale docs as explanatory evidence only.

Current location is evidence. Owner placement comes from authority plus source
relationships.

## Evidence Plan

Use only the evidence needed to answer the selected decision.

Required:

- selected inventory item;
- active scope/file/pattern docs that could govern the item;
- applicable decision-book entries;
- current source named by the item;
- exports, imports, callers, and adjacent consumers;
- product or architecture docs for plausible owners.

Add tool evidence when it affects the decision:

- Narsil MCP first for symbol, reference, caller, import, call-graph, and code
  history claims. Use repo id `civ7-modding-tools#2fa31857` unless `list_repos`
  reports a newer id; the server is expected to be up, indexed on the primary
  worktree, and tracking the latest stack state.
- Narsil Git lenses and local Git for historical usage, file history, blame,
  hotspots, and recent changes. Corroborate important history claims with local
  `git blame` or `git log --follow`.
- NX for project ownership, dependency shape, target availability, and runnable
  checks.
- KNIP unused-code evidence for deletion claims, with no fix
  mode and with limits recorded.
- Package-local tests or build checks when source behavior is in question.

## Team Lanes

The steward owns synthesis, write-back, and final decisions.

| Lane | Artifact | Output |
| --- | --- | --- |
| Authority Mapper | `corpus/architecture-authority.md` | Controlling owner criteria, source docs, non-owners, and authority gaps. |
| Source Mapper | `corpus/source-inventory.md` | Exact paths/symbols, exports, imports, callers, collars, and initial role tags. |
| Relationship Tracer | `evidence/relationship-evidence.md` | Narsil-first graph/caller/import evidence for ownership and liveness claims, corroborated by source/Git as needed. |
| Unused-Code Auditor | `evidence/unused-code-evidence.md` | Unused/dead-code findings, commands, limits, and interpretation. |
| Owner Classifier | `synthesis/disposition-table.md` | One disposition per row, with owner, action, evidence strength, and governing authority. |
| Fresh reviewers | `reviews/review-findings.md` | Findings on row coverage, invented destinations, weak evidence, and write-back readiness. |

Use fewer lanes when one steward can answer the decision cleanly. Keep the same
artifact boundaries even when one person fills several artifacts.

## Closure

This packet is closed when:

- `synthesis/disposition-table.md` covers every row in
  `corpus/source-inventory.md`;
- every row is fully resolved by exact destination, delete action,
  implementation-gated action, executable-now action, or explicitly tracked
  named later owner-law domino;
- raw evidence and interpretation are separated;
- review findings are accepted, rejected with evidence, or converted into
  packet edits;
- owning workstream references are updated.

Untracked deferrals are not closure. If a row is deferred, the later domino must
be written to the owning inventory, packet, or later-slice reference.

## Write Boundary

This packet writes active Habitat authority material under this decision
directory. Source migration, deletion, `structure.toml`, Grit packets, and
runtime code changes belong to later execution slices unless the user explicitly
selects this packet as an implementation slice.
