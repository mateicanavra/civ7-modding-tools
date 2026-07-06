# Descent Workspace Shape

Status: draft for review; applied only via the readiness plan's shape slice

Built: 2026-07-06

Owner: DRA Habitat authority-tree workstream steward

Purpose:
fix the physical shape of descent work under `.habitat/.active/` so that the
descent state machine is legible in the file tree itself: one container per
descent, one folder per phase of the machine, one surface for the initiative
across descents. The test of this shape is monotonic repeatability — descent
N+1 is opened by generating the same structure and filling it, with no
rewiring — and depth legibility: standing in a folder tells you which state
the descent is in, and everything that state needs is concentrated there.

What this document does not do:
it does not reorganize history, does not move any closed record, does not
touch `.habitat/` root authority (`scopes/`, `blueprints/`, niche lanes), and
does not authorize its own application. Application is a readiness-plan slice
executed after this draft passes review.

## Preserved Decisions

These existing rules stay, unchanged:

- `frames/` holds method frames; `workstreams/` holds work. The separation is
  load-bearing and correct.
- The initiative remains an umbrella objective, not a container directory
  (the `workstreams/README.md` operating rule). The initiative's one physical
  surface is `blueprint-descent-roadmap.md` at the workstreams root.
- Workstream directories use verb-first names.
- `dominoes/` remains the historical record it already is.
- Closed and historical records stay where they closed. Descent 1's records
  under `define-domain-blueprint-structure/` and the rule-remediation records
  under `remediate-rule-authority/` are not migrated; the roadmap maps
  descents to their physical homes.

## The Shape

One directory per descent, numbered for sortability and named verb-first for
the subject:

```text
.habitat/.active/workstreams/descend-NNN-<subject>/
  frame.md          # states 1-2: container coordinates, boundaries, shape
                    #   assertion pointers, falsifiers; amended on law
                    #   correction or scope split (state 5)
  ledger.md         # states 3-4: the red corpus as rows with states; seeded
                    #   at open, re-derived at execution open, live during
                    #   burn-down; every row visible through grouping
  evidence/         # lane outputs backing ledger rows and decisions:
                    #   censuses, probes, capability checks; dated, read-only
                    #   once written
  decisions/        # state 6: one packet per nondeterministic destination;
                    #   packet carries evidence, options, consequences,
                    #   recommended default, ruling, seal target
  execution/        # states 7-9: the execution authorization plan, slice
                    #   records, burn-down and drift-repair records
  revalidation/     # states 10-11: ratchet proof, post-ratchet rule
                    #   revalidation, rule-surface reduction records
  receipts/         # state 12: closure receipts with proof classes and
                    #   non-claims
  ascent.md         # state 12: the next-move selection note; its landing
                    #   updates the roadmap and closes the container
```

State legibility rule:
the active phase of a descent is the deepest folder whose newest artifact is
still open. The ledger's row states are the cross-reference: rows waiting on
`needs decision` point into `decisions/`; rows with locked destinations point
into `execution/`; absorb/retire rows point into `revalidation/`.

Concentration rule:
work needed by a phase lives in that phase's folder or is linked from it by
exact path. An agent dropped into `decisions/002-*.md` must find the question,
the evidence, the options, and the seal target without leaving the packet
except by the links it carries.

## Folder-To-State Mapping

| Machine state (descent frame) | Home |
| --- | --- |
| 1 Container selected, 2 Shape asserted | `frame.md` (law text itself lands in `.habitat/scopes/**` and `.habitat/blueprints/**`; the frame points at it) |
| 3 Red exposed, 4 Red classified | `ledger.md` + `evidence/` |
| 5 Law corrected or scope split | `frame.md` amendment + a `law correction` row in `ledger.md` |
| 6 Questions resolved | `decisions/` |
| 7 Execution authorized, 8 Burn-down, 9 Drift repaired | `execution/` |
| 10 Law ratcheted, 11 Rule surface reduced | `revalidation/` |
| 12 Closure and ascent | `receipts/` + `ascent.md` |

## The Initiative Surface

Exactly one cross-descent tracker: `blueprint-descent-roadmap.md` at the
workstreams root. It gains a `container` column mapping every descent to its
physical home:

| Descent | Container |
| --- | --- |
| 001 domain root | `define-domain-blueprint-structure/` (historical grammar; closed records stay put) |
| 002 domain-operation interior | `descend-002-domain-operation-interior/` |
| 003+ | `descend-NNN-<subject>/`, generated from this shape |

Runway work between descents (tooling gates, pre-adjudicated rule slices,
record refreshes) is rule-remediation-lane work by nature and stays in
`remediate-rule-authority/` with its ledger and receipts. The roadmap links
to the active runway plan; the runway plan links back. No third home.

## Opening Descent N+1

Generation is copying the shape, not copying content:

1. create `descend-NNN-<subject>/` with `frame.md`, `ledger.md`, and the five
   empty phase folders;
2. fill `frame.md` per the descent frame's Use Protocol (coordinates,
   boundaries, exterior, falsifier, proof gate, ascent condition);
3. seed `ledger.md` from fresh censuses recorded under `evidence/`;
4. open `decisions/` packets only for rows whose destination is
   nondeterministic;
5. add the roadmap row with the container path.

A physical skeleton directory is deliberately deferred: two conforming
descents are not yet evidence that a template directory earns its
maintenance. If opening descent 003 by hand feels mechanical enough to
script, promote this section into a skeleton then.

## Application (becomes a readiness-plan slice)

Because descent 002's container was created this week on a not-yet-merged
branch, it can be made born-conformant at zero migration cost:

1. rename `define-domain-operation-blueprint-structure/` to
   `descend-002-domain-operation-interior/`;
2. rename `opening-frame.md` to `frame.md`, `row-ledger-seed.md` to
   `ledger.md`, `decision-packets/` to `decisions/`;
3. create empty `evidence/`, `execution/`, `revalidation/`, `receipts/` as
   they gain their first artifact (git does not track empty directories; the
   shape defines them, first use creates them);
4. update the workstreams `README.md` row, the roadmap's container column,
   and the transition-anchor pointer to the renamed paths;
5. update internal cross-references in the renamed files.

Nothing else moves. Descent 1, remediation records, frames, dominoes, and
product authority stay exactly where they are.

## Review Focus

- Does the folder-to-state mapping cover all twelve states without a junk
  drawer?
- Does the shape collide with any existing operating rule
  (initiative-not-a-directory, verb-first naming, frames-vs-workstreams)?
- Is the migration honestly zero-cost (only unmerged content renames plus
  pointer updates)?
- Would descent 003 open by generation with no rewiring?
- Is anything here process for its own sake — a folder that no state
  produces artifacts for?

Non-claims:
this shape governs `.habitat/.active/workstreams/` descent containers only.
It asserts nothing about `.habitat/` root authority topology, `docs/`
placement, or the internal shape of non-descent workstreams.
