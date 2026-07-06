# Studio Run Public Status And Diagnostics Envelope

## Why

Run in Game currently exposes one mixed operation object that carries UI status,
request internals, artifact state, raw errors, developer diagnostics, and
attribution data. That makes every later runtime/materialization change risky:
moving internals changes public wire shape, and failures can leak commands,
paths, envelopes, setup data, or generated artifact records.

This packet establishes the public/private contract first. Public status and
declared public errors become a closed, safe operation projection. Developer
diagnostics become a deliberate private record reachable by `diagnosticsId`.

## System Context

Affected owners:

- `packages/studio-contract/src/runInGame.ts`
- `packages/studio-server/src/operationRuntime/projection.ts`
- `packages/studio-server/src/operationRuntime/model.ts`
- Studio Run in Game API/error projection code
- Studio UI status rendering and copy-diagnostics entrypoint

This packet does not change generation, deployment, source resolution, or Civ7
control behavior.

## Before And After

Before:

- public status/event/current payloads can include open `details`, raw `error`,
  `result: unknown`, request internals, materialization fields, source snapshots,
  attribution records, command output, or paths;
- public oRPC error payloads can carry a different diagnostic shape from status;
- diagnostics are copied from mixed operation serialization.

After:

- public status, events, current projection, and declared public errors share one
  closed failure vocabulary;
- public phases are exactly `resolving-source`, `generating-artifacts`,
  `deploying`, `preparing-civ7`, `starting-game`, `observing-runtime`,
  `completed`, `failed`, and `cancelled`;
- public failure categories are exactly `request-validation`,
  `source-resolution`, `artifact-generation`, `deployment`, `runtime-control`,
  `runtime-observation`, `attribution`, `cleanup`, `ownership`,
  `dependency-unavailable`, `operation-cancelled`, and `internal-defect`;
- every emitted `diagnosticsId` resolves to a durable private
  `RunDiagnosticsRecord`;
- copy diagnostics reads the diagnostics record by id, not public status.

## Behavior Verification

Behavior tests verify public behavior only:

- malformed Run in Game requests return the closed public error shape;
- failed operations project the right public phase, category, recovery action,
  and diagnostics id;
- successful operations project `completed` without private details;
- copy diagnostics returns the private diagnostics record for a valid id and a
  safe not-found result for an unknown id.

Tests must not search for retired field names or retired paths.

## Structural Enforcement

Permanent structure is enforced through SA-01:

- `@civ7/studio-contract` owns the public Run in Game wire schemas;
- public Run in Game wire schemas are closed and do not include open catch-all
  fields;
- private diagnostics records are not exported through public status/current
  schemas;
- copy-diagnostics is an explicit lookup operation by diagnostics id.

Structural authority row: SA-01
`grit-studio-run-public-contract-closed` in the structural authority matrix.

## Verification Gates

- Focused contract/schema checks for `@civ7/studio-contract`.
- Focused server projection tests.
- Focused UI status/copy-diagnostics behavior tests if UI mapping changes.
- SA-01 `grit-studio-run-public-contract-closed`.
- `bun run openspec -- validate studio-run-public-status-diagnostics --strict`.
