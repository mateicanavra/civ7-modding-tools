# Front Summary

Status: `live-proved-read-surface`.

## Frame

`game play front-summary` is a composed, read-only tactical lens for a current
military front. It exists because the agent needs a wider formation view before
choosing individual Ballista, Archer, Spearman, Settler, or commander actions.

The command does not predefine strategy. It composes existing read surfaces:

- the current HUD/notification view, for turn and blocker context;
- the ready-unit view when no explicit origin is supplied;
- `target-candidates`, to identify the leading owner/city target from the
  origin;
- `battlefield-scan`, to surface nearby pressure and points of interest;
- `destination-analysis`, when a target point can be inferred or supplied.

The output is a front headline, posture label, risk list, pressure list, and
next inspection commands. It answers "what front am I looking at and what
should I inspect next?", not "what action should I send?"

## CLI

```bash
civ7 game play front-summary --json
```

Useful explicit-front variants:

```bash
civ7 game play front-summary \
  --x 15 \
  --y 21 \
  --json

civ7 game play front-summary \
  --x 15 \
  --y 21 \
  --to-x 13 \
  --to-y 17 \
  --json
```

The same read can use compact coordinate aliases:

```bash
civ7 game play front-summary \
  --origin 15,21 \
  --destination 13,17 \
  --json
```

`--target-x` and `--target-y` are also accepted as aliases for `--to-x` and
`--to-y` when the caller is thinking in target-front terms.

Use explicit `--x/--y` for the formation, siege line, Settler screen, or ready
unit being considered. If omitted, the command tries to infer an origin from
the first ready unit.

## What It Adds Over The Point Lenses

`battlefield-scan` is local pressure around an origin. `target-candidates` is a
target owner/city shortlist. `destination-analysis` is one endpoint and a cheap
corridor. `front-summary` is the first lens that composes those facts into a
single military-planning read:

1. What is the active front origin?
2. What target/front is implied or supplied?
3. Which pressure items are high or medium severity?
4. Is the front posture more about screening civilians, stabilizing a hot
   contact line, staging before entering city pressure, or cautious advance?
5. Which exact command should be run next before any mutation?

This makes it suitable as the first read before a sequence of unit moves during
a siege or defensive screen.

## Live Turn-120 Evidence

On June 1, 2026, turn 120 / 1220 BCE had an end-turn-blocking informational
notification: `NOTIFICATION_UNIT_ATTACKED`, "Your Galley was attacked by La
Venta." A later priority read showed the ready unit had shifted to Ballista
`{"owner":0,"id":1572876,"type":26}` at `(15,21)`.

The front around `(15,21)` was not merely a one-unit question:

- five other-owner units were within three tiles of the Ballista;
- the exposed Settler at `(18,16)` was still a high civilian-risk item;
- La Venta's city front remained around `(13,17)`;
- owner pressure clustered near `(14,20)`;
- the HUD attack report at `(17,13)` was important, but not the whole tactical
  picture.

The practical support frame was: screen or settle the exposed civilian, stabilize
the contact line around the Ballista, then validate any concrete plot target
with `unit-target` before moving or firing.

## Proof Boundary

`game play front-summary` is stronger than reading one ready unit because it
connects the ready-unit or supplied origin to nearby pressure, target
candidates, and endpoint/corridor context.

It is weaker than an action validator:

- it does not pathfind through terrain;
- it does not prove a ranged, bombard, melee, or move target is legal;
- it does not reserve a route for multiple units;
- it does not distinguish all diplomatic/war-state nuance;
- it may include debug-visible unit/city facts until paired with visibility
  reads.

Use it to decide the next inspection. Do not use it to skip `ready-unit`,
`unit-target`, generic operation validation, or postcondition re-reads.

## Relationship To Other Lenses

- `play-priorities.md`: first turn-level dashboard across HUD and ready entity.
- `battlefield-scan.md`: local pressure around one or more origins.
- `target-candidates.md`: owner/city shortlist from a formation origin.
- `destination-analysis.md`: endpoint and cheap corridor pressure.
- `civilian-route-triage.md`: civilian-specific route/screen planning.
- `unit-target-actions.md`: validator-backed concrete plot action resolution.

The practical turn loop is:

1. `game play priorities --json`
2. `game play front-summary --x <front-x> --y <front-y> --json`
3. `game play battlefield-scan` or `destination-analysis` for the top pressure
   point
4. `game play ready-unit --json`
5. `game play unit-target --unit-id '<unit-id>' --x <x> --y <y> --json`

## Remaining Gaps

- Terrain-aware pathfinding, zone of control, road/river/coast movement, and
  formation spacing are still not modeled.
- Visibility filtering is not yet composed into the summary.
- The posture labels are deliberately conservative heuristics, not strategy.
- Multi-unit campaign execution still belongs in a future workflow runner or
  tactical-plan layer after validators and postcondition checks are stronger.
