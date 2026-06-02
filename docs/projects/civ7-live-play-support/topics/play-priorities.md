# Play Priorities

Status: `live-proved-read-surface`.

## Frame

`game play priorities` is the first turn-level materialized view for active
play support. It exists because the agent often needs to know what matters next
before opening a specific blocker, unit, city, or tactical lens.

The command does not choose strategy and does not send operations. It composes:

- the live HUD/notification decision view;
- the first ready-unit view, when a unit is ready;
- the ready-city view, when a city blocker is present;
- a bounded battlefield scan around the ready unit, when a ready-unit location
  is available.

The output is a ranked read-priority list with next inspection commands. It is
a dashboard for "what should I inspect next?", not an action plan.

## CLI

```bash
civ7 game play priorities --json
```

Useful variants:

```bash
civ7 game play priorities --radius 6 --json
civ7 game play priorities --no-battlefield --json
```

## What It Ranks

The priority list intentionally favors short-lived live authority:

1. Runtime-state errors, because failed turn/blocker probes mean the HUD is not
   proven clean.
2. HUD decisions and blockers, especially end-turn-blocking notifications.
3. Ready units, because they block turn flow and plot-target actions require
   `unit-target` validation.
4. Ready cities, because city blockers branch between production, town focus,
   population placement, expansion, and project closeout.
5. Battlefield points of interest near the ready-unit origin, such as civilian
   risk, wounded friendlies, other-owner contacts, city fronts, and owner
   pressure.
6. Clean-read fallback, which points back to end-turn only after final blocker
   checks.

## Live Turn-118 Evidence

On June 1, 2026, turn 118 / 1260 BCE showed an informational HUD item:
`NOTIFICATION_UNIT_ATTACKED`, "Your Settler was attacked by La Venta." The
ready unit was Ballista `{"owner":0,"id":1638414,"type":26}` at `(17,19)`.

The composed read stack showed why a turn-level priority view is useful:

- the HUD message made Settler protection the immediate context;
- the ready-unit view showed the Ballista had movement and attacks, but only
  no-target operations such as alert, fortify, move, skip, sleep, and wait;
- battlefield scan around `(17,19)` flagged high civilian risk for the Settler
  at `(17,15)`, the owner `9` city front at `(13,17)`, and nearby owner `1`,
  `9`, and `11` pressure;
- plot probes against `(13,17)`, `(14,19)`, `(12,19)`, `(12,15)`, and `(19,17)`
  selected `MOVE_TO`, not a ranged or bombard action.

The practical support note was: protect or settle the exposed civilian and
stage the siege line; do not assume the Ballista can fire just because it has
attacks remaining.

## Proof Boundary

`game play priorities` is stronger than reading only raw notifications because
it ties HUD state to ready-entity and local tactical context. It is weaker than
a validator-backed mutation because it does not prove a chosen action.

Use it to decide the next inspection:

- `game play dismiss-notification` for reviewed informational closeouts;
- `game play ready-unit` and `game play unit-target` for unit actions;
- `game play ready-city` for city blockers;
- `game play battlefield-scan` or `game play destination-analysis` for tactical
  context.

Do not use it to skip validators, postcondition checks, or fresh re-reads after
mutation, turn advance, restart, human input, or slow calls.

If any core HUD probe fails, such as `turn`, `turnDate`, `blocker`, or
`blockingNotificationId`, the dashboard must not emit the `clean-read`
fallback. In that case it should surface `runtime-state-error` and route the
agent to `game play rehydrate --json` or a fresh `game watch` read. An empty
notification queue plus `ReferenceError: Game is not defined` is partial
evidence, not proof that end-turn or autoplay is safe.

## Relationship To Other Lenses

- `notification-decision-hud.md` explains blocker families.
- `ready-unit-commander-actions.md` explains no-target operation scope.
- `battlefield-scan.md` explains local tactical POIs.
- `destination-analysis.md` explains endpoint and corridor pressure.
- `tactical-lens-api-roadmap.md` explains future higher-level tactical APIs.

This command is deliberately a small dashboard, not the full future
`tactical-plan` runner.
