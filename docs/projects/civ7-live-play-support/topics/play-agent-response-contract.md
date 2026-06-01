# Play Agent Response Contract

Status: `design-reference`.

## Frame

The play agent is the primary consumer. It needs fast, low-noise answers for
turn decisions, with enough expansion paths to inspect evidence when a decision
is risky or surprising. Full raw JSON is useful for debugging, but it should not
be the default shape for every tactical read or operation send.

This is an internal, controlled, early API. Prefer domain operations and stable
response tiers over kitchen-sink envelopes.

## Domain Split

Keep these surfaces distinct:

- operation result: what was requested, whether it was sent, whether it was
  verified, and the postcondition summary;
- decision HUD: what needs attention now and the smallest set of inputs needed
  to act;
- tactical lens: read-only planning evidence such as movement, threats,
  destinations, fronts, and targets;
- debug envelope: host, port, raw validation output, snapshots, and full
  serialized evidence;
- audit ledger: ordered attempts for batches, with validation, send, and
  postcondition evidence per entry.

An operation result can link to a tactical lens, but it should not embed the
full lens unless requested.

## Response Tiers

Default responses should be summary-first:

- `ok`;
- domain object id or selection context;
- status/classification;
- one sentence `summary`;
- `nextAction` or `needs` when the caller must decide;
- compact warnings;
- stable expansion hints.

Expansion flags should be explicit and composable:

- `--detail` for the most relevant supporting fields;
- `--include-evidence` for validator/postcondition snippets;
- `--include-raw` for raw direct-control payloads;
- `--include-lens <name>` when a command can attach a related tactical lens;
- `--format compact|json|pretty` where compact is agent-facing and json stays
  machine-readable.

Debug output remains available, but raw host/tuner/appui envelopes should move
behind `--include-raw` or an equivalent debug mode for new commands.

## Examples

`game play operation --family unit-operation --operation-type SKIP_TURN --send`
should default to a compact result:

```json
{
  "ok": true,
  "sent": true,
  "verified": true,
  "classification": "queue-advanced",
  "summary": "SKIP_TURN was sent and the ready-unit queue advanced.",
  "warnings": []
}
```

`game play notifications` should default to the queue and next blocker, not all
raw notification fields. Use `--detail` for required inputs and common actions,
and `--include-raw` for the underlying notification records.

`game play unit-move-preview` should default to selected unit, movement range,
queued destination, and top warnings. Use `--include-paths`,
`--include-post-move-actions`, and `--include-raw` for larger payloads.

`game play battlefield-scan` should default to points of interest and owner
pressure summaries. Use `--detail` for units/cities and `--include-raw` for the
full scan inventory.

`game play destination-analysis` should default to route risk and destination
pressure. Use `--detail` for corridor samples and `--include-raw` for complete
plot/unit/city evidence.

## Compatibility Plan

Do not break existing JSON consumers silently. Add compact/summary output as a
new mode first, update docs and tests around representative commands, then make
it the default only when play-agent callers have moved to expansion flags.

When converting a command, keep the raw fields reachable by flag and preserve
postcondition/audit evidence for mutating operations.

## Design Checks

- Consumer test: can the play agent decide the next step from the default
  response without scanning a large object?
- Contract test: are hidden fields explicitly available through flags?
- Consistency test: do read lenses, operations, and queues use the same
  `summary`, `warnings`, `detail`, `evidence`, and `raw` vocabulary?
- Safety test: does compact output still show stale-state, risk, and
  no-state-change warnings?
