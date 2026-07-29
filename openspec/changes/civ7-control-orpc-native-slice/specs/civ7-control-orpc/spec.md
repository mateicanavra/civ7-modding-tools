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
  typed errors, and the context type needed by native callers
- **AND** procedure input/output schemas and their Standard Schema adapters
  live as contract-owned implementation details consumed through the aggregate
  `Civ7ControlOrpcContract`, not as caller utility exports
- **AND** root exports do not publish direct-control runtime-port result
  aliases such as playable-status, notification, ready-actor, production,
  target-action, or closeout request result envelopes
- **AND** direct-control runtime result shapes remain internal service
  dependency/test details or are imported from `@civ7/direct-control` when a
  low-level runtime fixture needs the owning type

#### Scenario: Edge adapters inject the live runtime port
- **WHEN** CLI, Studio, or controller edge adapters need to construct a native
  control-oRPC context with the live direct-control runtime facade
- **THEN** Node-side callers import `liveCiv7DirectControl` from
  `@civ7/direct-control/live` and inject it through the service context
- **AND** the root `@civ7/control-orpc` entrypoint remains focused on
  caller-facing service contracts, routers, clients, typed errors, context, and
  aggregate contract access
- **AND** `@civ7/control-orpc` does not publish a runtime-provider entrypoint or
  make direct-control result envelopes normal service output

#### Scenario: Population placement uses exact runtime atoms
- **WHEN** `city.population.place.check` or
  `city.population.place.request` evaluates worker assignment or city expansion
- **THEN** the service context exposes exact worker-assignment and
  city-expansion check/send ports rather than generic operation dispatch
- **AND** direct-control owns only native validator/send adaptation, ambient
  local-player resolution, command serialization, and immutable target-state
  evidence
- **AND** the city service owns semantic availability, guarded mutation,
  bounded post-send polling, target-specific confirmation, dispatch
  uncertainty, and no-repeat policy
- **AND** worker confirmation requires an increase in `NumWorkers` on the
  requested plot rather than readiness clearing alone
- **AND** city expansion confirmation requires the requested plot to become
  owned by the requested city rather than an unrelated state change
- **AND** generic player-operation and city-command paths reject
  `ASSIGN_WORKER` and `EXPAND`
- **AND** raw operation types, args, command/session details, and runtime
  evidence envelopes remain excluded from normal service input and output

#### Scenario: Shared service primitives are needed by procedure contracts
- **WHEN** service-owned procedure contracts need common Civ7 primitives such
  as component IDs or map locations in caller-facing input or output
- **THEN** `services/civ7-control` owns equivalent primitive TypeBox
  schemas under its service model
- **AND** focused proof keeps those primitive schemas equivalent to the current
  direct-control runtime-owner primitives
- **AND** procedure contracts do not import direct-control primitive value
  schemas only to describe normal service input or output
- **AND** operation-specific runtime-port schemas, validators, and proof
  helpers may remain direct-control-owned until a later accepted service
  contract slice separates them deliberately

#### Scenario: Notification dismissal service contracts are offered
- **WHEN** `notifications.dismiss.check` and
  `notifications.dismiss.request` expose their caller-facing contracts
- **THEN** control-oRPC owns the input schema, native availability projection,
  and normal postcondition classification schema for those procedures
- **AND** the input admits only the semantic notification ID request shape
- **AND** raw command/session/tuner endpoint fields remain excluded from
  procedure input
- **AND** the notification service owns reviewed admission, specialized
  notification exclusion, guarded mutation orchestration, bounded post-send
  observation, postcondition classification, dispatch uncertainty, and
  no-repeat policy
- **AND** direct-control owns only exact native check/send atoms and immutable
  engine notification evidence

#### Scenario: Production choice service contracts are offered
- **WHEN** `city.production.choice.check` and
  `city.production.choice.request` expose their caller-facing contracts
- **THEN** control-oRPC owns their semantic input schema, the read-only
  availability result, and the mutation result including its normal
  postcondition classification schema
- **AND** the input admits only the semantic city production choice request
  shape: city ID plus exactly one valid production args variant
- **AND** endpoint, session, state, and raw command fields remain
  excluded from procedure input
- **AND** the city service owns check/request orchestration, postcondition
  classification, dispatch uncertainty, bounded post-send checking, and
  no-repeat-after-unverified policy
- **AND** direct-control owns the exact production-choice check/send wire atoms,
  including command serialization, runtime validator/send adaptation, and raw
  evidence snapshots; it does not own the service request orchestration,
  production postcondition policy, or production telemetry
- **AND** the generic city-operation validation/request surface rejects
  `BUILD`, so production cannot bypass the exact atoms or service policy

#### Scenario: Unit target action service contract is offered
- **WHEN** `unit.target.action.check` and `unit.target.action.request` expose
  their caller-facing contracts
- **THEN** control-oRPC owns their semantic input, availability, mutation,
  postcondition, and next-step schemas
- **AND** the input admits only the semantic unit target request shape: unit ID
  plus bounded integer map coordinates
- **AND** endpoint, session, state, and raw command fields remain
  excluded from procedure input
- **AND** the unit service owns local-player admission, Civ7's conditional
  naval/air/ranged/overrun/swap/move order, dedicated war-workflow refusal,
  guarded dispatch, bounded observation, semantic postconditions, dispatch
  uncertainty, and no-repeat policy
- **AND** direct-control owns only focused unit-target observation, one exact
  native action check, and one guarded native action send
- **AND** generic unit-operation validation/request rejects the target-action
  identities owned by those exact atoms

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
- **WHEN** `city.townFocus.change.check`,
  `city.townFocus.change.request`, `city.townFocus.review.check`, and
  `city.townFocus.review.request` expose their caller-facing contracts
- **THEN** control-oRPC owns the contract-local input, output,
  postcondition, and next-step schemas for those service procedures under the
  `city` router
- **AND** change input admits only city ID, growth type, and project type, while
  review input admits only city ID
- **AND** the low-level change atom derives the native `City` argument from the
  requested city ID and does not admit a caller-controlled override
- **AND** town-focus change versus review is expressed by the city-domain
  procedure path rather than a generic operation root, operation type, or raw
  args input
- **AND** endpoint, session, state, raw command, generic operation type, raw
  args, direct-control operation envelopes, and legacy `verified` remain
  excluded from procedure input and normal output
