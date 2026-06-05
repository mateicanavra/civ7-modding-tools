## 1. Authority And Intake

- [x] 1.1 Re-check official oRPC docs for procedure, router, context,
  middleware, contract-first, server-side clients, testing, and ecosystem
  guidance.
- [x] 1.2 Record older Effect/oRPC branch evidence as mined input, not source
  authority to merge wholesale.
- [x] 1.3 Define the staged native control-oRPC approach and direct-control
  prework boundary.

## 2. Atom/Policy Separation

- [x] 2.1 Inventory current direct-control runtime capabilities by router
  family, risk, schema owner, validator owner, postcondition owner, and proof
  boundary.
- [x] 2.2 Extract a policy map for approval, validator-first, no-repeat,
  relationship authority, projection, proof labels, telemetry, and command
  serialization.
- [x] 2.3 Extract a dependency map for direct-control facade, endpoint
  defaults, state selection, logger, evidence sink, clock, approval, risk
  policy, and optional controller facade.
- [x] 2.4 Identify repository/read-port style owners where data-layer access
  exists, without constructing runtime providers in direct-control runtime
  capability code.

## 3. Contract And Context Slice

- [x] 3.1 Create tracked `packages/civ7-control-orpc` source with package
  manifest, exports, and no runtime transport edge.
- [x] 3.2 Define contract/context/error/procedure base files using
  oRPC/effect-orpc primitives.
- [x] 3.3 Add no-network tests that call procedures in process with fake
  context and fake direct-control facade.
- [x] 3.4 Prove endpoint/session/state/raw command fields remain
  context/debug-owned, not normal procedure input.

## 4. Transitional Read-Only Procedure Proof

- [x] 4.1 Implement the first read-only module over `runtime.playable.status`.
- [x] 4.2 Implement one notification read module over `notifications.view`.
- [x] 4.3 Implement one unit read module over `unit.ready.view` or
  `unit.move.preview`.
- [x] 4.4 Prove server-side client calls over the same router graph.
- [x] 4.5 Implement one map read module over `map.summary.read` with
  in-process server-side client proof.
- [x] 4.6 Implement one player read module over `player.summary.read` with
  in-process server-side client proof.
- [x] 4.7 Implement one unit summary module over `unit.summary.read` with
  in-process server-side client proof.
- [x] 4.8 Implement one city summary module over `city.summary.read` with
  in-process server-side client proof.
- [x] 4.9 Implement one ready-city module over `city.ready.view` with
  in-process server-side client proof.
- [x] 4.10 Freeze additional facade-only read wrapper expansion in the
  workstream authority.
- [ ] 4.11 Replace transitional facade-only read wrappers with native
  service-owned procedure implementations or explicitly burn them down.

This phase is closed as transitional proof only. It must not be extended by
adding more read-only facade shells.

## 5. Workstream Rebaseline

- [x] 5.1 Stop additional facade-only read-wrapper expansion in the
  OpenSpec workstream.
- [ ] 5.2 Modularize real direct-control behavior first, including
  write-capable operation flows, validators, postcondition classifiers,
  no-repeat/proof owners, and projection boundaries.
  - [x] 5.2.1 Extract production-choice request/proof classification policy
    into a direct-control-owned helper while preserving legacy request
    `verified` behavior and stricter no-repeat proof semantics.
  - [x] 5.2.2 Extract notification-dismissal proof/no-repeat policy into a
    proof helper while keeping runtime postcondition classification in
    direct-control notification postconditions.
  - [x] 5.2.3 Extract unit-target action proof/no-repeat policy into a proof
    helper while preserving path-shortfall repeat guarding.
  - [x] 5.2.4 Extract narrative and diplomacy closeout proof/no-repeat
    policies into proof helpers while preserving current closeout semantics.
  - [x] 5.2.5 Extract population-placement proof/no-repeat policy into
    focused helpers while preserving legacy request `verified` behavior.
- [ ] 5.3 Reorganize the capability hierarchy semantically for Sieve/future
  consumers before adding more procedure leaves.
  - [x] 5.3.1 Define the target semantic capability families and transitional
    burn-down map for current direct-control-shaped procedure modules.
- [ ] 5.4 Identify service-owned behavior, runtime ports, policy owners,
  repositories/read ports, and middleware candidates from the modularized code.
  - [x] 5.4.1 Record `attention.current` as a service-owned composition
    boundary over playable status, notifications, and ready actor runtime
    ports without adding a direct-control attention facade.
  - [x] 5.4.2 Record turn-completion status as an `attention.current`
    runtime read port and semantic projection owner, not a standalone
    facade-only procedure leaf.
