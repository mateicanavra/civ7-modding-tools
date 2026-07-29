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

These blockers must be cleared before Task 2.9.4 can mark the listed planning
rows accepted. Rows may move independently, but a dependent implementation lane
can start only from the row or rows it consumes after their
`acceptanceStatus` is `accepted`. The control-service architecture row below is
already accepted and is therefore not part of this backlog.

| Row                             | Missing owner/proof assignments                                                                                                                                           | Required proof before acceptance                                                                                                                                                                  | Dependent lanes that stay blocked                                                                      |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Hotseat handoff state           | Hotseat runtime source owner, hotseat runtime proof owner, runtime gate runner, human-restoration proof owner                                                             | Disposable hotseat activation, two-slot `GameContext.localPlayerID` rotation, agent-slot accepted operation, turn-complete and human UI restoration evidence                                      | CLI hotseat status, mutation control-service contracts, live agent-turn execution, action telemetry    |
| Semantic CLI player-agent view  | Full envelope implementation owner, final schema/test owner, debug-separation reviewer/gate owner beyond the recorded CLI owner seed                                      | Local CLI semantic envelope tests plus fixtures proving normal output contains player-agent state/actions and excludes raw service/debug payloads                                                 | Tasks 5.1-5.7, normal CLI runtime-status projection, AI-facing semantic summaries                      |
| Strategy/intelligence ingestion | AI-ingestion contract owner, schema owner, proof owner, source/freshness label owner                                                                                      | Machine-contract fixtures proving source labels, freshness/evidence labels, action/proof vocabulary, and no dependency on CLI strings/raw probes                                                  | AI corpus artifacts, strategy/playbook records, static profile recipes, model-training telemetry feeds |
| Debug/internal service output   | Final debug/service hierarchy owner, schema/test owner, command/flag boundary owner                                                                                       | Tests proving raw transport/session/probe/closeout/correlation detail is available only through debug-owned service surfaces and not normal play output or AI ingestion                           | Debug service hierarchy, runtime diagnostics, internal procedure diagnostics                           |
| Operation/proof telemetry       | Final schema owner, broader operation-atom adapter owners beyond the retained unit-target, diplomacy-response, narrative-choice, and notification-dismissal seeds, projection gate owner, runtime-proof boundary owner | Contract fixtures proving validation, send, post-read, outcome delta, blocker delta, correlation id, evidence policy, stale/unknown classification, and explicit separation from `verified: true` | Telemetry persistence, AI action audit, procedure middleware, semantic CLI proof summaries             |

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
- Effect/oRPC control service: `workstream/control-service-contract.md`
  recorded.

The first five artifacts close only the `contractArtifact` planning sub-gap.
They do not accept their rows, assign source/proof/schema owners, create tests,
prove runtime behavior, or unblock dependent implementation lanes. The
control-service artifact records the already accepted architecture and owner;
individual service capabilities and live claims retain their own proof gates.

Global acceptance stop conditions:

- Stop if a row says it supports both target consumers without separating
  normal CLI projection, debug/internal output, AI ingestion, telemetry, and
  control-service consumers.
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
  before accepted control-service contracts over stable direct-control atoms.
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
  AI-ingestion contract, telemetry projection, and control-service projection
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
  AI ingestion, telemetry, and control-service contracts into one raw JSON shape.
- Reject if the row lets AI consumers train on CLI presentation strings,
  runtime reflection, raw SQL, raw command strings, or vague `verified: true`.
- Reject if the row promotes Autoplay/Automation from support/debug
  infrastructure to the primary external-agent executor.
- Reject if the row moves oRPC or transport adapters ahead of accepted typed
  control-service contracts over stable direct-control atoms.

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
  status; future control-service action gating
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
  control-service contracts, AI-controlled live-turn execution, telemetry action audit
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
  persistence, AI-ingestion contract, transport adapter, or control-service
  implementation is authorized by this intake.
- `contractArtifact`: existing artifacts are planning records, App UI snapshot
  shape, Tuner health/playable-status results, session health/reconnect shapes,
  setup lifecycle results, autoplay support results, and turn-completion
  results, and `workstream/hotseat-handoff-contract.md`, which names future
  handoff state slots for session health, current local player, slot ownership,
  turn/blocker state, curtain/interface state, action eligibility
  state, post-action state, runtime proof gates, projection boundaries,
  acceptance gaps, and stop conditions. Missing before acceptance: a named
  runtime source/proof owner, gate runner, human-restoration proof owner, and
  live runtime evidence over that contract.
