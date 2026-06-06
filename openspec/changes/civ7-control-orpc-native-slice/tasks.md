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
- [x] 2.2 Extract a policy map for validator-first, no-repeat,
  relationship authority, projection, proof labels, telemetry, and command
  serialization.
- [x] 2.3 Extract a dependency map for direct-control facade, endpoint
  defaults, state selection, logger, evidence sink, clock, risk
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
    attention composer over direct-control ready-unit source evidence.
  - [x] 4.11.2 Burn down the transitional `city.ready.view` control-oRPC
    facade leaf after `attention.current` became the service-owned ready-city
    attention composer over direct-control ready-city source evidence.
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
  - [x] 5.2.6 Extract technology/culture progression-choice postcondition
    policy out of CLI commands into direct-control progression proof ownership.
    Keep native domain-owned progression procedures, shared postcondition
    middleware, runtime proof, and parent Task 5.x/6.x acceptance pending.
  - [x] 5.2.7 Extract turn-completion send proof/no-repeat policy into a
    direct-control-owned helper. Preserve the existing turn-completion runtime
    send path while classifying turn-advanced, turn-complete-sent,
    already-complete, no-state-change, missing-postcondition, and
    pending-runtime-proof paths before any native turn mutation procedure is
    accepted.
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
  - [x] 5.4.5 Record `narrative.choice.request` as a service-owned
    narrative boundary over direct-control narrative runtime, validator, and
    proof ports. The service owns the caller-facing semantic choice shape,
    normal proof projection, raw-output exclusion, and no-repeat next steps;
    no direct-control procedure core, generic decisions root, runtime proof,
    or parent Task 5.x/6.x acceptance.
  - [x] 5.4.6 Record `diplomacy.response.request` as a
    service-owned diplomacy boundary over direct-control diplomacy runtime,
    validator, and proof ports. The service owns the caller-facing semantic
    response shape, normal proof projection, raw-output exclusion, and
    no-repeat next steps; direct-control-only UI toggles, generic decisions
    catalogs, runtime proof, and parent Task 5.x/6.x acceptance remain out of
    scope.
  - [x] 5.4.7 Burn down root public exports of direct-control runtime-port
    result aliases from `@civ7/control-orpc`. Keep the live direct-control
    facade and facade type available for edge-adapter context construction, but
    leave raw result envelopes internal to service dependencies/tests or owned
    by `@civ7/direct-control`.
  - [x] 5.4.8 Split the live direct-control facade and facade type out of the
    root `@civ7/control-orpc` service entrypoint and into explicit
    `@civ7/control-orpc/runtime` context-construction exports for CLI and
    Studio edge adapters.
  - [x] 5.4.9 Move shared caller-facing component ID and map-location
    primitive schemas into `packages/civ7-control-orpc` service model
    ownership, prove equivalence to direct-control primitives, and switch
    attention, notification, city, unit, narrative, diplomacy, progression,
    and strategy contracts off direct-control primitive value imports.
  - [x] 5.4.10 Move `notifications.dismiss.request` caller-facing input and
    normal postcondition classification schemas into control-oRPC service
    ownership while leaving direct-control notification dismissal runtime/proof
    helpers authoritative.
  - [x] 5.4.11 Move `city.production.choice.request` caller-facing input and
    normal postcondition classification schemas into control-oRPC service
    ownership while leaving direct-control production-choice runtime/proof
    helpers authoritative.
  - [x] 5.4.12 Move `unit.target.action.request` caller-facing input schema
    into control-oRPC service ownership while leaving direct-control unit
    target action runtime/proof helpers authoritative.
  - [x] 5.4.13 Add a package verification guard that fails if control-oRPC
    module contract files import direct-control, while leaving runtime/proof
    procedure imports and focused equivalence tests out of that guard.
  - [x] 5.4.14 Record `progression.technology.choice.request` and
    `progression.culture.choice.request` as service-owned progression
    boundaries over direct-control technology/culture closeout runtime ports
    and progression-choice proof helpers. The service owns caller-facing
    input, semantic evidence/proof projection, raw-output exclusion, and
    no-repeat next steps; broad choice/action catalogs, runtime proof, and
    parent Task 5.x/6.x acceptance remain out of scope.
  - [x] 5.4.15 Record `turn.complete.request` as a service-owned turn
    mutation boundary over the direct-control turn completion runtime port and
    turn-completion proof helper. The service owns the empty caller-facing
    input, semantic before/after proof projection, raw-output exclusion, and
    no-repeat next steps; CLI end-turn migration, runtime proof, and parent
    Task 5.x/6.x acceptance remain out of scope.
  - [x] 5.4.16 Narrow the control-oRPC runtime facade for
    `city.population.place.request` from generic player/city operation ports
    to semantic assign-worker and expand-city placement ports. Keep
    direct-control's low-level player-operation/city-command authority inside
    the live facade adapter and keep raw operation inputs out of the exported
    context-construction surface.
