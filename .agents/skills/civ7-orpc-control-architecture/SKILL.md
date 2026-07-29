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

General oRPC semantics and current vendor guidance are owned by the global
`dev:orpc` skill. When an Effect computation crosses the procedure boundary,
the provider bridge is owned by global `dev:effect-orpc` together with the
matching `dev:effect-ts` lane. This skill is the Civ7 overlay: package
ownership, control topology, caller boundaries, live-play safety, and proof
classification. Do not duplicate generic vendor guidance here.

This layer is IMPLEMENTED: `@civ7/control-orpc`
(`services/civ7-control`) is the closed native oRPC+Effect service over
direct-control atoms. Its public source root is only `client.ts`,
`contract.ts`, `index.ts`, and the private `service/` tree. The service owns
contract-first TypeBox schemas (`toStandardSchema`), the sole
`effect-orpc` implementer/runtime lineage, Effect router leaves, typed errors,
admission, and shared mutation policy. New control surfaces extend this
service; do not start a parallel oRPC layer or hand-roll orchestration in
plain async.

## When To Use

- Designing an oRPC contract, router, procedure, handler, or server-side client
  for Civ7 runtime control.
- Refactoring CLI game/play commands or Studio Civ7 endpoints toward shared
  procedures with the right caller boundary.
- Moving verification, admission, controller capability/proof,
  relationship-label policy, readiness, or proof boundaries into typed
  middleware/context.
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

1. **Ground authority.** Read root `AGENTS.md`, the closest package router,
   global `dev:orpc`, and the Civ7 architecture/product authority skills. For
   an Effect-backed procedure, also load global `dev:effect-orpc` and the
   matching `dev:effect-ts` lane after identifying the installed package tuple.
2. **Name the capability.** Identify the repo-owned behavior: runtime read,
   mutating operation, live-play decision view, Studio endpoint, or CLI command
   orchestration.
3. **Choose the procedure atom.** Procedures should be the smallest complete
   behavior with a stable input, output, risk level, and proof boundary.
4. **Place context.** Provision the direct-control port and, when required, the
   setup lifecycle port through `Civ7ControlOrpcContext`. Keep endpoint
   defaults, whole-procedure admission, lifecycle progress, correlation,
   controller capabilities/proof, and test doubles in their existing context
   fields rather than globals.
5. **Place middleware.** Reuse the installed root correlation, controller
   admission, and host procedure-admission stages. Mutating router leaves use
   the shared readiness and proof-boundary composition when their output
   carries that contract. Add new shared policy only after more than one
   procedure has earned it.
6. **Compose routers by operational surface.** Extend the existing
   `src/service/modules/*` families (`attention`, `city`, `diplomacy`,
   `display`, `government`, `lifecycle`, `narrative`, `notifications`,
   `progression`, `readiness`, `strategy`, `turn`, `unit`, `view`, `world`)
   over broad `control.call` routers. A family is
   `contract/` + `router/` + `module.ts`: contract leaves author protocol,
   router leaves author Effect behavior, and `module.ts` selects the configured
   service branch.
7. **Choose the caller boundary deliberately.** CLI/tests use the in-process
   typed client, provisioning the `directControl` port with
   `liveCiv7DirectControl` from `@civ7/direct-control/live`. Setup lifecycles
   also provision `directLifecycle` with `liveCiv7LifecycleControl`. There is
   no `@civ7/control-orpc/runtime` provider surface. Studio browser clients
   should call the same router over HTTP through `RPCHandler`/`RPCLink`; Studio
   server code may call in-process when no browser boundary is crossed. OpenAPI
   remains for external/documented consumers, not the Civ7 Studio control
   loop.
8. **Verify in layers.** Run no-network service behavior tests, CLI/Studio
   integration tests for changed callers, direct-control checks/builds, and
   live read-only smoke when a claim depends on the running game.

## Reference Map

