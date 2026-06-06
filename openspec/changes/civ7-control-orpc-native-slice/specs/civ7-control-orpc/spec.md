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
  bridge ingress/bindings, typed errors, and the context type needed by
  native callers
- **AND** procedure input/output schemas and their Standard Schema adapters
  live as contract-owned implementation details consumed through the aggregate
  `Civ7ControlOrpcContract`, not as caller utility exports
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
  typed errors, and aggregate contract access
- **AND** the runtime entrypoint does not expose raw command/session/tuner
  payloads or make direct-control result envelopes normal service output

#### Scenario: Runtime facade narrows population placement ports
- **WHEN** `city.population.place.request` needs low-level player-operation or
  city-command runtime authority for population placement
- **THEN** the control-oRPC runtime facade exposes semantic
  assign-worker-placement and expand-city-placement ports to context
  constructors and procedures
- **AND** those ports accept only the service-owned placement shapes rather
  than generic `operationType` and raw `args`
- **AND** the live facade adapter may map those semantic ports to
  direct-control-owned player-operation and city-command runtime functions
  internally
- **AND** raw generic operation inputs remain excluded from normal procedure
  input and from the exported control-oRPC context-construction surface

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
- **AND** endpoint, session, state, and raw command fields remain
  excluded from procedure input
- **AND** direct-control remains the runtime/proof owner for production-choice
  sends, validators, source postcondition classification, and no-repeat proof
  semantics consumed by the procedure

#### Scenario: Unit target action service contract is offered
- **WHEN** `unit.target.action.request` exposes its caller-facing contract
- **THEN** control-oRPC owns the input schema for that service procedure
- **AND** the input admits only the semantic unit target request shape: unit ID
  plus bounded integer map coordinates
- **AND** endpoint, session, state, and raw command fields remain
  excluded from procedure input
- **AND** direct-control remains the runtime/proof owner for unit target action
  sends, validators, source verification classification, and no-repeat proof
  semantics consumed by the procedure

#### Scenario: Unit upgrade and resettle service contracts are offered
- **WHEN** `unit.upgrade.request` and `unit.resettle.request` expose their
  caller-facing contracts
- **THEN** control-oRPC owns the semantic input and normal postcondition
  summary schemas for those service procedures under the `unit` router
- **AND** upgrade input admits only a unit ID, while resettle input admits only
  a unit ID plus bounded integer destination coordinates
- **AND** endpoint, session, state, raw command, and low-level operation enum
  fields remain excluded from procedure input and normal output
- **AND** direct-control remains the low-level runtime/proof owner for
  `UNITCOMMAND_UPGRADE` and `UNITCOMMAND_RESETTLE` validation, send execution,
  source postcondition classification, and no-repeat proof evidence consumed by
  the procedures

#### Scenario: City town-focus service contracts are offered
- **WHEN** `city.townFocus.change.request` and
  `city.townFocus.review.request` expose their caller-facing contracts
- **THEN** control-oRPC owns the contract-local input, output,
  postcondition, and next-step schemas for those service procedures under the
  `city` router
- **AND** change input admits only city ID, growth type, project type, and an
  optional numeric city arg override, while review input admits only city ID
- **AND** town-focus change versus review is expressed by the city-domain
  procedure path rather than a generic operation root, operation type, or raw
  args input
- **AND** endpoint, session, state, raw command, generic operation type, raw
  args, direct-control operation envelopes, and legacy `verified` remain
  excluded from procedure input and normal output
- **AND** sent town-focus results remain pending-runtime-proof and
  no-repeat guarded until a future source-owned city read/postcondition proves
  the live town project review state changed
- **AND** these new per-leaf input/result schemas and Standard Schema adapters
  stay private to the contract module and are not exported as caller utilities;
  callers use the aggregate contract/router/server client
- **AND** direct-control remains the low-level runtime/proof owner for
  city-command/city-operation town-focus sends, command serialization,
  validator output, and no-repeat proof facts consumed by the procedures

#### Scenario: Progression choice service contract is offered
- **WHEN** `progression.technology.choice.request` and
  `progression.culture.choice.request` expose their caller-facing contracts
- **THEN** control-oRPC owns the input, output, postcondition, evidence, and
  next-step schemas for those service procedures
- **AND** the input admits only player ID, node ID, and optional notification
  identity, with technology versus culture expressed by the domain procedure
  path rather than a generic kind discriminator
- **AND** the evidence summary distinguishes read, failed, and skipped-not-sent
  post-read states without inventing after-state facts
- **AND** endpoint, session, state, raw command, payload, App UI activation
  toggles, and direct-control closeout internals remain excluded from procedure
  input and normal output
- **AND** direct-control remains the runtime/proof owner for technology/culture
  closeout sends, command serialization, notification postcondition
  classifiers, and no-repeat proof semantics consumed by the procedure

#### Scenario: Progression target service contract is offered
- **WHEN** `progression.technology.target.request` and
  `progression.culture.target.request` expose their caller-facing contracts
- **THEN** control-oRPC owns the input, output, postcondition, and next-step
  schemas for those service procedures under the `progression` router
- **AND** the input admits only player ID and node ID, with technology versus
  culture expressed by the domain procedure path rather than a generic
  operation root or operation enum input
- **AND** the procedure reads current local-player evidence before send and
  does not treat caller-provided player ID as mutation authority by itself
- **AND** endpoint, session, state, raw command, generic operation type, raw
  args, direct-control operation envelopes, and legacy `verified` remain
  excluded from procedure input and normal output
- **AND** sent target-setting results remain pending-runtime-proof and
  no-repeat guarded until a future source-owned progression read/postcondition
  proves the live target state changed
- **AND** direct-control remains the low-level runtime/proof owner for
  player-operation target sends, command serialization, validator output, and
  no-repeat proof facts consumed by the procedures

#### Scenario: Government-domain choice service contract is offered
- **WHEN** `government.choice.request` and
  `government.celebration.choice.request` expose their caller-facing contracts
- **THEN** control-oRPC owns the input, output, postcondition, and next-step
  schemas for those service procedures under the `government` router
- **AND** the input admits only player ID plus government type/action or player
  ID plus golden-age type, with government versus celebration expressed by the
  domain procedure path rather than a generic operation root or operation enum
  input
- **AND** the procedure reads current local-player evidence before send and
  does not treat caller-provided player ID as mutation authority by itself
- **AND** endpoint, session, state, raw command, generic operation type, raw
  args, direct-control operation envelopes, and legacy `verified` remain
  excluded from procedure input and normal output
- **AND** sent government-domain choices remain pending-runtime-proof and
  no-repeat guarded until a future source-owned read/postcondition proves the
  live government or celebration blocker cleared
- **AND** direct-control remains the low-level runtime/proof owner for
  player-operation government-domain sends, command serialization, validator
  output, and no-repeat proof facts consumed by the procedures

#### Scenario: Progression player-choice service contracts are offered
- **WHEN** `progression.attribute.purchase.request`,
  `progression.attribute.review.request`,
  `progression.tradition.change.request`, and
  `progression.tradition.review.request` expose their caller-facing contracts
- **THEN** control-oRPC owns the contract-local input, output,
  postcondition, and next-step schemas for those service procedures under the
  `progression` router
- **AND** the new public inputs omit caller `playerId`; purchase input admits
  only an attribute node, tradition change input admits only tradition type and
  action, and review inputs are closed empty objects
- **AND** the procedures read current local-player evidence before send and
  do not treat caller-provided player ID as mutation authority
- **AND** endpoint, session, state, raw command, generic operation type, raw
  args, direct-control operation envelopes, and legacy `verified` remain
  excluded from procedure input and normal output
- **AND** sent attribute/tradition player-choice results remain
  pending-runtime-proof and no-repeat guarded until a future source-owned
  progression read/postcondition proves the live review state changed
- **AND** these new per-leaf input/result schemas and Standard Schema adapters
  stay private to the contract module and are not exported as caller utilities;
  callers use the aggregate contract/router/server client
- **AND** direct-control remains the low-level runtime/proof owner for
  player-operation attribute/tradition sends, command serialization, validator
  output, and no-repeat proof facts consumed by the procedures

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
  authorized movement, attack, war, or send authority
- **AND** other-owner contact, proximity, ranking, and action legality preserve
  relationship-unproven semantics unless official relationship, team, war, or
  suzerain evidence proves stronger labels

#### Scenario: Attention priorities service view is added
- **WHEN** `attention.priorities` exposes a caller-facing priority dashboard
  under the `attention` router
- **THEN** control-oRPC owns the contract-local input/output schemas, native
  service procedure, priority ranking, source-status projection, semantic
  next-step descriptors, and normal output wording
- **AND** the input is closed and admits only priority-read options such as
  notification count, ready-unit bounds, and optional battlefield read bounds;
  it does not accept endpoint, session, state, host, port, command, rawCommand,
  transport, or send-operation fields
- **AND** the procedure composes playable status, notification, turn-completion,
  ready-unit/city, and optional battlefield runtime/read evidence from context
  dependencies rather than adding same-shaped direct-control facade wrappers
- **AND** normal service output emits semantic priority and next-step
  descriptors rather than literal CLI `game play ...` command strings
- **AND** battlefield evidence remains read-only planning context and must not
  be treated as relationship status, action authority, target-send authority,
  or hostile/enemy/opponent/threat/war/ally/suzerain proof
- **AND** normal output omits host, port, state, session, command, rawCommand,
  Tuner payloads, direct-control runtime envelopes, and raw transport details
