# Remainder Remediation Action Frame

Status: normative method frame for reviewed `_remainder` rows

Built: 2026-06-30

Owner: DRA Habitat authority-tree workstream

Durability: standalone method frame for turning any reviewed Habitat
`_remainder` corpus into executable remediation decisions and then carrying a
bounded domino through investigation, single-rule analysis, implementation,
verification, review, and closure.

## Frame Identity

Frame name: Remainder Remediation Action

For situation: reviewed Habitat rules already sit in `_remainder/`, their
receipt language is broad, and the next question is what kind of action will
reduce the most authority-tree state without inventing false ownership.

Mode: systematic workstream method

Object path: process-control and implementation

Primary object: live `_remainder` rule rows, not manifest categories.

## Purpose

This frame separates two axes that must stay separate:

- Rule manifest category describes what the live rule currently checks:
  `boundary`, `contract`, `structure`, `execution`, `policy`, `quality`, or
  `output`.
- Remediation action describes the kind of work that would reduce authority
  state space: invert negative checks into positive authority, close a
  structure, split mixed owners, consolidate duplicates, retire obsolete
  migration residue, admit an already-atomic context rule, or move enforcement
  into source/runtime rails.

Use this frame before choosing a sweep over reviewed `_remainder` rows. The
goal is not richer labeling for its own sake. The goal is to identify and then
execute the move that makes rules unnecessary, mechanically derivable,
honestly owned, or safely deleted.

This is a method frame, not a plan. It does not choose the next slice, commit
to a specific destination, or pre-decide which rows move. It defines the gates
that make a future slice decidable and executable.

## Source Boundary

Inputs:

- live `.habitat/**/rule.json` manifests for the current rule corpus and
  placement facts;
- `.habitat/frames/AUTHORITY-TREE-RULE-LEDGER.md` for current process-control
  rows;
- `.habitat/dominoes.md` for completed receipts, pending actions, and source
  order;
- relevant method frames named by the active domino;
- current runner files, support files, `pathCoverage`, `scanRoots`, and source
  roots as implementation evidence;
- repo-local architecture/product authority for owner placement and forbidden
  owners.

Excluded as authority:

- current `_remainder` directory name by itself;
- manifest `placement.category` as a remediation decision;
- keyword matches such as "config", "boundary", "artifact", or "runtime"
  without whole-rule owner evidence;
- old chat summaries, stale domino rows, generated output, or current file
  paths that conflict with accepted authority.

## Core Question

For each reviewed `_remainder` rule, ask:

> What action would make this rule either unnecessary, mechanically derivable,
> honestly owned, or safely deleted?

Do not start by asking whether the row's current manifest category is correct.
Category can be repaired later. The first decision is the state-space reducing
action.

## Remediation Actions

| Action type | Use when | State-space reduction |
| --- | --- | --- |
| `positive authority creation` | Multiple negative rules point at a missing constructible kind, surface, schema, manifest, or governance object that should exist directly. | Creates the real authority once, then absorbs, rewrites, or deletes negative proxies. |
| `closed structure inversion` | Rules forbid stale paths, keys, folders, or file shapes, but a positive closed structure can define the allowed set. | Replaces many open-ended negative assertions with one positive shape contract. |
| `boundary inversion` | Rules forbid import paths, private reaches, or dependency leaks, but the real invariant is an allowed boundary graph or public surface. | Converts scattered import forbids into a declared boundary/import contract. |
| `split by owner` | One rule predicate spans multiple owners, contexts, stages, or proof shapes. | Produces atomic rules that can later move, invert, consolidate, or retire independently. |
| `consolidation/dedup` | Multiple rules guard overlapping residue or the same migration seam through narrower path/token variants. | Collapses duplicate checks into one intentional rule or one positive authority surface. |
| `retirement/garbage collection` | The rule protects against obsolete migration residue that no longer exists or no longer needs live enforcement. | Deletes enforcement state instead of preserving historical cleanup as current authority. |
| `context admission` | The rule is already atomic and honestly owned by its current context, even if future improvement is possible. | Moves the row out of visual debt without pretending it is a reusable kind. |
| `runtime/source validation` | The invariant should be enforced by source code, runtime validation, generated manifests, Nx graph policy, package-local checks, or another native producer rail rather than Habitat negative text checks. | Moves durable enforcement into the producing system and removes brittle text guards. |

## Decision Order

Apply the action gates in this order for a row, pocket, or candidate slice:

1. **Positive authority first.** If a missing positive authority surface would
   eliminate several negative rules, design that surface before parsing each
   negative rule in isolation.
