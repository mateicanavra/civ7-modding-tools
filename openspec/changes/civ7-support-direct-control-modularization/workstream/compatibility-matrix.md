# AI-On-Hotseat Compatibility Matrix

This matrix materializes the Task 2.9 gate for direct-control support work.
Rows are planning rows until their `acceptanceStatus` is `accepted` with real
source owners, proof owners, schemas/tests, and stop conditions recorded. Row
existence alone does not close Task 2.9.4.

Common dependency direction:

- `foundationThread`: `019e86b7-b08b-72f3-8341-6c78a1285c93`
- `modelThread`: `019e8b5a-f2ee-7ea2-96bc-8c07dc5ab6cc`
- `dependencyDirection`: hotseat/autoplay foundation feeds the AI-intelligence
  model; exterior debug-only rows must still preserve that separation.

Proof classes remain separate: target-thread evidence, peer reports, repo docs,
local tests, logs/database artifacts, official resources, live runtime proof,
and in-game observations are not interchangeable.

## Acceptance Backlog

These blockers must be cleared before Task 2.9.4 can mark any row accepted.
Rows may move independently, but a dependent implementation lane can start only
from the row or rows it consumes after their `acceptanceStatus` is `accepted`.

| Row | Missing owner/proof assignments | Required proof before acceptance | Dependent lanes that stay blocked |
| --- | --- | --- | --- |
| Hotseat handoff state | Hotseat runtime source owner, hotseat runtime proof owner, runtime gate runner, human-restoration proof owner | Disposable hotseat activation, two-slot `GameContext.localPlayerID` rotation, agent-slot approved operation, turn-complete and human UI restoration evidence | CLI hotseat status, mutation procedure cores, live agent-turn execution, action telemetry |
| Semantic CLI player-agent view | CLI semantic envelope owner, proof owner, envelope schema/test owner, debug-separation reviewer | Local CLI semantic envelope tests plus fixtures proving normal output contains player-agent state/actions and excludes raw service/debug payloads | Tasks 5.1-5.7, normal CLI runtime-status projection, AI-facing semantic summaries |
| Strategy/intelligence ingestion | AI-ingestion contract owner, schema owner, proof owner, source/freshness label owner | Machine-contract fixtures proving source labels, freshness/evidence labels, action/proof vocabulary, and no dependency on CLI strings/raw probes | AI corpus artifacts, strategy/playbook records, static profile recipes, model-training telemetry feeds |
| Debug/internal service output | Debug/service hierarchy owner, proof owner, command/flag boundary owner | Tests proving raw transport/session/probe/closeout/correlation detail is available only through debug-owned service surfaces and not normal play output or AI ingestion | Debug service hierarchy, runtime diagnostics, internal procedure diagnostics |
| Operation/proof telemetry | Telemetry contract owner, schema owner, proof owner, runtime-proof boundary owner | Contract fixtures proving approval, validation, send, post-read, outcome delta, blocker delta, correlation id, evidence policy, stale/unknown classification, and explicit separation from `verified: true` | Telemetry persistence, AI action audit, procedure middleware, semantic CLI proof summaries |
| Effect/oRPC procedure cores | Procedure-core owner, schema owner, proof owner, TypeBox/Effect Schema disposition owner, adapter-boundary owner | Procedure-core contract tests over stable direct-control atoms, typed errors, approval gates, correlation/telemetry hooks, schema encode/decode checks, and explicit non-tunnel transport boundary | Tasks 6.1-6.9, oRPC package behavior, Effect resource/schedule/stream implementation, transport adapters |

Global acceptance stop conditions:

- Stop if a row says it supports both target consumers without separating
  normal CLI projection, debug/internal output, AI ingestion, telemetry, and
  procedure-core consumers.
- Stop if target-thread evidence, peer reports, repo docs, local tests,
  official resources, logs/database artifacts, live runtime proof, or in-game
  observations collapse into one proof claim.