- **AND** local package tests prove only native service composition and fake
  runtime behavior; deployed Civ7 runtime proof, action-send authority,
  transport expansion, controller allowlisting, and parent Task 5.x/6.x/7.x
  acceptance remain pending

#### Scenario: Civilian route triage service view is added
- **WHEN** `strategy.civilianRouteTriage` exposes a caller-facing civilian
  route planning view under the `strategy` router
- **THEN** control-oRPC owns the contract-local input/output schemas, native
  service procedure, route status, source-status projection, relationship-safe
  reasons, semantic next-step descriptors, and normal output wording
- **AND** the input is closed and admits only route-read options such as player
  id, origin, destination, settlement count, and bounded battlefield/route scan
  limits; it does not accept endpoint, session, state, host, port, command,
  rawCommand, transport, approval, reason, or send-operation fields
- **AND** the procedure composes notification, ready-unit, settlement
  recommendation, battlefield-scan, and destination-analysis runtime/read
  evidence from context dependencies rather than keeping route-status logic in
  CLI code or adding a same-shaped direct-control facade wrapper
- **AND** normal service output emits semantic route triage and next-step
  descriptors rather than literal CLI `game play ...` command strings
- **AND** settlement, battlefield, and destination evidence remains read-only
  planning context and must not be treated as relationship status, movement,
  founding, target-send authority, or hostile/enemy/opponent/threat/war/ally/
  suzerain proof
- **AND** normal output omits host, port, state, session, command, rawCommand,
  Tuner payloads, direct-control runtime envelopes, raw notification details,
  raw settlement factors, raw unit/city arrays, and raw transport details
- **AND** local package tests prove only native service composition and fake
  runtime behavior; deployed Civ7 runtime proof, movement/founding/action-send
  authority, transport expansion, controller allowlisting, and parent Task
  5.x/6.x/7.x acceptance remain pending

#### Scenario: Formation snapshot service view is added
- **WHEN** `strategy.formationSnapshot` exposes a caller-facing formation
  planning view under the `strategy` router
- **THEN** control-oRPC owns the contract-local input/output schemas, native
  service procedure, formation posture, source-status projection,
  relationship-safe reasons, semantic next-step descriptors, and normal output
  wording
- **AND** the input is closed and admits only formation-read options such as
  player id, origin, radius, screen radius, contact radius, and bounded
  battlefield scan limits; it does not accept endpoint, session, state, host,
  port, command, rawCommand, transport, approval, reason, or send-operation
  fields
- **AND** the procedure composes notification, ready-unit, and battlefield-scan
  runtime/read evidence from context dependencies rather than keeping
  formation posture logic in CLI code or adding a same-shaped direct-control
  facade wrapper
- **AND** normal service output emits semantic formation next-step descriptors
  rather than literal CLI `game play ...` command strings
- **AND** ready-unit and battlefield evidence remains read-only planning
  context and must not be treated as relationship status, movement, target-send
  authority, or hostile/enemy/opponent/threat/war/ally/suzerain proof
- **AND** normal output omits host, port, state, session, command, rawCommand,
  Tuner payloads, direct-control runtime envelopes, raw notification details,
  raw ready-unit operations, raw unit evidence payloads, raw unit/city arrays,
  and raw transport details
- **AND** local package tests prove only native service composition and fake
  runtime behavior; deployed Civ7 runtime proof, movement/action-send
  authority, transport expansion, controller allowlisting, and parent Task
  5.x/6.x/7.x acceptance remain pending

#### Scenario: Notification queue service views are added
- **WHEN** `notifications.queue.current` and
  `notifications.queue.dismiss.request` expose caller-facing notification queue
  surfaces under the `notifications` router
- **THEN** control-oRPC owns the contract-local input/output schemas, native
  service procedures, queue disposition, informational dismissal eligibility,
  exclusion reasons, aggregate proof/no-repeat projection, semantic next-step
  descriptors, and normal output wording
- **AND** inputs are closed and admit only bounded queue-read and selected
  bulk-dismissal options such as max notification count, max dismissal count,
  and explicit send intent; they do not accept endpoint, session, state, host,
  port, command, rawCommand, transport, approval, reason, raw operation, or
  caller-supplied proof fields
- **AND** the read procedure composes notification HUD decision queue evidence
  from context dependencies rather than keeping queue scheduling behavior in
  CLI code or exposing raw notification details as the service contract
- **AND** the dismissal request procedure passes native mutation readiness and
  proof/no-repeat middleware, invokes only item-scoped notification dismissal
  runtime ports for eligible informational candidates, excludes operation-
  bearing and unclassified notifications, and keeps aggregate unverified sends
  do-not-repeat guarded
- **AND** normal service output emits semantic notification next-step
  descriptors rather than literal CLI `game play ...` command strings
- **AND** normal output omits host, port, state, session, command, rawCommand,
  Tuner payloads, direct-control runtime envelopes, raw App UI closeout
  internals, legacy `verified`, approval/reason mechanics, raw operation
  payloads, and raw transport details
- **AND** local package tests prove only native service composition and fake
  runtime behavior; deployed Civ7 runtime proof, controller bridge
  allowlisting, transport expansion, broad operation catalog support, and
  parent Task 5.x/6.x/7.x acceptance remain pending

#### Scenario: Advisor warning acknowledgement service is added
- **WHEN** `notifications.advisorWarning.viewed.request` exposes a
  caller-facing advisor-warning acknowledgement under the `notifications`
  router
- **THEN** control-oRPC owns the contract-local target-only input schema,
  native service procedure, fresh local-player evidence read, semantic
  validation and postcondition projection, no-repeat next steps, and normal
  output wording
- **AND** the input is closed and admits only the target notification
  ComponentID; it does not accept caller player id, endpoint, session, state,
  host, port, command, rawCommand, transport, approval, reason, raw operation,
  or caller-supplied proof fields
- **AND** the procedure passes native mutation readiness middleware, reads the
  current notification view for local-player evidence, invokes only the
  source-owned direct-control advisor-warning runtime/proof port, and keeps
  sent outcomes pending-runtime-proof and do-not-repeat guarded until live
  runtime proof is collected
- **AND** normal output omits host, port, state, session, command, rawCommand,
  Tuner payloads, direct-control runtime envelopes, raw player-operation
  details such as `VIEWED_ADVISOR_WARNING` / `Target`, legacy `verified`,
  approval/reason mechanics, and raw transport details
- **AND** local package tests prove only native service composition and fake
  runtime behavior; deployed Civ7 runtime proof, controller bridge
  allowlisting, transport expansion, broad operation catalog support, and
  parent Task 5.x/6.x/7.x acceptance remain pending

#### Scenario: Current world service view is added
- **WHEN** `world.current` exposes a caller-facing current-world read
- **THEN** control-oRPC owns the contract-local input/output schemas, native
  service procedure, normal projection, and next-step wording under the
  `world` router
- **AND** the input is a closed empty object and does not accept endpoint,
  session, state, host, port, command, rawCommand, or transport fields
- **AND** the procedure reads the existing playable/App UI snapshot runtime
  port and projects bounded turn, local-player, map, and player-count facts
  without exposing the raw playable-status envelope
- **AND** the procedure does not call transitional direct-control
  `map.summary.read`, `player.summary.read`, `unit.summary.read`, or
  `city.summary.read` facade wrappers as runtime resources
- **AND** normal output omits actor samples, owner grouping, relationship
  labels, raw app-ui snapshot objects, host, port, state, command, rawCommand,
  session, Tuner payloads, and direct-control runtime internals
- **AND** world output does not infer hostile, enemy, opponent, threat, war,
  ally, suzerain, or other relationship labels from owner ids or player counts
- **AND** local package tests prove only native service projection and fake
  runtime behavior; deployed Civ7 runtime proof, broad world/actor catalog
  support, transport expansion, and parent Task 5.x/6.x/7.x acceptance remain
  pending

#### Scenario: World plot and grid service reads are added
- **WHEN** `world.plot.read` and `world.grid.read` expose bounded map
  diagnostics under the `world` router
- **THEN** control-oRPC owns the contract-local caller input, normal output
  projection, source-status wording, and tagged error boundary
- **AND** direct-control remains only the low-level plot snapshot and map grid
  runtime read port that can execute bounded Tuner map probes
- **AND** normal output omits raw host, port, state, session, command,
  rawCommand, Tuner payloads, direct-control runtime envelopes, actor
  catalogs, and relationship labels
- **AND** the procedures reject endpoint/session/state/raw command fields from
  caller input before invoking the direct-control facade
- **AND** game-UI controller context advertises these reads only when the
  separate game-resident map evidence path is present
- **AND** local package tests prove only service projection and fake runtime
  behavior; deployed Civ7 runtime proof, transport expansion, broad
  world/actor catalog support, and parent Task 5.x/6.x/7.x acceptance remain
  pending

#### Scenario: CLI map summary uses current world service projection
- **WHEN** `game map --summary` reads current world/map facts
- **THEN** the CLI constructs native control-oRPC context from endpoint flags
- **AND** the summary path calls the in-process `world.current` server-side
  client under the `world` router
- **AND** the normal JSON result is the semantic current-world projection
  without raw host, port, state, session, command, rawCommand, Tuner payloads,
  raw App UI snapshot envelopes, direct-control summary envelopes, actor
  catalogs, or relationship labels
- **AND** focused CLI tests do not claim live Civ7 runtime proof

#### Scenario: CLI map plot and bounds use world service projection
- **WHEN** `game map --plot` and `game map --bounds` read bounded map facts
- **THEN** the CLI constructs native control-oRPC context from endpoint flags
- **AND** plot mode calls the in-process `world.plot.read` server-side client
  under the `world` router
