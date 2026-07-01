# Remainder Remediation Action Frame

Status: specialization frame

Durability: standalone adapter for applying the general Habitat rule
remediation method frames to reviewed `_remainder` rows.

## Frame Identity

Frame name: Remainder Remediation Action

For situation: Habitat rules already sit in `_remainder/`, their earlier
receipt language marks them as processed-but-not-settled, and the next work is
to classify, decide, and execute the real state-space reducing action without
inventing false ownership.

Mode: specialization of the general rule-remediation method set

Object path: process-control adapter for reviewed remainder rows

Primary object: live `_remainder` rule rows.

## What This Frame Is

This frame is not the full method. It binds `_remainder` work to the three
general method frames:

- `RULE-ACTION-CLASSIFICATION-FRAME.md`: use first to classify each remainder
  row's action decision.
- `RULE-DECISION-PACKET-FRAME.md`: use for any remainder row whose action
  decision requires clause decomposition or a full semantic decision.
- `RULE-REMEDIATION-SLICE-FRAME.md`: use to implement one coherent remainder
  slice after classifications and decision packets exist.

The `_remainder` directory is visual/process evidence, not an owner. This
adapter adds the remainder-specific source boundary, entry tests, and closure
requirements.

## Selection Commitments

In:

- live `_remainder/**/rule.json` packets;
- authority-tree ledger rows for those packets;
- domino receipts that explain why the row was placed or retained in
  `_remainder`;
- current runner, support-file, baseline, path coverage, scan-root, and source
  evidence;
- architecture/product authority needed to identify honest owner and false
  owner.

Foreground:

- whether the row is truly remainder debt or now admissible live context
  authority;
- the state-space reducing action decision;
- concrete pending action for every row that remains in `_remainder`;
- proof that `_remainder` is not being used as a dumping ground.

Exterior:

- rule-manifest category redesign;
- multi-rule classification workstreams;
- broad blueprint or niche redesign unless a row's action decision directly
  requires it;
- clearing `_remainder` by moving rows into broad catch-all destinations.

## Remainder-Specific Entry Tests

Before using the general frames on a remainder row, confirm:

1. The row is live in the current authority tree.
2. The row has process evidence explaining why it was left in `_remainder`.
3. The current packet, runner, and support files resolve.
4. The prior receipt does not already give an implementation-ready decision
   packet.
5. The current `_remainder` location is treated as debt state, not as owner
   authority.

If any test fails, repair the process record or classify the rule as metadata
repair before proceeding.

## Remainder-Specific Action Bias

Apply `RULE-ACTION-CLASSIFICATION-FRAME.md` normally, with this extra bias:

- Prefer `context admission` only when the rule is already atomic and the
  honest owner is clear.
- Prefer `split by owner` when the row was left in `_remainder` because its
  predicate carried mixed context.
- Prefer `positive authority creation`, `closed structure inversion`, or
  `boundary inversion` when several remainder rows are negative proxies for one
  missing positive surface.
- Prefer `retirement/garbage collection` when a row exists only to protect an
  old migration seam whose source residue is gone.
- Prefer `runtime/source validation` when the producer rail can enforce the
  invariant more directly than Habitat text matching.

Do not create a new bucket to avoid making the action decision.

## Required Row Output

For each processed remainder row, the durable ledger or linked matrix must
contain at least:

```text
Rule id:
Current remainder path:
Action decision:
Expected remediation outcome:
Decision packet needed:
Remainder status:
Pending action:
Evidence note:
```

`Remainder status` must be one of:

- `admit from remainder`;
- `remain in remainder with action`;
- `split before admission`;
- `retire/delete candidate`;
- `replace with positive authority`;
- `replace with native rail`;
- `metadata repair`.

Every row that remains in `_remainder` must have a concrete pending action.

## Slice Closure Additions

When `RULE-REMEDIATION-SLICE-FRAME.md` is used for a remainder slice, the
closure record must also state:

- rows removed from `_remainder`;
- rows retained in `_remainder`;
- why each retained row could not be admitted, retired, inverted, or moved in
  this slice;
- the exact pending action for each retained row;
- whether any empty `_remainder` directories were removed;
- whether remaining `_remainder` rows still have ledger coverage.

## Falsifiers

This adapter is the wrong tool if:

- the row has not been reviewed into `_remainder` or lacks process evidence;
- the current task is a full all-rule action classification pass;
- the current task is to design a new general method frame;
- the only desired output is a loose recommendation list;
- `_remainder` is being treated as the final owner.

## Review And Judgment Criteria

A valid remainder application:

- uses the general frames rather than duplicating them;
- keeps `_remainder` as a debt marker, not an owner;
- gives every retained row a concrete pending action;
- records non-moves as deliberately as moves;
- refuses broad renamed buckets;
- closes only after the ledger can mechanically distinguish processed,
  retained, admitted, retired, split, and still-blocked rows.
