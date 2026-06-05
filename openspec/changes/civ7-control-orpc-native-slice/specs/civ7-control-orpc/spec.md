## ADDED Requirements

### Requirement: Native oRPC Owns Procedure Composition

Control procedure implementation SHALL use oRPC/effect-orpc primitives for
procedure builders, routers, context propagation, middleware sequencing, typed
errors, and server-side callers.

#### Scenario: Procedure behavior is added
- **WHEN** a new Civ7 control procedure is implemented
- **THEN** the procedure owns the offered service behavior and composition in
  the native oRPC service package
- **AND** it does not merely pass validated input into a same-shaped
  direct-control facade method as a facade-only shell
- **AND** direct-control dependencies are limited to runtime ports, validators,
  postcondition classifiers, command serialization, proof facts, and other
  low-level authority that must remain runtime-owned

#### Scenario: Package root exposes service-owned surface
- **WHEN** `@civ7/control-orpc` publishes its root entrypoint
- **THEN** root exports include service contracts, routers, server-side clients,
  bridge ingress/bindings, semantic procedure input/output schemas, typed
  errors, and the context type needed by native callers
- **AND** root exports do not publish direct-control runtime-port result
  aliases such as playable-status, notification, ready-actor, production,
  target-action, or closeout request result envelopes
- **AND** direct-control runtime result shapes remain internal service
  dependency/test details or are imported from `@civ7/direct-control` when a
  low-level runtime fixture needs the owning type

#### Scenario: Runtime facade entrypoint is needed by edge adapters
- **WHEN** CLI, Studio, or controller edge adapters need to construct a native
  control-oRPC context with the live direct-control runtime facade
- **THEN** they import the live facade and facade type from an explicit
  `@civ7/control-orpc/runtime` entrypoint
- **AND** the root `@civ7/control-orpc` entrypoint remains focused on
  caller-facing service contracts, routers, clients, bridge ingress/bindings,
  typed errors, and semantic procedure schemas/results
- **AND** the runtime entrypoint does not expose raw command/session/tuner
  payloads or make direct-control result envelopes normal service output

#### Scenario: Shared service primitives are needed by procedure contracts
- **WHEN** service-owned procedure contracts need common Civ7 primitives such
  as component IDs or map locations in caller-facing input or output
- **THEN** `packages/civ7-control-orpc` owns equivalent primitive TypeBox
  schemas under its service model
- **AND** focused proof keeps those primitive schemas equivalent to the current
  direct-control runtime-owner primitives
- **AND** procedure contracts do not import direct-control primitive value
  schemas only to describe normal service input or output
- **AND** operation-specific runtime-port schemas, validators, and proof
  helpers may remain direct-control-owned until a later accepted service
  contract slice separates them deliberately

#### Scenario: Notification dismissal service contract is offered
- **WHEN** `notifications.dismiss.request` exposes its caller-facing contract
- **THEN** control-oRPC owns the input schema and normal postcondition
  classification schema for that service procedure
- **AND** the input admits only the semantic notification ID request shape
- **AND** raw command/session/tuner endpoint fields remain excluded from
  procedure input
- **AND** direct-control remains the runtime/proof owner for notification
  dismissal sends, validators, postcondition classification, and no-repeat
  proof semantics consumed by the procedure

#### Scenario: Production choice service contract is offered
- **WHEN** `city.production.choice.request` exposes its caller-facing contract
- **THEN** control-oRPC owns the input schema and normal postcondition
  classification schema for that service procedure
- **AND** the input admits only the semantic city production choice request
  shape: city ID plus exactly one valid production args variant
- **AND** approval, endpoint, session, state, and raw command fields remain
  excluded from procedure input
- **AND** direct-control remains the runtime/proof owner for production-choice
  sends, validators, source postcondition classification, and no-repeat proof
  semantics consumed by the procedure

#### Scenario: Unit target action service contract is offered
- **WHEN** `unit.target.action.request` exposes its caller-facing contract
- **THEN** control-oRPC owns the input schema for that service procedure
- **AND** the input admits only the semantic unit target request shape: unit ID
  plus bounded integer map coordinates
