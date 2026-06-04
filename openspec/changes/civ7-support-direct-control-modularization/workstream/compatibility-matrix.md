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
| Semantic CLI player-agent view | Full envelope implementation owner, final schema/test owner, debug-separation reviewer/gate owner beyond the recorded CLI owner seed | Local CLI semantic envelope tests plus fixtures proving normal output contains player-agent state/actions and excludes raw service/debug payloads | Tasks 5.1-5.7, normal CLI runtime-status projection, AI-facing semantic summaries |
| Strategy/intelligence ingestion | AI-ingestion contract owner, schema owner, proof owner, source/freshness label owner | Machine-contract fixtures proving source labels, freshness/evidence labels, action/proof vocabulary, and no dependency on CLI strings/raw probes | AI corpus artifacts, strategy/playbook records, static profile recipes, model-training telemetry feeds |
| Debug/internal service output | Final debug/service hierarchy owner, schema/test owner, command/flag boundary owner | Tests proving raw transport/session/probe/closeout/correlation detail is available only through debug-owned service surfaces and not normal play output or AI ingestion | Debug service hierarchy, runtime diagnostics, internal procedure diagnostics |
| Operation/proof telemetry | Final schema owner, broader operation-atom adapter owners beyond the unit-target and production-choice adapter seeds, projection gate owner, runtime-proof boundary owner | Contract fixtures proving approval, validation, send, post-read, outcome delta, blocker delta, correlation id, evidence policy, stale/unknown classification, and explicit separation from `verified: true` | Telemetry persistence, AI action audit, procedure middleware, semantic CLI proof summaries |
| Effect/oRPC procedure cores | Procedure-core owner, schema owner, proof owner, TypeBox/Effect Schema disposition owner, adapter-boundary owner | Procedure-core contract tests over stable direct-control atoms, typed errors, approval gates, correlation/telemetry hooks, schema encode/decode checks, and explicit non-tunnel transport boundary | Tasks 6.1-6.9, oRPC package behavior, Effect resource/schedule/stream implementation, transport adapters |

Contract-artifact status:

- Hotseat handoff state: `workstream/hotseat-handoff-contract.md` recorded.
- Semantic CLI player-agent view:
  `workstream/semantic-cli-envelope-contract.md` recorded.
- Strategy/intelligence ingestion:
  `workstream/strategy-intelligence-ingestion-contract.md` recorded.
- Debug/internal service output:
  `workstream/debug-service-projection-contract.md` recorded.
- Operation/proof telemetry:
  `workstream/operation-proof-telemetry-contract.md` recorded.
- Effect/oRPC procedure cores: `workstream/procedure-core-contract.md`
  recorded.

These artifacts close only the `contractArtifact` planning sub-gap. They do not
accept any row, assign source/proof/schema owners, create tests, prove runtime
behavior, or unblock dependent implementation lanes.

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
- Stop if a future App UI companion bridge treats
  `globalThis.Civ7IntelligenceBridge.invoke(...)` as product action authority
  or an ad hoc JSON-envelope API instead of serialized ingress through the
  existing tuner/App UI boundary into the in-process oRPC/Effect router.

## Row Acceptance Intake

A future row owner must update the target row and include an intake packet in
the same planning layer before changing `acceptanceStatus` to `accepted`.

Required intake fields:

- `ownerAssignment`: named source owner, proof owner, schema/test owner, and
  reviewer/gate owner for the row.
- `writeSet`: exact package, CLI, docs, telemetry, schema, or runtime files the
  row may touch; no broad `common`, `utils`, `types`, or transport buckets.
- `contractArtifact`: schema, envelope, procedure contract, telemetry record,
  runtime gate checklist, or explicit "not applicable" reason.
- `proofPlan`: focused local tests, runtime gates, official-resource checks,
  peer-report evidence, and proof class labels for each claim.
- `projectionPlan`: normal CLI projection, debug/internal service projection,
  AI-ingestion contract, telemetry projection, and procedure-core projection
  explicitly separated or explicitly out of scope.
- `stopConditionCoverage`: row-local tests or review checks that exercise the
  row's stop conditions, including normal/debug/AI/telemetry/procedure
  separation.
- `downstreamUnblock`: exact 5.x, 6.x, telemetry, AI-ingestion,
  runtime-status, debug/service, or hotseat lane that the accepted row unblocks;
  no blanket "support both" unblock.
- `nonProofClaims`: claims intentionally not made, such as live runtime proof,
  AI-ingestion implementation, App UI bridge implementation, transport
  adapters, or product-path support.

Intake rejection conditions:

- Reject if the row owner cannot name concrete source and proof owners.
- Reject if the row's proof plan relies only on target-thread evidence, peer
  reports, or local fake-runtime tests for a live runtime claim.
- Reject if the row collapses normal CLI output, debug/internal service output,
  AI ingestion, telemetry, and procedure cores into one raw JSON shape.
- Reject if the row lets AI consumers train on CLI presentation strings,
  runtime reflection, raw SQL, raw command strings, or vague `verified: true`.
- Reject if the row promotes Autoplay/Automation from support/debug
  infrastructure to the primary external-agent executor.
- Reject if the row moves oRPC or transport adapters ahead of accepted typed
  procedure cores over stable direct-control atoms.

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

#### Acceptance Intake: Hotseat Handoff State

- `ownerAssignment`: current planning evidence is the hotseat/autoplay target
  thread and peer-report disposition recorded in `tasks.md` 2.8 and
  `workstream/workstream-record.md`, plus current local source owners that may
  contribute runtime-status and support evidence:
  `packages/civ7-direct-control/src/runtime/{app-ui-snapshot,tuner-health,playable-status}.ts`,
  `src/session/*`, `src/setup/*`, `src/play/autoplay.ts`, and
  `src/play/turn-completion.ts`. Current local proof owners are
  `runtime-and-catalog.test.ts`, `session.test.ts`,
  `setup-and-lifecycle.test.ts`, `restart-lifecycle.test.ts`, and
  `autoplay-and-turn.test.ts`. Missing before acceptance: a named hotseat
  runtime source owner, live proof owner, runtime gate runner, and
  human-restoration proof owner.
- `writeSet`: this intake authorizes only compatibility-matrix/task/record
  planning updates. A later hotseat runtime proof slice may touch a precisely
  named runtime-status/handoff owner, focused runtime gate tests or logs, and
  narrow setup/session/autoplay/turn-completion adapters after owner assignment.
  No play-thread wakeup, source mutation, CLI semantic rewrite, telemetry
  persistence, AI-ingestion contract, transport adapter, or procedure-core
  implementation is authorized by this intake.
- `contractArtifact`: existing artifacts are planning records, App UI snapshot
  shape, Tuner health/playable-status results, session health/reconnect shapes,
  setup lifecycle results, autoplay support results, and turn-completion
  results, and `workstream/hotseat-handoff-contract.md`, which names future
  handoff state slots for session health, current local player, slot ownership,
  turn/blocker state, curtain/interface state, action eligibility, approval
  state, post-action state, runtime proof gates, projection boundaries,
  acceptance gaps, and stop conditions. Missing before acceptance: a named
  runtime source/proof owner, gate runner, human-restoration proof owner, and
  live runtime evidence over that contract.
- `proofPlan`: existing proof is planning evidence and local fake-runtime tests
  for reusable atoms. Missing proof before acceptance: the runtime proof gates
  listed in `workstream/hotseat-handoff-contract.md`, including menu/setup
  hotseat snapshot, disposable hotseat activation, two-slot
  `GameContext.localPlayerID` rotation, agent-owned current-slot detection,
  mutation refusal for non-agent human turns, one approved agent-slot
  operation, turn completion, human UI restoration, fallback non-local
  operation probe disposition, and bounded Autoplay measurement proof as
  support/debug evidence only.
- `projectionPlan`: normal CLI may later summarize current player, slot
  ownership, handoff readiness, blocker state, action eligibility, and safe
  next steps through the semantic CLI row; debug/internal service output may
  expose raw handoff diagnostics only under the debug row; telemetry may record
  proof details only after the telemetry row is accepted; AI ingestion may
  consume only source-labeled records after the ingestion row is accepted;
  procedure cores remain blocked until hotseat proof and procedure schema
  ownership are accepted.
- `stopConditionCoverage`: missing before acceptance. Required coverage must
  fail if Autoplay/Automation becomes the primary external-agent executor, if
  direct-control mutation can target non-agent human turns, if local-player
  rotation proof is absent, if human waiting/restoration is not preserved, or
  if local fake-runtime tests are presented as live hotseat runtime proof.
