# Design

## Observation Preconditions

Runtime observation requires existing manifest, generated mod, deployment, and
deployed snapshot records. If any are missing, the operation fails before
runtime observation with the category owned by the missing step.

## Observation Records

`ScriptingLogObservation` captures correlation markers observed in the scripting
log. `SetupRowReadback` captures the setup row selected/visible to Civ7.
`LoadedGameReadback` captures the post-start generated-artifact marker and
public `/rpc` live reads that prove Civ7 reached a loaded/in-game state for the
generated request. These records are private.

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

`LoadedGameReadback` is collected after game start. It records the
request-specific marker emitted by the generated runtime asset and requires that
marker to match `RunCorrelation`. It also records `civ7.live.status` and
`civ7.live.snapshot` reads from the running Studio daemon's public `/rpc` oRPC
mount: loaded/in-game state, runtime `snapshotId`/`snapshotHash` when present,
and a non-empty bounded map grid whose dimensions match the requested map size.
Shape-only status/snapshot evidence is not sufficient without the generated
runtime marker. Direct `@civ7/direct-control` calls may help investigate a
failure, but endpoint evidence is accepted only from the public `/rpc` reads.

## Outcome

Correlation match allows the workflow to continue. Correlation mismatch proves
the wrong deployed/request artifact was observed and fails the operation with
public category `runtime-observation`. Missing or mismatched loaded-game
readback also fails the operation with public category `runtime-observation`.
Broad runtime map parity readback is not represented because it is outside this
packet train.
