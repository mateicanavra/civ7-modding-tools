# Remainder Reclamation Frame

Status: normative method frame for reclaiming sorted remainder rows into
existing authority destinations

Built: 2026-06-30

Owner: DRA Habitat authority-tree workstream

Durability: standalone reference for agents starting from a remainder-cleanup
idea, using analytics to find adjacent reclaimable rows, and then physically
moving the bounded slice through implementation, proof, and review.

Theme: remainder reclamation. The point is to recover authority that is
currently parked in `_remainder/` after earlier slices made it visible, without
turning the remainder inventory into a new classification corpus.

## Frame Identity

Frame name: Remainder Reclamation

For situation: reviewed Habitat packets sit in `_remainder/` lanes, and a
newly affirmed or pre-existing destination may now be able to absorb some of
those rows as real authority.

Mode: frame-discovery

Object-path: problem

## Scope And Provenance

In scope:

- One remainder-reclamation idea at a time, such as "projection rows may belong
  to `recipe-step`" or "map config cleanup may belong to a map authoring
  surface."
- Analytics and metrics over live `rule.json` manifests and runner artifacts
  as preflight evidence.
- Discovery of pockets and adjacent slices whose rows share the same likely
  destination, proof shape, or ownership predicate.
- Systematic row-by-row disposition of the bounded input set.
- Physical movement into existing affirmed blueprints, honest niche `rules/`,
  or smaller honest `_remainder/` lanes.
- Receipts and proof that match the final tree.

Out of scope:

- Whole-remainder corpus classification.
- Treating metrics output as authority, ontology, or a durable hidden ledger.
- Creating a new blueprint, capability, projection surface, import-law surface,
  package-graph owner, or runner authority without a separate frame that
  explicitly authorizes that creation.
- Cleanup-first rewrites, split work, consolidation, or retirement unless the
  current row can move behavior-preservingly without waiting for that work.
- Reprocessing intentional `rules/` lanes that have no direct relationship to
  the selected destination.
- Moving rows by path affinity alone.

Source pointers:

- Direct user decision: build a reusable frame for remainder reclamation that
  starts from an idea, uses metrics to discover pockets and adjacent slices,
  then carries through movement, review, and proof.
- `.habitat/dominoes.md` for source order, completed receipts, and the active
  next domino.
- `.habitat/AUTHORITY-ONTOLOGY.md` for blueprint, instance, capability, niche,
  and evidence-vs-authority concepts.
- `.habitat/AUTHORITY-TREE-SHAPE.md` for `blueprints/`, `rules/`,
  `_blueprints/`, and `_remainder/` lane semantics.
- `.habitat/AUTHORITY-REMAINDER-SLICE-FRAME.md` for contextual remainder
  meaning and physical sorting discipline.
- `.habitat/frames/BLUEPRINT-KIND-GATHERING-FRAME.md` for the contrasting case
  where a missing constructible kind must be affirmed before gathering.
- `.habitat/frames/NICHE-LANE-SHAPING-FRAME.md` for the contrasting case where
  parent niche lanes must be shaped before deeper sorting.
- Live `.habitat/**/rule.json` manifests and runner files as evidence, not
  target authority.
- Current source files named by manifest `pathCoverage`, `scanRoots`, and
  runner artifacts as source-shape evidence.

## WHAT

This frame treats `_remainder/` as sorted visible debt that may become
reclaimable after earlier dominoes create or clarify destinations. It starts
from an idea, uses metrics to find the highest-signal remainder pockets and
adjacent rows, then narrows to a bounded slice whose rows can be judged against
existing authority destinations. The durable result is not a richer
classification table; it is a changed authority tree where reclaimed rows move
to their real owner, honest context rows move or remain in `rules/`, and
unreclaimed rows stay in the smallest honest `_remainder/` lane with an
explicit trigger for later work.

## WHY

Earlier remainder slices intentionally avoided forcing mixed or negative rows
into false owners. That was correct, but it leaves debt that can become
reclaimable once new destinations exist. A purely manual pocket-by-pocket pass
risks missing adjacent fungible rows; a broad metrics pass risks flattening
dependency order into a hidden corpus. This frame resolves that tension: use
analytics to see the candidate terrain, then use ontology and source evidence
to choose one bounded reclamation slice and physically change the tree. The
rejected alternative is a global remainder census that produces labels without
movement and makes future agents re-interpret the same hidden ledger.

## Construction History

Structural alternative considered: broad remainder corpus classification.

Why rejected or demoted: it would collect useful metadata but would not itself
change authority state. It also invites future agents to treat a snapshot as
truth even though each movement changes the facts needed for the next
decision.

