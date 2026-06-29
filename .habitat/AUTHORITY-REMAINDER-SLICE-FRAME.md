# Authority Remainder Slice Frame

Status: normative frame for bounded contextual-remainder slice work

Built: 2026-06-29

Owner: DRA Habitat authority-tree workstream

Durability: standalone reference for stateless agents reassessing rules that
remain in contextual `rules/` pockets after a parent kind has been affirmed.

## Scope And Provenance

This frame governs the next class of Habitat authority work: bounded
contextual-remainder slices. These are not broad corpus cleanup passes. They
start from a concrete remainder pocket, re-read it against already affirmed
blueprints, and decide whether each rule is actually:

- missing kind-level governance;
- existing blueprint authority;
- honest current-context authority;
- external enforcement-surface pressure; or
- cleanup, consolidation, split, or retirement pressure.

The physical tree must carry the sorted state. The disposition table is a
receipt, not the authority surface.

Source order:

1. Direct user decisions in the active Habitat authority-tree workstream.
2. `.habitat/DOMINO-FRAME.md`, `.habitat/FRAME.md`, and
   `.habitat/dominoes.md`.
3. `.habitat/AUTHORITY-ONTOLOGY.md` for blueprint, instance, capability, and
   niche concepts.
4. `.habitat/AUTHORITY-SLICE-FRAME.md` for bounded state-changing slices.
5. `.habitat/AUTHORITY.md` for current-tree authority mechanics, manifest
   identity, and Toolkit execution boundaries.
6. `.habitat/AUTHORITY-TREE-SHAPE.md` for the current physical tree and lane
   semantics.
7. Completed slice frames, especially `.habitat/AUTHORITY-DOMAIN-KIND-SLICE.md`
   and `.habitat/AUTHORITY-DOMAIN-OPERATION-SLICE.md`, as precedent and
   evidence only.
8. Current `.habitat/**/rule.json` manifests as evidence inventory.
9. Current source code as constructibility and ownership evidence.

In scope:

- One contextual remainder pocket at a time, such as `morphology-domain` or
  `foundation-domain`.
- Immediate adjacent rules when their whole meaning directly bears on the same
  kind family.
- Already affirmed blueprints that may honestly own part of the remainder,
  such as `domain` and `domain-operation`.
- Disposition notes that make later cleanup or consolidation safer.
- Physical separation between intentional `rules/` authority and
  sorted-but-deferred `_remainder/` packets.

Out of scope:

- Classifying the whole corpus.
- Creating new blueprint, capability, or niche authority from current labels
  alone.
- Consolidating, deleting, or rewriting weak rules before ownership is clear.
- Treating concrete domain names as blueprints by inheritance.
- Treating runner labels, packet labels, defect labels, or folders as ontology.
- Building the future admission model.
- Producing a disposition ledger whose rows are not reflected in the physical
  tree.

## WHAT

This frame treats a contextual remainder pocket as evidence left behind after a
more general kind has become visible. The primary signal is not that the
context label should survive. The primary signal is whether each rule now
points to a clearer owning authority: an affirmed kind, a missing positive kind
rule, an honest context, an execution-boundary concern, or a cleanup pressure.
The tree placement is the durable state: intentional rules stay in `rules/`,
affirmed-kind rules move to `blueprints/`, and sorted-but-deferred leftovers
move to `_remainder/`.

## WHY

After moving `recipe`, `recipe-stage`, `recipe-step`, `domain-operation`, and
`domain`, the remaining named-context pockets are more informative than they
were before. Many rules now look contextual only because the positive
kind-level rule they imply has not yet been authored or moved. The next work
needs to burn down that ambiguity without over-classifying early. A bounded
remainder slice lets us make state-changing movement where ownership is true,
leave context where context is true, and mark cleanup pressure without making
cleanup the first move. The branch must not end as a hidden classification
document; the classification exists to drive visible authority-tree separation.

## Construction History

Structural alternative considered: continue moving only new kind pockets.

Why rejected or demoted: after `domain` moved, some of the highest-signal work
is no longer a fresh parent-kind slice. It is the remainder around that parent
kind: rules still named for concrete domains that may actually belong to
`domain`, `domain-operation`, a missing positive rule, or an external
enforcement surface.

Structural alternative considered: broad cleanup of all remaining domain rules.

Why rejected or demoted: cleanup-first work would flatten dependency order and
recreate the old corpus-snapshot problem. It would also hide whether a weak
rule is weak because it is obsolete, because it is a negative proxy for a
missing positive invariant, or because it belongs to an affirmed kind.

