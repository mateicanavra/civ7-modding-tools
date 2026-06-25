# Play Agent Response Contract

Status: `design-reference`.

## Frame

The play agent is the primary consumer. It needs fast, low-noise answers for
turn decisions, with enough expansion paths to inspect evidence when a decision
is risky or surprising. Full raw JSON is useful for debugging, but it should not
be the default shape for every tactical read or operation send.

This is an internal, controlled, early API. Prefer domain operations and stable
response tiers over kitchen-sink envelopes.

## Live CLI Entrypoint

Live turn execution should call the globally linked development binary:

```bash
civ7 game ...
```

Do not use `bun packages/cli/bin/run.js` as the play-agent command surface. It
is a package-development entrypoint that relies on generated `dist` modules and
can disappear or go stale during active play. Build, test, and relink through
Nx targets such as `nx run @mateicanavra/civ7-cli:build`,
`nx run @mateicanavra/civ7-cli:test:play`, and
`nx run @mateicanavra/civ7-cli:link:global`; then execute live turns through
`civ7 game ...`.

## Domain Split

Keep these surfaces distinct:

- `operation`: what was requested, whether it was sent, whether it was
  verified, and the postcondition summary;
- `decisionHud`: what needs attention now and the smallest set of inputs needed
  to act;
- `tacticalLens`: read-only planning evidence such as movement, threats,
  destinations, fronts, and targets;
- `debug`: host, port, raw validation output, snapshots, and full
  serialized evidence;
- `audit`: ordered attempts for batches, with validation, send, and
  postcondition evidence per entry.

An operation result can link to a tactical lens, but it should not embed the
full lens unless requested.

Every response should state `hiddenInfoPolicy`. Every mutating response should
state `replaySafe: false` unless a future implementation proves idempotency.

## Response Tiers

Default responses should be summary-first:

- `ok`;
- `contractVersion`;
- `command` and `requestId`;
- domain object id or selection context;
- `outcome` or classification;
- one sentence `summary`;
- `next` or `needs` when the caller must decide;
- compact `warnings`;
- `omitted` entries for fields that require expansion.

Expansion flags should be explicit and composable:

- `--fields a,b,c` for focused fields inside the default tier;
- `--expand hud,lens,operation,audit,debug,raw` for named sections;
- `--debug` for probes, timing, truncation, selected state, and command
  provenance;
- `--raw` for the current full direct-control payload.

Debug output remains available, but raw host/tuner/appui envelopes should move
behind `--debug` or `--raw` for new commands.

## Contract Vocabulary

Use stable domain names instead of generic `result`:

- `summary`: compact decision payload;
- `decisionHud`: turn, local player, readiness, blockers, counts;
- `tacticalLens`: focused read-only planning evidence;
- `operation`: validator/request outcome for the requested action;
- `audit`: before/after and postcondition evidence for mutations;
- `debug`: unstable probes and implementation details;
- `raw`: legacy/current full payload.

Use `outcome` for operation state, with values such as `valid`, `invalid`,
`sent`, `blocked`, `failed`, or `unknown`. Preserve Civ7 operation family
strings such as `unit-operation`, `unit-command`, `city-operation`,
`city-command`, and `player-operation`.

Collections should report limits through `omitted` entries or `{ count,
omitted }` summaries. Structured IDs stay structured: component ids remain
`{ owner, id, type }`, and locations remain `{ x, y }`.

## Examples

`game play operation --family unit-operation --operation-type SKIP_TURN --send`
should default to a compact result:

```json
{
  "ok": true,
  "contractVersion": "play-agent-v0",
  "command": "game play operation",
  "requestId": "req-...",
  "sent": true,
  "verified": true,
  "outcome": "sent",
  "summary": {
    "classification": "queue-advanced",
    "message": "SKIP_TURN was sent and the ready-unit queue advanced."
  },
  "warnings": [],
  "omitted": [
    { "path": "audit", "reason": "not-expanded" },
    { "path": "raw", "reason": "not-expanded" }
  ],
  "hiddenInfoPolicy": "visibility-filtered",
  "replaySafe": false
}
```

`game play notifications` should default to the queue and next blocker, not all
raw notification fields. Use `--detail` for required inputs and common actions,
or the new `--expand hud,operation` vocabulary when implemented. Use `--raw` for
the underlying notification records.

`game play priorities --compact --json` is the first additive compact contract
for this family. Plain `--json` remains the compatibility payload; compact mode
returns `contractVersion`, `summary`, `decisionHud`, top `priorities`, `next`,
`warnings`, `omitted`, and `hiddenInfoPolicy` so play agents can decide what to
inspect without scanning the full composed read.

`game play unit-move-preview --compact --json` is the additive compact movement
contract. Plain `--json` remains the compatibility payload; compact mode returns
selected unit summary, requested and queued destinations, reachable counts,
requested/queued path summaries, `next`, `warnings`, `omitted`,
`hiddenInfoPolicy`, and `relationshipProof`.

`game play battlefield-scan` should default to points of interest and owner
pressure summaries. Use `--expand lens` for units/cities and `--raw` for the
full scan inventory.

`game play destination-analysis` should default to route risk and destination
pressure. Use `--expand lens` for corridor samples and `--raw` for complete
plot/unit/city evidence.

`game play unit-target --send` should default to the selected action and
postcondition classification. Use `--expand operation,audit` to inspect
validator details, before/after location, target unit changes, and the exact
reason why a move is `target-reached`, `path-shortfall`, or `no-state-change`.

## Compatibility Plan

Do not break existing JSON consumers silently. Add compact/summary output as a
new mode first, update docs and tests around representative commands, then make
it the default only when play-agent callers have moved to expansion flags.

When converting a command, keep the raw fields reachable by flag and preserve
postcondition/audit evidence for mutating operations.

Suggested migration order:

1. Add envelope helpers and tests for one read lens and one mutation.
2. Keep current payloads behind `--raw`.
3. Add `--expand` sections without changing default JSON.
4. Move play-agent callers to compact defaults.
5. Flip defaults only after tests prove `summary`, `warnings`, `omitted`,
   `hiddenInfoPolicy`, and mutation `audit` are still available.

## Design Checks

- Consumer test: can the play agent decide the next step from the default
  response without scanning a large object?
- Contract test: are hidden fields explicitly available through flags?
- Consistency test: do read lenses, operations, and queues use the same
  `summary`, `warnings`, `detail`, `evidence`, and `raw` vocabulary?
- Safety test: does compact output still show stale-state, risk, and
  no-state-change warnings?
