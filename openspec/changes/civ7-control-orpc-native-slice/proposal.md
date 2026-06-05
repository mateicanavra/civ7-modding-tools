## Why

The support stack has enough direct-control atom and descriptor evidence to
prepare Effect/oRPC composition, but the next step must not become a
direct-control-local reimplementation of router, context, middleware, typed
errors, or correlation plumbing.

Official oRPC owns those mechanics: procedures carry input/output validation,
middleware, dependency injection, and handlers; routers are nested procedure
objects; context and middleware are first-class oRPC composition points; and
server-side callers can invoke procedures in process through supported oRPC
call/client helpers. `effect-orpc` is an ecosystem integration over those
primitives, not a license to create parallel direct-control wiring.

This change records the staged native control-oRPC slice so future
implementation work can separate Civ7 product logic into policies,
dependencies, repositories/read ports, middleware candidates, contracts, and
procedure modules before adding transport edges.

## Target Authority Refs

- Official oRPC docs checked on 2026-06-04:
  - `https://orpc.dev/docs/procedure`
  - `https://orpc.dev/docs/router`
  - `https://orpc.dev/docs/context`
  - `https://orpc.dev/docs/middleware`
  - `https://orpc.dev/docs/contract-first/define-contract`
  - `https://orpc.dev/docs/client/server-side`
  - `https://orpc.dev/docs/advanced/testing-mocking`
  - `https://orpc.dev/docs/ecosystem`
- `.agents/skills/civ7-orpc-control-architecture/SKILL.md`
- `.agents/skills/civ7-orpc-control-architecture/references/orpc-server-shape.md`
- `.agents/skills/civ7-orpc-control-architecture/references/civ7-procedure-map.md`
- `.agents/skills/civ7-orpc-control-architecture/references/migration-gates.md`
- `openspec/changes/civ7-support-direct-control-modularization/`
- Older implementation evidence to mine, not merge wholesale:
  - `d3d49b48f:packages/civ7-direct-control/src/orpc/**`
  - `d3d49b48f:packages/civ7-direct-control/test/orpc.test.ts`
  - `87f2d9c4e:docs/projects/civ7-direct-control/workstream/orpc-control-alignment-packet.md`

## What Changes

- Define a target `packages/civ7-control-orpc` shape that uses oRPC/effect-orpc
  for contracts, routers, context, middleware, typed errors, and server-side
  clients.
- Classify direct-control prework as atom/policy/dependency/repository/proof
  separation only, not framework wiring.
- Rebaseline the staged implementation gates: modularize real behavior and
  write-capable flows first, reorganize the semantic capability hierarchy for
  Sieve/future consumers, layer policies/dependencies/read ports, compose
  native oRPC/effect-orpc routers after ownership is real, then add edge
  adapters last.
- Preserve the controller architecture: the in-game controller is an
  in-process Effect/oRPC router loaded by Civ7 `scope="game"` `UIScripts`;
  `globalThis.Civ7IntelligenceBridge.invoke(...)` is serialized ingress only.

## Requires

- Stable direct-control runtime ports and adjacent schema/proof owners.
- Direct-control proof vocabulary for validator-first sends,
  postconditions, no-repeat-after-unverified, relationship authority, and
  runtime proof labels.
- A schema-technology decision or explicit adapter plan for TypeBox and
  Effect Schema before broad router implementation.

## Enables Parallel Work

- Modularizing real write-capable behavior and adjacent proof/policy owners
  so native service procedures can own behavior instead of wrapping facade
  leaves.
- Reorganizing the semantic capability hierarchy expected by Sieve and future
  player-agent consumers.
- Layering policies, dependencies, repositories/read ports, and middleware
  candidates only where that clarifies native oRPC/effect-orpc composition.
- Composing service-owned contracts, routers, context, middleware, and
  handlers in `packages/civ7-control-orpc` over low-level direct-control
  runtime ports.
- Controller bridge and later RPC/OpenAPI edge adapters.

## Affected Owners

- Future `packages/civ7-control-orpc/**`
- `packages/civ7-direct-control/**` only for runtime-port, policy, schema,
  and proof owners
- `packages/cli/**` only when a caller is deliberately routed through the
  shared procedure client
- Future in-game controller UIScript bridge and Studio server RPC edges
- OpenSpec workstream records

## Forbidden Owners

- Direct-control-local middleware composition engines, context composers,
  error/correlation buses, RPC handlers, or router registries that duplicate
  oRPC/effect-orpc behavior.
- `control.call`, raw JavaScript execution, raw command text, socket/session
  controls, or App UI bridge payloads as normal product procedures.
- Transport-first Studio, OpenAPI, HTTP, WebSocket, or global bridge work
  before the in-process router and server-side caller proof exists.

## Stop Conditions

- A slice starts adding direct-control-local framework wiring instead of naming
  policy/dependency boundaries for future oRPC middleware/context.
- A procedure surface requires endpoint/session/state/raw command fields in
  normal input instead of context/debug/internal ownership.
- A mutation procedure cannot preserve validator-first,
  postcondition, and no-repeat-after-unverified semantics through typed
  middleware/proof records.
- The implementation cannot test procedures in-process with oRPC-supported
  call/client helpers before adding transport edges.

## Consumer Impact

CLI, Studio, in-game controller, and future AI callers get one native
service-owned procedure/router surface once behavior, policies, dependencies,
and proof owners have been layered into the oRPC/effect-orpc shape. The normal
player-agent surface stays semantic; raw proof/debug/session details remain
behind intentional debug/internal/telemetry projections.

## Verification Gates

- `openspec validate civ7-control-orpc-native-slice --strict`.
- No-network oRPC/effect-orpc procedure tests with context fakes before
  transport work.
- Direct-control package tests/check/build when atom or facade exports change.
- CLI play tests/check when a CLI caller is routed through procedures.
- Runtime/live proof only for runtime claims, never from local procedure tests
  alone.