- [ ] 5.5 Compose the layered behavior into native oRPC/effect-orpc routers
  only after the hierarchy and ownership boundaries are real.
  - [x] 5.5.1 Seed `attention.current` as a native service-owned procedure
    that derives semantic blockers, decisions, ready actors, and next steps
    from existing direct-control runtime ports.
  - [x] 5.5.2 Enrich `attention.current` with turn-completion evidence so
    end-turn next steps require source-owned turn status instead of clean
    notifications alone.
  - [x] 5.5.3 Seed `city.production.choice.request` as the first native
    write-capable procedure leaf, with oRPC readiness and semantic
    production proof projection over the direct-control production-choice
    runtime port.
  - [x] 5.5.4 Seed `notifications.dismiss.request` as the second native
    write-capable procedure leaf, with oRPC readiness and semantic
    notification dismissal proof projection over the direct-control
    notification dismissal runtime port.
  - [x] 5.5.5 Seed `unit.target.action.request` as a single native unit
    procedure leaf, with oRPC readiness and semantic unit-target proof
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
  - [x] 5.5.10 Seed `narrative.choice.request` as a native
    service-owned narrative procedure that composes playable
    readiness, direct-control narrative request authority, and source-owned
    narrative proof classification into semantic output without exposing raw
    command/session/payload details or claiming runtime/live proof.
  - [x] 5.5.11 Seed `diplomacy.response.request` as a native
    service-owned diplomacy procedure that composes playable
    readiness, direct-control diplomacy response authority, and source-owned
    diplomacy proof classification into semantic output without exposing raw
    command/session/payload/UI-closeout details or claiming runtime/live proof.
  - [x] 5.5.12 Seed `progression.technology.choice.request` and
    `progression.culture.choice.request` as native service-owned progression
    procedures that compose playable readiness, before/after
    notification evidence, direct-control technology/culture closeout
    authority, and source-owned progression proof classification into semantic
    output without exposing raw command/session/payload/App UI closeout details
    or claiming runtime/live proof.
  - [x] 5.5.13 Guard progression choice post-send notification read failures
    as sent-unverified pending runtime proof with no-repeat next steps, instead
    of surfacing a generic unavailable error after mutation authority may have
    been used.
  - [x] 5.5.13.1 Bind progression choice closeout request identity to the
    before-notification read's local-player evidence before invoking
    direct-control technology/culture closeout ports. Keep caller `playerId` as
    validation/context input, not controller/runtime send authority, and keep
    progression bridge allowlisting pending.
  - [x] 5.5.14 Seed `turn.complete.request` as a native service-owned turn
    mutation procedure that composes playable readiness,
    direct-control turn-completion send authority, and source-owned
    turn-completion proof classification into semantic output without exposing
    raw command/session/Tuner details or claiming runtime/live proof.

## 6. Native Policy Layering

- [ ] 6.1 Promote shared middleware only after modularized behavior shows a
  repeated policy and the implementation uses native oRPC/effect-orpc
  primitives.
  - [x] 6.1.1 Retire caller-provided approval as a product concept. Preserve
    the historical middleware evidence only as proof that repeated mutation
    policies must use native oRPC middleware when they remain real.
  - [x] 6.1.2 Promote the repeated mutation playable-readiness precondition
    into shared native effect-oRPC middleware over existing direct-control
    playable-status runtime ports. Keep live-game proof, transport
    propagation, validator-first middleware, and postcondition/proof
    middleware pending.
  - [x] 6.1.3 Promote the repeated readiness mutation procedure chain into a
    leaf-scoped native effect-oRPC helper reused by existing mutation leaves.
    Keep validator-first middleware, postcondition/proof middleware, telemetry
    propagation, live runtime proof, and parent Task 6.x acceptance pending.
- [x] 6.2 Remove caller-provided approval from mutation procedures.
  - [x] 6.2.1 Remove approval parameters from direct-control runtime
    ports, telemetry records, control-oRPC context, controller envelopes, CLI
    flags, Studio/script callers, tests, and package exports while preserving
    validator-first, readiness, postcondition/no-repeat, local-player/hotseat,
    and no-raw-output boundaries.
  - [x] 6.2.2 Remove the shared mutation approval middleware and typed error
    branch from `packages/civ7-control-orpc`; mutation procedure composition
    continues through native readiness middleware and source-owned
    validation/proof projection until further real middleware repetition exists.
  - [x] 6.2.3 Keep mutation requests semantic and closed against endpoint,
    session, state, raw command, and caller-supplied controller proof fields
    after approval removal.
  - [x] 6.2.4 Retire stale active approval/reason guidance from older
    controller ingress records, Studio Run-in-Game planning docs, and
    capability-inventory docs. Historical/superseded review evidence may remain
    only when it clearly says the old caller-approval mechanic is retired.
