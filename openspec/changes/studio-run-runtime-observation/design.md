# Design

## Observation Preconditions

Runtime observation requires existing manifest, generated mod, deployment, and
deployed snapshot records. If any are missing, the operation fails before
runtime observation with the category owned by the missing step.

## Observation Records

`ScriptingLogObservation` captures correlation markers observed in the scripting
log. `SetupRowReadback` captures the setup row selected/visible to Civ7. Both
records are private.

The scripting-log observation window is established before Civ7 start or focus.
The observation stores the log path, starting byte offset or timestamp cursor,
deadline, and observed marker lines. Lines before the cursor are stale and do
not satisfy the operation. The default observation timeout is 180 seconds from
operation admission to terminal status, matching the packet-train live
verification contract.

`SetupRowReadback` distinguishes missing row from mismatched row:

- missing row: requested row is not visible to setup;
- mismatched row: setup selected a visible row whose run artifact id or
  correlation does not match the request.

## Outcome

Correlation match allows the workflow to continue. Correlation mismatch proves
the wrong deployed/request artifact was observed and fails the operation with
public category `runtime-observation`. Runtime map readback is not represented
because it is outside this packet train.
