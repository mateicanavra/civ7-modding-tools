# Controller Bridge Public Surface Slice

## Purpose

Repair the package-root public surface for the controller bridge after the
serialized ingress allowlist grew beyond the originally exported readiness,
attention, notification, and turn envelopes.

The controller bridge already owns closed request and success response schemas
for strategy, city, narrative, diplomacy, unit, and progression procedures.
This slice exports those existing schemas and types from `@civ7/control-orpc`
so game UI/controller consumers can import the same closed envelopes they can
actually invoke through `Civ7IntelligenceBridge.invoke(...)`.

## Write Set

- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/test/controller-bridge-ingress.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/workstream/controller-bridge-public-surface-slice.md`

## Boundary

- No bridge dispatch behavior changes.
- No new procedure allowlist entries.
- No transport, CLI, Studio, or OpenAPI surface change.
- No raw direct-control runtime/result aliases are exported.
- No approval/reason mechanic is reintroduced.
- No deployed Civ7 runtime proof, play-thread action, or full Task `7.3`
  acceptance is claimed.

## Proof Collected

- Focused controller-ingress public export proof.
- `packages/civ7-control-orpc` package test/check/build.
- Strict OpenSpec validation for `civ7-control-orpc-native-slice`.
- Strict OpenSpec validation for `civ7-support-direct-control-modularization`.
- `git diff --check`.

## Residual Risk

This is a package/source public-surface repair only. Deployed Civ7 UIScript
loading and live controller runtime proof remain pending under the broader
controller bridge lane.
