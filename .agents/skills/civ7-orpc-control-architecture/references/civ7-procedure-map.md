# Civ7 Service Capability Map

## Choose The Semantic Owner First

Route an operation by the fact, transition, and correction law it owns, not by
its current file, command name, route prefix, or shared live prerequisite.

```text
actor -> CLI/API projection -> public play, control, or MapGen-runs client

qualified app -> ready providers/adapters -> bound service clients
```

Projection changes do not transfer product authority. Apps construct the
graph; they do not become another semantic owner.

## Foundational Control

`services/civ7-control` owns Civ7 interpretation and closed native operations
over ready Tuner and window-capture capabilities supplied by the app. Its
finite module inventory is exactly:

| Module | Owner boundary |
| --- | --- |
| `app` | Civ7 readiness and current-application interpretation |
| `game` | Setup/start and current-game facts |
| `map` | Observation, visibility, plot, grid, and surface facts |
| `ui` | Display queue, camera, and Civ7 appshot meaning |

Control owns native admission, lowering, dispatch, bounded readback, and exact
native uncertainty. Raw health, epoch, command, capture, and foreign-failure
facts remain resource/provider facts. Control does not own actor goals,
gameplay strategy, no-repeat policy, or next-action recommendations.

Do not preserve migration-era domains such as lifecycle, readiness, world,
display, or view as peer modules. Place their retained behavior under the four
selected execution domains.

## Actor-Facing Play

`services/civ7-play` consumes only the public control client. Its finite module
inventory is exactly:

```text
attention
automation
city
diplomacy
notifications
progression
planning
turn
unit
```

Play owns situation meaning, lawful-choice checks, requests, reconciliation,
no-repeat policy, and next lawful action. Narrow government, culture,
technology, narrative, attribute, and tradition concepts compose beneath
`progression`; tactical and strategic summaries compose beneath `planning`.
They do not become peer control domains.

Play may preserve refusal, dispatch, and observation evidence returned by
control, but it alone classifies those facts as gameplay outcomes. It never
receives provider state, raw execution capability, window capture, or private
control source.

## MapGen Runs

`services/mapgen-runs` is a separate semantic service with exactly:

```text
autoplay
operations
run-in-game
save-deploy
```

It owns accepted run intent, operation state, phase ordering, correlation,
cancellation, reconciliation, retention, and the final semantic outcome. The
Studio app supplies exact ready capabilities for authored config, run files,
fresh logs, physical realization, control, and clock behavior.

Portable Swooper definition/config truth remains with its definition owner.
The Studio app's qualified adapter owns physical ephemeral materialization and
installation effects and returns opaque receipts. MapGen-runs orders and
interprets those receipts; it does not absorb their physical implementation.

## API Projection

The selected MapGen Studio API owns caller groupings such as `authoring`,
`control`, `runs`, and `studio`. Those names are API projection modules, not
domain-service modules. Each API contract leaf delegates explicitly to the
matching bound control, play, MapGen-runs, definition, or app-adapter
capability.

A frozen caller namespace may combine results from several owners without
combining their contracts or routers. In particular, a caller-facing control
group may delegate some gameplay routes to play and autoplay to MapGen-runs
while preserving the distinct semantic owners underneath.

## Operation Boundary

A service operation is complete when it has:

- one stable actor or owner intent;
- admitted input and explicit output/error vocabulary;
- a named mutation and uncertainty policy;
- explicit dispatch, observation, and reconciliation facts; and
- one owning semantics proof.

Do not split a behavior so callers must remember a hidden preflight or
postcondition. Do not combine operations merely because they share one ready
resource or caller route prefix.

## Safety Rules

- Accepted intent is not dispatch; dispatch is not observed acceptance; an
  observation is not automatically the final product outcome.
- Preserve stale, partial, unavailable, refused, and uncertain states.
- An uncertain play mutation keeps a stable no-repeat identity and requires
  fresh control evidence before retry or a different next action.
- Relationship labels require official relationship, team, war, suzerain, or
  equivalent validator evidence. Owner inequality, contact, proximity, and
  attack legality are insufficient.
- Read-only live evidence should precede mutation evidence. Live mutation must
  be explicitly authorized and scoped to the current player and game state.
