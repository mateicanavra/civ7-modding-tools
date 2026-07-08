# Design

## Failure Model

Setup failure reasons are a closed internal union. The minimum supported
classes are:

- `setup-map-row-not-visible`
- `setup-map-row-mismatched`
- `generated-map-mod-not-enabled`
- `setup-read-timeout`
- `tuner-unavailable`
- `direct-control-command-failed`

Public projection remains coarse: runtime-control, runtime-observation, or
dependency-unavailable depending on the phase and whether Civ7/direct-control is
reachable.

## Diagnostics Shape

Private diagnostics include:

- request id and run artifact id;
- expected generated map file;
- setup phase where the failure occurred;
- bounded row sample for row readback failures;
- active target mod-set readback whenever classifying
  `generated-map-mod-not-enabled`;
- direct-control capability state when the failure is actually transport or
  tuner availability.

No public status, event, current-operation, or toast payload contains private
samples or local paths.

## File Topology

Likely source write set:

- `apps/mapgen-studio/src/server/runInGame/**`
- `apps/mapgen-studio/src/server/operations/**`
- `apps/mapgen-studio/src/server/diagnostics/**`
- `apps/mapgen-studio/test/runInGame/**`
- `packages/civ7-direct-control/src/setup/**`
- `packages/civ7-direct-control/test/**`

Do not add caller-local Civ7 control scripts.