- [ ] 6.3 Add validator-first and postcondition/proof middleware before
  mutation sends.
  - [x] 6.3.1 Compose `city.production.choice.request` through the
    direct-control validator-first production-choice port and project
    source-owned postcondition/no-repeat proof semantics into normal output;
    keep shared validator/postcondition middleware pending.
  - [x] 6.3.2 Compose `notifications.dismiss.request` through the
    direct-control validation/postcondition dismissal port and project
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
  - [x] 6.3.5 Compose `narrative.choice.request` through the
    direct-control narrative request runtime port and project source-owned
    narrative proof/no-repeat semantics into normal output; keep shared
    validator/postcondition middleware pending.
  - [x] 6.3.6 Compose `diplomacy.response.request` through the
    direct-control diplomacy response runtime port and project source-owned
    diplomacy proof/no-repeat semantics into normal output; keep shared
    validator/postcondition middleware pending.
  - [x] 6.3.7 Extract repeated closeout-style postcondition projection into a
    shared control-oRPC mutation policy helper reused by notification,
    narrative, and diplomacy mutation procedures. Keep direct-control proof
    classifiers as source authority and keep shared validator/postcondition
    middleware pending.
  - [x] 6.3.8 Compose `progression.technology.choice.request` and
    `progression.culture.choice.request` through direct-control
    technology/culture closeout runtime ports and source-owned progression
    choice proof/no-repeat semantics; keep shared validator/postcondition
    middleware pending.
  - [x] 6.3.9 Preserve progression choice no-repeat proof boundaries when
    after-read evidence is unavailable after a sent closeout; keep live
    runtime proof and shared postcondition middleware pending.
  - [x] 6.3.10 Extend the shared closeout-style mutation projection helper to
    progression choice request leaves so source-owned progression
    postconditions and explicit pending-proof boundaries derive normal
    postcondition summaries, request status, and no-repeat next steps without
    accepting shared validator/postcondition middleware.
  - [x] 6.3.11 Compose `turn.complete.request` through direct-control
    turn-completion runtime authority and source-owned turn-completion
    proof/no-repeat semantics; keep live runtime proof and shared
    validator/postcondition middleware pending.
  - [x] 6.3.12 Promote a shared native oRPC/effect-oRPC mutation proof
    boundary middleware that inspects procedure outputs after handlers run,
    rejects missing postcondition/no-repeat envelopes, and refuses
    unverified or pending-runtime-proof outputs that would appear repeat-safe.
    Keep validator-first middleware, telemetry sinks, runtime proof, and
    parent Task 6.x acceptance pending.
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
    `narrative.choice.request` direct-control runtime-port failures
    while keeping raw direct-control cause, command, session, and payload
    details out of public error data.
  - [x] 6.4.8 Use native effect-orpc tagged error constructors for
    `diplomacy.response.request` direct-control runtime-port
    failures while keeping raw direct-control cause, command, session, payload,
    and UI-closeout details out of public error data.
  - [x] 6.4.9 Use native effect-orpc tagged error constructors for progression
    choice direct-control runtime-port failures while keeping raw
    direct-control cause, command, session, payload, and App UI closeout
    details out of public error data.
  - [x] 6.4.10 Use native effect-orpc tagged error constructors for
    `turn.complete.request` direct-control runtime-port failures while keeping
    raw direct-control cause, command, session, state, and Tuner details out of
    public error data.

## 7. Edge Adapters

