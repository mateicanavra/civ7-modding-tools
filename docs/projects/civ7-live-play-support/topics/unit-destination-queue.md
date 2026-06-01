# Unit Destination Queue

Status: `official-evidence-needs-live-smoke`.

## Frame

A current-turn `MOVE_TO` and a multi-turn destination are different play
concepts. The play agent needs to tell a unit "go there over multiple turns"
when that is the right human move, then keep seeing that unit as an in-motion
commitment with tactical risk. This should not become blind automation: queued
movement can walk into newly dangerous terrain if the board changes.

## Official Evidence

The official UI evidence points to one mutating move operation and a separate
queued-destination read surface:

- `.civ7/outputs/resources/Base/modules/base-standard/ui/world-input/world-input.js:419`
  owns the right-click `requestMoveOperation` path.
- `.civ7/outputs/resources/Base/modules/base-standard/ui/world-input/world-input.js:511`
  validates `UnitOperationTypes.MOVE_TO` with the clicked `{ X, Y, Modifiers }`.
- `.civ7/outputs/resources/Base/modules/base-standard/ui/world-input/world-input.js:522`
  sends `Game.UnitOperations.sendRequest(unit.id, UnitOperationTypes.MOVE_TO,
  parameters)`.
- `.civ7/outputs/resources/Base/modules/base-standard/ui/interface-modes/interface-mode-move-to.js:36`
  initializes move mode with
  `UnitOperationMoveModifiers.MOVE_IGNORE_UNEXPLORED_DESTINATION`, meaning the
  human UI is designed to click destinations beyond immediately known movement
  detail.
- `.civ7/outputs/resources/Base/modules/base-standard/ui/unit-actions/unit-actions.js:1005`
  target-plot unit action callbacks also set `X`/`Y` and send the selected unit
  operation; `UNITOPERATION_MOVE_TO` gets move modifiers before send.
- `.civ7/outputs/resources/Base/modules/base-standard/ui/interface-modes/support-unit-map-decoration.chunk.js:216`
  renders desired hover paths with `Units.getPathTo(unitID, destination)`.
- `.civ7/outputs/resources/Base/modules/base-standard/ui/interface-modes/support-unit-map-decoration.chunk.js:239`
  reads existing queued movement through `Units.getQueuedOperationDestination`
  and renders the remaining path with `Units.getPathTo`.

Current inference: the manual UI appears to set long-distance destinations by
sending the same `MOVE_TO` operation to the clicked destination, then relies on
the queued-destination/path APIs for later visualization. This is strong
official UI evidence, not yet live direct-control proof.

## Proposed Read Surface

Add a read-only lens before any mutating shortcut:

```bash
game play unit-destination --unit-id '<unit-id>' --json
```

Useful fields:

- `unitId`, `typeName`, `location`, `movementMovesRemaining`,
  `attacksRemaining`, `damage`;
- `queuedDestination`: `null` or `{ x, y }` from
  `Units.getQueuedOperationDestination`;
- `queuedPath`: compact `Units.getPathTo(unitId, queuedDestination)` summary
  when present: endpoint, next tile, plot count, turn count if exposed;
- `risk`: `"unknown" | "none-detected" | "risk-detected"`;
- `riskReasons`: short expandable reasons from battlefield and visibility
  lenses, such as enemy proximity, wounded unit, civilian exposure, hostile city
  zone, fogged path, water/embark edge, or stale preview;
- `recommendedRefresh`: usually `each-turn` for queued movement.

## Proposed Mutation

Keep the mutating command provisional until live smoke proves the direct-control
path:

```bash
game play set-unit-destination \
  --unit-id '<unit-id>' \
  --destination 30,24 \
  --send \
  --reason '<why this destination is strategically correct now>'
```

Likely implementation: validate and send `unit-operation MOVE_TO` with
`{ X, Y, Modifiers }`, using the same official right-click order as
`unit-target` when the destination plot might be attack, swap, or overrun.

Mutation postcondition should accept:

- `target-reached` when the unit lands on the destination this turn;
- `path-shortfall` when the unit moved but did not reach the destination;
- `queued-destination-set` when `Units.getQueuedOperationDestination` equals the
  requested destination after the send;
- `queued-destination-advanced` when the queued destination remains but the path
  or unit location changed;
- `no-state-change` when none of the above changed.

## Live Smoke Needed

Use a low-risk local unit with a destination beyond current movement range:

1. Read `unit-destination` and `unit-move-preview`.
2. Validate `MOVE_TO` for a far reachable/pathable destination.
3. Send once with approval.
4. Poll unit state, ready queue, `Units.getQueuedOperationDestination`, and
   `Units.getPathTo` for the requested destination.
5. End turn only after noting whether the queue persists and whether the unit
   continues movement automatically on the next turn.

Do not smoke this with a civilian route, an exposed front unit, or a destination
through fog until the risk HUD exists.

## Play Norm

Queued destination is strategic intent, not safety. Every turn, any unit with a
queued destination should surface as an in-motion HUD item until either the
destination is reached, the queue clears, or risk changes enough that the agent
should cancel or override the route.