2. **Closed structure before token bans.** If the allowed structure can be
   declared, prefer it over growing retired-token forbids.
3. **Boundary graph before import forbids.** If imports can be expressed as an
   allowed boundary, prefer the positive boundary over path-by-path negative
   rules.
4. **Split before sweeping by manifest category.** If a rule still has mixed
   owners, atomize it before assigning final remediation action to its parts.
5. **Consolidate before preserving variants.** If rows duplicate the same
   migration guard, keep one intentional owner or absorb both into the positive
   authority.
6. **Delete historical cleanup when safe.** Do not convert migration history
   into permanent authority without a current invariant.
7. **Admit context rules only after the previous gates.** A context rule can be
   live and imperfect, but it should not hide a missing positive authority or a
   mixed-owner predicate.

Decision-order consequence: do not create new manifest categories as a
substitute for remediation decisions. First classify the action. Split only
rules whose blocker is genuinely mixed ownership. Repair manifest category
metadata only when the rule is atomic enough for that category to mean
something.

## Full Domino Stages

### Stage 0. Ground The Workstream

Objective:

- select one bounded `_remainder` remediation domino and carry it through
  implementation or explicit falsification.

Required actions:

- check branch, Graphite stack, dirty state, and unrelated files;
- read the active repo instructions and closest routers for any paths touched;
- read this frame plus any named companion frame;
- confirm the current live rule count, current `_remainder` rows, and current
  ledger coverage;
- name the source oracle and source order for this domino.

Output:

- short workstream note in the active thread or a durable frame/receipt if the
  slice is complex;
- current corpus counts and protected paths;
- explicit non-goals.

Stop if:

- the ledger and live manifest count disagree;
- `_remainder` rows are not actually processed/receipt-backed;
- the slice depends on a new authority surface that is not yet designable from
  source-backed evidence.

### Stage 1. Build The Remainder Action Matrix

Objective:

- convert broad receipt language into implementation-grade remediation
  actions.

For each reviewed `_remainder` row, record:

- rule id;
- current path;
- current manifest category;
- current receipt evidence;
- current pending action language;
- remediation action type;
- proposed positive authority, if any;
- false authority or forbidden destination rejected;
- whether split is required first;
- whether source qualification is required before slice selection;
- whether implementation is ready now;
- expected destination, deletion, or enforcement home;
- concrete blocker or proof needed;
- state-space reduction estimate: `high`, `medium`, or `low`;
- confidence: `high`, `medium`, or `low`;
- candidate domino group.

Output:

- a `Remainder Action Matrix` in the authority-tree ledger, a linked frame, or
  the active domino receipt.
- If the matrix lives outside the ledger, the scoped ledger rows must name or
  link the durable matrix location.

Stop if:

- more than a small minority of rows cannot be assigned an action without
  reading source; keep those rows marked `needs source qualification` and
  perform a source-qualification pass before Stage 2 selects an implementation
  slice.
- any likely destination cannot be paired with an explicit false-authority
  rejection for the adjacent tempting destinations.

### Stage 2. Select The Domino Slice

Objective:

- choose one coherent action group that reduces the most state without
  broadening the blast radius.

Selection criteria:

- shared remediation action type;
- shared positive authority candidate or shared owner;
- compatible proof shape;
- compatible write set;
- high state-space reduction;
- low risk of creating false authority;
- blockers are already qualified or source-qualifiable before edits.

Preferred slice examples:

- a `positive authority creation` slice that eliminates several negative
  proxies;
- a `closed structure inversion` slice that replaces token/path forbids;
- a `boundary inversion` slice that turns import forbids into an allowed public
  surface or boundary graph;
- a `split by owner` slice only when mixed-owner predicates block later
  sweeps.

Output:

- selected rows;
- excluded rows and why;
- expected end state for each selected row.

Stop if:

- the best slice is not an implementation slice but a missing authority
  design; in that case create or update the appropriate frame first.
- the candidate group depends on unqualified source facts that could change
  which rows belong in the group. Return to Stage 1 source qualification before
  implementation selection.

### Stage 3. Analyze One Rule At A Time

Objective:

- avoid group labels hiding predicate details.

For each selected rule:

- read `rule.json`, runner file, support files, baseline, and source paths;
- decompose the predicate into atomic clauses;
- identify owner, forbidden owners, and proof shape for each clause;
- classify whether the whole rule fits the selected action;
- decide whether to move, split, consolidate, retire, invert, or keep;
- write the per-rule decision before editing.

Single-rule decision template:

```text
Rule:
Current path:
Current category:
Category metadata decision:
Receipt evidence:
Source files inspected:
Predicate clauses:
Clause decisions:
Owners:
Forbidden owners:
Remediation action:
Whole-rule fit:
Split needed:
Positive authority candidate:
False authority / forbidden destination rejected:
Destination / deletion / enforcement home:
Rule id plan:
Implementation decision:
Proof class / command:
Ledger/domino delta:
Residual follow-up:
```

Stop if:

- one rule falsifies the slice's shared action type;
- a split would require behavior changes outside the selected owner;
- the rule's source paths no longer exist or no longer support the old
  predicate.

### Stage 4. Design The Implementation

Objective:

- make the edit plan mechanical before touching files.

For each accepted row:

- map old packet path to new packet path or deletion;
- decide whether to preserve rule id or create new rule ids for split parts;
- choose native runner type: prefer Grit for straightforward source patterns;
  use Habitat script only for positive, cross-file, generated-manifest, or
  graph checks that Grit cannot express cleanly;
- update manifest placement, category, operation, `supportFiles`, path
  coverage, scan roots, and runner references;
- decide whether execution-surface docs must be regenerated;
- decide which ledger and domino rows must be updated.

Output:

- implementation checklist with exact file moves, new/deleted packets,
  metadata changes, and verification commands.

Stop if:

- the best implementation creates a broad catch-all bucket;
- an apparently simple split needs a new constructible kind or producer rail.

### Stage 5. Execute The Slice

Objective:

- change the tree according to the predeclared implementation plan.

Allowed actions:

- move/split/delete rule packets;
- create new atomic rule packets;
- repair runner imports and support-file paths;
- update manifests and baselines;
- remove empty `_remainder` directories;
- update authority-tree docs only when shape or method changes;
- regenerate generated analysis docs through their owning command when paths
  change.

Forbidden actions:

- broad search-replace across product vocabulary;
- hand-edit generated outputs;
- create catch-all niches or blueprints to clear visual debt;
- change unrelated dirty files;
- silently change rule behavior without naming the semantic decision.

Output:

- applied file moves, additions, deletions, and manifest edits match Stage 4;
- old and new rule ids are listed;
- generated analysis docs are regenerated only through their owning command;
- unrelated dirty files remain untouched and named if present.

Stop if:

- an edit requires a destination, owner, or runner that Stage 4 did not
  predeclare;
- a moved rule cannot resolve its support files, runner, or source roots;
- a behavior change appears that was not named in the Stage 3 decision.

### Stage 6. Verify

Objective:

- prove the exact claim made by the slice.

Minimum verification:

- focused `bun habitat check --rule <id> --json` for every new, moved,
  widened, or retained-but-touched rule;
- support-file and runner-path resolution across live manifests;
- ledger coverage against live `.habitat/**/rule.json` manifests;
- `bun habitat classify .habitat`;
- `git diff --check`;
- regenerated execution-surface docs when rule paths or runner paths change.

Additional verification depends on action type:

- `positive authority creation`: prove negative proxies are absorbed, deleted,
  or intentionally retained with a new pending action.
- `closed structure inversion`: prove the positive structure detects missing,
  extra, and stale shape where practical.
- `boundary inversion`: prove allowed and forbidden import surfaces.
- `split by owner`: prove old aggregate ids are no longer live and each new
  atomic id passes.
- `consolidation/dedup`: prove retained rule coverage subsumes retired
  variants.
- `retirement/garbage collection`: prove retired tokens/paths are absent and no
  live source still needs the guard.
- `runtime/source validation`: prove the native rail runs and the Habitat proxy
  is removed or narrowed.

Output:

- verification table with command, result, proof claim, evidence path or output,
  and limits of the claim;
- failed or skipped checks with rationale;
- residual risk that must be reviewed before closure.

Stop if:

- any focused check for a new, moved, widened, or retained-but-touched rule
  fails;
- live manifest count and ledger row count diverge without an explicit
  recorded reason;
- support-file or runner-path resolution fails;
- generated execution-surface docs are stale after rule path or runner path
  changes;
- a proof command passes but does not prove the claim the slice needs.

### Stage 7. Review

Objective:

- catch false authority and incomplete closure before committing.

Use fresh reviewers for material slices. Recommended lanes:

- action-model reviewer: checks whether the remediation action is correctly
  chosen and higher-order positive authority was not skipped;
- source-owner reviewer: checks owners, forbidden owners, and source-backed
  placement;
- proof reviewer: checks commands prove the exact claims and that old
  aggregates are not still live;
- language/ledger reviewer: checks receipts and pending actions are concrete
  enough for future mechanical work.