- `proofPlan`: existing proof is planning evidence and local fake-runtime tests
  for reusable atoms. Missing proof before acceptance: the runtime proof gates
  listed in `workstream/hotseat-handoff-contract.md`, including menu/setup
  hotseat snapshot, disposable hotseat activation, two-slot
  `GameContext.localPlayerID` rotation, agent-owned current-slot detection,
  mutation refusal for non-agent human turns, one accepted agent-slot
  operation, turn completion, human UI restoration, fallback non-local
  operation probe disposition, and bounded Autoplay measurement proof as
  support/debug evidence only.
- `projectionPlan`: normal CLI may later summarize current player, slot
  ownership, handoff readiness, blocker state, action eligibility, and safe
  next steps through the semantic CLI row; debug/internal service output may
  expose raw handoff diagnostics only under the debug row; telemetry may record
  proof details only after the telemetry row is accepted; AI ingestion may
  consume only source-labeled records after the ingestion row is accepted;
  mutation-facing service capabilities remain blocked until hotseat proof and
  service-contract ownership are accepted.
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
  transport adapters, or control-service implementation by itself.
- `nonProofClaims`: this intake does not claim hotseat activation,
  local-player rotation, agent-slot action proof, human restoration,
  runtime/live-game proof, AI-on-hotseat product-path support, CLI semantic
  implementation, telemetry implementation, AI ingestion, debug hierarchy
  implementation, schema migration, Effect/Bun implementation, Effect/oRPC
  control-service work, or Task 2.9.4 row acceptance.

### Semantic CLI Player-Agent View

- `foundationThread`: `019e86b7-b08b-72f3-8341-6c78a1285c93`
- `modelThread`: `019e8b5a-f2ee-7ea2-96bc-8c07dc5ab6cc`
- `dependencyDirection`: hotseat/autoplay foundation -> AI-intelligence model
- `surface`: semantic CLI player-agent view
- `primaryConsumer`: normal local player-agent CLI user/API
- `sourceOwner`: `plugins/cli/topics/game/src/utils/game-play/semantic-envelope.ts`
  owner seed and structural constructor; command-specific projections remain
  under their existing `game play` command owners, with `game play priorities`
  now carrying the first compact semantic-envelope integration
- `proofOwner`: `plugins/cli/topics/game/test/commands/game/play/semantic-envelope.test.ts`
  owner-seed proof plus existing focused play suites using the shared
  normal-output helper; `plugins/cli/topics/game/test/commands/game/play/priorities.test.ts`
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
  modules under `plugins/cli/topics/game/src/commands/game/play/**/*.ts`, with command
  ownership inventoried in `workstream/cli-play-corpus.md`. Current proof
  owners are the canonical play suites owned by `cli-game:test`,
  including the focused notification, priorities, ready, tactical, progression,
  production, operation, and mutation-facing command suites listed in that
  corpus. The source/proof owner seed for shared envelope vocabulary and
  forbidden normal-output internals is now
  `plugins/cli/topics/game/src/utils/game-play/semantic-envelope.ts` with proof in
  `plugins/cli/topics/game/test/commands/game/play/semantic-envelope.test.ts`; compact
  priorities integration is owned by
  `plugins/cli/topics/game/src/commands/game/play/priorities.ts`
  and proven in `plugins/cli/topics/game/test/commands/game/play/priorities.test.ts`.
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
  control-service bucket is authorized.
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
- `proofPlan`: existing local proof is canonical `cli-game:test` plus the
  focused command owner tests recorded in `workstream/cli-play-corpus.md`.
  The semantic owner proof verifies the planned envelope slot vocabulary; the
  test-only normal-output helper independently calibrates raw debug/internal
  marker classes. Compact priorities proof now verifies that normal play
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
  source/freshness/evidence labels; telemetry and control-service projections
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
  transport adapters, or control-service implementation.