- **AND** bounds mode calls the in-process `world.grid.read` server-side
  client under the `world` router
- **AND** normal JSON results are semantic world plot/grid projections without
  raw host, port, state, session, command, rawCommand, Tuner payloads,
  direct-control runtime envelopes, actor catalogs, or relationship labels
- **AND** focused CLI tests do not claim live Civ7 runtime proof

#### Scenario: CLI priorities uses attention service projection
- **WHEN** `game play priorities` reads the current priority dashboard
- **THEN** the CLI constructs native control-oRPC context from endpoint flags
- **AND** the priorities path calls the in-process `attention.priorities`
  server-side client under the `attention` router
- **AND** priority ranking, source-status, current-HUD, ready-actor, and
  optional battlefield composition come from the service procedure
- **AND** the CLI maps semantic next-step descriptors into command suggestions
  in CLI output only; native service output remains caller-neutral and does not
  contain literal CLI `game play ...` command strings
- **AND** the normal JSON result omits raw host, port, state, session, command,
  rawCommand, Tuner payloads, direct-control runtime envelopes, and transport
  details
- **AND** battlefield evidence remains relationship-safe read-only planning
  context and does not authorize sends or hostile/enemy/opponent/threat labels
- **AND** focused CLI tests do not claim live Civ7 runtime proof

#### Scenario: CLI notification queue commands use notifications service projection
- **WHEN** `game play notification-queue` schedules current notification work
  or `game play dismiss-notification-queue` dry-runs or sends reviewed
  informational closeouts
- **THEN** the CLI constructs native control-oRPC context from endpoint flags
- **AND** the queue scheduler calls the in-process
  `notifications.queue.current` server-side client under the `notifications`
  router
- **AND** the queue closeout command calls the in-process
  `notifications.queue.dismiss.request` server-side client under the
  `notifications` router
- **AND** queue disposition, eligibility/exclusion policy, readiness-gated
  aggregate dismissal, and proof/no-repeat projection come from the service
  procedures
- **AND** the CLI maps semantic next-step descriptors into command suggestions
  in CLI output only; native service output remains caller-neutral and does not
  contain literal CLI `game play ...` command strings
- **AND** the normal JSON result omits raw host, port, state, session, command,
  rawCommand, Tuner payloads, direct-control runtime envelopes, raw App UI
  closeout internals, legacy `verified`, approval/reason mechanics, and
  transport details
- **AND** focused CLI tests do not claim live Civ7 runtime proof

#### Scenario: CLI advisor warning sends use notifications service projection
- **WHEN** `game play advisor-warning --send` acknowledges a reviewed advisor
  warning notification
- **THEN** the CLI constructs native control-oRPC context from endpoint flags
- **AND** the send path calls the in-process
  `notifications.advisorWarning.viewed.request` server-side client under the
  `notifications` router
- **AND** local-player selection, advisor-warning operation mapping,
  validator result projection, pending-runtime-proof postcondition, and
  no-repeat guidance come from the service procedure and source-owned
  direct-control runtime/proof port
- **AND** the CLI send input provides the target notification ComponentID only;
  dry-run validation may still require a player id on the legacy validator
  path, but send mode does not treat a caller `--player-id` as action
  authority
- **AND** the normal send JSON result omits raw host, port, state, session,
  command, rawCommand, Tuner payloads, direct-control runtime envelopes, raw
  player-operation details such as `VIEWED_ADVISOR_WARNING` / `Target`,
  legacy `verified`, approval/reason mechanics, and transport details
- **AND** focused CLI tests do not claim live Civ7 runtime proof

#### Scenario: CLI civilian route triage uses strategy service projection
- **WHEN** `game play civilian-route-triage` reads settlement, route, and
  battlefield planning evidence
- **THEN** the CLI constructs native control-oRPC context from endpoint flags
- **AND** the route-triage path calls the in-process
  `strategy.civilianRouteTriage` server-side client under the `strategy`
  router
- **AND** route status, source-status, ready-unit origin inference, settlement
  destination inference, battlefield evidence, and optional destination
  analysis composition come from the service procedure
- **AND** the CLI maps semantic next-step descriptors into command suggestions
  in CLI output only; native service output remains caller-neutral and does not
  contain literal CLI `game play ...` command strings
- **AND** the normal JSON result omits raw host, port, state, session, command,
  rawCommand, Tuner payloads, direct-control runtime envelopes, raw
  notification details, raw tactical read-port arrays, and transport details
- **AND** planning evidence remains relationship-safe read-only context and
  does not authorize movement, founding, sends, or hostile/enemy/opponent/
  threat labels
- **AND** focused CLI tests do not claim live Civ7 runtime proof

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
- **WHEN** a direct-control slice records validator-first,
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
  evidence sink, clock, risk policy, correlation, or direct-control
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

#### Scenario: CLI end-turn send uses native turn procedure
- **WHEN** `game play end-turn --send` requests a turn completion
- **THEN** the CLI constructs native control-oRPC context from endpoint flags
- **AND** the send path calls the in-process `turn.complete.request`
  server-side client
- **AND** the procedure's readiness, direct-control guard, and
  postcondition projection remain authoritative for the send
- **AND** expected pre-send guard blocks project as semantic `not-sent`
  turn-completion output with inspect/do-not-repeat next steps rather than
  `TURN_COMPLETION_UNAVAILABLE`
- **AND** the normal JSON result is the semantic turn-completion procedure
  projection without raw command/session/state/Tuner details or legacy
  `verified`
- **AND** the read-only `game play end-turn` status path remains a
  direct-control turn-completion status read until a separate accepted read
  procedure exists
- **AND** focused CLI tests do not claim live Civ7 runtime proof

#### Scenario: CLI notification dismissal send uses native notification procedure
- **WHEN** `game play dismiss-notification --send` requests a notification dismissal
- **THEN** the CLI constructs native control-oRPC context from endpoint flags
- **AND** the send path calls the in-process `notifications.dismiss.request`
  server-side client
- **AND** the procedure's readiness, direct-control validator,
  postcondition projection, and no-repeat policy remain authoritative for the
  send
- **AND** the normal JSON result is the semantic notification dismissal
  procedure projection without raw command/session/state/Tuner details, route
  diagnostics, closeout path, verification attempts, or legacy `verified`
- **AND** the read-only `game play dismiss-notification` inspection path
  remains a direct-control notification dismissal read until a separate
  accepted service read exists
- **AND** focused CLI tests do not claim live Civ7 runtime proof

#### Scenario: CLI unit target send uses native unit procedure
- **WHEN** `game play unit-target --send` requests a unit target action
- **THEN** the CLI constructs native control-oRPC context from endpoint flags
- **AND** the send path calls the in-process `unit.target.action.request`
  server-side client under the `unit` router
- **AND** the procedure's readiness, direct-control validator,
  unit-target postcondition projection, and no-repeat policy remain
  authoritative for the send
- **AND** the normal JSON result is the semantic unit target action procedure
  projection without raw command/session/state/Tuner details, send results,
  before/after runtime probes, direct-control verification envelopes, or
  legacy `verified`
- **AND** the read-only `game play unit-target` planning path remains a
  direct-control unit target action read until a separate accepted service read
  exists
- **AND** focused CLI tests do not claim live Civ7 runtime proof

#### Scenario: CLI unit upgrade and resettle sends use native unit procedures
- **WHEN** `game play upgrade-unit --send` or `game play resettle-unit --send`
  requests a unit command
- **THEN** the CLI constructs native control-oRPC context from endpoint flags
- **AND** the send paths call the in-process `unit.upgrade.request` or
  `unit.resettle.request` server-side clients under the `unit` router
- **AND** the procedures' readiness, direct-control unit-command validators,
  unit postcondition projection, and no-repeat policy remain authoritative for
  the sends
- **AND** the normal JSON result is the semantic unit request procedure
  projection without raw command/session/state/Tuner details, direct-control
  before/after envelopes, low-level operation enum fields, send results, or
  legacy `verified`
- **AND** the read-only validation paths remain direct-control
  `unit-command` validation until separate accepted service reads exist
- **AND** focused CLI tests do not claim live Civ7 runtime proof

#### Scenario: CLI production sends use native city procedure
- **WHEN** `game play build-production --send` requests a city production
  choice
- **THEN** the CLI constructs native control-oRPC context from endpoint flags
- **AND** the send path calls the in-process `city.production.choice.request`
  server-side client under the `city` router
- **AND** the procedure's readiness, direct-control production
  validator, production postcondition projection, and no-repeat policy remain
  authoritative for the send
- **AND** the normal JSON result is the semantic city production choice
  procedure projection without raw command/session/state/Tuner details,
  UI-closeout payloads, send results, before/after runtime probes, or legacy
  `verified`
- **AND** the read-only `game play build-production` validation path remains
  direct-control operation validation until a separate accepted service read
  exists
- **AND** focused CLI tests do not claim live Civ7 runtime proof

#### Scenario: CLI population placement sends use native city procedure
- **WHEN** `game play assign-worker --send` or `game play expand-city --send`
  requests city population placement
- **THEN** the CLI constructs native control-oRPC context from endpoint flags
- **AND** the send path calls the in-process `city.population.place.request`
  server-side client under the `city` router
- **AND** the procedure's readiness, direct-control population placement
  runtime ports, population postcondition projection, and no-repeat policy
  remain authoritative for the send
- **AND** the normal JSON result is the semantic city population placement
  procedure projection without raw command/session/state/Tuner details, send
  results, before/after population postcondition envelopes, direct-control
  operation envelopes, or legacy `verified`
- **AND** the read-only validation paths remain direct-control operation
  validation until a separate accepted service read exists
