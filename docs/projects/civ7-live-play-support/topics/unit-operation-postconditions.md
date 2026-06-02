# Unit Operation Postconditions

Status: `implemented-baseline`.

## Frame

Unit movement reliability depends on proving what changed after a send. A
validator or send envelope proves that the runtime accepted an operation shape;
it does not prove that the tactical board changed, that a ready-unit blocker
advanced, or that a naval movement was visible through the current unit summary.

`game play unit-target` classifies direct plot-target sends. Generic unit
operations now also carry a direct-control postcondition baseline for
`unit-operation` and `unit-command` sends: before/after unit snapshot, selected
unit, first ready unit, blocker, and a classification.

## Failure Modes

- Latent postcondition: a `unit-target` send can return before animation,
  queued movement, or unit/path state becomes visible to the summary probe. The
  command now absorbs that latency with bounded polling before reporting a miss.
- Naval movement ambiguity: the UI can track desired destination or path state
  separately from the unit summary, so a Galley may validate and send while
  current probes still report no state change.
- Generic operation overclaim: generic `game play operation --send` must not
  treat the transport envelope as proof. For unit families, `verified` now
  depends on the postcondition classification.
- Queue advancement gap: no-target operations should prove whether
  `firstReadyUnitId`, `selectedUnitId`, HUD blocker, unit activity, or unit
  action state changed.
- UI path mismatch: official world input can include interface-mode checks and
  war confirmation flows that raw operation sends do not satisfy.

## Normative Contract

A robust caller-level unit operation reports:

- before/after unit summary;
- before/after selected unit;
- before/after first ready unit;
- before/after blocker and blocking notification;
- operation-specific activity or queued-destination evidence when discoverable;
- a classification such as `queue-advanced`, `selected-unit-changed`,
  `activity-changed`, `unit-state-changed`, `blocker-changed`,
  `validation-changed`, `not-sent`, or `no-state-change`.

The play agent should treat `no-state-change` as unresolved, not as permission
to repeat the same send. For `game play unit-target --send`,
`no-state-change` now means the immediate response and the bounded poll window
both failed to observe unit or target-plot change. Re-read the HUD and ready
unit before trying another movement, alert, wait, or skip.

`unit-target --send` includes:

- `verification.source`: `immediate` or `bounded-poll`;
- `verification.attempts`: number of follow-up reads used by bounded polling;
- `verification.observedAfterMs`: elapsed observation time before returning;
- `verification.reason`: caller-facing interpretation of the postcondition.

## Next Implementation Work

1. Add discoverable desired/path destination fields so queued naval or
   multi-turn movement can be distinguished from a true no-op.
2. Add a named closeout command such as `game play unit-closeout
   --type SKIP_TURN|WAIT_FOR|ALERT|SLEEP` that wraps generic unit operations but
   requires queue or activity postconditions.
3. Build batch unit operation ledgers over these n=1 postconditions rather than
   replaying stale validation plans.

## Proof Boundary

These postconditions are operational proof, not tactical judgment. A proved
`queue-advanced` closeout may still be strategically poor; a proved
`path-shortfall` move may still be useful. Strategy remains with the play agent,
but the tool should make the effect class explicit.
