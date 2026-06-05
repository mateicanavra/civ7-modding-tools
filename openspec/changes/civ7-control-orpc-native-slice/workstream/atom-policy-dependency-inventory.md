# Control-oRPC Atom, Policy, And Dependency Inventory

Status: historical inventory and current boundary reference.
Date: 2026-06-04.

## Purpose

This inventory records the direct-control procedure descriptor seeds that
guided the first native control-oRPC slices. It is now historical source
evidence plus a boundary reference; the live control-oRPC contract/router,
runtime facade, and later workstream records are authoritative for current
package shape.

It does not implement contracts, routers, context construction, middleware,
transport, telemetry persistence, runtime proof, or Task 2.9.4 acceptance.

Use this file as implementation input for native oRPC slices: direct-control
owns runtime ports and proof facts; the oRPC package owns procedure contracts,
router modules, service behavior/composition, context, middleware, typed
errors, and server-side clients.

## Historical Descriptor Coverage

At intake, source contained adjacent procedure descriptor artifacts. All
descriptors declare `schemaTechnology: "typebox"`, `proofBoundary:
"local-package-test"`, and `effect-orpc-procedure-core` as a consumer class.
Do not treat the table below as a current implementation matrix; use it as
source evidence for runtime/proof ownership and compare against live
`packages/civ7-control-orpc/src/contract.ts`, `src/router.ts`, and
`src/dependencies/direct-control.ts` before selecting a slice.

| Router family | Procedure keys | Direct-control atom owners | Risk class |
|---|---|---|---|
| `runtime` | `runtime.playable.status`, `runtime.app.ui.snapshot`, `runtime.tuner.health`, `runtime.turn.completion.status`, `runtime.gameinfo.rows` | `src/runtime/{playable-status,app-ui-snapshot,tuner-health}.ts`, `src/play/turn-completion.ts`, `src/play/map/gameinfo.ts` | Read/runtime support/debug observer |
| `map` | `map.summary.read`, `map.plot.snapshot`, `map.grid.read`, `map.visibility.read` | `src/play/map/{reads,visibility}.ts` | Read |
| `notifications` | `notifications.view`, `notifications.dismiss.request` | `src/play/notifications/{view,dismissal-request}.ts` | Read plus one mutation |
| `unit` | `unit.ready.view`, `unit.move.preview`, `unit.summary.read`, `unit.target.action.request` | `src/play/ready/{unit,move-preview}.ts`, `src/play/summaries.ts`, `src/play/operations/unit-target-action.ts` | Read plus one mutation |
| `city` | `city.ready.view`, `city.summary.read`, `city.production.choice.request` | `src/play/ready/city.ts`, `src/play/summaries.ts`, `src/play/operations/production-choice.ts` | Read plus one mutation |
| `player` | `player.summary.read` | `src/play/summaries.ts` | Read |
| `strategy` | `strategy.traditions.view`, `strategy.progress.dashboard`, `strategy.settlement.recommendations`, `strategy.target.candidates`, `strategy.battlefield.scan`, `strategy.destination.analysis` | `src/play/progression/reads.ts`, `src/play/tactical/{settlement,target-candidates,battlefield,destination}.ts` | Read/planning evidence |

The initial mutation descriptor set was narrow:

| Procedure key | Atom owner | Gates recorded on descriptor |
|---|---|---|
| `unit.target.action.request` | `src/play/operations/unit-target-action.ts` | `approvalGate`, `validatorFirst`, `postconditionRequired`, `noRepeatAfterUnverified` |
| `city.production.choice.request` | `src/play/operations/production-choice.ts` | `approvalGate`, `validatorFirst`, `postconditionRequired`, `noRepeatAfterUnverified` |
| `notifications.dismiss.request` | `src/play/notifications/dismissal-request.ts` | `approvalGate`, `validatorFirst`, `postconditionRequired`, `noRepeatAfterUnverified` |

These gates are metadata and proof requirements, not middleware
implementation. They are candidates for native oRPC middleware only after the
future package proves repeated use through oRPC/effect-orpc primitives.

## Atom Map

### Runtime And Session Support

- `runtime.playable.status`: composed readiness read over App UI snapshot and
  Tuner health. Context needs endpoint defaults, state selection, logger,
  evidence sink, and live-session policy.
- `runtime.app.ui.snapshot`: App UI state read. Source uses
  `executeCiv7AppUiCommand`; command construction stays direct-control-local.
- `runtime.tuner.health`: Tuner state/health read. Source uses Tuner command
  execution and reconnect/session behavior; future procedures receive this as
  facade behavior, not raw session access.
- `runtime.turn.completion.status`: read-only turn blocker/status view. Send
  variants in `src/play/turn-completion.ts` exist but are not adjacent
  procedure atoms in this inventory.
- `runtime.gameinfo.rows`: debug observer read over bounded GameInfo rows.
  Keep it debug/runtime support, not normal player-agent raw dump.

### Map And Visibility Reads

- `map.summary.read`, `map.plot.snapshot`, and `map.grid.read` are bounded map
  reads owned by `src/play/map/reads.ts`.