- **AND** approval, endpoint, session, state, and raw command fields remain
  excluded from procedure input
- **AND** direct-control remains the runtime/proof owner for unit target action
  sends, validators, source verification classification, and no-repeat proof
  semantics consumed by the procedure

#### Scenario: Service contract ownership is guarded
- **WHEN** control-oRPC service contracts are checked
- **THEN** package verification fails if module contract files import
  `@civ7/direct-control`
- **AND** the guard is limited to caller-facing service contract ownership
- **AND** direct-control runtime/proof imports remain allowed in procedure,
  dependency, and focused equivalence-test code where they are runtime/proof
  evidence rather than normal service contract authority

#### Scenario: Strategy planning view is added
- **WHEN** a strategy planning procedure is implemented
- **THEN** it composes planning evidence from bounded runtime/read ports into a
  service-owned projection
- **AND** normal output excludes host, port, state, session, raw command, and
  debug transport details
- **AND** planning candidates remain read-only evidence and are not promoted to
  approved movement, attack, war, or send authority
- **AND** other-owner contact, proximity, ranking, and action legality preserve
  relationship-unproven semantics unless official relationship, team, war, or
  suzerain evidence proves stronger labels

#### Scenario: Transitional facade-only procedure remains
- **WHEN** a current facade-only read leaf is retained while the native service
  shape is being corrected
- **THEN** it is treated as transitional proof debt, not the target pattern
- **AND** workstream authority prevents adding additional facade-only leaves
- **AND** follow-up work either moves service behavior into the native
  procedure or deletes/burns down the transitional shell

#### Scenario: Shared procedure core is implemented
- **WHEN** a Civ7 control procedure package adds contract, router, context,
  middleware, or typed error behavior
- **THEN** that behavior is implemented through oRPC/effect-orpc primitives
- **AND** direct-control source provides only atom logic, policy facts,
  schemas, validators, postcondition classifiers, proof vocabulary, and facade
  dependencies

#### Scenario: Direct-control prework names middleware candidates
- **WHEN** a direct-control slice records approval, validator-first,
  postcondition, relationship, telemetry, error, or correlation behavior for
  future procedures
- **THEN** it names the policy/dependency boundary for future oRPC middleware
- **AND** it does not introduce a custom middleware, context-composition,
  event, router, or transport framework

#### Scenario: Facade failures use native tagged error projection
- **WHEN** a native procedure leaf catches a direct-control facade failure
- **THEN** it constructs the public failure through the effect-orpc tagged
  error constructor supplied by the procedure error map
- **AND** public failures use bounded procedure/source data
- **AND** raw facade cause, session, command, and command-source details remain
  excluded from serialized public errors
- **AND** shared middleware remains pending until the native oRPC/effect-orpc
  error path is proven without custom wrapper plumbing

### Requirement: Procedure Inputs Exclude Runtime Context Controls

Control procedure contracts SHALL keep endpoint, session, state-selection, and
raw command execution controls in context/debug/internal owners rather than
normal procedure input.

#### Scenario: Context supplies runtime dependencies
- **WHEN** a procedure needs endpoint defaults, state selection, logger,
  evidence sink, clock, approval, risk policy, correlation, or direct-control
  facade access
- **THEN** those values are supplied through oRPC context or caller/runtime
  adapter construction
- **AND** normal procedure input omits host, port, session, state, stateName,
  rawCommand, command text, and command-source builder fields

#### Scenario: Raw command tunnel is proposed
- **WHEN** a procedure contract, router, module, descriptor, or bridge exposes
  raw JavaScript, raw command text, socket/session execution, or generic
  `control.call` behavior
- **THEN** the slice is invalid until the raw tunnel is removed or moved behind
  an explicitly accepted debug/internal owner

### Requirement: Staged Implementation Proves In-Process Calls Before Edges

Control-oRPC implementation SHALL prove the shared router in process before
adding HTTP, OpenAPI, WebSocket, Studio, or in-game bridge edge adapters.

#### Scenario: Service-owned procedure module is added
- **WHEN** a service-owned procedure module is implemented
- **THEN** focused tests call it in process with fake context and fake runtime
  port dependencies