- **AND** change checks project native `CityCommands.canStart` plus observed
  town state, while review checks derive availability from matching
  `NOTIFICATION_CHOOSE_TOWN_PROJECT` evidence without inventing a
  `CityOperations.canStart` authority
- **AND** requests precheck once, avoid repeated already-satisfied mutations,
  and guard one exact send
- **AND** control-oRPC owns semantic admission, bounded post-send polling,
  postcondition classification, dispatch uncertainty, and no-repeat policy
- **AND** a sent result is classified as confirmed or unverified rather than
  being universally pending, and uncertain dispatch or incomplete evidence
  remains no-repeat guarded
- **AND** these new per-leaf input/result schemas and Standard Schema adapters
  stay private to the contract module and are not exported as caller utilities;
  callers use the aggregate contract/router/server client
- **AND** direct-control owns only the bounded native change-check, change-send,
  review-read, and review-send atoms, command serialization, native validator
  adaptation for focus change, and raw immutable state snapshots
- **AND** generic operation validation and send surfaces reject
  `CHANGE_GROWTH_MODE` and `CONSIDER_TOWN_PROJECT`

#### Scenario: Progression choice service contract is offered
- **WHEN** `progression.technology.choice.request` and
  `progression.culture.choice.request` expose their caller-facing contracts
- **THEN** control-oRPC owns the input, output, postcondition, evidence, and
  next-step schemas for those service procedures
- **AND** the input admits only node ID and optional notification identity,
  with technology versus culture expressed by the domain procedure path rather
  than a generic kind discriminator
- **AND** the procedure reads current local-player evidence before send and
  does not admit caller-provided player ID as mutation authority
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
- **AND** the input admits only node ID, with technology versus
  culture expressed by the domain procedure path rather than a generic
  operation root or operation enum input
- **AND** the procedure reads current local-player evidence before send and
  does not admit caller-provided player ID as mutation authority
- **AND** endpoint, session, state, raw command, generic operation type, raw
  args, direct-control operation envelopes, and legacy `verified` remain
  excluded from procedure input and normal output
- **AND** sent target-setting results remain pending-runtime-proof and
  no-repeat guarded until a future source-owned progression read/postcondition
  proves the live target state changed
- **AND** direct-control remains the low-level runtime/proof owner for
  player-operation target sends, command serialization, validator output, and
  no-repeat proof facts consumed by the procedures

#### Scenario: Government-domain choices use exact service procedures
- **WHEN** `government.choice.check`, `government.choice.request`,
  `government.celebration.choice.check`, and
  `government.celebration.choice.request` expose their caller-facing contracts
- **THEN** control-oRPC owns the input, output, postcondition, and next-step
  schemas for those service procedures under the `government` router
- **AND** the input admits only government type or golden-age type; ambient
  local-player identity and the fixed government Activate action remain native
  runtime facts rather than caller authority
- **AND** direct-control owns only exact native check/send adaptation and raw
  immutable government or celebration state observations
- **AND** the service owns semantic availability, guarded mutation, bounded
  post-send polling, target-specific confirmation, dispatch uncertainty, and
  no-repeat policy
- **AND** mutation carries the service-admitted snapshot into a native
  compare-and-send guard so a changed player, target state, action, or blocker
  aborts before dispatch without moving semantic policy into direct-control
- **AND** native `canStart(...).Success` remains admission authority while
  chooser option rows remain observational evidence
- **AND** government confirmation requires the current government to match the
  selected government, while celebration confirmation requires the active
  golden age normalized through `GoldenAges.lookup` and `Database.makeHash` to
  match the selected celebration operation identity
- **AND** generic player-operation paths reject `CHANGE_GOVERNMENT` and
  `CHOOSE_GOLDEN_AGE`, including their supported prefixed aliases
- **AND** endpoint, session, state, raw command, generic operation type, raw
  args, direct-control operation envelopes, and legacy `verified` remain
  excluded from procedure input and normal output

#### Scenario: Narrative choice uses exact service procedures
- **WHEN** `narrative.choice.check` and `narrative.choice.request` expose their
  caller-facing contracts
- **THEN** control-oRPC owns the input, output, postcondition, and next-step
  schemas for those service procedures under the `narrative` router
- **AND** input admits only narrative target type and target component
  identity; ambient local-player identity and `PlayerOperationParameters.Activate`
  remain native runtime facts rather than caller authority
- **AND** direct-control owns only exact native check/send adaptation and a
  focused immutable narrative-blocker observation
- **AND** the service owns semantic availability, guarded mutation, bounded
  post-send polling, blocker-transition classification, dispatch uncertainty,
  and no-repeat policy
- **AND** mutation carries the service-admitted snapshot into a native
  compare-and-send guard so changed player, action, or blocker evidence aborts
  before dispatch without moving semantic policy into direct-control
- **AND** native `canStart(...).Success` remains admission authority while
  narrative option rows remain observational evidence
- **AND** popup/panel traversal, notification activation, audio, and UI
  closeout are presentation behavior rather than gameplay mutation authority
- **AND** generic player-operation paths reject
  `CHOOSE_NARRATIVE_STORY_DIRECTION`, including its supported prefixed alias
- **AND** endpoint, session, state, raw command, generic operation type, raw
  args, direct-control operation envelopes, UI payloads, and legacy `verified`
  remain excluded from procedure input and normal output

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

#### Scenario: Advisor warning acknowledgement is service-owned
- **WHEN** `notifications.advisorWarning.viewed.check` or
  `notifications.advisorWarning.viewed.request` handles an advisor warning
  under the `notifications` router
- **THEN** control-oRPC owns the contract-local target-only input schema,
  exact four-type admission, ambient local-player derivation, guarded
  mutation, bounded post-send observation, semantic postconditions, dispatch
  uncertainty, no-repeat policy, and normal output wording
- **AND** the input is closed and admits only the target notification
  ComponentID; it does not accept caller player id, endpoint, session, state,
  host, port, command, rawCommand, transport, approval, reason, raw operation,
  or caller-supplied proof fields
- **AND** the service invokes only the exact direct-control advisor-warning
  check/send atoms, which use native `VIEWED_ADVISOR_WARNING` admission and
  dispatch with the ambient local player and raw target snapshots
