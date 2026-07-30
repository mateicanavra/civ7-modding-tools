# Retired Direct-Control Procedure-Core Experiment

## Disposition

The direct-control-local procedure descriptor experiment is retired.
`packages/civ7-direct-control/src/procedure-core.ts`, its adjacent
`*-procedure.ts` wrappers, and their wrapper-only tests had no production
consumer outside their own public exports. They rebuilt contract, context,
error, correlation, validation, and projection concepts already owned by the
native control service.

Checked Task 4.18-4.58 entries remain the historical record of that experiment.
They do not authorize restoring the source, wrappers, exports, or error codes.

## Current Boundary

- `@civ7/direct-control` owns low-level tuner/socket access, state discovery,
  command serialization, bounded runtime reads, and direct runtime evidence.
- `@civ7/control-orpc` at `services/civ7-control` owns public contracts,
  routers, context ports, admission, typed errors, middleware, and multi-step
  Effect behavior directly over those atoms.
- CLI and controller callers consume the service rather than reconstructing a
  procedure or generic operation plane.
- Runtime proof, AI ingestion, and telemetry remain distinct contracts; none
  requires a direct-control descriptor registry.

Current service composition authority lives in
`openspec/changes/civ7-control-orpc-native-slice/` and
`.agents/skills/civ7-orpc-control-architecture/`.
