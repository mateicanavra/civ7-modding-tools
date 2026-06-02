# Destination Analysis

Status: `reference-with-gap`.

## Frame

`game play destination-analysis` is a read-only tactical lens for a proposed
movement endpoint. It exists because a unit's immediate legal moves are too
small a view for planning escorts, advances, retreats, and staging positions:
the agent needs to know what pressure is near the destination and what contact
lies along the intended approach before it spends a move.

The lens does not choose a strategy or send orders. It gives the play agent
better questions to ask before movement:

- what non-friendly units are near the destination;
- whether a non-friendly city projects pressure around the endpoint;
- whether friendly units already support the endpoint;
- whether any corridor contact could expose a civilian or wounded unit;
- which sampled plots along the straight-line corridor need closer map reads.

## CLI

```bash
civ7 game play destination-analysis \
  --from-x 20 \
  --from-y 14 \
  --to-x 13 \
  --to-y 17 \
  --corridor-radius 2 \
  --destination-radius 4 \
  --json
```

The compact coordinate form is:

```bash
civ7 game play destination-analysis \
  --origin 20,14 \
  --destination 13,17 \
  --json
```

Use `--from-x` and `--from-y` for the unit, formation, city, or staging stack
being considered. If they are omitted, the wrapper falls back to the first
ready or selected unit when available. Always provide either `--destination` or
`--to-x` and `--to-y` because the destination is the decision being inspected.

## Proof Boundary

The command reads runtime `Players`, `Units`, `Cities`, `GameplayMap`, and
`GameInfo` summaries through the direct-control App UI surface. It is current
runtime evidence, but it is still a planning lens rather than authority to move.

The returned corridor is a straight-line grid approximation. It is useful
because it is cheap, deterministic, and good enough to reveal nearby pressure,
but it is not Civ7 engine pathfinding. It does not model:

- zone of control;
- embarked versus land movement;
- river crossings;
- roads or rail;
- terrain movement costs;
- fog-of-war visibility guarantees;
- whether a specific unit can reach the destination this turn.

Before mutation, re-read `game play ready-unit`, inspect the relevant map or
plot surface when visibility matters, and use validator-backed movement or
target shortcuts where available.

## Tactical Norm

Use destination analysis when the question is "is this endpoint or approach
worth considering?" rather than "can this unit legally move there right now?"

Good uses:

1. Screening a Settler destination before moving the escort.
2. Checking whether a Galley advance would arrive near enemy pressure.
3. Comparing two staging plots before committing a formation.
4. Deciding whether to inspect a plot, unit target, or nearby city next.

When the moving unit is a civilian, use `game play civilian-route-triage` as
the parent workflow. Destination analysis answers one route question; civilian
triage decides how to combine that answer with settlement recommendations,
escort reads, and fresh unit validation.

Bad uses:

1. Declaring a route safe.
2. Sending a move without a fresh ready-unit read.
3. Treating debug-visible units as player-visible information.
4. Replacing pathfinding, movement validation, or postcondition checks.

## Relationship To Other Shortcuts

- `game play battlefield-scan`: gives a radius picture around one or more
  fronts, cities, or formations.
- `game play destination-analysis`: focuses that picture on one intended
  endpoint and the straight-line corridor toward it.
- `game play target-candidates`: ranks opponent owners and city fronts.
- `game play ready-unit`: identifies the current unit and its legal operation
  surface.
- `game play unit-target` and `game play operation`: validate or send concrete
  target operations after the planning lens has narrowed the next action.

The practical sequence for movement-heavy turns is:

1. `game play notifications --json` to identify the blocker.
2. `game play ready-unit --json` to identify the active unit.
3. `game play destination-analysis --from-x <unit-x> --from-y <unit-y> --to-x <x> --to-y <y> --json`.
4. Inspect any POI returned by the destination lens.
5. Use a validator-backed action only after the live state is still fresh.

## Remaining Gaps

- Terrain-aware pathfinding is still missing.
- Visibility filtering is not paired with every unit, city, or sampled plot.
- Movement validators for ordinary destination moves are not yet exposed as a
  first-class shortcut.
- Relation state is still reduced to friendly versus other.
- Multi-destination comparison should be a later composition over this lens,
  not a reason to make this command choose strategy.
