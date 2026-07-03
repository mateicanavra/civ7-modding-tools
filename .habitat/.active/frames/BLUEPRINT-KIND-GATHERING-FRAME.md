# Blueprint Kind Gathering Frame

Status: normative method frame for affirming one blueprint kind and gathering
its whole-rule authority

Built: 2026-06-30

Owner: DRA Habitat authority-tree workstream

Durability: standalone reference for agents deciding whether a candidate
constructible kind should be affirmed and then used as a destination during the
same bounded authority-tree slice.

## Frame Identity

Frame name: Blueprint Kind Gathering

For situation: current Habitat packets contain a likely constructible kind,
but the rules that should govern that kind are scattered across candidate
`_blueprints/`, niche `rules/`, context lanes, and `_remainder/` pockets.

Mode: frame-discovery

Object-path: problem

## Scope And Provenance

In scope:

- One proposed blueprint kind at a time.
- Source-backed affirmation or rejection of that kind as a constructible kind.
- Physical creation of the top-level blueprint lane only after the kind passes
  the blueprint tests.
- Systematic gathering of whole-rule authority that belongs to every valid
  instance of the affirmed kind.
- Bounded evidence pockets named by the active slice plus source-obvious
  adjacent pockets. "Bounded" does not mean whole-corpus search.
- Sibling or touched-row passes inside the bounded slice when nearby candidate
  labels could become false sibling destinations or hide rows that should move
  with the affirmed kind.
- Physical demotion of non-fitting evidence to the smallest honest niche
  `rules/` or `_remainder/` lane.
- Disposition receipts that match the final tree.

Out of scope:

- Whole-corpus classification.
- Creating blueprint hierarchy, inheritance, or cascade semantics.
- Creating capabilities, admission records, final instance manifests, or final
  projection surfaces.
- Promoting every candidate under `_blueprints/` in the selected niche.
- Cleanup-first rule rewrites, splits, consolidation, or retirement.
- Treating current folder labels, packet labels, runner labels, defect labels,
  or artifact names as ontology.

Source pointers:

- Direct user decision: use `mod-map` as the next likely seed kind while
  avoiding premature sibling kinds.
- `.habitat/AUTHORITY-ONTOLOGY.md` for blueprint, instance, capability, and
  niche concepts.
- `.habitat/AUTHORITY-TREE-SHAPE.md` for top-level `blueprints/`,
  niche-local `_blueprints/`, `rules/`, and `_remainder/` lane semantics.
- `.habitat/.active/frames/AUTHORITY-SLICE-FRAME.md` for bounded kind-family slice work.
- `.habitat/.active/frames/AUTHORITY-REMAINDER-SLICE-FRAME.md` for contextual remainders.
- `.habitat/.active/frames/NICHE-LANE-SHAPING-FRAME.md` for the contrasting method
  where child holding lanes must be shaped before kind extraction.
- `.habitat/.active/frames/DESTINATION-SIMPLIFICATION-FRAME.md` for the immediate
  big-swing destination sequence and the dependency-tag before artifact
  ordering.
- `.habitat/.active/dominoes/README.md`, `.habitat/.active/dominoes/index.md`,
  and `.habitat/.active/dominoes/items/` for active sequence and completed
  receipts.
- Current `.habitat/**/rule.json` manifests as evidence, not ontology.
- Current source tree as constructibility and ownership evidence.

## WHAT

This frame treats a candidate constructible kind as the unit of analysis. It
first asks whether the kind itself is real enough to become top-level
blueprint authority. If yes, the same workstream uses that new destination to
gather every bounded rule whose whole meaning applies to every valid instance
of the kind. It also inspects sibling and touched rows that could falsely
become neighboring blueprints, because admitting one real destination should
reduce adjacent state space rather than leave misleading candidates in place.
Evidence that does not fit the kind is not forced into the blueprint; it is
moved or retained in the smallest honest niche `rules/` or `_remainder/` lane
so the tree shows what was affirmed, what stayed contextual, what was demoted,
and what remains unresolved.

## WHY

Some pockets cannot be sorted honestly until a missing kind destination exists.
If the work only shapes child niche lanes, candidate blueprint evidence remains
parked. If the work only promotes current `_blueprints/` folders, it preserves
candidate labels as ontology. This frame creates the missing kind destination
only when source evidence passes the constructible-kind tests, then immediately
uses that destination to reduce scattered state. The rejected alternative is a
broad `_blueprints` campaign, which would flatten dependency order and turn
several maybe-kinds into accepted ontology before their rules prove them.

## Construction History

Structural alternative considered: global `_blueprints/` adjudication.

Why rejected or demoted: global adjudication would mix many unrelated
candidate kinds and reproduce the broad-corpus snapshot failure. It would also
make weak candidates look equivalent to strong constructible kinds.

