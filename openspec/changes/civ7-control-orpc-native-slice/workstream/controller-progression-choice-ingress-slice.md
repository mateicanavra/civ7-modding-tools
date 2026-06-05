# Controller Progression Choice Ingress Slice

Status: implemented package-local controller ingress allowlist slice.
Date: 2026-06-05.

## Purpose

Allowlist the existing service-owned progression choice mutations through the
package-local serialized controller ingress:

- `progression.technology.choice.request`
- `progression.culture.choice.request`

This follows the local-player evidence repair that binds progression closeout
request/output identity to the before-notification read's `localPlayerId`.

## Write Set

- `packages/civ7-control-orpc/src/bridge/controller-ingress.ts`
- `packages/civ7-control-orpc/test/controller-bridge-ingress.test.ts`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- `openspec/changes/civ7-control-orpc-native-slice/specs/civ7-control-orpc/spec.md`
- this workstream record

## Behavior Boundary

- accepts `progression.technology.choice.request` and
  `progression.culture.choice.request` as additional allowlisted mutations;
- validates the existing semantic progression input shape: `playerId`, `node`,
  and optional `notificationId`;
- requires the closed controller approval envelope plus game-controller-ready
  lifecycle evidence, `GameContext.localPlayerID` local-player evidence, and
  single-local-player/hotseat status;
- constructs context through the caller-owned factory and invokes the existing
  in-process control-oRPC router/client;
- preserves progression service behavior: approval/readiness middleware,
  before/after notification reads, local-player evidence binding, direct-control
  closeout runtime ports, postcondition projection, and no-repeat next steps;
- keeps controller approval reason as request metadata and does not echo it in
  success/failure output.

## Raw Surface Exclusions

Bridge request/response shapes stay closed against raw host, port, state,
session, command, rawCommand, payload, direct-control closeout internals, App UI
runtime details, and legacy `verified` fields.

## Non-Goals

- no generic bridge dispatcher or mutation runner;
- no direct-control procedure-core scaffolding;
- no CLI, Studio, RPCLink, OpenAPI, or external transport change;
- no UIScript/modinfo packaging or global runtime installation;
- no runtime/live-game proof claim;
- no play-thread action;
- no full `7.3` acceptance.

## Proof Collected

- `bun run --cwd packages/civ7-control-orpc test test/controller-bridge-ingress.test.ts test/progression-choice-procedure.test.ts`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- `git diff --check`

These are local package and OpenSpec proofs only. Civ7 UIScript/modinfo
packaging, live runtime proof, play-thread action, additional mutation
allowlists, and parent `7.3` acceptance remain pending.