- **AND** `assign-worker --send` is bounded to the source-owned one-worker
  placement atom rather than silently treating `--amount` as repeated send
  authority
- **AND** focused CLI tests do not claim live Civ7 runtime proof

#### Scenario: CLI town-focus sends use native city procedures
- **WHEN** `game play set-town-focus --send` or
  `game play consider-town-project --send` requests a town-focus mutation
- **THEN** the CLI constructs native control-oRPC context from endpoint flags
- **AND** the send paths call the in-process `city.townFocus.change.request`
  or `city.townFocus.review.request` server-side clients under the `city`
  router
- **AND** the procedures' readiness, direct-control city-command/city-operation
  runtime ports, town-focus proof projection, and no-repeat policy remain
  authoritative for the sends
- **AND** the normal JSON result is the semantic city town-focus procedure
  projection without raw command/session/state/Tuner details, generic
  operation type or args fields, direct-control operation envelopes, or legacy
  `verified`
- **AND** `set-town-focus --closeout --send` composes the native change leaf
  with the native review leaf instead of falling back to raw direct-control
  send branches
- **AND** read-only validation paths remain direct-control
  city-command/city-operation validation until separate accepted service reads
  exist
- **AND** focused CLI tests do not claim live Civ7 runtime proof

#### Scenario: CLI diplomacy response send uses native diplomacy procedure
- **WHEN** `game play respond-diplomacy --send` requests a diplomacy response
- **THEN** the CLI constructs native control-oRPC context from endpoint flags
- **AND** the send path calls the in-process
  `diplomacy.response.request` server-side client under the
  `diplomacy` router
- **AND** the procedure's readiness, direct-control diplomacy
  response port, diplomacy postcondition projection, and no-repeat policy
  remain authoritative for the send
- **AND** the send result uses direct-control source evidence for the acted
  local player rather than treating the caller validation `--player-id` as send
  authority
- **AND** the normal JSON result is the semantic diplomacy response procedure
  projection without raw command/session/state/Tuner details, UI closeout
  payloads, diplomacy state internals, direct-control runtime payloads, or
  legacy `verified`
- **AND** the read-only `game play respond-diplomacy` validation path remains
  direct-control player-operation validation until a separate accepted service
  read exists
- **AND** `game play respond-first-meet` remains outside this slice until a
  separate first-meet service procedure exists
- **AND** focused CLI tests do not claim live Civ7 runtime proof

#### Scenario: CLI first-meet response send uses native diplomacy first-meet procedure
- **WHEN** `game play respond-first-meet --send` requests a first-meet diplomacy greeting
- **THEN** the CLI constructs native control-oRPC context from endpoint flags
- **AND** the send path calls the in-process
  `diplomacy.firstMeet.response.request` server-side client under the
  `diplomacy` router
- **AND** the procedure's readiness, direct-control first-meet response proof
  port, first-meet notification postcondition projection, and no-repeat policy
  remain authoritative for the send
- **AND** the procedure keeps first-meet `{ Player1, Player2, Type }` behavior
  distinct from ordinary `diplomacy.response.request` closeout semantics
- **AND** the normal JSON result is the semantic first-meet response procedure
  projection without raw command/session/state/Tuner details,
  direct-control operation envelopes, before/after notification snapshots, or
  legacy `verified`
- **AND** sticky or unmatched first-meet blocker evidence remains
  sent-unverified and no-repeat guarded
- **AND** the read-only `game play respond-first-meet` validation path remains
  direct-control player-operation validation until a separate accepted service
  read exists
- **AND** focused CLI tests do not claim live Civ7 runtime proof

#### Scenario: CLI narrative choice send uses native narrative procedure
- **WHEN** `game play choose-narrative --send` requests a narrative story direction choice
- **THEN** the CLI constructs native control-oRPC context from endpoint flags
- **AND** the send path calls the in-process
  `narrative.choice.request` server-side client under the
  `narrative` router
- **AND** the procedure's readiness, direct-control narrative choice
  port, narrative postcondition projection, and no-repeat policy remain
  authoritative for the send
- **AND** the send result uses direct-control source evidence for the acted
  local player rather than treating the caller validation `--player-id` as send
  authority
- **AND** the normal JSON result is the semantic narrative choice procedure
  projection without raw command/session/state/Tuner details, App UI closeout
  payloads, panel/popup internals, direct-control runtime payloads, or legacy
  `verified`
- **AND** the read-only `game play choose-narrative --options` path remains a
  direct-control notification/option read until a separate accepted service
  read exists
- **AND** the read-only validation path remains direct-control
  player-operation validation until a separate accepted service read exists
- **AND** focused CLI tests do not claim live Civ7 runtime proof

#### Scenario: CLI progression choice sends use native progression procedures
- **WHEN** `game play choose-tech --send` or `game play choose-culture --send`
  requests a technology or culture choice
- **THEN** the CLI constructs native control-oRPC context from endpoint flags
- **AND** the send path calls the in-process
  `progression.technology.choice.request` or
  `progression.culture.choice.request` server-side client under the
  `progression` router
- **AND** the procedure's readiness, before/after notification reads,
  direct-control progression closeout port, progression postcondition
  projection, and no-repeat policy remain authoritative for the send
- **AND** the send result uses live notification local-player evidence rather
  than treating caller validation `--player-id` as send authority
- **AND** the normal JSON result is the semantic progression choice procedure
  projection without raw command/session/state/Tuner details, App UI closeout
  payloads, direct-control runtime payloads, before/after notification views, or
  legacy `verified`
- **AND** the `--options` paths remain direct-control notification option reads
  and the read-only validation paths remain direct-control player-operation
  validation until separate accepted service reads exist
- **AND** caller-visible `--closeout` workflow guidance is retired because send
  mode uses the native service closeout workflow
- **AND** focused CLI tests do not claim live Civ7 runtime proof

#### Scenario: CLI progression target sends use native progression procedures
- **WHEN** `game play set-tech-target --send` or
  `game play set-culture-target --send` requests a technology or culture
  target-setting mutation
- **THEN** the CLI constructs native control-oRPC context from endpoint flags
- **AND** the send path calls the in-process
  `progression.technology.target.request` or
  `progression.culture.target.request` server-side client under the
  `progression` router
- **AND** the procedure's readiness, fresh local-player read,
  direct-control progression target runtime port, target proof projection, and
  no-repeat policy remain authoritative for the send
- **AND** the send result uses live local-player evidence rather than treating
  caller validation `--player-id` as send authority
- **AND** the normal JSON result is the semantic progression target procedure
  projection without raw command/session/state/Tuner details, generic
  operation type or args fields, direct-control operation envelopes, or legacy
  `verified`
- **AND** sent target-setting results remain `sent-unverified` with
  do-not-repeat next steps because local tests do not prove the live
  progression target changed
- **AND** the read-only validation paths remain direct-control
  player-operation validation until separate accepted service reads exist
- **AND** focused CLI tests do not claim live Civ7 runtime proof

#### Scenario: CLI government-domain sends use native government procedures
- **WHEN** `game play choose-government --send` or
  `game play choose-celebration --send` requests a government-domain mutation
- **THEN** the CLI constructs native control-oRPC context from endpoint flags
- **AND** the send path calls the in-process `government.choice.request` or
  `government.celebration.choice.request` server-side client under the
  `government` router
- **AND** the procedure's readiness, fresh local-player read,
  direct-control government-domain runtime port, proof projection, and
  no-repeat policy remain authoritative for the send
- **AND** the send result uses live local-player evidence rather than treating
  caller validation `--player-id` as send authority
- **AND** the normal JSON result is the semantic government-domain procedure
  projection without raw command/session/state/Tuner details, generic
  operation type or args fields, direct-control operation envelopes, or legacy
  `verified`
- **AND** sent government-domain choices remain `sent-unverified` with
  do-not-repeat next steps because local tests do not prove the live government
  or celebration blocker cleared
- **AND** the read-only validation and option-read paths remain direct-control
  owned until separate accepted service reads exist
- **AND** focused CLI tests do not claim live Civ7 runtime proof

#### Scenario: CLI attribute/tradition player-choice sends use native progression procedures
- **WHEN** `game play buy-attribute --send`,
  `game play consider-attributes --send`,
  `game play change-tradition --send`, or
  `game play consider-traditions --send` requests an attribute/tradition
  progression mutation
- **THEN** the CLI constructs native control-oRPC context from endpoint flags
- **AND** the send paths call the in-process progression player-choice
  server-side client leaves under the `progression` router
- **AND** send mode does not accept or pass caller `--player-id`; the
  procedure's readiness, fresh local-player read, direct-control
  player-operation runtime port, proof projection, and no-repeat policy remain
  authoritative for the send
- **AND** the normal JSON result is the semantic progression player-choice
  procedure projection without raw command/session/state/Tuner details,
  generic operation type or args fields, direct-control operation envelopes,
  or legacy `verified`
- **AND** `--closeout` workflows compose the relevant native purchase/change
  leaf with its matching native review leaf instead of falling back to raw
  direct-control send branches
- **AND** read-only validation paths continue to require `--player-id` and
  remain direct-control player-operation validation until separate accepted
  service reads exist
- **AND** focused CLI tests do not claim live Civ7 runtime proof

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
  lifecycle certification, and proof/evidence sinks
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
- **AND** raw command/session/tuner endpoint fields are
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
- **AND** raw command/session/tuner endpoint fields
  remain rejected from the ingress envelope
- **AND** mutation allowlists, local-player/hotseat proof, runtime proof, Civ7
  UIScript/modinfo packaging, and full `7.3` implementation remain pending

