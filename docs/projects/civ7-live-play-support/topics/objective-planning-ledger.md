# Objective Planning Ledger

Status: `reference-with-gap`.

## Frame

The play agent needs memory for objectives, priorities, assumptions, and
directional pressure. That memory should not become live authority. Direct
control remains the authority for HUD blockers, selected and ready entities,
validators, sends, and postconditions.

Use a local, session-bound SQLite store as an evidence and planning ledger:
what the agent intended, why, what evidence it had, when the evidence expires,
and what would falsify the plan.

## Storage Recommendation

Prefer plain SQLite behind a small typed repository layer first. The CLI is
Node-based, so do not couple the packaged CLI directly to `bun:sqlite` unless
the runtime boundary changes. Drizzle is reasonable later if schema evolution
and typed relational queries become a maintenance burden.

## Entities

Useful tables:

- `sessions`;
- `snapshots`;
- `objectives`;
- `plans`;
- `pressures`;
- `evidence`;
- `candidate_actions`;
- `decisions`.

Every recommendation should cite evidence, expiry, falsifier, and required
validator before mutation.

## Update Flow

1. Watcher reads live HUD and ready views.
2. Store snapshot evidence with proof and freshness lease.
3. Reducer updates pressures and objective priorities from fresh lenses.
4. Planner writes an advisory plan version with assumptions and falsifiers.
5. Before any send, command re-reads live state and validates the action.
6. After send, store postcondition evidence and invalidate stale plan state.
7. On turn advance, restart, human input, or slow read, expire affected
   snapshots and plans.

## Boundary

Reject live game database mutation as a strategy mechanism until freshness,
transaction, and recovery contracts are proven. The ledger can guide attention
and preserve intent across turns; it must not certify that an action is still
valid.
