# Single Red Inventory Item Investigation Frame

Status: standalone active method frame

This frame applies after a closed-structure slice has activated one or more
scopes, file descriptions, or patterns and produced a red inventory. It defines
how to process one red inventory row at a time.

Prework decides which destinations and scope laws exist before the tree is
turned red. This frame is used afterward, when an actual red row exists and
must be resolved with an already defined destination law or a named owner-law
gap.

## Decision Unit

One pass processes one red inventory row.

The decision is:

```text
Given this current path or symbol, and the scope/file/pattern law that made it
red, what exact action resolves it?
```

Allowed outcomes:

1. move to an exact defined destination;
2. split into multiple exact destination rows;
3. delete with the reason named;
4. leave blocked by a named owner-law or destination-geometry gap.

No outcome may land in a generic directory or vague future bucket.

## Required Inputs

The pass starts from a red inventory row with:

- current path or symbol;
- activated scope, file description, or pattern that made it red;
- why it is red;
- expected destination if already known, or the missing decision if not known;
- owning slice.

If the row lacks the activated law or why-red reason, repair the inventory row
before investigating source content.

## Authority Delegation

Apply the sole canonical source order in `.habitat/.active/frames/FRAME.md`.
This investigation frame adds no source precedence. Activated slice law,
decision criteria, current-tree evidence, and historical material retain the
roles and ranks assigned there.

Current location is evidence only. The red row already proves the current
location is not accepted by the activated law.

## Stage 1: Reconstruct Why The Row Is Red

Name the exact law that failed:

- directory topology law;
- file-shape law;
- cross-file pattern law;
- public/import surface law;
- owner-boundary law.

Record the positive assertion that the current item violates. Build the case
from the selected law and item evidence.

## Stage 2: Inspect The Item

Inspect only enough source to understand the item being moved, split, deleted,
or blocked.

Required evidence:

- file path or symbol;
- exports;
- imports;
- callers or consumers;
- runtime/generated/artifact role when relevant;
- dead, duplicate, or historical status when relevant.

Use `rg` and source inspection by default. Use Narsil symbol/reference tools
when caller or symbol relationships materially affect the action.

## Stage 3: Classify The Content

Classify what the item actually is:

- duplicate authority;
- domain model config;
- domain model policy;
- domain model data;
- artifact contract;
- operation-local implementation;
- operation-family material requiring split;
- core reusable mechanics;
- official Civ7 map policy/resource fact;
- Civ7 runtime adapter behavior;
- public surface/export compatibility;
- separate owner-law material.

Use the workstream decision book for reusable criteria. When the decision book
lacks the needed class and classification remains unsafe, stop and name the
missing criterion instead of improvising.

## Stage 4: Decide The Action

For the red row, choose exactly one action:

```text
move -> <exact path>
split -> <exact child rows and paths>
delete -> <reason>
blocked -> <named owner-law or destination-geometry gap>
```

A directory name alone is not destination authority. The destination is valid
only when a scope, file description, pattern, or external owner authority names
it and the content matches that positive destination law.

## Stage 5: Preserve Row-Level Obligations

If the row splits, create child rows. Each obligation stays visible as its own
row.

Each child row needs:

- source path or symbol;
- content class;
- exact action;
- governing law;
- proof needed after execution.

## Stage 6: Define Execution Proof

Name the proof that will show the red row is resolved after implementation.

Proof may include:

- absence from old path;
- presence at exact destination;
- import/reference update scan;
- export/barrel scan confirms only exports named by the destination law remain;
- package boundary check;
- source-shape check;
- Habitat classify/check;
- focused typecheck, package check, or test.

Resolution is claimed after the selected proof runs in the implementation
slice.

## Stage 7: Write Back

The result writes back to the active slice inventory:

- exact action;
- exact destination or deletion reason;
- governing law;
- proof gate;
- blocked owner-law/destination-geometry gap if unresolved.

Reusable discoveries belong in the decision book or owning scope/file/pattern
document. The red inventory row carries the row-level result.

## Agent Roles

Use agents when row resolution needs parallel evidence or independent review.
The steward owns the row decision.

### Steward

Owns the red row, final action, write-back, and proof claim.

### Law Mapper

Identifies the exact activated law that made the row red and the positive shape
the row must satisfy.

### Source Mapper

Inspects the row's source, exports, imports, callers, and current role.

### Owner Classifier

Maps the source evidence to a content class and owner/non-owner using the
decision book and architecture authority.

### Proof Designer

Names the smallest proof that will demonstrate the row is resolved after the
move/delete/split.

### Adversarial Reviewer

Checks for fake buckets, destination invention, current-path authority,
unproven splits, and generic directory landings.

## Agent Prompt Contract

Every agent prompt must include:

- absolute checkout path;
- exact red inventory row;
- activated scope/file/pattern law;
- hard core: one row, exact action, destination from law, current path is
  evidence only;
- path scope and write permissions;
- required output shape;
- blocker condition.

Agents return evidence or review findings. The steward makes the row decision.

## Closure

One red-item pass is closed when:

- the row has one exact action;
- every split child row is explicit;
- destination authority is cited;
- execution proof is named;
- reusable criteria discovered during the pass are written to their owner.

Fresh review is required when the row is split, blocked, owner-changing,
public-surface-changing, or depends on a newly written criterion. Mechanical
rows with an existing destination law may close with steward review plus the
named execution proof.
