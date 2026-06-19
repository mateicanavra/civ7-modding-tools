# Live Proof Ledger — Natural Wonders

Live evidence is the closure gate. MockAdapter write-and-echo cannot prove
footprint parity or engine legality; only live `getAdjacentPlotLocation` and
place-then-readback do. Unavailable labels remain unresolved (not inferred).

## A. Geometry probe (Task 1) — pins FOUR\* footprints

Boot a live single-player map (`runCiv7SinglePlayerFromSetup`), then `civ7 game
exec`:

**A1 — per-parity direction calibration** (even row + odd row, interior anchor):
```js
JSON.stringify([0,1,2,3,4,5].map(d => {
  const p = GameplayMap.getAdjacentPlotLocation({x:ax,y:ay}, d);
  return {dir:d, dx:p.x-ax, dy:p.y-ay};
}))
```

**A2 — place-then-readback per FOUR\* class** (≥3 anchors/class, both parities):
```js
const fp = { Feature: Database.makeHash("FEATURE_GRAND_CANYON"),
             Direction: -1, Elevation: GameplayMap.getElevation(ax, ay) };
// if (!TerrainBuilder.canHaveFeatureParam(ax, ay, fp)) bail
TerrainBuilder.setFeatureType(ax, ay, fp);
const out = [];
for (let dy=-3; dy<=3; dy++) for (let dx=-3; dx<=3; dx++){
  const x=ax+dx, y=ay+dy;
  if (y<0||y>=GameplayMap.getGridHeight()) continue;
  if (GameplayMap.getFeatureType(x,y) === fp.Feature) out.push({dx, dy});
}
JSON.stringify({anchor:{ax,ay}, cells: out})
```

| Class | even-row cells | odd-row cells | orientation deterministic? | encoding decision |
|---|---|---|---|---|
| FOURPARALLELAGRM | _pending_ | _pending_ | _pending_ | _pending_ |
| FOURADJACENT | _pending_ | _pending_ | _pending_ | _pending_ |
| FOURL | _pending_ | _pending_ | _pending_ | _pending_ |

## B. Predicate probe (Task 1) — pins the 5 new tags

```js
// authoritative per-tile verdict
const fp = { Feature: Database.makeHash("FEATURE_MAPU_A_VAEA_BLOWHOLES"),
             Direction:-1, Elevation: GameplayMap.getElevation(ax,ay) };
JSON.stringify({x:ax,y:ay, canPlace: TerrainBuilder.canHaveFeatureParam(ax,ay,fp)})
```
```js
// neighbor + cliff state per direction
JSON.stringify([0,1,2,3,4,5].map(d=>({
  dir:d,
  cliff: GameplayMap.isCliffCrossing(ax,ay,d),
  nbr: (()=>{const p=GameplayMap.getAdjacentPlotLocation({x:ax,y:ay},d);
            return {terrain:GameplayMap.getTerrainType(p.x,p.y), water:GameplayMap.isWater(p.x,p.y)};})()
})))
```

| Tag | semantics pinned | odd-R model confirmed | notes |
|---|---|---|---|
| ADJACENTTOCOAST | _pending_ | _pending_ | |
| NOTADJACENTTOLAND | _pending_ | _pending_ | land = isWater vs island-tag |
| ADJACENTTOSAMETERRAIN | _pending_ | _pending_ | |
| ADJACENTCLIFF | _pending_ | _pending_ | direction-index order |
| NOLANDOPPOSITECLIFF | _pending_ | _pending_ | opposite pairing (d+3)%6? |

## C. Closure render (Task 7)

Boot map per seed, reveal (`game map visibility --player-id 0 --explore
--disposable`), foreground, `game view appshot`. Read placed wonders via tuner
(`GameplayMap.getFeatureType` sweep) and `Scripting.log`.

| Seed | distinct wonders placed | incl. previously-dropped? | even-row multi-tile readback match | effects spot-check |
|---|---|---|---|---|
| _pending_ | _pending_ | _pending_ | _pending_ | _pending_ |
| _pending_ | _pending_ | _pending_ | _pending_ | _pending_ |

**Closure claim:** _not yet met — pending live evidence above._