- **AND** generic player-operation dispatch rejects
  `VIEWED_ADVISOR_WARNING`, so it cannot form a second acknowledgement path
- **AND** confirmed clearance requires exact target absence from the native
  registry or readable removal from the active notification queue; sticky,
  unreadable, incoherent, and transport-indeterminate outcomes remain
  no-repeat guarded
- **AND** normal output omits host, port, state, session, command, rawCommand,
  Tuner payloads, direct-control runtime envelopes, raw player-operation
  details such as `VIEWED_ADVISOR_WARNING` / `Target`, legacy `verified`,
  approval/reason mechanics, and raw transport details
- **AND** local package and controller tests prove service composition and fake
  game-runtime behavior only; deployed Civ7 runtime proof remains pending

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

#### Scenario: CLI advisor warning checks and sends use notifications service projection
- **WHEN** `game play notifications advisor-warning` checks or acknowledges an
  advisor warning notification
- **THEN** the CLI constructs native control-oRPC context from endpoint flags
- **AND** read-only mode calls
  `notifications.advisorWarning.viewed.check`, while `--send` calls
  `notifications.advisorWarning.viewed.request`, through the in-process
  server-side client under the `notifications` router
- **AND** exact type admission, local-player selection, operation mapping,
  postcondition classification, dispatch uncertainty, and no-repeat guidance
  come from the service procedure and exact direct-control wire atoms
- **AND** both modes provide only the target notification ComponentID and do
  not accept caller `--player-id` or raw operation fields
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
- **AND** Node-side callers provision the live direct-control dependency from
  `@civ7/direct-control/live`, not from a control-oRPC provider entrypoint
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

#### Scenario: CLI end-turn uses native turn procedures
- **WHEN** `game play end-turn` checks or requests turn completion
- **THEN** the CLI constructs native control-oRPC context from endpoint flags
- **AND** the check and send paths call the in-process `turn.complete.check`
  and `turn.complete.request` server-side clients respectively
- **AND** the procedures' native availability, direct-control guarded send,
  bounded observation, postcondition projection, dispatch uncertainty, and
  no-repeat policy remain authoritative
- **AND** expected pre-send guard blocks project as semantic `not-sent`
  turn-completion output with inspect/do-not-repeat next steps rather than
  `TURN_COMPLETION_UNAVAILABLE`
- **AND** the normal JSON result is the semantic turn-completion procedure
  projection without raw command/session/state/Tuner details or legacy
  `verified`
- **AND** focused CLI tests do not claim live Civ7 runtime proof

#### Scenario: CLI notification dismissal uses native notification procedures
- **WHEN** `game play dismiss-notification` checks or requests a notification
  dismissal
- **THEN** the CLI constructs native control-oRPC context from endpoint flags
- **AND** read-only mode calls `notifications.dismiss.check`, while `--send`
  calls `notifications.dismiss.request` through the in-process server-side
  client
- **AND** the procedures' native availability, guarded send, postcondition
  projection, dispatch uncertainty, and no-repeat policy remain authoritative
- **AND** the normal JSON result is the semantic notification dismissal
  procedure projection without raw command/session/state/Tuner details, route
  diagnostics, closeout path, verification attempts, or legacy `verified`
- **AND** focused CLI tests do not claim live Civ7 runtime proof

#### Scenario: CLI unit target send uses native unit procedure
- **WHEN** `game play unit target` checks or sends a unit target action
- **THEN** the CLI constructs native control-oRPC context from endpoint flags
- **AND** read-only mode calls `unit.target.action.check`, while `--send` calls
  `unit.target.action.request` through the in-process server-side client
- **AND** the service's native-order resolution, war refusal, guarded dispatch,
  postcondition projection, uncertainty, and no-repeat policy remain
  authoritative
- **AND** the normal JSON result is the semantic unit target action procedure
  projection without raw command/session/state/Tuner details, send results,
  before/after runtime probes, direct-control verification envelopes, or
  legacy `verified`
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

#### Scenario: CLI production checks and sends use native city procedures
- **WHEN** `game play build-production` checks or sends a city production choice
- **THEN** the CLI constructs native control-oRPC context from endpoint flags
- **AND** the read-only path calls `city.production.choice.check` and the send
  path calls `city.production.choice.request` through the in-process server-side
  client under the `city` router
- **AND** direct-control supplies the exact production check/send wire atoms,
  while the city service owns request orchestration, production postcondition
  classification, and no-repeat policy
- **AND** the normal JSON result is the semantic city production check or
  request projection without raw command/session/state/Tuner details,
  UI-closeout payloads, send results, before/after runtime probes, or legacy
  `verified`
- **AND** focused CLI tests do not claim live Civ7 runtime proof

#### Scenario: CLI population placement uses native city procedures
- **WHEN** `game play assign-worker` or `game play expand-city` checks or
  requests city population placement
- **THEN** the CLI constructs native control-oRPC context from endpoint flags
- **AND** read-only mode calls `city.population.place.check` while `--send`
  calls `city.population.place.request`
- **AND** exact runtime atoms and service-owned placement policy remain
  authoritative for both paths
- **AND** the normal JSON result is the semantic city population placement
  procedure projection without raw command/session/state/Tuner details,
  before/after runtime snapshots, direct-control operation envelopes, or
  legacy `verified`
- **AND** assign-worker admits neither caller player ID nor amount; the exact
  runtime atom derives the ambient local player and one-worker amount
- **AND** `assign-worker --send` omits caller `--player-id`; the service passes
  only the target location, and the exact direct-control runtime atom resolves
  the ambient local player at dispatch
- **AND** focused CLI tests do not claim live Civ7 runtime proof

#### Scenario: CLI town-focus commands use native city procedures
- **WHEN** `game play set-town-focus` or
  `game play consider-town-project` checks or requests a town-focus action
- **THEN** the CLI constructs native control-oRPC context from endpoint flags
- **AND** read-only mode calls the corresponding
  `city.townFocus.change.check` or `city.townFocus.review.check` procedure
- **AND** send mode calls the corresponding
  `city.townFocus.change.request` or `city.townFocus.review.request` procedure
- **AND** direct-control remains limited to bounded native change-check,
  change-send, review-read, and review-send atoms plus raw state snapshots