Structural alternative considered: start only from the visible primary
remainder pocket and ignore adjacent rows.

Why rejected or demoted: when a destination such as `recipe-step` becomes
active, adjacent remainders in other niches may be fungible with the primary
pocket. Ignoring them leaves obvious state-space reduction on the table.

Structural alternative considered: move every row with matching file paths or
keywords into the destination.

Why rejected or demoted: file paths and keywords are evidence, not ownership.
Rows often scan current implementation surfaces because that is where drift
appears, not because those surfaces own the whole rule.

## Selection Commitments

In:

- One seed idea that names a possible reclamation direction or destination.
- Seed-directed `_remainder/` rows that analytics mark as candidate matches
  for the same existing destination, with compatible whole-rule owner,
  predicate, and proof shape.
- Adjacent non-remainder rows only when needed for comparison or to prevent a
  false move.
- Manifests, runner artifacts, and source files needed to decide whole-rule
  ownership.
- Physical movement, path repair, proof, and review for the final bounded
  slice.

Foreground:

- Reclaimability after earlier movement changed the tree.
- Metrics as triage, not authority.
- Whole-rule fit over keyword or path affinity.
- Destination-driven grouping over source-folder grouping.
- Adjacent fungible work when it shares the same destination and proof shape.
- Physical tree state over hidden classification.

Exterior:

- Global classification of all `_remainder/` rows.
- New destination creation unless another selected frame authorizes it first.
- Rows that only share a broad keyword, current implementation path, or runner
  artifact kind with the seed idea.
- Cleanup, split, consolidation, or retirement that must change behavior before
  movement.
- Durable metric reports that future agents must remember to consult.

## Hard Core And Protective Belt

Hard core:

1. `_remainder/` rows are reviewed evidence, not final owners and not
   ontology.
2. Analytics may propose candidate rows, but source-backed whole-rule fit
   decides movement.
3. A reclamation slice is destination-driven: it gathers rows that can move to
   the same existing authority destination or honest smaller lane.
4. Adjacent rows should be included only when they are fungible with the
   primary slice by owner, predicate, and proof shape.
5. The branch must end with physical movement or explicit falsification, not
   only a metrics note.

Protective belt:

- A row may stay in `_remainder/` if its target destination is not ready or its
  current rule mixes owners.
- A row may move to a smaller `_remainder/` lane when analytics reveal that its
  current remainder lane is too broad.
- A row may move to honest niche `rules/` if review proves it is intentional
  context authority, not deferred debt.
- A slice may start from one pocket and include adjacent rows from other lanes
  if the same destination and proof shape hold.
- Metrics scripts may be disposable shell or Node snippets; they do not need to
  become Toolkit code unless repeated use proves that need.

## Reframe Conditions

Reframe if the analytics show that the likely moves require a new constructible
kind, capability, projection surface, import-law surface, package-graph owner,
or runner authority. In that case, stop remainder reclamation and select the
frame that can legitimately create that destination.

Reframe if the candidate set is mostly rows that share only a word or path
fragment but diverge by owner, predicate, mutability, or proof shape. That is a
sign that the work is broad corpus classification, not reclamation.

Reframe if the slice can only complete by producing a classification document
without physical movement, falsification, or a smaller honest lane.

Degeneration trigger: if two consecutive uses of this frame create large
candidate lists but move fewer than a third of the primary rows, stop using
remainder reclamation as the selector and return to blueprint gathering, niche
lane shaping, or a new surface frame.

## Preflight Analytics

Preflight analytics are part of this frame. They happen after the seed idea is
named and before the bounded input set is finalized.

The goal is to reveal candidate pockets and adjacent slices, not to decide
ownership.

Minimum inputs:

- Live `.habitat/**/rule.json` manifests.
- `placement.niche`, `placement.blueprint`, `placement.category`, and
  `placement.artifactKind`.
- `pathCoverage`, `scanRoots`, `runner.files`, and `artifacts.baseline`.
- Runner artifact text when manifest metadata is too coarse.
- Current physical path, especially `_remainder/`, `rules/`, `_blueprints/`,
  and top-level `blueprints/`.

Useful metrics:

- **Exactness:** exact file paths and concrete files score higher than broad
  globs. Exactness is stronger when the row names one stage, step, package, or
  generated artifact.
- **Single-owner fit:** rows that touch one likely owner score higher than rows
  spanning domains, ops, recipes, maps, tests, SDK, and resources together.
- **Predicate shape:** contract, topology, generated artifact, public surface,
  dependency/effect tag, or callsite ownership predicates are more likely to
  reclaim into kind authority than pure cleanup-token forbids.
