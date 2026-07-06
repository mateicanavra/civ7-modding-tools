# Rule Action Classification Frame

Status: normative method frame

Durability: standalone method frame for making a light `n = 1` action decision
for one live Habitat rule.

## Frame Identity

Frame name: Rule Action Classification

For situation: a live Habitat rule needs a compact decision about what kind of
future action, if any, would reduce authority-tree state without doing deep
clause decomposition or implementation.

Mode: systematic method reference

Object path: objective frame for rule-level process control

Primary object: one live Habitat rule, not a corpus, not a sweep, and not a
manifest category migration.

## Purpose

Use this frame to classify one rule into the next kind of work it needs. The
classification is intentionally light: it decides the action lane, whether a
decision packet is required, and what proof or blocker must be resolved before
execution.

This frame does not execute edits, produce a full decision packet, or design a
whole workstream. It classifies exactly one live rule per use; multi-rule
ordering, batching, and reconciliation belong outside this frame.

## Selection Commitments

In:

- one live `.habitat/**/rule.json` manifest and its current packet;
- current placement, runner, support files, baseline, path coverage, and scan
  roots as evidence;
- existing operational ledger row and receipt evidence for that rule, when
  present;
- source authority needed to decide owner, false owner, or proof class.

Foreground:

- state-space reducing action type;
- whether the rule can stay as live authority, should be reworked later, or
  needs a deeper decision packet;
- whether the current placement and category metadata is trustworthy enough to
  stand until the next layer.

Exterior:

- implementation design, file moves, runner rewrites, and verification plans;
- full predicate clause decomposition;
- multi-rule prioritization;
- new ontology or category creation as a substitute for deciding the rule's
  next action.

## Hard Core

1. Classification is separate from manifest `placement.category`.
2. Positive authority, closed structure, and boundary inversions are considered
   before preserving negative assertion rules.
3. Split is selected only when mixed ownership blocks an honest rule-level
   decision.
4. Retired literal assertions collapse to retirement unless there is concrete
   evidence that the literal is a known or likely recurrence risk.
5. The output stays compact enough to compare across independently produced
   rows.
6. Missing proof remains missing; do not fill gaps with inferred intent.

## Action Vocabulary

Use exactly one primary action decision:

| Action decision | Use when |
| --- | --- |
| `no action` | The rule is atomic, honestly owned, and its current metadata is good enough for now. |
| `split by owner` | The predicate spans multiple owners, contexts, stages, products, or proof shapes. |
| `consolidation/dedup` | The rule overlaps another rule or protects the same invariant through variant wording. |
| `retirement/garbage collection` | The rule guards obsolete migration residue, stale paths, no-longer-live concepts, or retired literals/properties that do not have a concrete recurrence risk. |
| `positive authority creation` | The rule is a negative proxy for a missing constructible kind, schema, manifest, or owner surface. |
| `closed structure inversion` | The rule forbids stray shapes but should be replaced by an allowed structure definition. |
| `boundary inversion` | The rule forbids dependency/import/export leaks but should be replaced by an allowed boundary graph or public surface. |
| `context admission` | The rule is live authority for its current context even if future quality work may improve it. |
| `runtime/source validation` | A live invariant belongs in source code, runtime validation, generated manifests, Nx graph policy, or another native rail. Do not use this lane merely to preserve a negative assertion against a retired literal. |
| `placement/category metadata repair` | The predicate is acceptable but its Habitat placement, category, or process metadata is wrong. |

If two action decisions compete, choose the one that collapses more state space.
The default priority is:

1. `positive authority creation`
2. `closed structure inversion`
3. `boundary inversion`
4. `split by owner`
5. `consolidation/dedup`
6. `retirement/garbage collection`
7. `runtime/source validation`
8. `context admission`
9. `placement/category metadata repair`
10. `no action`

The priority is not a script. It is a tie-breaker when source evidence supports
more than one action.

## Method

### Stage 1. Read The Rule Boundary

Read only enough to know what the rule claims to govern:

- rule id;
- current `placement`;
- current `operation`;
- current runner and support-file shape;
- current source/path coverage;
- current operational ledger disposition, if one exists.

Stop if the manifest is malformed or the packet cannot be found. The correct
action is not classifiable until the rule boundary is readable.

### Stage 2. Name Owner And False Owners

Name the owner the rule appears to govern. Name a tempting false owner only
when source evidence or current placement suggests plausible owner drift. Use
`False owner: none obvious` when the light read does not surface one.

Do not treat the current directory as owner authority by itself.

### Stage 3. Apply The Action Gate

Ask the state-space question:

> What action would make this rule unnecessary, mechanically derivable,
> honestly owned, safely deleted, or good enough to leave alone?

Use the action vocabulary. Do not invent local synonyms.

When the predicate only names a retired key, property, token, path, alias, or
literal, ask whether that exact literal is well-known, externally visible, or
likely to be recreated. If not, classify it as `retirement/garbage collection`
rather than inventing a replacement source rule, package test, or Habitat
negative assertion. A structurally correct source pipeline should make valid
state constructible; Habitat should not keep retired vocabulary alive as live
law without recurrence evidence.

### Stage 4. Decide Whether A Decision Packet Is Needed

Set `decision packet needed` to:

- `no` when the rule is `no action`, simple `context admission`, or simple
  `placement/category metadata repair`;
- `yes` when the rule needs split, consolidation, retirement proof, positive
  authority design, inversion, runtime/source migration, or any semantic
  rework before implementation;
- `unknown until source qualification` only when a concrete source read is
  required to choose between two action decisions.

### Stage 5. Emit The Classification Row

Use this row shape:

```text
Rule id:
Current placement:
Current path:
Action decision:
Expected remediation outcome:
Decision packet needed:
Blocker / proof:
Evidence note:
```

Keep each field short enough to compare with other independently produced rows.

## Output Semantics

- `Action decision` is the primary remediation lane.
- `Expected remediation outcome` is the likely destination, deletion,
  authority surface, native rail, or "stay put" outcome. Manifest
  `placement.category` changes belong here only when the action decision is
  `placement/category metadata repair`.
- `Decision packet needed` controls whether the rule enters the deeper
  `Rule Decision Packet` method.
- `Blocker / proof` names the one thing needed before implementation can be
  chosen or safely skipped.
- `Evidence note` points to the process/source evidence used, not a new theory
  of the rule.

## Falsifiers

This frame is the wrong tool if:

- the request is to execute a remediation slice now;
- the rule already has an accepted decision packet and only needs
  implementation;
- the owner question requires designing a new kind or authority surface before
  the rule can be classified;
- the desired output is a full clause-by-clause semantic decision.

## Review And Judgment Criteria

A valid classification:

- uses one action decision from the vocabulary;
- does not confuse action decision with manifest category;
- names owner and false owner where placement could drift;
- marks missing source proof instead of guessing;
- keeps the row compact enough for many rows to be compared;
- routes deeper work to the `Rule Decision Packet` frame rather than smuggling
  deep analysis into the light pass.
