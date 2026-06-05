# Control-oRPC Native Slice Design

This is a target architecture and staged implementation boundary for
Effect/oRPC service ownership over Civ7 runtime control ports. It is not
runtime source, not transport work, not Task 2.9.4 acceptance, and not live
proof.

## Authority Relationship

`@civ7/direct-control` remains runtime authority for Civ7 access: tuner socket
framing, state selection, reconnect behavior, App UI/Tuner command source,
validators, approval types, postcondition classifiers, no-repeat guards,
relationship evidence policy, and runtime proof labels.

`packages/civ7-control-orpc` will be the typed service/procedure composition
owner. It uses official oRPC and `effect-orpc` primitives for contracts,
procedures, routers, context, middleware, typed errors, server-side clients,
and later edge handlers. It does not replace direct-control runtime authority
and does not expose raw command/session controls as product procedures.

Thin native oRPC leaves that only call a same-shaped direct-control facade
method are transitional proof debt. They prove initial router/context/error
mechanics, but they are not the target pattern and must not keep expanding. New
procedure work should either move the offered service behavior into the native
oRPC package, or deliberately keep only low-level runtime authority in
direct-control and consume it as a port.

Current direct-control descriptor seeds are useful boundary evidence. They are
not the final framework. They should shrink toward atom metadata, schemas,
policy facts, and proof vocabulary that the oRPC package consumes.

Older branch evidence at `d3d49b48f:packages/civ7-direct-control/src/orpc/**`
shows a real Effect/oRPC direction: contract tree, Effect service tag, router
graph, server-side client proof, approval blocking, and relationship evidence
policy. It should be mined for procedure families and test intent, not merged
wholesale because current OpenSpec has stricter context-owned input,
projection, schema-tech, no-raw-tunnel, and mutation proof requirements.

## Staged Approach

The original read-only procedure-module phase has reached its limit. It
produced useful local proof of native router/context/error mechanics, but
continuing it would optimize for marginal wrappers instead of the product
outcome. The workstream is rebaselined around this order:

1. Modularize the real behavior first, including write-capable flows.
2. Reorganize the capability hierarchy semantically for Sieve/future
   consumers.
3. Layer policies, dependencies, repositories/read ports, and middleware
   candidates.
4. Compose that layered behavior into native oRPC/effect-orpc routers where
   the service logic lives.

1. Inventory atoms and policies.
   - Direct-control files name capability owners, schemas, validators,
     postcondition classifiers, command-source ownership, and proof labels.
   - Output: atom map, policy map, dependency map, and stop conditions.

2. Define oRPC contracts and context dependencies.
   - `packages/civ7-control-orpc` owns contracts and procedure context types.
   - Context carries ready dependencies and policy evidence: direct-control
     facade, endpoint defaults, state selection strategy, approval, logger,
     evidence sink, clock, correlation provider, risk policy, and optional
     controller facade.
   - Context construction belongs to caller/runtime adapters, not direct-control
     atom code.

3. Freeze facade-only wrapper expansion and move to service-owned procedures.
   - Existing read-only leaves over `unit.summary.read`, `map.summary.read`,
     `player.summary.read`, and `city.summary.read` are transitional proof of
     in-process router mechanics.
   - The historical `runtime.playable.status` facade leaf has been replaced by
     `readiness.current`, which projects the direct-control playable-status
     runtime port into a semantic readiness result without raw host, port,
     state, Tuner snapshot, or runtime error details.
   - The historical `notifications.view` facade leaf has been burned down;
     current notification, decision, and blocker service behavior is composed
     by `attention.current` through the direct-control notification runtime
     port.
   - The historical `unit.ready.view` facade leaf has been burned down; current
     ready-unit service behavior is composed by `attention.current` through the
     direct-control ready-unit runtime port.
   - The historical `city.ready.view` facade leaf has been burned down; current
     ready-city service behavior is composed by `attention.current` through the
     direct-control ready-city runtime port.
   - No further facade-only leaves should be added.
   - The next implementation work should move real service behavior and
     composition into native oRPC procedure modules while direct-control keeps
     low-level runtime ports and proof authority.
   - Do not add brittle tests for transient wrapper violations; if categorical
     enforcement becomes necessary, put it in the repo lint/guardrail system.

4. Modularize write-capable behavior and real service logic.
   - Production choice, notification dismissal, unit-target actions, closeout
     flows, turn/autoplay sends, and other mutation-capable paths must not lag
     behind while read wrappers accumulate.
   - The modularization target is ownership clarity: runtime ports,
     validators, postcondition/proof owners, no-repeat policy, projection
     boundaries, and service behavior must be separated before router
     composition.
   - Local fake tests prove code boundaries only; mutation/runtime claims still
     require real-game proof or explicit pending-runtime-proof.

