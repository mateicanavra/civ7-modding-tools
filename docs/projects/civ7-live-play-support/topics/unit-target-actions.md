# Unit Target Actions

Status: live-support topic.

## Frame

`game play unit target` answers one tactical question: what native right-click
action would this local unit perform on this plot? Resolution is read-only by
default. `--send` rechecks the exact admitted action, invokes it once, and
observes focused unit state before reporting an outcome.

The service, not the CLI or runtime provider, owns action ordering,
local-player admission, war refusal, bounded observation, outcome
classification, dispatch uncertainty, and no-repeat guidance. Direct runtime
providers expose only focused observation, one-action validation, and guarded
one-action dispatch.

## Native Decision

The authority is
`.civ7/outputs/resources/Base/modules/base-standard/ui/world-input/world-input.js`.
Its selected-unit right-click path is:

1. Check `UNITOPERATION_NAVAL_ATTACK`.
2. Check `UNITOPERATION_AIR_ATTACK`.
3. Inspect `Game.Combat.testAttackInto`.
4. When combat is ranged, check `UNITOPERATION_RANGE_ATTACK`; failure is
   terminal for that ranged branch.
5. Otherwise check `UNITCOMMAND_ARMY_OVERRUN`.
6. Stop when the requested plot is the unit's current location.
7. Check `UNITOPERATION_SWAP_UNITS`.
8. Check `MOVE_TO`.

Checks use `UnitOperationMoveModifiers.NONE`, except `MOVE_TO`, which is
checked with
`ATTACK + MOVE_IGNORE_UNEXPLORED_DESTINATION`. Naval, air, and ranged sends
also use those dispatch modifiers. An action is available only when native
`canStart(..., false)` returns literal `Success === true`.

The right-click resolver does not use `canStart(...).Plots` as a second target
membership rule. Dedicated interface modes use `Plots` for their own
enumeration flow; that is a different capability.

Naval, air, ranged, and move candidates also call
`Diplomacy.willMoveStartWar`. A positive war target is not dispatched by this
procedure. It returns `dedicated-war-workflow-required`; callers must use the
dedicated confirmation flow and then obtain a fresh target check.

## Service Results

Read-only checks report:

- `action-available` with the selected native action;
- `dedicated-war-workflow-required` with the blocked action; or
- `not-admitted` with no selected action.

Send results distinguish:

- `not-sent`: no native send was invoked;
- `dispatch-unknown`: invocation may have occurred, so repeating is unsafe;
- `sent-confirmed`: focused evidence proves the semantic outcome;
- `sent-guarded`: a partial movement outcome such as `path-shortfall`; or
- `sent-unverified`: dispatch occurred but focused evidence did not prove the
  action's outcome.

`sendRequest` is fire-and-forget. A non-throwing invocation means dispatched,
not engine-acknowledged. Confirmation therefore comes from bounded native
state observation:

- Move: the actor reaches the requested target.
- Path shortfall: the actor is still stopped elsewhere when the bounded
  observation window closes.
- Swap: the actor reaches the target and the tracked target unit reaches the
  actor's origin.
- Attack or overrun: a tracked target is explicitly observed absent or changes
  health/damage, or the actor consumes an attack. A missing tracked row is
  incomplete evidence, not proof of disappearance.

Unrelated state changes remain unverified. Missing evidence and no state
change require a fresh read and forbid blind repetition.

## CLI

```bash
civ7 game play unit target \
  --unit-id '{"owner":0,"id":65536,"type":26}' \
  --x 23 \
  --y 33 \
  --json
```

Add `--send` only after reviewing fresh availability:

```bash
civ7 game play unit target \
  --unit-id '{"owner":0,"id":65536,"type":26}' \
  --x 23 \
  --y 33 \
  --send \
  --json
```

Both modes call the same unit service. The CLI does not select candidates,
invoke direct-control helpers, or expose raw commands, runtime snapshots,
validator envelopes, or Tuner state.

## Proof Boundary

Package tests prove official call order, exact arguments, war refusal, guarded
single dispatch, polling, classifications, and API projection against local
fake runtimes. A fresh deployed Civ7 pass is still required across
representative naval, ranged, swap, overrun, and move targets.