- **AND** the city procedures own readiness, semantic admission, bounded
  polling, postcondition classification, dispatch uncertainty, and no-repeat
  policy
- **AND** the normal JSON result is the semantic city town-focus procedure
  projection without raw command/session/state/Tuner details, generic
  operation type or args fields, direct-control operation envelopes, or legacy
  `verified`
- **AND** caller-owned `--closeout` composition is retired; focus change and
  project review remain explicit city service actions
- **AND** no generic operation validation or send fallback remains
- **AND** focused CLI tests do not claim live Civ7 runtime proof

#### Scenario: CLI diplomacy response uses native service procedures
- **WHEN** `game play diplomacy respond` checks or requests an ordinary
  diplomacy response
- **THEN** the CLI constructs native control-oRPC context from endpoint flags
- **AND** read-only mode calls `diplomacy.response.check`, while `--send` calls
  `diplomacy.response.request` through the in-process server-side client
- **AND** caller input admits only action and response identifiers; ambient
  local-player and blocking-notification identity come from current runtime
  evidence
- **AND** direct-control owns only exact native check/send adaptation, guarded
  dispatch, and focused response/event/blocker observations
- **AND** the diplomacy service owns offered-response admission, dedicated-war
  refusal, bounded blocker observation, semantic postconditions, dispatch
  uncertainty, and no-repeat policy
- **AND** rejecting a military-presence denunciation is refused by this
  ordinary procedure because Civ7 routes it through a separate war-confirmation
  workflow
- **AND** the normal JSON result is the semantic diplomacy response procedure
  projection without raw command/session/state/Tuner details, player or
  notification identity, validation summaries, diplomacy state internals,
  direct-control runtime payloads, or legacy `verified`
- **AND** first-meet greetings use their separate exact
  `diplomacy.firstMeet.response` service owner rather than this ordinary
  diplomacy-response path
- **AND** focused CLI tests do not claim live Civ7 runtime proof

#### Scenario: First-meet greetings use exact native service procedures
- **WHEN** `game play diplomacy respond-first-meet` checks or requests a
  first-meet diplomacy greeting
- **THEN** the CLI constructs native control-oRPC context from endpoint flags
- **AND** read-only mode calls `diplomacy.firstMeet.response.check`, while
  `--send` calls `diplomacy.firstMeet.response.request` through the in-process
  server-side client
- **AND** caller input admits only the encountered player and one named
  `friendly`, `neutral`, or `unfriendly` greeting
- **AND** ambient local-player identity and the native response type are
  resolved inside the runtime atom rather than supplied by callers
- **AND** direct-control owns only exact
  `RESPOND_DIPLOMATIC_FIRST_MEET` check/send adaptation, guarded dispatch, and
  paired immutable blocker observations
- **AND** the diplomacy service owns availability, bounded post-send polling,
  exact blocker-clearance classification, dispatch uncertainty, and no-repeat
  policy
- **AND** exact pre-send `NOTIFICATION_PLAYER_MET` evidence for the encountered
  player must clear before completion is confirmed
- **AND** popup activation, generic player-operation validation, raw response
  hashes, and direct-control-owned polling or proof policy do not provide
  alternate paths
- **AND** the normal JSON result is the semantic first-meet response procedure
  projection without raw command/session/state/Tuner details,
  direct-control operation envelopes, before/after notification snapshots, or
  legacy `verified`
- **AND** sticky, malformed, unmatched, or otherwise non-target-specific
  evidence remains unverified and no-repeat guarded
- **AND** the generic player-operation surface rejects
  `RESPOND_DIPLOMATIC_FIRST_MEET`
- **AND** focused CLI tests do not claim live Civ7 runtime proof

#### Scenario: CLI narrative choice uses native narrative procedures
- **WHEN** `game play choose-narrative` checks or requests a narrative story
  direction choice
- **THEN** the CLI constructs native control-oRPC context from endpoint flags
- **AND** read-only mode calls `narrative.choice.check`, while `--send` calls
  `narrative.choice.request` through the in-process server-side client
- **AND** exact runtime atoms and service-owned narrative choice policy remain
  authoritative for both paths
- **AND** caller player ID and action are omitted because ambient local-player
  identity and the Activate action belong to the native runtime
- **AND** the normal JSON result is the semantic narrative choice procedure
  projection without raw command/session/state/Tuner details, App UI closeout
  payloads, panel/popup internals, direct-control runtime payloads, or legacy
  `verified`
- **AND** the read-only `game play choose-narrative --options` path remains a
  separate direct-control notification/option observation until a service-owned
  option read is accepted; it does not become mutation admission authority
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
- **AND** send mode omits caller `--player-id`; the send result uses live
  notification local-player evidence rather than caller validation identity as
  send authority
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
- **AND** the send path omits caller `--player-id` and the result uses live
  local-player evidence rather than caller-provided player identity
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

#### Scenario: CLI government-domain choices use native government procedures
- **WHEN** `game play choose-government` or
  `game play choose-celebration` checks or requests a government-domain choice
- **THEN** the CLI constructs native control-oRPC context from endpoint flags
- **AND** read-only mode calls `government.choice.check` or
  `government.celebration.choice.check`, while `--send` calls the corresponding
  request procedure
- **AND** exact runtime atoms and service-owned choice policy remain
  authoritative for both paths
- **AND** caller player ID and government action are omitted because ambient
  local-player identity and the Activate action belong to the native runtime
- **AND** the normal JSON result is the semantic government-domain procedure
  projection without raw command/session/state/Tuner details, generic
  operation type or args fields, direct-control operation envelopes, or legacy
  `verified`
- **AND** target-specific state readback may confirm a sent choice; unchanged,
  unavailable, or mismatched state remains unverified and no-repeat guarded
- **AND** the commands do not embed a direct-control chooser-option reader;
  option discovery remains on the separate notification and attention
  observation surfaces until an accepted service-owned read exists
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

#### Scenario: In-game controller bridge ownership is recorded
- **WHEN** the in-game controller bridge is implemented
- **THEN** the bridge contract treats `Civ7IntelligenceBridge.invoke(...)` as
  serialized ingress only
- **AND** the game-scoped UIScript owns loading an in-process oRPC/Effect
  router rather than exposing a hand-maintained App UI method table
