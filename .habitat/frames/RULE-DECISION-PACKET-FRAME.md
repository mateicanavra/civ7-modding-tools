# Rule Decision Packet Frame

Status: normative method frame

Durability: standalone method frame for producing a full `n = 1` semantic
decision packet for one Habitat rule that has already been classified as
needing action.

## Frame Identity

Frame name: Rule Decision Packet

For situation: a live Habitat rule has a concrete action classification, but
implementation is not yet safe because the predicate must be decomposed,
owners must be named, and the exact semantic decision must be recorded.

Mode: systematic method reference

Object path: problem-to-decision frame for one rule

Primary object: one rule predicate and its packet evidence.

## Purpose

Use this frame after a rule action classification says deeper work is needed.
The decision packet turns broad action language into an implementation-ready
semantic decision. It is where clause decomposition belongs.

This frame does not move files, edit manifests, delete rules, or run a
remediation slice. It produces the decision record that a later implementation
slice consumes.

## Selection Commitments

In:

- the rule's manifest, runner, support files, baseline, and source/path
  coverage;
- current source code and docs needed to verify predicate clauses;
- current process evidence for the rule;
- adjacent rules only when needed to prove overlap, split, consolidation, or
  false ownership.

Foreground:

- atomic predicate clauses;
- clause owners and forbidden owners;
- whether the whole rule can be acted on as one unit;
- the exact implementation decision and proof class.

Exterior:

- corpus prioritization;
- implementation mechanics;
- Graphite branching;
- speculative future ontology beyond what the rule's decision requires.

## Hard Core

1. A decision packet starts from an already-classified rule.
2. The rule predicate is decomposed before implementation is designed.
3. Every clause has an owner, forbidden-owner statement, and proof shape.
4. Whole-rule movement is allowed only when every clause belongs to the same
   owner and proof shape.
5. Retired literals do not automatically require replacement authority. If a
   clause only forbids a retired key, path, token, alias, or property, the
   packet must name concrete recurrence risk before keeping or replacing the
   assertion.
6. Residual work must be explicit enough that a later slice does not need chat
   memory.

## Retired Literal State Collapse

A retired literal is a previously valid or transitional name that no longer
belongs to the public/source contract. Retired literals collapse state: they
normally disappear because valid source structure, schemas, TypeScript types,
constructors, or compilers own the current shape.

Do not create a replacement negative assertion merely because a retired literal
can be typed in source. Do not move that pressure into package-owned tests.
Package tests may prove behavior or validation semantics when those are the
product claim, but they are not storage for old property blacklists.

Keep, split, or replace a retired-literal rule only when the packet can name a
specific live risk:

- the literal remains public, documented, generated, or externally consumed;
- the literal is a common migration hazard with demonstrated recurrence;
- the literal overlaps a current public key in one context and stale/internal
  usage in another;
- the rule is really evidence for a missing positive structure, schema, or
  boundary that governs current constructible state.

Absent one of those risks, the whole-rule fit is `retire`, the rule-id strategy
is `delete id without replacement`, and the proof limit is absence and record
reconciliation, not a new validation rail.

## Method

### Stage 1. Confirm Entry Readiness

Confirm the input classification row exists and contains:

- one rule id;
- action decision;
- expected remediation outcome;
- `decision packet needed: yes`;
- blocker/proof;
- evidence note.

Stop if the rule has not first been classified or if the classification does
not require a decision packet. This frame is not applicable until the
classification frame has supplied that input.

### Stage 2. Read The Whole Packet

Read the rule's:

- `rule.json`;
- runner file;
- support files;
- baseline, if present;
- `pathCoverage` and `scanRoots`;
- relevant ledger/domino evidence;
- source and docs directly referenced by the rule.

Record what was actually inspected. Do not cite broad repository familiarity as
source evidence.

### Stage 3. Decompose The Predicate

Break the rule into atomic predicate clauses. A clause is atomic when it can be
owned, proved, moved, deleted, or inverted without dragging an unrelated owner
with it.

For each clause, record evidence, owner, forbidden owner, proof class, action
fit, and packet disposition in one row. If decomposition contradicts the input
classification, record the contradiction and mark the input classification as
stale; do not silently re-run classification inside this frame.