- Stop if Autoplay becomes the primary external-agent executor instead of
  support/debug/native-AI measurement infrastructure.
- Stop if direct-control mutation can target non-agent human turns.
- Stop if AI consumers depend on CLI presentation strings, raw JavaScript
  commands, raw SQL, runtime reflection, App UI mutation surfaces, or vague
  `verified: true`.
- Stop if Effect/oRPC work starts as a raw command tunnel or transport adapter
  before accepted procedure cores over stable direct-control atoms.

## Rows

### Hotseat Handoff State

- `foundationThread`: `019e86b7-b08b-72f3-8341-6c78a1285c93`
- `modelThread`: `019e8b5a-f2ee-7ea2-96bc-8c07dc5ab6cc`
- `dependencyDirection`: hotseat/autoplay foundation -> AI-intelligence model
- `surface`: hotseat handoff state
- `primaryConsumer`: live player-agent controller
- `sourceOwner`: pending hotseat runtime lane owner
- `proofOwner`: pending hotseat runtime proof owner
- `playerScope`: one-client hotseat; agent-owned current local-player slot for
  mutation; human turns remain UI-owned and mutation-refused
- `consumerClass`: live hotseat player-agent control; future semantic CLI
  status; future procedure-core action gating
- `evidenceClass`: `target-thread-evidence-hotseat-foundation`; peer reports;
  repo docs; pending live runtime proof; pending in-game observation
- `procedureCandidate`: needs live proof first
- `normalCliProjection`: summarized state-machine status for current player,
  slot ownership, handoff readiness, blocker state, and safe next steps
- `debugServiceProjection`: proof telemetry, correlation/audit detail, and raw
  handoff diagnostics only under debug/internal service output
- `proofLabel`: `pending-hotseat-runtime-proof`
- `acceptanceStatus`: `pending-hotseat-runtime-proof`; source owner, proof
  owner, runtime gate, and tests not assigned
- `blockingDependents`: CLI hotseat semantic projection, mutation-facing
  procedure cores, AI-controlled live-turn execution, telemetry action audit
- `stopCondition`: stop if Autoplay becomes the primary external-agent product
  executor, if direct-control mutation can target non-agent human turns, if
  one-client hotseat/local-player rotation proof is missing, or if human-visible
  waiting/restoration is not preserved

### Semantic CLI Player-Agent View

- `foundationThread`: `019e86b7-b08b-72f3-8341-6c78a1285c93`
- `modelThread`: `019e8b5a-f2ee-7ea2-96bc-8c07dc5ab6cc`
- `dependencyDirection`: hotseat/autoplay foundation -> AI-intelligence model
- `surface`: semantic CLI player-agent view
- `primaryConsumer`: normal local player-agent CLI user/API
- `sourceOwner`: pending CLI semantic envelope owner
- `proofOwner`: pending CLI semantic envelope proof owner
- `playerScope`: current local player and agent-slot scoped; human-turn
  exclusion must remain visible when relevant
- `consumerClass`: normal CLI player-agent view; AI-intelligence ingestion only
  through a separate machine contract, not presentation text
- `evidenceClass`: repo docs; target-thread evidence; peer reports; pending
  local CLI semantic tests
- `procedureCandidate`: needs schema/type extraction first
- `normalCliProjection`: semantic projection of game state, blockers,
  decisions, action results, safe/unsafe next steps, and postcondition
  classifications
- `debugServiceProjection`: intentionally omitted from normal output; raw
  internals only through debug-owned commands or flags
- `proofLabel`: `pending-cli-semantic-envelope`
- `acceptanceStatus`: `pending-cli-semantic-envelope`; source owner, proof
  owner, envelope schema, and normal/debug separation tests not assigned
- `blockingDependents`: tasks 5.1-5.7, AI-facing semantic envelope consumers,
  normal CLI runtime-status projection
- `stopCondition`: stop if normal CLI dumps raw session, transport, closeout,
  command, proof JSON, route selection, correlation internals, or debug probes
  instead of player-agent state and actions

