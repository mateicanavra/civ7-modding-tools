# Evented Decision Stream Baseline

Status: `active-design`.

## Frame

The goal is not to add a generic message bus because pub/sub is fashionable.
The goal is to remove unnecessary manual reconciliation while preserving the
live authority that makes direct-control safe: current blockers, selected or
ready entities, validators, sends, and postconditions.

This frame includes:

- semantic play topics such as blockers, notifications, ready units, ready
  cities, battlefield pressure, civilian routes, and postconditions;
- a materialized decision view that subscribers can read without rerunning the
  whole CLI stack;
- explicit invalidation after mutation, human input, turn advance, reconnect,
  slow read, or failed probe;
- a parallel experiment path that can be swapped in only if it proves better
  than the current polling/watch loop.

This frame excludes:

- treating local SQLite or save files as live decision authority before a
  freshness contract is proven;
- publishing command sends as ordinary state events without validator and
  postcondition evidence;
- hiding stale-read risk behind a convenient stream API;
- changing `@civ7/direct-control` into multiple caller-local transports.

## Recommendation

Build an evented materialized-view layer over direct-control reads first. Do not
replace direct-control polling with native game pub/sub until the runtime proves
stable event hooks for the same authority questions we currently poll:

- end-turn blocker and notification queue;
- selected or first-ready unit/city;
- current modal or decision surface;
- validator results and candidate args;
- post-send state changes.

The first design should therefore be an Effect-based bridge:

```text
direct-control snapshots + validators + bounded local enrichment
  -> Effect Stream producers
  -> Effect PubSub / Queue
  -> Effect reducer for latest materialized views
  -> subscriber views / JSONL / future API
```

If later evidence shows that the Civ7 runtime exposes durable event callbacks
for notifications, selection, operations, or turn state, those callbacks can
become producers for the same topic contracts. The subscriber API should not
care whether a topic came from polling, a log tail, a runtime callback, or a
hybrid producer, but the event envelope must keep the source and proof label.

## Structural Alternative

The main alternative is not pub/sub. It is a snapshot cache with explicit
leases:

- `game watch` keeps polling at a conservative interval.
- Each read writes a latest snapshot and a few derived views.
- Commands read from the cache only when the lease is fresh and the requested
  action family matches the snapshot's proof scope.
- Any mutation or human input invalidates the lease.

This is simpler than pub/sub and may be enough if the main problem is repeated
manual reads rather than true asynchronous consumers. Pub/sub is better only
if multiple consumers need independent subscriptions, topic-level deltas, or
background derivations that are too expensive to recompute per command.

The design should keep both shapes compatible: a topic stream is an append-only
history of changes; the materialized view is the latest reduced state with a
freshness lease.

## Topic Taxonomy

Topic names should be semantic, not method names. A subscriber should ask for
"decision blockers" or "civilian route risk," not "call this wrapper again."

| Topic | Producers | Event when | Subscriber use |
| --- | --- | --- | --- |
| `play.turn` | HUD snapshot | turn or turn date changes | Reset plans and invalidate stale commands. |
| `play.blocker` | notification HUD | blocker id/type/category changes | Choose the next decision family. |
| `play.notification` | notification HUD | notification appears, changes category, or disappears | Maintain decision queue without rereading all raw fields. |
| `play.ready-unit` | ready-unit snapshot | first-ready or selected unit changes, or unit facts change | Drive unit-action inspection and tactical POIs. |
| `play.ready-city` | ready-city snapshot | selected/blocker-target city changes, production/population state changes | Drive city production and population decisions. |
| `play.battlefield-poi` | battlefield scan, front summary | POI severity, location, or contributors change | Keep a live tactical HUD around active fronts. |
| `play.civilian-route` | civilian route triage | origin, inferred destination, or route status changes | Warn before Settler/civilian movement. |
| `play.validator` | unit/city/player validators | requested operation args validate or fail | Preserve proof for a concrete candidate action. |
| `play.postcondition` | after-send reads, log markers | expected state changes or fails to change | Confirm whether a sent mutation actually landed. |
| `local.catalog` | SQLite/resource inventory | source mtime/version changes | Enrich ids and text without authorizing actions. |
| `watch.health` | watcher loop | slow read, timeout, reconnect, parse failure | Tell subscribers when cached state is not safe enough. |

