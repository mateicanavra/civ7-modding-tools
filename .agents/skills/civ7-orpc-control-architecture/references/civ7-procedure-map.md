# Civ7 Service Capability Map

## Choose The Semantic Owner First

Route an operation by the fact, transition, and correction law it owns, not by
its current file, command name, route prefix, or shared live prerequisite.

```text
actor -> CLI/API projection -> public Play, controller, or MapGen-runs client

controller mod app -> controller TypeScript/router -> realm-local ingress
qualified host app -> ready Tuner/adapters -> bound public clients
```

Projection changes do not transfer product authority. Apps construct the
graph; they do not become another semantic owner.

## Civ7 Controller

`services/civ7-controller` owns closed typed native operations executed inside
Civ7. Its TypeScript implementation and private router are bundled into the
dedicated controller mod. Outer modules follow official runtime realms and
APIs; the selected topology includes shell, game, map, and UI concerns:

| Module | Owner boundary |
| --- | --- |
| `shell` | Shell readiness and native shell facts |
| `game` | Setup/start and current-game facts plus explicit native city, diplomacy, notification, player, progression, turn, and unit subdomains |
| `map` | Observation, visibility, plot, grid, and surface facts |
| `ui` | Native display queue and camera facts |

Controller leaves use `observe`, `check`, and `send`. `send` performs one fresh
native check and at most one invocation, then returns dispatch evidence and
optional same-evaluation `immediateAfter` readback. Generic operation unions
and caller-authored operation names are not native subdomains; they recreate a
facade. Raw Tuner health, epoch, command, and foreign-failure facts remain
resource/provider facts; window capture is separate diagnostic/app evidence.
Those native action leaves do not own polling,
postconditions, actor goals, gameplay strategy, no-repeat policy,
reconciliation, or next-action recommendations. A separately named
controller operation may perform bounded observation required by its own
explicit contract, but cannot replay a mutation or interpret actor meaning.

Do not preserve migration-era domains merely to retain an old path. Place
retained behavior under the controller groups justified by official runtime
domains.

The progression native kernel's technology,
culture, attribute, tradition, government, celebration, and narrative leaves
fix native lowering privately. None accepts a public kind/action/operation
discriminator or emits actor ranking, postconditions, or next actions.

## Actor-Facing Play

`services/civ7-play` consumes only the public controller client. Its
actor-facing modules are admitted only where baseline behavior proves them.

Play owns situation meaning, lawful-choice checks, requests, reconciliation,
no-repeat policy, and next lawful action. Narrow government, culture,
technology, narrative, attribute, and tradition concepts compose beneath
`progression`; tactical and strategic summaries compose beneath `planning`.
They do not become peer controller domains.

Play may preserve refusal, dispatch, and observation evidence returned by the
controller, but it alone classifies those facts as gameplay outcomes. It never
receives provider state, raw execution capability, window capture, or private
controller source.

## MapGen Runs

`services/mapgen-runs` is a separate request-correlated operation service. It
owns accepted run intent, operation state, phase ordering, correlation,
cancellation, reconciliation, retention, and the final semantic outcome. The
Studio app supplies exact ready capabilities for authored config, run files,
fresh logs, physical realization, and clock behavior plus the public controller
client for admitted live phases.

Portable Swooper definition/config truth remains with its definition owner.
The Studio app's qualified adapter owns physical ephemeral materialization and
installation effects and returns opaque receipts. MapGen-runs orders and
interprets those receipts; it does not absorb their physical implementation.

## API Projection

The selected MapGen Studio API owns caller groupings such as `authoring`,
`control`, `runs`, and `studio`. Those names are API projection modules, not
domain-service modules. Each API contract leaf delegates explicitly to the
matching bound controller, Play, MapGen-runs, definition, or app-adapter
capability.

A frozen caller namespace may combine results from several owners without
combining their contracts or routers. In particular, a caller-facing control
group may delegate some gameplay routes to Play and autoplay to MapGen-runs
while preserving the distinct semantic owners underneath.

## Operation Boundary

A service operation is complete when it has:

- one stable actor or owner intent;
- admitted input and explicit output/error vocabulary;
- a named mutation and uncertainty policy;
- the dispatch, observation, or reconciliation facts owned by that service;
  the controller stops at native dispatch and same-evaluation readback,
  while Play owns gameplay reconciliation; and
- one owning semantics proof.

Do not split a behavior so callers must remember a hidden preflight or
postcondition. Do not combine operations merely because they share one ready
resource or caller route prefix.

## Safety Rules

- Accepted intent is not dispatch; dispatch is not observed acceptance; an
  observation is not automatically the final product outcome.
- Preserve stale, partial, unavailable, refused, and uncertain states.
- An uncertain play mutation keeps a stable no-repeat identity and requires
  fresh controller evidence before retry or a different next action.
- Relationship labels require official relationship, team, war, suzerain, or
  equivalent validator evidence. Owner inequality, contact, proximity, and
  attack legality are insufficient.
- Read-only live evidence should precede mutation evidence. Live mutation must
  be explicitly authorized and scoped to the current player and game state.
