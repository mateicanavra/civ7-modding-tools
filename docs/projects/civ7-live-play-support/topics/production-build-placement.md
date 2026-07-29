# Production Build Placement

Status: `active-reference`.

## Frame

City production uses one operation family, but not one argument shape:

- Units: `city-operation BUILD { UnitType }`.
- Constructibles: `city-operation BUILD { ConstructibleType }`, plus `X` and
  `Y` when the validator or placement UI returns legal plots.
- Ordinary city projects: `city-operation BUILD { ProjectType }`.
- Town focus projects are not ordinary production; they use
  `city-command CHANGE_GROWTH_MODE { Type, ProjectType, City }`.

Use `game play build-production` for ordinary production choices. Keep the item
kind explicit with exactly one of `--unit-type`, `--constructible-type`, or
`--project-type`. Without `--send`, the command calls the service-owned
`city.production.choice.check` procedure and reports `result.available`. With
`--send`, it calls `city.production.choice.request`; read `result.status` and
`result.postcondition` before treating the choice as closed. A successful
low-level `BUILD` send is not by itself proof that the production-choice
notification stopped blocking turn flow.

For the read-only choice surface, prefer:

```bash
civ7 game play ready-city --compact --json
```

The compact `productionCandidates[]` rows expose source-backed `cost`, `turns`,
`productionBasis`, and constructible `baseYieldSummary` fields. These are
decision aids from official runtime/UI surfaces, not recommendations:
constructible costs prefer `city.Production.getConstructibleProductionCost`,
then validator `Cost` or `GameInfo.Constructibles.Cost`; unit/project costs
come from `city.Production` helpers. Turns come from
`city.BuildQueue.getTurnsLeft(type)` and should be treated as visible ETA only
when `productionBasis.showTurns` is true; the official chooser also hides `-1`
turn values.

## Official Runtime Evidence

The official production chooser exposes the native gameplay path. It maps item
kinds into the operation args:

- `KIND_UNIT` -> `{ UnitType }`
- `KIND_CONSTRUCTIBLE` -> `{ ConstructibleType }`
- `KIND_PROJECT` -> `{ ProjectType }`

It then probes constructibles with:

```js
Game.CityOperations.canStart(cityID, CityOperationTypes.BUILD, { ConstructibleType: constructible.$index }, false)
```

When a production item already has `result.InProgress` with `result.Plots`, the
chooser can take the first returned plot, convert it through
`GameplayMap.getLocationFromIndex`, add `X`/`Y`, and send `BUILD` directly.
When placement needs user/map interaction, the official placement mode keeps
the original `OperationArguments`, adds coordinates, revalidates, and sends:

```js
operationArgs.X = plot.x;
operationArgs.Y = plot.y;
Game.CityOperations.canStart(cityID, CityOperationTypes.BUILD, operationArgs, false);
Game.CityOperations.sendRequest(cityID, CityOperationTypes.BUILD, operationArgs);
```

City selection, camera movement, plot-cursor changes, and chooser closeout are
presentation behavior around this path; they are not prerequisites of
`CityOperations.BUILD`. Production control therefore validates and sends the
native operation without mutating UI state.

The official callers do not consume a return value from `sendRequest`. A
successful call proves only that dispatch was invoked without throwing, not
that the engine accepted or completed the choice. The shared control service
therefore retains bounded authoritative queue/blocker readback for both current
providers. Native
`CityProductionChanged` and `CityProductionQueueChanged` events may later
replace polling when production runs exclusively through the persistent
controller, but those events are wakeups for a fresh read rather than
standalone acceptance receipts.

Local anchors:

- `.civ7/outputs/resources/Base/modules/base-standard/ui/production-chooser/panel-production-chooser.js`
  probes production items.
- `.civ7/outputs/resources/Base/modules/base-standard/ui/production-chooser/production-chooser-helpers.js`
  maps unit/constructible/project item kinds, handles immediate plot-backed
  sends, and enters placement mode when a chosen item requires it.
- `.civ7/outputs/resources/Base/modules/base-standard/ui/interface-modes/interface-mode-place-building.js`
  commits placement by adding `X`/`Y` before `sendRequest`.

## Live Proof

The active play thread hit a production blocker at turn 78. Ancient Walls had
`ConstructibleType: 713967338`; validating and sending only
`{ ConstructibleType: 713967338 }` did not clear the blocker. The official
placement form with:

```json
{ "ConstructibleType": 713967338, "X": 22, "Y": 31 }
```

queued the production and expired the blocker. That makes constructible
placement a proven live path, not only an inferred UI path.

## CLI Use

Validate a unit:

```bash
civ7 game play build-production \
  --city-id '{"owner":0,"id":65536,"type":1}' \
  --unit-type 1558890441 \
  --json
```

Send a placement-sensitive constructible after the plot is proven:

```bash
civ7 game play build-production \
  --city-id '{"owner":0,"id":65536,"type":1}' \
  --constructible-type 713967338 \
  --x 22 \
  --y 31 \
  --send \
  --json
```

Validate an ordinary city project:

```bash
civ7 game play build-production \
  --city-id '{"owner":0,"id":65536,"type":1}' \
  --project-type <project-type> \
  --json
```

Project production still needs live proof for common IDs and semantic
postconditions. The operation shape has official UI support, but the tactical
choice should come from the live production chooser.

## Postcondition Contract

`game play build-production --send --json` returns the service result under
`result`. Its `result.status` is `not-sent`, `dispatch-unknown`,
`sent-confirmed`, or `sent-unverified`; `result.postcondition` carries the
production-specific proof decision for `city-operation BUILD`:

- `not-sent`: validation or dispatch evidence proves no mutation was sent.
- `production-choice-cleared`: a matching production blocker existed before
  the request and the readable post-send blocker state proves it clear.
- `production-state-changed`: immutable build-queue evidence changed.
- `production-state-changed-blocker-still-live`: the city production state
  changed, but the same production-choice blocker is still live. Do not repeat
  the same `BUILD` blindly; refresh queue and blocker evidence.
- `validation-changed`: the subsequent `BUILD` validator changed.
- `no-state-change`: the request returned, but observed city production state
  and blocker state did not change.
- `missing-postcondition`: dispatch or required post-send evidence is
  unavailable or unreadable. Treat the result as unverified and do not repeat
  until fresh production and blocker evidence is available.

Each postcondition also reports `outcome`, `confidence`, `confirmed`, and
`noRepeatAfterUnverified`; service-owned `result.nextSteps` carries the
evidence-based follow-up. This is a proof boundary, not strategy. A sticky
production notification after state change is a closeout/notification problem;
a clean production choice should clear the blocker or reveal a different
blocker in the HUD.