- [x] 7.1 Route selected CLI callers through the in-process procedure client
  only after the service-owned router shape is stable.
  - [x] 7.1.1 Route `civ7 game status` through the in-process
    `readiness.current` server-side client. Keep CLI endpoint flags as context
    construction, emit the semantic readiness projection, and keep raw
    direct-control playable-status internals out of normal status output.
  - [x] 7.1.2 Route `civ7 game play end-turn --send` through the in-process
    `turn.complete.request` server-side client. Keep endpoint flags and
    endpoint defaults as context construction, emit the semantic
    turn-completion projection for send and expected guard-blocked `not-sent`
    output, preserve the existing direct-control status read for check-only
    mode, and keep live runtime proof pending.
  - [x] 7.1.3 Route `civ7 game play dismiss-notification --send` through the
    in-process `notifications.dismiss.request` server-side client. Keep
    endpoint flags and endpoint defaults as context construction, emit the
    semantic notification dismissal projection for send output, preserve the
    existing direct-control notification dismissal read for inspect-only mode,
    and keep live runtime proof pending.
  - [x] 7.1.4 Route `civ7 game play unit-target --send` through the
    in-process `unit.target.action.request` server-side client under the
    `unit` router. Keep endpoint flags as context
    construction, emit the semantic unit target action projection for send
    output, preserve the existing direct-control unit target planning read for
    read-only mode, and keep live runtime proof pending.
  - [x] 7.1.5 Route `civ7 game play build-production --send` through the
    in-process `city.production.choice.request` server-side client under the
    `city` router. Keep endpoint flags as context
    construction, emit the semantic city production choice projection for send
    output, preserve the existing direct-control operation validation path for
    read-only mode, leave `game play build-unit` outside this slice, and keep
    live runtime proof pending.
  - [x] 7.1.6 Route `civ7 game play respond-diplomacy --send` through the
    in-process `diplomacy.response.request` server-side client under
    the `diplomacy` router. Keep endpoint flags as context
    construction, emit the semantic diplomacy response projection for send
    output with direct-control acted/local-player evidence rather than treating
    `--player-id` as send authority, preserve the existing direct-control
    player-operation validation path for read-only mode, leave
    `game play respond-first-meet` outside this slice, and keep live runtime
    proof pending.
  - [x] 7.1.7 Route `civ7 game play choose-narrative --send` through the
    in-process `narrative.choice.request` server-side client under
    the `narrative` router. Keep endpoint flags as context
    construction, emit the semantic narrative choice projection for send output
    with direct-control acted/local-player evidence rather than treating
    `--player-id` as send authority, preserve the existing direct-control
    `--options` and player-operation validation paths for read-only mode, and
    keep live runtime proof pending.
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
    runtime adapter, mutation calls require local-player/hotseat lifecycle
    proof, and source implementation remains pending.
  - [x] 7.3.2 Seed a package-local read-only controller ingress core for
    `readiness.current`: validate a closed serialized envelope, allowlist the
    procedure key, construct context through a caller-owned factory, call the
    existing in-process router client, and keep Civ7 UIScript/game-scope bridge
    installation, mutation allowlists, runtime proof, and full `7.3`
    implementation pending.
  - [x] 7.3.3 Install a package-local `Civ7IntelligenceBridge` global binding
    over the existing controller ingress on a caller-provided target:
    expose only `invoke(request)`, reject accidental overwrite unless explicitly
    replaced, delegate to the existing in-process router ingress, and keep
    ambient `globalThis` selection by the Civ7 UIScript adapter, mutation
    allowlists, runtime proof, and full `7.3` implementation pending.
  - [x] 7.3.4 Allowlist the service-owned read-only `attention.current`
    procedure through the package-local controller ingress: validate the
    existing attention input schema, delegate to the existing in-process router
    client, preserve raw command/session/tuner endpoint rejection, and keep
    mutation allowlists, local-player/hotseat proof, runtime proof, Civ7
    UIScript/modinfo packaging, and full `7.3` implementation pending.
  - [x] 7.3.5 Allowlist the first controller-ingress mutation,
    `notifications.dismiss.request`, only behind a closed serialized
    controller-context proof envelope. Require
    game-controller-ready lifecycle, `GameContext.localPlayerID`, and
    single-local-player/hotseat evidence in controller context before native
    router dispatch; keep
    additional mutation allowlists, UIScript/modinfo packaging, runtime proof,
    and full `7.3` implementation pending.
  - [x] 7.3.6 Allowlist `turn.complete.request` through the same closed
    controller-context proof envelope. Require
    game-controller-ready lifecycle, `GameContext.localPlayerID`, and
    single-local-player/hotseat evidence in controller context before native
    router dispatch; keep
    further mutation allowlists, UIScript/modinfo packaging, runtime proof, and
    full `7.3` implementation pending.
  - [x] 7.3.7 Allowlist `unit.target.action.request` through the same closed
    controller-context proof envelope. Require
    game-controller-ready lifecycle, `GameContext.localPlayerID`, and
    single-local-player/hotseat evidence in controller context before native
    router dispatch; keep
    further mutation allowlists, UIScript/modinfo packaging, runtime proof, and
    full `7.3` implementation pending.
  - [x] 7.3.8 Allowlist `city.production.choice.request` through the same
    closed controller-context proof envelope. Require
    game-controller-ready lifecycle, `GameContext.localPlayerID`, and
    single-local-player/hotseat evidence in controller context before native
    router dispatch; keep
    further mutation allowlists, UIScript/modinfo packaging, runtime proof, and
    full `7.3` implementation pending.
  - [x] 7.3.9 Allowlist `city.population.place.request` through the same
    closed controller-context proof envelope. Require
    game-controller-ready lifecycle, `GameContext.localPlayerID`, and
    single-local-player/hotseat evidence in controller context before native
    router dispatch; validate
    the existing semantic assign-worker/expand-city input shape, keep raw
    player-operation/city-command internals out of bridge
    output, and keep further mutation allowlists, UIScript/modinfo packaging,
    runtime proof, and full `7.3` implementation pending.
  - [x] 7.3.10 Allowlist `narrative.choice.request` through the same closed
    controller-context proof envelope. Require
    game-controller-ready lifecycle, `GameContext.localPlayerID`, and
    single-local-player/hotseat evidence in controller context before native
    router dispatch; validate
    the existing semantic narrative choice input shape, keep raw
    player-operation/App UI closeout/panel/popup internals
    out of bridge output, and keep further mutation allowlists,
    UIScript/modinfo packaging, runtime proof, and full `7.3` implementation
    pending.
  - [x] 7.3.11 Allowlist `diplomacy.response.request` through the same closed
    controller-context proof envelope. Require
    game-controller-ready lifecycle, `GameContext.localPlayerID`, and
    single-local-player/hotseat evidence in controller context before native
    router dispatch; validate
    the existing semantic diplomacy response input shape, keep raw
    player-operation/App UI closeout/notification/direct-control runtime
    internals out of bridge output, and keep further
    mutation allowlists, UIScript/modinfo packaging, runtime proof, and full
    `7.3` implementation pending.
  - [x] 7.3.12 Allowlist `progression.technology.choice.request` and
    `progression.culture.choice.request` through the same closed controller
    controller-context proof envelope. Require game-controller-ready lifecycle,
    `GameContext.localPlayerID`, and single-local-player/hotseat evidence in
    controller context before native router dispatch; validate the existing semantic
    player/node/notification input shape, keep raw player-operation/App UI
    closeout/direct-control runtime internals out of bridge
    output, and keep further mutation allowlists, UIScript/modinfo packaging,
    runtime proof, and full `7.3` implementation pending.
  - [x] 7.3.13 Seed the repo-owned game-scoped controller bootstrap package:
    add a `mods/*` package with generated `scope="game"` `<UIScripts>`
    `.modinfo`, bundle a single UI entry that installs the existing
    `Civ7IntelligenceBridge` through the narrow `@civ7/control-orpc/game-ui`
    entrypoint, and provide a local game-UI readiness context for
    `readiness.current` that does not report mutation capability while mutation
    ports remain unsupported. Split direct-control proof/postcondition helper
    imports onto proof-only package subpaths so the generated UI bundle does not
    import Node/socket direct-control runtime code. Keep mutation runtime ports,
    lifecycle/hotseat certification, Civ7 deployment, live runtime proof, and
    full `7.3` implementation pending.
  - [x] 7.3.14 Move controller mutation proof authority out of the serialized
    caller envelope and into controller context. Require mutation request
    envelopes to carry semantic input only; reject caller-supplied `controllerProof` as an extra field. Require
    context-owned game-controller-ready lifecycle, `GameContext.localPlayerID`,
    and single-local-player/hotseat proof before native router dispatch. Let
    the game-UI adapter derive that proof from ambient `UI`, `GameContext`, and
    `Players` globals while mutation runtime ports remain unsupported. Keep
    Civ7 deployment, live runtime proof, mutation runtime support, and full
    `7.3` implementation pending.
  - [x] 7.3.15 Add the first game-resident mutation runtime port for
    `notifications.dismiss.request`: expose a game UI notification-dismissal
    access path that executes against ambient `Game.Notifications`,
    `NotificationModel`, `GameContext`, and notification queue evidence without
    tuner socket/session command serialization; wire
    `@civ7/control-orpc/game-ui` to use it when controller proof and
    notification dismissal APIs are available through an explicit
    context-supported procedure list; keep broad `readiness.current`
    observe/mutate capability conservative while only
    `notifications.dismiss.request` is admitted; keep normal bridge output
    semantic and raw route/session/state/command details omitted;
    keep other mutation runtime ports, deployed Civ7 proof, play-thread action,
    and full `7.3` implementation pending.
  - [x] 7.3.16 Expose narrow game-controller supported procedure facts through
    `readiness.current`: derive read/mutation support from typed oRPC context,
    report `notifications.dismiss.request` as the only game-UI supported
    mutation when its runtime port is actually available, and keep broad
    `canObserve`, `canMutate`, and `read-attention` readiness conservative
    until the corresponding read/attention and mutation ports exist. Keep live
    runtime proof, other game-UI ports, a separate controller catalog, and full
    `7.3` implementation pending.
  - [x] 7.3.17 Add the first service-owned game UI attention read adapter for
    `attention.current`: keep game UI attention semantics in the control-oRPC
    service/controller adapter while reading ambient `Game.Notifications`,
    turn, end-turn blocker, and first-ready-unit facts without tuner
    socket/session command serialization; wire
    `@civ7/control-orpc/game-ui` to list `attention.current` as a supported
    read only when controller proof plus notification and first-ready-unit APIs
    are available; remove the direct-control game-UI attention export rather
    than preserving a runtime-shaped semantic port; treat first-ready-unit as
    the only game-UI ready-unit source evidence, keep selected-unit ids as
    hints only, keep ready-city source reads `skipped-unsupported` until an
    official ready-city source exists, prevent `end-turn` recommendations
    without full ready actor coverage, and mark truncated notification coverage
    so partial reads do not imply no blockers. Keep other game-UI read/mutation
    ports, deployed Civ7 proof, play-thread action, and full `7.3`
    implementation pending.
  - [x] 7.3.18 Add a game-resident turn-completion runtime port for
    `turn.complete.request`: expose ambient `GameContext.sendTurnComplete`,
    `hasSentTurnComplete`, `canEndTurn`, turn, blocker, and first-ready-unit
    evidence through the existing service-owned turn procedure; require an
    actual send function before reporting `sent: true`; preserve semantic
    not-sent/no-repeat output for blocked and already-sent paths; keep raw
    game-UI function names, command/session/state details, deployed Civ7
    proof, play-thread action, and full `7.3` acceptance pending.
  - [x] 7.3.19 Add a game-resident production-choice runtime dependency for
    `city.production.choice.request`: expose ambient
    `Game.CityOperations.canStart/sendRequest`, `CityOperationTypes.BUILD`,
    city, notification-blocker, and selected-city evidence through the
    existing service-owned city production procedure; advertise the mutation
    only when those exact game UI APIs and controller proof exist; preserve
    semantic validator-blocked not-sent and no-repeat proof output; keep raw
    game-UI function names, command/session/state details, deployed Civ7
    proof, play-thread action, other city mutation ports, and full `7.3`
    acceptance pending.
  - [x] 7.3.20 Add a game-resident population-placement runtime dependency for
    `city.population.place.request`: expose ambient
    `Game.PlayerOperations.canStart/sendRequest` for `ASSIGN_WORKER`,
    `Game.CityCommands.canStart/sendRequest` for `EXPAND`, player/city
    readiness, worker placement, and expansion evidence through the existing
    service-owned city population procedure; advertise the mutation only when
    those exact game UI APIs and controller proof exist; preserve semantic
    validator-blocked not-sent, local-player bounded assign-worker sends, and
    no-repeat proof output for missing/failed population state evidence; keep
    raw game-UI function names, command/session/state details, deployed Civ7
    proof, play-thread action, other mutation ports, and full `7.3` acceptance
    pending.
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
- [x] 8.5 Run direct-control narrative proof, control-oRPC narrative,
  package check/build, OpenSpec strict validation, and diff hygiene gates for
  `narrative.choice.request` before closing that slice.