- **Current lane:** rows already in `_remainder/` are candidates; rows in
  intentional `rules/` lanes require stronger evidence before inclusion.
- **Whole-rule likelihood:** the entire current predicate, including scan
  roots, exceptions, hard-coded paths, remediation, and runner behavior, must
  plausibly fit the destination.
- **Mixed-surface penalty:** subtract confidence for rows combining runtime
  determinism, config normalization, import law, package graph, generated
  artifacts, and migration cleanup unless the destination already owns that
  combination.
- **Proof-shape compatibility:** rows that can use the same selected-rule
  proof and stale-reference scans are easier to include together.
- **Lane-change leverage:** rows that would empty or clarify a visible
  `_remainder/` pocket score higher than rows that would leave the same
  ambiguity behind.

Preflight output should be a short candidate table for the current branch or
turn only:

| Field | Meaning |
| --- | --- |
| `rule id` | Stable `rule.json.id`. |
| `current path` | Current packet path. |
| `signals` | Exactness, owner, predicate, lane, proof-shape, and mixed-surface notes. |
| `candidate destination` | Existing blueprint, context `rules/`, or smaller `_remainder/`. |
| `confidence` | High, medium, low, or falsifier candidate. |
| `include?` | Primary, adjacent, comparison-only, exclude, or stop. |

Do not commit this table as a standalone corpus. If a future domino needs
durable prework, record only the decisions that survive source-backed review in
the disposition receipt or active slice document. The final disposition receipt
is the durable record.

## Method

Use this method when an initial idea suggests one or more `_remainder/` rows
may now be reclaimable.

1. Reground in `.habitat/dominoes.md`, `.habitat/AUTHORITY-TREE-SHAPE.md`,
   `.habitat/AUTHORITY-ONTOLOGY.md`, `.habitat/AUTHORITY-REMAINDER-SLICE-FRAME.md`,
   and any active frame named by the current domino.
2. Name the seed idea in destination terms, not source terms. Example:
   "projection/placement rows may reclaim into `recipe-step`" is better than
   "map-output has four rows."
3. Declare existing candidate destinations before analytics. If no destination
   exists, either pick a different frame or explicitly mark the analytics as a
   falsifier search.
4. Run preflight analytics over live manifests and runner files.
5. Build a bounded candidate set:
   - primary rows from the seed pocket;
   - adjacent rows with the same likely destination and proof shape;
   - comparison rows only where they prevent a false move.
6. Drop rows whose only connection is broad keyword, current path affinity, or
   implementation coincidence.
7. Read manifests, runner artifacts, and exact source files for every primary
   and adjacent row.
8. For each row, write the whole-rule predicate in one sentence before
   choosing a destination.
9. Decide row disposition:
   - existing affirmed blueprint;
   - honest niche/context `rules/`;
   - smaller honest `_remainder/`;
   - retained current `_remainder`;
   - explicit exclusion;
   - falsifier.
10. Physically move packets only after the disposition model is coherent.
11. Preserve `rule.json.id`; update `placement`, `runner.files`, and
    `artifacts.baseline` for every moved packet.
12. Update active docs only where they govern the new durable state.
13. Run focused selected-rule proofs, manifest path proof, stale-reference
    scans, `git diff --check`, and the Habitat toolkit check.
14. Review adversarially for false destination fit, hidden classification
    ledger, missed adjacent fungible rows, stale paths, and over-broad claims.
15. Record a disposition receipt in `.habitat/dominoes.md` or the active
    slice doc. The receipt must match the physical tree.

## Decision Criteria

Move to an existing blueprint when:

- the whole rule applies to every valid instance of that blueprint;
- current hard-coded paths are instance parameterization gaps, not predicate
  contradictions;
- the row governs shape, contract, topology, lifecycle, public surface,
  generated artifact, or valid execution boundary of the kind; and
- the proof surface still makes sense after movement.

Move to honest niche/context `rules/` when:

- the row intentionally governs the current niche or context;
- another valid blueprint instance or sibling context could differ without
  violating the kind; and
- keeping it as `rules/` clarifies the tree rather than hiding deferred debt.

Move to a smaller honest `_remainder/` when:

- the row has been reviewed but not final;
- the current remainder lane is too broad;
- the future target is clearer than before but not yet available; or
- the row needs later split, consolidation, projection, import-law, package
  graph, build, runtime, or retirement work.

Retain in current `_remainder/` when:

- the row remains reviewed debt in the correct smallest honest lane;
- including it in the current slice would require a different destination or
  proof shape; or
- its movement would be documentation-only with no semantic clarification.

Explicitly exclude when source evidence proves the row is outside the seed
idea and no adjacent slice relation exists.

Stop and reframe when most candidates need destination creation or behavior
changes before movement.