#### Scenario: Controller ingress allowlists notification dismissal mutation
- **WHEN** the package-local controller ingress allowlists the first mutation
  procedure
- **THEN** the only accepted mutation key in that slice is the service-owned
  `notifications.dismiss.request` procedure
- **AND** its request envelope validates the existing notification-dismissal
  procedure input schema
- **AND** controller context requires closed controller lifecycle proof for
  game-controller-ready lifecycle, `GameContext.localPlayerID` local-player
  evidence, and single-local-player/hotseat status before native router dispatch
- **AND** invocation delegates to the existing in-process router/client and
  native readiness and proof procedure middleware rather than
  adding a bridge-local dispatcher or mutation runner
- **AND** raw host, port, session, state, command, rawCommand, and raw
  direct-control dismissal internals remain excluded from bridge request and
  response shapes
- **AND** local tests prove only the serialized ingress gate and in-process
  service dispatch; Civ7 UIScript/modinfo packaging, additional mutation
  allowlists, runtime/live proof, and full `7.3` implementation remain pending

#### Scenario: Controller ingress allowlists turn completion mutation
- **WHEN** the package-local controller ingress allowlists turn completion
  after the native turn service procedure exists
- **THEN** the accepted mutation key in that slice is the service-owned
  `turn.complete.request` procedure
- **AND** its request envelope validates the existing empty turn-completion
  procedure input schema
- **AND** controller context requires closed controller lifecycle proof for
  game-controller-ready lifecycle, `GameContext.localPlayerID` local-player
  evidence, and single-local-player/hotseat status before native router dispatch
- **AND** invocation delegates to the existing in-process router/client and
  native readiness and proof procedure middleware rather than
  adding a bridge-local dispatcher or mutation runner
- **AND** raw host, port, session, state, command, rawCommand, and raw
  direct-control turn-completion internals remain excluded from bridge request
  and response shapes
- **AND** local tests prove only the serialized ingress gate and in-process
  service dispatch; Civ7 UIScript/modinfo packaging, further mutation
  allowlists, runtime/live proof, and full `7.3` implementation remain pending

#### Scenario: Controller ingress allowlists unit target action mutation
- **WHEN** the package-local controller ingress allowlists unit target action
  after the native unit service procedure exists
- **THEN** the accepted mutation key in that slice is the service-owned
  `unit.target.action.request` procedure
- **AND** its request envelope validates the existing unit-target-action
  procedure input schema
- **AND** controller context requires closed controller lifecycle proof for
  game-controller-ready lifecycle, `GameContext.localPlayerID` local-player
  evidence, and single-local-player/hotseat status before native router dispatch
- **AND** invocation delegates to the existing in-process router/client and
  native readiness and proof procedure middleware rather than
  adding a bridge-local dispatcher or mutation runner
- **AND** raw host, port, session, state, command, rawCommand, and raw
  direct-control unit-operation internals remain excluded from bridge request
  and response shapes
- **AND** local tests prove only the serialized ingress gate and in-process
  service dispatch; Civ7 UIScript/modinfo packaging, further mutation
  allowlists, runtime/live proof, and full `7.3` implementation remain pending

#### Scenario: Controller ingress allowlists city production choice mutation
- **WHEN** the package-local controller ingress allowlists city production
  choice after the native city service procedure exists
- **THEN** the accepted mutation key in that slice is the service-owned
  `city.production.choice.request` procedure
- **AND** its request envelope validates the existing city-production-choice
  procedure input schema
- **AND** controller context requires closed controller lifecycle proof for
  game-controller-ready lifecycle, `GameContext.localPlayerID` local-player
  evidence, and single-local-player/hotseat status before native router dispatch
- **AND** invocation delegates to the existing in-process router/client and
  native readiness and proof procedure middleware rather than
  adding a bridge-local dispatcher or mutation runner
- **AND** raw host, port, session, state, command, rawCommand, and raw
  direct-control city-operation internals remain excluded from bridge request
  and response shapes
- **AND** local tests prove only the serialized ingress gate and in-process
  service dispatch; Civ7 UIScript/modinfo packaging, further mutation
  allowlists, runtime/live proof, and full `7.3` implementation remain pending

#### Scenario: Controller ingress allowlists population placement mutation
- **WHEN** the package-local controller ingress allowlists city population
  placement after the native city service procedure exists
- **THEN** the accepted mutation key in that slice is the service-owned
  `city.population.place.request` procedure
- **AND** its request envelope validates the existing population-placement
  procedure input schema
- **AND** controller context requires closed controller lifecycle proof for
  game-controller-ready lifecycle, `GameContext.localPlayerID` local-player
  evidence, and single-local-player/hotseat status before native router dispatch
- **AND** invocation delegates to the existing in-process router/client and
  native readiness and proof procedure middleware rather than
  adding a bridge-local dispatcher or mutation runner
- **AND** raw host, port, session, state, command, rawCommand, generic
  `operationType`, raw operation `args`, and raw direct-control
  player-operation/city-command internals remain excluded from bridge request
  and response shapes
- **AND** local tests prove only the serialized ingress gate and in-process
  service dispatch; Civ7 UIScript/modinfo packaging, further mutation
  allowlists, runtime/live proof, and full `7.3` implementation remain pending

#### Scenario: Controller ingress allowlists narrative choice mutation
- **WHEN** the package-local controller ingress allowlists narrative choice
  after the native narrative service procedure exists
- **THEN** the accepted mutation key in that slice is the service-owned
  `narrative.choice.request` procedure
- **AND** its request envelope validates the existing narrative-choice
  procedure input schema
- **AND** controller context requires closed controller lifecycle proof for
  game-controller-ready lifecycle, `GameContext.localPlayerID` local-player
  evidence, and single-local-player/hotseat status before native router dispatch
- **AND** invocation delegates to the existing in-process router/client and
  native readiness and proof procedure middleware rather than
  adding a bridge-local dispatcher or mutation runner
- **AND** raw host, port, session, state, command, rawCommand, App UI closeout
  payloads, panel/popup internals, direct-control runtime payloads, and legacy
  `verified` remain excluded from bridge request and response shapes
- **AND** local tests prove only the serialized ingress gate and in-process
  service dispatch; Civ7 UIScript/modinfo packaging, further mutation
  allowlists, runtime/live proof, and full `7.3` implementation remain pending

#### Scenario: Controller ingress allowlists diplomacy response mutation
- **WHEN** the package-local controller ingress allowlists diplomacy response
  after the native diplomacy service procedure exists
- **THEN** the accepted mutation key in that slice is the service-owned
  `diplomacy.response.request` procedure
- **AND** its request envelope validates the existing diplomacy-response
  procedure input schema
- **AND** controller context requires closed controller lifecycle proof for
  game-controller-ready lifecycle, `GameContext.localPlayerID` local-player
  evidence, and single-local-player/hotseat status before native router dispatch
- **AND** invocation delegates to the existing in-process router/client and
  native readiness and proof procedure middleware rather than
  adding a bridge-local dispatcher or mutation runner
- **AND** raw host, port, session, state, command, rawCommand, App UI closeout
  payloads, notification internals, direct-control runtime payloads, and legacy
  `verified` remain excluded from bridge request and response shapes
- **AND** local tests prove only the serialized ingress gate and in-process
  service dispatch; Civ7 UIScript/modinfo packaging, further mutation
  allowlists, runtime/live proof, and full `7.3` implementation remain pending

#### Scenario: Controller ingress allowlists progression choice mutations
- **WHEN** the package-local controller ingress allowlists progression choices
  after the native progression service procedures bind send identity to
  local-player notification evidence
- **THEN** the accepted mutation keys in that slice are the service-owned
  `progression.technology.choice.request` and
  `progression.culture.choice.request` procedures
- **AND** their request envelopes validate the existing semantic
  player/node/notification input schema
- **AND** controller context requires closed controller lifecycle proof for
  game-controller-ready lifecycle, `GameContext.localPlayerID` local-player
  evidence, and single-local-player/hotseat status before native router dispatch
- **AND** invocation delegates to the existing in-process router/client and
  native readiness and proof procedure middleware rather than
  adding a bridge-local dispatcher or mutation runner
- **AND** raw host, port, session, state, command, rawCommand, payload,
  player-operation/App UI closeout internals, and legacy `verified` remain
  excluded from bridge request and response shapes
- **AND** local tests prove only the serialized ingress gate and in-process
  service dispatch; Civ7 UIScript/modinfo packaging, further mutation
  allowlists, runtime/live proof, and full `7.3` implementation remain pending

#### Scenario: Game-scoped controller bootstrap package is seeded
- **WHEN** the repository adds the first Civ7 controller bootstrap artifact
- **THEN** the artifact is a `mods/*` package with a generated `.modinfo` that
  declares a `scope="game"` action group and a `<UIScripts>` entry for the
  controller UI script
- **AND** the UI script imports the narrow `@civ7/control-orpc/game-ui`
  entrypoint rather than the broad package root or a transport edge
- **AND** the game-UI entry installs the existing `Civ7IntelligenceBridge`
  global binding over the native controller ingress and server-side router
  client rather than creating a second dispatcher
- **AND** the local game-UI context can answer `readiness.current` from ambient
  game UI globals without accepting host, port, session, state, raw command, or
  transport input
- **AND** this bootstrap does not report mutation capability unless a
  game-resident runtime port is supported by controller-owned context proof
- **AND** unsupported mutation runtime ports fail through bounded oRPC/bridge
  error projection without raw command/session/App UI payload leakage
- **AND** the generated UI bundle does not include Node built-in imports,
  direct-control socket/session runtime implementation, raw command/session
  command strings, or RPC transport symbols