- `nonProofClaims`: this intake does not claim runtime/live-game proof, CLI
  semantic implementation beyond compact priorities, final schema selection,
  AI ingestion implementation, telemetry contract acceptance, debug hierarchy
  implementation, schema migration, Effect/Bun implementation, Effect/oRPC
  control-service work, product-path support, or Task 2.9.4 row acceptance.

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
  transport adapter, or control-service implementation is authorized.
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
  consumed only after its contract row is accepted; control-service contracts
  remain pending until schema/procedure ownership is accepted.
- `stopConditionCoverage`: missing before acceptance. Required coverage must
  fail if AI consumers train on CLI strings, raw JavaScript commands, raw SQL,
  runtime reflection, companion/App UI mutation surfaces, unlabeled artifacts,
  or `verified: true` without explicit validation, send, post-read,
  outcome, and stale/unknown evidence.
- `downstreamUnblock`: none yet. Acceptance would unblock only explicitly named
  AI-ingestion contract, corpus-record fixture, strategy-data, and static
  profile-planning slices after schema/proof owners and separation tests are
  recorded; it would not unblock telemetry persistence, semantic CLI output,
  hotseat runtime proof, debug hierarchy implementation, transport adapters,
  or control-service implementation by itself.
- `nonProofClaims`: this intake does not claim AI-ingestion implementation,
  corpus/model artifact generation, static profile generation, telemetry
  contract acceptance, runtime/live-game proof, semantic CLI implementation,
  debug hierarchy implementation, schema migration, Effect/Bun implementation,
  Effect/oRPC control-service work, product-path support, or Task 2.9.4 row
  acceptance.

### Debug/Internal Service Output

- `foundationThread`: `019e86b7-b08b-72f3-8341-6c78a1285c93`
- `modelThread`: `019e8b5a-f2ee-7ea2-96bc-8c07dc5ab6cc`
- `dependencyDirection`: exterior/debug-only support surface that must remain
  separate from the AI-on-hotseat product path while serving proof and
  diagnostics for it
- `surface`: debug/internal service output
- `primaryConsumer`: direct-control service/debug hierarchy
- `sourceOwner`: debug-oriented commands under
  `plugins/cli/topics/game/src/commands/game` and their direct-control result
  contracts; no separate production projection seed exists
- `proofOwner`: `plugins/cli/topics/game/test/commands/game/control.test.ts`
  and focused command suites under the same topic plugin; final row proof/gate
  owner remains pending
- `playerScope`: debug/observer scoped unless a row-specific action surface
  assigns local-player or agent-slot scope
- `consumerClass`: debug/internal service output; support diagnostics; future
  control-service diagnostics
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
- `acceptanceStatus`: `pending-debug-service-boundary`; direct command owners
  and command-integrated debug payload proof exist, but final debug hierarchy
  owner, schema/test owner, command/flag boundary coverage, and separation
  tests are not assigned
- `blockingDependents`: debug service hierarchy, runtime-status projection,
  internal diagnostics in control-service contracts
- `stopCondition`: stop if debug/internal output becomes normal CLI output,
  AI-ingestion input, or a product action authority

#### Acceptance Intake: Debug/Internal Service Output

- `ownerAssignment`: source owners are the existing debug/direct-control CLI
  commands under
  `plugins/cli/topics/game/src/commands/game/{exec,health,inspect,status,catalog}.ts`
  plus `plugins/cli/topics/game/src/commands/game/map/visibility.ts`
  plus their package atom owners in `packages/civ7-direct-control/src/session`,
  `src/runtime`, `src/catalog`, and `src/play/map/visibility.ts`. Proof owners
  are `plugins/cli/topics/game/test/commands/game/control.test.ts`,
  `packages/civ7-direct-control/test/runtime-and-catalog.test.ts`,
  `packages/civ7-direct-control/test/session.test.ts`, and future
  normal/debug separation tests. Debug field ownership remains with those
  commands and the direct-control result contracts; command-integrated proof
  lives in `plugins/cli/topics/game/test/commands/game/control.test.ts`.
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
  control-service boundaries, acceptance gaps, and stop conditions. The current
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
  `plugins/cli/topics/game/test/support/normal-output-boundary.ts` helper that
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
  The command tests assert current debug payloads expose transport/session
  state, route selection, runtime/App UI/map probes, correlation diagnostics,
  and catalog provenance without introducing a second projection authority.
  Missing proof before acceptance: broader tests proving the raw field classes in
  `workstream/debug-service-projection-contract.md` are reachable only through
  debug-owned commands, flags, or future debug procedures and are not emitted
  by normal play output or accepted AI-ingestion contracts.
