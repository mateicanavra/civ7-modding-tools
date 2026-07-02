# Scopes And Slices Reference

Status: normative working reference

This reference defines the target working architecture for closed-structure workstreams. It applies to domain blueprints first, but the model is not domain-specific. The same structure can describe recipes, service packages, APIs, plugins, or any other blueprint kind that needs declarative topology plus controlled execution slices.

The purpose is simple: define the selected shapes first, make everything else red, then burn down red items only into destinations already defined by the relevant scope, file description, pattern, or shared ownership rule.

## Core Model

The persistent structure is a nested `scopes/` tree. A scope is a directory-level topology definition.

A slice is an execution packet. It selects one or more scopes, inventories what goes red when those scopes are activated, and records the exact moves for that slice.

Scopes and slices stay separate.

```text
scopes/   = declarative target shape
slices/   = execution against selected scopes
files/    = file or file-pattern normative descriptions owned by a scope
patterns/ = non-file patterns owned by a scope
```

A current source path is never a scope just because it exists. A scope exists only when the workstream intentionally defines that directory level as part of the target shape.

## Why This Shape

The closed-structure method works when agents can make the tree green only by
moving content into defined destinations. A shallow structure gate without
defined destinations creates dumping-ground pressure. A fully deep structure
gate before destinations are understood creates forced improvisation.

This reference resolves that tension by separating durable target shape from execution slices:

- `scopes/` defines every directory level that the target architecture recognizes;
- each `scope.md` defines only its immediate children and the local descriptions it owns;
- nested directories become nested scopes;
- file and repeated-file shape requirements live under the owning scope's `files/`;
- non-file patterns live under the owning scope's `patterns/`;
- slices activate scopes incrementally and carry their own red inventory.

This lets a workstream define the full intended shape without enforcing every level at once. A slice can activate one shallow scope while referencing deeper scopes, file descriptions, and patterns as governing rules. Every red item still needs an exact destination path in that slice's inventory.

## Workstream Document Shape

Closed-structure workstreams should use this document organization:

```text
<workstream>/
  review-protocol.md
  scopes/
    <blueprint-kind>/
      overview.md
      scope.md
      files/
        <file-pattern>.md
      patterns/
        <pattern>.md
      scopes/
        <nested-scope>/
          overview.md
          scope.md
          files/
            <file-pattern>.md
          patterns/
            <pattern>.md
          scopes/
            <deeper-scope>/
              scope.md
  decision-book/
    owner-boundaries.md
    content-classes.md
    move-classes.md
  slices/
    <slice-id>/
      frame.md
      scope-set.md
      inventory.md
      execution.md
```

`review-protocol.md` defines the review contract for the workstream. It is a
quality gate for documentation discipline. Slice inventory carries execution
state.

`overview.md` belongs at the head of a blueprint-kind tree or a major nested scope tree when that tree needs a human-readable map. It explains how that subtree composes. It does not carry per-slice inventory.

## Scope Files

Every directory with enforced children gets a `scope.md`.

A `scope.md` defines:

- the abstract path pattern it applies to;
- the ownership boundary for that scope;
- the architectural evidence that justifies the scope;
- the controlling rationale for why the scope is closed this way;
- what immediate children are required;
- what immediate children are named optional slots;
- whether the immediate child set is closed;
- which nested scopes exist below it;
- which `files/` descriptions it owns directly;
- which `patterns/` it owns directly.

A `scope.md` does not define internals of nested directories. It names the nested scope that owns those internals.

Template:

```text
# <Scope Name>

Subject:
<abstract path pattern>

Ownership boundary:
<what this scope owns and where other content routes>

Architectural evidence:
<the docs/source/tooling facts that justify this scope>

Controlling rationale:
<why this scope is shaped this way and what failure mode it prevents>

Owns:
<the immediate topology this scope controls>

Required children:
- <child>

Optional children:
- <child>

Closed:
yes

Nested scopes:
- <child scope>

Files:
- files/<file-pattern>.md

Patterns:
- patterns/<pattern>.md
```

## Files

`files/` contains normative descriptions for files or repeated file patterns owned by the current scope.

These markdown files define:

- the subject file or file pattern;
- the role of that file;
- the ownership boundary for content named by the file law;
- the architectural evidence and rationale for non-obvious file laws;
- required contents;
- named contents;
- violation messages;
- import/export boundaries;
- expected internal shape, when the file has one;
- the enforcement surface.

Template:

```text
# <File Pattern Name>

Subject:
<file or repeated file pattern>

Role:
<entrypoint, binding file, registry, contract file, data file, etc.>

Ownership boundary:
<what this file owns and where other content routes>

Architectural evidence:
<only when needed to explain the file law>

Controlling rationale:
<only when needed to prevent misuse of the file>

Required shape:
- <positive assertion>

Allowed contents:
- <positive content class>

Violation messages:
- <specific failure message tied to a positive law>

Import/export boundary:
- <positive import/export rule>

Enforcement:
<structure.toml, Grit/source-shape, TypeScript/package check, or semantic review>
```

File descriptions use positive shape assertions. Explicit violation examples
appear only as failure messages for a specific positive law.

## Patterns

`patterns/` contains normative descriptions for rules that apply within a scope but are not themselves directory topology and are not direct file patterns.

Use `patterns/` for cross-file or intra-scope assertions such as:

