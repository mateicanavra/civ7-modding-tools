# Active Transition Anchor

Status: active temporary anchor

Purpose:
hold the next containers of work now that Slice 001 domain-root topology has
closed and ratcheted. This file lives one level above the completed slice
because the current work is not another row inside Slice 001. It is machine-level
work on the authority method that lets the next slice start from a sharper
system.

This document is intentionally temporary. It should go away after its three
containers are either opened as their own frames/slices or explicitly closed.

## Current Frame

We just completed one full descent:

```text
domain blueprint frame
  -> Slice 001 domain-root topology
  -> prework decision slices
  -> row dispositions
  -> execution
  -> repair
  -> topology ratchet
```

The next move is to move up one container level before moving across to another
blueprint-level slice. The aim is not more process; the aim is to prevent
temporary scaffolding, negative guards, and transition records from hardening
into accidental architecture.

Selection:
this frame selects the transition between a completed descent and the next
blueprint-level descent.

Foreground:
rule ecology cleanup, reusable initiative-frame capture, and next slice
selection.

Exterior:
new source movement, new domain row disposition, and operation-internal cleanup
unless one of the three containers opens them explicitly.

Falsifier:
if a rule or workstream artifact cannot be classified without reopening source
semantics, stop and open a dedicated slice instead of burying that decision in
this transition anchor.

## Container 1: Rule Ecology Cleanup Pass

Status: next active container to open.

Objective:
audit the current Habitat rule set and decide which rules are permanent law,
which are transitional sentries, and which should be retired, split, or replaced
with positive assertions.

Why now:
all blueprint rules are currently enforced and green, but green is not the same
as permanent. This is the exact moment where scaffolding can become accidental
architecture if we do not classify it.

Initial classes:

| Class | Meaning | Expected action |
| --- | --- | --- |
| Standing positive law | A reusable destination shape, topology, or public boundary that remains true after Slice 001. | Keep and document as durable law after reusable-class proof. |
| Active transitional guard | A rule that still protects a real migration boundary but is not yet permanent law and is not yet superseded. | Keep temporarily with an owner, trigger, and explicit replacement or retirement condition. |
| Transitional guard superseded by positive law | A negative guard that only existed to protect a migration gap now closed by topology or file-shape law. | Retire after parity proof, or move to historical evidence. |
| Negative assertion needing positive replacement | A rule that names forbidden residue but should instead assert the allowed shape. | Replace with a positive Habitat rule or structure law. |
| Rule doing two jobs | A rule that mixes topology, import boundary, file shape, or one-off cleanup in one surface. | Split into separate durable laws. |
| Slice-specific fossil | A rule that encodes a row, historical file, or one-off cleanup fact rather than a reusable class. | Retire, archive as evidence, or rewrite as general law if the class is real. |

Known inputs:

- `.habitat/blueprints/**/rule.json`;
- `.habitat/.active/workstreams/define-domain-blueprint-structure/slices/001-domain-root-immediate-ops-topology/frame.md`;
- `.habitat/.active/workstreams/define-domain-blueprint-structure/slices/001-domain-root-immediate-ops-topology/inventory.md`
  as historical red corpus and closure evidence only;
- `.habitat/.active/workstreams/define-domain-blueprint-structure/slices/001-domain-root-immediate-ops-topology/cleanup-execution.md`
  as active cleanup execution evidence;
- `.habitat/.active/workstreams/define-domain-blueprint-structure/slices/002-prework-decision-qualification/Decisions/003-domain-model-config-law/red-ledger.md`;
- `.habitat/.active/workstreams/define-domain-blueprint-structure/review-protocol.md`;
- `.habitat/.active/workstreams/define-domain-blueprint-structure/scopes-and-slices-reference.md`.

Standing positive-law candidates requiring reusable-class proof:

- `require_domain_source_topology`;
- `require_domain_ops_binding_surface`;
- `require_domain_ops_registry_surface`;
- `require_domain_operation_contract_file_shape`;
- `require_domain_model_schema_policy_owner_shape`;
- `require_artifact_file_shape`;
- `require_artifact_index_aggregate_shape`;
- `require_recipe_stage_authoring_file_shape`.

Initial boundary-rail candidates to classify:

- adapter/runtime import blocks;
- cross-operation runtime call blocks;
- recipe/domain public-surface import rules;
- generated map entrypoint protection rules.

Other rule families that must be included in the ecology ledger:

- dependency/effect tag contract rules;
- recipe runtime import rules;
- recipe step contract-root rules;
- shared visualization surface rules;
- artifact namespace and realized-map tag rules;
- shipped catalog leakage rules;
- any rule outside the just-closed domain-root lane.

Initial cleanup candidates:

- retired domain root/catalog guards;
- old config facade prohibitions;
- unknown config bag prohibitions;
- morphology-specific facade guards;
- highly slice-specific foundation legacy prohibitions;
- any rule whose scan root is now entirely covered by a positive topology or
  file-shape rule.

Required output when opened:

- a rule ecology frame;
- a rule-by-rule ledger with class, owner, keep/retire/replace/split decision,
  parity proof requirement, and Habitat verification command;
- a review loop focused on positive-law quality and no one-off fossil rules;
- a Graphite-submitted cleanup if rules or records change.

## Container 2: Reusable Initiative Frame Capture

Status: second container to open after the rule ecology direction is clear.

Objective:
capture the reusable method from the completed descent so future blueprint work
starts with the right container geometry instead of rediscovering it.

The reusable method:

```text
define container
  -> activate scope
  -> flip to red
  -> classify red by owner and destination
  -> open prework only for nondeterministic destinations
  -> execute deterministic burn-down
  -> repair drift
  -> ratchet with Habitat
  -> close and move back up
```

Key lesson to preserve:
prework is not information gathering for its own sake. Prework exists only where
a destination is not deterministic. Once a destination class is encoded as
positive Habitat law, execution should burn down rows into that law rather than
re-litigating the decision.

Required capture points:

- nested container descent and ascent;
- positive assertions first, with intentional red as leverage;
- row-level obligations remain visible even when grouped into classes;
- source paths are evidence, not authority;
- tests prove behavior, not topology or file shape;
- Habitat patterns and structure rules carry topology/file-shape law;
- rule ecology cleanup is part of closure, not optional polish;
- temporary anchors and execution packets are retired when they stop doing work.

Known inputs:

- this transition anchor;
- Slice 001 `frame.md`, `inventory.md`, `execution.md`, and
  `cleanup-execution.md`;
- Slice 002 prework frame, inventory, decision packets, and closed domino files;
- `review-protocol.md` and `scopes-and-slices-reference.md`;
- current `.habitat/blueprints/**/rule.json` state after the rule ecology pass;
- current Graphite PR and commit history for the completed descent.

Required output when opened:

- a portable initiative frame or method document at the owning workstream level;
- explicit examples from the completed Slice 001 descent;
- exit criteria for when a future workstream should move up, down, or across;
- review for whether the frame is reusable without becoming a vague process
  essay.

## Container 3: Move Across, Not Down

Status: third container to open after the rule ecology and reusable method are
captured enough to guide the next descent.

Objective:
select the next blueprint-level slice. The next move should be across to another
scope where the same authority method applies, not down into operation internals
by default.

Why across:
Slice 001 closed the domain-root topology depth. Moving down immediately into
operation internals risks premature detail work. Moving across lets the freshly
ratcheted method prove itself against another blueprint-adjacent scope while
the shape is still clear.

Selection criteria:

- the candidate scope has a real topology or file-shape authority question;
- red can be produced by Habitat or by a concrete current-state corpus;
- destinations can be defined before source movement;
- any nondeterministic rows can be isolated into bounded prework;
- execution would burn down a class of debt, not chase one-off files.

Expected candidates:

- another blueprint-adjacent scope outside the closed domain-root descent;
- recipe-stage topology or authoring surface cleanup;
- operation-internal topology only if the next source evidence shows it is the
  leverage point rather than premature descent.

Known inputs:

- the reusable initiative frame produced by Container 2;
- the rule ecology ledger from Container 1;
- current Habitat red/green output for enforced and candidate rules;
- `scopes-and-slices-reference.md`;
- active workstream slices and inventories under this workstream;
- current source tree evidence from `bun habitat classify` and current rule
  checks.

Required output when opened:

- a short next-slice selection frame;
- candidate comparison with one selected scope and explicit exterior;
- exact first red-flip or corpus extraction command;
- decision whether the selected container starts as a scope slice, prework
  decision slice, or rule ecology follow-on.

## Transition Closure

This anchor can close when:

- Rule Ecology Cleanup has a proper frame or execution packet;
- Reusable Initiative Frame Capture has a proper frame or document home;
- Move Across, Not Down has selected the next blueprint-level slice or recorded
  why cleanup must continue first;
- this file no longer contains the only copy of any active decision;
- this file is deleted, or moved to archive only if it contains historical
  evidence that was not captured elsewhere.

Do not leave this file as durable authority. It is a handrail between containers,
not law.

## Review Notes

Reviewer focus for this transition anchor:

- each container is a real depth cascade, not a task-list bucket;
- this file does not reopen Slice 001 or hide row-level work;
- rule cleanup distinguishes green enforcement from permanent law;
- reusable method capture preserves the completed descent without turning it
  into generic process prose;
- next-slice selection moves across unless evidence justifies moving down.
