## Why

The inventory identified useful mutating controls beyond restart/begin:
autoplay, reveal/explore, turn completion, and validated gameplay operation
requests. These must be first-class wrappers with explicit contracts and proof,
not raw JavaScript snippets or hidden fallbacks.

## Target Authority Refs

- User goal: previously `wrap carefully` items are in scope for first-class
  wrappers; proof/contracts are implementation work.
- `docs/projects/civ7-direct-control/workstream/capability-inventory/capability-inventory.md`
- `docs/projects/civ7-direct-control/workstream/capability-inventory/automation-playability-report.md`
- `docs/projects/civ7-direct-control/workstream/capability-inventory/owner-runtime-probes.md`
- Official UI resources for `Autoplay`, `GameContext`, and operation routers.

## What Changes

- Add explicit mutating wrappers for restart/begin, autoplay, reveal/explore,
  turn-complete where available, operation validators, and validator-first
  operation request execution.
- Require validator-first contracts and before/after proof for mutations.
- Prevent automatic mutation replay after socket failure.

## Requires

- `direct-control-state-role-model`
- `direct-control-read-surface` for postcondition reads.

## Enables Parallel Work

- Autoplay smoke tests, either native unbounded or turn-bounded.
- Supervised gameplay command execution.
- LLM-agent action proposals with validator proof.

## Affected Owners

- `packages/civ7-direct-control`
- CLI game commands for explicit actions.
- Workstream verification notes and safety docs.

## Forbidden Owners

- Raw `Game.*sendRequest` callers outside the package for covered operations.
- Account, online, multiplayer, save/delete/load, and broad world-edit APIs as
  convenience wrappers.

## Stop Conditions

- A required action cannot be performed directly from App UI or Tuner.
- Operation validation results cannot be observed or serialized reliably.
- The required proof would mutate an unsafe non-disposable session without
  explicit disposable-session proof.

## Consumer Impact

Developers get explicit safe-enough action APIs; LLM agents get validation and
postcondition feedback instead of raw command authority.

## Verification Gates

- Mock socket tests for action command strings, no-replay behavior, validator
  result parsing, and postcondition parsing.
- Live proof for each newly claimed mutating wrapper when Civ state allows it.
- CLI tests for exposed actions.
- OpenSpec validation and `git diff --check`.
