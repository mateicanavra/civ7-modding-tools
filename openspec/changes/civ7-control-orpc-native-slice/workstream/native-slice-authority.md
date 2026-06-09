# Control-oRPC Native Slice Authority

Status: draft OpenSpec workstream authority.
Date: 2026-06-04.

## Course Correction

The native control-oRPC lane must not manually recreate oRPC/effect-orpc. The
acceptable prework is separation: identify atoms, policies, dependencies,
repositories/read ports, middleware candidates, projections, and proof
boundaries so the real oRPC router/procedure/context/middleware layer can be
implemented cleanly.

Direct-control-local descriptor and call helpers are evidence of boundaries
only. They must not keep growing into a private framework for context
composition, before/after handler hooks, error buses, correlation plumbing,
router registries, or transport handling.

## Product Slice Frame

The product surface is a Civ7 control procedure layer for player support,
Studio, in-game controller, and future AI callers. It composes stable
service-owned capabilities over direct-control runtime ports; it does not
replace direct-control runtime authority.

```text
Direct-control runtime ports
  Own Civ7 runtime access, validators, command-source serialization,
  approval types, postconditions, proof labels, relationship evidence policy,
  and semantic/debug projection facts.

Control-oRPC package
  Owns the offered service procedures: contracts, product procedure logic,
  routers, context dependencies, middleware, typed errors, server-side client,
  and later edge adapters.

Caller/runtime adapters
  Own concrete context construction for CLI, tests, Studio server, and
  in-game UIScript bridge.
```

## Service-Ownership Correction

The initial native read leaves are transitional proof of oRPC mechanics. They
should not be copied as the continuing implementation strategy. A procedure
whose handler only calls `context.directControl.getCiv7*` with the same input
is a facade-only shell; it duplicates validation and typing without moving
service ownership into oRPC.

Next implementation work should treat direct-control as a runtime port and
proof authority, not the place where the offered service behavior keeps
growing. Control-oRPC procedures should own the service behavior/composition
they expose, using direct-control only for low-level runtime access,
validators, postcondition classifiers, command serialization, proof facts, and
relationship authority that must stay runtime-owned.

The OpenSpec workstream now freezes additional facade-only shells. The existing
shells remain only as named transitional debt to be retired, moved, or
rewritten in later slices. Do not add punitive tests for this transient debt;
if broad enforcement is needed, use the repo lint/guardrail system.

## Rebaselined Workstream Order

The read-only module lane is stopped. It was useful proof, but it is not the
continuing strategy.

The next workstream order is:

1. Modularize real code first, including write-capable operation flows and
   their validators, postcondition classifiers, no-repeat/proof owners, and
   projection boundaries.
2. Reorganize the hierarchy semantically for Sieve and future player-agent/API
   consumers, so capability families are meaningful instead of an artifact of
   current file names.
3. Layer policies, dependencies, repositories/read ports, and middleware
   candidates from the modularized owners.
4. Compose those layers into native oRPC/effect-orpc routers where the service
   logic lives.

If the OpenSpec records make the next agent choose another marginal read-only
wrapper instead, the records are stale and must be repaired before code.

## Policy Map

| Policy | Current owner evidence | Future native placement |
|---|---|---|
| approval | direct-control approval types and mutation descriptors | oRPC middleware over mutation procedures |
| validator-first | operation validators and request wrappers | oRPC middleware/procedure guard before send |
| postcondition/no-repeat | postcondition classifiers and operation telemetry | oRPC middleware plus direct-control proof record |
| relationship authority | current tactical `relationshipLabelPolicy` schemas plus the OpenSpec neutral-relationship invariant | read projection policy and optional middleware guard |
| command serialization | `runtime/command-serialization` and command-source builders | direct-control-only dependency, never procedure output/input |
| semantic/debug projection | CLI normal-output and proof/debug contracts | output projection policy per consumer class |
| proof boundary | local/live/pending-runtime-proof labels | procedure result/evidence metadata without proof inflation |
| safe error projection | direct-control error codes and oRPC typed errors | oRPC typed errors with non-raw data |
| correlation | request/evidence correlation policy | oRPC context metadata, not a separate event bus |

## Dependency Map

Future context dependencies should be explicit and ready before procedure
handlers run:

```text
directControl
  Typed facade over direct-control runtime ports and proof/policy owners.

controller
  Optional in-game controller facade for scope="game" router execution.

endpointDefaults
  Host/port/timeout policy supplied by caller/runtime adapter.

stateSelection
  Tuner/App UI state-selection policy supplied by caller/runtime adapter.

approval
  Explicit mutation approval evidence.

riskPolicy
  Read-only/send-approved/live-proof policy.

evidenceSink
  Procedure/debug/proof telemetry sink.

logger
  Structured logging dependency.

clock
  Deterministic observed-at/correlation timing.

correlation
  Caller or runtime-provided request correlation.
```

Provider construction belongs to runtime/caller assembly. Procedure modules may
receive dependencies through oRPC context, but must not create sockets,
provider-level clients, service clients, or ad hoc dependency graphs.

## Middleware Candidate Boundary

Middleware candidates are not middleware until they are implemented with
oRPC/effect-orpc primitives. They should remain policies until at least two
procedure modules share the same guard.

Accepted candidate classes:

- endpoint defaults;
- readiness;
- approval;
- validator-first;
- postcondition/proof recording;
- relationship authority;
- safe error projection;
- telemetry/proof hooks.

Rejected candidate classes:

- generic raw command dispatch;
- raw session/socket execution;
- a custom before/after handler pipeline;
- a direct-control-local event bus;
- a public correlation/error framework separate from oRPC context/errors.

## Corrected Implementation Slices

The first source slices already created tracked `packages/civ7-control-orpc`
source and proved in-process router mechanics without transport edges. That is
now transitional proof, not the next implementation strategy. The corrected
package shape still points toward:

```text
src/contract.ts
src/router.ts
src/context.ts
src/errors.ts
src/procedure.ts
src/dependencies/direct-control.ts
src/policy/*.ts
src/middleware/*.ts
src/modules/runtime/*
src/modules/notifications/*
test/server-side-client.test.ts
test/in-process-router.test.ts
```

The next source slice should not start another read-only module. It should
modularize write-capable behavior and proof/policy owners, define the semantic
hierarchy expected by Sieve/future consumers, or layer a repeated policy through
native oRPC/effect-orpc primitives. Mutation modules should wait until
approval, validator-first, and postcondition/no-repeat boundaries are explicit
and can be composed through native oRPC/effect-orpc rather than custom wrapper
plumbing.

## Older Artifact Classification

Older branch `d3d49b48f` contains useful source evidence:

- `contracts.ts`: contract-first tree over lifecycle/live/setup/actions;
- `router.ts`: Effect/oRPC router graph and in-process handlers;
- `services.ts`: Effect service tag over direct-control facade;
- `types.ts`: context and envelope;
- `orpc.test.ts`: in-process calls, approval blocking, relationship evidence,
  and server-side client proof.

Do not merge it as-is. Mine it for router families, server-side proof shape,
and test intent. Current OpenSpec supersedes it on context-owned endpoint/state
inputs, raw command/session exclusion, schema-technology disposition,
projection separation, no-repeat proof semantics, and the in-game controller
bridge model.
