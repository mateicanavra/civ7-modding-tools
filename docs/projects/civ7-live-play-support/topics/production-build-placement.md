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

Use `game play build-production` for ordinary production choices. Keep
`game play build-unit` as a stable unit-specific shortcut, but prefer the
broader command when building new guidance because it keeps the item-kind
decision explicit. In send mode, read `productionPostcondition` before treating
the choice as closed; a successful `BUILD` send is not by itself proof that the
production-choice notification stopped blocking turn flow.

## Official UI Evidence

The production chooser maps item kinds into the operation args:

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

Local anchors:

- `.civ7/outputs/resources/Base/modules/base-standard/ui/production-chooser/panel-production-chooser.js`
  probes production items.
- `.civ7/outputs/resources/Base/modules/base-standard/ui/production-chooser/production-chooser-helpers.chunk.js`
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
  --reason "place Ancient Walls on the validated plot" \
  --json
```

Validate an ordinary city project:

```bash
civ7 game play build-production \
  --city-id '{"owner":0,"id":65536,"type":1}' \
  --project-type <project-type> \
  --json
```

Project production still needs live proof for common IDs and postconditions.
The operation shape has official UI support, but the tactical choice should
come from the live production chooser.

## Postcondition Contract

`game play build-production --send --json` reports a production-specific
postcondition for `city-operation BUILD`:

- `production-choice-cleared`: no matching end-turn-blocking
  production-choice notification remains for the city.
- `production-state-changed`: observed city production state changed.
- `production-state-changed-blocker-still-live`: the city production state
  changed, but the same production-choice blocker is still live. Do not repeat
  the same `BUILD` blindly; inspect notification/chooser closeout state.
- `validation-changed`: the subsequent `BUILD` validator changed.
- `no-state-change`: the request returned, but observed city production state
  and blocker state did not change.

This is a proof boundary, not strategy. A sticky production notification after
state change is a closeout/notification problem; a clean production choice
should clear the blocker or reveal a different blocker in the HUD.