- **AND** transport adapters remain absent unless a prior shared-router proof
  exists

#### Scenario: Edge adapter is added
- **WHEN** CLI, Studio, browser, OpenAPI, WebSocket, or in-game bridge code is
  added
- **THEN** the shared in-process router and server-side caller proof already
  exists
- **AND** the adapter does not become an alternate product API or raw command
  tunnel

#### Scenario: In-game controller bridge preflight is recorded
- **WHEN** the in-game controller bridge is planned before source
  implementation
- **THEN** the bridge contract treats `Civ7IntelligenceBridge.invoke(...)` as
  serialized ingress only
- **AND** the game-scoped UIScript owns loading an in-process oRPC/Effect
  router rather than exposing a hand-maintained App UI method table
- **AND** ingress requests identify an allowlisted procedure key and serialized
  procedure input, not raw command/session/tuner payloads
- **AND** controller runtime context owns local-player/hotseat identity,
  approval tokens, lifecycle certification, and proof/evidence sinks
- **AND** implementation remains pending until source owners, schemas/tests,
  mutation proof policy, and runtime proof boundaries are explicitly accepted

#### Scenario: Read-only controller ingress core is seeded
- **WHEN** a package-local controller ingress core is implemented before the
  global UIScript bridge is installed
- **THEN** it validates a closed serialized request envelope with a stable
  allowlisted procedure key and procedure input
- **AND** the first allowlisted procedure is read-only `readiness.current`
- **AND** it constructs oRPC context through a caller-owned controller runtime
  factory
- **AND** it calls the existing in-process router/client rather than
  implementing a second router or custom procedure runner
- **AND** raw command/session/tuner endpoint fields and mutation approvals are
  rejected from the read-only ingress envelope
- **AND** failures project bounded bridge error data without raw direct-control
  command details
- **AND** Civ7 UIScript/game-scope bridge installation, mutation allowlists,
  runtime proof, and full `7.3` implementation remain pending

#### Scenario: Global intelligence bridge binding delegates to ingress
- **WHEN** a package-local `Civ7IntelligenceBridge` binding is installed on a
  caller-provided target before the Civ7 UIScript/modinfo package is
  implemented
- **THEN** the binding exposes only `invoke(request)` on a caller-provided
  target
- **AND** `invoke(request)` delegates to the existing controller ingress over
  the native in-process router/client
- **AND** the installer refuses to overwrite an existing bridge unless
  replacement is explicit
- **AND** raw command/session/tuner endpoint fields remain rejected by the
  ingress envelope after global installation
- **AND** ambient `globalThis` selection by the Civ7 UIScript adapter, mutation
  allowlists, local-player/hotseat proof, runtime proof, and full `7.3`
  implementation remain pending

#### Scenario: Controller ingress allows current attention reads
- **WHEN** the package-local controller ingress expands beyond readiness proof
- **THEN** it may allowlist the service-owned read-only `attention.current`
  procedure
- **AND** `attention.current` requests validate through their existing
  procedure input schema
- **AND** `attention.current` invocation delegates to the existing in-process
  router/client rather than adding a bridge-local dispatcher or read wrapper
- **AND** raw command/session/tuner endpoint fields and mutation approvals
  remain rejected from the ingress envelope
- **AND** mutation allowlists, local-player/hotseat proof, runtime proof, Civ7
  UIScript/modinfo packaging, and full `7.3` implementation remain pending

### Requirement: Mutation Procedures Preserve Direct-Control Proof Semantics

Mutation-capable control procedures SHALL preserve direct-control approval,
validator-first, postcondition, no-repeat-after-unverified, and runtime-proof
boundaries.

#### Scenario: Mutation request procedure is implemented
- **WHEN** a mutation-capable procedure sends or requests a Civ7 operation
- **THEN** approval is checked before send authority
- **AND** validators run before command construction/send where the atom has a
  validator
- **AND** postcondition and proof telemetry classify sent, unverified, stale,
  unknown, missing-postcondition, and pending-runtime-proof outcomes honestly
- **AND** unverified or pending proof paths remain no-repeat guarded