- `downstreamUnblock`: none yet. Acceptance would unblock only explicitly named
  hotseat runtime-status, CLI hotseat semantic projection, mutation procedure
  gating, and action telemetry slices after live runtime gates and proof owners
  are recorded; it would not unblock AI ingestion, telemetry persistence,
  normal CLI semantic envelopes as a whole, debug hierarchy implementation,
  transport adapters, or procedure-core implementation by itself.
- `nonProofClaims`: this intake does not claim hotseat activation,
  local-player rotation, agent-slot action proof, human restoration,
  runtime/live-game proof, AI-on-hotseat product-path support, CLI semantic
  implementation, telemetry implementation, AI ingestion, debug hierarchy
  implementation, schema migration, Effect/Bun implementation, Effect/oRPC
  procedure-core work, or Task 2.9.4 row acceptance.

### Semantic CLI Player-Agent View

- `foundationThread`: `019e86b7-b08b-72f3-8341-6c78a1285c93`
- `modelThread`: `019e8b5a-f2ee-7ea2-96bc-8c07dc5ab6cc`
- `dependencyDirection`: hotseat/autoplay foundation -> AI-intelligence model
- `surface`: semantic CLI player-agent view
- `primaryConsumer`: normal local player-agent CLI user/API
- `sourceOwner`: `packages/cli/src/game-play/semantic-envelope.ts`
  owner seed and structural constructor; command-specific projections remain
  under their existing `game play` command owners, with `game play priorities`
  now carrying the first compact semantic-envelope integration
- `proofOwner`: `packages/cli/test/commands/game/play/semantic-envelope.test.ts`
  owner-seed proof plus existing focused play suites using the shared
  normal-output helper; `packages/cli/test/commands/game/play/priorities.test.ts`
  proves the first compact priorities envelope integration; final row
  proof/gate owner remains pending
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
- `acceptanceStatus`: `pending-cli-semantic-envelope`; source/proof owner seed
  and first compact priorities integration exist, but full command-surface
  envelope coverage, final schema owner, integration fixtures, and
  normal/debug/AI separation tests are not assigned
- `blockingDependents`: tasks 5.1-5.7, AI-facing semantic envelope consumers,
  normal CLI runtime-status projection
- `stopCondition`: stop if normal CLI dumps raw session, transport, closeout,
  command, proof JSON, route selection, correlation internals, or debug probes
  instead of player-agent state and actions

#### Acceptance Intake: Semantic CLI Player-Agent View

- `ownerAssignment`: current source owners are the 45 `game play` command
  modules under `packages/cli/src/commands/game/play/**/*.ts`, with command
  ownership inventoried in `workstream/cli-play-corpus.md`. Current proof
  owners are the 28 canonical play suites covered by root `test:cli:play`,
  including the focused notification, priorities, ready, tactical, progression,
  production, operation, and mutation-facing command suites listed in that
  corpus. The source/proof owner seed for shared envelope vocabulary and
  forbidden normal-output internals is now
  `packages/cli/src/game-play/semantic-envelope.ts` with proof in
  `packages/cli/test/commands/game/play/semantic-envelope.test.ts`; compact
  priorities integration is owned by `packages/cli/src/commands/game/play/priorities.ts`
  and proven in `packages/cli/test/commands/game/play/priorities.test.ts`.
  Missing before acceptance: full command-surface envelope ownership, final
  schema/test owner, and reviewer/gate owner for normal/debug/AI projection
  separation.
- `writeSet`: this intake authorizes only compatibility-matrix/task/record
  planning updates. A later implementation slice may touch the listed play
  command modules, focused play tests, and the seeded semantic-envelope owner
  only after assigning a concrete implementation/schema owner. The compact
  priorities integration is authorized as the first command-surface proof and
  does not authorize broad rollout by default. No broad `common`, `utils`,
  `types`, debug/service, telemetry, AI-ingestion, transport, or
  procedure-core bucket is authorized.
- `contractArtifact`: existing artifacts are command-specific play outputs,
  the CLI play corpus inventory, and
  `workstream/semantic-cli-envelope-contract.md`, which defines the planned
  normal CLI semantic slots for game state, blockers, decisions, action
  results, safe/unsafe next steps, postcondition classifications, evidence
  labels, and excluded raw service/debug fields. Compact `game play priorities
  --compact --json` now carries a `semanticEnvelope` fixture over that contract.
  Missing before acceptance: full command-surface envelope implementation,
  final schema/test owner, and integration fixtures over the remaining normal
  play surfaces.
- `proofPlan`: existing local proof is canonical `test:cli:play` plus the
  focused command owner tests recorded in `workstream/cli-play-corpus.md`.
  The semantic owner-seed proof now verifies the planned envelope slot
  vocabulary and raw debug/internal marker classes used by the shared
  normal-output helper. Compact priorities proof now verifies that normal play
  output carries a `semanticEnvelope` using the planned slots from
  `workstream/semantic-cli-envelope-contract.md`, limits `blockers` to actual
  blocking state/items instead of battlefield or clean-read recommendations,
  and still omits forbidden raw debug/internal marker classes. Missing proof
  before acceptance: command-integrated envelope tests across the remaining
  normal play surfaces, tests that raw session/transport/closeout/command/proof
  JSON and correlation/probe internals are omitted from normal play output, and
  tests or fixtures proving AI ingestion does not consume CLI presentation
  strings.
- `projectionPlan`: normal CLI projection should be semantic player-agent
  state and action guidance only; debug/internal service projection remains
  omitted from normal output or routed through debug-owned commands/flags; AI
  ingestion remains out-of-scope until a separate machine contract accepts
  source/freshness/evidence labels; telemetry and procedure-core projections
  remain pending separate rows.
- `stopConditionCoverage`: partial owner-seed coverage exists for classifying
  raw debug/internal marker leaks in normal output, and compact priorities now
  proves a command-integrated semantic envelope stays inside that marker
  boundary while keeping non-blocking recommendations out of `blockers`.
  Required coverage before acceptance must still fail if any normal CLI output
  includes raw session state, transport details, closeout traces, command
  strings, proof JSON, route selection, correlation internals, debug probes, or
  if AI consumers depend on CLI presentation text.
- `downstreamUnblock`: none yet. Acceptance would unblock only the named CLI
  semantic-surface tasks 5.1-5.7 after the envelope contract, owner assignment,
  and separation tests are recorded; it would not unblock AI ingestion,
  telemetry, hotseat runtime proof, debug hierarchy, schema migration,
  transport adapters, or procedure-core implementation.
- `nonProofClaims`: this intake does not claim runtime/live-game proof, CLI
  semantic implementation beyond compact priorities, final schema selection,
  AI ingestion implementation, telemetry contract acceptance, debug hierarchy
  implementation, schema migration, Effect/Bun implementation, Effect/oRPC
  procedure-core work, product-path support, or Task 2.9.4 row acceptance.

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

#### Acceptance Intake: Strategy/Intelligence Ingestion

- `ownerAssignment`: current planning evidence is the direct target-thread and
  peer-report disposition recorded in `tasks.md` 2.8, the compatibility ledger
  entries in `workstream/workstream-record.md`, and the direct-control atom
  owners for semantic state and proof inputs: map/GameInfo/summary reads under
  `packages/civ7-direct-control/src/play/map`, `src/play/summaries.ts`,
  runtime/status/debug atoms under `src/runtime`, operation/proof atoms under
  `src/play/operations`, notification atoms under `src/play/notifications`,
  and capability/proof helpers under `src/catalog` and `src/proof`. Missing
  before acceptance: a named AI-ingestion contract owner, schema/test owner,
  fixture owner, and reviewer/gate owner.
- `writeSet`: this intake authorizes only compatibility-matrix/task/record
  planning updates. A later implementation slice may touch a precisely named
  AI-ingestion contract owner, source-labeled fixtures, contract tests, and
  narrow adapters from existing read/proof owners after source and proof
  ownership are assigned. No broad corpus/model bucket, CLI presentation
  rewrite, debug-service raw dump, telemetry persistence, profile generator,
  transport adapter, or procedure-core implementation is authorized.