| Reference | Path | Open When |
|---|---|---|
| Global oRPC authority | `dev:orpc` | Always, before interpreting or changing native oRPC contracts, routers, middleware, context, transports, clients, or tests. |
| Global Effect-oRPC authority | `dev:effect-orpc` + `dev:effect-ts` | An Effect computation crosses an oRPC procedure boundary; select the exact installed provider and Effect lane. |
| Civ7 oRPC integration boundary | `references/orpc-server-shape.md` | You need the repo-specific package wiring and caller boundary after loading the applicable global authority. |
| Civ7 procedure map | `references/civ7-procedure-map.md` | You are mapping direct-control/CLI/Studio behavior into procedure/router/context/middleware atoms. |
| Migration gates | `references/migration-gates.md` | You are planning an incremental slice or deciding what tests/proof must pass before handoff. |
| Failure patterns | `references/failure-patterns.md` | A proposed oRPC refactor smells like a wrapper, broad transport, unsafe mutation, or relationship-authority leak. |

## Asset Map

| Asset | Path | Use When |
|---|---|---|
| Procedure slice preflight | `assets/procedure-slice-preflight.md` | Copy into a project/spec note before implementing an ORPC control slice. |

## Core Invariants

<invariants>
<invariant name="direct-control-owns-runtime">`@civ7/direct-control` owns low-level tuner/socket framing, state discovery, reconnect behavior, command serialization, runtime reads, and live provider bundles. Its functions stay plain-async WIRE ATOMS (ideally one exec each).</invariant>
<invariant name="control-service-owns-public-behavior">`@civ7/control-orpc` owns the public control contract, router, context ports, admission, mutation policy, and multi-step service behavior. A service procedure must offer behavior or composition, not merely rename one direct-control call.</invariant>
<invariant name="orchestration-lives-in-effect-layer">Multi-step async flows over the atoms (state machines, drain/poll loops, suspend/resume lifecycles, retries, schedules) are Effect procedures in `@civ7/control-orpc` — use `Effect.acquireUseRelease`/`Effect.ensuring` for guaranteed cleanup and `Effect.iterate`/`Schedule` for loops, never hand-rolled try/finally orchestrators inside direct-control (live lesson: D10, cli-command-taxonomy workstream).</invariant>
<invariant name="orpc-is-procedure-composition">oRPC organizes typed procedures, routers, context, middleware, and optional edge handlers. It does not redefine Civ7 runtime truth.</invariant>
<invariant name="shared-core-caller-boundary">Design the shared procedure/router core first. CLI and tests can call it in-process; Studio browser clients cross the web boundary with RPC over HTTP (`RPCHandler`/`RPCLink`).</invariant>
<invariant name="middleware-guards-mutations">Mutation policy stays explicit: honor host admission where configured and require controller capability/proof for controller-backed calls; compose shared runtime-readiness and proof-boundary policy when the output contract supports it, otherwise the specialized service behavior owns equivalent guards and proof.</invariant>
<invariant name="context-not-globals">Provision runtime dependencies through typed context. Do not smuggle endpoint/session/admission/correlation/controller state through globals or ad hoc command flags inside handlers.</invariant>
<invariant name="relationship-authority-is-structural">Owner mismatch, contact, proximity, or attack legality is not hostile/enemy/opponent/threat/non-friendly proof without official relationship, team, war, suzerain, or equivalent validator evidence.</invariant>
<invariant name="proof-boundaries-stay-labeled">Unit tests, oRPC procedure calls, handler tests, CLI tests, package builds, and live game smoke prove different things. Close claims with the strongest evidence actually collected.</invariant>
</invariants>

## Quick Start

1. Load global `dev:orpc`; for an Effect-backed procedure, also load
   `dev:effect-orpc` and the matching `dev:effect-ts` lane.
2. Open `references/orpc-server-shape.md` for Civ7-specific integration facts.
3. Open `references/civ7-procedure-map.md` for the affected surface.
4. Copy `assets/procedure-slice-preflight.md` into the project note if the slice
   will be implemented.
5. Run `references/migration-gates.md` before handoff.
6. Check `references/failure-patterns.md` during review.
