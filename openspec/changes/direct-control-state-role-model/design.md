## Design

The package models Civ7 direct control as one transport with multiple scripting
state roles. Role is part of the command contract, not an implementation detail.

### State Roles

| Role | State name | Contract |
|---|---|---|
| `app-ui` | `App UI` | Lifecycle, client/session, network/loading, Begin Game, App UI status, turn-complete requests, autoplay where proven. |
| `tuner` | `Tuner` | Post-Begin gameplay/map reads, GameInfo/Database reads, visibility, unit/city/player operation validators and requests, autoplay where proven. |

`LSQ:` state presence is listener evidence only. Tuner gameplay readiness
requires a read-only canary after Begin Game.

### Readiness Phases

- listener-ready: socket accepts `LSQ:`.
- app-ui-ready: `App UI` can execute read-only snapshot commands.
- begin-ready: App UI loading state is `WaitingForUIReady` or
  `WaitingToStart`.
- game-started: App UI reports `GameStarted` and in-game.
- tuner-ready: Tuner read-only gameplay canary passes.

### Reconnect And Replay

The package may reconnect and retry read-only state discovery, health probes,
snapshots, and catalog probes. State-changing commands run at most once per
caller request unless the caller explicitly issues a new request.

### Error Taxonomy

Role-aware wrappers should preserve existing connection errors and distinguish:

- unavailable state role;
- state role present but not ready;
- command failure;
- invalid/bounded input;
- mutation rejected by validation;
- mutation postcondition not observed;
- catalog validation failure.

### OpenSpec Slices

This slice is the dependency root. The read, action, catalog, and integration
changes each add requirements against this role model.

## Review Lanes Required

- Architecture review for ownership and no duplicate transport.
- Product review for developer/player/LLM-agent state semantics.
- Verification review for no automatic replay of mutations.
