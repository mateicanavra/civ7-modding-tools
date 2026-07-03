# Prework Decision Qualification Frame

Status: active slice packet

This slice qualifies unresolved owner and destination decisions before the
closed domain topology work becomes executable. It does not move source files,
write `structure.toml`, add Grit packets, or change live enforcement.

This is a prework qualification slice. It uses only `frame.md` and
`inventory.md`, plus `single-prework-decision-frame.md` for the reusable
one-decision pass method. It selects no enforcement scopes and has no
implementation write set. It does not need `scope-set.md` or `execution.md`
until a later slice activates scopes or source changes.

## Purpose

Slice 001 has a defined target shape, but several red rows still point at
blocking owner-law dominoes instead of exact destinations. This slice works
backward from the least-defined unresolved rows to the more-defined rows so
the next implementation slice does not require agents to invent destinations.

The output of each decision pass is one of:

- an exact destination or delete action backed by an existing scope, file
  description, pattern, or owner boundary;
- a scoped update to the relevant scope, file description, pattern, or decision
  book when the destination category exists but the law is incomplete;
- a named later domino when the item is outside the domain closed-structure
  slice.

## Operating Loop

Use this loop for every item in `inventory.md`:

```text
select one inventory item -> answer its Decision line ->
write the disposition to the owning reference -> update Slice 001 inventory
```

`single-prework-decision-frame.md` defines how to answer one item from
`inventory.md`. This is one pass over one unresolved prework decision, not a
pass over the full red inventory.

The pass stops at the first item whose owner or destination remains unresolved
after current authority and source evidence are applied. Executable instructions
carry resolved choices.

Qualification results update the owning reference:

- exact source-path dispositions update Slice 001 `inventory.md`;
- reusable criteria update the shared `decision-book/`;
- topology, file, or pattern law updates the owning scope tree file;
- out-of-scope work becomes a named later domino.

## Evidence Standard

Use the evidence policy in `single-prework-decision-frame.md`; that file remains
the single evidence standard for this slice.

## Skill Routing

Use the smallest skill set required by the active inventory item. The
single-decision frame defines the default skill routing and the point at which
each skill becomes relevant. Load a skill when it affects the active decision.

## Agent Use

The steward owns synthesis and final decisions. Agents follow the roles and
prompt contract in `single-prework-decision-frame.md`. Review agents must be
fresh relative to implementation or write-back work.

## Closure Rule

This slice is complete when every item in `inventory.md` is either:

- qualified with an exact destination/delete action and governing law; or
- explicitly assigned to a named later domino because it is outside the selected
  closed-domain topology slice.

The next implementation slice may only burn down qualified items.
