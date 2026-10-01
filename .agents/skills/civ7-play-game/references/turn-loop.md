# Actor-Facing Turn Loop

Run one mutation at a time:

```text
status
  -> situation/priorities
  -> choice blockers
  -> ready units
  -> city decisions
  -> turn-completion check
  -> turn-completion request
  -> fresh situation
```

Before the first turn, discover current leaves and flags:

```bash
bun apps/cli/bin/run.js game --help
bun apps/cli/bin/run.js game play --help
```

Ask every selected leaf for `--help`. The command examples below name current
leaves only; their flags and result fields come from live discovery.

## 1. Gate On Controller Readiness

Select the controller readiness read from native game help. Proceed only when
it reports a playable,
mutation-capable, current observation. Otherwise use
`setup-and-recovery.md`.

Do not query the Tuner resource directly for gameplay readiness. The controller
owns typed native readiness; Play owns the actor-facing readiness decision.

## 2. Read The Play Situation

Select the situation/planning read from native play help and request its
structured agent view.
Work the returned priority and next-action descriptors in order.

Typical owner routing:

| Situation | Play owner |
| --- | --- |
| blocking notification or ready entity | attention |
| gameplay autoplay choice | automation |
| production, worker, expansion, town focus | city |
| response or first meet | diplomacy |
| notification review/dismissal | notifications |
| research, culture, government, tradition, celebration, narrative, attribute | progression |
| front, destination, formation, settlement, movement analysis | planning |
| turn completion | turn |
| unit movement/target/resettle/upgrade/readiness | unit |

The CLI may retain older caller-facing nouns. Route by semantic owner, not path
spelling.

## 3. Resolve Choice Decisions

For each progression or diplomacy choice:

1. Read the current options/decision.
2. Choose using `strategy.md` and explicit human constraints.
3. Echo the returned ids/actions exactly into the named check.
4. Request only after the check admits it.
5. Read the procedure's postcondition, uncertainty, and next action.
6. Re-read priorities because resolving one choice can expose another.

Select the exact choice family, leaf, and flags through native help.

## 4. Drain Ready Units

Repeat:

1. Select the unit family and ready-unit view through native play help.
2. Select the returned ready unit and inspect lawful named actions.
3. For movement, use the selected movement-planning read to obtain a
   reachable coordinate.
4. Check the named unit action with the exact component id and coordinate.
5. Request it once.
6. Re-read the unit and situation.

Interpret results carefully:

- reached/confirmed: continue;
- path shortfall or multi-turn progress: preserve the destination and continue
  on a later turn;
- refused without dispatch: refresh and correct once;
- guarded/uncertain dispatch: reconcile before any retry;
- only an unnamed native operation remains: stop and report the capability gap.

Strategic settlement/front suggestions are not automatically reachable action
coordinates. Move toward them through fresh unit planning reads.

## 5. Resolve City Decisions

Select the city situation view and named request leaves through native play
help.

For each blocking city/town:

1. Read production, worker, expansion, and town-focus candidates.
2. Choose from returned candidates only.
3. Check the matching named action.
4. Request it once and inspect its postcondition.
5. Re-read the city/situation before the next city action.

## 6. Check Turn Completion

Select the turn-completion leaf through native play help and invoke its check
mode.

- If blockers remain, route each to the owning play module and resolve one at a
  time.
- If the result is stale or unavailable, refresh status and situation.
- Request turn completion only when a fresh check admits it.

Do not interpret a CLI return or raw native dispatch as `turn advanced`.

## 7. Request And Reconcile Turn Completion

Send the named request once. Require the turn procedure's own result:

- postcondition satisfied: move to waiting;
- refused/no dispatch: resolve the returned blocker;
- uncertain/dispatch may have occurred: preserve the operation key and follow
  reconciliation; do not send again.

## 8. Wait For A Fresh Turn

Read the play situation again or use the current watch projection. Resume only
when fresh state identifies the actor's turn and exposes decisions or lawful
turn completion. If progress stalls, check controller status and use
`setup-and-recovery.md`.

## Stop Conditions

- target turn reached;
- human consultation trigger;
- missing named action;
- second refusal for the same corrected action;
- uncertain mutation cannot be reconciled;
- resource epoch or game identity changed mid-decision;
- session no longer playable/mutation-capable.

## Per-Action Record

- situation/priority id;
- candidate source read;
- check input/result;
- request input and operation/no-repeat key;
- dispatch disposition;
- postcondition/reconciliation;
- next action;
- retry law.