## Event Envelope

Every event should carry enough proof for a downstream agent to know what it can
and cannot reuse:

```json
{
  "schema": "civ7.play-event.v1",
  "topic": "play.blocker",
  "key": "0:577:20",
  "sequence": 42,
  "observedAt": "2026-06-01T16:00:00.000Z",
  "turn": 123,
  "turnDate": "1160 BCE",
  "source": {
    "kind": "direct-control-snapshot",
    "wrapper": "getCiv7PlayNotificationView",
    "stateRole": "app-ui"
  },
  "proof": "live-snapshot",
  "freshness": {
    "leaseMs": 3000,
    "staleAfter": "2026-06-01T16:00:03.000Z",
    "invalidatesOn": ["mutation", "human-input", "turn-change", "reconnect", "slow-read"]
  },
  "payload": {}
}
```

Required fields:

- `topic`: semantic topic name.
- `key`: stable entity key when one exists, otherwise a synthetic topic key.
- `sequence`: monotonic per watcher process.
- `observedAt`: wall-clock observation time.
- `turn` and `turnDate`: the live game context, when readable.
- `source`: producer and wrapper, so a subscriber knows whether this is a
  runtime snapshot, validator, local catalog, log marker, or future runtime
  callback.
- `proof`: one of `live-snapshot`, `validator`, `postcondition`,
  `static-enrichment`, `forensic`, `derived`.
- `freshness`: lease and invalidation causes.
- `payload`: the topic-specific value.

## Snapshot, Delta, And Command-Intent Contracts

Use three separate contracts. Merging them would make the stream convenient but
unsafe.

### Snapshot

Snapshots are full current reads for a proof scope. They can replace the
previous materialized value for the same topic key.

Examples:

- notification HUD;
- ready-unit view;
- ready-city view;
- battlefield scan around an origin;
- civilian-route triage for an origin/destination pair.

### Delta

Deltas describe a change between snapshots. They are useful for subscribers,
but they are weaker than the snapshot unless the reducer keeps the prior value.

Examples:

- blocker changed from narrative branch to diplomacy response;
- first-ready unit changed from Spearman at `(20,20)` to Ballista at `(14,18)`;
- civilian route status changed from `hold-or-screen` to
  `proceed-with-validation`.

### Command Intent

Command intent is not a send. It is a proposed operation with its validator
proof, source snapshot keys, and required postcondition.

Examples:

- `unit-target` says a Ballista attack or move target is valid;
- `respond-diplomacy` validates a specific `{ ID, Type }`;
- `build-production` validates a city production choice and placement plot.

A command intent expires whenever any source snapshot lease expires or any
invalidation cause occurs. Sending still belongs to the existing explicit
command family with the appropriate `--send`/reason surface.

## Subscriber Shapes

Implementation substrate:

- Use `effect` for `Stream`, `PubSub`, `Queue`, `Ref`, `Schedule`, scoped
  resources, interruption, and backpressure.
- The current latest package observed from npm on June 1, 2026 is
  `effect@3.21.2`.
- Do not hand-roll a pub/sub implementation. The project-specific work is the
  topic contract, reducer rules, freshness policy, and direct-control producer
  integration.

The first implementation should provide three simple consumer shapes before a
larger API server:

1. `game watch --topics blockers,ready-unit,battlefield --jsonl`
   emits normalized events instead of only observation rows.
2. `game play stream --topic play.blocker --topic play.ready-unit --jsonl`
   tails selected topics from the same watcher loop.
3. `game play view --json`
   returns the latest materialized decision view with freshness and source
   keys, so an agent can read once without replaying the stream.