Chosen frame: contextual remainder slice. Pick one remainder pocket, inspect it
against the affirmed parent kinds and the current source, disposition every
primary input, move what has a truthful owner, move sorted leftovers to an
explicit `_remainder` lane, and record only the lessons needed to control the
next remainder pocket.

## Selection Commitments

In:

- Contextual rules left after a related parent kind has been affirmed.
- Rules that look special-case but may point to missing positive kind rules.
- Existing affirmed blueprints that can truthfully own the whole rule.
- Source evidence for constructible kinds, contexts, and execution surfaces.
- Explicit disposition for every primary input.
- Physical lane choice as the source of sorted state.

Foreground:

- Kind rule over context label when the invariant applies to all valid
  instances of the kind.
- Positive invariant over negative special-case proxy.
- Existing affirmed authority before inventing new authority.
- Honest context when the rule is genuinely about current transition state.
- External enforcement-surface pressure when the rule is really graph,
  package, import, or build boundary pressure.
- `_remainder` as visual debt for sorted-but-deferred leftovers, not as an
  ontology concept.

Exterior:

- Treating `morphology-domain`, `foundation-domain`, `ecology-domain`, or
  similar labels as accepted blueprints.
- Calling every remainder a niche.
- Creating `domain-public-surface`, `domain-config-surface`, or
  concrete-domain blueprints from folder labels.
- Deleting weak rules just because they are weak.
- Moving a rule when only part of its meaning fits the destination.
- Leaving sorted-but-deferred rules inside `rules/` where a future agent would
  read them as intentional context authority.

## Hard Core And Protective Belt

Hard core:

1. Contextual remainder rules are evidence, not ontology.
2. A rule moves to an affirmed blueprint only when its whole meaning belongs to
   every valid instance of that kind.
3. A weak negative rule may be evidence for a missing positive kind rule; do
   not preserve the negative shape as authority without testing that.
4. Current contexts stay current contexts when the rule is genuinely about a
   concrete domain, transition, or historical cleanup.
5. External enforcement-surface pressure should name both its Habitat
   authority owner, if any, and the projected execution surface rather than
   being smuggled into blueprint authority.
6. A disposition table is only a receipt; the physical tree must show whether
   each packet moved, stayed intentional, or became sorted `_remainder`.

Protective belt:

- The first remainder slices may use coarse context buckets while instance and
  niche admission are still future work.
- A later slice may split a mixed rule only when the split is source-obvious
  and behavior-preserving.
- Cleanup candidates can be marked without being cleaned up in the same branch.
- Capabilities remain unlikely in these slices, but the frame does not forbid
  them if source evidence proves reusable attachable behavior that no blueprint
  can truthfully own.
- Exact future paths may change; manifest identity and runner/artifact
  references remain the stability contract during movement.
- `_remainder/<source-context>/` is transitional and may disappear once later
  branches move, split, consolidate, project, or retire those packets.

## Decision Criteria

For every primary rule, answer these questions in order.

### 1. Existing Blueprint Authority

Move the rule to an affirmed blueprint when:

- the rule can be stated without naming the current context;
- another valid instance of the kind should obey the same invariant;
- the rule governs constructible shape, public contract, anchor grammar,
  operation boundary, or required validity of the kind; and
- the whole rule meaning fits the destination.

Likely destinations in the current domain remainder work:

- `domain`: domain entrypoint, public/config contract, domain-root topology, or
  consumer-facing domain boundary.
- `domain-operation`: operation module topology, operation contract quality,
  operation runtime boundary, operation implementation boundary.

### 2. Missing Positive Kind Rule

Mark as missing positive kind governance when:

- the current rule forbids a narrow bad token or legacy pattern;
- the real invariant is a positive shape, contract, import boundary, or
  allowed dependency set that should apply beyond this concrete context; and
- moving the current negative rule as-is would preserve the wrong expression of
  the authority.

Do not invent the replacement rule inside a physical-movement slice unless the
replacement is source-obvious, behavior-preserving, and strictly reduces the
state space.

### 3. Honest Context

Leave contextual when:

- the rule is about a current concrete domain, recipe, stage, or cutover state;
- another valid instance could differ without violating the kind;
- the rule is historical cleanup or temporary transition pressure; or
- the rule mixes context and kind concerns, no source-obvious split exists, and
  the whole mixed rule still intentionally governs the current context.

