# Habitat Autonomous Domino Loop Frame

Status: normative frame for autonomous bounded Habitat domino execution

Built: 2026-06-30

Owner: DRA Habitat authority-tree workstream

Durability: standalone reference for agents running repeated bounded authority
tree dominoes without a fresh user prompt for each pocket.

## Scope And Provenance

This frame governs the autonomous portion of the Habitat authority-tree work:
the repeatable loop where an agent can select a bounded pocket, inspect the
rules and source evidence, physically sort packets into existing authority
lanes, prove behavior did not change, and close a clean Graphite branch.

It composes the existing frames. It does not supersede the ontology, tree
shape, slice, remainder, or domino documents. Use it only after those documents
have already established the concepts and current physical lanes.

Candidate selection and authority order:

1. Direct user decisions in the active Habitat authority-tree workstream.
2. `.habitat/DOMINO-FRAME.md` and `.habitat/dominoes.md` for ratchet
   discipline and candidate pocket selection.
3. `.habitat/AUTHORITY-ONTOLOGY.md` for blueprint, instance, capability, and
   niche concepts.
4. `.habitat/AUTHORITY-TREE-SHAPE.md` for current physical lane semantics.
5. `.habitat/AUTHORITY.md` and `.habitat/FRAME.md` for current-tree
   mechanics, manifest identity, Toolkit execution boundaries, and the
   standing Habitat frame.
6. `.habitat/AUTHORITY-SLICE-FRAME.md` for bounded kind-family slices.
7. `.habitat/AUTHORITY-REMAINDER-SLICE-FRAME.md` for contextual remainder
   slices.
8. This document, for when the next domino belongs to the repeatable
   autonomous loop.
9. Completed slice frames such as `.habitat/AUTHORITY-DOMAIN-KIND-SLICE.md`
   and `.habitat/AUTHORITY-DOMAIN-OPERATION-SLICE.md` as precedent and
   evidence only.
10. Current `.habitat/**/rule.json` manifests and source code as evidence.

The domino ledger may select the next candidate pocket. It does not authorize
lane creation, blueprint promotion, niche admission, capability creation, or
classification vocabulary. Ontology, tree-shape, slice, and remainder frames
must veto any disposition that would smuggle queue labels into authority.

In scope:

- Existing bounded pockets named by the domino ledger or exposed by the
  current authority tree.
- Physical movement of rule packets into already accepted authority lanes.
- Honest retention of rules in niche `rules/` lanes.
- Physical movement of reviewed-but-deferred rules into `_remainder/`.
- Disposition receipts that match the physical tree.
- Focused selected-rule proof, manifest path proof, static scans, and review
  disposition.

Out of scope:

- Creating new blueprint, capability, niche, or admission authority.
- Designing the final Habitat schema.
- Building broad runner discovery, projection adapters, import-law surfaces,
  Nx graph enforcement, or package orchestration.
- Rewriting, consolidating, deleting, or splitting broad rule classes before a
  bounded slice proves that work is the correct next domino.
- Treating runner labels, packet labels, context labels, retired-token labels,
  current folders, or defect names as ontology.
- Producing classification ledgers that do not drive physical movement or
  explicit no-move disposition in the same branch.

## WHAT

This frame treats the next stable portion of the Habitat work as a bounded
state-changing loop. The unit of work is not "classify the corpus." The unit is
one sealed authority pocket whose rows can be reviewed against existing
blueprints, honest niche/context lanes, and `_remainder` lanes. The foreground
signal is whether the current physical tree becomes truer after the branch:
affirmed-kind rules move to top-level `blueprints/`, intentional context rules
stay in the smallest honest niche `rules/`, and reviewed leftovers move to the
smallest honest `_remainder/`.

## WHY

After the location-independent manifest work and the early kind/remainder
slices, there is a class of dominoes that no longer needs a brand-new design
conversation each time. The method is now stable enough to run while still
being dangerous if it overreaches. This frame makes the autonomous loop
explicit: the agent can keep knocking down pockets whose destinations already
exist, but must stop when the next move requires new ontology, new execution
surfaces, or behavior-changing cleanup. The structural alternative is a broad
corpus scan; it is rejected here because broad scans flatten dependency order
and recreate hidden classification state instead of changing the authority
tree.

## Selection Commitments

In:

- Bounded authority pockets with visible primary inputs.
- Existing accepted destinations: affirmed `blueprints/`, niche `rules/`, and
  niche `_remainder/`.
- Rule manifests as stable identity and current placement inventory.
- Source code as constructibility, ownership, and behavior evidence.
- Focused review agents used as evidence and pressure-test lanes.
- Clean branch, proof, and commit closure.

Foreground:

- Physical tree truth over ledger completeness.
- Existing authority destinations over invented categories.
- Whole-rule ownership over partial-fit movement.
- Positive kind pressure over negative special-case proxy rules.
- Smallest honest niche/context over parent-lane ambiguity.
- Stop conditions over clever taxonomy expansion.

