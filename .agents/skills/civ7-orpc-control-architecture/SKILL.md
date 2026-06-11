---
name: civ7-orpc-control-architecture
description: |
  Use in the Civ7 Modding Tools repo before designing, refactoring, or reviewing oRPC/ORPC surfaces for Civ7 direct-control, CLI game/play commands, Studio Civ7 endpoints, tuner control procedures, in-process procedure routing, context/middleware policy, OpenAPI/RPC exposure, or contract-first control APIs. Trigger phrases include "ORPC direct-control", "oRPC game command", "direct-control router", "procedure map for Civ7 control", "Civ7 control API", "middleware for verification", and "context for Civ7 runtime".
---

# Civ7 ORPC Control Architecture

## Purpose

Use this skill before adding or reshaping oRPC surfaces for Civ7 play/control
support. The frame is: oRPC is a typed procedure/router/context layer over
repo-owned control capabilities; it is not the authority for Civ7 runtime
behavior and it is not a replacement transport for `@civ7/direct-control`.

This layer is IMPLEMENTED: `@civ7/control-orpc`
(`packages/civ7-control-orpc`) is the native oRPC+Effect procedure
composition over direct-control atoms — contract-first TypeBox schemas
(`toStandardSchema`), `effect-orpc`'s `implementEffect` with a shared
`ManagedRuntime`, procedures written as Effect generators, a typed error map,
and correlation/safe-error middleware. New control surfaces extend that
package; do not start a parallel oRPC layer or hand-roll orchestration in
plain async.

## When To Use

- Designing an oRPC contract, router, procedure, handler, or server-side client
  for Civ7 runtime control.
- Refactoring CLI game/play commands or Studio Civ7 endpoints toward shared
  procedures with the right caller boundary.
- Moving verification, approval, relationship-label policy, readiness, or proof
  boundaries into typed middleware/context.
- Reviewing whether a proposed ORPC slice preserves direct-control package
  ownership and active live-play safety.

## Non-Goals

- Do not expose arbitrary `game exec` JavaScript as an oRPC procedure.
- Do not move raw tuner socket framing, reconnect polling, App UI/Tuner state
  discovery, or generated command strings into caller-local code.
- Do not make HTTP/OpenAPI shape the product authority. Transports mount at the
  edge after the shared procedure/router core is coherent.
- Do not treat oRPC tests, TypeScript checks, or generated schemas as in-game
  proof.

## Default Workflow

1. **Ground authority.** Read root `AGENTS.md`, the closest package router, and
   the Civ7 architecture/product authority skills.
2. **Name the capability.** Identify the repo-owned behavior: runtime read,
   mutating operation, live-play decision view, Studio endpoint, or CLI command
   orchestration.
3. **Choose the procedure atom.** Procedures should be the smallest complete
   behavior with a stable input, output, risk level, and proof boundary.
4. **Place context.** Put dependencies in context: direct-control facade,
   endpoint defaults, timeout, logger/proof sink, clock, approval policy, live
   session policy, and test doubles.
5. **Place middleware.** Use middleware for reusable policy: readiness,
   approval, validator-first mutation gates, proof recording, relationship-label
   authority, error normalization, bounded polling, and live-mutation guards.
6. **Compose routers by operational surface.** Extend the existing
   `src/modules/*` families (`attention`, `city`, `diplomacy`, `display`,
   `government`, `narrative`, `notifications`, `progression`, `readiness`,
   `strategy`, `turn`, `unit`, `world`, ...) over broad `control.call`
   routers; a new family mirrors the module template
   (`contract.ts` + `router.ts` + `procedures/`).
7. **Choose the caller boundary deliberately.** CLI/tests use the in-process
   typed client: `createCiv7ControlOrpcServerClient({ directControl:
   liveCiv7ControlOrpcDirectControlFacade, endpointDefaults })` (live facade
   from `@civ7/control-orpc/runtime`). Studio browser clients should call
   the same router over HTTP through `RPCHandler`/`RPCLink`; Studio server
   code may call in-process when no browser boundary is crossed. OpenAPI
   remains for external/documented consumers, not the Civ7 Studio control
   loop.
8. **Verify in layers.** Run no-network procedure tests, CLI/Studio integration
   tests for changed callers, direct-control checks/builds, and live read-only
   smoke when a claim depends on the running game.

## Reference Map

| Reference | Path | Open When |
|---|---|---|
| ORPC server shape | `references/orpc-server-shape.md` | You need the exact official oRPC concepts to apply: procedure, router, middleware, context, server-side calls, tests. |
| Civ7 procedure map | `references/civ7-procedure-map.md` | You are mapping direct-control/CLI/Studio behavior into procedure/router/context/middleware atoms. |
| Migration gates | `references/migration-gates.md` | You are planning an incremental slice or deciding what tests/proof must pass before handoff. |
| Failure patterns | `references/failure-patterns.md` | A proposed oRPC refactor smells like a wrapper, broad transport, unsafe mutation, or relationship-authority leak. |

## Asset Map

| Asset | Path | Use When |
|---|---|---|
| Procedure slice preflight | `assets/procedure-slice-preflight.md` | Copy into a project/spec note before implementing an ORPC control slice. |

## Core Invariants

<invariants>
<invariant name="direct-control-owns-runtime">`@civ7/direct-control` owns tuner socket framing, state discovery, reconnect polling, runtime wrappers, approval enforcement, and capability catalog evidence. Its functions stay plain-async WIRE ATOMS (ideally one exec each).</invariant>
<invariant name="orchestration-lives-in-effect-layer">Multi-step async flows over the atoms (state machines, drain/poll loops, suspend/resume lifecycles, retries, schedules) are Effect procedures in `@civ7/control-orpc` — use `Effect.acquireUseRelease`/`Effect.ensuring` for guaranteed cleanup and `Effect.iterate`/`Schedule` for loops, never hand-rolled try/finally orchestrators inside direct-control (live lesson: D10, cli-command-taxonomy workstream).</invariant>
<invariant name="orpc-is-procedure-composition">oRPC organizes typed procedures, routers, context, middleware, and optional edge handlers. It does not redefine Civ7 runtime truth.</invariant>
<invariant name="shared-core-caller-boundary">Design the shared procedure/router core first. CLI and tests can call it in-process; Studio browser clients cross the web boundary with RPC over HTTP (`RPCHandler`/`RPCLink`).</invariant>
<invariant name="middleware-guards-mutations">Mutating procedures require explicit approval, validator evidence where available, and postcondition/proof classification through shared middleware or shared procedure helpers.</invariant>
<invariant name="context-not-globals">Provision runtime dependencies through typed context. Do not smuggle host/port/session/approval/logger state through globals or ad hoc command flags inside handlers.</invariant>
<invariant name="relationship-authority-is-structural">Owner mismatch, contact, proximity, or attack legality is not hostile/enemy/opponent/threat/non-friendly proof without official relationship, team, war, suzerain, or equivalent validator evidence.</invariant>
<invariant name="proof-boundaries-stay-labeled">Unit tests, oRPC procedure calls, handler tests, CLI tests, package builds, and live game smoke prove different things. Close claims with the strongest evidence actually collected.</invariant>
</invariants>

## Quick Start

1. Open `references/orpc-server-shape.md`.
2. Open `references/civ7-procedure-map.md` for the affected surface.
3. Copy `assets/procedure-slice-preflight.md` into the project note if the slice
   will be implemented.
4. Run `references/migration-gates.md` before handoff.
5. Check `references/failure-patterns.md` during review.
