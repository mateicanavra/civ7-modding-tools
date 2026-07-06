# Descent Workspace Shape

Status: reviewed draft (Opus review applied 2026-07-06); applied via readiness slice R5

Built: 2026-07-06

Owner: DRA Habitat authority-tree workstream steward

Purpose:
fix the physical shape of descent work under `.habitat/.active/` so that the
descent state machine is legible in the file tree itself: one container per
descent, one home per phase of the machine, one surface for the initiative
across descents, and one shared lane for the cross-descent rule ledger. The
test of this shape is monotonic repeatability — descent N+1 is opened by
generating the same structure and filling it, with no rewiring — and depth
legibility: standing in a folder tells you which state the descent is in, and
everything that state needs is concentrated there or linked by exact path.

What this document does not do:
it does not reorganize history, does not move any closed record, does not
touch `.habitat/` root authority (`scopes/`, `blueprints/`, niche lanes), and
does not authorize its own application. Application is readiness slice R5,
executed on the open stack while descent 002's container is still unmerged.

## Preserved Decisions

These existing rules stay, unchanged:

- `frames/` holds method frames; `workstreams/` holds work. The separation is
  load-bearing and correct.
- The initiative remains an umbrella objective, not a container directory
  (the `workstreams/README.md` operating rule). The initiative's one physical
  surface is `blueprint-descent-roadmap.md` at the workstreams root.
- `dominoes/` remains the historical record it already is.
- The shared rule-authority ledger and its receipts stay in
  `remediate-rule-authority/`. That lane owns the cross-descent rule corpus;
  no descent container copies it.

Descent 1 is not an instance of this shape:
descent 1 (`define-domain-blueprint-structure/`) used a prior slice-based
grammar — `slices/001-.../frame.md`, `slices/002-.../Decisions/`, a top-level
`decision-book/`, and closure/revalidation records filed in
`remediate-rule-authority/receipts/`. It is retained unmigrated as historical
evidence, not as a conforming example of this shape. This shape is a cleaner
design that descent 002 is the first to adopt. Do not read descent 1's tree as
the template; read it as the precedent that motivated the redesign.

## The Shape

One directory per descent, numbered for sortability and prefixed with the
`descend` verb:

```text
.habitat/.active/workstreams/descend-NNN-<subject>/
  frame.md          # states 1-2: container coordinates, boundaries, shape
                    #   assertion pointers, falsifiers; amended on law
                    #   correction or scope split (state 5)
  ledger.md         # states 3-4: the red corpus as rows with states; census
                    #   and probe evidence inlined in the rows it backs;
                    #   seeded at open, re-derived at execution open, live
                    #   during burn-down; every row visible through grouping
  decisions/        # state 6: one packet per nondeterministic destination;
                    #   packet carries its own evidence, options,
                    #   consequences, recommended default, ruling, seal target
  execution/        # states 7-9: the execution authorization plan, slice
                    #   records, burn-down and drift-repair records; large
                    #   evidence a slice needs lives beside it here
  receipts/         # states 10, 12: ratchet proof and closure receipts with
                    #   proof classes and non-claims
  ascent.md         # state 12: the next-move selection note; its landing
                    #   updates the roadmap and closes the container
```

Naming rule (verb-first ruling):
`descend` is the accepted verb for descent containers; it states the work
(descending blueprint authority into a selected scope). The `NNN` numeric
infix is intentional for cross-descent filesystem sortability and overrides
the usual verb-object container shape for this container class only. A future
steward must not "correct" `descend-002-...` back to `define-...` for
consistency; that would break the sortable-container scheme. This exception is
sealed here.

Law lives at the root, by design:
the enforced law object a descent produces — scope files, `structure.toml`,
Grit patterns — always lands under `.habitat/` root
(`.habitat/scopes/**`, `.habitat/blueprints/**`), never inside the container.
The container concentrates the descent *record* and links the law by exact
path. "Everything that state needs is concentrated here" means the record and
its exact-path links, not a copy of the rail.

State legibility rule:
the active phase of a descent is the deepest folder whose newest artifact is
still open. The ledger's row states are the cross-reference: rows waiting on
`needs decision` point into `decisions/`; rows with locked destinations point
into `execution/`; absorb/retire rows point at the shared ledger in
`remediate-rule-authority/` and are summarized at closure in `receipts/`.

Concentration rule:
work needed by a phase lives in that phase's home or is linked from it by
exact path. Census and probe evidence inlines in the artifact it backs (ledger
row or decision packet), matching both the concentration goal and descent
002's seed. There is no shared `evidence/` junk drawer; evidence too large to
inline lives beside the one slice that needs it under `execution/`.

## Folder-To-State Mapping