- `contractArtifact`: existing artifacts are planning records, direct-control
  read/proof result shapes, GameInfo/map/summary read owners, operation
  postcondition shapes, capability catalog schemas, proof/log helper outputs,
  and `workstream/strategy-intelligence-ingestion-contract.md`, which names
  future record families such as `StrategyPlan`, `ActionCandidate`,
  `ActionOutcome`, `LoadedRowProof`, `RunMetric`, `PromotionDecision`, and
  `ProfileRecipe`, with source/freshness/evidence labels and explicit
  separation between live external play records and static native-AI profile
  shaping. Missing before acceptance: a named source/proof owner, schema/test
  owner, fixture owner, and implementation tests over that ingestion contract.
- `proofPlan`: existing proof is planning evidence plus local package/CLI tests
  for direct-control atoms that may later feed ingestion. Missing proof before
  acceptance: AI-ingestion contract fixture tests against
  `workstream/strategy-intelligence-ingestion-contract.md`, encode/decode or
  validation tests, source/freshness label assertions, evidence-class
  snapshots, stale/unknown/outcome fixtures, and tests proving ingestion does
  not consume normal CLI presentation strings, raw command strings, raw SQL,
  runtime reflection, unlabeled saves/logs/debug DB rows, or vague
  `verified: true`.
- `projectionPlan`: normal CLI projection is omitted and must not feed
  ingestion; debug/internal service output may enrich records only through
  explicit source/freshness/evidence labels; operation/proof telemetry must be
  consumed only after its contract row is accepted; procedure-core contracts
  remain pending until schema/procedure ownership is accepted.
- `stopConditionCoverage`: missing before acceptance. Required coverage must
  fail if AI consumers train on CLI strings, raw JavaScript commands, raw SQL,
  runtime reflection, companion/App UI mutation surfaces, unlabeled artifacts,
  or `verified: true` without explicit approval, validation, send, post-read,
  outcome, and stale/unknown evidence.
- `downstreamUnblock`: none yet. Acceptance would unblock only explicitly named
  AI-ingestion contract, corpus-record fixture, strategy-data, and static
  profile-planning slices after schema/proof owners and separation tests are
  recorded; it would not unblock telemetry persistence, semantic CLI output,
  hotseat runtime proof, debug hierarchy implementation, transport adapters,
  or procedure-core implementation by itself.
- `nonProofClaims`: this intake does not claim AI-ingestion implementation,
  corpus/model artifact generation, static profile generation, telemetry
  contract acceptance, runtime/live-game proof, semantic CLI implementation,
  debug hierarchy implementation, schema migration, Effect/Bun implementation,
  Effect/oRPC procedure-core work, product-path support, or Task 2.9.4 row
  acceptance.

### Debug/Internal Service Output

- `foundationThread`: `019e86b7-b08b-72f3-8341-6c78a1285c93`
- `modelThread`: `019e8b5a-f2ee-7ea2-96bc-8c07dc5ab6cc`
- `dependencyDirection`: exterior/debug-only support surface that must remain
  separate from the AI-on-hotseat product path while serving proof and
  diagnostics for it
- `surface`: debug/internal service output
- `primaryConsumer`: direct-control service/debug hierarchy
- `sourceOwner`: `packages/cli/src/game-debug/debug-service-projection.ts`
  owner seed for debug/internal field classes and payload path expectations;
  command-specific debug outputs remain under their existing CLI command and
  direct-control atom owners
- `proofOwner`: `packages/cli/test/commands/game/debug-service-projection.test.ts`
  owner-seed proof plus `packages/cli/test/commands/game.control.test.ts`
  command-integrated debug payload proof; final row proof/gate owner remains
  pending
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
- `acceptanceStatus`: `pending-debug-service-boundary`; source/proof owner seed
  and command-integrated debug payload proof exist, but final debug hierarchy
  owner, schema/test owner, command/flag boundary coverage, and separation
  tests are not assigned
- `blockingDependents`: debug service hierarchy, runtime-status projection,
  internal diagnostics in procedure cores
- `stopCondition`: stop if debug/internal output becomes normal CLI output,
  AI-ingestion input, or a product action authority

#### Acceptance Intake: Debug/Internal Service Output

- `ownerAssignment`: source owners are the existing debug/direct-control CLI
  commands under `packages/cli/src/commands/game/{exec,health,inspect,status,catalog,visibility}.ts`
  plus their package atom owners in `packages/civ7-direct-control/src/session`,
  `src/runtime`, `src/catalog`, and `src/play/map/visibility.ts`. Proof owners
  are `packages/cli/test/commands/game.control.test.ts`,
  `packages/civ7-direct-control/test/runtime-and-catalog.test.ts`,
  `packages/civ7-direct-control/test/session.test.ts`, and future
  normal/debug separation tests. The shared debug projection source/proof owner
  seed is now `packages/cli/src/game-debug/debug-service-projection.ts` with
  focused proof in
  `packages/cli/test/commands/game/debug-service-projection.test.ts` and
  command-integrated proof in `packages/cli/test/commands/game.control.test.ts`.
  Missing before acceptance: a final debug/service hierarchy owner,
  schema/test owner, and reviewer/gate owner.
- `writeSet`: this intake authorizes only compatibility-matrix/task/record
  planning updates. A later implementation slice may touch the listed CLI
  debug commands, package atom owners, and focused tests only after assigning a
  concrete debug/service owner. No broad `common`, `utils`, `types`,
  transport, telemetry, or AI-ingestion bucket is authorized.
- `contractArtifact`: existing contract artifacts are package result shapes for
  runtime inspection, bounded root inspection, App UI snapshot, Tuner health,
  playable status, capability catalog, direct-control health, reveal-map
  debug/disposable visibility, and
  `workstream/debug-service-projection-contract.md`, which names debug-only raw
  field classes, allowed normal summary classes, AI-ingestion boundaries,
  procedure-core boundaries, acceptance gaps, and stop conditions. The current
  source artifact adds the internal field-class vocabulary, owner metadata, and
  payload path expectation helper. Missing before acceptance: a final
  schema/test owner and broader implementation tests over command/flag,
  normal/debug/AI, telemetry, and procedure diagnostic separation.
- `proofPlan`: existing local proof includes
  `game.control.test.ts` coverage for health diagnostics, runtime inspection,
  App UI snapshot, playable status, map/GameInfo reads, AI loaded-lever reads,
  and operation validation through the package boundary; package proof includes
  `runtime-and-catalog.test.ts` and `session.test.ts`. Focused compact
  `game play priorities`, compact `game play ready-city`, compact
  `game play unit-move-preview`, and full/read-only
  `game play ready-unit --json` proof plus passive `game watch --jsonl` proof
  and progression-read `game play traditions` / `game play progress-dashboard`
  proof plus tactical-read, settlement-recommendation, and promotion-readiness
  proof plus rehydrate continuity, notification-HUD, and notification-queue
  proof plus technology-, culture-, celebration-, and government-option proof
  now assert through the shared
  `packages/cli/test/commands/game/play/normal-output-boundary.ts` helper that
  sixteen normal player-agent projection families omit raw
  transport/session/probe/correlation command internals. Focused `game health
  --json`, `game inspect --json`, `game inspect --app-ui-snapshot --json`,
  `game status --json`, `game catalog --static --json`,
  `game exec --dry-run --json`, `game visibility --json`, and
  `game restart --dry-run --json` proof now assert that debug-owned commands
  emit raw readiness, composed playable-status, App UI snapshot, runtime
  inspection, capability catalog provenance fields, explicit exec/restart
  dry-run request routing fields, and visibility counts/grid probes including
  host/port/state, request id, agent, raw command text, state discovery,
  selected state, network/UI/player/map probes, Tuner health globals, catalog
  owner/provenance/confidence, visibility revealed/visible counts, grid states,
  own/prototype/enumerable keys, and method owner/length/signature diagnostics.
  Owner-seed proof now verifies the debug/internal field-class vocabulary and
  asserts current `game.control.test.ts` payloads expose transport/session
  state, route selection, runtime/App UI/map probes, correlation diagnostics,
  and catalog provenance through the seeded debug projection helper.
  Missing proof before acceptance: broader tests proving the raw field classes in
  `workstream/debug-service-projection-contract.md` are reachable only through
  debug-owned commands, flags, or future debug procedures and are not emitted
  by normal play output or accepted AI-ingestion contracts.
- `projectionPlan`: normal CLI projection remains omitted/debug-only for raw
  runtime/service fields; debug/internal service projection may include raw
  transport/session state, probe output, route selection, closeout traces,
  correlation, catalog provenance, and diagnostics; AI ingestion remains
  out-of-scope until a separate ingestion contract accepts source/freshness and
  evidence labels; telemetry and procedure-core projections remain pending
  separate rows.