5. Promote shared middleware only after repetition is real.
   - Middleware candidates include endpoint defaults, readiness, approval,
     validator-first, postcondition/proof recording, relationship authority,
     safe error projection, correlation, and telemetry hooks.
   - A candidate becomes middleware only when at least two procedure modules
     need the same guard and the policy has direct-control-owned proof.
   - Use oRPC/effect-orpc middleware primitives; do not build a parallel
     `beforeHandler`/event/correlation pipeline.

6. Add mutation procedures after middleware proof.
   - Mutation procedures must preserve approval-first, validator-first,
     separated send receipt, post-read, postcondition classification,
     no-repeat-after-unverified, and honest pending-runtime-proof semantics.
   - Legacy `verified` booleans are source evidence, not proof authority.

7. Add edge adapters last.
   - CLI and tests call the router in process.
   - Studio browser/server uses `RPCHandler`/`RPCLink` after the shared router
     is stable.
   - External REST/OpenAPI is separate and later.
   - The in-game controller bridge invokes the in-process router through a
     thin serialized `Civ7IntelligenceBridge.invoke(...)` ingress.

## Target File Shape

```text
packages/civ7-control-orpc
  src/client.ts
  src/contract.ts
  src/router.ts
  src/context.ts
  src/errors.ts
  src/procedure.ts
  src/model/
    envelope.ts
    evidence.ts
    correlation.ts
    projection.ts
  src/policy/
    approval.ts
    relationship-authority.ts
    risk.ts
    proof-boundary.ts
  src/dependencies/
    direct-control.ts
    controller.ts
    logger.ts
    clock.ts
    evidence-sink.ts
  src/middleware/
    endpoint-defaults.ts
    readiness.ts
    approval.ts
    validator-first.ts
    postcondition.ts
    relationship-authority.ts
    error-projection.ts
    telemetry.ts
  src/modules/
    readiness/
      contract.ts
      router.ts
      procedures/
        current.ts
    runtime/
      contract.ts
      router.ts
      procedures/
        app-ui-snapshot.ts
        tuner-health.ts
    notifications/
      contract.ts
      router.ts
      procedures/
        view.ts
        dismiss-request.ts
    unit/
      contract.ts
      router.ts
      procedures/
        move-preview.ts
        summary-read.ts
        target-action-request.ts
    city/
      contract.ts
      router.ts
      procedures/
        summary-read.ts
        production-choice-request.ts
    strategy/
      contract.ts
      router.ts
      procedures/
        settlement-recommendations.ts
        target-candidates.ts
        battlefield-scan.ts
  test/
    in-process-router.test.ts
    mutation-guards.test.ts
    relationship-authority.test.ts
    server-side-client.test.ts
```

The exact module list may change as atom owners settle. The structure rule is
stable: domain contracts/procedures live in modules, shared policies live in
policy files, repeated execution guards use oRPC/effect-orpc middleware, and
runtime/caller dependency construction stays outside direct-control runtime
capability code.

## Direct-Control Prework Boundary

Acceptable direct-control prework:

- adjacent TypeBox/Effect Schema owner exports for atom inputs/outputs;
- source-owned validators and postcondition classifiers;
- operation/proof telemetry record vocabulary;
- command-source serialization ownership and no-raw-tunnel guards;
- semantic normal-output vs debug/internal/proof projection boundaries;
- facade methods that expose stable atoms without raw command/session leakage.

Unacceptable direct-control prework:

- generic procedure dispatchers, router registries, or transport handlers;
- custom middleware pipelines or `beforeHandler` composition;
- context dependency construction beyond atom-local injected dependencies;
- public error/correlation systems that duplicate oRPC typed error/context
  flow;
- debug/proof telemetry collapsed into normal CLI or player-agent output.

## Middleware Candidate Map

| Candidate | Policy owner | Becomes oRPC middleware when |
|---|---|---|
| endpoint defaults | direct-control runtime context policy | multiple procedures need host/port/timeout normalization without input fields |
| readiness | direct-control health/status atoms | procedures share App UI/Tuner state preconditions |
| approval | direct-control approval policy | two mutation procedures need the same approval check |
| validator-first | direct-control operation validators | send-capable procedures share pre-send validation semantics |
| postcondition/proof | direct-control postcondition classifiers and telemetry | mutations share before/after evidence and no-repeat behavior |
| relationship authority | current tactical `relationshipLabelPolicy` schemas plus the OpenSpec neutral-relationship invariant | read procedures need neutral label enforcement/projection |
| error projection | direct-control error codes plus oRPC typed errors | multiple procedures need safe, non-raw failure projection |
| telemetry hook | operation/proof telemetry contract | procedure-level proof/debug consumers are accepted |

Middleware candidates are not implementation permission by themselves.

## Proof Boundaries

Local oRPC tests can prove contract shape, context dependency use, middleware
ordering, typed errors, projection, and in-process client behavior. They cannot
prove Civ7 runtime behavior.

Runtime/control changes still need real-game proof or an explicit
pending-runtime-proof label. Mutation-facing work still needs explicit
approval, validator-first behavior, no-repeat-after-unverified semantics, and
confirmed postcondition evidence before any repeat-safe claim.
