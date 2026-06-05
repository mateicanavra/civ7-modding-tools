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
  - [x] 4.11.1 Burn down the transitional `unit.ready.view` control-oRPC
    facade leaf after `attention.current` became the service-owned ready-unit
    attention composer; keep the direct-control ready-unit runtime port as an
    internal context dependency.
  - [x] 4.11.2 Burn down the transitional `city.ready.view` control-oRPC
    facade leaf after `attention.current` became the service-owned ready-city
    attention composer; keep the direct-control ready-city runtime port as an
    internal context dependency.
  - [x] 4.11.3 Burn down the transitional `notifications.view` control-oRPC
    facade leaf after `attention.current` became the service-owned
    notification, decision, and blocker composer; keep the direct-control
    notification runtime port as an internal context dependency.
  - [x] 4.11.4 Replace the transitional `runtime.playable.status`
    control-oRPC facade leaf with the service-owned `readiness.current`
    procedure; keep direct-control playable status as an internal runtime port
    and omit raw host/port/state/Tuner/error details from normal output.
  - [x] 4.11.5 Burn down the remaining transitional summary read facade
    leaves: `map.summary.read`, `player.summary.read`, `unit.summary.read`,
    and `city.summary.read`. Do not rebuild `world.current` by calling those
    direct-control summary functions as if they were bare runtime resources;
    first separate tuner/Civ bridge resource mechanics from semantic summary
    service behavior.

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
  - [x] 5.4.3 Rebaseline the world/read boundary: direct-control summary
    functions are transitional service-shaped read debt, not accepted
    low-level runtime resources for `world.current`; a world service slice must
    either decompose lower-level Tuner/probe resources first or move semantic
    summary behavior into the control-oRPC service owner. See
    `workstream/world-runtime-resource-boundary.md`.
  - [x] 5.4.4 Record `strategy.frontSummary` as a service-owned planning
    composition over target-candidate and battlefield-scan runtime/read ports.
    The service owns the normal projection, next-step wording, raw-output
    exclusion, and relationship-unproven policy; no strategy catalog, action
    authority, runtime proof, or parent Task 5.x/6.x acceptance.
  - [x] 5.4.5 Record `decisions.narrative.choice.request` as a service-owned
    decision boundary over direct-control narrative runtime, validator, and
    proof ports. The service owns the caller-facing semantic choice shape,
    normal proof projection, raw-output exclusion, and no-repeat next steps;
    no direct-control procedure core, broad decisions catalog, runtime proof,
    or parent Task 5.x/6.x acceptance.
  - [x] 5.4.6 Record `decisions.diplomacy.response.request` as a
    service-owned decision boundary over direct-control diplomacy runtime,
    validator, and proof ports. The service owns the caller-facing semantic
    response shape, normal proof projection, raw-output exclusion, and
    no-repeat next steps; direct-control-only UI toggles, broad decisions
    catalogs, runtime proof, and parent Task 5.x/6.x acceptance remain out of
    scope.
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
  - [x] 5.5.5 Seed `unit.target.action.request` as a single native unit
    procedure leaf, with oRPC context approval and semantic unit-target proof
    projection over the direct-control unit-target runtime port; do not add a
    broad operations catalog or an operations entry router.
  - [x] 5.5.6 Seed `city.population.place.request` as a single native city
    procedure leaf that owns the semantic assign-worker versus expand-city
    caller shape over direct-control player-operation/city-command runtime
    ports; do not add a generic operation catalog.
  - [x] 5.5.7 Seed `readiness.current` as a native service-owned procedure
    that projects direct-control playable status into safe readiness,
    capability, source-summary, and next-step output without exposing raw
    runtime details.
  - [x] 5.5.8 Extract repeated mutation result status and next-step semantics
    into a package-local control-oRPC service policy while keeping
    direct-control proof classifiers, validator summaries, and
    postcondition/no-repeat authority procedure-local; shared
    validator/postcondition middleware remains pending.
  - [x] 5.5.9 Seed `strategy.frontSummary` as a native service-owned planning
    procedure that composes target-candidate and battlefield-scan evidence into
    neutral front planning output without adding same-shaped read wrappers,
    operation sends, strategy catalogs, relationship labels beyond official
    evidence, or runtime/live proof claims.
  - [x] 5.5.10 Seed `decisions.narrative.choice.request` as a native
    service-owned decision procedure that composes approval, playable
    readiness, direct-control narrative request authority, and source-owned
    narrative proof classification into semantic output without exposing raw
    command/session/payload details or claiming runtime/live proof.
  - [x] 5.5.11 Seed `decisions.diplomacy.response.request` as a native
    service-owned decision procedure that composes approval, playable
    readiness, direct-control diplomacy response authority, and source-owned
    diplomacy proof classification into semantic output without exposing raw
    command/session/payload/UI-closeout details or claiming runtime/live proof.

## 6. Native Policy Layering