- `projectionPlan`: normal CLI projection remains omitted/debug-only for raw
  runtime/service fields; debug/internal service projection may include raw
  transport/session state, probe output, route selection, closeout traces,
  correlation, catalog provenance, and diagnostics; AI ingestion remains
  out-of-scope until a separate ingestion contract accepts source/freshness and
  evidence labels; telemetry and control-service projections remain pending
  separate rows.
- `stopConditionCoverage`: partial command-level coverage exists for debug-owned
  payload field classes. Required coverage before acceptance must still
  fail if debug/internal output becomes normal CLI player-agent output, AI
  ingestion input, product action authority, or a substitute for live runtime
  proof.
- `downstreamUnblock`: none yet. Acceptance of this row would unblock only
  debug/service hierarchy and internal procedure diagnostics explicitly named
  in a later update; it would not unblock normal CLI semantic envelopes,
  telemetry, AI ingestion, hotseat runtime proof, or transport adapters.
- `nonProofClaims`: this intake does not claim runtime/live-game proof, AI
  ingestion implementation, telemetry contract acceptance, CLI semantic
  envelope implementation, Effect/oRPC control-service readiness, App UI bridge
  implementation, or product-path support. `acceptanceStatus` remains
  `pending-debug-service-boundary`.

### Operation/Proof Telemetry

#### Current Production-Choice Disposition (2026-07-29)

The former direct-control production-choice telemetry and proof-policy adapter
paths are deleted and are not current source or proof owners. Direct-control
now owns exact production check/send wire atoms only, while
`services/civ7-control` owns production-choice orchestration, dispatch
uncertainty, bounded post-send checking, postcondition classification, and
no-repeat-after-unverified policy. Production telemetry has no current owner;
adding it would require a separately accepted telemetry contract that consumes
the service-owned classifications.

The production-choice adapter paths and focused proof described as historical
seeds later in this intake remain provenance for the earlier planning state,
not current acceptance seeds.

- `foundationThread`: `019e86b7-b08b-72f3-8341-6c78a1285c93`
- `modelThread`: `019e8b5a-f2ee-7ea2-96bc-8c07dc5ab6cc`
- `dependencyDirection`: hotseat/autoplay foundation -> AI-intelligence model
- `surface`: operation/proof telemetry
- `primaryConsumer`: support proof, AI-intelligence ingestion, and future
  procedure middleware
- `sourceOwner`: `packages/civ7-direct-control/src/proof/operation-telemetry.ts`
  owner seed for record slot vocabulary, structural constructor, and normal
  summary boundary; `packages/civ7-direct-control/src/proof/unit-target-telemetry.ts`,
  `packages/civ7-direct-control/src/proof/diplomacy-response-telemetry.ts`,
  `packages/civ7-direct-control/src/proof/narrative-choice-telemetry.ts`, and
  `packages/civ7-direct-control/src/proof/notification-dismissal-telemetry.ts`
  seed the retained operation-result adapters while broader
  operation-specific adapters remain under their existing operation/proof atom
  owners
- `proofOwner`: `packages/civ7-direct-control/test/operation-telemetry.test.ts`
  owner-seed proof plus
  `packages/civ7-direct-control/test/unit-target-telemetry.test.ts`,
  `packages/civ7-direct-control/test/diplomacy-response-telemetry.test.ts`,
  `packages/civ7-direct-control/test/narrative-choice-telemetry.test.ts`, and
  `packages/civ7-direct-control/test/notification-dismissal-telemetry.test.ts`
  for the retained adapter seeds; final row proof/gate owner remains pending
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
  action, operation family, target, args, validation result, send
  result, post-read, correlation id, evidence policy, correlation/proof metadata,
  `validation_pre`, `send_receipt`, `validation_post`, `outcome_delta`, blocker
  deltas, runtime observation links, and stale/unknown classification