- `stopConditionCoverage`: partial owner-seed coverage exists for debug-owned
  command payload field classes. Required coverage before acceptance must still
  fail if debug/internal output becomes normal CLI player-agent output, AI
  ingestion input, product action authority, or a substitute for live runtime
  proof.
- `downstreamUnblock`: none yet. Acceptance of this row would unblock only
  debug/service hierarchy and internal procedure diagnostics explicitly named
  in a later update; it would not unblock normal CLI semantic envelopes,
  telemetry, AI ingestion, hotseat runtime proof, or transport adapters.
- `nonProofClaims`: this intake does not claim runtime/live-game proof, AI
  ingestion implementation, telemetry contract acceptance, CLI semantic
  envelope implementation, Effect/oRPC procedure-core readiness, App UI bridge
  implementation, or product-path support. `acceptanceStatus` remains
  `pending-debug-service-boundary`.

### Operation/Proof Telemetry

- `foundationThread`: `019e86b7-b08b-72f3-8341-6c78a1285c93`
- `modelThread`: `019e8b5a-f2ee-7ea2-96bc-8c07dc5ab6cc`
- `dependencyDirection`: hotseat/autoplay foundation -> AI-intelligence model
- `surface`: operation/proof telemetry
- `primaryConsumer`: support proof, AI-intelligence ingestion, and future
  procedure middleware
- `sourceOwner`: `packages/civ7-direct-control/src/proof/operation-telemetry.ts`
  owner seed for record slot vocabulary, structural constructor, and normal
  summary boundary; `packages/civ7-direct-control/src/proof/unit-target-telemetry.ts`
  `packages/civ7-direct-control/src/proof/production-choice-telemetry.ts`,
  `packages/civ7-direct-control/src/proof/diplomacy-response-telemetry.ts`, and
  `packages/civ7-direct-control/src/proof/narrative-choice-telemetry.ts` seed
  the first four operation-result adapters while broader
  operation-specific adapters remain under their existing operation/proof atom
  owners
- `proofOwner`: `packages/civ7-direct-control/test/operation-telemetry.test.ts`
  owner-seed proof plus
  `packages/civ7-direct-control/test/unit-target-telemetry.test.ts`,
  `packages/civ7-direct-control/test/production-choice-telemetry.test.ts`,
  `packages/civ7-direct-control/test/diplomacy-response-telemetry.test.ts`, and
  `packages/civ7-direct-control/test/narrative-choice-telemetry.test.ts`
  for the current adapter seeds; final row proof/gate owner remains pending
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
- `acceptanceStatus`: `pending-telemetry-contract`; source/proof owner seed plus
  unit-target, production-choice, diplomacy-response, and narrative-choice
  operation-result adapter seeds exist, but telemetry schema owner, broader
  operation-atom adapters, normal/debug/AI/procedure projection separation
  tests, and final runtime proof boundary gates are not assigned
- `blockingDependents`: telemetry persistence, AI ingestion, procedure
  middleware, action audit vocabulary, semantic CLI proof summaries
- `stopCondition`: stop if telemetry trains or acts on vague `verified: true`,
  collapses approval/validation/send/postcondition/outcome evidence, or claims
  live proof from local tests, target-thread evidence, peer reports, or docs

#### Acceptance Intake: Operation/Proof Telemetry

- `ownerAssignment`: current source evidence is distributed across
  `packages/civ7-direct-control/src/action-approval.ts`,
  `src/play/operations/{validate-request,router,unit-postconditions,population-postconditions,production-postconditions,production-choice,unit-target-action,diplomacy-request,diplomacy-postconditions,narrative-request,narrative-postconditions}.ts`,
  `src/play/notifications/{dismissal-request,verification}.ts`,
  `src/play/turn-completion.ts`, `src/setup/*`, and their public facade
  call-throughs. Current proof owners are focused package suites such as
  `unit-operation.test.ts`, `population-placement.test.ts`,
  `production-choice.test.ts`, `unit-target-action.test.ts`,
  `diplomacy-response.test.ts`, `narrative-choice.test.ts`,
  `notification-dismissal.test.ts`, `autoplay-and-turn.test.ts`, and
  setup/lifecycle tests, plus focused CLI command suites where they consume
  postcondition results. The shared telemetry source/proof owner seed is now
  `packages/civ7-direct-control/src/proof/operation-telemetry.ts` with focused
  proof in `packages/civ7-direct-control/test/operation-telemetry.test.ts`,
  including no-repeat-guarded summaries for sent-unverified, stale/unknown, and
  pending-runtime-proof records plus a proof-label guard rejecting
  `live-runtime-proof` and `in-game-observation` evidence labels under non-live
  boundaries. Operation-result adapter owner seeds now include
  `packages/civ7-direct-control/src/proof/unit-target-telemetry.ts`
  with focused proof in
  `packages/civ7-direct-control/test/unit-target-telemetry.test.ts`, adapting
  one unit-target action result shape into separated telemetry slots, and
  `packages/civ7-direct-control/src/proof/production-choice-telemetry.ts` with
  focused proof in
  `packages/civ7-direct-control/test/production-choice-telemetry.test.ts`,
  adapting one production-choice result shape into separated telemetry slots,
  and `packages/civ7-direct-control/src/proof/diplomacy-response-telemetry.ts`
  with focused proof in
  `packages/civ7-direct-control/test/diplomacy-response-telemetry.test.ts`,
  adapting one diplomacy-response result shape into separated telemetry slots,
  and `packages/civ7-direct-control/src/proof/narrative-choice-telemetry.ts`
  with focused proof in
  `packages/civ7-direct-control/test/narrative-choice-telemetry.test.ts`,
  adapting one narrative-choice result shape into separated telemetry slots.
  Missing before acceptance: a final schema/test owner, broader operation-atom
  adapter owners, and reviewer/gate owner.
- `writeSet`: this intake authorizes only compatibility-matrix/task/record
  planning updates. A later implementation slice may touch a precisely named
  telemetry contract owner, focused package/CLI tests, and narrow adapters from
  existing operation/proof owners after source and proof ownership are
  assigned. No broad `common`, `utils`, debug/service, CLI presentation,
  AI-ingestion, persistence, transport, or procedure-core bucket is authorized.
- `contractArtifact`: existing artifacts are package result/postcondition
  shapes, approval primitives, validation/send wrappers, closeout
  classifications, notification verification summaries, proof/log helper
  outputs, and `workstream/operation-proof-telemetry-contract.md`, which names
  future record slots for strategy intent, candidate action, operation family,
  target, args, approval, validation result, send receipt, post-read,
  postcondition classification, outcome delta, blocker delta, evidence policy,
  correlation id, source/freshness label, stale/unknown classification, proof
  classes, projection boundaries, acceptance gaps, and stop conditions. The
  current source artifact adds the internal record slot vocabulary,
  constructor, postcondition sanitizer, normal summary/projection boundary, and first
  unit-target, production-choice, diplomacy-response, narrative-choice, and
  notification-dismissal operation-result adapters. Missing before acceptance:
  a schema/test owner, broader operation-atom adapters, and
  final consumer-owned projection implementation tests over that record
  contract.