#### Scenario: Closeout-style mutation projection is shared
- **WHEN** notification dismissal, narrative choice, or diplomacy response
  procedures receive source-owned direct-control postcondition evidence
- **THEN** the shared control-oRPC mutation projection policy derives the
  caller-facing postcondition confirmation and no-repeat summary
- **AND** direct-control remains the source authority for domain
  classifications, outcomes, and proof-boundary confidence
- **AND** missing postcondition and pending-runtime-proof inputs project as
  unconfirmed and no-repeat guarded
- **AND** this shared projection helper does not accept shared
  validator/postcondition middleware or parent Task 6.x completion by
  implication

#### Scenario: Narrative decision request procedure is implemented
- **WHEN** a narrative choice decision procedure requests a player choice
- **THEN** it is offered under the semantic `decisions` router
- **AND** it checks mutation approval and playable readiness before invoking
  direct-control runtime authority
- **AND** it consumes direct-control narrative validators and proof helpers as
  runtime/proof ports rather than reimplementing postcondition truth
- **AND** its normal output projects semantic status, validation summary,
  postcondition summary, and next steps
- **AND** it excludes endpoint, session, state, raw command, payload, and
  legacy `verified` details from caller-facing input and output
- **AND** unverified, stale, missing-postcondition, no-state-change, and
  not-sent paths remain no-repeat guarded

#### Scenario: Diplomacy response request procedure is implemented
- **WHEN** a diplomacy response decision procedure requests a player response
- **THEN** it is offered under the semantic `decisions` router
- **AND** it checks mutation approval and playable readiness before invoking
  direct-control runtime authority
- **AND** it consumes direct-control diplomacy validators and proof helpers as
  runtime/proof ports rather than inferring proof from legacy `verified`
- **AND** its normal input exposes player, action, response, and optional
  notification identity rather than direct-control UI toggles
- **AND** its normal output projects semantic status, validation summary,
  postcondition summary, and next steps
- **AND** it excludes endpoint, session, state, raw command, payload,
  notification internals, UI closeout internals, and legacy `verified` details
  from caller-facing input and output
- **AND** unverified, missing-postcondition, no-state-change, validation-changed,
  and not-sent paths remain no-repeat guarded

#### Scenario: Local procedure test passes
- **WHEN** a local fake-context procedure test passes
- **THEN** it may prove contract/middleware/projection behavior
- **AND** it does not claim live Civ7 runtime proof or repeat-safe mutation
  success without accepted runtime evidence

### Requirement: Native Slice Separates Policies, Dependencies, And Modules

Control-oRPC prework SHALL separate domain policies, context dependencies,
repository/read-port style data owners, middleware candidates, and procedure
modules before broad implementation.

#### Scenario: Workstream drifts into repeated read-only wrappers
- **WHEN** implementation momentum is mostly adding read-only facade shells
  while write-capable behavior and proof/policy owners remain unmodularized
- **THEN** the workstream is invalid until it is rebaselined
- **AND** the next implementation path starts with modularizing real behavior,
  including write-capable flows and proof boundaries
- **AND** semantic capability hierarchy and policy layers are defined before
  adding more procedure leaves

#### Scenario: Native router composition resumes
- **WHEN** native oRPC/effect-orpc router work resumes after rebaseline
- **THEN** it composes already-layered service behavior into procedures
- **AND** service logic lives in the native procedure/service layer rather than
  in an unexamined pure TypeScript core wrapped by oRPC

#### Scenario: Capability is prepared for procedure composition
- **WHEN** a direct-control atom is selected for future procedure exposure
- **THEN** its schema owner, dependency requirements, risk boundary, policy
  gates, proof labels, projection class, and runtime proof needs are recorded
- **AND** the future oRPC module can consume those facts without reaching into
  raw command/session internals

#### Scenario: Data or runtime access is needed
- **WHEN** a procedure needs data-layer or runtime access beyond pure input
  values
- **THEN** the access is named as a context dependency, repository/read port,
  or direct-control facade method
- **AND** provider construction remains in caller/runtime assembly rather than
  service module or atom code