- **AND** ingress requests identify an allowlisted procedure key and serialized
  procedure input, not raw command/session/tuner payloads
- **AND** controller runtime context owns local-player/hotseat identity,
  lifecycle certification, and proof/evidence sinks
- **AND** `mods/mod-civ7-intelligence-bridge` owns the game-scoped source and
  generated mod artifacts
- **AND** deployed loading and live behavior remain unproven until their
  runtime proof gates pass

#### Scenario: Read-only controller ingress core is installed
- **WHEN** the controller ingress receives a read-only request
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
- **AND** local proof does not claim deployed Civ7 loading or live runtime
  behavior

#### Scenario: Global intelligence bridge binding delegates to ingress
- **WHEN** the game-scoped `Civ7IntelligenceBridge` binding is installed on
  `globalThis`
- **THEN** the binding exposes only `invoke(request)` on a caller-provided
  target
- **AND** `invoke(request)` delegates to the existing controller ingress over
  the native in-process router/client
- **AND** the installer refuses to overwrite an existing bridge unless
  replacement is explicit
- **AND** raw command/session/tuner endpoint fields remain rejected by the
  ingress envelope after global installation
- **AND** local source and bundle proof does not substitute for deployed Civ7
  loading or live runtime proof

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
- **AND** local-player/hotseat and runtime claims remain bounded by their
  capability-specific proof

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
  service dispatch; additional mutation allowlists and deployed runtime proof
  remain independently gated

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
  service dispatch; further mutation allowlists and deployed runtime proof
  remain independently gated

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
  service dispatch; further mutation allowlists and deployed runtime proof
  remain independently gated

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
  service dispatch; further mutation allowlists and deployed runtime proof
  remain independently gated

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
  service dispatch; further mutation allowlists and deployed runtime proof
  remain independently gated

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
  service dispatch; further mutation allowlists and deployed runtime proof
  remain independently gated

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
  service dispatch; further mutation allowlists and deployed runtime proof
  remain independently gated

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
  service dispatch; further mutation allowlists and deployed runtime proof
  remain independently gated

#### Scenario: Game-scoped controller bootstrap package is seeded
- **WHEN** the repository builds the Civ7 controller bootstrap artifact
- **THEN** `mods/mod-civ7-intelligence-bridge` generates a `.modinfo` that
  declares a `scope="game"` action group and a `<UIScripts>` entry for the
  controller UI script
- **AND** the controller imports the public `@civ7/control-orpc` service
  contract and client surface rather than a transport or provider entrypoint
- **AND** the game-UI adapter installs the `Civ7IntelligenceBridge` global
  binding over the native service client rather than creating a second
  dispatcher
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
  and live runtime proof remain pending

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
  support, and play-thread action remain pending

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

#### Scenario: Native mutation readiness requires controller proof for controller-supported mutations
- **WHEN** a mutating procedure runs through the native in-process router
- **AND** direct-control playable status is false
- **AND** controller context lists the procedure in `supportedMutationProcedures`
- **THEN** native mutation readiness MUST still require context-owned
  game-controller-ready lifecycle, `GameContext.localPlayerID`, and
  single-local-player/hotseat proof before the mutation handler runs
- **AND** an allowlist without valid controller proof fails through bounded
  `MUTATION_READINESS_REQUIRED` output before any direct-control or game-UI
  mutation port executes
- **AND** the controller proof remains context metadata, not procedure input,
  serialized caller authority, raw command/session output, or deployed Civ7
  runtime proof

#### Scenario: Game UI controller supports notification dismissal
- **WHEN** the game-scoped controller context exposes notification dismissal
  game UI APIs
- **THEN** the context may execute the service-owned
  `notifications.dismiss.check` and `notifications.dismiss.request`
  procedures through the existing in-process router
- **AND** the service-owned game UI notification-dismissal access path executes against
  ambient `Game.Notifications`, `GameContext`, and notification queue evidence
  without tuner socket/session command serialization
- **AND** the controller calls
  `Game.Notifications.canUserDismissNotification(id)` for native admission and
  `Game.Notifications.dismiss(id)` exactly once for mutation
- **AND** it does not call `NotificationModel.manager.dismiss/onDismiss` as an
  alternate mutation or verification path
- **AND** broad `readiness.current` mutation capability remains conservative
  until game UI mutation surfaces are actually implemented
- **AND** native mutation readiness admits only the explicitly context-listed
  `notifications.dismiss.request` game-UI mutation when context-owned
  controller proof is present, while other mutation ports remain bounded as
  unsupported
- **AND** `readiness.current` exposes the same context-listed controller
  support as bounded procedure capability facts; read support may set
  `canObserve`, but mutation support MUST NOT set `canMutate` unless the
  runtime readiness source proves mutation capability
- **AND** normal bridge success output remains the semantic notification
  dismissal result and omits raw route internals, host, port,
  state, command, rawCommand, session, and tuner payloads
- **AND** local package and bundle tests prove source shape and local fake game
  runtime behavior only; deployed Civ7 runtime proof, other mutation runtime
  ports, and play-thread action remain pending

#### Scenario: Game UI controller supports advisor-warning acknowledgement
- **WHEN** the game-scoped controller context exposes exact advisor-warning
  notification and player-operation APIs
- **THEN** the context may execute
  `notifications.advisorWarning.viewed.check` and
  `notifications.advisorWarning.viewed.request` through the existing
  in-process router
- **AND** the controller checks native admission with the ambient local player,
  `VIEWED_ADVISOR_WARNING`, `{ Target }`, and `false`, then invokes
  `sendRequest` exactly once only after the admitted target snapshot still
  matches
- **AND** the controller exposes raw before/after evidence to the service but
  does not own four-type admission, polling, semantic completion, uncertainty,
  no-repeat policy, UI activation, or handler closeout
- **AND** local package and bundle tests prove source shape and local fake game
  runtime behavior only; deployed Civ7 runtime proof remains pending

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
- **AND** the game UI attention dependency data does not preserve legacy `cli`
  command recipe fields or literal `game play ...` command strings in
  bridge/service output
- **AND** local package and bundle tests prove source shape and local fake game
  runtime behavior only; deployed Civ7 runtime proof, broader read/mutation
  ports, and play-thread action remain pending