- `proofPlan`: existing local proof covers approval-first behavior,
  validator-first no-send paths, focused send/read split, postcondition
  classification, no-repeat-after-unverified guidance, notification identity
  verification, and setup/turn lifecycle readback in package and focused CLI
  tests. Owner-seed proof now covers telemetry record construction against
  `workstream/operation-proof-telemetry-contract.md`, keeps approval,
  validation, send, post-read, outcome, and blocker evidence as separate slots,
  strips legacy `verified` booleans from the postcondition contract, and keeps
  raw telemetry slots out of the normal summary boundary. Unit-target adapter
  proof now verifies that a real operation result shape maps approval,
  `validation_pre`, `send_receipt`, `post_read`, `validation_post`,
  postcondition, and `outcome_delta` into separate telemetry slots while
  refusing to treat a legacy top-level `verified` boolean as confirmed
  postcondition proof; missing postcondition, no-state-change, and
  pending-runtime-proof summaries remain no-repeat guarded. Production-choice
  adapter proof verifies that a production result shape maps approval,
  `validation_pre`, `send_receipt`, `post_read`, `validation_post`,
  postcondition, `outcome_delta`, and `blocker_delta` into separate telemetry
  slots while using `productionPostcondition` as the classification owner;
  missing postcondition, validator-blocked no-send, no-state-change,
  blocker-still-live, `validation-changed`, and pending-runtime-proof paths
  remain no-repeat guarded. Diplomacy-response
  adapter proof verifies that a diplomacy result shape maps approval,
  `validation_pre`, `send_receipt`, `post_read`, `validation_post`,
  postcondition, `outcome_delta`, and `blocker_delta` into separate telemetry
  slots while using the source-owned diplomacy response postcondition as the
  classification owner; missing postcondition, validator-blocked no-send,
  `no-state-change`, `validation-changed`, and pending-runtime-proof paths
  remain no-repeat guarded. Narrative-choice adapter proof verifies that a
  narrative result shape maps approval, `validation_pre`, `send_receipt`,
  `post_read`, `validation_post`, postcondition, `outcome_delta`, and
  `blocker_delta` into separate telemetry slots while using the source-owned
  narrative choice postcondition as the classification owner; missing
  postcondition, validator-blocked no-send, `no-state-change`,
  `validation-changed`, and pending-runtime-proof paths remain no-repeat
  guarded. Notification-dismissal adapter proof verifies that an App UI action
  result shape maps approval, `validation_pre`, `send_receipt`, `post_read`,
  `validation_post`, postcondition, `outcome_delta`, and `blocker_delta` into
  separate telemetry slots while using the source-owned notification dismissal
  postcondition as the classification owner; missing postcondition,
  validator-blocked no-send, `not-sent`, `missing-after`,
  `engine-front-still-live`, `no-state-change`, and pending-runtime-proof paths
  remain no-repeat guarded. Proof-label guard coverage now rejects local,
  planning, pending, and other non-live telemetry records that try to carry
  `live-runtime-proof` or `in-game-observation` labels, while allowing those
  labels only under an explicit `live-runtime-proof` boundary. Projection
  separation proof now routes normal CLI/player-agent consumers to the semantic
  summary only, permits raw records only for debug/internal or raw telemetry
  consumers, and keeps AI-ingestion/procedure consumers blocked until their
  accepted contract or middleware owner exists. Missing proof before
  acceptance: broader adapter fixtures for stale/unknown/outcome evidence,
  final normal/debug/AI/procedure consumer implementation tests, and
  runtime-proof labeling tests that prevent local tests or docs from becoming
  live proof.
- `projectionPlan`: normal CLI may receive only summarized state-machine
  status and explicit stale/unknown/postcondition classifications through the
  semantic CLI row; debug/internal service output may expose raw proof detail
  under the debug row; AI ingestion must consume only source-labeled machine
  contracts from the AI-ingestion row; procedure cores may attach middleware
  hooks only after typed schema/procedure ownership is accepted.
- `stopConditionCoverage`: partial owner-seed coverage now proves the structural
  telemetry constructor does not carry a legacy `verified` boolean as the
  postcondition contract and keeps raw telemetry slots out of the normal
  summary/projection boundary. It also rejects live-runtime and in-game proof
  labels under non-live proof boundaries, and blocks local AI/procedure
  projection until those owners accept contracts. Required coverage before
  acceptance must still fail if telemetry collapses approval, validation, send,
  postcondition, post-read, and outcome evidence into `verified: true`; if AI
  ingestion or procedure cores consume raw CLI/debug strings; or if future
  producers or projections relabel local tests, target threads, peer reports,
  logs, or docs as live runtime proof.
- `downstreamUnblock`: none yet. Acceptance would unblock only explicitly named
  telemetry contract, action-audit vocabulary, and later procedure middleware
  slices after schema/proof owners and separation tests are recorded; it would
  not unblock telemetry persistence, AI ingestion, normal CLI semantic output,
  hotseat runtime proof, debug hierarchy implementation, transport adapters,
  or procedure-core implementation by itself.
- `nonProofClaims`: this intake does not claim runtime/live-game proof,
  telemetry schema implementation, telemetry persistence, AI ingestion,
  semantic CLI implementation, debug hierarchy implementation, schema
  migration, Effect/Bun implementation, Effect/oRPC procedure-core work,
  product-path support, or Task 2.9.4 row acceptance.

### Effect/oRPC Procedure Cores

- `foundationThread`: `019e86b7-b08b-72f3-8341-6c78a1285c93`
- `modelThread`: `019e8b5a-f2ee-7ea2-96bc-8c07dc5ab6cc`
- `dependencyDirection`: hotseat/autoplay foundation -> AI-intelligence model
- `surface`: Effect/oRPC procedure cores
- `primaryConsumer`: shared oRPC/Effect procedure substrate over stable atoms,
  including the in-game controller router, external direct-control bridge, and
  future AI services
- `sourceOwner`: `packages/civ7-direct-control/src/procedure-core.ts` owner
  seed for direct-control procedure descriptors, TypeBox descriptor schema,
  projection policy slots, proof boundary slots, player scope, consumer class,
  mutation gate metadata, and no-raw-command-tunnel guards over generic raw
  fields plus repo-local command serialization and session execute owners, and
  a local guard refusing `live-runtime-proof` claims before a runtime-proof
  owner exists; descriptor context-policy metadata, payload validation, and a
  local injected-handler call primitive now exist for current schema/descriptor
  seeds; concrete ready-unit, ready-city, unit move-preview, playable-status,
  App UI snapshot, Tuner health, notification-view,
  settlement-recommendations, target-candidates, and battlefield-scan
  procedure call wrappers exist adjacent to their direct-control atoms; final
  procedure-core/schema/runtime-context, middleware, error, and correlation
  owners remain pending
- `proofOwner`: `packages/civ7-direct-control/test/procedure-core.test.ts`
  owner-seed proof for descriptor construction, generic raw tunnel rejection,
  `runtime/command-serialization` / `jsLiteral` rejection,
  `session/execute` / `executeCiv7Command` rejection, mutation gate
  requirements, local `live-runtime-proof` rejection, payload validation,
  injected-handler call sequencing, correlation-id policy, handler failure
  normalization, and telemetry-as-Effect/oRPC-middleware projection; final row
  proof/gate owner remains pending.
  `packages/civ7-direct-control/test/ready-unit-procedure.test.ts`,
  `packages/civ7-direct-control/test/ready-city-procedure.test.ts`, and
  `packages/civ7-direct-control/test/unit-move-preview-procedure.test.ts` now
  also prove adjacent concrete read procedure call wrappers with fake atom
  dependencies. `packages/civ7-direct-control/test/playable-status-procedure.test.ts`
  now also proves the adjacent concrete runtime-support procedure call wrapper
  with fake App UI/Tuner dependencies.
  `packages/civ7-direct-control/test/app-ui-snapshot-procedure.test.ts` now
  also proves the adjacent concrete App UI snapshot procedure call wrapper with
  a fake App UI command dependency.
  `packages/civ7-direct-control/test/tuner-health-procedure.test.ts` now also
  proves the adjacent concrete Tuner health procedure call wrapper with fake
  session/reconnect dependencies.
  `packages/civ7-direct-control/test/play-notification-view-procedure.test.ts`
  now also proves the adjacent concrete notification-view procedure call
  wrapper with fake atom dependencies.
  `packages/civ7-direct-control/test/settlement-recommendations-procedure.test.ts`
  now also proves the adjacent concrete settlement-recommendations procedure
  call wrapper with fake atom dependencies.
  `packages/civ7-direct-control/test/target-candidates-procedure.test.ts` now
  also proves the adjacent concrete target-candidates procedure call wrapper
  with fake atom dependencies.
  `packages/civ7-direct-control/test/battlefield-scan-procedure.test.ts` now
  also proves the adjacent concrete battlefield-scan procedure call wrapper
  with fake atom dependencies.
- `playerScope`: per-procedure; local-player and agent-slot scoped for
  mutation; debug/observer scoped for diagnostics
- `consumerClass`: Effect/oRPC procedure core; in-game controller service
  boundary; external direct-control service boundary; future AI-intelligence
  and player-agent clients through typed contracts
- `evidenceClass`: repo docs; target-thread evidence; peer reports; local
  package tests for the descriptor owner seed; runtime proof pending for live
  claims
- `procedureCandidate`: descriptor owner seed exists; concrete procedure
  inputs/outputs still need schema/type ownership before typed oRPC cores
- `normalCliProjection`: omitted field; CLI shell remains oclif and semantic
  CLI output is a separate surface
