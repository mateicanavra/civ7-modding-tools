# Phase Record: Studio Operation Lifecycle Failure Classification

Status: implemented and verified.

Normative packet: `docs/projects/studio-runtime-simplification/workstream/studio-effect-state-machine-recovery/PACKET-TRAIN.md#smr-02---operation-lifecycle-failure-classification`.

Priority rows: OP-01 through OP-08, STUDIO-01, EB-05 through EB-08.

## Scope Boundary

This packet classifies operation lifecycle failures after runtime admission. It
does not prove that Civ7 can load `{swooper-maps}/maps/studio-current.js`; that
live deploy/setup visibility proof remains owned by the later live Civ7 proof
packet. The setup-row symptom is nevertheless represented here as a typed
`ProofFailed` terminal state so the runtime no longer reports it as invalid user
input.

## Implemented Failure Mapping

- OP-01 admission validation remains `InvalidRequest` before worker leaf ports
  run.
- OP-02 materialization worker failures map to `MaterializationFailed` with
  `run-in-game-materialization-failed`.
- OP-03 deploy worker failures map to `DeployFailed` with
  `run-in-game-deploy-failed`.
- OP-04 setup-row visibility failures, including
  `Civ7 setup cannot see {swooper-maps}/maps/studio-current.js`, map to
  `ProofFailed` with `setup-row-unavailable` and failed phase
  `preparing-setup`.
- OP-05 start-game failures map to `ProofFailed` with `start-game-failed` and
  terminal `uncertain` status.
- OP-06 waiting-for-proof failures map to `ProofFailed` with
  `log-proof-missing`.
- OP-07 restart failures map to `DependencyUnavailable` with `restart-failed`;
  the workflow now sets the local failure phase to `restarting-civ` before the
  restart leaf runs.
- OP-08 cleanup failures continue to preserve their cleanup-specific typed
  failure.
- STUDIO-01 status projections now include recovery actions from the typed
  failure, rather than only generic phase-derived actions.

## Verification

- `bun run --cwd packages/studio-server test test/operationRuntime.test.ts`
  passed with 31 tests.
- `bun run nx run @civ7/studio-server:test --outputStyle=static` passed with
  73 tests.
- `bun run nx run @civ7/studio-server:check --outputStyle=static` passed.
- `bun run nx run @civ7/studio-server:build --outputStyle=static` passed.
- `bun run openspec -- validate studio-operation-lifecycle-failure-classification --strict`
  passed.
- `bun run openspec:validate` passed with 194 items.

## Remaining Boundaries

- Live Civ7/FireTuner happy-path proof was not performed in this packet.
- Browser adoption of the new terminal DTO fields is owned by
  `studio-browser-defined-error-projection` and
  `studio-browser-scenario-proof`.
- Actual deployment and Civ7 setup visibility of `studio-current.js` remains a
  priority blocker for `studio-live-civ7-proof-gates`.