Structural alternative considered: map every row in a candidate pocket to
blueprint, rules, or `_remainder` without first affirming a kind.

Why rejected or demoted: without the missing destination, rows that are
actually kind authority can only be parked or mislabeled. The next slice would
then have to rediscover the same kind pressure.

Structural alternative considered: create multiple plausible sibling
blueprints in advance.

Why rejected or demoted: premature sibling destinations increase state space
and invite agents to sort by name fit. Only the kind whose constructibility is
already strong enough should be affirmed in the current branch.

## Selection Commitments

In:

- One proposed kind with source-backed constructibility evidence.
- Candidate packets, context rules, and remainder rows that may whole-rule
  govern that kind.
- All bounded evidence pockets whose source or current rule text directly
  bears on the proposed kind.
- Source files that define the candidate kind's anchors, public shape,
  generated surfaces, lifecycle, or instance examples.
- Explicit non-moves for inspected rows that do not fit.

Foreground:

- The kind before the candidate folder.
- Whole-rule ownership before partial fit.
- Constructibility evidence before name affinity.
- One true destination before sibling speculation.
- Physical tree state over hidden classification.
- Re-reading the changed tree before selecting the next kind.

Exterior:

- Any second candidate kind whose constructibility is not needed to complete
  the current slice.
- Capability design, blueprint inheritance, instance admission, and final
  projection design.
- Cleanup, consolidation, split, or retirement work that is not required to
  move a rule without changing behavior.
- Broad scans that do not produce physical movement or explicit falsification.

## Hard Core And Protective Belt

Hard core:

1. A blueprint kind must be constructible, not merely named, enforceable,
   product-branded, package-shaped, or currently grouped.
2. Affirm exactly one candidate kind per gathering slice unless a second kind
   is necessary to avoid a false move.
3. A rule moves to the affirmed blueprint only when its whole meaning applies
   to every valid instance of that kind.
4. Non-fitting evidence must be visibly demoted or retained in an honest lane;
   it must not remain under `_blueprints/` as unresolved ambiguity.
5. Sibling candidate labels touched by the slice must be merged, rejected,
   demoted, or explicitly left outside the slice with a reason.
6. The branch must leave a physical tree state that future agents can use
   without consulting a hidden classification ledger.

Protective belt:

- The affirmed kind may later become a child of a broader blueprint when
  hierarchy or inheritance is designed.
- The blueprint's final internal anatomy is still open; current packet folders
  are gathered authority, not final blueprint manifests.
- A current instance or variant may stay contextual even when it proves the
  kind exists.
- A candidate folder may dissolve into the new blueprint, honest niche
  `rules/`, or `_remainder/`.
- A slice may reject the proposed kind if source evidence fails the tests.

## Blueprint Affirmation Tests

Affirm a candidate kind only when the answer is yes to most of these, and no
single no invalidates the whole claim:

- **Multiplicity:** can there be multiple valid instances of this kind?
- **Anchor grammar:** can a future blueprint describe how to identify an
  instance by files, manifests, roots, generated outputs, or package surfaces?
- **Constructibility:** could Habitat generate, validate, repair, or migrate an
  instance of this kind?
- **Governance:** do candidate rules describe what must remain true for every
  valid instance, not just one current example?
- **Instance contrast:** can you name the current concrete instance separately
  from the kind?
- **Boundary:** can the kind be distinguished from its niche, package area,
  runner, output artifact, and lifecycle phase?

Do not affirm a kind if its only evidence is:

- a current `_blueprints/<label>/` folder;
- one rule id or defect label;
- a runner or operation kind;
- a generated file name;
- a package or niche label with no constructible instance shape;
- a concrete product, mod, app, or package instance with no separable kind;
- a current cleanup phase;
- a surface that only makes sense as part of another kind.

## Gathering Decision Criteria

For every candidate row, decide in this order.

### 1. Move To The Affirmed Blueprint

Move the row to `.habitat/blueprints/<kind>/<rule-id>/` when:

- the row can be stated without naming the current instance or niche;
- every valid instance of the kind should obey the invariant;
- the row governs kind shape, required output, public contract, generated
  surface, lifecycle boundary, or validity of the kind; and
- the whole rule meaning fits the kind.

"Whole rule meaning" means the full predicate of the current executable row,
including its scan roots, exceptions, hard-coded paths, and remediation
message. If only part of the row is kind-shaped while the rest relies on the
current product, named variant, migration state, or adjacent owner, the row is
not blueprint authority yet.

### 2. Leave Or Move To Honest Niche Rules

Use `<smallest-honest-niche>/rules/<rule-id>/` when:

- the row intentionally governs the current niche or concrete context;
- another valid instance of the kind could differ without violating the
  blueprint; or
- the row is current transition or retired-token history owned by that context.

### 3. Move To Remainder

