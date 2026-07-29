# Civ7 Procedure Map

## Owning Boundaries

- `@civ7/direct-control` owns low-level Civ7 runtime access: tuner/App UI state
  selection, socket framing, reconnect behavior, command serialization,
  runtime reads, and live provider bundles. Keep its functions wire ATOMS
  (ideally one exec each, plain async, dependency-injected for tests).
- `@civ7/control-orpc` (`services/civ7-control`) owns the public control-service
  contract, router, context ports, typed errors, admission, mutation policy,
  and multi-step Effect behavior over those atoms. It is a closed service, not
  a provider host or a second runtime transport.
- Callers provision the service's `directControl` port from
  `liveCiv7DirectControl` in `@civ7/direct-control/live`. Setup/start callers
  additionally provision the optional `directLifecycle` port from
  `liveCiv7LifecycleControl`. `@civ7/control-orpc/runtime` was deleted; do not
  recreate or import it.
- CLI owns command names, flags, examples, compact/full output, and shell-facing
  adaptation. Its canonical adapter
  (`plugins/cli/topics/game/src/adapters/control/service-client.ts`) creates the
  in-process `createCiv7ControlOrpcServerClient` with the live direct-control
  port. Commands must not import orchestration from direct-control or hand-roll
  fetch/exec flows.
- Studio/app endpoints own app-specific routing and presentation, but should
  consume the same shared procedure router instead of growing parallel Civ7
  control routers. Browser clients should reach that router through a server
  HTTP `RPCHandler` and client `RPCLink`; Studio server-side code may use
  in-process calls when no browser boundary is involved.

## Procedure Families

These module families exist under
`services/civ7-control/src/service/modules/`. Each family has `contract/`,
`router/`, and `module.ts`: `contract/index.ts` composes direct semantic
contract leaves, `router/index.ts` composes direct semantic Effect router
leaves, and `module.ts` selects the matching branch of the configured service.
Extend that shape or mirror it for a new family.

| Module | Covers | Notes |
|---|---|---|
| `readiness` | direct-control/tuner/playable readiness | Read-only diagnostics. |
| `world` | world/grid/current reads | Bound inputs to avoid accidental huge reads. |
| `display` | `display.queue.current`, `display.queue.close`, `display.explore.request` | DisplayQueueManager substrate; explore is the reference Effect orchestration (acquire/release suspend→grant→drain→resume→release). |
| `view` | camera focus and appshot capture | Host-visible view behavior with explicit readback/capture proof. |
| `lifecycle` | `lifecycle.singlePlayer.start` | Setup/start orchestration; requires the optional direct-lifecycle port. |
| `notifications` | read/dismiss flows | Separate exact closeout, bulk scheduling, and popup closeout. |
| `attention` | attention priorities | Read-only planning evidence. |
| `city` | production, population, town focus, expansion | Keep validators and postconditions close to the procedure. |
| `unit` | unit commands/targets/operations | Relationship labels remain neutral unless official proof exists. |
| `diplomacy` | diplomacy/first-meet responses | Mutations need proof classification. |
| `government` / `narrative` / `progression` | choice surfaces | Choice sends need postcondition classification; options are read-only. |
| `strategy` | fronts, priorities, dashboards | Read-only planning evidence; never mutation authority. |
| `turn` | turn flow | High-risk; explicit policy context. |

Procedure keys are dot-paths (`display.explore.request`), each with meta
(`family`, risk class) and entries in the shared error map
(`civ7ControlOrpcErrorMap` in
`src/service/model/errors/control.ts` — typed `ORPCTaggedError` classes with
TypeBox data schemas carrying
`{procedureKey, source, correlationId?}`).

## Context Shape

The implemented context (`Civ7ControlOrpcContext` in
`src/service/model/ports/context.ts`, aggregated by
`src/service/context.ts`) requires the direct-control port. It can also carry
the direct-lifecycle port, endpoint defaults, host-owned whole-procedure
admission, lifecycle progress, correlation, controller-supported procedure
sets, and controller mutation proof. Procedures normally read
`context.directControl`, `context.endpointDefaults`, and the correlation helper.

`createCiv7ControlOrpcServerClient` accepts a complete service context or a
context factory. The factory receives the per-call correlation context, so a
host can construct fresh procedure context for each invocation.

Do not require HTTP headers, cookies, or framework request objects for the core
procedure context or in-process CLI/test calls. Add request-specific values only
in edge handlers, including the Studio `RPCHandler` bridge when the browser
client calls through `RPCLink`.

## Middleware

The configured service in `src/service/impl.ts` installs correlation,
controller admission, and optional host whole-procedure admission before the
root router is realized. Public errors come from the contract-declared
`ORPCTaggedError` map; do not add a parallel catch-all error translation layer.

Implemented in `src/service/middleware/`: the shared
`civ7ControlOrpcMutationProcedure` composition applies runtime readiness and
proof-boundary validation to mutation contracts whose output carries the
required postcondition shape. Controller admission also requires declared
controller support and controller proof for controller-backed mutations.

Still-candidate policy for future middleware: finer surface-specific readiness,
validator-first dry runs, relationship-label authority (blocks
hostile/enemy/opponent/threat labels without official
relationship/team/war/suzerain evidence), and evidence sinks.

## Atomicity Rule

A procedure atom is complete when it has stable input, stable output,
risk/admission policy, proof boundary, and tests. If a procedure requires
callers to remember a hidden preflight or postcondition step, the atom is too
small or the middleware composition is incomplete. Conversely, a service
router leaf that only delegates input to one direct-control method offers no
service behavior; keep that call in the low-level port until the service owns a
complete capability around it.
