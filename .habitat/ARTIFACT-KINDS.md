# Habitat Artifact Kinds

Status: working reference, not machine-readable config

This document defines Habitat artifact kinds and their mutability rules. It does not define blueprint metadata, support-file ontology, implementation adapters, or resolver schema.

## Core Frame

Habitat has three separate concerns that must not be collapsed:

- Authority area: where the governed concern belongs.
- Blueprint: the thing being authored and enforced.
- Artifact kind: what Habitat is allowed to do with one packet.

The current tree shape co-locates packet role files at
`.habitat/blueprints/<blueprint>/<packet>/` for affirmed blueprint-owned
packets, `.habitat/**/_blueprints/<candidate>/<packet>/` for niche-local
candidate blueprint-shaped packets, `.habitat/**/rules/<packet>/` for
niche-local rule inventory, and `.habitat/**/_remainder/<packet>/` for
reviewed deferred inventory. Nested contexts are represented as child niches,
not as folders under `rules/`. Category and artifact kind are manifest
placement facts, not directories.

## Kinds

### `check`

Read-only evaluation. A check answers whether the current repository state satisfies authored Habitat authority. Checks must not build packages, write generated output, edit source, update caches, create lock directories, or otherwise mutate repository state.

### `fix`

Idempotent repair of existing authored files. A fix should be safe to run repeatedly and should converge on the same intended shape.

### `generate`

Materialization of derived or scaffolded artifacts from accepted inputs. Generation writes declared outputs and should be paired with read-only placement/currentness checks where appropriate.

### `migrate`

Intentional transition from one accepted authored shape to another. Migrations require an explicit source shape, target shape, review boundary, and stop condition.

### `triage`

Holding area for mixed, unclear, legacy, or not-yet-admitted packets. Triage is not an executable kind for default runs.

## Mutability Boundary

| Kind | Mutates repository state? | Expected risk |
| --- | --- | --- |
| `check` | No | Diagnostic |
| `fix` | Yes, existing authored files only | Routine repair |
| `generate` | Yes, declared generated/scaffolded outputs | Materialization |
| `migrate` | Yes, authored source or data shape | Structural transition |
| `triage` | No default execution | Unadmitted or unclear |

Any script registered as a `check` but observed writing files, refreshing generated outputs, or running a mutating build is misclassified. Product/runtime work belongs with the consuming package unless its purpose is Habitat-scoped checking, fixing, generation, or migration.

## Runner Responsibilities

Habitat should read authority area, blueprint, category, kind, and rule identity
from the manifest. The current tree path should match those inventory facts,
but it is not the source of identity. Execution should select by manifest
runner and kind, enforce mutability guarantees, exclude `triage` by default,
and keep implementation dispatch in `tools/habitat`.

Implementation adapters such as Grit, Biome, Nx, file-layer, source-check, command-check, shell, Node, Python, or Vitest are not artifact kinds.