Accepted P1/P2 findings block closure. P3 findings may close only with
recorded residual risk.

Output:

```text
| Finding | Severity | Disposition | Repair evidence | Residual risk / follow-up |
| --- | --- | --- | --- | --- |
| <specific issue> | P1/P2/P3 | accepted/rejected/deferred/invalidated/cleared | <file, command, or reason> | <risk or none> |
```

Stop if:

- any P1/P2 finding lacks a final disposition before closure;
- any accepted P1/P2 finding lacks repair evidence;
- any rejected P1/P2 finding lacks source-backed rationale;
- any invalidated P1/P2 finding lacks later evidence that invalidates it;
- any deferred P1/P2 finding lacks an explicit out-of-scope owner, trigger,
  and reason it does not block this closure;
- any cleared P1/P2 finding lacks the command, diff, or source evidence that
  clears it;
- P3 residual risk is not named in the closure record.

### Stage 8. Record And Close

Objective:

- leave the next operator with durable truth, not chat-only memory.

Required records:

- update `.habitat/frames/AUTHORITY-TREE-RULE-LEDGER.md` for every scoped row,
  including non-moves and pending actions;
- add or update a `.habitat/dominoes.md` disposition receipt;
- include a durable review disposition table in the domino receipt or a linked
  review ledger;
- update this frame only if the method itself changed;
- update `.habitat/AUTHORITY-TREE-SHAPE.md` only if the tree shape or lane
  semantics changed;
- record generated-doc regeneration if performed;
- commit through Graphite when the slice is reviewable.

Closure is not allowed unless:

- all accepted P1/P2 findings are repaired or explicitly resolved by sealed
  authority;
- any deferred P1/P2 finding is outside this domino's closure boundary and has
  a named owner plus trigger;
- Graphite branch/stack state is recorded;
- final commit hash or explicit no-commit rationale is recorded;
- worktree state is clean, or every remaining dirty path is named as unrelated
  and owned by someone else;
- the workstream owner accepts the closure claim.

Closure claim must state:

- selected rows;
- moved/split/deleted/retained rows;
- live rule count after the slice;
- remaining `_remainder` count;
- verification commands and failures;
- proof claims with evidence and limits;
- residual blockers and next recommended domino;
- Graphite branch/stack state, commit hash or no-commit rationale, and final
  worktree state.

## Review Team Design For This Frame

Use an orchestrator-plus-specialists shape:

- Owner: accountable for synthesis, edits, verification, review disposition,
  Graphite state, and final proof claims.
- Action-model reviewer: adversarially checks action-type selection and
  whether positive authority was skipped.
- Source-owner reviewer: validates owner placement, forbidden owners, and
  source-backed constructibility.
- Proof reviewer: validates checks, corpus counts, ledger coverage, and
  deletion/move claims.
- Language/ledger reviewer: validates that receipts, pending actions, and
  handoff text are concrete and not broad recommendation language.

Each reviewer gets a fresh prompt, a bounded scope, and a concrete return
contract. Do not reuse prior agents for a new review wave.

## Falsifiers

This frame is the wrong tool if:

- the rows have not yet been processed into `_remainder` with receipt evidence;
- the active question is whether a new blueprint kind should exist and no
  candidate kind has been source-backed yet;
- the desired work is a full metadata taxonomy migration rather than a
  remediation action pass;
- the slice cannot produce either physical movement, deletion, native
  enforcement, or a concrete implementation-grade action matrix;
- the only output would be a loose recommendation list.

## Instantiating This Frame

To instantiate this frame for a concrete domino, write a short active-slice
header before Stage 0:

- corpus name and path scope;
- seed question, if any;
- rows in scope;
- rows explicitly out of scope;
- authority/source order;
- expected proof boundary;
- stop conditions;
- review lanes.

Then run the stages in order. The slice may stop after Stage 1 with a durable
action matrix if the matrix proves that no implementation group is ready. It
may stop after Stage 3 if source qualification falsifies the candidate action.
It should continue through Stage 8 when the selected action is implementation
ready.

## Stage Transition Invariants

- Stage 1 does not authorize movement; it creates the action model.
- Stage 2 does not authorize edits; it selects a candidate slice.
- Stage 3 decides row semantics one rule at a time.
- Stage 4 turns decisions into a mechanical edit plan.
- Stage 5 edits only what Stage 4 predeclared.
- Stage 6 proves the actual claims, not the hoped-for outcome.
- Stage 7 blocks closure on accepted P1/P2 findings.
- Stage 8 records the durable state so the next domino does not depend on
  chat memory.
