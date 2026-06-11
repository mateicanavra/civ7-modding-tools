# Civ7 Procedure Map

## Owning Boundaries

- `@civ7/direct-control` owns Civ7 runtime control wrappers, tuner/App UI state
  selection, socket framing, reconnect behavior, official runtime reads, approval
  enforcement, and postcondition/proof helpers. Keep its functions wire ATOMS
  (one exec each, plain async, dependency-injected for tests).
- `@civ7/control-orpc` (`packages/civ7-control-orpc`) owns procedure
  composition AND orchestration: contracts, routers, typed errors, middleware,
  and any multi-step flow over the atoms, written as Effect procedures
  (`implementEffect` from `effect-orpc`, shared `ManagedRuntime`). The
  direct-control facade (`Civ7ControlOrpcDirectControlFacade` in
  `src/dependencies/direct-control.ts`, live implementation exported from
  `@civ7/control-orpc/runtime`) is the only path from procedures to the atoms;
  adding a facade member also requires the `src/game-ui.ts` facade to satisfy
  the type (not-supported stubs are acceptable there).
- CLI owns command names, flags, examples, compact/full output, and shell-facing
  orchestration. It consumes procedures via
  `createCiv7ControlOrpcServerClient` — it must not import orchestration from
  direct-control or hand-roll fetch/exec flows.
- Studio/app endpoints own app-specific routing and presentation, but should
  consume the same shared procedure router instead of growing parallel Civ7
  control routers. Browser clients should reach that router through a server
  HTTP `RPCHandler` and client `RPCLink`; Studio server-side code may use
  in-process calls when no browser boundary is involved.

## Procedure Families

These module families exist under `packages/civ7-control-orpc/src/modules/`
(each is `contract.ts` + `router.ts` + `procedures/`); extend them or mirror
the template for a new family.

| Module | Covers | Notes |
|---|---|---|
| `readiness` | direct-control/tuner/playable readiness | Read-only diagnostics. |
| `world` | world/grid/current reads | Bound inputs to avoid accidental huge reads. |
| `display` | `display.queue.current`, `display.queue.close`, `display.explore.request` | DisplayQueueManager substrate; explore is the reference Effect orchestration (acquire/release suspend→grant→drain→resume→release). |
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
(`civ7ControlOrpcErrorMap` in `src/errors.ts` — typed `ORPCTaggedError`
classes with TypeBox data schemas carrying
`{procedureKey, source, correlationId?}`).

## Context Shape

The implemented context (`Civ7ControlOrpcContext` in `src/context.ts`) carries
the direct-control facade, endpoint defaults
(`{ host?, port?, timeoutMs? }`), and optional correlation
(`{ correlationId? }`, validated by the correlation middleware and echoed in
error data). Procedures read it as `context.directControl`,
`context.endpointDefaults`, and `civ7ControlOrpcErrorCorrelationData(context)`.
Approval/risk policy lives in `src/policy` and procedure meta rather than
free-form context fields.

Do not require HTTP headers, cookies, or framework request objects for the core
procedure context or in-process CLI/test calls. Add request-specific values only
in edge handlers, including the Studio `RPCHandler` bridge when the browser
client calls through `RPCLink`.

## Middleware

Implemented (in `src/middleware/`): correlation-id validation and safe-error
normalization apply to every procedure; the mutation proof-boundary middleware
(`civ7ControlOrpcMutationProcedure`) is OPT-IN per procedure and requires a
`postcondition/status/nextSteps` output shape — use it when the mutation's
contract carries those fields, skip it (with meta `risk: "mutation"` still
set) when the output is a domain-specific report.

Still-candidate policy for future middleware: readiness assertions per state
surface, validator-first dry runs, relationship-label authority (blocks
hostile/enemy/opponent/threat labels without official
relationship/team/war/suzerain evidence), and evidence sinks.

## Atomicity Rule

A procedure atom is complete when it has stable input, stable output,
risk/approval policy, proof boundary, and tests. If a procedure requires callers
to remember a hidden preflight or postcondition step, the atom is too small or
the middleware composition is incomplete.
