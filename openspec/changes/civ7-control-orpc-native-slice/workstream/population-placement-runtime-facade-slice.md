# Population Placement Runtime Facade Slice

Status: implemented local package source cleanup.
Date: 2026-06-05.

## Purpose

Narrow the control-oRPC runtime/context facade for
`city.population.place.request` so edge adapters no longer construct native
control-oRPC context with generic player/city operation send ports.

The public service procedure already owns the semantic population placement
contract. This slice aligns the internal runtime facade with that service
boundary: procedures and fake contexts call semantic assign-worker and
expand-city placement ports, while the live facade adapter privately maps
those ports to direct-control's low-level player-operation and city-command
runtime authority.

## Write Set

- `packages/civ7-control-orpc/src/dependencies/direct-control.ts`
- `packages/civ7-control-orpc/src/modules/city/procedures/population-place-request.ts`
- `packages/civ7-control-orpc/test/city-population-placement-procedure.test.ts`
- this OpenSpec record, `tasks.md`, `specs/civ7-control-orpc/spec.md`, and
  `workstream/population-placement-native-procedure-slice.md`

## Behavior Boundary

The control-oRPC runtime facade now:

- exposes `requestCiv7AssignWorkerPlacement({ playerId, location }, ...)`;
- exposes `requestCiv7ExpandCityPlacement({ cityId, destination }, ...)`;
- no longer exposes generic `requestCiv7PlayerOperation` or
  `requestCiv7CityCommand` methods through the exported control-oRPC context
  facade;
- keeps raw `operationType` and operation `args` out of the procedure-facing
  dependency boundary;
- maps the semantic ports to direct-control `requestCiv7PlayerOperation` and
  `requestCiv7CityCommand` only inside the live facade adapter.

`@civ7/direct-control` remains the low-level runtime authority for the actual
player-operation/city-command execution, validators, command serialization,
postcondition classification, and proof/no-repeat facts.

## Non-Goals

- no direct-control source change;
- no new population placement behavior or output shape;
- no generic operation catalog, operations router, direct-control procedure
  core, or raw operation input surface;
- no CLI, Studio, bridge, transport, OpenAPI, or UIScript work;
- no shared validator/postcondition middleware promotion;
- no runtime/live-game proof claim;
- no Task 5.x/6.x parent acceptance.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test test/city-population-placement-procedure.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- `git diff --check`

These are local package proofs only.

## Residual Risk

Direct-control still exposes generic player/city operation functions for
legacy CLI/debug callers. This slice only retires those generic ports from
control-oRPC context construction. Broader CLI/debug operation-catalog
retirement remains separate work.