| Machine state (descent frame) | Home |
| --- | --- |
| 1 Container selected, 2 Shape asserted | `frame.md` (law text lands in `.habitat/scopes/**` and `.habitat/blueprints/**`; the frame points at it by exact path) |
| 3 Red exposed, 4 Red classified | `ledger.md`, evidence inline |
| 5 Law corrected or scope split | `frame.md` amendment + a `law correction` row in `ledger.md` |
| 6 Questions resolved | `decisions/` |
| 7 Execution authorized, 8 Burn-down, 9 Drift repaired | `execution/` |
| 10 Law ratcheted | `receipts/` (the descent's own ratchet proof) |
| 11 Rule surface reduced | `remediate-rule-authority/` (the shared rule ledger is mutated there; the descent links that mutation from `receipts/` and `ascent.md`) |
| 12 Closure and ascent | `receipts/` + `ascent.md` |

The one deliberate cross-lane seam:
state 11 (rule-surface reduction) mutates the shared cross-descent ledger
`remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json`, which
cannot live in a single descent's container. That mutation and its deletion
receipts stay in `remediate-rule-authority/`, exactly as descent 1 did. The
descent's container records *that* the reduction happened and links to it; it
does not hold the shared ledger. Every other state (1-10, 12) concentrates in
the container. This is the seam drawn by state, not by vibe.

## The Initiative Surface

Exactly one cross-descent tracker: `blueprint-descent-roadmap.md` at the
workstreams root, with a `container` column mapping every descent to its
physical home:

| Descent | Container |
| --- | --- |
| 001 domain root | `define-domain-blueprint-structure/` (prior grammar; retained historical, not an instance of this shape) |
| 002 domain-operation interior | `descend-002-domain-operation-interior/` |
| 003+ | `descend-NNN-<subject>/`, generated from this shape |

Two lanes feed a descent from outside its container, both by design:

- the shared rule ledger and rule-remediation receipts in
  `remediate-rule-authority/` (cross-descent; mutated at state 11);
- between-descent runway work — tooling gates, pre-adjudicated rule slices,
  record refreshes (the readiness plan's R-slices) — which is
  rule-remediation-lane work by nature and lives in `remediate-rule-authority/`.

The roadmap links to the active runway plan and to each descent container. No
third home.

## Opening Descent N+1

Generation is copying the shape, not copying content:

1. create `descend-NNN-<subject>/`;
2. write `frame.md` per the descent frame's Use Protocol (coordinates,
   boundaries, exterior, falsifier, proof gate, ascent condition);
3. write `ledger.md`, seeded from fresh censuses inlined in the rows;
4. open `decisions/` packets only for rows whose destination is
   nondeterministic;
5. add the roadmap row with the container path.

`execution/`, `receipts/`, and `ascent.md` are created by first use — git does
not track empty directories, so the shape defines them and the first artifact
of each phase creates them. No empty scaffolding is committed at open.

A physical skeleton directory is deliberately deferred: descent 002 is the
first descent to conform to this shape. Promote a generated skeleton (or a
`descend-NNN` script) only after descent 003 also opens cleanly by hand and
proves the copy is mechanical. One conforming descent is not yet evidence that
a template earns its maintenance.

## Application (readiness slice R5)

Readiness slice R5 applied this shape to descent 002 while its container was
still unmerged. The born-conformant container is now:

`descend-002-domain-operation-interior/`

Its tracked opening artifacts are `frame.md`, `ledger.md`, and `decisions/`.
`execution/`, `receipts/`, and `ascent.md` still come into being at first use,
not at shape application.

Descent 1, the rule-remediation records, frames, dominoes, and product
authority stay exactly where they are.

## Review Disposition

Opus review 2026-07-06 (SHIP-AFTER-REPAIRS) applied:

- states 10-12 seam resolved by state, not by folder: state 11 stays in
  `remediate-rule-authority/`; `revalidation/` folder dropped; `receipts/` +
  `ascent.md` hold the descent's own ratchet proof and closure (P1);
- descent 1 reframed as prior grammar, not an instance of this shape (P1);
- shared `evidence/` folder dropped; evidence inlines, matching both the
  concentration rule and descent 002's seed (P2);
- `descend-NNN` verb-first exception sealed explicitly (P2);
- `.habitat/` root law-object cross-link acknowledged in the concentration
  rule (P3);
- empty-folder count reconciled to created-by-first-use (P3);
- deferred-skeleton rationale corrected to one conforming descent, promote
  after 003 (P3).

Non-claims:
this shape governs `.habitat/.active/workstreams/` descent containers only. It
asserts nothing about `.habitat/` root authority topology, `docs/` placement,
or the internal shape of non-descent workstreams. It changes descent 002's
paths only; descent 1 is untouched, and shared-lane records are not moved or
semantically mutated beyond R5-required pointer updates and the R5 receipt.