- `proofLabel`: `pending-telemetry-contract`
- `acceptanceStatus`: `pending-telemetry-contract`; source/proof owner seed plus
  retained unit-target, diplomacy-response, narrative-choice, and
  notification-dismissal operation-result adapter seeds exist, but telemetry
  schema owner, broader operation-atom adapters, normal/debug/AI/procedure
  projection separation tests, and final runtime proof boundary gates are not
  assigned; production telemetry has no current owner or adapter seed
- `blockingDependents`: telemetry persistence, AI ingestion, procedure
  middleware, action audit vocabulary, semantic CLI proof summaries
- `stopCondition`: stop if telemetry trains or acts on vague `verified: true`,
  collapses validation/send/postcondition/outcome evidence, or claims
  live proof from local tests, target-thread evidence, peer reports, or docs

#### Acceptance Intake: Operation/Proof Telemetry

- `ownerAssignment`: current source evidence is distributed across
  deleted `packages/civ7-direct-control/src/action-approval.ts` approval primitive,
  `src/play/operations/{validate-request,router,unit-postconditions,population-postconditions,unit-target-action,diplomacy-request,diplomacy-postconditions,narrative-request,narrative-postconditions}.ts`,
  the exact production wire atoms in `src/play/city/production.ts`,
  the service-owned production policy in
  `services/civ7-control/src/service/modules/city`, and
  `src/play/notifications/{dismissal-request,verification}.ts`,
  `src/play/turn-completion.ts`, `src/setup/*`, and their public facade
  call-throughs. Current proof owners are focused package suites such as
  `unit-operation.test.ts`, `population-placement.test.ts`,
  `production-choice-atoms.test.ts`, `unit-target-action.test.ts`,
  `diplomacy-response.test.ts`, `narrative-choice.test.ts`,
  `notification-dismissal.test.ts`, `autoplay-and-turn.test.ts`, and
  setup/lifecycle tests, plus
  `services/civ7-control/test/behavior/modules/city/city-production-choice-procedure.test.ts`
  and focused CLI command suites where they consume postcondition results.
  The shared telemetry source/proof owner seed is now
  `packages/civ7-direct-control/src/proof/operation-telemetry.ts` with focused
  proof in `packages/civ7-direct-control/test/operation-telemetry.test.ts`,
  including no-repeat-guarded summaries for sent-unverified, stale/unknown, and
  pending-runtime-proof records plus a proof-label guard rejecting
  `live-runtime-proof` and `in-game-observation` evidence labels under non-live
  boundaries. Operation-result adapter owner seeds now include
  `packages/civ7-direct-control/src/proof/unit-target-telemetry.ts`
  with focused proof in
  `packages/civ7-direct-control/test/unit-target-telemetry.test.ts`, adapting
  one unit-target action result shape into separated telemetry slots;
  `packages/civ7-direct-control/src/proof/production-choice-telemetry.ts` with
  focused proof in
  `packages/civ7-direct-control/test/production-choice-telemetry.test.ts`,
  formerly adapted one production-choice result shape, but both paths are now
  deleted and historical only;
  `packages/civ7-direct-control/src/proof/diplomacy-response-telemetry.ts`
  with focused proof in
  `packages/civ7-direct-control/test/diplomacy-response-telemetry.test.ts`,
  adapting one diplomacy-response result shape into separated telemetry slots,
  and `packages/civ7-direct-control/src/proof/narrative-choice-telemetry.ts`
  with focused proof in
  `packages/civ7-direct-control/test/narrative-choice-telemetry.test.ts`,
  adapting one narrative-choice result shape into separated telemetry slots,
  and `packages/civ7-direct-control/src/proof/notification-dismissal-telemetry.ts`
  with focused proof in
  `packages/civ7-direct-control/test/notification-dismissal-telemetry.test.ts`,
  adapting one notification-dismissal result shape into separated telemetry
  slots.
  Missing before acceptance: a final schema/test owner, broader operation-atom
  adapter owners, and reviewer/gate owner.
- `writeSet`: this intake authorizes only compatibility-matrix/task/record
  planning updates. A later implementation slice may touch a precisely named
  telemetry contract owner, focused package/CLI tests, and narrow adapters from
  existing operation/proof owners after source and proof ownership are
  assigned. No broad `common`, `utils`, debug/service, CLI presentation,
  AI-ingestion, persistence, transport, or control-service bucket is authorized.
