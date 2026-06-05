# Raw Root Type Export Burn-Down Slice

Status: implemented local package/API hygiene slice.
Date: 2026-06-05.

## Purpose

Keep `@civ7/control-orpc`'s caller-facing root entrypoint aligned with the
native service-owner direction by removing public exports of direct-control
runtime-port result aliases.

The service package still needs a typed direct-control facade in context so
CLI, Studio, and controller adapters can construct the native oRPC context.
That facade is a dependency boundary. The raw result envelopes flowing through
that dependency are not caller-facing service output and should not be
advertised as package root API.

## Write Set

- `packages/civ7-control-orpc/src/index.ts`
- `apps/mapgen-studio/test/runInGame/civ7ControlOrpcClient.test.ts`
- this OpenSpec record, `tasks.md`, and `specs/civ7-control-orpc/spec.md`

## Behavior Boundary

This slice removes root exports for raw direct-control runtime result aliases:

- playable status;
- play notification view;
- ready-unit and ready-city view;
- turn completion status;
- production choice;
- notification dismissal;
- unit target action.

The root entrypoint continues to export semantic control-oRPC contracts,
routers, procedure schemas/results, bridge ingress/bindings, tagged errors,
server-side clients, `Civ7ControlOrpcContext`,
`Civ7ControlOrpcDirectControlFacade`, and
`liveCiv7ControlOrpcDirectControlFacade`.

The Studio RPCLink test now imports its fake runtime playable-status fixture
type from `@civ7/direct-control`, the package that owns that low-level shape,
instead of from the control-oRPC root.

## Non-Goals

- no changes to procedure contracts or normal outputs;
- no changes to direct-control runtime/proof authority;
- no removal of the context facade type needed by edge adapters;
- no transport, CLI, Studio behavior, controller bridge, or runtime proof
  change;
- no broad package export redesign;
- no Task 5.x/6.x/7.x parent acceptance.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun test apps/mapgen-studio/test/runInGame/civ7ControlOrpcClient.test.ts`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- public root-export scan for `Civ7ControlOrpc*Result` runtime-port aliases
- `git diff --check`

These are local package/API and OpenSpec proofs only.

## Residual Risk

`packages/civ7-control-orpc/src/dependencies/direct-control.ts` still contains
runtime-port result aliases because service procedures and package-local tests
need typed fake port results. That is intentional internal dependency typing,
not root caller-facing API. A broader dependency module split can happen later
if repeated runtime-port typing becomes hard to review.
