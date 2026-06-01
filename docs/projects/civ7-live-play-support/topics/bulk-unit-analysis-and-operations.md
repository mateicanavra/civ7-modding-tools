# Bulk Unit Analysis And Operations

Status: `reference-with-gap`.

## Frame

The n=1 unit view is the primitive, not the default ergonomics. A play agent
should be able to inspect a formation, front, or selected unit family in one
read, then execute a deliberate ordered batch with per-step proof. Bulk does
not mean transactional rollback. Civ7 unit actions are live, irreversible state
transitions; a batch must be a ledger of revalidated attempts.

## Bulk Analysis

Bulk unit analysis belongs in `@civ7/direct-control`, with CLI as a thin JSON
surface.

Proposed API:

```ts
getCiv7BulkUnitAnalysis(input, options)
```

Useful selectors:

- `selected`;
- `ready`;
- `all-local`;
- explicit `unitIds`.

Useful lenses:

- reachable movement;
- enemies;
- points of interest;
- threat;
- support;
- objective fit;
- path costs;
- attack options;
- formation posture.

Transient objective hints may be accepted in the request, but storage belongs
to the session planning ledger, not the read lens.

## Bulk Operations

Bulk operations should compose existing n=1 validators and requesters:

```ts
planCiv7UnitOperationBatch(input)
requestCiv7UnitOperationBatch(input, approval)
```

The batch input should be ordered. Each entry needs an id, unit id, family,
operation type, args, and optional expected postcondition.

Policy defaults:

- dry-run plans are stale immediately after planning;
- execution revalidates immediately before each send;
- default stop policy is validation, send, or postcondition failure;
- no rollback promise;
- mixed or high-risk batches require per-op approval or a signed plan id;
- active blockers are refused unless the caller explicitly routes a known
  notification workflow.

## Result Ledger

The result should be ledger-first:

- batch id;
- status: `planned`, `completed`, `partial`, `blocked`, or `failed`;
- attempted and skipped counts;
- `effectsAreNonRollbackable: true`;
- entry list with validation, request, postcondition, blocker, and error
  evidence.

## First Slice

Start with dry-run plus sequential execution for low-risk unit operations such
as `SKIP_TURN`, `FORTIFY`, and `SLEEP`, then add movement only after
postconditions can prove location, queue, activity, or path shortfall.

## Boundary

Moving unit A can change visibility, pathing, blockers, and validity for unit
B. Never validate the whole batch once and blindly replay it.