- **AND** local package and bundle tests prove only source shape and build
  integrity; deployed Civ7 UIScript loading, broader mutation runtime support,
  live runtime proof, and full `7.3` implementation remain pending

#### Scenario: Controller mutation proof is context-owned
- **WHEN** the controller bridge receives an allowlisted mutation request
- **THEN** the serialized request envelope validates semantic procedure input
  rather than caller-supplied lifecycle,
  local-player, or hotseat proof
- **AND** `controllerProof` in the serialized request is rejected as an extra
  field rather than trusted as runtime evidence
- **AND** controller context must provide game-controller-ready lifecycle,
  `GameContext.localPlayerID`, and single-local-player/hotseat proof before
  native router dispatch
- **AND** a globally allowlisted mutation still fails before native router
  dispatch unless the current controller context lists that exact procedure in
  `supportedMutationProcedures`
- **AND** the game-UI adapter derives that proof from ambient `UI`,
  `GameContext`, and `Players` globals when the current game process provides
  bounded single-local-player evidence
- **AND** missing or insufficient context proof fails before mutation dispatch
  through bounded bridge error output without raw command/session/App UI
  payload leakage
- **AND** local package tests prove only context-owned proof sourcing and
  serialized envelope closure; deployed Civ7 runtime proof, mutation runtime
  support, play-thread action, and full `7.3` implementation remain pending

#### Scenario: Controller bridge dispatch respects supported procedure facts
- **WHEN** the controller bridge receives a globally allowlisted request
- **THEN** `readiness.current` may dispatch as the bootstrap readiness
  procedure
- **AND** other read procedures must be listed by controller context
  `supportedReadProcedures` before dispatch
- **AND** mutation procedures must pass context-owned mutation proof and be
  listed by controller context `supportedMutationProcedures` before dispatch
- **AND** an unsupported procedure fails through bounded bridge error output
  before calling the native router or any direct-control/game-UI runtime port
- **AND** this gate does not add new procedure allowlist entries, transport
  scope, raw command/session output, or deployed Civ7 runtime proof claims

#### Scenario: Game UI controller supports notification dismissal
- **WHEN** the game-scoped controller context exposes notification dismissal
  game UI APIs
- **THEN** the context may execute the service-owned
  `notifications.dismiss.request` procedure through the existing in-process
  router and native readiness and proof procedure middleware
- **AND** the service-owned game UI notification-dismissal access path executes against
  ambient `Game.Notifications`, `NotificationModel`, `GameContext`, and
  notification queue evidence without tuner socket/session command
  serialization
- **AND** broad `readiness.current` mutation capability remains conservative
  until game UI mutation surfaces are actually implemented
- **AND** native mutation readiness admits only the explicitly context-listed
  `notifications.dismiss.request` game-UI mutation while other mutation ports
  remain bounded as unsupported
- **AND** `readiness.current` exposes the same context-listed controller
  support as bounded procedure capability facts; read support may set
  `canObserve`, but mutation support MUST NOT set `canMutate` unless the
  runtime readiness source proves mutation capability
- **AND** normal bridge success output remains the semantic notification
  dismissal result and omits raw route internals, host, port,
  state, command, rawCommand, session, and tuner payloads
- **AND** local package and bundle tests prove source shape and local fake game
  runtime behavior only; deployed Civ7 runtime proof, other mutation runtime
  ports, play-thread action, and full `7.3` implementation remain pending

#### Scenario: Game UI controller supports current attention reads
- **WHEN** the game-scoped controller context exposes notification, turn, and
  official first-ready-unit attention read APIs
- **THEN** the context may execute the service-owned `attention.current`
  procedure through the existing in-process router
- **AND** the control-oRPC game UI controller adapter reads ambient
  `Game.Notifications`, turn, end-turn blocker, and first-ready-unit evidence
  as controller context/dependency input without adding a direct-control
  game-UI attention subpath
- **AND** the game-UI context lists `attention.current` as a supported read
  only when controller proof plus notification and first-ready-unit APIs are
  available
- **AND** first-ready-unit evidence may project as ready-unit source coverage,
  but selected-unit ids are only hints and MUST NOT become ready-unit blockers
- **AND** ready-city source reads remain `skipped-unsupported` in game UI
  context when official ready-city source evidence is absent
- **AND** the game UI controller adapter MAY project ready-city source coverage
  from official evidence only: an end-turn-blocking notification target that
  resolves to a city, or local-player `Players.Cities` plus
  `Cities.get(...).Growth.isReadyToPlacePopulation` evidence
- **AND** selected-city ids, requested city ids, and unrelated notification
  target ids are only hints and MUST NOT become ready-city blockers
- **AND** `attention.current` does not recommend `end-turn` without ready actor
  source coverage
- **AND** truncated notification coverage is marked in the controller read
  dependency result and projects as incomplete attention evidence rather than an
  unqualified no-blocker conclusion
- **AND** normal bridge/service output remains semantic and omits raw host,
  port, state, command, rawCommand, session, tuner payloads, and direct-control
  socket details
- **AND** local package and bundle tests prove source shape and local fake game
  runtime behavior only; deployed Civ7 runtime proof, broader read/mutation
  ports, play-thread action, and full `7.3` implementation remain pending

#### Scenario: Game UI controller supports turn completion
- **WHEN** the game-scoped controller context exposes ambient turn-completion
  APIs for `GameContext.hasSentTurnComplete`,
  `GameContext.sendTurnComplete`, `canEndTurn`, turn, blocker, and
  first-ready-unit evidence
- **THEN** the context may execute the service-owned
  `turn.complete.request` procedure through the existing in-process router and
  native readiness/proof middleware
- **AND** `turn.complete.request` is listed as a supported game-UI mutation only
  when controller proof and the required ambient send/read APIs are present
- **AND** the game UI adapter requires an actual `sendTurnComplete` function
  before any result can report `sent: true`
- **AND** blocked, already-sent, or missing-send-capability paths project
  semantic `not-sent` output with inspect and `do-not-repeat` next steps
- **AND** normal bridge success output remains the semantic turn-completion
  result and omits host, port, state, command, rawCommand, session, tuner
  payloads, raw game-UI function names, and direct-control socket details
- **AND** local package and bundle tests prove source shape and local fake game
  runtime behavior only; deployed Civ7 runtime proof, other game UI mutation
  ports, play-thread action, and full `7.3` implementation remain pending

#### Scenario: Game UI controller supports production choice
- **WHEN** the game-scoped controller context exposes ambient production-choice
  APIs for `Game.CityOperations.canStart`, `Game.CityOperations.sendRequest`,
  `CityOperationTypes.BUILD`, city state, and notification blocker evidence
- **THEN** the context may execute the service-owned
  `city.production.choice.request` procedure through the existing in-process
  router and native readiness/proof middleware
- **AND** `city.production.choice.request` is listed as a supported game-UI
  mutation only when controller proof and the required ambient validation,
  send, and blocker-read APIs are present
- **AND** validator-blocked production choices project semantic `not-sent`
  output and do not call the send API
- **AND** `production-choice-cleared` requires a matching production blocker
  before the send and post-send evidence that that matching blocker is absent
  or no longer city-matching
- **AND** failed, missing, unrelated, or still-live blocker evidence remains
  unconfirmed and no-repeat guarded unless city/buildQueue/validator evidence
  proves an accepted production-state outcome
- **AND** selected-city/interface changes alone do not count as confirmed
  production-state proof
- **AND** normal bridge success output remains the semantic production-choice
  result and omits host, port, state, command, rawCommand, session, tuner
  payloads, raw game-UI function names, and direct-control socket details
- **AND** local package and bundle tests prove source shape and local fake game
  runtime behavior only; deployed Civ7 runtime proof, other city mutation
  ports, play-thread action, and full `7.3` implementation remain pending

#### Scenario: Game UI controller supports population placement
- **WHEN** the game-scoped controller context exposes ambient population
  placement APIs for `Game.PlayerOperations.canStart/sendRequest`,
  `PlayerOperationTypes.ASSIGN_WORKER`, `Game.CityCommands.canStart/sendRequest`,
  `CityCommandTypes.EXPAND`, player city lists, city readiness, worker
  placement, and expansion evidence
- **THEN** the context may execute the service-owned
  `city.population.place.request` procedure through the existing in-process
  router and native readiness/proof middleware
- **AND** `city.population.place.request` is listed as a supported game-UI
  mutation only when controller proof and the required ambient validation,
  send, player, city, and postcondition-read APIs are present
- **AND** assign-worker input remains semantic `{ playerId, location }` while
  expand-city input remains semantic `{ cityId, destination }`; raw operation
  types and raw command/session fields are not accepted as bridge input
- **AND** assign-worker sends require the caller `playerId` to match
  controller-owned `GameContext.localPlayerID` evidence before any
  `PlayerOperations.sendRequest` call
- **AND** validator-blocked population placements project semantic `not-sent`
  output and do not call the send API
- **AND** `population-ready-cleared` requires pre-send city readiness evidence
  and post-send evidence that readiness cleared
- **AND** no-state-change, validation-only changes, missing ready-city evidence,
  failed population state reads, missing postcondition snapshots, and unchanged
  placement snapshots remain unconfirmed or no-repeat guarded
- **AND** normal bridge success output remains the semantic population-placement
  result and omits host, port, state, command, rawCommand, session, tuner
  payloads, raw game-UI function names, and direct-control socket details
- **AND** local package and bundle tests prove source shape and local fake game
  runtime behavior only; deployed Civ7 runtime proof, other mutation ports,
  play-thread action, and full `7.3` implementation remain pending