#### Scenario: Game UI controller supports turn completion
- **WHEN** the game-scoped controller can resolve the official
  `.action-panel` component and its `canEndTurn()` and `sendEndTurn()` methods
- **THEN** the context may execute the service-owned `turn.complete.check` and
  `turn.complete.request` procedures through the existing in-process router
  and native readiness middleware
- **AND** the check and request leaves are advertised independently according
  to the exact native methods each requires
- **AND** immutable `GameContext.hasSentTurnComplete()` and `Game.turn`
  observations supply acknowledgement and turn-advance evidence without
  replacing the action panel's native admission authority
- **AND** missing components, missing methods, failed observations, blocked
  native admission, already-sent state, and indeterminate dispatch project
  conservative unavailable, `not-sent`, or no-repeat-guarded results
- **AND** the adapter does not call raw `GameContext.sendTurnComplete()`, an
  invented ambient `canEndTurn`, notification-derived fallback admission, or
  unrelated unready-turn behavior
- **AND** normal bridge success output remains the semantic turn-completion
  result and omits host, port, state, command, rawCommand, session, tuner
  payloads, raw game-UI function names, and direct-control socket details
- **AND** local package and bundle tests prove source shape and local fake game
  runtime behavior only; deployed Civ7 runtime proof, other game UI mutation
  ports, and play-thread action remain pending

#### Scenario: Game UI controller supports production choice
- **WHEN** the game-scoped controller context exposes ambient production-choice
  APIs for `Game.CityOperations.canStart`, `Game.CityOperations.sendRequest`,
  `CityOperationTypes.BUILD`, city state, and notification blocker evidence
- **THEN** the context may execute the service-owned
  `city.production.choice.check` read and `city.production.choice.request`
  mutation through the existing in-process router, with native
  mutation-readiness middleware on the request leaf
- **AND** `city.production.choice.check` is listed as a supported game-UI read
  when the required ambient validation APIs are present
- **AND** `city.production.choice.request` is listed as a supported game-UI
  mutation only when controller proof and the required ambient validation and
  send APIs are present
- **AND** the game UI adapter implements only the exact check/send runtime atoms
  and raw evidence reads; the city service owns check/request orchestration,
  postcondition classification, and no-repeat-after-unverified policy
- **AND** production check/send atoms invoke `CityOperations.BUILD` directly
  without selecting a city, moving a plot cursor, or closing interface state
- **AND** a non-throwing `sendRequest` call proves dispatch invocation rather
  than synchronous engine acknowledgement
- **AND** missing observation APIs surface as failed raw probes and cannot
  confirm the production postcondition or release no-repeat policy
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
  ports, and play-thread action remain pending

#### Scenario: Game UI controller supports population placement
- **WHEN** the game-scoped controller context exposes ambient population
  placement APIs for `Game.PlayerOperations.canStart/sendRequest`,
  `PlayerOperationTypes.ASSIGN_WORKER`, `Game.CityCommands.canStart/sendRequest`,
  `CityCommandTypes.EXPAND`, player city lists, city readiness, worker
  placement, and expansion evidence
- **THEN** the context may execute the service-owned
  `city.population.place.check` and `city.population.place.request`
  procedures through the existing in-process router and readiness middleware
- **AND** the check procedure is advertised only when both exact validation
  and observation surfaces are available
- **AND** the request procedure is advertised only when the corresponding
  exact send surfaces are also available
- **AND** assign-worker input remains semantic `{ location }` while expand-city
  input remains semantic `{ cityId, destination }`; caller `playerId`, raw
  operation types, and raw command/session fields are not accepted as bridge
  input
- **AND** assign-worker sends use controller-owned `GameContext.localPlayerID`
  evidence through the service context before any `PlayerOperations.sendRequest`
  call
- **AND** validator-blocked population placements project semantic `not-sent`
  output and do not call the send API
- **AND** worker assignment is confirmed only by an increased worker count on
  the requested plot, while city expansion is confirmed only by requested-city
  ownership of the requested plot
- **AND** readiness clearing, validation-only changes, unrelated state changes,
  failed target reads, missing target evidence, and unchanged target state
  remain unconfirmed and no-repeat guarded
- **AND** normal bridge success output remains the semantic population-placement
  result and omits host, port, state, command, rawCommand, session, tuner
  payloads, raw game-UI function names, and direct-control socket details
- **AND** local package and bundle tests prove source shape and local fake game
  runtime behavior only; deployed Civ7 runtime proof, other mutation ports,
  and play-thread action remain pending

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
- **AND** the bridge request omits caller `playerId`; the runtime send player
  is derived from controller-owned `GameContext.localPlayerID` and the pre-read
  local-player notification evidence
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
- **AND** caller input omits `playerId`; the runtime send player is derived
  from controller-owned `GameContext.localPlayerID`
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
  `PlayerOperationTypes.RESPOND_DIPLOMATIC_ACTION`, current response/event
  reads, paired blocking-notification reads, native discriminator constants,
  and controller-owned local-player proof
- **THEN** the context may execute service-owned
  `diplomacy.response.check/request` procedures through the existing
  in-process router and native readiness/proof middleware
- **AND** check and request capabilities are advertised independently, with
  request requiring native `sendRequest`
- **AND** caller input omits player and notification identity; the runtime send
  player and exact blocker come from current controller-owned evidence
- **AND** validator-blocked diplomacy responses project semantic `not-sent`
  output and do not call the send API
- **AND** only disappearance or replacement of the exact pre-send diplomacy
  blocker confirms clearance; sticky, malformed, or failed observations remain
  no-repeat guarded
- **AND** notification activation, diplomacy-panel traversal, acknowledgement
  animation, and UI closeout are absent from gameplay control
- **AND** normal bridge success output remains the semantic diplomacy-response
  result and omits host, port, state, command, rawCommand, session, tuner
  payloads, raw game-UI function names,
  direct-control socket details, and raw `RESPOND_DIPLOMATIC_ACTION`
  operation names
- **AND** local package and bundle tests prove source shape and local fake game
  runtime behavior only; deployed Civ7 runtime proof, unit runtime ports,
  and play-thread action remain pending

