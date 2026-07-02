# Closed Structure Enforcement Method Frame

Status: active normative method frame

Built: 2026-07-01

Owner: Habitat authority-tree workstream steward

Durability: standalone method frame for repeated authority activation slices

## Frame Identity

Frame name: Closed Structure Enforcement

For situation: the Habitat authority tree has enough sorted rule metadata and
architecture authority that further progress should come from choosing a kind
of thing, declaring its closed structure, enforcing that structure, and then
burning down local rule packets that only existed because the structure was not
closed yet.

Mode: co-framed normative method

Object path: objective and solution frame

Primary object: the repeatable end-of-one method for authority activation, not
the next queue, not a new ledger, and not a reporting layer.

## Purpose

Use this frame when the next useful move is to pick a real kind of thing and
make it obey an architecture-backed closed structure.

The method is intentionally simple:

```text
Pick one kind.
Say what true structure is.
Enforce it.
Fix everything red.
Remove the rule packets made unnecessary.
Re-read and pick the next kind.
```

The point is not to explain every rule better. The point is to make a durable
structural assertion strong enough that many rule packets either collapse into
the assertion, become clear exceptions, or disappear.

## Philosophy

This is the design and development philosophy for the remaining authority
dominoes:

We choose what should be true from architecture authority and source-backed
domain knowledge. We lay it down as live enforcement. Current files are then
read against that assertion. Anything that does not match is repaired, moved,
deleted, or intentionally excepted. When the structure is enforced, every rule
packet that only guarded a symptom of the old open structure is removed or
absorbed.

The method does not ask current rule packets what the future shape should be.
Rule packets are evidence: they describe what the repo has been trying to
protect while the true structure was still open. The future shape comes from
architecture documents, accepted Habitat authority, source facts, and direct
user decisions.

This frame can change the next selector only when the change is explicit. If a
canonical queue or ledger currently names another next slice, the steward must
either re-warrant that operational selector to the closed-structure run or
state that direct user authority has superseded the old selector for this run.
The frame itself is not a second queue.

This is an end-of-one approach. Each run becomes durable only when a selected
law is tied to a live red/green gate or when the run proves that no such law can
yet be asserted from authority. A useful thought, selection note, or commonality
scan is working memory until it reaches that gate.

## Selection Commitments

In:

- one kind of thing at a time, such as `domain`, `domain-operation`,
  `recipe-stage`, `artifact`, or another architecture-backed kind;
- architecture documents and accepted Habitat authority that can say what the
  kind should look like;
- all current instances of the selected kind;
- files and logic that violate the chosen closed shape;
- rule packets whose predicates overlap the chosen closed shape.

Foreground:

- live structure over descriptive metadata;
- closed enforcement over negative local proxy rules;
- code movement and semantic placement as part of enforcement;
- simple red/green feedback from the enforced shape;
- deleting rules made unnecessary by the new structure.

Exterior:

- new reporting systems, side ledgers, harnesses for the harness, and staged
  process artifacts whose only job is to describe the process;
- broad simultaneous redesign of every kind;
- solving tiny semantic edge cases before the selected structure exists;
- preserving rule packets because they were historically useful;
- making current file layout the oracle when architecture authority says
  otherwise.

## Hard Core

1. A chosen kind gets one asserted closed structure before its local residue is
   solved rule by rule.
2. Architecture authority decides the target shape; current code and rule
   packets reveal violations and overlap.
3. Enforcement is live and structural, not only documentary.
4. Every nonconforming file or logic fragment gets a destination, deletion, or
   explicit exception.
5. A closed structure run is complete only when overlapping proxy rules are
   removed, absorbed, or intentionally retained for a different concern.

## Protective Belt

The closed structure may start narrow. It can cover only the chosen kind and
only the facts architecture authority supports now.

The enforcement home can vary by kind, but it must be a live repo gate reached
through an existing Habitat, Nx, package, hook, or native owner command path.
A standalone report, ad hoc script, generated manifest note, or architecture
test that is not wired into normal red/green execution is not closed
enforcement.

Some files will not fit the first asserted shape. That does not weaken the
method. It creates semantic remainder work: inspect the logic and decide where
it belongs under the new shape or whether the shape needs an explicit
exception.

Some overlapping rules will survive. They survive only when they protect a
distinct concern after the closed structure is enforced. They do not survive
as duplicate symptom guards.

## Falsifier

This frame is wrong if a selected run cannot produce a live structural
assertion. A document that only explains intended structure without making the
repo red or green is not this method.

It is also wrong if closed enforcement is added but overlapping rule packets
remain untouched because they are treated as historical obligations rather
than current authority. The point of the method is reduction by forceful
structure, not better annotation.