- [ ] 6.1 Promote shared middleware only after modularized behavior shows a
  repeated policy and the implementation uses native oRPC/effect-orpc
  primitives.
  - [x] 6.1.1 Promote the repeated mutation approval gate into shared native
    effect-oRPC builder middleware after the production-choice and notification
    dismissal leaves proved the same context-owned approval policy.
  - [x] 6.1.2 Promote the repeated mutation playable-readiness precondition
    into shared native effect-oRPC middleware over existing direct-control
    playable-status runtime ports. Keep live-game proof, transport
    propagation, validator-first middleware, and postcondition/proof
    middleware pending.
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
  - [x] 6.2.6 Reuse shared native approval middleware for
    `decisions.narrative.choice.request` while keeping validator-first and
    postcondition/proof middleware pending.
  - [x] 6.2.7 Reuse shared native approval middleware for
    `decisions.diplomacy.response.request` while keeping validator-first and
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
  - [x] 6.3.5 Compose `decisions.narrative.choice.request` through the
    direct-control narrative request runtime port and project source-owned
    narrative proof/no-repeat semantics into normal output; keep shared
    validator/postcondition middleware pending.
  - [x] 6.3.6 Compose `decisions.diplomacy.response.request` through the
    direct-control diplomacy response runtime port and project source-owned
    diplomacy proof/no-repeat semantics into normal output; keep shared
    validator/postcondition middleware pending.
  - [x] 6.3.7 Extract repeated closeout-style postcondition projection into a
    shared control-oRPC mutation policy helper reused by notification,
    narrative, and diplomacy mutation procedures. Keep direct-control proof
    classifiers as source authority and keep shared validator/postcondition
    middleware pending.
- [ ] 6.4 Add safe error projection and correlation through oRPC/effect-orpc
  context/error primitives, not direct-control-local framework wiring.
  - [x] 6.4.1 Use native effect-orpc tagged error constructors for
    historical `runtime.playable.status`, `notifications.view`, and
    `unit.ready.view` facade failures before those wrappers were burned down.
  - [x] 6.4.6 Use native effect-orpc tagged error constructors for
    `readiness.current` direct-control runtime-port failures while shared
    safe-error middleware remains pending.
  - [x] 6.4.2 Promote shared safe-error middleware for final public projection
    of downstream oRPC/procedure failures, while keeping raw direct-control
    runtime-port classification inside Effect handlers where effect-oRPC can
    still see the source failure.
  - [x] 6.4.3 Add correlation through accepted oRPC/effect-orpc context/error
    primitives: validate optional service correlation in native context
    middleware and attach only validated IDs to typed error data. Keep
    transport/header propagation, runtime telemetry propagation, and custom
    correlation buses out of scope.
  - [x] 6.4.4 Use native effect-orpc tagged error constructors for
    `unit.target.action.request` direct-control runtime-port failures while
    shared safe-error middleware remains pending.
  - [x] 6.4.5 Use native effect-orpc tagged error constructors for
    `city.population.place.request` direct-control runtime-port failures while
    shared safe-error middleware remains pending.
  - [x] 6.4.7 Use native effect-orpc tagged error constructors for
    `decisions.narrative.choice.request` direct-control runtime-port failures
    while keeping raw direct-control cause, command, session, and payload
    details out of public error data.
  - [x] 6.4.8 Use native effect-orpc tagged error constructors for
    `decisions.diplomacy.response.request` direct-control runtime-port
    failures while keeping raw direct-control cause, command, session, payload,
    and UI-closeout details out of public error data.

## 7. Edge Adapters

- [x] 7.1 Route one CLI caller through the in-process procedure client only
  after the service-owned router shape is stable.
  - [x] 7.1.1 Route `civ7 game status` through the in-process
    `readiness.current` server-side client. Keep CLI endpoint flags as context
    construction, emit the semantic readiness projection, and keep raw
    direct-control playable-status internals out of normal status output.
- [x] 7.2 Add Studio `RPCHandler`/`RPCLink` only after the shared router shape
  is stable.
  - [x] 7.2.1 Mount the shared `Civ7ControlOrpcRouter` behind Studio's Vite
    Node middleware with native `RPCHandler`, add a browser `RPCLink` client,
    and route the live footer readiness member through
    `readiness.current` while preserving existing map/autoplay REST fields.
- [ ] 7.3 Add in-game controller bridge only as serialized ingress into the
  in-process router.
  - [x] 7.3.1 Record the in-game controller bridge preflight contract:
    `Civ7IntelligenceBridge.invoke(...)` is serialized ingress only, the
    game-scoped UIScript loads an in-process oRPC/Effect router, procedure
    calls are allowlisted, context construction stays in the controller
    runtime adapter, mutation calls require explicit approval/local-player
    proof, and source implementation remains pending.
- [ ] 7.4 Keep OpenAPI/external REST deferred until there is a documented
  external consumer.

## 8. Verification

- [x] 8.1 Run `bun run openspec -- validate civ7-control-orpc-native-slice
  --strict`.
- [x] 8.2 Run `git diff --check`.
- [x] 8.3 Run focused package tests/check/build when source implementation is
  added.
- [x] 8.4 Run CLI play tests/check when a CLI caller is routed through
  procedures.
- [x] 8.5 Run direct-control narrative proof, control-oRPC narrative decision,
  package check/build, OpenSpec strict validation, and diff hygiene gates for
  `decisions.narrative.choice.request` before closing that slice.
- [x] 8.6 Run direct-control diplomacy proof, control-oRPC diplomacy response,
  package check/build, OpenSpec strict validation, and diff hygiene gates for
  `decisions.diplomacy.response.request` before closing that slice.
- [x] 8.7 Run focused control-oRPC mutation projection policy and affected
  notification/narrative/diplomacy procedure tests, package check/build,
  strict OpenSpec validates, and diff hygiene when the shared closeout
  projection helper is extracted.
- [x] 8.8 Run strict OpenSpec validates and diff hygiene for the controller
  bridge preflight record. No source implementation, runtime proof, play-thread
  action, or `7.3` implementation acceptance is claimed by that record.