### Strategy/Intelligence Ingestion

- `foundationThread`: `019e86b7-b08b-72f3-8341-6c78a1285c93`
- `modelThread`: `019e8b5a-f2ee-7ea2-96bc-8c07dc5ab6cc`
- `dependencyDirection`: hotseat/autoplay foundation -> AI-intelligence model
- `surface`: strategy/intelligence ingestion
- `primaryConsumer`: AI-intelligence database/model layer
- `sourceOwner`: pending AI-ingestion contract owner
- `proofOwner`: pending AI-ingestion contract proof owner
- `playerScope`: source-labeled global, player-scoped, local-player-scoped, and
  agent-slot-scoped records as applicable; no implied relationship labels
- `consumerClass`: AI-intelligence ingestion; strategy/playbook/cookbook
  generation; future static native-AI profile shaping
- `evidenceClass`: `target-thread-evidence-ai-model`; peer reports; repo docs;
  prospective direct-control traces; logs/database artifacts only as labeled
  enrichment; pending local tests
- `procedureCandidate`: needs schema/type extraction first
- `normalCliProjection`: omitted field; ingestion must not depend on CLI
  presentation strings
- `debugServiceProjection`: correlation/audit detail and source/freshness labels
  through service/debug or ingestion-specific contracts
- `proofLabel`: `pending-ai-ingestion-contract`
- `acceptanceStatus`: `pending-ai-ingestion-contract`; source owner, proof
  owner, ingestion schema, freshness/source labels, and tests not assigned
- `blockingDependents`: AI corpus artifacts, strategy-data records, static
  profile recipes, telemetry-driven model training, procedure schemas used by
  AI consumers
- `stopCondition`: stop if AI consumers depend on CLI strings, raw JavaScript
  commands, raw SQL, runtime reflection, companion/App UI mutation surfaces,
  unlabeled saves/logs/debug DB rows, or vague `verified: true` instead of
  explicit outcome evidence

### Debug/Internal Service Output

- `foundationThread`: `019e86b7-b08b-72f3-8341-6c78a1285c93`
- `modelThread`: `019e8b5a-f2ee-7ea2-96bc-8c07dc5ab6cc`
- `dependencyDirection`: exterior/debug-only support surface that must remain
  separate from the AI-on-hotseat product path while serving proof and
  diagnostics for it
- `surface`: debug/internal service output
- `primaryConsumer`: direct-control service/debug hierarchy
- `sourceOwner`: pending debug/internal service output owner
- `proofOwner`: pending debug/internal service output proof owner
- `playerScope`: debug/observer scoped unless a row-specific action surface
  assigns local-player or agent-slot scope
- `consumerClass`: debug/internal service output; support diagnostics; future
  procedure-core diagnostics
- `evidenceClass`: local tests; repo docs; logs/database artifacts; official
  resources where cited; pending runtime proof for runtime claims
- `procedureCandidate`: debug-only until schema/type and projection owners are
  recorded
- `normalCliProjection`: debug flag/command only; omitted from normal play
  output
- `debugServiceProjection`: raw diagnostic projection for transport/session
  state, raw probes, route selection, closeout traces, correlation, and
  diagnostics
- `proofLabel`: `planning-evidence-only`
- `acceptanceStatus`: `pending-debug-service-boundary`; debug owner, proof
  owner, command/flag boundary, and tests not assigned
- `blockingDependents`: debug service hierarchy, runtime-status projection,
  internal diagnostics in procedure cores
- `stopCondition`: stop if debug/internal output becomes normal CLI output,
  AI-ingestion input, or a product action authority

### Operation/Proof Telemetry

- `foundationThread`: `019e86b7-b08b-72f3-8341-6c78a1285c93`
- `modelThread`: `019e8b5a-f2ee-7ea2-96bc-8c07dc5ab6cc`
- `dependencyDirection`: hotseat/autoplay foundation -> AI-intelligence model
- `surface`: operation/proof telemetry
- `primaryConsumer`: support proof, AI-intelligence ingestion, and future
  procedure middleware