## Structural Alternative Rejected

Alternative: continue with rule-by-rule semantic remediation and select the
next implementation-ready slice from the current queue.

Rejection: rule-by-rule remediation is now below the useful level for many
remaining rows. It preserves the open structure and spends effort on local
predicate meaning. Closed structure moves the unit of analysis upward: when the
kind's shape is enforced, many local predicates become either redundant or
obviously misplaced.

Alternative: create a generic boundary or structure authority framework first.

Rejection: that creates another abstraction layer around the authority tree.
The stronger move is concrete: pick `domain`, `domain-operation`, or another
real kind, assert its shape, and let current violations produce the work.

## Deterministic Workstream Geometry

This workstream is stateful without requiring heavy reporting. It advances by
turning one selected law into a live gate, then burning down every red instance
against a decision book. The method permits one per-domino decision document
when the slice is too large to execute from the aggregate frame alone. That
document is an execution artifact: it carries the locked law, red rows,
destinations, gates, and proof for one domino. It is not a standing queue,
ledger family, or reporting layer.

The loop is:

```text
Assess -> Design structure -> Analyze red -> Investigate change classes ->
Lock in -> Design fan-out -> Implement -> Review -> Polish and realign
```

Assess: choose one architecture-backed kind and name the source oracle.

Design structure: assert the closed structure in positive form.

Analyze red: read the current repo against that structure and list red paths.

Investigate change classes: classify each displaced file or symbol into a
known move class: delete, move to a named owner slot, move to an external owner,
or exclude from this domino because it belongs to another selected law.

Lock in: write the decision book before implementation starts. This is the
point where the run becomes deterministic: structure clauses, file-shape Grit
entries, owner slots, move classes, and exclusions are fixed.

Design fan-out: only after lock-in, assign agents bounded rows. An agent may
resolve semantic content inside a locked destination class; it may not invent a
new bucket or change the selected law.

Implement: change the repo to match the law.

Review: verify that red paths were fixed, file-shape gates prevent smuggling,
and overlapping packets are actually subsumed.

Polish and realign: remove stale packet overlap, repair docs touched by the
new law, and leave the stack clean.

The loop starts by naming the law in one sentence:
`A <kind> has this closed structure.` The law is not a guess from the existing
tree. It is the strongest architecture-backed assertion selected for the run.

The semantic investigation asks for the common denominator across current
instances of the kind, but current commonality can only propose a candidate
law. The law itself must come from direct user decision, accepted Habitat
authority, controlling architecture documents, or source facts that those
authorities already make relevant. Current code remains implementation
evidence, not target ownership authority. If a file does not fit, the question
is not "how do we preserve this rule?" The question is "which locked move class
owns this logic now that the kind has a closed structure?" The answer is one of:
destination inside the selected structure, destination outside the selected
structure, deletion, or exclusion into another selected law. Before code moves,
each moved fragment has a destination owner, allowed import shape, target file
or module, and verification boundary.

Implementation changes the repo to match the law. That includes moving code.
Closed structure enforcement is not only a check over existing paths; it is a
decision that some existing paths should stop existing and some logic should
live elsewhere.

After the repo conforms, the rule surface is read again. Any rule packet whose
predicate is now enforced by the closed structure is removed or absorbed. Any
rule packet that still protects a distinct concern is kept with that concern
named. This is the reduction moment. The run ends with less interpretive debt
than it started with.

Then the selector re-reads the changed tree and chooses the next kind. No next
kind inherits authority from the previous one. It inherits only the changed
repo state.

## Stages As Irreversible Progress

The stages below are not a checklist. They describe the kind of state change
that has happened when the work is allowed to pause.

### Law Asserted With A Gate

Progress has occurred when one kind has been chosen, competing kinds have been
made exterior, and the chosen law has a live red/green consequence. The work
has a target such as `domain`, not a general desire to improve boundary rules,
and the repo now has a gate that can fail when the law is violated.

The run note can be as small as:

```text
Selected law: <kind> should have <closed structure>.
Source: <architecture authority>.
Exterior: <nearby kinds not being solved here>.
Gate: <existing command or owner rail that turns violations red>.
Instances read: <current instance set>.
Semantic finding: <common denominator or no-law proof, with source refs>.
Red now: <violating paths or none>.
Destinations: <moves/deletions/exceptions decided>.
Rules removed or absorbed: <ids>.
Proof: <commands or owner rails run>.
Next selector: <re-warranted next kind or old selector restored>.
```

### Semantic Investigation Bound To The Gate