## Team And Review Design

Use fresh bounded agents when the slice is broad enough to justify coordination
cost. Do not reuse prior agents for a new remainder reclamation slice.

Recommended team:

- **Metrics explorer:** runs or checks manifest/runner analytics and returns a
  candidate table with signals, not final ontology.
- **Ontology reviewer:** pressure-tests candidate destinations against whole
  rule fit, accepted blueprints, niche context, missing surfaces, and false
  path affinity.
- **Implementation reviewer:** after movement, checks stale paths, manifest
  references, physical lane correctness, missed adjacent rows, and proof gaps.

The main agent remains accountable for synthesis, final disposition, file
edits, proof claims, Graphite state, and closure.

Agent output contracts:

- cite concrete file paths and rule ids;
- distinguish high-confidence, medium-confidence, low-confidence, and
  falsifier cases;
- do not classify the whole corpus;
- do not propose new destinations unless the frame has already been falsified;
- return P1/P2/P3 findings with repair evidence.

## Receipt And Proof Contract

Every reclamation slice must record a disposition receipt with at least these
columns:

| Column | Meaning |
| --- | --- |
| `rule id` | Stable `rule.json.id`. |
| `start path` | Packet path at the beginning of the slice. |
| `signals` | Metrics that caused inclusion: exactness, owner fit, predicate shape, lane, whole-rule likelihood, proof shape. |
| `bucket` | Existing blueprint, context `rules`, smaller `_remainder`, retained `_remainder`, exclusion, or falsifier. |
| `target path` | Final packet path or retained path. |
| `whole-rule reason` | Why the entire current rule fits or does not fit the target. |
| `proof run` | Selected-rule proof, path proof, stale-reference scan, toolkit check, or no-move review proof. |
| `next trigger` | For retained or smaller `_remainder`, what future surface should revisit it. |

Minimum proof, run from the repo root of the active worktree:

```bash
git diff --check
bun run --cwd tools/habitat check
bun tools/habitat/bin/dev.ts check --rule <primary-or-moved-rule-id> --json
```

Also run:

- manifest path proof for moved packets;
- stale-reference scans for old packet paths;
- static scan proving the primary pocket has no sorted-but-unaddressed rows
  unless explicitly retained;
- review-agent pass with P1/P2 findings repaired or dispositioned.

## Anti-Patterns

- **Metrics-as-authority:** treating exact path counts or keyword clusters as
  ownership decisions.
- **Hidden corpus ledger:** producing a durable classification table while the
  tree stays unchanged.
- **Path-affinity move:** moving a row because it scans a directory, not
  because the whole predicate belongs to that owner.
- **Destination smuggling:** creating a new blueprint, capability, projection,
  import-law, or package-graph surface inside a reclamation slice.
- **Adjacent-slice sprawl:** including every row that shares a word with the
  seed idea.
- **Cleanup-first derailment:** rewriting, splitting, or retiring rows before
  the movement question is answered.
- **Receipt drift:** disposition table and physical tree disagree.

## Seed Example: Projection And Placement Remainders

Seed idea: after `mod-map` moved generated entrypoint and shipped catalog rows,
the remaining map-output projection and placement rows may be reclaimable into
existing `recipe-stage` or `recipe-step` authority.

Primary pocket:

- `.habitat/civ7/mapgen/map-output/_remainder/**`

Likely adjacent scan:

- `_remainder` rows that target exact standard recipe stage or step files;
- rows whose predicate is projection, placement, dependency/effect tag,
  contract, or callsite ownership;
- rows whose proof shape can be selected-rule Habitat/Grit proof without
  behavior change.

Likely exclusions:

- strategy-file locality rows;
- broad import-law/package-graph rows;
- runtime determinism or config normalization rows;
- concrete-domain retired-token history;
- Civ7 resource map-policy tables;
- Studio, SDK, visualization, or platform adapter rows unless the predicate
  whole-rule fits the same destination.

Candidate destinations:

- `.habitat/blueprints/recipe-stage/`
- `.habitat/blueprints/recipe-step/`
- `.habitat/blueprints/recipe/`
- `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/`
- the smallest honest `_remainder/` lane if the destination is still missing.

This seed example is not a final plan. It demonstrates how this frame starts
from an idea, uses metrics to find adjacent rows, and still requires
whole-rule source-backed disposition before movement.

## NOT HOW

This frame does not prescribe the exact Node script, grep command, branch name,
or row disposition for a future slice. Those belong to the implementation
prompt for the selected domino. The durable instruction is the method:
analytics reveal candidates, ontology decides whole-rule fit, movement changes
the tree, and receipts/proof close the slice.
