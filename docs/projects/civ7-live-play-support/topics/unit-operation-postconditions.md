# Unit Operation Postconditions

Status: `reference-with-gap`.

## Frame

Unit movement reliability depends on proving what changed after a send. A
validator or send envelope proves that the runtime accepted an operation shape;
it does not prove that the tactical board changed, that a ready-unit blocker
advanced, or that a naval movement was visible through the current unit summary.

`game play unit-target` now classifies direct plot-target sends, but generic
unit operations still need stronger domain postconditions for closeout commands
such as `WAIT_FOR`, `SKIP_TURN`, `ALERT`, `SLEEP`, and naval movement holds.

## Failure Modes

- Immediate postcondition miss: a `unit-target` send returns before animation,
  queued movement, or unit/path state becomes visible to the summary probe.
- Naval movement ambiguity: the UI can track desired destination or path state
  separately from the unit summary, so a Galley may validate and send while
  current probes still report no state change.
- Generic operation overclaim: generic `game play operation --send` can report
  send success without proving ready queue advancement, selected unit change, or
  activity change.
- Queue advancement gap: no-target operations should prove whether
  `firstReadyUnitId`, `selectedUnitId`, HUD blocker, unit activity, or unit
  action state changed.
- UI path mismatch: official world input can include interface-mode checks and
  war confirmation flows that raw operation sends do not satisfy.

## Normative Contract

A robust caller-level unit operation should report:

- before/after unit summary;
- before/after selected unit;
- before/after first ready unit;
- before/after blocker and blocking notification;
- operation-specific activity or queued-destination evidence when discoverable;
- a classification such as `target-reached`, `path-shortfall`,
  `queue-advanced`, `activity-changed`, `unit-state-changed`,
  `target-state-changed`, `unresolved-queued-or-animation`, or
  `no-state-change`.

The play agent should treat `no-state-change` as unresolved, not as permission
to repeat the same send. Re-read the HUD and ready unit before trying another
movement, alert, wait, or skip.

## Next Implementation Work

1. Add shared unit-operation postconditions in `@civ7/direct-control` for
   no-target unit operations: before/after unit, selected unit, first ready
   unit, blocker, and classification.
2. Extend `unit-target --send` with bounded short polling and any discoverable
   desired/path destination fields so movement animation or queued naval state
   does not collapse into plain `no-state-change`.
3. Add a named closeout command such as `game play unit-closeout
   --type SKIP_TURN|WAIT_FOR|ALERT|SLEEP` that wraps generic unit operations but
   requires queue or activity postconditions.

## Proof Boundary

These postconditions are operational proof, not tactical judgment. A proved
`queue-advanced` closeout may still be strategically poor; a proved
`path-shortfall` move may still be useful. Strategy remains with the play agent,
but the tool should make the effect class explicit.