- [x] 8.6 Run direct-control diplomacy proof, control-oRPC diplomacy response,
  package check/build, OpenSpec strict validation, and diff hygiene gates for
  `diplomacy.response.request` before closing that slice.
- [x] 8.7 Run focused control-oRPC mutation projection policy and affected
  notification/narrative/diplomacy procedure tests, package check/build,
  strict OpenSpec validates, and diff hygiene when the shared closeout
  projection helper is extracted.
- [x] 8.8 Run strict OpenSpec validates and diff hygiene for the controller
  bridge preflight record. No source implementation, runtime proof, play-thread
  action, or `7.3` implementation acceptance is claimed by that record.
- [x] 8.9 Run focused controller-ingress package tests, package check/build,
  strict OpenSpec validates, and diff hygiene for the read-only
  `readiness.current` controller ingress source seed.
- [x] 8.10 Run focused intelligence-bridge/controller-ingress tests, package
  check/build, strict OpenSpec validates, and diff hygiene for the package-local
  global bridge binding source seed.
- [x] 8.11 Run focused controller-ingress/intelligence-bridge tests, package
  check/build, strict OpenSpec validates, and diff hygiene for the
  `attention.current` controller ingress allowlist slice.
- [x] 8.31 Run focused controller-ingress, notification-dismissal, and
  intelligence-bridge tests, control-oRPC check/build, strict OpenSpec
  validates, and diff hygiene for the first controller mutation ingress
  allowlist slice.