- `map.visibility.read` is a bounded visibility summary owned by
  `src/play/map/visibility.ts`.
- Map location validation is direct-control-owned in
  `src/play/map/validation.ts` and shared schema ownership lives in
  `src/play/map/types.ts`.
- Raw `Visibility.revealAllPlots` mutation behavior exists in the source, but
  it is not a native procedure atom here and must not be promoted without
  approval and live-mutation proof gates.

### Notifications And Decision Queue

- `notifications.view` reads HUD notifications, decision hints, required
  inputs, and semantic next-step candidates. It is a normal player-agent read
  surface, not raw transport output.
- `notifications.dismiss.request` is mutation-capable and uses
  `requestCiv7NotificationDismissal` with approval, verification attempts, and
  explicit notification dismissal postconditions.
- Notification postcondition ownership is in
  `src/play/notifications/postconditions.ts`; telemetry adaptation is in
  `src/proof/notification-dismissal-telemetry.ts`.

### Unit, City, Player, And Strategy Reads

- Ready views and summaries are read atoms over stable TypeBox schemas:
  `unit.ready.view`, `unit.move.preview`, `unit.summary.read`,
  `city.ready.view`, `city.summary.read`, and `player.summary.read`.
  Their transitional public control-oRPC facade leaves have been burned down;
  future exposure should be a service-owned semantic view, not a direct
  wrapper over these atoms.
- Strategy reads are planning evidence: traditions, progress dashboard,
  settlement recommendations, target candidates, battlefield scan, and
  destination analysis.
- Strategy/tactical reads must preserve neutral relationship evidence. Target
  candidates and battlefield scan keep `relationshipLabelPolicy` in the
  `not-classified` / `none` / `relationship-unproven` family unless official
  relationship/team/war/suzerain evidence proves more.

### Mutation Atoms And Implemented Domain Procedures

- `unit.target.action.request` wraps validator-selected unit action requests
  and post-send verification.
- `city.production.choice.request` wraps production choice requests and
  production postconditions.
- `notifications.dismiss.request` wraps notification dismissal and dismissal
  postconditions.
- Diplomacy, narrative, population placement, technology/culture closeout, and
  turn completion source capabilities now have bounded native procedure leaves.
  Setup actions, autoplay actions, reveal-map, and generic operation request
  wrappers still exist as source capabilities but are not accepted native
  procedure atoms in this inventory.
  Technology/culture closeout postcondition classification remains
  direct-control-owned in
  `src/play/progression/choice-postconditions.ts`;
  `progression.technology.choice.request` and
  `progression.culture.choice.request` own the semantic service
  contract/projection over those runtime/proof ports.

## Policy Owners

| Policy | Current source owner | Native oRPC placement |
|---|---|---|
| Approval | `src/action-approval.ts` plus mutation atom inputs carrying `approvalReason` and optional disposable-session intent | oRPC mutation middleware or procedure guard; must not invent approval |
| Validator-first | `src/play/operations/validate-request.ts`, unit-target/production/notification request owners | oRPC middleware/procedure guard before send when an atom has validator support |
| Postcondition classification | `src/play/operations/*-postconditions.ts`, `src/play/notifications/postconditions.ts`, `src/play/progression/choice-postconditions.ts` | Direct-control classifier remains owner; oRPC middleware consumes classification |
| No-repeat-after-unverified | `src/proof/operation-telemetry.ts` plus specialized proof-policy helpers and telemetry adapters; production choice now starts in `src/play/operations/production-choice-proof.ts`, notification dismissal in `src/proof/notification-dismissal-proof-policy.ts`, unit target action in `src/proof/unit-target-proof-policy.ts`, narrative choice in `src/proof/narrative-choice-proof-policy.ts`, diplomacy response in `src/proof/diplomacy-response-proof-policy.ts`, population placement in `src/play/operations/population-placement-proof.ts` plus `src/proof/population-placement-proof-policy.ts`, and turn completion in `src/proof/turn-completion-proof-policy.ts` | oRPC mutation proof middleware consumes, never weakens, and never infers repeat safety from `verified` |
| Relationship authority | current tactical `relationshipLabelPolicy` schemas plus the OpenSpec neutral-relationship invariant | Read projection policy or middleware guard; no hostile/enemy/opponent labels from proximity/owner mismatch |
| Command serialization | `src/runtime/command-serialization.ts` and atom-local `build*Command` functions | Direct-control-only implementation detail; never procedure input/output |
| Semantic/debug projection | `workstream/semantic-cli-envelope-contract.md`, `debug-service-projection-contract.md`, descriptor `projection` fields | Output projection per consumer class; normal CLI stays semantic |
| Safe error projection | `src/direct-control-error.ts`, `src/error-message.ts`, descriptor error summaries | Native oRPC typed errors with bounded data; no raw command-bearing cause messages |
| Correlation | `src/session/request-id.ts`, descriptor `correlation` fields, operation telemetry | oRPC context metadata; no direct-control-local event bus |

## Dependency Map

Future `packages/civ7-control-orpc` context should receive ready dependencies
instead of constructing them inside procedure modules:

| Dependency | Why it exists | Current evidence |
|---|---|---|
| `directControl` facade | Stable access to runtime ports without raw command/session leakage | Transitional read leaves currently call atom functions through context; future procedures should not add facade-only shells |
| `endpointDefaults` | Host/port/timeout defaults for direct-control session calls | All current descriptors record `endpoint-defaults`; source receives `Civ7DirectControlOptions` |
| `stateSelection` | App UI/Tuner state routing | All current descriptors record `state-selection`; `executeCiv7AppUiCommand` and `executeCiv7TunerCommand` own state selection |
| `approval` / `riskPolicy` | Mutation authority and live-session policy | Mutation descriptors record `approval-policy` and `live-session-policy`; atoms require `Civ7ActionApproval` |
| `logger` | Procedure/runtime diagnostics | Current descriptors reserve `logger`; implementation is future context dependency |
| `evidenceSink` | Proof/debug/telemetry attachment | Current descriptors reserve `evidence-sink`; operation telemetry owns record vocabulary |
| `clock` | Deterministic observed-at/correlation timing | Procedure-core schema supports `clock`, but current descriptors do not require it yet |
| `correlation` | Request and telemetry linkage | Descriptor correlation policy and operation telemetry `correlationId` |
| `controller` | Future in-game `scope="game"` router services | Not present in direct-control descriptors; belongs to the future game-controller adapter context |

Provider construction is explicitly outside procedure modules. Native oRPC
callers may supply these dependencies from CLI, tests, Studio server, or
in-game controller runtime assembly.

## Repository And Read-Port Boundary

There is no durable data-layer repository in the current direct-control
procedure atoms. The current "ports" are runtime read facades over Civ7 state:

- session command execution (`src/session/**`);
- bounded runtime reads (`src/runtime/**`);
- map/notification/progression/tactical read atoms (`src/play/**`);
- proof/telemetry record builders (`src/proof/**`).

For native oRPC, treat these as facade dependencies or narrow read ports, not
as repositories that construct providers. If later AI-ingestion or persistence
needs durable storage, that must be a separate owner with schema/tests and
provider assembly outside direct-control runtime capability code.

## Middleware Candidate Map

The following are candidates only; implementation belongs in
`packages/civ7-control-orpc` with oRPC/effect-orpc primitives:

| Candidate | Promotion trigger | Required proof before promotion |
|---|---|---|
| `withEndpointDefaults` | Two or more procedures need host/port/timeout defaults | Context-owned endpoint fields rejected from normal input |
| `requireReadiness` | Procedures share App UI/Tuner readiness preconditions | Playable-status/Tuner/App UI read proof plus no runtime-proof inflation |
| `requireApproval` | Two mutation procedures share approval gate | Approval object construction and refusal tests; no approval invention |
| `validatorFirst` | Send-capable procedures share pre-send validation | Validator-blocked paths prove not-sent/no-repeat guarded |
| `withPostcondition` | Mutations share before/after proof classification | Missing/unverified/pending/stale/blocker-live paths stay no-repeat guarded |
| `relationshipAuthority` | Read outputs expose relationship/candidate labels | Neutral policy tests for target/battlefield/player/city surfaces |
| `projectProcedureError` | Multiple procedures need safe typed failures | Raw command-bearing messages are omitted or bounded |
| `recordProcedureEvidence` | Procedure-level telemetry/proof consumers are accepted | Projection separation tests keep raw telemetry out of normal CLI |

Do not implement any of these as direct-control-local `beforeHandler`,
context-composer, event bus, or router registry.

## Stop Conditions

- A future slice exposes `host`, `port`, `session`, `state`, `stateName`,
  `command`, `rawCommand`, `jsLiteral`, `executeCiv7Command`,
  `executeCiv7AppUiCommand`, or `executeCiv7TunerCommand` through normal
  procedure input/output.
- A mutation procedure treats a legacy `verified` boolean, local fake-runtime
  result, or pending-runtime-proof label as repeat-safe proof.
- A tactical/strategy surface introduces hostile/enemy/opponent/threat/war/ally
  labels without official relationship/team/war/suzerain evidence.
- A native oRPC implementation branch adds transport edges before in-process
  router/server-side caller tests pass.
- Direct-control descriptor work grows new framework mechanics instead of
  recording atom metadata and policy facts.

## Semantic Hierarchy Seed

`workstream/semantic-capability-hierarchy.md` defines the target
Sieve/player-agent capability families: `readiness`, `attention`, `world`,
`strategy`, `narrative`, `diplomacy`, `progression`, domain-owned mutations,
and `debug`. Current direct-control descriptor families remain source evidence
and transitional package shape, not the long-term service hierarchy.

Future implementation slices should use that hierarchy to decide where
service-owned behavior belongs before adding another package module or
procedure leaf.

## Next Native Source Slice

Do not add another facade-only read wrapper. The next source slice should
either implement a semantic family such as `attention` with service-owned
composition, retire one transitional shell by moving service behavior into a
native oRPC procedure module, or promote a repeated policy through actual
oRPC/effect-orpc primitives with reviewable ownership evidence that no custom
wiring or duplicated service shell was added.