Use `<smallest-honest-niche>/_remainder/<rule-id>/` when:

- the row has been reviewed but is not final authority;
- it points to a missing positive kind rule but is too narrow or negative as
  written;
- it belongs to a future projection, import-law, package graph, build, or
  generated-artifact surface not designed in this slice;
- it needs split, consolidation, or retirement before final ownership; or
- it mixes owners and no source-obvious behavior-preserving split belongs in
  the current branch.

### 4. Explicitly Exclude Or Falsify

Exclude rows whose source evidence proves they are outside the selected
bounded slice. Falsify the slice if the candidate kind cannot absorb enough
whole-rule authority to justify creating the blueprint, or if most movement
requires inventing additional kinds.

## Method

Use this method when a kind is likely enough that a missing blueprint
destination may be the main source of ambiguity.

1. Reground in `.habitat/.active/dominoes/README.md`, `.habitat/AUTHORITY-ONTOLOGY.md`,
   `.habitat/AUTHORITY-TREE-SHAPE.md`, and the relevant slice/remainder
   frames.
2. Name the proposed kind in singular form and name the current concrete
   instance separately.
3. Extract the source-backed anchor evidence for the kind: roots, manifests,
   public surfaces, generated outputs, lifecycle files, and current instance
   examples.
4. Fill the kind affirmation table before moving any packet.
5. If the kind fails, do not create a top-level blueprint; fall back to niche
   lane shaping or contextual remainder sorting.
6. If the kind passes, create `.habitat/blueprints/<kind>/` and define the
   bounded primary input group.
7. Fill the evidence pocket table, including explicit exclusions.
8. Run the sibling and touched-row pass for candidate labels adjacent to the
   selected kind, especially when the proposed kind collapses an over-split
   destination.
9. Search only bounded adjacent pockets for rows whose whole meaning may
   belong to the kind. Do not classify the whole corpus.
10. Predeclare a disposition for every primary row: affirmed blueprint, honest
   niche rules, `_remainder`, explicit exclusion, or falsified.
11. Physically move packets, preserving `rule.json.id` and updating
   `placement`, `runner.files`, `supportFiles.baseline`, and active references.
12. Record a receipt that matches the final tree.
13. Run focused proof for moved rows and stale-reference scans.
14. Re-read the changed tree before proposing the next candidate kind or
    remainder slice.

## Table Contracts

Every blueprint-kind gathering slice must record these tables. The exact
location may be the domino ledger, a slice frame, or a narrow workstream doc,
but the table state must match the final physical tree.

### Kind Affirmation Table

| Column | Meaning |
| --- | --- |
| `candidate kind` | Proposed singular blueprint name. |
| `current instance` | Concrete example kept separate from the kind. |
| `constructible anchor` | Files, manifests, roots, outputs, or package surfaces that identify instances. |
| `multiple-instance evidence` | Why the kind can have more than one valid instance. |
| `validator/generator/repair surface` | How Habitat could eventually validate, generate, repair, or migrate the kind. |
| `not-a-kind risks` | Product, niche, package, artifact, runner, cleanup, or sibling-kind risks. |
| `decision` | Affirm, reject, or stop for reframe. |

### Evidence Pocket Table

| Column | Meaning |
| --- | --- |
| `pocket` | Candidate packet group, rules lane, remainder lane, or source area. |
| `why included` | Direct reason the pocket may contain kind authority. |
| `why bounded` | Why the pocket does not open whole-corpus classification. |
| `source roots inspected` | Source roots used to decide. |
| `explicit exclusions` | Nearby rows or folders intentionally left outside the slice. |

### Sibling And Touched-Row Pass Table

Use this table when the selected kind is near other candidate labels or when
source evidence touches rows outside the primary pocket.

| Column | Meaning |
| --- | --- |
| `sibling or touched row` | Candidate folder, rule id, or lane inspected because the slice touched its evidence. |
| `relationship to kind` | Merge into kind, parent-owned facet, honest niche context, `_remainder`, garbage pressure, later possible kind, or excluded. |
| `why not sibling blueprint` | The specific constructibility, boundary, or whole-rule test that prevents sibling promotion now. |
| `physical outcome` | Moved, demoted, retained, deleted, or explicitly untouched. |
| `next trigger` | What future evidence should revisit the row or candidate. |

### Rule Disposition Receipt

| Column | Meaning |
| --- | --- |
| `rule id` | Stable `rule.json.id`. |
| `start path` | Packet path at the beginning of the slice. |
| `bucket` | Affirmed blueprint, honest niche rules, `_remainder`, external enforcement pressure, cleanup/split/retirement, exclusion, or falsified. |
| `target path` | Final packet path or retained path. |
| `source evidence` | Manifest, runner artifact, or source files used to decide. |
| `whole-rule reason` | Why the entire row fits or does not fit the target. |
| `proof run` | Selected-rule proof, manifest path proof, stale-reference scan, or no-move review proof. |
| `next trigger` | For `_remainder`, what future surface or event should revisit it. |