- [x] 8.32 Run focused population-placement procedure tests, control-oRPC
  package test/check/build, strict OpenSpec validates, generic runtime-port
  scan, and diff hygiene for the population placement runtime facade narrowing
  slice.
- [x] 8.33 Run focused controller-ingress, turn-completion, and
  intelligence-bridge tests, control-oRPC package test/check/build, strict
  OpenSpec validates, and diff hygiene for the controller turn-completion
  ingress allowlist slice.
- [x] 8.34 Run focused mutation procedure regressions, control-oRPC package
  test/check/build, strict OpenSpec validates, and diff hygiene for the shared
  native mutation procedure helper slice.
- [x] 8.35 Run focused controller-ingress and unit-target action procedure
  tests, control-oRPC package test/check/build, strict OpenSpec validates, and
  diff hygiene for the controller unit-target action ingress allowlist slice.
- [x] 8.36 Run focused controller-ingress and city-production-choice procedure
  tests, control-oRPC package test/check/build, strict OpenSpec validates, and
  diff hygiene for the controller city production choice ingress allowlist
  slice.
- [x] 8.37 Run focused controller-ingress and population-placement procedure
  tests, control-oRPC package test/check/build, strict OpenSpec validates, and
  diff hygiene for the controller city population placement ingress allowlist
  slice. These are local package proofs only and do not claim Civ7
  UIScript/modinfo packaging, live runtime proof, play-thread action, or full
  `7.3` acceptance.