Use the smallest honest current context. Do not rename context as a niche
unless niche admission facts actually exist. Do not leave a rule in
`rules/<context>/` merely because it came from that context; if the row is
sorted but deferred, move it to `_remainder/<source-context>/`.
If a reviewed mixed rule cannot truthfully remain intentional context
authority, move it to `_remainder/<source-context>/` rather than preserving it
in `rules/` as an ambiguous leftover.

### 4. External Enforcement-Surface Pressure

Mark as external enforcement-surface pressure when:

- the rule is primarily package graph, module-boundary, Nx target, import-law,
  or build/test orchestration;
- the correct projected enforcement surface is outside the blueprint rule
  packet itself; and
- moving it to a blueprint would make the ontology less true even if the check
  still passes.

Each disposition must name both sides:

- the Habitat authority owner, if the structural policy still belongs in
  Habitat; and
- the projected enforcement surface, such as Nx boundaries, package graph,
  import law, or a build/test target.

Only call the rule truly outside Habitat when there is no Habitat-owned
structural policy to preserve. If the projected surface is not implemented in
the current branch, move the packet to `_remainder/<source-context>/` rather
than leaving it as intentional `rules/` authority.

### 5. Cleanup, Consolidation, Split, Or Retirement

Mark cleanup pressure when:

- a rule is a loose negative proxy for a stronger positive invariant;
- a moved blueprint rule now makes it redundant;
- a retired artifact no longer exists;
- a rule combines two owners that should split later; or
- a rule enforces a pattern the future model should not preserve.

Cleanup follows ownership clarity. Do not turn this frame into a cleanup-first
workstream. If cleanup is not performed in the current branch, move the packet
to `_remainder/<source-context>/` unless it is still an intentional
context-owned rule.

## Slice Method

1. Reground in this frame, the generic slice frame, `AUTHORITY.md`, the latest
   domino ledger, and the completed kind frames relevant to the pocket.
2. Select one remainder pocket and name why it is the highest-leverage next
   bounded state change.
3. Inspect the pocket's manifests and the source code that proves or refutes
   ownership.
4. Disposition every primary rule into one of the decision buckets above.
5. Physically move rules whose whole meaning has a truthful owner.
6. Preserve every moved rule `id`; update `placement`, `runner.files`, and
   `artifacts.baseline`.
7. Leave only intentional context authority in `rules/`.
8. Move sorted-but-deferred leftovers to
   `_remainder/<source-context>/<packet>/`.
9. Record missing positive kind rules, external enforcement-surface pressure,
   and cleanup candidates as receipts for the physical lane choice, without
   doing broad cleanup.
10. Run focused Habitat proof for moved rules and static reference scans.
11. Update this frame only when the slice teaches a reusable decision rule.

## Physical Sorting Contract

The tree, not a hidden corpus document, is the source of sorted state.

After a remainder slice:

- affirmed-kind rules live under `.habitat/blueprints/<blueprint>/<packet>/`;
- intentional niche/context rules live under
  `.habitat/<niche>/rules/<packet>/` or
  `.habitat/<niche>/rules/<context>/<packet>/`;
- sorted-but-deferred leftovers live under
  `.habitat/<niche>/_remainder/<source-context>/<packet>/`.

`_remainder` means "reviewed and not final." It does not mean niche,
capability, blueprint, or accepted ontology. It is a visible queue for later
mechanical movement, split, projection, consolidation, or retirement.

Do not use `_context` for this lane. `_context` reads as semantic ownership.
`_remainder` preserves the unresolved state and prevents future agents from
mistaking leftovers for intentional niche rules.

## Disposition Table Contract

Every remainder slice must keep a per-rule disposition table in the slice
frame, implementation notes, or domino update. The table is the receipt for the
physical sorting outcome, not a substitute for movement. It must account for
primary inputs, including rows that do not move.

Required columns:

| Column | Meaning |
| --- | --- |
| `rule id` | Stable `rule.json.id`. |
| `current path` | Path at the start of the slice. |
| `bucket` | One of: existing blueprint authority, missing positive kind rule, honest context, external enforcement-surface pressure, cleanup/consolidation/split/retirement, explicit exclusion, falsified/blocked. |
| `target or retained context` | Destination path/owner if moved, the smallest honest retained context if intentionally kept in `rules/`, or `_remainder/<source-context>` if sorted but deferred. |
| `source evidence` | Source files or manifest facts that justify the bucket. |
| `reason` | One sentence naming why the whole rule does or does not fit the owner. |
| `proof needed/run` | Focused `habitat check --rule`, path-reference proof, source inspection, or explicit no-move review proof. |
| `reusable lesson` | Any rule future foundation/ecology/remainder slices should inherit; otherwise `none`. |