- `sourceOwner`: pending telemetry contract owner
- `proofOwner`: pending telemetry contract proof owner
- `playerScope`: operation-local, player-scoped, and agent-slot-scoped for
  mutation-facing records; observer/debug scoped for diagnostics
- `consumerClass`: proof telemetry; AI-intelligence ingestion; debug/internal
  service output; future Effect/oRPC middleware
- `evidenceClass`: local tests; target-thread evidence; peer reports; pending
  live runtime proof for runtime claims; logs/database artifacts only when
  source-labeled
- `procedureCandidate`: needs schema/type extraction first
- `normalCliProjection`: summarized state-machine status and explicit
  stale/unknown/postcondition classification only
- `debugServiceProjection`: proof telemetry with strategy intent, candidate
  action, operation family, target, args, approval, validation result, send
  result, post-read, correlation id, evidence policy, approval reason,
  `validation_pre`, `send_receipt`, `validation_post`, `outcome_delta`, blocker
  deltas, runtime observation links, and stale/unknown classification
- `proofLabel`: `pending-telemetry-contract`
- `acceptanceStatus`: `pending-telemetry-contract`; telemetry schema, source
  owner, proof owner, and local/runtime proof boundary tests not assigned
- `blockingDependents`: telemetry persistence, AI ingestion, procedure
  middleware, action audit vocabulary, semantic CLI proof summaries
- `stopCondition`: stop if telemetry trains or acts on vague `verified: true`,
  collapses approval/validation/send/postcondition/outcome evidence, or claims
  live proof from local tests, target-thread evidence, peer reports, or docs

### Effect/oRPC Procedure Cores

- `foundationThread`: `019e86b7-b08b-72f3-8341-6c78a1285c93`
- `modelThread`: `019e8b5a-f2ee-7ea2-96bc-8c07dc5ab6cc`
- `dependencyDirection`: hotseat/autoplay foundation -> AI-intelligence model
- `surface`: Effect/oRPC procedure cores
- `primaryConsumer`: external direct-control boundary over stable atoms
- `sourceOwner`: pending procedure-core schema owner
- `proofOwner`: pending procedure-core schema proof owner
- `playerScope`: per-procedure; local-player and agent-slot scoped for
  mutation; debug/observer scoped for diagnostics
- `consumerClass`: Effect/oRPC procedure core; direct-control service boundary;
  future AI-intelligence and player-agent clients through typed contracts
- `evidenceClass`: repo docs; target-thread evidence; peer reports; local tests
  pending; runtime proof pending for live claims
- `procedureCandidate`: needs schema/type extraction first
- `normalCliProjection`: omitted field; CLI shell remains oclif and semantic
  CLI output is a separate surface
- `debugServiceProjection`: correlation/audit detail, typed errors, approval
  gates, telemetry hooks, resource/schedule/stream diagnostics where appropriate
- `proofLabel`: `pending-procedure-core-schema`
- `acceptanceStatus`: `pending-procedure-core-schema`; schema owner, proof
  owner, procedure contract, middleware boundary, and tests not assigned
- `blockingDependents`: tasks 6.1-6.9, transport adapters, procedure middleware,
  Effect/Bun resource/concurrency implementation, oRPC package behavior
- `stopCondition`: stop if transport adapters or `packages/civ7-control-orpc`
  behavior appears before testable procedure cores over stable direct-control
  atoms, if raw command tunneling is used as the architecture, or if the App UI
  bridge becomes the external direct-control substrate; stop if procedure-core
  schema work starts before a TypeBox versus Effect Schema disposition records
  encode/decode, typed-error, oRPC compatibility, test ergonomics, existing
  TypeBox coverage, runtime validation, duplication cost, migration blast
  radius, and shared internal-service/AI/CLI semantic projection ownership
  criteria; stop if Zod appears as an accidental third durable schema authority
  instead of a documented oRPC adapter boundary