- `contractArtifact`: existing artifacts are package result/postcondition
  shapes primitives, validation/send wrappers, closeout
  classifications, notification verification summaries, proof/log helper
  outputs, and `workstream/operation-proof-telemetry-contract.md`, which names
  future record slots for strategy intent, candidate action, operation family,
  target, args, validation result, send receipt, post-read,
  postcondition classification, outcome delta, blocker delta, evidence policy,
  correlation id, source/freshness label, stale/unknown classification, proof
  classes, projection boundaries, acceptance gaps, and stop conditions. The
  current source artifact adds the internal record slot vocabulary,
  constructor, postcondition sanitizer, normal summary/projection boundary, and
  the retained unit-target, diplomacy-response, narrative-choice, and
  notification-dismissal operation-result adapters. The former
  production-choice adapter remains historical provenance only. Missing before
  acceptance: a schema/test owner, broader operation-atom adapters, and
  final consumer-owned projection implementation tests over that record
  contract.
- `proofPlan`: existing local proof covers validator-first behavior,
  validator-first no-send paths, focused send/read split, postcondition
  classification, no-repeat-after-unverified guidance, notification identity
  verification, and setup/turn lifecycle readback in package and focused CLI
  tests. Owner-seed proof now covers telemetry record construction against
  `workstream/operation-proof-telemetry-contract.md`, keeps validation,
  validation, send, post-read, outcome, and blocker evidence as separate slots,
  strips legacy `verified` booleans from the postcondition contract, and keeps
  raw telemetry slots out of the normal summary boundary. Unit-target adapter
  proof now verifies that a real operation result shape maps validation,
  `validation_pre`, `send_receipt`, `post_read`, `validation_post`,
  postcondition, and `outcome_delta` into separate telemetry slots while
  refusing to treat a legacy top-level `verified` boolean as confirmed
  postcondition proof; missing postcondition, no-state-change, and
  pending-runtime-proof summaries remain no-repeat guarded. Historical
  production-choice adapter proof verified that a production result shape
  mapped validation,
  `validation_pre`, `send_receipt`, `post_read`, `validation_post`,
  postcondition, `outcome_delta`, and `blocker_delta` into separate telemetry
  slots while using `productionPostcondition` as the classification owner;
  missing postcondition, validator-blocked no-send, no-state-change,
  blocker-still-live, `validation-changed`, and pending-runtime-proof paths
  remained no-repeat guarded. That deleted adapter and its
  `productionPostcondition` input are not current owners; current production
  classification is service-owned and does not establish a telemetry producer.
  Diplomacy-response
  adapter proof verifies that a diplomacy result shape maps validation,
  `validation_pre`, `send_receipt`, `post_read`, `validation_post`,
  postcondition, `outcome_delta`, and `blocker_delta` into separate telemetry
  slots while using the source-owned diplomacy response postcondition as the
  classification owner; missing postcondition, validator-blocked no-send,
  `no-state-change`, `validation-changed`, and pending-runtime-proof paths
  remain no-repeat guarded. Narrative-choice adapter proof verifies that a
  narrative result shape maps `validation_pre`, `send_receipt`,
  `post_read`, `validation_post`, postcondition, `outcome_delta`, and
  `blocker_delta` into separate telemetry slots while using the source-owned
  narrative choice postcondition as the classification owner; missing
  postcondition, validator-blocked no-send, `no-state-change`,
  `validation-changed`, and pending-runtime-proof paths remain no-repeat
  guarded. Notification-dismissal adapter proof verifies that an App UI action
  result shape maps `validation_pre`, `send_receipt`, `post_read`,
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
  contracts from the AI-ingestion row; control-service contracts may attach middleware
  hooks only after typed schema/procedure ownership is accepted.
- `stopConditionCoverage`: partial owner-seed coverage now proves the structural
  telemetry constructor does not carry a legacy `verified` boolean as the
  postcondition contract and keeps raw telemetry slots out of the normal
  summary/projection boundary. It also rejects live-runtime and in-game proof
  labels under non-live proof boundaries, and blocks local AI/procedure
  projection until those owners accept contracts. Required coverage before
  acceptance must still fail if telemetry collapses validation, send,
  postcondition, post-read, and outcome evidence into `verified: true`; if AI
  ingestion or control-service contracts consume raw CLI/debug strings; or if future
  producers or projections relabel local tests, target threads, peer reports,
  logs, or docs as live runtime proof.