- `debugServiceProjection`: correlation/audit detail, typed errors, approval
  gates, telemetry hooks, resource/schedule/stream diagnostics where appropriate
- `proofLabel`: `pending-procedure-core-schema`
- `acceptanceStatus`: `pending-procedure-core-schema`; descriptor source/proof
  owner seed exists, but final schema owner, proof owner, concrete procedure
  contracts, middleware boundary, final runtime context/error/correlation
  owners, and integration tests are not assigned
- `blockingDependents`: tasks 6.1-6.9, in-game controller router modules,
  transport adapters, procedure middleware, Effect/Bun resource/concurrency
  implementation, oRPC package behavior
- `stopCondition`: stop if transport adapters or `packages/civ7-control-orpc`
  behavior appears before testable procedure cores over stable direct-control
  atoms, if raw command tunneling is used as the architecture, if the in-game
  controller is implemented as a hand-maintained App UI method table or ad hoc
  JSON-envelope product API, or if
  `globalThis.Civ7IntelligenceBridge.invoke(...)` is treated as anything other
  than serialized ingress through the existing tuner/App UI boundary into the
  in-process oRPC/Effect router; stop if procedure-core schema work starts
  before a TypeBox versus Effect Schema disposition records encode/decode, typed-error, oRPC
  compatibility, test ergonomics, existing TypeBox coverage, runtime
  validation, duplication cost, migration blast radius, and shared
  internal-service/AI/CLI semantic projection ownership criteria; stop if Zod
  appears as an accidental third durable schema authority instead of a
  documented oRPC adapter boundary

#### Acceptance Intake: Effect/oRPC Procedure Cores

- `ownerAssignment`: partial planning evidence exists from the oRPC authority
  citation, controller-bridge substrate repair, TypeBox versus Effect Schema
  report disposition, and current direct-control atom owners. The current
  descriptor source/proof owner seed is
  `packages/civ7-direct-control/src/procedure-core.ts` with proof in
  `packages/civ7-direct-control/test/procedure-core.test.ts`. The first
  concrete read-atom schema owner seed is
  `packages/civ7-direct-control/src/play/ready/unit.ts` with focused proof in
  `packages/civ7-direct-control/test/ready-unit-view.test.ts` and public
  facade proof in `packages/civ7-direct-control/test/public-api.test.ts`.
  The second concrete read-atom schema owner seed is
  `packages/civ7-direct-control/src/play/ready/city.ts` with focused proof in
  `packages/civ7-direct-control/test/ready-city-view.test.ts` and public
  facade proof in `packages/civ7-direct-control/test/public-api.test.ts`.
  The third concrete read-atom schema owner seed is
  `packages/civ7-direct-control/src/play/ready/move-preview.ts`, with the
  shared map-location schema owner in
  `packages/civ7-direct-control/src/play/map/types.ts`, focused proof in
  `packages/civ7-direct-control/test/unit-move-preview.test.ts`, and public
  facade proof in `packages/civ7-direct-control/test/public-api.test.ts`.
  The first concrete runtime-support schema owner seed is
  `packages/civ7-direct-control/src/runtime/playable-status.ts`, with
  supporting App UI snapshot and Tuner health schema owners in
  `packages/civ7-direct-control/src/runtime/{app-ui-snapshot,tuner-health}.ts`,
  focused proof in
  `packages/civ7-direct-control/test/runtime-and-catalog.test.ts`, and public
  facade proof in `packages/civ7-direct-control/test/public-api.test.ts`.
  The descriptor owner now binds procedure descriptors to schema references
  with `inputSchema` and `outputSchema` owner/export slots, and current proof
  binds `unit.ready.view` to the ready-unit schema exports and resolves those
  references against explicit schema artifacts. The first concrete adjacent
  descriptor artifact is now
  `packages/civ7-direct-control/src/play/ready/unit-procedure.ts`, with proof
  in `packages/civ7-direct-control/test/ready-unit-procedure.test.ts`. The
  second concrete adjacent descriptor artifact is now
  `packages/civ7-direct-control/src/play/ready/city-procedure.ts`, with proof
  in `packages/civ7-direct-control/test/ready-city-procedure.test.ts`. The
  third concrete adjacent descriptor artifact is now
  `packages/civ7-direct-control/src/play/ready/move-preview-procedure.ts`,
  with proof in
  `packages/civ7-direct-control/test/unit-move-preview-procedure.test.ts`. The
  first adjacent runtime-support descriptor artifact is now
  `packages/civ7-direct-control/src/runtime/playable-status-procedure.ts`,
  with proof in
  `packages/civ7-direct-control/test/playable-status-procedure.test.ts`. The
  second adjacent runtime-support descriptor artifact is now
  `packages/civ7-direct-control/src/runtime/app-ui-snapshot-procedure.ts`,
  with proof in
  `packages/civ7-direct-control/test/app-ui-snapshot-procedure.test.ts`. The
  third adjacent runtime-support descriptor artifact is now
  `packages/civ7-direct-control/src/runtime/tuner-health-procedure.ts`, with
  proof in `packages/civ7-direct-control/test/tuner-health-procedure.test.ts`.
  The adjacent notification read descriptor artifact is now
  `packages/civ7-direct-control/src/play/notifications/view-procedure.ts`,
  with TypeBox schema ownership in
  `packages/civ7-direct-control/src/play/notifications/view.ts` and proof in
  `packages/civ7-direct-control/test/play-notification-view-procedure.test.ts`
  plus adjacent atom schema proof in
  `packages/civ7-direct-control/test/play-notification-view.test.ts`.
  The adjacent settlement-recommendations descriptor artifact is now
  `packages/civ7-direct-control/src/play/tactical/settlement-procedure.ts`,
  with TypeBox schema ownership in
  `packages/civ7-direct-control/src/play/tactical/settlement.ts` and proof in
  `packages/civ7-direct-control/test/settlement-recommendations-procedure.test.ts`
  plus adjacent atom schema proof in
  `packages/civ7-direct-control/test/settlement-recommendations.test.ts`.
  The adjacent target-candidates descriptor artifact is now
  `packages/civ7-direct-control/src/play/tactical/target-candidates-procedure.ts`,
  with TypeBox schema ownership in
  `packages/civ7-direct-control/src/play/tactical/target-candidates.ts` and
  proof in
  `packages/civ7-direct-control/test/target-candidates-procedure.test.ts`
  plus adjacent atom schema proof in
  `packages/civ7-direct-control/test/tactical-reads.test.ts`.
  The adjacent battlefield-scan descriptor artifact is now
  `packages/civ7-direct-control/src/play/tactical/battlefield-procedure.ts`,
  with TypeBox schema ownership in
  `packages/civ7-direct-control/src/play/tactical/battlefield.ts` and proof in
  `packages/civ7-direct-control/test/battlefield-scan-procedure.test.ts` plus
  adjacent atom schema proof in
  `packages/civ7-direct-control/test/tactical-reads.test.ts`.
  The descriptor owner also records `schemaTechnology`, requires current
  adjacent descriptors to declare `typebox`, and rejects unaccepted
  `effect-schema` or `zod-adapter` claims before procedure promotion. The
  descriptor resolver now validates descriptor field lists against resolved
  schema root properties. The procedure-core owner now also validates local
  procedure input/output payloads against explicitly resolved TypeBox schema
  artifacts, with proof in
  `packages/civ7-direct-control/test/procedure-core.test.ts` and public facade
  export proof in `packages/civ7-direct-control/test/public-api.test.ts`.
  The procedure-core owner now also has a no-network call primitive over an
  injected handler, with focused proof for input-before-handler validation,
  output-after-handler validation, separated output/diagnostics, generated and
  caller-provided correlation IDs, and handler failure normalization. The
  concrete ready-unit, ready-city, unit move-preview, playable-status, App UI
  snapshot, Tuner health, notification-view, settlement-recommendations,
  target-candidates, and battlefield-scan procedure call wrappers now
  compose that primitive with
  `getCiv7ReadyUnitView`, `getCiv7ReadyCityView`,
  `getCiv7UnitMovePreview`, `getCiv7PlayableStatus`,
  `getCiv7AppUiSnapshot`, `checkCiv7TunerHealth`,
  `getCiv7PlayNotificationView`, and
  `getCiv7SettlementRecommendations`, `getCiv7TargetCandidates`, and
  `getCiv7BattlefieldScan` through fake direct-control dependencies in focused
  proof.
  Missing before acceptance: final procedure-core schema owner, proof owner,
  accepted TypeBox versus Effect Schema disposition for final procedure
  contracts, runtime-context/middleware/error/correlation owner, broader
  concrete procedure owners, and explicit owner boundaries for the in-game
  controller router, external direct-control bridge, and future AI services.