- [x] 8.38 Run focused controller-ingress and narrative-choice procedure tests,
  control-oRPC package test/check/build, strict OpenSpec validates, and diff
  hygiene for the controller narrative choice ingress allowlist slice. These
  are local package proofs only and do not claim Civ7 UIScript/modinfo
  packaging, live runtime proof, play-thread action, or full `7.3` acceptance.
- [x] 8.39 Run focused controller-ingress and diplomacy-response procedure
  tests, control-oRPC package test/check/build, strict OpenSpec validates, and
  diff hygiene for the controller diplomacy response ingress allowlist slice.
  These are local package proofs only and do not claim Civ7 UIScript/modinfo
  packaging, live runtime proof, play-thread action, or full `7.3` acceptance.
- [x] 8.40 Run focused control-oRPC progression choice procedure tests,
  control-oRPC package test/check/build, strict OpenSpec validates, and diff
  hygiene for the progression local-player evidence repair. These are local
  package proofs only and do not allowlist progression through the controller
  bridge, claim live runtime proof, or accept parent Task 7.3.
- [x] 8.41 Run focused controller-ingress and progression-choice procedure
  tests, control-oRPC package test/check/build, strict OpenSpec validates, and
  diff hygiene for the controller progression choice ingress allowlist slice.
  These are local package proofs only and do not claim Civ7 UIScript/modinfo
  packaging, live runtime proof, play-thread action, or full `7.3` acceptance.
- [x] 8.42 Run focused game-UI bootstrap/control-oRPC tests, controller mod
  package tests/check/build, control-oRPC package test/check/build, strict
  OpenSpec validates, and diff hygiene for the game-scoped controller bootstrap
  package seed. Include a bundle scan proving the generated UI script omits
  Node built-in imports, direct-control package-root/socket runtime code, raw
  command/session strings, and RPC transport symbols. These are local
  source/bundle proofs only and do not claim deployed Civ7 runtime proof,
  mutation runtime support, play-thread action, or full `7.3` acceptance.
- [x] 8.43 Run focused controller-ingress and game-ui controller tests,
  control-oRPC package check/build/test, strict OpenSpec validates, and diff
  hygiene for the context-owned controller proof slice. These are local package
  proofs only and do not claim deployed Civ7 runtime proof, mutation runtime
  support, play-thread action, or full `7.3` acceptance.
- [x] 8.44 Run direct-control check/build for the game-safe notification
  dismissal subpath, focused game-ui/controller/notification procedure tests,
  control-oRPC package check/build/test, controller mod package check/build/test
  with bundle scan, strict OpenSpec validates, and diff hygiene for the first
  game-resident notification dismissal runtime port. These are local package
  and bundle proofs only and do not claim deployed Civ7 runtime proof, other
  mutation runtime support, play-thread action, or full `7.3` acceptance.
- [x] 8.45 Run focused readiness/current, game-ui controller, and controller
  ingress tests plus control-oRPC check/build/test, strict OpenSpec validates,
  and diff hygiene for the controller-supported procedure readiness projection.
  These are local package proofs only and do not claim deployed Civ7 runtime
  proof, additional game-UI runtime ports, play-thread action, a separate
  controller capability catalog, or full `7.3` acceptance.
- [x] 8.46 Run direct-control check/build/test to prove the misplaced game-UI
  attention subpath is removed, focused attention/current, readiness/current,
  controller-ingress, and game-ui controller procedure tests, control-oRPC
  package check/build/test, controller mod package check/build/test with bundle
  scan, strict OpenSpec validates, and diff hygiene for the service-owned game
  UI attention read adapter. These are local package and bundle proofs only and
  do not claim deployed Civ7 runtime proof, full attention source coverage,
  play-thread action, other game-UI source adapters, or full `7.3` acceptance.
- [x] 8.47 Run focused game-ui controller and turn-completion procedure tests,
  control-oRPC package check/build/test, controller mod package check/build/test
  with bundle scan, generated direct-control/control-oRPC artifact
  approval-token absence scan, strict OpenSpec validates, and diff hygiene for
  the game-resident turn-completion runtime port. These are local package and
  bundle proofs only and do not claim deployed Civ7 runtime proof, play-thread
  action, other game-UI mutation ports, or full `7.3` acceptance.
- [x] 8.48 Run active-doc approval/reason scans, strict OpenSpec validates, and
  diff hygiene for the approval-removal guidance cleanup. This is a docs/spec
  authority cleanup only and does not claim source behavior changes, deployed
  Civ7 runtime proof, play-thread action, or full parent Task 6.x/7.3
  acceptance.