Progress has occurred only when current-instance investigation is folded into
the selected law, the live gate, or a no-law proof in the same run note.
Commonality found in the current tree is not authority by itself. It becomes
useful only when it is tied back to direct user decision, accepted Habitat
authority, controlling architecture documents, or relevant source facts.

This is where semantic investigation belongs, but it is not an independent
pause boundary. Mere repetition is evidence, not law.

### Closed Shape Asserted

Progress has occurred when the kind's allowed structure is stated in enough
detail that red paths can be fixed without inventing the destination during
the fix. This is the point of no return for the run. After this point,
nonconforming current files are not alternative truths. They are work to do,
exceptions to name, or evidence that the assertion was premature.

For a domain, the law must be grounded in the accepted architecture authority
for MapGen domain ownership. If the current accepted authority names semantic
ownership but not exact directory grammar, the run must either assert only the
semantic structure that authority supports or first obtain a direct user or
authority decision for the directory grammar.

### Violations Burned Down

Progress has occurred when red paths have been moved, rewritten, deleted, or
excepted. The run must decide destinations for old code. A file that does not
fit the closed shape is decomposed by logic: each piece either belongs in the
new shape, belongs to another owner, is dead, or reveals a missing exception.
Each destination decision carries source-owner proof, allowed imports, target
module path, and the verification boundary that will prove the move.

This is where the method does real development work. The repo is changed so
the assertion becomes true.

### Rule Surface Reduced

Progress has occurred when overlapping rule packets are compared against the
new enforcement and disposed. The useful question is not whether a rule still
matches its old predicate. The useful question is whether the predicate is now
covered by the closed structure. If yes, remove or absorb it. If no, rename the
distinct remaining concern.

The output stays the same small run note:

```text
Selected law:
Gate:
Red now:
Destinations:
Rules removed or absorbed:
Proof:
Next selector:
```

### Next Kind Chosen From The Changed Tree

Progress has occurred when the next selector is re-warranted from the repo
after the closed structure run, not from a stale queue. The prior run may have
made an upcoming slice obsolete. It may also have exposed a better kind to
close next.

## Capabilities This Gives Us

Closed structure enforcement turns metadata into leverage. The category,
blueprint, niche, and rule ids are no longer the work product; they are search
handles for finding which packets overlap a structural assertion.

It gives agents a stronger read path. Instead of asking what a local negative
rule was trying to prevent, they can ask whether the rule is redundant under
the kind's closed shape.

It gives code movement a destination. The method requires the selected kind to
name where compliant logic belongs before violations are burned down. That
prevents "fixes" that merely shuffle files between local symptoms.

It turns review into adversarial validation of one law. A reviewer does not
need to review a new process; they check whether the law is architecture-backed,
whether red paths were actually fixed, and whether rule removals are justified
by live enforcement.

It creates reliable pauses. At every pause point, either a selected law has a
live gate, violations were reduced, rules were removed, or the run proved that
no law can yet be asserted from current authority. The workstream does not
depend on remembering a long conversation.

## Detecting Overlapping Rules

Overlap detection starts from the chosen law, not from a global audit.

Use the smallest metadata surface that finds likely overlaps:

- `placement.blueprint` for rules claiming the same kind;
- `placement.category` for structural classes such as `boundary` or
  `structure`;
- `placement.niche` for current contextual owners;
- `pathCoverage`, `scanRoots`, and runner files for actual checked files;
- rule text fields for old symptom vocabulary.

The first pass finds candidates. The second pass reads the predicates against
the new enforcement. A rule overlaps when its forbidden condition cannot occur
without also violating the closed structure, or when its only remediation is
"make this instance fit the closed structure."

Rules that mention the same files are not automatically overlaps. Rules that
share a category are not automatically overlaps. Overlap means the new
enforcement subsumes the old reason for the rule.

Deletion requires a predicate-to-enforcement mapping. The steward must be able
to point from the old rule's checked corpus and failure condition to the new
closed-structure gate that now fails the same invalid state. If the old runner
or scan roots cover a distinct corpus, the rule is not deleted until that
coverage is absorbed, narrowed, or proven irrelevant. When feasible, use a
negative probe or fixture to show the new gate catches the old violation class.

## Removing Rules

After enforcement is live, rules have four possible outcomes.

Absorbed: the predicate becomes a clause or fixture inside the closed
structure enforcement.

Deleted: the predicate has no remaining independent authority because the
closed structure fully covers it, with scan-root and failure-condition parity
shown against the new gate.

Retained with narrowed reason: the rule protects a different concern after the
closed structure is enforced, with scan roots, owner, and failure condition
narrowed so it no longer belongs to the overlapping rule family.