- `writeSet`: current write set is the direct-control battlefield scan atom
  schema owner, adjacent `strategy.battlefield.scan` descriptor/call metadata
  declaring current TypeBox schema technology, focused descriptor/atom/public
  facade proof, and docs/OpenSpec records.
  Future implementation write sets must name the exact procedure-core module or
  package, typed schema artifact, middleware/context/error/correlation tests,
  and narrow adapters to stable direct-control atom owners. No transport adapter,
  `packages/civ7-control-orpc` behavior, in-game controller router source,
  CLI shell rewrite, AI ingestion, telemetry persistence, raw JS command
  tunnel, broad `common`/`utils`/`types` bucket, or hand-maintained App UI
  method table is accepted by this intake.
- `contractArtifact`: current artifacts are planning records, current TypeBox
  public contracts, direct-control atom types/results, the compatibility
  matrix, the schema-evaluation disposition, and
  `workstream/procedure-core-contract.md`, which names future procedure atom
  slots for procedure keys, schemas, context, middleware, typed errors,
  correlation, projection policy, proof boundaries, router families, schema
  ownership, middleware boundaries, acceptance gaps, and stop conditions.
  Missing before acceptance: named source/schema/proof owners,
  context/middleware/error/correlation owners, explicit controller/external/AI
  service boundaries, and implementation tests over concrete procedure
  contracts. The current source artifact adds a TypeBox-backed descriptor
  schema and guard owner for procedure keys, stable atom owners, projection
  policy, proof boundary, player scope, consumer class, and mutation gate
  metadata, including command-source/session-execute owner rejection and local
  `live-runtime-proof` claim rejection. The descriptor artifact now also
  records `inputSchema` and `outputSchema` references with direct-control owner
  guards, simple export-name guards, and raw command-source/session-execute
  rejection for schema references, plus local schema-reference resolution
  against explicit caller-provided schema artifacts. The descriptor artifact now
  also records context requirements for the direct-control facade, endpoint
  defaults, state selection, logger, evidence sink, and live-session policy on
  current descriptor seeds, and rejects host/port/state fields from procedure
  input when those concerns are context-owned. The current source
  artifact also adds TypeBox input/output schemas for the existing
  `getCiv7ReadyUnitView` read atom, including bounded
  `radius`/`maxOperations` input and root-level output shape separation from
  raw command fields. The adjacent ready-unit descriptor artifact records that
  read atom's procedure metadata and schema artifact map without registering a
  router. The current source artifact now also adds TypeBox input/output
  schemas for the existing `getCiv7ReadyCityView` read atom, including bounded
  `cityId`/`maxOperations` input and root-level output shape separation from
  raw command fields. The adjacent ready-city descriptor artifact records that
  read atom's procedure metadata and schema artifact map without registering a
  router. The current source artifact now also adds TypeBox input/output
  schemas for the existing `getCiv7UnitMovePreview` read atom, including
  bounded `unitId`/`destination`/`maxPlots`/`maxPathPlots` input,
  validator-equivalent `Civ7MapLocationSchema` bounds, neutral
  `relationshipPolicy`, and root-level output shape separation from raw command
  fields. The adjacent unit move-preview descriptor artifact records that read
  atom's procedure metadata and schema artifact map without registering a
  router. The current source artifact now also adds TypeBox input/output
  schemas for the existing `getCiv7PlayableStatus` runtime-support atom,
  including an empty input schema that keeps endpoint/session selection in
  procedure context instead of host/port/state/raw-command procedure input,
  App UI snapshot and Tuner health result schemas, and composed
  playable-status result schema coverage for tuner-ready and non-ready
  shell/unavailable/error shapes. The adjacent playable-status descriptor
  artifact records that runtime-support atom's procedure metadata and schema
  artifact map without registering a router. The current source artifact now
  also adds an empty TypeBox input schema for the existing
  `getCiv7AppUiSnapshot` runtime-support atom, keeping endpoint/session/state
  selection in procedure context rather than procedure input. The adjacent
  App UI snapshot descriptor artifact records that runtime-support atom's
  procedure metadata and schema artifact map without registering a router. The
  current procedure-core source
  artifact now also validates input/output payloads against resolved TypeBox
  schema artifacts, returning typed direct-control errors with local
  input/output schema-invalid reasons when payloads do not match, without
  executing atoms or registering a router. The current procedure-core source
  artifact now also adds a no-network call primitive that validates input before
  an injected handler, validates output after the handler, returns procedure
  output separately from debug/telemetry diagnostics, resolves correlation IDs
  according to descriptor policy, and normalizes handler failures with typed
  direct-control error details, without executing live atoms or registering a
  router. The adjacent ready-unit, ready-city, and unit move-preview procedure
  artifacts now also export concrete `unit.ready.view`, `city.ready.view`, and
  `unit.move.preview` call wrappers that use the local call primitive to
  validate input, invoke the stable read atoms, validate output, and return
  diagnostics separately from the atom output. The adjacent playable-status
  procedure artifact now also exports a concrete `runtime.playable.status` call
  wrapper that uses the same primitive to validate empty input, invoke the
  stable runtime-support atom, validate ready and unavailable output shapes, and
  return diagnostics separately from the atom output. The adjacent App UI
  snapshot procedure artifact now also exports a concrete
  `runtime.app.ui.snapshot` call wrapper that uses the same primitive to
  validate empty input, invoke the stable runtime-support atom, validate raw
  App UI diagnostic output, and return diagnostics separately from the atom
  output.
  The current source artifact now also adds TypeBox input/output schemas for
  the existing `getCiv7PlayNotificationView` read atom, including bounded
  `maxNotifications` input, endpoint/session/state/raw-command exclusion from
  procedure input, notification/decision/HUD output shape validation, and
  root-level output shape separation from raw command fields. The adjacent
  notification-view procedure artifact records that read atom's procedure
  metadata and schema artifact map without registering a router, and exports a
  concrete `notifications.view` call wrapper that uses the local call primitive
  to validate input, invoke the stable read atom, validate output, forward
  direct-control options, and return diagnostics separately from the atom
  output.
- `schemaOwner`: current TypeBox descriptor shape is now runtime-validated in
  the direct-control descriptor owner before semantic guards, with local proof
  for malformed projection, consumer-class, array-field, and extra-property
  cases. Current TypeBox read-atom schema ownership is seeded for
  `getCiv7ReadyUnitView`, `getCiv7ReadyCityView`, and
  `getCiv7UnitMovePreview`, with focused proof that the existing fake Tuner
  results match their result schemas and raw-command fields are rejected at the
  result root. The map-location schema now matches the existing
  `validateMapLocation` bounded-integer `0..1_000_000` validator boundary, with
  fractional, negative, over-bound, and extra-property proof both at the shared
  schema and inherited unit move-preview input schema. Current descriptor
  schema references bind `unit.ready.view`, `city.ready.view`, and
  `unit.move.preview` procedure descriptors to those schema exports and reject
  schema owners outside `@civ7/direct-control`, expression-like export names,
  raw command-source/session schema references, and unresolved referenced
  schema artifacts. Current focused proof also checks the concrete ready-unit,
  ready-city, and unit move-preview descriptors' input/output field lists
  against resolved TypeBox schema root properties, including ready-unit
  `legalOperations` instead of the stale `operationCandidates` fixture name,
  ready-city `legalOperations`/`productionCandidates`/`townFocusOptions`/
  `populationPlacement`, and unit move-preview reachability,
  queued/requested destination/path, plus neutral `relationshipPolicy`, through
  the generic descriptor resolver guard. Current TypeBox runtime-support schema
  ownership is also seeded for `getCiv7PlayableStatus`, with focused proof that
  existing fake App UI/Tuner results match the App UI snapshot, Tuner health,
  and playable-status result schemas, that non-ready shell and unavailable
  error shapes validate with omitted optional `tuner`, failed probes, and
  `errors` evidence, and that the empty procedure input rejects host/port/state
  and raw command/session selection. Current App UI snapshot procedure proof
  also checks the empty input schema rejects host/port/state and raw
  command/session selection while the output field list resolves against the
  App UI snapshot result schema. Current notification-view schema/procedure
  proof also checks bounded `maxNotifications` input, host/port/state/raw
  command exclusion from procedure input, fake notification/decision/HUD output
  validation, raw root-field rejection, and descriptor output-field resolution
  against the notification-view result schema. Current procedure-core payload validation
  proof validates ready-unit input/output payloads and unit move-preview
  validator-equivalent map-location inputs against resolved descriptor schema
  artifacts, including raw root-field rejection. Current procedure-call proof
  runs the same resolved schema artifacts around an injected handler, proving
  input-before-handler and output-after-handler sequencing. Current descriptor
  proof also records TypeBox as the accepted local schema technology and
  rejects unaccepted Effect Schema/Zod adapter descriptor claims before
  promotion. This is not a TypeBox versus Effect Schema migration decision and
  does not prove broader concrete procedure input/output schemas or runtime
  router schema registration.
