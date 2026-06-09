# Studio RPCLink Edge Adapter Slice

Status: implemented local source slice.
Date: 2026-06-05.

## Purpose

Add the first Studio browser/server edge over the shared
`packages/civ7-control-orpc` router using native oRPC HTTP primitives after the
router has service-owned readiness, attention, mutation,  readiness,
safe-error, and correlation policy proof.

This advances the edge-adapter lane without adding OpenAPI, external REST,
Studio-specific service logic, or caller-local direct-control scripts. Studio
remains the runtime adapter that constructs context; `readiness.current`
remains the service-owned procedure.

## Write Set

- `apps/mapgen-studio/package.json`
- `apps/mapgen-studio/src/features/runInGame/civ7ControlOrpcClient.ts`
- `apps/mapgen-studio/src/server/civ7ControlOrpc.ts`
- `apps/mapgen-studio/src/shared/civ7ControlOrpc.ts`
- `apps/mapgen-studio/src/App.tsx`
- `apps/mapgen-studio/vite.config.ts`
- `apps/mapgen-studio/test/runInGame/civ7ControlOrpcClient.test.ts`
- `packages/civ7-direct-control/src/proof/log-markers.ts`
- `packages/civ7-direct-control/src/index.ts`
- `bun.lock`
- `openspec/changes/civ7-control-orpc-native-slice/tasks.md`
- this workstream note

## Behavior Boundary

Studio now:

- mounts `Civ7ControlOrpcRouter` behind Vite's Node middleware with native
  `@orpc/server/node` `RPCHandler`;
- constructs `Civ7ControlOrpcContext` at the Studio edge with the live
  direct-control facade and timeout defaults;
- exposes a browser `RPCLink` client pointed at the Studio Civ7 RPC prefix;
- routes the live footer readiness member through
  `client.readiness.current({})`;
- preserves the existing `/api/civ7/live/status` REST aggregate for map
  summary and autoplay fields in this slice.

The normal browser readiness value is the semantic `readiness.current`
projection. Endpoint host/port, Tuner/App UI state names, raw snapshots,
session controls, and raw command payloads remain outside procedure input and
normal browser output. If the RPC readiness call fails, the footer uses the
existing live-status error path instead of silently falling back to the old
REST readiness member.

The slice also makes `logTextFromSnapshot` part of the direct-control public
log-marker surface because the Studio Vite server already depends on that
fresh-log slicing helper during run-in-game proof collection. This is a package
surface repair for the existing Studio build path, not a new runtime/log proof
claim.

## Non-Goals

- no direct-control procedure-core, custom RPC protocol handler, custom
  `RPCLink`, custom middleware/correlation wrapper, or caller-local control
  script;
- no Studio migration for map summary, autoplay, setup/run operations, save
  operations, or mutation flows;
- no OpenAPI/external REST, RPCLink outside Studio, global bridge, or in-game
  controller ingress;
- no runtime/live-game proof claim, play-thread action, or Task 5.x/6.x parent
  acceptance by implication.

## Proof

Focused Studio proof covers:

- browser `RPCLink` can call `readiness.current` through the native Node
  `RPCHandler` using fake direct-control context;
- the Studio adapter supplies endpoint defaults through context, not procedure
  input;
- the semantic readiness result omits host, port, state, App UI/Tuner names,
  and raw runtime detail;
- non-RPC paths pass through to later Studio middleware.

Closure gates run:

- `bun run --cwd apps/mapgen-studio test test/runInGame/civ7ControlOrpcClient.test.ts`
- `bun run --cwd apps/mapgen-studio test`
- `bun run --cwd apps/mapgen-studio check`
- `bun run --cwd apps/mapgen-studio build`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- `git diff --check`

## Residual Risk

This is local Studio/package proof only. It proves native oRPC HTTP edge
composition and one browser readiness caller, not live Civ7 runtime readiness,
the full Studio REST surface migration, in-game bridge ingress, OpenAPI,
external transport, or mutation caller routing.