For retired-literal clauses, include a recurrence-risk judgment before naming a
replacement owner. If no concrete recurrence risk exists, the clause
disposition is deletion. Do not infer a source-validation replacement just
because the current source pipeline rejects the retired shape; that is often
the reason the Habitat assertion is unnecessary.

### Stage 4. Decide The Whole-Rule Fit

Classify the whole rule as:

- `whole-rule fit`: all clauses share owner, action, and proof shape;
- `split required`: at least one clause has a distinct owner or proof shape;
- `consolidate`: another rule or positive authority should absorb this rule;
- `retire`: the predicate is stale and no live invariant remains;
- `keep with metadata repair`: the rule is semantically right but misplaced or
  mislabeled;
- `blocked`: source authority is insufficient to decide without a prior design
  or investigation slice.

### Stage 5. Choose Rule-Id Strategy

Record one of:

- `preserve id`;
- `rename id for corrected owner`;
- `split into new ids`;
- `delete id without replacement`;
- `replace by native rail`;
- `replace by positive authority`.

Rule ids remain stable unless the decision packet explains why stability would
hide a semantic change.

Use `delete id without replacement` when no live invariant remains. If a
deleted id is absorbed by another rule or authority surface, use
`replace by native rail` or `replace by positive authority` instead of a
generic deletion label.

### Stage 6. Emit The Decision Packet

Use this template:

```text
Rule:
Current path:
Current placement:
Current category:
Input classification:
Category metadata decision:
Input receipt / classification evidence:
Source files inspected:
Clause table:
| Clause | Evidence inspected | Owner | Forbidden owner / false destination | Proof class | Action fit | Packet disposition |
| --- | --- | --- | --- | --- | --- | --- |
Remediation action:
Whole-rule fit:
Split needed:
Positive authority candidate:
False authority / forbidden destination rejected:
Destination / deletion / enforcement home:
Rule id plan:
Semantic remediation decision:
Proof class / proof limit:
Required downstream record update:
Residual follow-up:
```

The packet may be stored in a ledger-linked decision record, domino receipt, or
workstream artifact. Do not store per-rule decision packets in this method
frame. The record must be durable enough for a later agent to implement without
reopening the whole semantic debate.

`Semantic remediation decision` names the intended semantic outcome. It does
not name write set, edit sequence, branch shape, or verification plan.

`Proof class / proof limit` names what kind of proof the later implementation
slice must provide and what that proof would not prove. A command may be named
only as a known proof surface, not as the slice's full verification plan.

## Proof Classes

Use proof labels that match what can actually be checked:

During this frame, name the required proof class and proof limits. Do not
execute proof commands except for source inspection needed to make the semantic
decision.

- `manifest/schema proof`;
- `runner/support path proof`;
- `source absence proof`;
- `source presence proof`;
- `boundary graph proof`;
- `closed structure proof`;
- `native rail proof`;
- `focused habitat check`;
- `generated execution-surface proof`;
- `manual source judgment`.

Do not claim runtime, source, boundary, or deletion proof from a command that
only proves manifest syntax.

For retired-literal deletion without replacement, the proof class is usually
`source absence proof` plus record reconciliation. The source/type/config
pipeline may be the owner of current valid state, but that is an outcome
statement, not a proof-class label.

## Falsifiers

This frame is the wrong tool if:

- no light action classification exists yet;
- the work is a many-rule classification pass;
- the requested output is implementation, not decision;
- the rule is already classified `no action` and has no semantic blocker;
- the packet cannot be made durable without first creating a new method or
  authority frame.

## Review And Judgment Criteria

A valid decision packet:

- decomposes the predicate into atomic clauses;
- binds each clause to evidence, owner, forbidden owner, proof class, action
  fit, and disposition;
- states whether the rule moves whole, splits, consolidates, retires, stays, or
  waits for positive authority;
- names a rule-id strategy;
- separates semantic decision from implementation mechanics;
- names proof class and command limits;
- records required downstream record updates and residual follow-up without
  vague "clean up later" language.