### Leftover Handoff Table

Use this when any inspected row stays outside the new blueprint.

| Column | Meaning |
| --- | --- |
| `leftover lane` | Final `rules/` or `_remainder/` lane. |
| `why not blueprint` | Which blueprint test or whole-rule criterion failed. |
| `future likely owner` | Existing or possible later owner, if knowable. |
| `next trigger` | What should cause a future slice to revisit it. |
| `risk if ignored` | What confusion remains if the leftover is never revisited. |

These tables are proof of physical sorting. They are not second authority
surfaces.

## Seed Application: Mod Map

The next expected seed use is the map-producing mod variant kind, named
`mod-map`. The name is intentional: `mod` is the base kind of thing, and
`-map` is the variant signal. Do not use `map-mod` for this kind.

Likely current instance:

- Swooper Maps as a Civ7 map mod.

Likely anchor evidence:

- `mods/mod-swooper-maps/mod/swooper-maps.modinfo`
- `mods/mod-swooper-maps/mod/config/config.xml`
- `mods/mod-swooper-maps/mod/text/en_us/MapText.xml`
- `mods/mod-swooper-maps/src/maps/generated/**`
- `mods/mod-swooper-maps/src/maps/configs/**`

Likely primary candidate pocket:

- `.habitat/civ7/mapgen/map-output/_blueprints/**`

Expected caution:

- `generated-map-entrypoint` and `shipped-map-catalog` may be parts of a map
  mod output bundle rather than standalone top-level blueprints.
- `map-projection`, `placement-outcome`, and recipe artifact parity may be
  adjacent projection, recipe-step, or generated-artifact pressure rather than
  mod-map authority.
- Do not create `map-projection` or any sibling blueprint in the mod-map slice
  unless failing to do so would force a false move.

Before moving anything for this seed, the slice should be able to say:
`mod-map` is the constructible kind; Swooper Maps is the current concrete
instance; generated entrypoints and shipped catalogs are candidate mod-map
surfaces unless source evidence proves they are separate kinds.

## Review Expectations

Use bounded review agents when the slice is more than a mechanical move:

- Ontology reviewer: challenge whether the proposed kind is constructible and
  whether any row moves by name affinity instead of whole-rule ownership.
- Evidence reviewer: check that the source anchor evidence supports the kind
  and that the current instance is separated from the blueprint.
- Implementation reviewer: after movement, check stale references, manifest
  paths, receipt/tree agreement, and `_remainder` use.
- Handoff reviewer: check whether a future stateless agent can resume from
  the receipt and physical tree without reconstructing the whole discussion.

Accepted P1/P2 findings block closure until repaired, rejected with source
evidence, or explicitly dispositioned by sealed authority/user decision.

## Before Moving Anything Checklist

- Candidate kind named in singular form.
- Current concrete instance named separately.
- Kind affirmation table filled.
- Bounded evidence pockets listed with explicit exclusions.
- Every primary row has a planned bucket.
- Sibling and touched rows have been merged, demoted, excluded, or explicitly
  left untouched with a reason.
- Target lanes match `.habitat/AUTHORITY-TREE-SHAPE.md`.
- Review prompts are bounded to the selected kind and do not ask agents to
  classify the whole corpus.

## Reframe Conditions

Reframe before implementation if:

- the candidate kind cannot be distinguished from a niche, package, artifact,
  runner, or current cleanup phase;
- source evidence shows the proposed kind is only a child of a broader kind
  that must be affirmed first for the slice to be truthful;
- most candidate rows require a second new kind, capability, projection, or
  import-law surface;
- touched sibling labels would remain ambiguous `_blueprints/` merely because
  the branch avoided the adjacent false-destination decision;
- the slice would mostly create docs or ledgers without physical movement; or
- creating the blueprint would increase state space by preserving current
  labels rather than reducing ambiguity.

Degeneration trigger: if two consecutive blueprint-kind gathering slices create
new blueprints but move fewer than half of their primary rows into affirmed
blueprint authority, stop using this method and reframe the selection rule.

## Closure Contract

A slice using this frame closes only when:

- the kind is affirmed or explicitly falsified;
- every primary row has a disposition;
- `_blueprints/` no longer carries unresolved ambiguity for inspected rows;
- moved manifests preserve rule identity and behavior;
- focused proof and stale-reference scans have run;
- the receipt matches the physical tree; and
- the next visible pressure is named without pretending it is already decided.

## NOT HOW

This frame does not prescribe exact branch names, command invocations,
Graphite commit subjects, or final blueprint manifest schemas. Those belong to
the implementation prompt for the selected slice.
