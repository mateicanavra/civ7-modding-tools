# Controller Supported Dispatch Gate Slice

## Purpose

Make the serialized controller bridge respect the current controller context's
supported procedure facts before dispatching into the native in-process router.

The bridge already had a global request-envelope allowlist and a mutation proof
gate. That is not enough for the game UI controller because the current
runtime target may support only a subset of globally known procedures. This
slice keeps `readiness.current` as the bootstrap procedure, then requires
`supportedReadProcedures` for other reads and both context-owned mutation proof
plus `supportedMutationProcedures` for mutations.

## Write Set

- `packages/civ7-control-orpc/src/bridge/controller-ingress.ts`
- `packages/civ7-control-orpc/test/controller-bridge-ingress.test.ts`
- `mods/mod-civ7-intelligence-bridge/mod/ui/civ7-intelligence-bridge.js`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/specs/civ7-control-orpc/spec.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/controller-supported-dispatch-gate-slice.md`

## Boundary

- No new bridge procedure allowlist entries.
- No transport, CLI, Studio, OpenAPI, or RPCLink behavior change.
- No approval/reason mechanic is reintroduced.
- No raw command/session/tuner/game-UI runtime payload is exposed.
- No deployed Civ7 runtime proof, play-thread action, or full Task `7.3`
  acceptance is claimed.

## Proof Collected

- Focused controller-ingress support-gate proof.
- `packages/civ7-control-orpc` package test/check/build.
- Controller mod package test/check/build with bundle scan.
- Strict OpenSpec validation for `civ7-control-orpc-native-slice`.
- Strict OpenSpec validation for `civ7-support-direct-control-modularization`.
- `git diff --check`.

## Residual Risk

This proves local package and bundle behavior only. Deployed Civ7 UIScript
loading and live game-runtime proof remain pending under the broader controller
bridge lane.
