# Raw Root Type Export Burn-Down Slice

Status: implemented local package/API hygiene slice; extended by the procedure
surface pruning follow-up.
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

Initial raw runtime-port export burn-down:

- `packages/civ7-control-orpc/src/index.ts`
- `apps/mapgen-studio/test/runInGame/civ7ControlOrpcClient.test.ts`
- this OpenSpec record, `tasks.md`, and `specs/civ7-control-orpc/spec.md`

Procedure surface pruning follow-up:

- `packages/civ7-control-orpc/src/index.ts`
- `packages/civ7-control-orpc/test/turn-completion-procedure.test.ts`
- `packages/cli/src/commands/game/map.ts`
- `packages/cli/src/commands/game/play/civilian-route-triage.ts`
- `packages/cli/src/commands/game/play/formation-snapshot.ts`
- `packages/cli/src/commands/game/play/front-summary.ts`
- `packages/cli/src/commands/game/play/notification-queue.ts`
- `packages/cli/src/commands/game/play/priorities.ts`
- `packages/cli/src/commands/game/play/progress-dashboard.ts`
- `packages/cli/src/commands/game/play/traditions.ts`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- this OpenSpec record

## Behavior Boundary

The first slice removed root exports for raw direct-control runtime result
aliases:

- playable status;
- play notification view;
- ready-unit and ready-city view;
- turn completion status;
- production choice;
- notification dismissal;
- unit target action.

The follow-up slice removes package-root exports of module-level contracts,
routers, procedure implementations, and per-procedure input/result DTO aliases.
The caller-facing service surface is now the aggregate
`Civ7ControlOrpcContract`, aggregate `Civ7ControlOrpcRouter`, server-side
client factory, typed context, tagged errors, primitives, and serialized
controller bridge envelope schemas/types. Contract-local schemas remain inside
their contract modules; callers that need local view types derive them from the
typed client method they are calling.

Follow-up stack work moved `Civ7ControlOrpcDirectControlFacade` and
`liveCiv7ControlOrpcDirectControlFacade` behind the explicit
`@civ7/control-orpc/runtime` entrypoint for edge-adapter context construction.

The Studio RPCLink test now imports its fake runtime playable-status fixture
type from `@civ7/direct-control`, the package that owns that low-level shape,
instead of from the control-oRPC root.

## Non-Goals

- no changes to procedure contracts or normal outputs;
- no changes to direct-control runtime/proof authority;
- no removal of the context facade type needed by edge adapters;
- no transport, CLI, Studio behavior, controller bridge, or runtime proof
  change;
- no direct import/export of per-procedure input/result schemas from the package
  root;
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

Additional proof collected for the procedure surface pruning follow-up:

- `bun run --cwd packages/cli test -- game/play/priorities.test.ts game.play.progression-read.test.ts game.play.tactical-read.test.ts`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run check:cli`
- root export scan showing no module-level contracts, routers, procedure
  implementations, per-procedure input/result DTO aliases, or
  `Civ7WorldPlotField` exported from `packages/civ7-control-orpc/src/index.ts`
- CLI import scan showing root consumers use the aggregate client/router/context
  surface and derive procedure result/view helper types locally
- `bun run openspec validate civ7-control-orpc-native-slice --strict`
- `git diff --check`

## Residual Risk

`packages/civ7-control-orpc/src/dependencies/direct-control.ts` still contains
runtime-port result aliases because service procedures and package-local tests
need typed fake port results. That is intentional internal dependency typing,
not root caller-facing API. A broader dependency module split can happen later
if repeated runtime-port typing becomes hard to review.