Reframed for another kind: the rule was evidence for a different structure
that should be closed later, and it has moved to the smallest honest owner or
holding lane instead of surviving in the selected kind's overlap set.

No rule stays live merely because it once carried useful pressure. No retained
or reframed rule survives without a live non-overlap proof.

## Concrete Seed: Domain Closed Structure

The first likely application is MapGen domain structure.

Architecture authority already describes semantic domain ownership: pure
algorithms, contract-first operations, strategies, rules, domain types, and
reusable domain semantics belong to domains; runtime context, recipe ordering,
adapter calls, and stage orchestration do not. If an accepted authority also
names exact directory grammar, that grammar can become the closed shape. If it
does not, the first domain run should assert the semantic boundary first and
make directory grammar a direct decision before enforcing it.

The closed-structure assertion would make each domain red or green against the
supported shape. Nonconforming files would be moved or decomposed by semantic
destination. Then Habitat rule packets about local domain import shims,
strategy locality, public surfaces, config facade misuse, or operation layout
would be compared against the now-live shape and removed where subsumed.

This seed is valuable because it is concrete, source-backed, and likely to
collapse more than one pending rule family. It is not a promise that `domain`
must be first. It is the exemplar of the method.

## Team Use

The main steward owns the law, the edit, and the deletion claim. Agents are
useful only as adversarial readers or bounded evidence gatherers.

A reviewer may ask:

- Is the selected law backed by architecture authority?
- Does the asserted structure make the repo red or green?
- Were red paths actually fixed rather than explained away?
- Did the semantic remainder receive real destinations?
- Are the removed rules truly subsumed by enforcement?

The team design is intentionally small. No agent owns a parallel process, no
agent creates a new ledger, and no review lane becomes a standing ceremony.

## Agent Review Prompts

Use these prompts when this frame or a future closed-structure run needs
adversarial review. They are disposable review prompts, not standing roles.

### Structure Authority Reviewer

```text
You are reviewing a Habitat closed-structure method frame. Your job is to be
adversarial about whether it actually forces structure, or whether it smuggles
in another reporting/process layer.

Read:
- .habitat/frames/CLOSED-STRUCTURE-ENFORCEMENT-METHOD-FRAME.md
- .habitat/AUTHORITY-ONTOLOGY.md
- .habitat/AUTHORITY-TREE-SHAPE.md
- docs/projects/engine-refactor-v1/architecture-normalization-packet.md
- .agents/skills/civ7-architecture-authority/SKILL.md
- .agents/skills/civ7-architecture-authority/references/source-map.md

Return findings only. Focus on P1/P2 issues:
- places where the frame creates a harness/reporting layer instead of direct enforcement;
- places where current code or metadata could accidentally become the target authority;
- places where "closed structure" lacks a live red/green enforcement meaning;
- places where the method would preserve rules instead of burning down subsumed ones.

Return file:line findings. Do not return generic checklist feedback. Ask an
open question only if it blocks correctness.

Do not edit files.
```

### Closed Loop Reviewer

```text
You are reviewing whether the closed-structure method can pause and resume
without creating process artifacts or counting pre-enforcement notes as
progress.

Read:
- .habitat/frames/CLOSED-STRUCTURE-ENFORCEMENT-METHOD-FRAME.md

Return findings only. Focus on P1/P2 issues:
- whether each stage leaves behind irreversible progress;
- whether the frame can pause without long context;
- whether overlap detection is enough to remove rules after enforcement;
- whether it accidentally reintroduces ledgers, queues, or staging-before-staging.

Return file:line findings. Do not return generic checklist feedback. Ask an
open question only if it blocks correctness.

Do not edit files.
```

### Prompt/Agent Reviewer

```text
You are reviewing the frame's agent prompts and team guidance. Your job is to
make sure the prompts produce useful adversarial review without generic
checklist behavior or over-search.

Read:
- .habitat/frames/CLOSED-STRUCTURE-ENFORCEMENT-METHOD-FRAME.md

Return findings only. Focus on P1/P2 issues:
- whether each prompt has one bounded job and a clear return contract;
- whether any prompt asks the agent to create new process artifacts;
- whether the prompt language preserves the user's intent: pick one thing,
  assert how it should be, fix what is red, remove redundant rules;
- whether the review team is small enough to justify its overhead.

Return file:line findings. Do not return generic checklist feedback. Ask an
open question only if it blocks correctness.

Do not edit files.
```

## Maintenance

Update this frame only when the method itself changes. Do not use it to record
which kind is currently selected, which paths are red, or which rules were
deleted in a particular run. Those belong in the small run output, the relevant
commit, and any existing authority records that the changed structure affects.
