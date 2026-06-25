# Habitat Artifact Kinds

Status: working reference, not machine-readable config

This document defines the current working vocabulary for Habitat artifact kinds.
It is intentionally narrow. It covers only the top-level command kinds and the
mutability rules that follow from them.

It does not define supporting-file categories, implementation mechanisms,
subject definition shape, blueprint shape, niche cascade semantics, or resolver
metadata. Those remain open design questions.

## Core Frame

Habitat has two separate concerns that must not be collapsed:

- The authority tree says where a governed concern belongs.
- The artifact kind says what Habitat is allowed to do with it.

Tree placement should carry domain routing. Artifact kind should carry runner
behavior and mutability risk.

The working tree-shape decision is documented in `AUTHORITY-TREE-SHAPE.md`.
Artifact kinds may be used as directories under `_self/` inside the final
owning niche so Habitat can discover runnable packets by mutability class.
Those directories must not replace domain niches as the primary authority axis.

The current leaf folders are artifact packets, not final blueprint definitions.
For now, each admitted packet should have one primary executable kind. Mixed or
unclear packets belong in niche-local `_self/triage/` until a later pass
classifies, splits, renames, or removes them.

Niches and blueprints are different axes. A niche is an authored jurisdiction
boundary. A blueprint is the intended future executable/enforceable unit within
that jurisdiction. Blueprint structure is deliberately not defined here.

## Kinds

### `check`

Read-only evaluation.

A check answers: does the current repository state satisfy an authored Habitat
authority?

Checks may inspect source files, generated outputs, package metadata, config, or
current-tree structure. They must not build packages, write generated output,
edit source, update caches, create lock directories, or otherwise mutate
repository state.

Runner responsibilities:

- refuse or reclassify scripts that write files, run builds to refresh outputs,
  or otherwise mutate the repository;
- report violations without applying repairs;
- keep package-runtime behavior tests outside Habitat unless their oracle is
  structural authority;
- treat "currentness" as a read-only check only when required inputs and outputs
  already exist.

### `fix`

Idempotent repair of existing authored files.

A fix answers: what safe, recurring repair may Habitat apply to bring authored
files back into an accepted shape without changing their intended meaning?

Examples include formatting repair, import cleanup, docs link normalization, and
similar maintenance actions. A fix is not a migration just because it mutates
files. It should be safe to run repeatedly and should converge on the same
shape.

Runner responsibilities:

- separate fix execution from read-only checks;
- write only within the admitted scope;
- prefer preview or dry-run behavior when the implementation supports it;
- avoid creating product outputs or performing one-way source/data transitions.

### `generate`

Materialization of derived or scaffolded artifacts.

A generate artifact answers: what may Habitat create or refresh from accepted
inputs?

Generation covers scaffolds, derived files, documentation indexes, and other
outputs whose authority comes from accepted inputs. The generator engine may
live in Habitat Toolkit or in the owning package, but the write is still a
generation operation when the purpose is to materialize declared outputs.

Runner responsibilities:

- write only declared generated outputs;
- distinguish generation from read-only currentness checks;
- avoid hiding runtime/product execution behind Habitat generation;
- make generated/protected placement checkable separately.

### `migrate`

Intentional transition from one accepted authored shape to another.

A migration answers: how may Habitat move authored source or data from an old
shape to a new shape?

Migrations are higher-risk than fixes because they change the accepted model.
They may be one-time, versioned, or explicitly retired after the transition is
complete.

Runner responsibilities:

- require an explicit source shape and target shape before execution;
- treat comparison data as migration support, not as a top-level artifact kind;
- keep migration execution separate from routine fix execution;
- make review, rollback, and stop conditions visible for non-trivial changes.

## Mutability Boundary

The command kind determines mutability:

| Kind | Mutates repository state? | Expected risk |
| --- | --- | --- |
| `check` | No | Diagnostic |
| `fix` | Yes, existing authored files only | Routine repair |
| `generate` | Yes, declared generated/scaffolded outputs | Materialization |
| `migrate` | Yes, authored source or data shape | Structural transition |

Any script registered as a `check` but observed writing files, refreshing
generated outputs, or running a mutating build is misclassified.

Any script that performs product/runtime work belongs with the consuming package
unless its purpose is Habitat-scoped checking, fixing, generation, or migration.

## Runner Responsibilities

The runner should:

- select artifacts by kind before deciding how to execute them;
- enforce mutability guarantees for the selected kind;
- infer domain routing from tree placement instead of requiring each artifact to
  redeclare niche, layer, or owner metadata;
- infer the artifact kind from the directory below `_self/` when the tree has
  been flattened into the target shape;
- infer execution mechanics from Habitat Toolkit support rather than requiring
  artifact-local dispatch declarations;
- keep implementation dispatch in `tools/habitat`;
- allow package scripts or Nx targets to bridge into Habitat while `.habitat`
  remains the authority source.

The runner should not:

- treat implementation technologies or transitional runner classes as artifact
  kinds;
- require every artifact to declare owner, niche, layer, or dispatch metadata
  when those facts are already recoverable from tree placement or file shape;
- admit mutating work through `check`;
- turn support files into first-class kinds before their ontology is settled.

## Open Questions

These are deliberately unresolved:

- what future blueprint directories, metadata, and execution surfaces look like;
- whether current artifact packets eventually become blueprint internals,
  blueprint references, or standalone packets;
- what the reduced supporting-file vocabulary should be;
- what the eventual machine-readable admission model should contain.

The next tree pass should flatten premature concern-layer nesting and classify
current packets under niche-local `_self/<kind>/` directories before the
resolver schema hardens around the current hierarchy.
