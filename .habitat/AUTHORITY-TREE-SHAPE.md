# Habitat Authority Tree Shape

Status: working normative reference for the next flattening pass

This document defines the current target shape for `.habitat` authority
artifacts. It is intentionally narrow. It does not define final resolver
metadata, support-file ontology, blueprint schema, or niche cascade semantics.

## Core Decision

Habitat should flatten the premature concern-layer buckets, preserve the
current domain-niche jurisdiction model, and reorganize current leaf folders as
artifact packets under `_self/<kind>/`.

Target shape:

```text
.habitat/
  <niche>/
    _self/
      check/
        <artifact-packet>/
      fix/
        <artifact-packet>/
      generate/
        <artifact-packet>/
      migrate/
        <artifact-packet>/
      triage/
        <artifact-packet>/
```

For nested niches, normal child directories remain child niches. `_self/` is the
separator for artifacts owned by that exact niche:

```text
.habitat/
  civ7/
    mapgen/
      pipeline/
        _self/
          check/
            op-calls-op/
            rng-authority-static/
          fix/
          generate/
          migrate/
          triage/

        recipes/
          _self/
            check/
              recipe-domain-surface/
```

The immediate flattening pass should not invent new child niches such as
`recipes/` or `stages/` unless the current placement is clearly wrong. Future
domain refinement may move packets from a parent niche into child niches after
the boundary is proven.

## Concepts

### Niche

A niche is the jurisdiction model. It is an author-defined authority boundary
that answers: what part of this Habitat's governed ecosystem owns this policy,
operation, or future blueprint?

Niche labels and grouping are intentionally authored design decisions. Habitat
should make the consequences explicit and enforceable, but it should not pretend
there is one universal automatic niche taxonomy that fits every repository.

Examples in the current tree:

- `global/repository`
- `habitat/toolkit`
- `docs/content`
- `docs/site`
- `civ7/resources`
- `civ7/platform`
- `civ7/mapgen/core`
- `civ7/mapgen/pipeline`
- `civ7/mapgen/studio`

Niche directories should be domain nouns, not runner names, rule IDs, current
defect names, artifact kinds, or artifact classes.

### `_self`

`_self/` is the staging container for artifacts owned by the exact niche whose
directory contains it.

It is deliberately weaker than a final ontology term. It exists to keep the
tree semantically legible during the flattening pass:

- normal directories under a niche are child niches;
- `_self/` contains this niche's own artifact packets;
- artifact-kind directories live under `_self/`;
- child niches are never visually mixed with artifact-kind directories.

Do not treat `_self/` as the final blueprint model. It is a practical separator
until blueprint structure is designed.

### Artifact Kind Directory

An artifact-kind directory answers: what is Habitat allowed to do here?

Accepted artifact-kind directories under `_self/` are:

- `check`
- `fix`
- `generate`
- `migrate`
- `triage`

The mutability contract for executable kinds is defined in
`ARTIFACT-KINDS.md`. `triage/` is not an executable kind; it is a holding area.

### Artifact Packet

The current leaf folders are artifact packets. They are the gathered executable
or enforceable units that have been called "subjects" during triage.

An artifact packet is not necessarily a future blueprint. Most current packets
represent one authority handle plus supporting files, such as:

```text
op-calls-op/
  op-calls-op.rule.json
  op-calls-op.pattern.md
  op-calls-op.baseline.json
  op-calls-op.check.mjs
```

For the next flattening pass, treat each current leaf folder as one artifact
packet and classify it by its primary executable artifact kind.

### Blueprint

A blueprint is the intended future executable/enforceable unit within a niche.
It should define how to create, maintain, or evolve a class of thing end to end.

Niche and blueprint are different axes:

- A niche is jurisdiction: who owns this part of the Habitat?
- A blueprint is a designed executable model inside that jurisdiction.

A single niche may later contain multiple blueprints, such as stage, recipe,
contract, or map-projection blueprints under `civ7/mapgen/pipeline`.
Collapsing niche into blueprint would be wrong because it would force one
authority area to equal one executable plan.

Blueprint structure is not the next domino. This document records the direction
so it is not lost, but the flattening pass should not invent blueprint
directories, split current packets into blueprints, or harden blueprint
metadata.

### Triage

`triage/` is a temporary holding area under `_self/` for packets that do not yet
cleanly classify as `check`, `fix`, `generate`, or `migrate`.

Triage packets are not admitted executable authority merely because they are
inside `.habitat`. A later pass must either classify, split, rename, or remove
them.

## Negative Rules

- Do not keep `boundaries`, `structure`, `capabilities`, or `contracts` as
  required layer buckets in the next tree shape.
- Do not place `check`, `fix`, `generate`, `migrate`, or `triage` directly next
  to child niches. They belong under `_self/`.
- Do not create runner-named directories such as `grit`, `nx`, `source-check`,
  `file-layer`, or `command-check`.
- Do not create domain branches for narrow rule handles such as `ecology`,
  `placement`, or current defect names unless a later domain-design pass proves
  that they are real niches.
- Do not create `check/`, `fix/`, `generate/`, and `migrate/` inside every
  current artifact packet. That shape belongs to a future blueprint model, not
  the current gathered packet model.
- Do not classify a mutating script as `check` to preserve an existing path.

## Classification Rule For The Flattening Pass

Classify each current leaf folder by the strongest admitted artifact kind it
contains:

- `*.check.*` or read-only rule/pattern/file-layer authority -> `_self/check`
- `*.fix.*` or explicit fix operation identity -> `_self/fix`
- `*.generate.*` or explicit generate operation identity -> `_self/generate`
- migration/codemod transition artifacts with source and target shape ->
  `_self/migrate`
- mixed, unclear, legacy, or not-yet-admitted packets -> `_self/triage`

If a folder contains multiple real artifact kinds and cannot be classified by
one primary kind without losing meaning, move it to `_self/triage/` rather than
splitting it during the mechanical flattening pass.

## Execution Implications

The target tree lets Habitat discover executable authority by scanning:

```text
.habitat/**/_self/check/*/
.habitat/**/_self/fix/*/
.habitat/**/_self/generate/*/
.habitat/**/_self/migrate/*/
```

The runner should infer:

- the niche route from the path before `_self/`;
- the artifact kind from the directory immediately below `_self/`;
- the artifact packet identity from the directory below the artifact kind.

It should not require every artifact packet to redeclare niche, layer, owner, or
implementation adapter metadata when those facts are recoverable from tree
placement or file shape.

`_self/triage/` is intentionally excluded from default execution.

## Next Move Pipeline

The next flattening pass should proceed in this order:

1. Gather the current `.habitat` leaf-folder corpus and count each packet once.
2. Preserve current niche placements unless a packet is clearly misplaced.
3. Classify every packet into `_self/check`, `_self/fix`, `_self/generate`,
   `_self/migrate`, or `_self/triage` using the rule above.
4. Detect collisions that would occur after removing the current layer buckets.
5. Move whole packet folders mechanically into the target niche/kind shape.
6. Update live path references in package scripts, tests, Habitat docs, and
   Toolkit compatibility surfaces that directly point at moved packets.
7. Verify that every pre-move packet exists exactly once after the move.

The flattening pass should not rewrite rule semantics, invent blueprints, solve
the support-file ontology, or create child niches merely because a future
refinement might justify them.