#### Scenario: Game UI controller supports unit target action
- **WHEN** the game-scoped controller context exposes ambient unit target APIs
  for `Game.UnitOperations.canStart/sendRequest`,
  `Game.UnitCommands.canStart/sendRequest`, `Units.get`, `MapUnits.getUnits`,
  `GameplayMap` target-index APIs, `UnitOperationTypes`,
  `UnitOperationMoveModifiers`, and controller-owned local-player proof
- **THEN** the controller provides focused observe, one-action check, and
  guarded one-action send capabilities to the existing in-process unit service
- **AND** check and send capabilities are advertised independently from the
  ambient APIs they actually require
- **AND** the controller does not select among actions, poll, classify
  postconditions, derive no-repeat guidance, or expose a second unit-target
  result contract
- **AND** native checks require literal `Success === true`, preserve the exact
  check/send modifier split, apply ranged and off-current-tile prerequisites,
  and observe action-specific war-start evidence
- **AND** guarded send compares the exact admitted evidence, refuses war-start
  candidates, invokes at most one native method, and reports whether failure
  occurred before or after invocation
- **AND** normal bridge success output remains the semantic unit target result
  and omits host, port, state, command, rawCommand, session, tuner payloads,
  raw game-UI function names, direct-control socket details, send results, and
  raw operation result envelopes
- **AND** local package and bundle tests prove source shape and local fake game
  runtime behavior only; deployed Civ7 runtime proof, broad unit-operation
  catalog support, target-candidate relationship semantics, play-thread action,
  and capability-specific live proof remain pending

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
  catalogs, and play-thread action remain pending

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

### Requirement: Mutation Procedures Preserve Mutation Proof Semantics

Mutation-capable control procedures SHALL preserve validator-first,
postcondition, no-repeat-after-unverified, and runtime-proof boundaries at
their accepted owners.

#### Scenario: Mutation request procedure is implemented
- **WHEN** a mutation-capable procedure sends or requests a Civ7 operation
- **AND** validators run before command construction/send where the atom has a
  validator
- **AND** postcondition policy classifies sent, unverified, stale, unknown,
  missing-postcondition, and pending-runtime-proof outcomes honestly
- **AND** separately accepted telemetry preserves those classifications rather
  than defining or weakening them
- **AND** unverified or pending proof paths remain no-repeat guarded

#### Scenario: Production choice policy is service-owned
- **WHEN** `city.production.choice.check` or
  `city.production.choice.request` handles a production choice
- **THEN** the city service orchestrates exact direct-control check/send atoms
  and owns production postcondition classification, dispatch uncertainty,
  bounded post-send checking, and no-repeat-after-unverified policy
- **AND** direct-control returns raw validator, send, and snapshot evidence
  without exposing a `requestCiv7ProductionChoice` orchestration wrapper
- **AND** direct-control does not own production postcondition/proof policy or a
  production-choice telemetry adapter

#### Scenario: Notification dismissal policy is service-owned
- **WHEN** `notifications.dismiss.check` or
  `notifications.dismiss.request` handles a reviewed notification
- **THEN** the notification service orchestrates exact direct-control
  check/send atoms and owns native admission, specialized advisor-warning
  exclusion, postcondition classification, dispatch uncertainty, bounded
  post-send checking, and no-repeat policy
- **AND** direct-control calls
  `Game.Notifications.canUserDismissNotification(id)` for admission and
  `Game.Notifications.dismiss(id)` exactly once for mutation
- **AND** direct-control returns raw native snapshots without owning polling,
  semantic postconditions, proof policy, telemetry, or a thick request wrapper
- **AND** `NotificationModel.manager.dismiss/onDismiss`, expired-notification
  fallback, train-only removal, and queue-front movement are not alternate
  engine mutation or confirmation authority
- **AND** reviewed queue dismissal reuses the same service operation, preserves
  completed item results, refreshes native evidence before each send, and stops
  after the first uncertain result
- **AND** the aggregate response distinguishes the initial plan from processed
  and remaining items, preserves a source-unavailable stop reason after any
  completed mutation, and reports fully known partial completion without
  inventing dispatch uncertainty
- **AND** local procedure tests do not claim deployed Civ7 runtime proof

#### Scenario: Advisor-warning acknowledgement policy is service-owned
- **WHEN** `notifications.advisorWarning.viewed.check` or
  `notifications.advisorWarning.viewed.request` handles an advisor warning
- **THEN** the notification service owns exact four-type admission, ambient
  local-player authority, guarded mutation, bounded observation, semantic
  completion, dispatch uncertainty, and no-repeat policy
- **AND** direct-control owns only exact native check/send atoms and raw target
  snapshots; it does not own polling, semantic postconditions, proof policy,
  telemetry, or a thick request wrapper
- **AND** generic player-operation dispatch rejects
  `VIEWED_ADVISOR_WARNING`, and specialized notification-handler UI
  bookkeeping is not an alternate mutation or confirmation path
- **AND** local procedure tests do not claim deployed Civ7 runtime proof

#### Scenario: Closeout-style mutation projection is shared
- **WHEN** narrative choice, diplomacy response, or progression choice
  procedures receive source-owned direct-control
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
- **AND** it consumes exact direct-control check/send and focused observation
  ports rather than a thick request or direct-owned proof policy
- **AND** its normal input exposes only action and response identifiers
- **AND** it admits only responses currently offered for the action and routes
  the military-presence rejection to a dedicated war-confirmation workflow
- **AND** its normal output projects semantic status, postcondition, and one
  evidence-based next step
- **AND** it excludes endpoint, session, state, raw command, payload,
  player/notification identity, validation summaries, UI closeout internals,
  and legacy `verified` details from caller-facing input and output
- **AND** sticky, malformed, failed, or missing postcondition observations
  remain no-repeat guarded

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
- **AND** its normal input exposes node and optional notification identity
  rather than player identity, a generic `kind` discriminator, or
  direct-control App UI toggles
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

#### Scenario: Progression dashboard service is implemented
- **WHEN** a caller reads `progression.dashboard.current`
- **THEN** it is offered under the semantic `progression` router
- **AND** it consumes the direct-control progress dashboard runtime port as
  low-level App UI evidence
- **AND** the service procedure owns the summary-first progression projection,
  compact legacy path calculations, warning policy, omitted-detail policy, and
  semantic next-step descriptors
- **AND** caller-facing input accepts only progression dashboard selection
  fields such as optional player id, while endpoint, session, state, raw
  command, rawCommand, transport, and approval/reason fields remain outside
  procedure input