Closure requires the table to cover every primary input and match the physical
tree. Moved rows need runtime or selected-rule proof. Non-moved intentional
rules need review proof that they still belong in `rules/`. Deferred rows need
path proof that they moved to `_remainder/<source-context>/`, plus a named next
mechanical destination or trigger.

## First Method Seed: Morphology Remainder Pocket

The first method seed was the Morphology Remainder Pocket:

```text
.habitat/civ7/mapgen/domain/rules/morphology-domain/**   # starting pocket
.habitat/civ7/mapgen/domain/_remainder/morphology-domain/** # sorted result
mods/mod-swooper-maps/src/domain/morphology/**
```

Why morphology first:

- It is large enough to exercise the method: contracts, overlay ownership,
  config facades, operation boundaries, legacy tokens, and consumer/runtime
  pressure all appear.
- It is smaller and less legacy-entangled than foundation, making it a better
  first reusable remainder-method seed.
- It sits directly under the already affirmed `domain` and `domain-operation`
  pressure, so many dispositions can be tested without inventing a new
  taxonomy.
- It had obvious possible outcomes: rows could move to `domain`, move to
  `domain-operation`, stay in morphology context, or become missing
  positive-rule, external enforcement-surface, or cleanup pressure under
  `_remainder/morphology-domain`.

Resulting reusable lesson:

- A remainder slice can complete with zero blueprint moves. That is not a
  failed slice when every primary row has been reviewed, the physical tree now
  separates sorted leftovers from intentional `rules/` authority, and the
  receipts name what future movement, projection, split, consolidation, or
  retirement would make the row final.
- Strategy-file rules, aggregate cleanup, retired-token cleanup, cross-owner
  import law, and build/Nx boundary pressure are disposition outcomes, not
  automatic blueprint candidates. Do not create a blueprint or force a move
  merely to make the slice look more productive.
- When a concrete-domain remainder packet mostly scans recipe-stage, map/test,
  hydrology, narrative overlay, or retired-token surfaces, the domain word in
  the rule id is not enough to keep it under `rules/<domain-context>`. If the
  whole rule does not fit affirmed `domain` or `domain-operation` authority,
  and it is not intentionally owned by the current concrete domain context,
  move it to `_remainder/<source-context>` with a named future destination or
  trigger.

## Second Method Seed: Foundation Remainder Pocket

The second method seed was the Foundation Remainder Pocket:

```text
.habitat/civ7/mapgen/domain/rules/foundation-domain/**        # starting pocket
.habitat/civ7/mapgen/domain/rules/foundation-domain/**        # intentional context result
.habitat/civ7/mapgen/domain/_remainder/foundation-domain/**   # sorted deferred result
mods/mod-swooper-maps/src/domain/foundation/**
```

Resulting reusable lesson:

- A remainder slice does not have to choose between moving everything to
  `_remainder` and preserving every current-context row. Some rules are
  intentionally concrete-context authority: currentness guards and retired-token
  regression guards can remain in `rules/<context>` when the context owns that
  migration history and another valid instance could differ without violating an
  affirmed kind.
- `_remainder/<source-context>` is for reviewed rows that are not final
  context authority: mixed recipe-step plus operation-contract predicates,
  projection implementation cleanup, duplicate split rows, strategy-file
  locality rows, and rules-index shim pressure.
- Adjacent direct rows may become the next domino when a remainder slice
  exposes duplicate or stronger versions outside the current context pocket. Do
  not silently absorb those rows into the current slice unless they are primary
  inputs or required to decide a primary row.

## Falsifiers

Stop and reframe if:

- most primary rows cannot be placed under existing affirmed blueprints, one
  honest context, or explicit cleanup/external-enforcement pressure;
- the slice requires promoting a concrete domain label to blueprint authority;
- the slice creates more new buckets than it moves or clarifies;
- the only way to proceed is to rewrite broad MapGen rules before movement; or
- runtime behavior must change to justify the authority movement.

Degeneration trigger: if one remainder slice closes with disposition notes that
do not match physical movement, retained intentional `rules/`, or
`_remainder/` separation, this frame has become a ledger frame rather than a
state-change frame and must be revised before the next slice.

## Review Expectations

Every remainder-slice implementation should receive at least two bounded review
passes:

- Ontology review: pressure-test blueprint, context, missing-kind-rule,
  external-enforcement-surface, and cleanup dispositions.
- Implementation review: check stale paths, manifest references, behavior
  proof, `_remainder` path proof, and over-broad ontology claims.

Reviewers should not classify the whole corpus. They should attack the pocket
and the disposition logic.
