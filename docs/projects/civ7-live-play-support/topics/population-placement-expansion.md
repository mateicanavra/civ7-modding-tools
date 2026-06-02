# Population Placement And Expansion

Status: `promotable-reference`.

## Frame

`NEW_POPULATION` is not a single operation. The notification activates the
acquire-tile decision surface for a city that is ready to place population.
From that surface there are two proven branches:

- already-workable tile: `player-operation ASSIGN_WORKER`
  with `{ Location, Amount: 1 }`;
- expansion purchase tile: `city-command EXPAND` with `{ X, Y }`.

Use `game play ready-city --json` or an equivalent live acquire-tile read before
choosing either branch. Local resources can explain tile/improvement names, but
only the live city state proves whether the chosen plot is workable or requires
expansion.

`ready-city` now exposes branch-specific candidate lists for this decision:

- `populationPlacement.workablePlots` is the already-workable assignment branch.
  Each candidate carries map coordinates where available, worker placement
  details, yield fields exposed by `GetAllPlacementInfo()`, and the matching
  `assign-worker` command shape.
- `populationPlacement.expansionCandidates` is the tile-purchase branch. Each
  candidate maps the `EXPAND` result's plot index to map coordinates and pairs
  the same array position with `ConstructibleTypes` when the runtime returns
  one. Constructible names are best-effort GameInfo enrichment; coordinates and
  validator result remain the action authority.

When the `NEW_POPULATION` notification target is empty, `ready-city` should
still be the first read. Its fallback follows the official handler by scanning
the local player's cities for `Growth.isReadyToPlacePopulation`; if it still
cannot resolve a city, stop and inspect the UI/runtime state instead of
guessing a city id.

## CLI Surface

For already-workable plots:

```bash
civ7 game play assign-worker \
  --player-id 0 \
  --location <plot-index> \
  --json
```

For expansion purchase plots:

```bash
civ7 game play expand-city \
  --city-id '{"owner":0,"id":196610,"type":1}' \
  --x 16 \
  --y 19 \
  --json
```

Both shortcuts validate by default. Add `--send --reason '<why this tile is the
right live choice>'` only after the live candidate still matches the current
city state.

## Live Proof

Turn 79 in the active play thread proved the expansion branch after native
autoplay stopped on a real gameplay blocker:

```json
{
  "family": "city-command",
  "operationType": "EXPAND",
  "cityId": { "owner": 0, "id": 196610, "type": 1 },
  "args": { "X": 16, "Y": 19 }
}
```

Reason captured in the live send:

```text
turn 79 resolve town new-population placement by expanding Assyrian town to
validated farm tile at 16,19; official acquire-tile EXPAND args are X/Y
```

This closes the earlier expansion-purchase argument-shape gap. It does not
prove a universal tile-selection strategy.

Proof label: `live-tuner-exercised`. The branch and args were observed through
the live direct-control path for one active-game population blocker; future
uses still need fresh validation and postcondition checks.

Turn 101 proved the targetless-notification city fallback and the
already-workable branch on a different population blocker:

```json
{
  "cityId": { "owner": 0, "id": 131073, "type": 1 },
  "populationPlacement": {
    "isReadyToPlacePopulation": true,
    "workablePlotIndexes": [2623, 2708],
    "workablePlots": [
      { "index": 2623, "x": 19, "y": 31 },
      { "index": 2708, "x": 20, "y": 32 }
    ]
  },
  "validatedOperation": {
    "family": "player-operation",
    "operationType": "ASSIGN_WORKER",
    "args": { "Location": 2708, "Amount": 1 }
  }
}
```

Proof label: `live-validated`. This proves the fallback read and validation
path; it still needs a send/postcondition proof for this exact turn.

## Norms

- Read the notification HUD first. If the blocker is not population placement,
  do not use these shortcuts.
- Read the relevant city with `game play ready-city --json` before choosing.
- Use `assign-worker` only when the chosen plot is already workable and the
  live branch expects a plot index `Location`.
- Use `expand-city` only when the chosen plot is outside the current workable
  set and the live branch expects map coordinates `X` and `Y`.
- Re-read after visible human input, animation delay, turn advance, or any
  failed validator.
- Treat tile-quality advice as advisory until current yields, happiness,
  growth needs, and placement candidates are live-read.

## Remaining Gaps

- Postcondition helper: after a send, report whether
  `Growth.isReadyToPlacePopulation` cleared and whether the city plot/workers
  state changed as expected.
- Tile ranking: still advisory because it depends on live yields, settlement
  role, happiness, threats, and patch-specific specialist economics.