- [x] 8.49 Run focused game-ui controller and city-production-choice procedure
  tests plus control-oRPC check/build/test, controller mod package check/build/test
  with bundle scan, strict OpenSpec validates, and diff hygiene for the
  game-resident production-choice runtime dependency. These are local package
  and bundle proofs only and do not claim deployed Civ7 runtime proof,
  play-thread action, other city mutation ports, or full `7.3` acceptance.
- [x] 8.50 Run focused game-ui controller, city-population-placement procedure,
  and controller-ingress tests plus control-oRPC check/build/test, controller
  mod package check/build/test with bundle scan, strict OpenSpec validates, and
  diff hygiene for the game-resident population-placement runtime dependency.
  These are local package and bundle proofs only and do not claim deployed Civ7
  runtime proof, play-thread action, other mutation ports, or full `7.3`
  acceptance.
- [x] 8.12 Run control-oRPC package check/build, the Studio RPCLink edge test,
  strict OpenSpec validates, public root-export scan, and diff hygiene for the
  raw runtime result root-export burn-down slice.
- [x] 8.13 Run control-oRPC package test/check/build, affected CLI/Studio
  checks/tests, strict OpenSpec validates, root facade-export scan, and diff
  hygiene for the explicit runtime entrypoint split.
- [x] 8.14 Run focused primitive-schema equivalence and affected procedure
  tests, control-oRPC package test/check/build, strict OpenSpec validates,
  primitive import scan, and diff hygiene for the shared service primitive
  ownership slice.
- [x] 8.15 Run focused notification dismissal procedure/contract tests,
  control-oRPC package test/check/build, strict OpenSpec validates,
  notification contract direct-control import scan, and diff hygiene for the
  notification dismissal service contract ownership slice.
- [x] 8.16 Run focused production choice procedure/contract tests,
  control-oRPC package test/check/build, strict OpenSpec validates, city
  contract direct-control import scan, and diff hygiene for the production
  choice service contract ownership slice.
- [x] 8.17 Run focused unit target action procedure/contract tests,
  control-oRPC package test/check/build, strict OpenSpec validates, unit
  contract direct-control import scan, and diff hygiene for the unit target
  action service contract ownership slice.
- [x] 8.18 Run the control-oRPC contract-ownership lint guard through package
  check, control-oRPC package test/build, strict OpenSpec validates, and diff
  hygiene for the service contract ownership guard slice.
- [x] 8.19 Run focused direct-control progression-choice postcondition tests,
  adjacent CLI technology/culture command tests, direct-control check/build,
  relevant OpenSpec strict validates, and diff hygiene for the progression
  choice proof-policy ownership slice.
- [x] 8.20 Run focused control-oRPC progression choice decision procedure
  tests, control-oRPC package test/check/build, focused direct-control
  progression proof-policy tests, relevant OpenSpec strict validates, and diff
  hygiene for the progression choice decision procedure slice.
- [x] 8.21 Run focused control-oRPC progression choice procedure regression,
  package check, relevant OpenSpec strict validates, and diff hygiene for the
  progression choice after-read proof-boundary correction.
- [x] 8.22 Run focused mutation-result policy regression, affected
  notification/narrative/diplomacy/progression procedure tests, package
  test/check/build, relevant OpenSpec strict validates, and diff hygiene for
  the progression closeout projection helper extension.
- [x] 8.23 Run focused turn-completion proof-policy tests, direct-control
  package test/check/build, relevant OpenSpec strict validates, and diff
  hygiene for the turn-completion proof/no-repeat ownership slice.
- [x] 8.24 Run focused control-oRPC turn-completion procedure tests,
  control-oRPC package test/check/build, relevant OpenSpec strict validates,
  and diff hygiene for the native turn completion procedure slice.
- [x] 8.25 Run focused direct-control request-result, control-oRPC turn
  completion, and CLI end-turn tests, `check:cli`, `test:cli:play`, relevant
  OpenSpec strict validates, and diff hygiene for the CLI turn-completion send
  migration slice.
- [x] 8.26 Run focused CLI notification dismissal tests, `check:cli`,
  `test:cli:play`, relevant OpenSpec strict validates, and diff hygiene for
  the CLI notification dismissal send migration slice.
- [x] 8.27 Run focused CLI unit target tests, `check:cli`, `test:cli:play`,
  relevant OpenSpec strict validates, and diff hygiene for the CLI unit target
  send migration slice.
- [x] 8.28 Run focused CLI production tests, `check:cli`, `test:cli:play`,
  relevant OpenSpec strict validates, and diff hygiene for the CLI
  build-production send migration slice.
- [x] 8.29 Run focused CLI diplomacy response tests, `check:cli`,
  `test:cli:play`, relevant OpenSpec strict validates, and diff hygiene for
  the CLI diplomacy response send migration slice.
- [x] 8.30 Run focused direct-control narrative request, control-oRPC
  narrative, CLI narrative tests, `check:cli`, `test:cli:play`,
  relevant OpenSpec strict validates, and diff hygiene for the CLI narrative
  choice send migration slice.