Exterior:

- Global corpus classification.
- New ontology admission.
- New runner/projection/enforcement-surface construction.
- Cleanup-first rewrites.
- Hidden receipt documents whose state is not visible in the tree.
- Broad compatibility shims or old-shape fallbacks.

## Hard Core And Protective Belt

Hard core:

1. The autonomous loop may only move within authority concepts that already
   exist.
2. Every primary rule row receives a disposition, and the disposition must
   match the physical tree.
3. A rule moves to an affirmed blueprint only when its whole meaning belongs to
   every valid instance of that kind.
4. Reviewed-but-deferred rows move to `_remainder/`; they do not remain in
   `rules/` as ambiguous leftovers.
5. The loop closes only with behavior-preserving movement, focused proof,
   review disposition, Graphite commit, and a clean worktree.

Protective belt:

- The next eligible pocket is chosen from the domino ledger first, then tested
  against the current tree.
- A slice may complete with zero blueprint moves if every row is physically
  sorted and the deferred pressure is explicit.
- A rule may stay in context when that context owns real transition or
  retired-token history.
- `_remainder/` is visual debt and may later disappear through movement,
  projection, split, consolidation, or retirement.
- The exact queue can change after each branch because movement changes the
  evidence available to the next branch.

## Reframe Conditions

What would force a reframe:

If a selected pocket cannot mostly sort into existing affirmed blueprints,
honest niche/context `rules/`, or `_remainder/` without inventing new ontology
or changing runtime behavior, this autonomous loop is the wrong frame for that
domino.

Degeneration trigger:

Docs-only and frame-only work is outside this autonomous loop. If an
autonomous branch cannot close with concrete authority-tree state change,
explicit no-move retention, explicit exclusion, or falsification proof for a
bounded pocket, stop and run a fresh domino-selection reframe before
continuing.

## Autonomous Eligibility Test

Run this test before starting any autonomous domino. All answers must be yes.

1. Is there a bounded primary input set?
2. Are the possible final lanes already known?
3. Can every primary row be dispositioned without creating a new blueprint,
   capability, niche, admission model, runner, or projection surface?
4. Can behavior remain unchanged?
5. Can packet movement be proved by manifest path checks and focused
   `habitat check --rule` proof?
6. Can the branch close with only authority-tree, manifest, receipt, and
   adjacent-doc/test updates?

If any answer is no, this is not an autonomous-loop slice. Stop and produce a
new frame, design, or user-facing decision point instead.

## Loop Method

Use this loop for each eligible domino.

1. **Isolate state.** Confirm the expected worktree, branch, Graphite stack,
   and clean status. Create a new Graphite child branch.
2. **Reground authority.** Read the source-order bundle, then the current tree
   and current domino ledger. Do not select rows from memory.
3. **Select the pocket.** Choose the largest bounded pocket that makes the
   next pocket more mechanical. Name why it is larger-leverage than nearby
   alternatives.
4. **Extract the corpus.** List every primary rule row and any explicitly
   bounded comparison input. Do not hide rows in groups.
5. **Inspect source evidence.** Read only the source files needed to prove or
   refute ownership for the pocket.
6. **Predeclare dispositions.** Bucket each primary row before movement:
   existing blueprint authority, honest context, `_remainder` as missing
   positive kind governance, `_remainder` as external enforcement-surface
   pressure, `_remainder` as cleanup/split/consolidation/retirement pressure,
   explicit exclusion, or falsified/blocked.
7. **Move physically.** Move packet directories, preserve `rule.json.id`, and
   update `placement`, `runner.files`, `supportFiles.baseline`, and active refs.
8. **Record receipt.** Update the domino ledger or the narrow authority doc
   with a disposition receipt that matches the final tree. The receipt is not
   a second authority surface.
9. **Verify.** Run path proof, stale-reference scans, focused selected-rule
   proof for moved rows, `git diff --check`, and the relevant Habitat check.
10. **Review.** Run bounded review agents. Fix or explicitly disposition P1/P2
    findings before closure.
11. **Close.** Commit through Graphite, leave the worktree clean, and name the
    next pressure in the final response.

## Disposition Vocabulary

Use these exact buckets unless a slice-specific frame narrows them further.

### Existing Blueprint Authority

Move to `.habitat/blueprints/<blueprint>/<rule-id>/` when the whole rule
governs a valid instance of an already affirmed constructible kind.

Current affirmed destinations include:

- `recipe`
- `recipe-stage`
- `recipe-step`
- `domain`
- `domain-operation`

### Honest Niche Or Context

Keep or move to `.habitat/<niche>/rules/<rule-id>/` when the whole rule
intentionally governs the current niche or context, and another valid
blueprint instance could differ without violating the kind.

### Reviewed Remainder

