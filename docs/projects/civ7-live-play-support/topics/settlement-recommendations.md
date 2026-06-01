# Settlement Recommendations

Status: live-support topic.

## Frame

The settlement problem has two separate parts:

1. ask the game where it thinks settlement sites are strong;
2. move a Settler safely through the current tactical board.

Do not merge those into one proof claim. The official recommendation API gives
ranking advice. It does not prove that a Settler can reach or found a city this
turn, and it does not account for every live escort or war-risk choice the
agent may make.

For exposed civilians, load `civilian-route-triage.md` before moving. It
combines `ready-unit`, this recommendation surface, `battlefield-scan`, and
`destination-analysis` so the agent can distinguish good settlement sites from
safe near-term movement.

## Official Surface

The official settlement lens in
`.civ7/outputs/resources/Base/modules/base-standard/ui/lenses/layer/settlement-recommendations-layer.js`
collects local-player Settler origins and city origins, then calls:

```js
player.AI?.getBestSettleLocationsForSettler(count, location)
```

Each suggestion carries a `location` and ranked factors such as total yield,
coast, terrain, luxury or strategic resources, fresh water, and nearest-city
distance. The lens sorts positive factors first before drawing settlement icons.

The live watcher probe on turn 102 showed the API works in App UI state. For
origins near `(15,23)` and `(20,25)`, the top recommendation was `(20,20)`,
with positive yield/coast/terrain/resource factors and a negative fresh-water
factor.

## CLI Shortcut

`game play settlement-recommendations` wraps the official lens API read-only:

```bash
bun packages/cli/bin/run.js game play settlement-recommendations \
  --x 15 \
  --y 23 \
  --count 5 \
  --json
```

Without `--x/--y`, the shortcut scans local-player Settlers and cities as
origins, matching the lens' broad behavior. With `--x/--y`, it focuses one live
Settler or escort formation so the active play agent can compare nearby options
without re-reading every origin.

## Norm

- Use recommendation output as planning evidence, not movement proof.
- Prefer sites that are both recommended and reachable behind an escort line.
- Re-read `game play ready-unit` before moving the Settler, then use
  `game play unit-target` or a relevant unit operation validator for the actual
  move.
- If two Settlers share the same top site, split them by safety and distance:
  one moves toward the highest-ranked reachable site, the other waits or angles
  toward the next viable site rather than crowding the same target.
- Keep negative factors visible. A high-yield coastal site with poor fresh
  water can still be right, but the agent should understand what it is trading
  away.

## Proof Boundary

This shortcut proves only that the App UI exposed recommendation data for an
origin at read time. It does not prove:

- city founding is currently legal;
- the Settler can reach the site;
- enemies, storms, or war declarations will not change the route;
- the recommendation is better than a human strategic objective.

Use it to improve expansion planning, then rely on live unit/city validators
for mutation.
