# Battlefield Scan

Status: `reference-with-gap`.

## Frame

`game play battlefield-scan` is a read-only tactical lens for the space around a
front, formation, city, or candidate destination. It exists because individual
unit legal operations are too local for campaign thinking: they say what one
unit can do now, but not what pressure, risk, or point of interest surrounds
the decision.

The scan does not predefine strategy. It gives the play agent better inputs for
strategy and tactics:

- nearby friendly and non-friendly units;
- nearby cities;
- owner-level apparent pressure in the radius;
- wounded friendly units;
- civilian exposure;
- nearest non-friendly city fronts;
- strongest non-friendly owner pressure.

## CLI

```bash
bun packages/cli/bin/run.js game play battlefield-scan \
  --x 17 \
  --y 20 \
  --radius 8 \
  --json
```

The equivalent compact coordinate form is:

```bash
bun packages/cli/bin/run.js game play battlefield-scan \
  --origin 17,20 \
  --radius 8 \
  --json
```

Use `--x` and `--y` as the current front, selected stack, city, or destination
under consideration. If no origin is supplied, the wrapper falls back to a small
set of local ready/selected/city origins when available, but explicit origins
are better because they tell the scan which decision it is supporting.

## Proof Boundary

The scan reads runtime `Players`, `Units`, `Cities`, and `GameInfo` summaries.
It is stronger than static catalog data for tactical awareness because it comes
from the running session, but it is still not a movement or combat authority.

The returned `hiddenInfoPolicy` is intentionally conservative:

`runtime-debug-summary; may include non-visible units or cities until paired with visibility/map reads`.

That means the scan can guide questions such as "what should I inspect next?"
or "where does pressure appear to be concentrated?" It cannot authorize:

- movement;
- attacks;
- declarations of war;
- path commitments;
- claims about visible-only fog-of-war knowledge;
- terrain-safe routes.

Before any mutation, re-read the ready unit/city view and use the relevant
validator-backed shortcut such as `game play unit-target`, `game play operation`,
or production/city commands.

## Tactical Norm

Use this scan when the agent is making a sequence of military moves or deciding
whether a settlement/front/destination is safe enough to pursue. The scan should
answer:

1. What non-friendly pressure is close to this origin?
2. Are any friendly units wounded or civilians exposed?
3. Which owner is exerting the strongest local pressure?
4. Is there a nearby city/front that changes the next inspection priority?
5. Which individual unit or city view should be read next?

Do not use it to choose a full strategy. Use it to build a better local picture
before choosing between tactical inspections.

## Relationship To Other Shortcuts

- `game play ready-unit`: tells what the current unit can legally do.
- `game play unit-target`: resolves and validates a specific plot action.
- `game play target-candidates`: ranks opponent owners/city targets from an
  origin.
- `game play battlefield-scan`: explains the local battlefield around an
  origin before committing to a target or a sequence of unit moves.
- `game play destination-analysis`: narrows the question to one intended
  endpoint and a cheap straight-line corridor before a movement sequence.

The practical sequence for a campaign turn is:

1. `game play notifications --json` to know the current blocker.
2. `game play battlefield-scan --x <front-x> --y <front-y> --json` to orient.
3. `game play target-candidates --x <front-x> --y <front-y> --json` if choosing
   a target owner/city.
4. `game play destination-analysis --from-x <unit-x> --from-y <unit-y> --to-x <x> --to-y <y> --json`
   when the next question is endpoint or route pressure.
5. `game play ready-unit --json` and `game play unit-target ... --json` for the
   actual unit action.

## Current Live Use

Turn 115 has a ready damaged Slinger near `(17,20)` after a diplomatic-completion
blocker. A useful support read is:

```bash
bun packages/cli/bin/run.js game play battlefield-scan \
  --x 17 \
  --y 20 \
  --radius 8 \
  --json
```

This should be treated as heads-up context before moving that Slinger or
continuing the independent-city campaign. It should not replace target-action
validation.

## Remaining Gaps

- Destination/corridor pressure now has a first read-only lens, but
  terrain-aware pathfinding is still not implemented; distance is a cheap grid
  heuristic.
- Visibility filtering is not yet paired with every unit/city summary.
- Zone-of-control, river crossings, embarkation, and road movement are not
  modeled.
- Owner relation state is reduced to friendly versus other; future scans should
  distinguish war, independent hostility, allied/friendly, and neutral rivals.
- Campaign-level summarization still needs a higher-order snapshot that
  composes battlefield scans across multiple fronts.