- `downstreamUnblock`: none yet. Acceptance would unblock only explicitly named
  telemetry contract, action-audit vocabulary, and later procedure middleware
  slices after schema/proof owners and separation tests are recorded; it would
  not unblock telemetry persistence, AI ingestion, normal CLI semantic output,
  hotseat runtime proof, debug hierarchy implementation, transport adapters,
  or control-service implementation by itself.
- `nonProofClaims`: this intake does not claim runtime/live-game proof,
  telemetry schema implementation, telemetry persistence, AI ingestion,
  semantic CLI implementation, debug hierarchy implementation, schema
  migration, Effect/Bun implementation, Effect/oRPC control-service work,
  product-path support, or Task 2.9.4 row acceptance.

### Effect/oRPC Control Service

- `foundationThread`: `019e86b7-b08b-72f3-8341-6c78a1285c93`
- `modelThread`: `019e8b5a-f2ee-7ea2-96bc-8c07dc5ab6cc`
- `dependencyDirection`: hotseat/autoplay foundation -> AI-intelligence model
- `surface`: closed Effect/oRPC control service
- `primaryConsumer`: CLI, in-game controller ingress, Studio edges, and future
  AI services through one typed service contract
- `sourceOwner`: `services/civ7-control` owns contracts, routers, context ports,
  admission, typed errors, middleware, and multi-step Effect behavior directly
  over `@civ7/direct-control` wire atoms
- `proofOwner`: `services/civ7-control/test` owns service contract, router,
  admission, middleware, and behavior proof; direct-control tests independently
  own low-level runtime atom behavior
- `playerScope`: per procedure; local-player and agent-slot scoped for mutation,
  debug/observer scoped for diagnostics
- `consumerClass`: typed control-service clients and controller ingress
- `evidenceClass`: local service and atom tests; runtime proof remains separate
  for live claims
- `procedureCandidate`: named service capabilities only; no generic operation or
  direct-control descriptor registry
- `normalCliProjection`: semantic command output owned by the CLI caller
- `debugServiceProjection`: explicit diagnostics only; no raw details in normal
  procedure output
- `proofLabel`: `compatibility-matrix-accepted`
- `acceptanceStatus`: `accepted`
- `blockingDependents`: none for service architecture; hotseat, AI ingestion,
  telemetry, and runtime proof remain blocked only by their own rows
- `stopCondition`: stop if callers bypass the service, if direct-control grows a
  second descriptor/router/context plane, if raw command tunneling becomes a
  product procedure, or if local tests are presented as live runtime proof

#### Acceptance Intake: Effect/oRPC Control Service

- `ownerAssignment`: source and schema owner `services/civ7-control`; low-level
  runtime-port owner `packages/civ7-direct-control`; proof owner
  `services/civ7-control/test`; reviewer/gate owner
  `.agents/skills/civ7-orpc-control-architecture/SKILL.md` through the
  `control-orpc` Nx test/check/build and Habitat service-kind gates.
- `writeSet`: service behavior stays in `services/civ7-control`; low-level Civ7
  access stays in `packages/civ7-direct-control`; controller realization stays
  in `mods/mod-civ7-intelligence-bridge`.
- `contractArtifact`: the configured service contract and module contracts.
- `proofPlan`: service and direct-control Nx tests/check/build, workspace
  boundaries, controller ingress tests, and separate live proof where claimed.
- `projectionPlan`: CLI and other callers project service results; debug and AI
  surfaces require explicit contracts rather than raw service payload reuse.
- `stopConditionCoverage`: closed service Habitat law plus package boundaries
  exclude alternate framework and host-owned surfaces.
- `downstreamUnblock`: named service capabilities may proceed without a
  direct-control-local descriptor precursor.
- `nonProofClaims`: this row does not claim individual capability completion,
  hotseat runtime, AI ingestion, telemetry persistence, deployed controller
  behavior, or live Civ7 proof.