- a registry must include every child implementation in the same scope;
- implementation files may depend only on approved local surfaces;
- a set of sibling files must use matching identifiers;
- a generated manifest must correspond to the current scope's declared children.

Directory child lists live in scopes.

One-file and repeated-file shapes live under `files/`.

Template:

```text
# <Pattern Name>

Subject:
<scope-local relationship or repeated structural assertion>

Applies to:
- <scope, files, or child set>

Required behavior:
- <positive assertion>

Violation messages:
- <behavior that violates the assertion>

Enforcement:
<Grit/source-shape, TypeScript/package check, Habitat check, or semantic review>
```

`patterns/` is optional for a scope. Create it only when the scope owns a non-file assertion that needs a stable name.

## Directory Slots Are Not Files Or Patterns

Directories are represented in one of two ways:

- as optional or required children in their parent scope;
- as nested scopes when their contents are defined.

There is no separate directory-rule concept.

Example:

```text
scopes/<blueprint-kind>/scope.md
  optional child: <child-directory>/

scopes/<blueprint-kind>/scopes/<child-directory>/scope.md
  owns children of <child-directory>/
```

## Shared Decision Book

The workstream keeps a shared decision book for content classification and ownership.

The decision book records workstream-local application of canonical owner authority. It must cite canonical docs or accepted owner-law dominoes rather than restating package ownership as independent authority.

The decision book defines reusable classification criteria for:

- external owner boundaries;
- content classes;
- move classes;
- deletion classes;
- separate owner-law dominoes.

The decision book does not contain per-slice red inventory. It does not record exact moves for a specific slice. It provides the criteria a slice uses to classify its red items.

## Slice Packets

A slice packet executes selected scopes against the current tree.

```text
slices/<slice-id>/
  frame.md
  scope-set.md
  inventory.md
  execution.md
```

`frame.md` records why this slice exists, its boundary, what would force a
reframe, and what must stay true while the slice executes. `inventory.md`
carries the current red rows.

`scope-set.md` lists the scope, file, and pattern descriptions selected for this slice.

```text
Activated scopes:
- scopes/<blueprint-kind>/scope.md

Activated files:
- scopes/<blueprint-kind>/files/<file-pattern>.md

Activated patterns:
- scopes/<blueprint-kind>/patterns/<pattern>.md

Referenced governing rules:
- scopes/<blueprint-kind>/scopes/<nested-scope>/files/<file-pattern>.md
- decision-book/owner-boundaries.md
```

`inventory.md` is the per-slice red inventory. It records what goes red when the activated scopes are applied and where each item lands.

```text
| Current path or symbol | Why red | Content class | Exact destination | Governing scope, file, pattern, or owner decision |
|---|---|---|---|---|
```

When a slice processes red inventory one row at a time, use the standalone
method frame at
`.habitat/.active/frames/SINGLE-RED-INVENTORY-ITEM-INVESTIGATION-FRAME.md`.

`execution.md` records the implementation target, checks to run, and stop
conditions. The inventory, scopes, files, and patterns stay in their owning
documents.

Prework qualification slices may use a reduced packet when they qualify
decisions before scope activation or implementation. The reduced packet is
`frame.md` and `inventory.md`. It may add a reusable single-decision frame when multiple
inventory items must be qualified with the same staged evidence method. Its
`inventory.md` lists unresolved decisions to qualify, not red source
rows to move. When a qualification item closes, the result must land in the
owning scope, file description, pattern, decision book, or later implementation
slice inventory.

## Review Discipline

Reviewers must check the risk created by the kind of change under review. For
reorganizations and splits, a clean target tree is not enough. Reviewers must
compare source material to target material and report any architecture-relevant
idea that was dropped, weakened, duplicated, or moved to the wrong layer.

Reviewer prompts for reorganizations must explicitly ask for preservation of:

- rationale and why-not alternatives in the scope, file, or pattern that owns
  the rule;
- metrics and tooling evidence in the scope, file, or pattern they justify;
- historical discoveries and review outcomes;
- reframe conditions and process lessons;
- exact source-to-target destination of non-inventory knowledge.

This preservation check is part of closure. If a reviewer only checks directory
separation, the review is incomplete.

## Slice Readiness Rule

A slice is ready to implement only when every red inventory row has one of these dispositions:

1. an exact destination backed by a scope, file description, or pattern;
2. an exact destination backed by a shared owner decision;
3. deletion with the reason named;
4. a named blocking owner-law domino.

No row may land in a generic optional directory. An optional directory becomes a valid destination only through its nested scope, file description, or pattern.

## Cascade Workflow

The workstream proceeds by descending through scopes.

```text
define scope -> select slice -> inventory red -> classify content -> lock destinations -> execute -> descend
```

Each deeper slice uses the same structure:

- select the scopes, files, and patterns it activates;
- list the current red inventory for those selections;
- map every red item to an exact destination;
- stop when a needed destination lacks a defined scope, file description, pattern, or owner decision.

## Non-Negotiable Invariants

- Define selected shapes before burn-down.
- Close over blueprint kind and matched source paths.
- Close over role, not existing filenames.
- Directories are scopes.
- Files and repeated file patterns are described under `files/`.
- Non-file, non-scope assertions are described under `patterns/`.
- Slices own current inventory.
- Decision-book criteria are shared.
- Every red item lands in a defined destination or named owner-law gap.
- Optional directories still require local content laws.
- Enforcement surfaces implement the scopes, files, and patterns.