Move to `.habitat/<smallest-honest-niche>/_remainder/<rule-id>/` when the row
has been reviewed but is not final authority. The receipt must name the reason:

- missing positive kind governance;
- external enforcement-surface pressure;
- cleanup, split, consolidation, or retirement pressure; or
- mixed whole-rule ownership that cannot be split safely in this branch.

### Explicit Exclusion

Use when a primary input is inspected and found outside the bounded pocket. The
receipt must name why it was excluded and where a future agent should look.

### Falsified Or Blocked

Use when the pocket cannot be sorted under the existing model without new
ontology, new execution surfaces, behavior changes, or a dishonest owner.

## Team Shape

Use an orchestrator-plus-specialists topology. The main agent is the DRA and
owns synthesis, edits, proof claims, review dispositions, branch state, and
closure. Specialist agents provide bounded evidence or adversarial review.

Default specialist lanes:

- **Explorer:** inspect the pocket's rule manifests and source topology. Return
  concrete evidence with paths and no whole-corpus classification.
- **Ontology reviewer:** pressure-test dispositions against affirmed
  blueprints, honest context, `_remainder`, and false ontology promotion.
- **Implementation reviewer:** after movement, check stale paths, manifest
  references, lane correctness, proof gaps, and over-broad claims.

Do not use agents when the coordination cost exceeds the slice. Do use at
least one review lane for any branch that physically moves packets.

Agent prompts must name the objective, authority source order, hard core,
allowed paths, exterior, falsifier, output contract, and write permissions.
Subagents do not own branch closure.

## Skill Rails

Use the smallest skill set that covers the active gate:

- `habitat:systematic-workstream` for authority order, corpus, expectations,
  physical burn-down, proof, and closure.
- `cognition:framing-design` when creating or revising a frame, or when the
  selected pocket no longer fits the loop.
- `cognition:ontology-design` when judging kind, blueprint, context, niche, or
  capability claims.
- `cognition:solution-design` when the domino shifts from sorting to building
  a projection, execution surface, or adapter.
- `cognition:investigation-design` when evidence collection itself needs a
  bounded investigation plan.
- `cognition:testing-design` when proof shape is unclear or behavior needs
  layered tests before implementation.
- `cognition:team-design` when designing fresh agents or review lanes.
- `dev:refactor-typescript` and `dev:review-code-quality` when the branch
  touches Toolkit code, tests, or generated interfaces.
- `dev:graphite` when creating, committing, submitting, or repairing stack
  state.

Do not load every skill by habit. Load the entrypoint and directly relevant
references for the gate you are in.

## Known Autonomous Queue

This queue is advisory. The domino ledger and current tree remain the active
selector.

Strong autonomous candidates:

- Hydrology remainder pocket: created by the direct domains-lane sort; small
  and sharp enough to test hydrology context versus recipe-stage, import-law,
  and map-config cleanup pressure.
- Ecology context pocket: likely eligible after hydrology if the primary rows
  can sort into `domain`, `domain-operation`, honest ecology context, or
  ecology `_remainder`.
- Standard-recipe context/remainder pocket: eligible only when bounded to
  existing `recipe`, `recipe-stage`, `recipe-step`, and current standard-recipe
  context authority.

Likely non-autonomous or stop-and-design candidates:

- New blueprint candidates not already affirmed.
- Capability admission.
- Import-law, package-graph, Nx, or build/test orchestration surfaces.
- Full-suite runner discovery.
- Projection adapters from moved authority.
- Broad cleanup, rule consolidation, or rule deletion.

## Review And Proof Contract

A completed autonomous slice must provide:

- `git diff --check`.
- Manifest path proof that every moved `runner.files` and
  `supportFiles.baseline` path exists.
- Focused `bun tools/habitat/bin/dev.ts check --rule <id> --json` proof for
  moved rows where applicable.
- Static scans proving moved manifests do not contain stale old file refs.
- Static scans proving a parent lane contains only rows explicitly
  dispositioned as genuine parent authority, when the branch touched that lane.
- Optional Toolkit smoke, such as `bun run --cwd tools/habitat check` from the
  active worktree root, when the slice-specific plan requires it.
- Review-agent pass with P1/P2 findings fixed or explicitly dispositioned.

Broad Habitat checks are not closure proof for an autonomous slice unless the
branch is the runner-discovery rebuild domino. If run, pre-existing broad
failures must be reported as advisories, not proof of the slice.

## Closure Contract

Every autonomous-loop branch closes with:

- a Graphite commit;
- clean worktree;
- final answer naming what moved to blueprints, what stayed in context, what
  moved to `_remainder`, what was excluded or falsified, what was proved, and
  the next slice pressure;
- no unstated compatibility residue, stale path references, or hidden
  classification ledgers.

Skills used to construct this frame: `framing-design`, `team-design`,
`habitat:systematic-workstream`.
