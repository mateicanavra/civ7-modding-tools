# Habitat Rule Operation Kinds

Status: active rule-operation authority

This document defines Habitat rule operation kinds and their mutability rules.
It does not define blueprint metadata, support-file ontology, implementation
adapters, product artifact authority, or resolver schema.

## Core Frame

Habitat has separate concerns that must not be collapsed:

- Authority area: where the governed concern belongs.
- Blueprint: the thing being authored and enforced.
- Category: the failure class or guarantee being protected.
- Operation kind: what Habitat is allowed to do with one rule packet.

Rule manifests declare operation kind at top level:

```json
{
  "operation": {
    "kind": "check"
  }
}
```

Operation kind is not placement metadata and is not an artifact concept.

## Kinds

### `check`

Read-only evaluation. A check answers whether the current repository state
satisfies authored Habitat authority. Checks must not build packages, write
generated output, edit source, update caches, create lock directories, or
otherwise mutate repository state.

### `fix`

Idempotent repair of existing authored files. A fix should be safe to run
repeatedly and should converge on the same intended shape.

### `generate`

Materialization of declared generated or scaffolded outputs from accepted
inputs. Generation writes declared outputs and should be paired with read-only
placement/currentness checks where appropriate.

### `migrate`

Intentional transition from one accepted authored shape to another. Migrations
require an explicit source shape, target shape, review boundary, and stop
condition.

## Non-Kind Vocabulary

`triage` is a holding-area state for unclear, mixed, legacy, or not-yet-admitted
packets. It is not an executable operation kind and must not appear in current
rule manifests as `operation.kind`.

Implementation adapters such as Grit, Biome, Nx, file-layer, source-check,
command-check, shell, Node, Python, or Vitest are not operation kinds.

## Mutability Boundary

| Kind | Mutates repository state? | Expected risk |
| --- | --- | --- |
| `check` | No | Diagnostic |
| `fix` | Yes, existing authored files only | Routine repair |
| `generate` | Yes, declared generated/scaffolded outputs | Materialization |
| `migrate` | Yes, authored source or data shape | Structural transition |

Any script registered as a `check` but observed writing files, refreshing
generated outputs, or running a mutating build is misclassified. Product/runtime
work belongs with the consuming package unless its purpose is Habitat-scoped
checking, fixing, generation, or migration.