- **AND** normal service output omits raw host, port, state, session, command,
  rawCommand, direct-control runtime envelopes, and CLI command strings
- **AND** local procedure tests do not claim live Civ7 runtime proof

#### Scenario: CLI progress dashboard uses native progression service
- **WHEN** `civ7 game play progress-dashboard` reads current progress
- **THEN** the CLI calls the in-process
  `progression.dashboard.current` server-side client
- **AND** normal JSON uses the service-owned semantic progression dashboard
  projection rather than a CLI-owned runtime projection
- **AND** any CLI command-string presentation is mapped at the CLI edge from
  semantic next-step descriptors, not embedded in the service contract
- **AND** the CLI does not expose raw host, port, state, session, command,
  rawCommand, direct-control runtime envelopes, approval/reason mechanics, or
  transport details as normal progress-dashboard output

#### Scenario: Progression traditions service is implemented
- **WHEN** a caller reads `progression.traditions.current`
- **THEN** it is offered under the semantic `progression` router
- **AND** it consumes the direct-control traditions runtime port as low-level
  App UI/Culture evidence
- **AND** the service procedure owns tradition option projection, semantic
  action descriptors, validation-success projection, omitted-detail policy,
  and next-step descriptors
- **AND** caller-facing input accepts only traditions read selection fields
  such as optional player id, while endpoint, session, state, raw command,
  rawCommand, transport, and approval/reason fields remain outside procedure
  input
- **AND** normal service output omits raw host, port, state, session, command,
  rawCommand, direct-control `recommendedCli`, `actionHints[].cli`, runtime
  envelopes, and CLI command strings
- **AND** local procedure tests do not claim live Civ7 runtime proof

#### Scenario: CLI traditions view uses native progression service
- **WHEN** `civ7 game play traditions` reads current traditions
- **THEN** the CLI calls the in-process
  `progression.traditions.current` server-side client
- **AND** normal JSON uses the service-owned semantic traditions projection
  rather than a CLI-owned runtime projection
- **AND** any CLI command-string presentation is mapped at the CLI edge from
  semantic action descriptors, not embedded in the service contract
- **AND** the CLI does not expose raw host, port, state, session, command,
  rawCommand, direct-control runtime envelopes, approval/reason mechanics, or
  transport details as normal traditions output

#### Scenario: Strategy tactical read services are implemented
- **WHEN** a caller reads battlefield scan, target candidates, or destination
  analysis
- **THEN** the reads are offered under the semantic `strategy` router as
  `strategy.battlefieldScan`, `strategy.targetCandidates`, and
  `strategy.destinationAnalysis`
- **AND** they consume direct-control tactical runtime/read ports as low-level
  App UI evidence rather than exposing direct-control result envelopes
- **AND** the service procedures own bounded planning summaries, semantic
  next-step descriptors, omitted-detail policy, and relationship-safe wording
- **AND** caller-facing input accepts only tactical read selection fields such
  as player id, origins, destination, radii, and bounds, while endpoint,
  session, state, raw command, rawCommand, transport, and approval/reason
  fields remain outside procedure input
- **AND** normal service output omits raw host, port, state, session, command,
  rawCommand, raw city/unit/plot samples, and direct-control runtime envelopes
- **AND** normal output uses `relationship-unproven`/official-proof-neutral
  wording and does not infer official diplomatic labels from owner mismatch,
  proximity, contact, ranking, or action legality
- **AND** local procedure tests do not claim live Civ7 runtime proof

#### Scenario: CLI tactical reads use native strategy services
- **WHEN** `civ7 game play battlefield-scan`,
  `civ7 game play target-candidates`, or
  `civ7 game play destination-analysis` reads tactical planning evidence
- **THEN** the CLI calls the in-process `strategy.battlefieldScan`,
  `strategy.targetCandidates`, or `strategy.destinationAnalysis` server-side
  client
- **AND** normal JSON uses the service-owned semantic strategy projection
  rather than a CLI-owned direct-control runtime projection
- **AND** the CLI does not expose raw host, port, state, session, command,
  rawCommand, direct-control runtime envelopes, approval/reason mechanics, raw
  city/unit/plot samples, or transport details as normal tactical-read output

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

#### Scenario: Turn completion policy is owned by the service
- **WHEN** turn completion is checked or requested
- **THEN** direct-control exposes only exact action-panel check/send atoms and
  immutable source-state observations
- **AND** turn-advanced, turn-complete-sent, not-sent, no-state-change, and
  missing-postcondition classification belongs to the turn service
- **AND** turn-complete-sent, unchanged, missing, and dispatch-uncertain paths
  remain no-repeat guarded until fresh turn/attention evidence is read
- **AND** local postcondition tests do not claim live Civ7 runtime proof

#### Scenario: Turn completion procedures are implemented
- **WHEN** a caller checks or requests turn completion
- **THEN** `turn.complete.check` and `turn.complete.request` are offered under
  the semantic `turn` router
- **AND** the read-only check invokes exact runtime authority directly, while
  the request checks playable readiness before mutation
- **AND** the check projects coherent native action-panel availability,
  including local-player and readable-turn guard evidence
- **AND** the request performs one guarded native `sendEndTurn()` dispatch,
  then uses bounded Effect-owned observation to classify acknowledgement,
  turn advance, unchanged state, missing evidence, and dispatch uncertainty
- **AND** expected direct-control guard-blocked requests are projected as
  semantic `not-sent` output, not runtime unavailability
- **AND** normal inputs are empty and endpoint, session, state, raw command,
  and runtime fields remain context-owned
- **AND** normal output projects only native availability or semantic request
  status, postcondition summary, and next steps without raw before/after
  snapshots or command/session/tuner details
- **AND** turn-complete-sent, no-state-change, missing-postcondition, and
  dispatch-uncertain paths remain no-repeat guarded
- **AND** local procedure tests do not claim live Civ7 runtime proof

#### Scenario: Data or runtime access is needed
- **WHEN** a procedure needs data-layer or runtime access beyond pure input
  values
- **THEN** the access is named as a context dependency, repository/read port,
  or direct-control facade method
- **AND** provider construction remains in caller/runtime assembly rather than
  service module or atom code
