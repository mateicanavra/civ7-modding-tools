# Control-oRPC Native Slice Design

This is a target architecture and staged implementation boundary for
Effect/oRPC composition over Civ7 direct-control atoms. It is not runtime
source, not transport work, not Task 2.9.4 acceptance, and not live proof.

## Authority Relationship

`@civ7/direct-control` remains runtime authority for Civ7 access: tuner socket
framing, state selection, reconnect behavior, App UI/Tuner command source,
validators, approval types, postcondition classifiers, no-repeat guards,
relationship evidence policy, and runtime proof labels.

`packages/civ7-control-orpc` will be the typed procedure composition owner. It
uses official oRPC and `effect-orpc` primitives for contracts, procedures,
routers, context, middleware, typed errors, server-side clients, and later edge
handlers. It does not replace direct-control runtime atoms and does not expose
raw command/session controls as product procedures.

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

3. Implement read-only procedure modules in process.
   - Start with low-risk atoms such as `runtime.playable.status`,
     `notifications.view`, `unit.ready.view`, `unit.move.preview`,
     `unit.summary.read`, `city.summary.read`, and neutral `strategy` reads.
   - Prove them through oRPC-supported in-process calls with fake context and
     fake direct-control facade.

4. Promote shared middleware only after repetition is real.
   - Middleware candidates include endpoint defaults, readiness, approval,
     validator-first, postcondition/proof recording, relationship authority,
     safe error projection, correlation, and telemetry hooks.
   - A candidate becomes middleware only when at least two procedure modules
     need the same guard and the policy has direct-control-owned proof.
   - Use oRPC/effect-orpc middleware primitives; do not build a parallel
     `beforeHandler`/event/correlation pipeline.

5. Add mutation procedures after middleware proof.
   - Mutation procedures must preserve approval-first, validator-first,
     separated send receipt, post-read, postcondition classification,
     no-repeat-after-unverified, and honest pending-runtime-proof semantics.
   - Legacy `verified` booleans are source evidence, not proof authority.

6. Add edge adapters last.
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
    runtime/
      contract.ts
      router.ts
      procedures/
        playable-status.ts
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
        ready-view.ts
        move-preview.ts
        summary-read.ts
        target-action-request.ts
    city/
      contract.ts
      router.ts
      procedures/
        ready-view.ts
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
    procedure-readonly.test.ts
    mutation-guards.test.ts
    relationship-authority.test.ts
    server-side-client.test.ts
```

The exact module list may change as atom owners settle. The structure rule is
stable: domain contracts/procedures live in modules, shared policies live in
policy files, repeated execution guards use oRPC/effect-orpc middleware, and
runtime/caller dependency construction stays outside direct-control atoms.

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
