# Active Transition Anchor

Status: active temporary anchor; Domain Source Topology ratchet closure recorded

Purpose:
hold the next containers of work now that Slice 001 domain-root topology has
closed and ratcheted. This file lives one level above the completed slice
because the current work is not another row inside Slice 001. It is machine-level
work on the authority method that lets the next slice start from a sharper
system.

This document is intentionally temporary. It should go away after its three
containers are either opened as their own frames/slices or explicitly closed.

Durable handoff:
`blueprint-authority-stewardship-frame.md` carries the live DRA stewardship
frame for this transition. Use this anchor for the three immediate containers;
use the stewardship frame for the role, proof, source-precedence, and agent-team
operating contract that must survive takeover.

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
  -> post-ratchet rule revalidation
  -> absorbed duplicate-rule deletion
```

Closure update:
the Domain Source Topology Enforcement Ratchet is formally concluded by
`.habitat/.active/workstreams/remediate-rule-authority/receipts/domain-source-topology-ratchet-closure.md`.
The two absorbed duplicate rules were deleted and `require_domain_source_topology`
is the survivor authority for direct domain-root child shape and ops-root
presence.

The next move is to move up one container level before moving across to another
blueprint-level slice. The aim is not more process; the aim is to prevent
temporary scaffolding, negative guards, and transition records from hardening
into accidental architecture.

Selection:
this frame selects the transition between a completed descent and the next
blueprint-level descent.

Foreground:
rule authority cleanup, reusable initiative-frame capture, and next slice
selection.

Exterior:
new source movement, new domain row disposition, and operation-internal cleanup
unless one of the three containers opens them explicitly.

Falsifier:
if a rule or workstream record cannot be classified without reopening source
semantics, stop and open a dedicated slice instead of burying that decision in
this transition anchor.

## Container 1: Rule Authority Cleanup Pass

Status: next active container to open.

Objective:
audit the current Habitat rule set and decide which rules are permanent law,
which are transitional sentries, and which should be retired, split, or replaced
with positive assertions.

Why now:
Slice 001 records report enforced closure, but recorded pass state is not the
same as permanent law. Rule Authority Cleanup must first re-prove current rule
state with a named Habitat command before using that state as authority. This
is the exact moment where scaffolding can become accidental architecture if we
do not classify it.

Initial classes:

| Class | Meaning | Expected action |
| --- | --- | --- |
| Standing positive law | A reusable destination shape, topology, or public boundary that remains true after Slice 001. | Keep and document as durable law after reusable-class proof. |
| Active transitional guard | A rule that still protects a real migration boundary but is not yet permanent law and is not yet superseded. | Keep temporarily with an owner, trigger, and explicit replacement or retirement condition. |
| Transitional guard superseded by positive law | A negative guard that only existed to protect a migration gap now closed by topology or file-shape law. | Retire after parity proof, or move to historical evidence. |
| Negative assertion needing positive replacement | A rule that names forbidden residue but should instead assert the allowed shape. | Replace with a positive Habitat rule or structure law. |
| Rule doing two jobs | A rule that mixes topology, import boundary, file shape, or one-off cleanup in one surface. | Split into separate durable laws. |
| Slice-specific retired shape | A rule that encodes a row, historical file, or one-off cleanup fact rather than a reusable class. | Retire, archive as evidence, or rewrite as general law if the class is real. |

Known inputs:

- `.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json`,
  the refreshed machine-readable live rule corpus and action ledger;
- `.habitat/.active/workstreams/remediate-rule-authority/rule-authority-corpus-grounding.md`,
  the current corpus-location and analytics receipt;
- `.habitat/blueprints/**/rule.json`;
- `.habitat/.active/workstreams/define-domain-blueprint-structure/slices/001-domain-root-immediate-ops-topology/frame.md`;
- `.habitat/.active/workstreams/define-domain-blueprint-structure/slices/001-domain-root-immediate-ops-topology/inventory.md`
  as historical red corpus and closure evidence only;
- `.habitat/.active/workstreams/define-domain-blueprint-structure/slices/001-domain-root-immediate-ops-topology/cleanup-execution.md`
  as active cleanup execution evidence;
- `.habitat/.active/workstreams/define-domain-blueprint-structure/slices/002-prework-decision-qualification/Decisions/003-domain-model-config-law/red-ledger.md`;
- `.habitat/.active/workstreams/define-domain-blueprint-structure/review-protocol.md`;
- `.habitat/.active/workstreams/define-domain-blueprint-structure/scopes-and-slices-reference.md`.

Hypotheses to seed the authority cleanup ledger as standing positive-law candidates:

- `require_domain_source_topology`;
- `require_domain_ops_binding_surface`;
- `require_domain_ops_registry_surface`;
- `require_domain_operation_contract_file_shape`;
- `require_domain_model_schema_policy_owner_shape`;
- `require_artifact_file_shape`;
- `require_artifact_index_aggregate_shape`;
- `require_recipe_stage_authoring_file_shape`.

Hypotheses to seed the authority cleanup ledger as boundary-rail candidates:

- adapter/runtime import blocks;
- cross-operation runtime call blocks;
- recipe/domain public-surface import rules;
- generated map entrypoint protection rules.

Other rule families that must be included in the authority cleanup ledger:

- dependency/effect tag contract rules;
- recipe runtime import rules;
- recipe step contract-root rules;
- shared visualization surface rules;
- artifact namespace and realized-map tag rules;
- shipped catalog leakage rules;
- any rule outside the just-closed domain-root lane.

Hypotheses to seed the authority cleanup ledger as cleanup candidates:

- retired domain root/catalog guards;
- old config facade prohibitions;
- unknown config bag prohibitions;
- morphology-specific facade guards;
- highly slice-specific foundation legacy prohibitions;
- any rule whose scan root is now entirely covered by a positive topology or
  file-shape rule.

No keep, retire, replace, or split decision is authorized here. Every candidate
requires row-level evidence and proof in the Rule Authority Cleanup container.

Required output when opened:

- a rule authority cleanup frame;
- a refreshed rule-by-rule authority cleanup pass over
  `.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json`
  with rule id/path, source authority, current evidence, evidence/proof class,
  owner layer, keep/retire/replace/split disposition, first falsifier, required
  proof commands, non-claims, and review disposition;
- a fresh read-only review loop, separate from implementation agents, covering
  product outcome, owner-boundary, proof, stale-record, and stack lanes, with
  accepted P1/P2 findings blocking closure;
- a Graphite-submitted cleanup if rules or records change.

## Container 2: Reusable Initiative Frame Capture

Status: candidate method frame captured at
`.habitat/.active/frames/BLUEPRINT-AUTHORITY-RATCHET-DESCENT-FRAME.md`;
review before promoting or retiring this temporary anchor.

Objective:
capture the reusable method from the completed descent so future blueprint work
starts with the right container geometry instead of rediscovering it.

Canonical method:
`.habitat/.active/frames/BLUEPRINT-AUTHORITY-RATCHET-DESCENT-FRAME.md`
now owns the full descent state machine, including law-correction/scope-split
back-talk, source-movement preservation gates, review gates, rule-surface
reduction, and ascent. Do not maintain a second compressed method copy in this
temporary anchor.

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
- rule authority cleanup is part of closure, not optional polish;
- temporary anchors and execution packets are retired when they stop doing work.

Known inputs:

- this transition anchor;
- Slice 001 `frame.md`, `inventory.md`, `execution.md`, and
  `cleanup-execution.md`;
- Slice 002 prework frame, inventory, decision packets, and closed domino files;
- `review-protocol.md` and `scopes-and-slices-reference.md`;
- current `.habitat/blueprints/**/rule.json` state after the rule authority cleanup pass;
- current Graphite PR and commit history for the completed descent.

Required output when opened:

- a portable initiative frame or method document at the owning workstream level;
- explicit examples from the completed Slice 001 descent;
- exit criteria for when a future workstream should move up, down, or across;
- review for whether the frame is reusable without becoming a vague process
  essay.

## Container 3: Move Across, Not Down

Status: third container to open after the rule authority cleanup and reusable method are
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
- the rule authority cleanup ledger from Container 1;
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
  decision slice, or rule authority cleanup follow-on.

## Tracked Lower-Order Dominoes

These are not selected next containers. They are live ratchet inputs that should
be carried forward and opened only when an authority container reaches their
owner layer or makes them a proof blocker.

| Domino | Why tracked | Open when | Must not become |
| --- | --- | --- | --- |
| Public TypeFest dependency and contract policy | The strict TypeScript ratchet introduced TypeFest as root developer tooling and used it safely in private/dev surfaces. Broader SDK and MapGen Core replacements touch exported type contracts, so they need owner/dependency policy rather than opportunistic cleanup. | A blueprint/rule-cleanup slice touches public type utilities, emitted declaration surfaces, package dependency policy, or a candidate replacement needs TypeFest to avoid custom type gymnastics. | The immediate next step ahead of rule authority cleanup, reusable method capture, or next blueprint-level slice selection. |

## Transition Closure

This anchor can close when:

- Rule Authority Cleanup has a frame or execution packet with proof gates,
  row-level ledger contract, and review disposition contract;
- Reusable Initiative Frame Capture has a frame or document home with explicit
  scope, source provenance, non-claims, and retirement/promotion path;
- Move Across, Not Down has selected the next blueprint-level slice or recorded
  why cleanup must continue first;
- this file no longer contains the only copy of any active decision;
- accepted P1/P2 review findings for transition claims are resolved, rejected
  with source evidence, invalidated by later evidence, or explicitly moved out
  of scope by sealed authority;
- current claims introduced by the transition containers have proof-class
  labels and exact commands or source evidence;
- downstream records capture any active decision that should outlive this
  temporary anchor;
- the relevant Graphite layer has been submitted or deliberately held with a
  recorded reason;
- the worktree and stack state are clean, or an explicit handoff records the
  remaining dirty state;
- `blueprint-authority-stewardship-frame.md` is promoted, superseded, archived,
  or deleted once its decisions land in owning records;
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
