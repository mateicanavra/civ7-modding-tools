# Descent Workspace Shape

Status: active container grammar; descent 002 is the first conforming instance

Owner: DRA Habitat authority-tree workstream steward

Purpose: make the descent state machine legible in the file tree. One
container owns one descent, each phase has one home, the initiative has one
cross-descent roadmap, and cross-descent rule state remains in one shared
ledger lane.

This shape governs records under `.habitat/.active/workstreams/`. Enforced law
continues to live under `.habitat/scopes/**` and
`.habitat/blueprints/**`. It does not move closed history or authorize any
descent by itself.

## Preserved Boundaries

- `frames/` owns reusable method; `workstreams/` owns active work.
- `blueprint-descent-roadmap.md` is the single cross-descent selection surface.
- `dominoes/` remains historical.
- `remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json` remains
  the shared active rule corpus. A descent references it; it never copies it.
- Descent 001 keeps its prior slice grammar as historical evidence. It is not
  the template for later descents.

## Container Grammar

```text
.habitat/.active/workstreams/descend-NNN-<subject>/
  frame.md
  ledger.md
  decisions/
  execution/       # created by first use
  receipts/        # created by first use
  ascent.md        # created by first use
```

`descend` is the sealed verb for this container class. The numeric infix makes
cross-descent order explicit. Empty phase directories are not committed.

The container concentrates the record and exact links to live law; it never
duplicates scope files, patterns, manifests, or shared ledgers. Evidence is
inlined in the row or decision it supports. Large execution evidence lives
beside the one execution slice that uses it, not in a shared evidence drawer.

## State-To-Home Mapping

| Descent state | Authoritative home |
| --- | --- |
| 1 Container selected; 2 Shape asserted | `frame.md`, with exact links to law under `.habitat/scopes/**` and `.habitat/blueprints/**` |
| 3 Red exposed; 4 Red classified | `ledger.md` |
| 5 Law corrected or scope split | `frame.md` amendment plus a classified ledger row |
| 6 Questions resolved | separate records in `decisions/` |
| 7 Execution authorized; 8 Burn-down; 9 Drift repaired | `execution/`, created by first use |
| 10 Law ratcheted | `receipts/`, created by first use |
| 11 Rule surface reduced | shared `remediate-rule-authority/` ledger and records |
| 12 Closure and ascent | `receipts/` plus `ascent.md`, then roadmap update |

The deepest phase with an open artifact tells a reader where the descent is.
Ledger row states cross-reference the phase: nondeterministic rows point to a
decision; locked rows point to execution when it exists; proxy-rule reduction
points to the shared ledger.

## The Shared-Ledger Seam

State 11 deliberately crosses the container boundary. Rule retirement and
absorption mutate the cross-descent cleanup ledger because no single descent
owns the whole rule corpus. The descent receipt links that mutation and the
ascent summarizes it. States 1-10 and 12 stay inside the descent container.

This is a state-owned seam, not permission to create a second tracker.

## Opening A Descent

1. Create `descend-NNN-<subject>/`.
2. Write `frame.md` with coordinates, boundary, target assertion, exterior,
   falsifiers, proof gate, and ascent condition.
3. Write `ledger.md` from a fresh current-tree census.
4. Open separate decision records only for genuinely nondeterministic
   destinations.
5. Add or update the roadmap row.

`execution/`, `receipts/`, and `ascent.md` appear only when those states are
entered. Do not add empty scaffolding, a second disposition database, or a
generated workspace template. Reconsider a template only after another
descent proves this shape repeats mechanically.

## Descent 002 Application

The first conforming container is:

`descend-002-domain-operation-interior/`

At the split boundary it contains only:

- `frame.md`, the settled target and limits;
- `ledger.md`, a dated current-tree seed that must be re-derived;
- `decisions/001-004`, preserving evidence, alternatives, and later rulings.

It contains no execution authorization, live violation corpus, receipt, or
ascent claim. Those artifacts are created by their first real state
transition, after the sibling A.2 branch exists.

## Graphite Boundary

The split-ready tip is one common parent. A.2 and independent product work use
ordinary sibling Graphite children. Branch movement is dependency-driven: only
the first unique continuation branch moves above A.2 when a concrete
dependency requires it.

This rule describes ancestry, not another descent phase. No branch diary or
parallel-work tracker belongs in the container.

Non-claims: this grammar says nothing about product topology, `docs/`
placement, non-descent workstreams, or the internal implementation of Habitat
authority. Those are owned by their respective routers and laws.