#### Scenario: Game UI controller supports progression choices
- **WHEN** the game-scoped controller context exposes ambient progression
  choice APIs for `Game.PlayerOperations.canStart/sendRequest`, technology and
  culture progression operation enums, `ProgressionTreeNodeTypes.NO_NODE`,
  notification activation/read APIs, player progression state reads, and
  controller-owned local-player proof
- **THEN** the context may execute the service-owned
  `progression.technology.choice.request` and
  `progression.culture.choice.request` procedures through the existing
  in-process router and native readiness/proof middleware
- **AND** progression choice procedures are listed as supported game-UI
  mutations only when controller proof and the required ambient validation,
  send, notification, and player progression APIs are present
- **AND** caller `playerId` remains validation/input context while the runtime
  send player is derived from controller-owned `GameContext.localPlayerID` and
  the pre-read local-player notification evidence
- **AND** validator-blocked progression choices project semantic `not-sent`
  output, do not call the choose send API, and do not clear the target node
  after a failed choose validation
- **AND** sent choices require the service procedure to re-read attention before
  projecting confirmed completion; sticky blockers, state-changed blockers,
  failed post-reads, and pending runtime proof remain no-repeat guarded
- **AND** normal bridge success output remains the semantic progression-choice
  result and omits host, port, state, command, rawCommand, session, tuner
  payloads, raw game-UI function names, direct-control socket details, and raw
  `SET_*_TREE_*` operation names
- **AND** local package and bundle tests prove source shape and local fake game
  runtime behavior only; deployed Civ7 runtime proof,
  narrative/diplomacy/unit runtime ports, play-thread action, and full `7.3`
  implementation remain pending

#### Scenario: Game UI controller supports narrative choice
- **WHEN** the game-scoped controller context exposes ambient narrative choice
  APIs for `Game.PlayerOperations.canStart/sendRequest`,
  `PlayerOperationTypes.CHOOSE_NARRATIVE_STORY_DIRECTION`, notification
  activation/read APIs, optional narrative panel/popup evidence, and
  controller-owned local-player proof
- **THEN** the context may execute the service-owned
  `narrative.choice.request` procedure through the existing in-process router
  and native readiness/proof middleware
- **AND** `narrative.choice.request` is listed as a supported game-UI mutation
  only when controller proof and the required ambient validation, send, and
  notification APIs are present
- **AND** caller `playerId` remains validation/input context while the runtime
  send player is derived from controller-owned `GameContext.localPlayerID`
- **AND** validator-blocked narrative choices project semantic `not-sent`
  output and do not call the send API
- **AND** sent choices preserve source-owned narrative proof semantics:
  blocker-cleared, turn-unblocked, or matched panel-cleared evidence can
  confirm the request, while sticky blockers, validation-only changes,
  failed/missing panel evidence, no-state-change, and missing postcondition
  paths remain no-repeat guarded
- **AND** normal bridge success output remains the semantic narrative-choice
  result and omits host, port, state, command, rawCommand, session, tuner
  payloads, raw game-UI function names, direct-control socket details, and raw
  `CHOOSE_NARRATIVE_STORY_DIRECTION` operation names
- **AND** local package and bundle tests prove source shape and local fake game
  runtime behavior only; deployed Civ7 runtime proof,
  diplomacy/unit runtime ports, play-thread action, and full `7.3`
  implementation remain pending

#### Scenario: Game UI controller supports diplomacy response
- **WHEN** the game-scoped controller context exposes ambient diplomacy
  response APIs for `Game.PlayerOperations.canStart/sendRequest`,
  `PlayerOperationTypes.RESPOND_DIPLOMATIC_ACTION`, diplomacy notification
  activation/blocking/read APIs, optional `DiplomacyManager`/leader UI
  closeout evidence, and controller-owned local-player proof
- **THEN** the context may execute the service-owned
  `diplomacy.response.request` procedure through the existing in-process
  router and native readiness/proof middleware
- **AND** `diplomacy.response.request` is listed as a supported game-UI
  mutation only when controller proof and the required ambient validation,
  send, notification, and blocker-read APIs are present
- **AND** caller `playerId` remains validation/input context while the runtime
  send player is derived from controller-owned `GameContext.localPlayerID`
- **AND** validator-blocked diplomacy responses project semantic `not-sent`
  output and do not call the send API
- **AND** sent responses preserve source-owned diplomacy proof semantics:
  blocker-cleared, turn-unblocked, or confirmed blocking-notification change
  evidence can confirm the request, while sticky blockers, validation-only
  changes, failed/missing blocker evidence, no-state-change, and missing
  postcondition paths remain no-repeat guarded
- **AND** normal bridge success output remains the semantic diplomacy-response
  result and omits host, port, state, command, rawCommand, session, tuner
  payloads, UI closeout internals, raw game-UI function names,
  direct-control socket details, and raw `RESPOND_DIPLOMATIC_ACTION`
  operation names
- **AND** local package and bundle tests prove source shape and local fake game
  runtime behavior only; deployed Civ7 runtime proof, unit runtime ports,
  play-thread action, and full `7.3` implementation remain pending

#### Scenario: Game UI controller supports unit target action
- **WHEN** the game-scoped controller context exposes ambient unit target APIs
  for `Game.UnitOperations.canStart/sendRequest`,
  `Game.UnitCommands.canStart/sendRequest`, `Units.get`, `MapUnits.getUnits`,
  `GameplayMap` target-index APIs, `UnitOperationTypes`,
  `UnitCommandTypes`, `UnitOperationMoveModifiers`, and controller-owned
  local-player proof
- **THEN** the context may execute the service-owned
  `unit.target.action.request` procedure through the existing in-process
  router and native readiness/proof middleware
- **AND** `unit.target.action.request` is listed as a supported game-UI
  mutation only when controller proof and the required ambient validation,
  send, unit, map-unit, and target-index APIs are present
- **AND** the adapter uses the fixed official right-click candidate ordering:
  naval attack, air attack, ranged attack, army overrun, swap units, then
  `MOVE_TO`
- **AND** the game-UI controller rejects sends unless the requested
  `unitId.owner` matches controller-owned `GameContext.localPlayerID`
- **AND** validator-blocked unit target actions project semantic `not-sent`
  output and do not call the send API
- **AND** sent unit target actions preserve source-owned unit proof semantics:
  target reached and target/unit state changes can confirm the request, while
  path shortfalls, no-state-change, failed validation, missing postcondition,
  and pending-runtime-proof paths remain no-repeat guarded as required by the
  unit proof policy
- **AND** normal bridge success output remains the semantic unit target result
  and omits host, port, state, command, rawCommand, session, tuner payloads,
  raw game-UI function names, direct-control socket details, send results, and
  raw operation result envelopes
- **AND** local package and bundle tests prove source shape and local fake game
  runtime behavior only; deployed Civ7 runtime proof, broad unit-operation
  catalog support, target-candidate relationship semantics, play-thread action,
  and full `7.3` implementation remain pending

#### Scenario: Game UI controller supports strategy front summary
- **WHEN** the game-scoped controller context exposes ambient tactical read APIs
  for `Players`, `Players.Units`, `Players.Cities`, `Units`, `Cities`,
  `GameInfo.Units`, `GameplayMap`, and controller-owned local-player evidence
- **THEN** the context may execute the service-owned `strategy.frontSummary`
  procedure through the existing in-process router, including target-candidate,
  battlefield-scan, and destination-analysis composition
- **AND** `strategy.frontSummary` is listed as a supported game-UI read only
  when controller proof and the required ambient owner, unit, city, and map
  APIs are present
- **AND** `readiness.current` reports observation capability for a controller
  context that lists `strategy.frontSummary` as a supported read, keeps
  `canMutate: false`, and recommends `read-strategy-front` when
  `attention.current` is not supported
- **AND** bridge ingress allowlists the semantic `strategy.frontSummary`
  procedure only, not raw `targetCandidates`, `battlefieldScan`,
  `destinationAnalysis`, or generic tactical catalog leaves
- **AND** the game-UI tactical read dependencies fail closed when required
  ambient owner/unit/city APIs are missing
- **AND** normal bridge success output remains the semantic strategy front
  summary and omits host, port, state, command, rawCommand, session, tuner
  payloads, raw game-UI function names, direct-control socket details, and raw
  tactical read-port envelopes
- **AND** normal service and bridge output uses semantic next-step descriptors
  rather than literal CLI `game play ...` command strings; CLI callers may map
  descriptors into command suggestions in their own presentation layer
- **AND** normal output preserves `self` and `relationship-unproven` only; it
  does not infer hostile, enemy, opponent, threat, war, ally, or suzerain
  labels from owner mismatch, proximity, contact, ranking, or action legality
- **AND** local package and bundle tests prove source shape and local fake game
  runtime behavior only; deployed Civ7 runtime proof, target-action send
  authority, broad strategy catalogs, play-thread action, and full `7.3`
  implementation remain pending

#### Scenario: Game UI controller supports current world reads
- **WHEN** the game-scoped controller context exposes ambient playable/App UI
  snapshot facts for current world state
- **THEN** the context may execute the service-owned `world.current` procedure
  through the existing in-process router
- **AND** `world.current` is listed as a supported game-UI read only when
  controller proof and the required ambient game context, map, player, and turn
  APIs are present
- **AND** `readiness.current` reports observation capability for a controller
  context that lists `world.current` as a supported read, keeps
  `canMutate: false`, and recommends `read-world` when `attention.current` and
  `strategy.frontSummary` are not supported