- `concreteProcedureOwner`: current concrete procedure proof exists for
  `unit.ready.view`, `city.ready.view`, `unit.move.preview`,
  `runtime.playable.status`, `runtime.app.ui.snapshot`,
  `runtime.tuner.health`, and `notifications.view`, where the adjacent
  procedure wrappers compose
  `getCiv7ReadyUnitView`, `getCiv7ReadyCityView`,
  `getCiv7UnitMovePreview`, `getCiv7PlayableStatus`,
  `getCiv7AppUiSnapshot`, `checkCiv7TunerHealth`, and
  `getCiv7PlayNotificationView` with the
  procedure-core call primitive through fake dependencies. They prove input
  rejection before atom dependencies run, direct-control option forwarding into
  the atoms, atom output validation, separated diagnostics, neutral
  move-preview relationship-policy preservation, and playable-status
  readiness/error/tuner-absence output validation, App UI snapshot raw
  diagnostic output validation, Tuner health raw diagnostic output validation,
  and notification-view context-input rejection plus notification/decision/HUD
  output validation. Broader concrete procedures, runtime router
  registration, and oRPC handler registration remain pending.
- `errorOwner`: current descriptor-owner failures now use
  `Civ7DirectControlError` with code `procedure-descriptor-invalid` and
  structured reason/details for schema mismatch, raw command tunnel, missing
  mutation gates, local input/output schema-invalid payload validation, and
  local correlation-id policy failures. The injected-handler call primitive
  wraps handler failures with `procedure-call-failed` and structured
  procedure/correlation/source-error details. This is not final router/procedure
  middleware error shaping and does not prove external transport error formats.
- `correlationOwner`: current descriptor-owner shape now records correlation
  policy: generated-per-call or caller-provided-and-validated IDs, normal CLI
  omitted by default, debug diagnostics included, and telemetry attached only
  when procedure telemetry is enabled. The local injected-handler call primitive
  now generates or validates correlation IDs according to that policy and keeps
  correlation in diagnostics rather than the returned procedure output. This
  does not implement final procedure middleware correlation propagation or
  external transport formatting.
- `contextOwner`: current descriptor-owner shape now records local context
  requirements for direct-control facade access, endpoint defaults, state
  selection, logger, evidence sink, and playable-status live-session policy,
  with local proof that host/port/state procedure input fields are rejected
  when endpoint/state selection is context-owned. This is not final runtime
  context construction, dependency injection, resource/layer setup, middleware,
  or external transport context formatting.
- `proofPlan`: current proof is planning evidence, local atom test evidence,
  and focused descriptor-owner tests proving read atom descriptors, raw
  command tunnel rejection for generic raw fields and repo-local
  `command-serialization`/`session/execute` owners, malformed descriptor-shape
  rejection through TypeBox runtime validation, descriptor typed-error
  details, descriptor correlation policy with normal CLI omission by default,
  local `live-runtime-proof` claim rejection before runtime-proof ownership,
  descriptor context requirements with endpoint/state input rejection,
  ready-unit, ready-city, and unit move-preview read-atom input/output schemas
  over stable direct-control atoms, shared map-location schema proof aligned to
  the atom validator boundary, ready-unit, ready-city, and unit move-preview
  descriptor schema-reference binding plus local schema artifact resolution,
  adjacent ready-unit, ready-city, and unit move-preview procedure descriptor
  artifacts with generic resolver schema-root field-list proof, playable-status
  runtime-support input/output schemas over the composed App UI/Tuner status
  atom including non-ready shell/unavailable/error shape proof, an adjacent
  playable-status procedure descriptor artifact with generic resolver
  schema-root field-list proof, App UI snapshot runtime-support empty-input
  schema and adjacent procedure descriptor artifact with generic resolver
  schema-root field-list proof, local procedure-core input/output payload
  validation against resolved TypeBox schema artifacts for ready-unit and unit
  move-preview descriptors, local injected-handler procedure-call proof for
  input-before-handler/output-after-handler sequencing, separated
  output/diagnostics, correlation-id policy, and handler failure normalization,
  adjacent ready-unit, ready-city, unit move-preview, playable-status,
  App UI snapshot, Tuner health, and notification-view procedure call proof
  over stable direct-control atoms with fake dependencies,
  mutation approval/validator/postcondition/no-repeat gate requirements,
  telemetry projection as an Effect/oRPC middleware hook rather than a separate
  transport surface, and schema-technology proof that current descriptors
  declare TypeBox while unaccepted Effect Schema/Zod adapter claims fail before
  promotion. Missing before acceptance: final oRPC schema/procedure
  validation tests beyond this local TypeBox payload/call helper, final
  router/procedure error-shape snapshot, encode/decode round trip, Bun runtime
  check, CLI semantic projection test, AI-ingestion contract
  fixture test,
  final middleware approval/correlation/error tests, and no-raw-command-tunnel
  tests in the final router/procedure owner.
- `projectionPlan`: normal CLI remains omitted here and belongs to the
  semantic CLI row; the oclif shell remains separate. Debug/internal service
  diagnostics belong to the debug row. AI ingestion consumes typed contracts
  only through the AI row. Telemetry hooks compose only after the telemetry row.
  `globalThis.Civ7IntelligenceBridge.invoke(...)` is serialized ingress into
  the in-process oRPC/Effect router, not the product API.
- `stopConditionCoverage`: partial owner-seed coverage now fails generic raw
  command tunnel descriptors and descriptors over the repo-local command
  serializer/session execution owners before they can become procedure cores,
  fails malformed descriptor shapes before semantic promotion, and fails
  mutation descriptors without approval, validator-first, postcondition, and
  no-repeat-after-unverified gate metadata, with typed descriptor errors for
  those local owner checks, rejects local `live-runtime-proof` descriptor
  claims, rejects descriptor policies that make correlation visible in
  normal output, rejects host/port/state input fields when endpoint/state
  selection is context-owned by the descriptor, and rejects invalid local
  procedure input/output payloads against resolved descriptor schema artifacts.
  It also fails local calls before handler execution on invalid input, fails
  after handler execution on invalid output, requires caller-provided
  correlation IDs where descriptor policy says so, and wraps injected-handler
  failures with procedure/correlation details. The adjacent ready-unit,
  ready-city, unit move-preview, playable-status, App UI snapshot, Tuner
  health, and notification-view wrappers fail before their atom dependencies
  run when procedure input is invalid.
  Current descriptors also fail before promotion if they claim unaccepted
  `effect-schema` or `zod-adapter` ownership instead of the current TypeBox
  descriptor contract.
  Required coverage before acceptance must still fail if
  transport adapters or `packages/civ7-control-orpc`
  behavior precede concrete procedure-core contracts/tests, if raw command
  strings become router architecture, if the App UI bridge is treated as the
  product API, if Zod becomes an accidental durable schema authority, or if
  procedure-core schema work starts without TypeBox / Effect Schema / adapter
  ownership and tests.
- `downstreamUnblock`: none yet. Acceptance would unblock only specifically
  named 6.x procedure-core schema, middleware, context, error, and correlation
  slices after owners/proofs are assigned. It would not unblock transport
  adapters, in-game controller runtime source, AI ingestion, telemetry
  persistence, CLI semantic implementation, hotseat runtime proof, or runtime
  proof by itself.
- `nonProofClaims`: this intake does not implement Effect/oRPC, migrate
  schemas, add concrete router/procedure behavior, add transport adapters,
  implement the in-game controller router, claim runtime/live-game proof,
  accept Task 2.9.4, or unblock CLI semantic output, debug hierarchy
  implementation, telemetry, AI ingestion, hotseat runtime proof, or
  product-path support.