- [ ] 5.5 Compose the layered behavior into native oRPC/effect-orpc routers
  only after the hierarchy and ownership boundaries are real.
  - [x] 5.5.1 Seed `attention.current` as a native service-owned procedure
    that derives semantic blockers, decisions, ready actors, and next steps
    from existing direct-control runtime ports.
  - [x] 5.5.2 Enrich `attention.current` with turn-completion evidence so
    end-turn next steps require source-owned turn status instead of clean
    notifications alone.
  - [x] 5.5.3 Seed `city.production.choice.request` as the first native
    write-capable procedure leaf, with oRPC context approval and semantic
    production proof projection over the direct-control production-choice
    runtime port.
  - [x] 5.5.4 Seed `notifications.dismiss.request` as the second native
    write-capable procedure leaf, with oRPC context approval and semantic
    notification dismissal proof projection over the direct-control
    notification dismissal runtime port.
  - [x] 5.5.5 Seed `unit.target.action.request` as a single native
    `operations` procedure leaf, with oRPC context approval and semantic
    unit-target proof projection over the direct-control unit-target runtime
    port; do not add a broad operations catalog.
  - [x] 5.5.6 Seed `city.population.place.request` as a single native city
    procedure leaf that owns the semantic assign-worker versus expand-city
    caller shape over direct-control player-operation/city-command runtime
    ports; do not add a generic operation catalog.

## 6. Native Policy Layering

- [ ] 6.1 Promote shared middleware only after modularized behavior shows a
  repeated policy and the implementation uses native oRPC/effect-orpc
  primitives.
  - [x] 6.1.1 Promote the repeated mutation approval gate into shared native
    effect-oRPC builder middleware after the production-choice and notification
    dismissal leaves proved the same context-owned approval policy.
- [ ] 6.2 Add approval middleware before mutation procedures.
  - [x] 6.2.1 Add leaf-scoped native effect-oRPC approval middleware for
    `city.production.choice.request`; keep shared approval middleware pending
    until another mutation procedure reuses the same policy.
  - [x] 6.2.2 Repeat leaf-scoped native effect-oRPC approval middleware for
    `notifications.dismiss.request`; shared approval middleware promotion is
    now the next native policy-layering candidate, not accepted in this slice.
  - [x] 6.2.3 Reuse shared native approval middleware across
    `city.production.choice.request` and `notifications.dismiss.request` while
    keeping validator-first and postcondition/proof middleware pending.
  - [x] 6.2.4 Reuse shared native approval middleware for
    `unit.target.action.request` while keeping validator-first and
    postcondition/proof middleware pending.
  - [x] 6.2.5 Reuse shared native approval middleware for
    `city.population.place.request` while keeping validator-first and
    postcondition/proof middleware pending.
- [ ] 6.3 Add validator-first and postcondition/proof middleware before
  mutation sends.
  - [x] 6.3.1 Compose `city.production.choice.request` through the
    direct-control validator-first production-choice port and project
    source-owned postcondition/no-repeat proof semantics into normal output;
    keep shared validator/postcondition middleware pending.
  - [x] 6.3.2 Compose `notifications.dismiss.request` through the
    direct-control approval/validation/postcondition dismissal port and project
    source-owned notification proof/no-repeat semantics into normal output;
    keep shared validator/postcondition middleware pending.
  - [x] 6.3.3 Compose `unit.target.action.request` through the direct-control
    validator-first unit-target runtime port and project source-owned
    verification/proof/no-repeat semantics into normal output; keep shared
    validator/postcondition middleware pending.
  - [x] 6.3.4 Compose `city.population.place.request` through the
    direct-control validator-first player-operation/city-command runtime ports
    and project source-owned population-placement proof/no-repeat semantics
    into normal output; keep shared validator/postcondition middleware pending.
- [ ] 6.4 Add safe error projection and correlation through oRPC/effect-orpc
  context/error primitives, not direct-control-local framework wiring.
  - [x] 6.4.1 Use native effect-orpc tagged error constructors for
    `runtime.playable.status`, `notifications.view`, and `unit.ready.view`
    facade failures.
  - [ ] 6.4.2 Promote shared safe-error middleware only after the native
    oRPC/effect-orpc error path is proven without custom wrapper plumbing.
  - [ ] 6.4.3 Add correlation through accepted oRPC/effect-orpc context/error
    primitives.
  - [x] 6.4.4 Use native effect-orpc tagged error constructors for
    `unit.target.action.request` direct-control runtime-port failures while
    shared safe-error middleware remains pending.
  - [x] 6.4.5 Use native effect-orpc tagged error constructors for
    `city.population.place.request` direct-control runtime-port failures while
    shared safe-error middleware remains pending.

## 7. Edge Adapters

- [ ] 7.1 Route one CLI caller through the in-process procedure client only
  after the service-owned router shape is stable.
- [ ] 7.2 Add Studio `RPCHandler`/`RPCLink` only after the shared router shape
  is stable.
- [ ] 7.3 Add in-game controller bridge only as serialized ingress into the
  in-process router.
- [ ] 7.4 Keep OpenAPI/external REST deferred until there is a documented
  external consumer.

## 8. Verification

- [x] 8.1 Run `bun run openspec -- validate civ7-control-orpc-native-slice
  --strict`.
- [x] 8.2 Run `git diff --check`.
- [x] 8.3 Run focused package tests/check/build when source implementation is
  added.
- [ ] 8.4 Run CLI play tests/check when CLI callers change.