- **AND** bridge ingress validates the semantic `world.current` input and
  output envelopes from the aggregated `Civ7ControlOrpcContract` rather than
  exporting per-procedure schema constants or using `Type.Unknown`
- **AND** normal bridge success output remains the semantic current-world view
  and omits host, port, state, command, rawCommand, session, tuner payloads,
  raw game-UI function names, direct-control socket details, raw playable
  status envelopes, actor catalogs, and relationship labels
- **AND** local package and bundle tests prove source shape and local fake game
  runtime behavior only; deployed Civ7 runtime proof, broad world/actor
  catalogs, play-thread action, and full `7.3` implementation remain pending

#### Scenario: Game UI controller supports world plot and grid reads
- **WHEN** the game-scoped controller context exposes ambient `GameplayMap`
  plot APIs for bounded map reads
- **THEN** the context may execute the service-owned `world.plot.read` and
  `world.grid.read` procedures through the existing in-process router
- **AND** `world.plot.read` and `world.grid.read` are listed as supported
  game-UI reads only when the exact plot-level map APIs required by the
  low-level dependency are present
- **AND** the game-UI dependency returns bounded low-level plot/grid runtime
  evidence for the existing world service procedures to project; it does not
  own normal output semantics, actor catalogs, relationship labels, or a
  separate transport API
- **AND** bridge ingress validates the semantic plot/grid request and output
  envelopes from the aggregated `Civ7ControlOrpcContract` rather than
  exporting per-procedure schema constants or using `Type.Unknown`
- **AND** normal bridge success output remains the semantic world plot/grid
  view and omits host, port, state, command, rawCommand, session, tuner
  payloads, raw game-UI function names, direct-control socket details,
  direct-control runtime envelopes, actor catalogs, and relationship labels
- **AND** local package and bundle tests prove source shape and local fake game
  runtime behavior only; deployed Civ7 runtime proof, broad world/actor
  catalogs, play-thread action, transport expansion, and full `7.3`
  implementation remain pending

### Requirement: Mutation Procedures Preserve Direct-Control Proof Semantics

Mutation-capable control procedures SHALL preserve direct-control
validator-first, postcondition, no-repeat-after-unverified, and runtime-proof
boundaries.

#### Scenario: Mutation request procedure is implemented
- **WHEN** a mutation-capable procedure sends or requests a Civ7 operation
- **AND** validators run before command construction/send where the atom has a
  validator
- **AND** postcondition and proof telemetry classify sent, unverified, stale,
  unknown, missing-postcondition, and pending-runtime-proof outcomes honestly
- **AND** unverified or pending proof paths remain no-repeat guarded

#### Scenario: Closeout-style mutation projection is shared
- **WHEN** notification dismissal, narrative choice, diplomacy response, or
  progression choice procedures receive source-owned direct-control
  postcondition evidence or an explicit local pending-proof boundary
- **THEN** the shared control-oRPC mutation projection policy derives the
  caller-facing postcondition confirmation, request status, and no-repeat next
  steps
- **AND** direct-control remains the source authority for domain
  classifications, outcomes, and proof-boundary confidence
- **AND** missing postcondition and pending-runtime-proof inputs project as
  unconfirmed and no-repeat guarded
- **AND** this shared projection helper does not accept shared
  validator/postcondition middleware or parent Task 6.x completion by
  implication

#### Scenario: Shared mutation procedure helper applies native middleware
- **WHEN** existing mutation procedures share playable-readiness
  gates
- **THEN** the shared helper composes those gates through native
  oRPC/effect-oRPC middleware on the selected procedure leaf
- **AND** invalid procedure input remains rejected before readiness reads or
  direct-control mutation ports are called
- **AND** procedures still own domain-specific service behavior, typed errors,
  and semantic result projection
- **AND** validator-first and postcondition/proof policy remain
  procedure-local, policy-helper-owned, or source-owned until separately
  promoted
- **AND** the shared helper does not add a root implementer, custom dispatcher,
  runner, operation root, decision root, context bus, error bus, or transport
  edge
- **AND** local tests do not claim live Civ7 runtime proof or Task 6.x
  completion

#### Scenario: Narrative choice request procedure is implemented
- **WHEN** a narrative choice procedure requests a player choice
- **THEN** it is offered under the `narrative` domain router as
  `narrative.choice.request`
- **AND** the former generic `decisions.narrative` placement is burned down
  rather than preserved as a compatibility path
- **AND** it checks playable readiness before invoking
  direct-control runtime authority
- **AND** it consumes direct-control narrative validators and proof helpers as
  runtime/proof ports rather than reimplementing postcondition truth
- **AND** its normal output projects semantic status, validation summary,
  postcondition summary, and next steps
- **AND** its normal output uses direct-control source evidence for the acted
  player rather than echoing caller validation identity when runtime sends use
  the local player
- **AND** it excludes endpoint, session, state, raw command, payload, and
  legacy `verified` details from caller-facing input and output
- **AND** unverified, stale, missing-postcondition, no-state-change, and
  not-sent paths remain no-repeat guarded

#### Scenario: Diplomacy response request procedure is implemented
- **WHEN** a diplomacy response procedure requests a player response
- **THEN** it is offered under the `diplomacy` domain router as
  `diplomacy.response.request`
- **AND** the former generic `decisions.diplomacy` placement is burned down
  rather than preserved as a compatibility path
- **AND** it checks playable readiness before invoking
  direct-control runtime authority
- **AND** it consumes direct-control diplomacy validators and proof helpers as
  runtime/proof ports rather than inferring proof from legacy `verified`
- **AND** its normal input exposes player, action, response, and optional
  notification identity rather than direct-control UI toggles
- **AND** its normal output projects semantic status, validation summary,
  postcondition summary, and next steps
- **AND** its normal output uses direct-control source evidence for the acted
  player rather than echoing caller validation identity when runtime sends use
  the local player
- **AND** it excludes endpoint, session, state, raw command, payload,
  notification internals, UI closeout internals, and legacy `verified` details
  from caller-facing input and output
- **AND** unverified, missing-postcondition, no-state-change, validation-changed,
  and not-sent paths remain no-repeat guarded

#### Scenario: Progression choice request procedure is implemented
- **WHEN** a technology or culture progression choice procedure requests a
  player node selection
- **THEN** it is offered under the semantic `progression` router as
  `progression.technology.choice.request` or
  `progression.culture.choice.request`
- **AND** it checks playable readiness before invoking
  direct-control runtime authority
- **AND** it reads notification evidence before and after the closeout request
  and consumes direct-control progression postcondition helpers rather than
  reimplementing blocker proof truth
- **AND** its normal input exposes player, node, and optional notification
  identity rather than a generic `kind` discriminator or direct-control App UI
  toggles
- **AND** its closeout request and normal output use the local-player evidence
  from the before-notification read rather than treating caller `playerId` as
  controller/runtime send authority
- **AND** its normal output projects semantic status, evidence summary,
  postcondition summary, and next steps
- **AND** if the closeout was sent but the post-send notification read fails,
  the result remains no-repeat guarded as sent-unverified pending runtime proof
- **AND** it excludes endpoint, session, state, raw command, payload, App UI
  closeout internals, and legacy proof booleans from caller-facing input and
  output
- **AND** not-sent, sticky-blocker, state-changed-blocker-still-live, and other
  unverified paths remain no-repeat guarded

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

#### Scenario: Progression choice proof policy is owned before native procedures
- **WHEN** technology or culture choice closeouts are prepared for future
  progression procedure exposure
- **THEN** blocker-clearing, blocker-transitioned, state-changed-blocker-live,
  sticky-blocker, and turn-unblocked postcondition classification belongs to a
  direct-control progression proof owner rather than CLI-only logic
- **AND** native service procedures remain pending until caller-facing
  contracts, semantic projection, readiness policy, and no-repeat
  behavior are explicitly accepted
- **AND** local postcondition tests do not claim live Civ7 runtime proof

#### Scenario: Turn completion proof policy is owned before native turn mutation
- **WHEN** turn completion sends are prepared for future native procedure
  exposure
- **THEN** turn-advanced, turn-complete-sent, already-complete,
  no-state-change, missing-postcondition, and pending-runtime-proof
  classification belongs to a direct-control proof owner rather than native
  service code inferring from legacy `verified`
- **AND** turn-complete-sent and already-complete paths remain no-repeat
  guarded until fresh turn/attention evidence is read
- **AND** local postcondition tests do not claim live Civ7 runtime proof

#### Scenario: Turn completion request procedure is implemented
- **WHEN** `turn.complete.request` requests a turn-completion send
- **THEN** it is offered under the semantic `turn` router
- **AND** it checks playable readiness
  before invoking direct-control runtime authority
- **AND** the procedure consumes the direct-control turn-completion runtime
  port and turn-completion proof helper rather than inferring from legacy
  `verified`
- **AND** expected direct-control guard-blocked requests are projected as
  semantic `not-sent` output, not runtime unavailability
- **AND** normal input is empty and endpoint, session, state, raw command, and
  endpoint and runtime fields remain context-owned
- **AND** normal output projects before/after turn facts, postcondition
  summary, request status, and next steps without raw command/session/tuner
  details
- **AND** turn-complete-sent, already-complete, no-state-change, missing, and
  pending-runtime-proof paths remain no-repeat guarded
- **AND** local procedure tests do not claim live Civ7 runtime proof

#### Scenario: Data or runtime access is needed
- **WHEN** a procedure needs data-layer or runtime access beyond pure input
  values
- **THEN** the access is named as a context dependency, repository/read port,
  or direct-control facade method
- **AND** provider construction remains in caller/runtime assembly rather than
  service module or atom code
