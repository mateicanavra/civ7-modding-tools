# Play Command Discovery And Value Flow

This reference teaches how to discover and use the actor-facing game-play
surface. Native Oclif discovery and current leaf help are command authority.

## Discover The Surface

From the repo root:

```bash
bun apps/cli/bin/run.js game --help
bun apps/cli/bin/run.js game play --help
bun apps/cli/bin/run.js game play <topic-or-command> --help
```

The current command source lives at
`plugins/cli/topics/game/src/commands/game`. `apps/cli` is the commandless app
shell that supplies bound capabilities and process lifetime. Topic commands own
argument parsing and terminal presentation; they do not select providers or
own gameplay policy.

Use the linked `civ7` executable only after discovering and running the current
link target on the `civ7-cli` Nx project.

## Public Capability Routing

| Command family | Underlying owner |
| --- | --- |
| Controller readiness/setup/game/map/view reads selected from native help | public controller client |
| Actor-facing observations, checks, requests, reconciliation, and next actions selected from play help | actor-facing play |
| A run-admission automation leaf, when exposed | MapGen-runs; gameplay automation remains play-owned |
| Raw health/execution/catalog/table diagnostics | qualified Tuner diagnostic or app adapter |
| CLI output/help/errors | game topic projection |

Do not infer authority from a route noun. The sealed owner model decides
meaning; a caller path is only a projection.

## Read-To-Action Flow

The stable interaction pattern is:

```text
read situation/options
  -> select one returned candidate
  -> check the named action with returned values
  -> request it
  -> read procedure-owned postcondition/reconciliation
  -> follow returned next action
```

Echo these values exactly when present:

- component ids for units, cities, players, and notifications;
- type/node/action identifiers;
- coordinates returned by movement, placement, or expansion candidates;
- operation/no-repeat/correlation keys;
- current option-specific parameters.

Never convert a name to a guessed numeric id. Prefer a candidate read. Use the
current bounded `gameinfo` diagnostic only when the play surface does not
already provide the required identifier.

## Command Discovery

Use `game --help` to select the owning topic and `game play --help` to select
an actor-facing read or request. Then ask the exact leaf for `--help`
immediately before issuing it. This reference deliberately carries no command
inventory: the Oclif manifest and native help are the executable authority.

## JSON And Result Interpretation

Use the leaf's current structured-output flag when an agent must parse the
result. Read the procedure-specific envelope rather than assuming one universal
success boolean. Preserve distinctions such as:

- admitted versus refused;
- not dispatched versus dispatched;
- confirmed versus guarded/uncertain;
- stale, partial, or unavailable observation;
- postcondition satisfied versus missing;
- next action and reconciliation required;
- retry allowed versus no-repeat.

After a request, trust the returned postcondition, evidence, reconciliation,
and next-action fields defined by that procedure. A command returning without
throwing is not evidence that the game accepted the action.

## Coordinates

- Immediate movement coordinates come from the current unit movement/planning
  read.
- Expansion and worker coordinates come from the current city candidates.
- Strategic front or settlement suggestions are goals, not automatically
  reachable one-step actions.
- Validate the named action against current state before requesting it.

## Unsupported Operations

A read may expose a lawful native operation for which no named actor-facing
command exists. Stop and report:

- the play read that exposed it;
- exact operation/candidate values;
- current situation and blocker;
- the missing actor task.

Do not route around Play through a raw Tuner command or private controller
operation. The durable repair is a typed controller primitive when needed,
Play-owned policy/reconciliation, and a concrete projection for the actor task.

## Command Record

For every mutation capture:

- CLI entrypoint and leaf help version/source revision;
- exact check input and returned candidate;
- exact request input;
- operation/no-repeat identity;
- dispatch disposition;
- postcondition/reconciliation result;
- next action;
- whether retry is lawful.