If an API process is added later, it should own the watcher loop and expose:

- `GET /play/view` for latest materialized state;
- `GET /play/topics` for topic metadata;
- `GET /play/events?topic=...&since=...` for replay;
- `WS /play/events` or Server-Sent Events for live subscribers.

The CLI should remain a client of this API only when the API is running. Direct
CLI reads must keep working as the fallback and truth-preserving baseline.

## Reducer Rules

The reducer is where state reconciliation becomes explicit:

- Deduplicate by topic key plus payload hash.
- Increment sequence on every accepted event.
- Keep current value, previous value, observedAt, source, proof, and freshness.
- Invalidate all live topics after any successful mutation send.
- Mark all live topics `stale-risk` after a slow read instead of silently
  reusing them.
- Do not allow static-enrichment events to satisfy live proof requirements.
- Preserve hidden-info policy from scans and route lenses.
- Attach omitted counts and scan bounds to tactical topics so consumers know
  what was not read.

## Experiment Plan

Start with a parallel experiment. It should not change existing command
behavior until it proves value.

1. Add an Effect-powered watcher stream that consumes the same reads as
   `game watch`: HUD, optional ready-unit, optional ready-city, notification
   queue schedule, and selected tactical lenses.
2. Publish `civ7.play-event.v1` values through Effect `PubSub` and optionally
   persist them as JSONL.
3. Materialize a latest view with an Effect-managed reducer during the same
   process.
4. Compare it against repeated direct CLI reads across a live turn:
   diplomacy blocker, unit blocker, notification dismissal, ready-unit change,
   and a post-send invalidation.
5. Only then add a subscriber command or API surface.

Acceptance criteria:

- The stream reports the same next decision as `game play priorities --json`
  within one polling interval.
- The stream invalidates after a mutation and refuses to serve validator-backed
  command intent from stale snapshots.
- The stream emits fewer redundant full reads for subscribers than separate
  CLI polling.
- The event artifact is replayable into the same materialized view.
- Failure output explains whether the problem was stale source data, tuner
  timeout, reducer error, or subscriber lag.

## When Pub/Sub Is Wrong

Do not ship pub/sub as the core baseline if any of these stay true:

- only one consumer exists and a latest-view cache solves the problem;
- subscribers need strong transaction semantics that the game runtime cannot
  provide;
- event ordering cannot survive reconnects and turn transitions;
- event consumers start treating static catalog enrichment as live authority;
- debugging becomes harder than direct snapshot reads;
- the stream cannot prove invalidation after sends and human input.

In that case, keep the snapshot-cache alternative and improve `game watch`,
`game play priorities`, and tactical lenses instead.

## Falsifier

The pub/sub baseline is falsified if, in live play, it cannot reliably keep the
same next blocker, first-ready entity, and invalidation status as direct
`game play priorities --json` across three consecutive blocker resolutions and
one mutation/postcondition cycle.

The native runtime-event variant is falsified if the game/runtime only exposes
callbacks for UI convenience but not for the authority surfaces we need:
blockers, selected entities, validators, and postconditions. In that case the
event layer remains a watcher-derived stream, not a direct game subscription.

## Current Evidence

- `game watch` already polls `getCiv7PlayNotificationView`, optionally composes
  ready-unit and ready-city reads, and emits JSON/JSONL observations with
  stale-read labels.
- `getCiv7PlayNotificationView` reads `Game.Notifications`, live blocker
  state, selected unit/city, first-ready unit, and a materialized decision
  queue.
- Existing live-play docs establish that local SQLite and saves are static or
  forensic evidence unless they prove a live freshness contract.
- The active turn 123 state changed from a narrative blocker to unit command
  to Lafayette diplomacy while the ready unit and tactical pressure also
  changed. That is exactly the kind of semantic state churn a topic stream
  should reduce for subscribers.
- `@mateicanavra/civ7-cli` now carries `effect@3.21.2` as the intended
  implementation substrate for the subscriber experiment.
