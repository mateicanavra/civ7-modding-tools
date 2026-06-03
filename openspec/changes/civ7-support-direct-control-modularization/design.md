## Design

This workstream uses two coupled but separately verified migrations:

- **CLI play ownership migration:** convert the remaining monolith-owned command
  tests into focused files under `packages/cli/test/commands/game/play/**`.
- **Direct-control atom migration:** after focused tests exist, split stable
  runtime atoms out of the large direct-control `index.ts` into named package
  modules with explicit public types/constants.

Effect/oRPC composition is intentionally last. It consumes direct-control atoms
through typed procedure cores; it does not own raw socket state, raw JavaScript
command strings, or gameplay mutation logic.

The CLI is a local API/view layer over the internal direct-control service. The
direct-control package may return rich structured service data for verification,
operation closeout, transport diagnostics, and procedure composition. The CLI
play hierarchy should reduce that data to the semantic state a player agent
needs: what happened, what game state matters, what decision is available, and
what action is safe or blocked. Transport/session details belong in the
internal service or in an explicitly debugging-oriented CLI hierarchy, not in
normal play-command output.

The same atom and envelope work must serve two downstream control consumers:
live player-agent hotseat/autoplay control and the higher-level
AI-intelligence/strategy-data layer. The hotseat/autoplay thread
`019e86b7-b08b-72f3-8341-6c78a1285c93` is the lower control foundation; the
AI-intelligence model thread `019e8b5a-f2ee-7ea2-96bc-8c07dc5ab6cc` is the
strategy-data consumer that should ingest semantic game state, decisions,
action outcomes, blockers, and proof telemetry without depending on CLI
presentation strings or raw service plumbing.

The current supervisor-resolved target-thread evidence sharpens that split:
hotseat is the preferred one-client player-agent base when activation is
available because Civilization rotates `GameContext.localPlayerID` through
hotseat human slots; autoplay is a debug/native-AI harness and support evidence,
not the primary product path for external player agents. The intelligence layer
is broader than live CLI play: it must support live hotseat control,
strategy/playbook/cookbook generation from human play patterns, and possible
static native-AI profile shaping. Live play remains routed through
`@civ7/direct-control`; static native-AI shaping belongs to generated profiles.
The in-game App UI companion direction is subordinate to direct-control, using a
small versioned JSON-envelope endpoint/RPC rather than becoming a third control
plane. Raw `game exec` remains a diagnostic/probe substrate.

Effect and Bun are target implementation primitives for new or rewritten
control logic. Source lanes should plan resource acquisition/release, socket
framing, buffering, streams, concurrency, error shaping, layers, and tests
around Effect affordances where they fit, and prefer Bun-native APIs over Node
APIs except where Node is the only practical or clearly superior option. This
does not replace the existing oclif CLI shell; it changes the implementation
style inside the package/service logic and relevant tests.

## Systematic Corpus

### CLI Command/Test Corpus

The CLI play corpus includes:

- no remaining `packages/cli/test/commands/game.play.test.ts` monolith command
  owners after the priorities slice;
- already extracted owner suites under `packages/cli/test/commands/game/play/**`;
- adjacent package-local play suites such as production, narrative, culture,
  technology, first-meet, operation wrappers, end-turn, population placement,
  town focus, unit target, progression read, tactical read, watch, topics,
  promotion readiness, rehydrate, settlement recommendations, ready city,
  unit move preview, ready unit, notification queue, dismiss queue, exact
  dismiss, notification HUD, and priorities;
- fake tuner fixture ownership and local owner-specific scenario builders.

Every corpus row needs:

- command owner;
- current test file;
- target test file;
- fixture dependency;
- mutation/read-only proof class;
- focused suite command;
- adjacent monolith filter;
- removal branch;
- validation status.

### Direct-Control Atom Corpus

The direct-control corpus includes:

- tuner socket/session/framing and state-role selection;
- JSON command execution and error shaping;
- play notification/HUD view materialization;
- notification dismissal and closeout verification;
- ready unit and ready city views;
- operation validation/send/postcondition helpers;
- tactical, progression, settlement, destination, battlefield, and target reads;
- map, visibility, GameInfo, setup/lifecycle, autoplay, turn-completion, and
  runtime root inspection surfaces;
- component ID, schema/type ownership, constants, and public exports;
- future procedure-core candidates for control-oRPC.
- CLI semantic envelope consumers and any debug-only raw diagnostic consumers.

Every atom row needs:

- source region in `packages/civ7-direct-control/src/index.ts`;
- proposed module owner;
- public/private exports;
- existing tests;
- required new tests;
- runtime-proof requirement;
- consumers in CLI/Studio/oRPC;
- service fields classified as internal machinery, debug-output material, or
  player-agent semantic output.
- compatibility fields before dependent CLI semantic, telemetry, AI-ingestion,
  runtime-status, or procedure-core work: `playerScope`, `consumerClass`,
  `evidenceClass`, `procedureCandidate`, `normalCliProjection`, and
  `debugServiceProjection`.

## Parallel Execution Model

Every delegated lane starts from a framed objective. The spec owner must decide
whether the agent is a short report-only peer, a long-running investigation, or
an implementation lane before sending instructions.

Long-running investigation or implementation agents receive a `/goal`-prefixed
prompt with context, required skills, objective, write permissions, proof
expectations, and return shape. Existing threads are reused only when their
prior context is intentionally useful; if the topic changes, the spec owner
sends `/compact`, waits for completion, and only then sends the new frame.

### Lane A: Systematic Spec Owner

Write set:

- `openspec/changes/civ7-support-direct-control-modularization/**`
- downstream project workstream records when facts change

Responsibilities:

- maintain corpus ledgers and task status;
- receive agent reports;
- decide lane sequence;
- keep proof labels honest;
- run OpenSpec validation.
- own all Graphite sequencing decisions for this change; other agents report
  findings or contribute non-overlapping files but do not independently mutate
  the support stack without coordination.

### Lane B: Net-New CLI Suites

Write set:

- new files under `packages/cli/test/commands/game/play/**`
- `package.json` `test:cli:play` additions

Responsibilities:

- create focused owner suites before monolith removal;
- use local fakes or named fixtures only when ownership is explicit;
- do not remove monolith tests in this lane unless it also owns the extraction
  closure.
- avoid touching `package.json` unless the spec owner has assigned that file for
  the current slice.

### Lane C: Monolith Removal / DRA Integration

Write set:

- `packages/cli/test/commands/game.play.test.ts`
- `package.json` only when wiring/removing suites

Responsibilities:

- remove exactly the coverage already recreated in Lane B;
- remove obsolete monolith fixture branches only when no remaining monolith test
  uses them;
- run adjacent monolith filters and ownership scans;
- keep each Graphite branch small.
- act as the only writer to `packages/cli/test/commands/game.play.test.ts` for
  the active slice.

### Lane D: Direct-Control Atom Planning

Write set:

- OpenSpec corpus/design/task artifacts first
- direct-control source only after CLI tests stabilize and tasks authorize it

Responsibilities:

- propose module boundaries and public exports;
- identify constants/types to export after reviewing user TODO stashes;
- define runtime proof requirements;
- classify each atom's service-output fields as internal machinery,
  debug-output material, or player-agent semantic output before CLI hierarchy
  rewrites;
- avoid source edits until focused direct-control tests exist.

### Lane E: CLI Semantic Surface Planning

Write set:

- OpenSpec design/task/corpus artifacts first
- CLI command hierarchy docs/tests only after command boundaries are assigned

Responsibilities:

- define play-command response envelopes from the player-agent perspective;
- keep transport/session/proof internals out of normal play output;
- name explicit debug commands or flags for intentional diagnostics;
- reduce large JSON payloads by projecting direct-control service results into
  semantic game state, action results, blockers, and next-step affordances.

### Lane F: Effect/Bun Integration Planning

Write set:

- OpenSpec design/task/corpus artifacts first
- package source/tests only after direct-control atom owners are assigned

Responsibilities:

- identify where Effect `Scope`, resource acquisition/release, streams,
  schedules, layers, errors, and concurrency primitives should replace ad hoc
  control plumbing;
- treat current setup/restart dependency injection for waits, session use, and
  readiness polling as a modularization boundary, not the final composition
  model; a later accepted Effect/Bun slice should decide whether those injected
  waits become scoped resources, schedules, layers, or typed errors;
- identify where Bun-native APIs should replace Node APIs in new/refactored
  code;
- define test patterns for Effect-based logic without converting the oclif CLI
  shell to Effect CLI;
- coordinate with the oRPC authority lane so Effect/oRPC procedure cores compose
  direct-control atoms rather than becoming a transport-first rewrite.

### Lane G: Hotseat/Autoplay And AI-Intelligence Compatibility Planning

Write set:

- OpenSpec design/task/corpus artifacts first
- no package source, CLI hierarchy, telemetry, or procedure-core implementation
  until peer reports are read and the compatibility matrix is accepted

Responsibilities:

- disposition the report-only AI-intelligence, hotseat/autoplay, and synthesis
  peer waves before treating their assumptions as planned;
- define stable semantic state inputs for strategy/intelligence consumers,
  including game phase, turn/player context, blockers, available decisions,
  selected units/cities, map/visibility summaries, and operation outcomes;
- define debug/internal service outputs separately from normal player-agent CLI
  output and machine-ingestion surfaces;
- identify operation/proof telemetry that future AI-intelligence consumers need
  without exposing raw transport/session/proof JSON in normal play commands;
- ensure Effect/oRPC procedure-core schemas support both local player-agent
  hotseat control and strategy-data ingestion over stable direct-control atoms.

Compatibility matrix seed:

| Surface | Primary consumer | Required content | Forbidden collapse |
| --- | --- | --- | --- |
| Hotseat handoff state | live player-agent controller | current local player, agent-owned slot, turn handoff readiness, approval token state, can-act evidence, and blocker summary | do not treat autoplay debug control as the product path; do not act for non-agent human turns |
| Semantic CLI player-agent view | local player-agent API | game state, blockers, decisions, action results, safe/unsafe next steps, and postcondition classifications | do not dump raw session, closeout, command, or proof JSON as normal play output |
| Strategy/intelligence ingestion | AI-intelligence database/model layer | stable machine-readable turn state, observations, decisions, action outcomes, playbook/cookbook signals, and proof/telemetry references | do not depend on presentation strings or one-off CLI formatting |
| Debug/internal service output | direct-control service/debug hierarchy | transport/session state, raw probes, route selection, closeout traces, correlation, and diagnostics | do not expose as normal player-agent or strategy-ingestion output |
| Operation/proof telemetry | support proof and future procedure middleware | evidence class, approval, validation, send, postcondition, blocker deltas, and runtime observation links | do not claim live/runtime proof from local tests or target-thread evidence alone |
| Effect/oRPC procedure cores | external direct-control boundary | typed atoms, schemas, context, middleware, approval gates, errors, correlation IDs, and telemetry hooks | do not implement transport-first raw command tunneling |

Future atom and envelope rows classify `playerScope`, `consumerClass`,
`evidenceClass`, `procedureCandidate`, `normalCliProjection`, and
`debugServiceProjection` before runtime-status extraction, CLI hierarchy work,
telemetry, AI ingestion, or Effect/oRPC procedure cores depend on them.

The row-level matrix lives in `workstream/compatibility-matrix.md`. Its current
rows materialize the gate for hotseat handoff state, semantic CLI player-agent
view, strategy/intelligence ingestion, debug/internal service output,
operation/proof telemetry, and Effect/oRPC procedure cores. Rows with
`acceptanceStatus: pending-*` remain blocking; the matrix is accepted only when
all required fields have real source owners, proof owners, schemas/tests, and
stop conditions recorded.

Compatibility matrix execution gate:

- Matrix rows are not accepted until each row has all required fields:
  `foundationThread`, `modelThread`, `dependencyDirection`, `surface`,
  `primaryConsumer`, `sourceOwner`, `proofOwner`, `playerScope`,
  `consumerClass`, `evidenceClass`, `procedureCandidate`,
  `normalCliProjection`, `debugServiceProjection`, `proofLabel`,
  `acceptanceStatus`, `blockingDependents`, and `stopCondition`.
- Before any slice touches command hierarchy, semantic envelopes, telemetry,
  schema/type ownership, runtime-status projection, debug/internal service
  output, AI data artifacts, Effect/Bun resource or stream handling, or oRPC
  procedure cores, the touched atom or envelope must classify `playerScope`,
  `consumerClass`, `evidenceClass`, `procedureCandidate`,
  `normalCliProjection`, and `debugServiceProjection` against both live hotseat
  player-agent control and AI-intelligence strategy ingestion.
- Normal CLI play output must remain a semantic player-agent surface over
  direct-control atoms: game state, blockers, decisions, action results,
  next-step affordances, and explicit stale/unknown/postcondition
  classifications. It must not become raw transport/session/proof JSON.
- AI-intelligence ingestion must consume stable machine-readable state, action,
  and proof records, not CLI presentation strings or raw `game exec` command
  strings.
- Debug/internal service output may expose raw probes, transport/session state,
  correlation ids, route selection, closeout traces, and proof details only when
  explicitly classified as debug/internal service projection.
- Effect/Bun and Effect/oRPC must compose over stable direct-control atoms,
  typed schemas, context, approval policy, correlation, errors, telemetry hooks,
  and resource/concurrency primitives where appropriate. They must not start as
  transport-first raw command tunneling.
- Procedure-core schema work must explicitly evaluate TypeBox versus Effect
  Schema before adding or rewriting direct-control contracts. That disposition
  must consider encode/decode affordances, typed errors, oRPC compatibility,
  test ergonomics, existing TypeBox coverage, runtime validation behavior,
  duplication cost, migration blast radius, and whether one schema technology
  can safely own internal service contracts plus AI/CLI semantic projections.
- The hotseat/autoplay foundation is the dependency base for the AI-intelligence
  model. Product control assumes one Civ7 client, human and agent civs as
  hotseat human slots, mutation only when `GameContext.localPlayerID` is an
  agent-owned current slot, mutation refusal on human turns, intentional human
  waiting during agent turns, and clean UI restoration. Autoplay/Automation is
  support/debug infrastructure because it is global/input-suppressing; it is
  not the primary external-agent executor.
- Direct-control remains the only live action authority. Raw `game exec`,
  companion-owned `sendRequest`, raw SQL, and runtime catalog reflection are
  debug/probe surfaces, not product APIs.
- Corpus/model ingestion is prospective and source-labeled. Existing saves,
  logs, and debug databases may enrich and score records, but they do not
  replace direct-control traces and must not be treated as complete action
  diaries.

Allowed proof labels:

- `target-thread-evidence-ai-model`
- `target-thread-evidence-hotseat-foundation`
- `compatibility-matrix-accepted`
- `planning-evidence-only`
- `pending-hotseat-runtime-proof`
- `pending-ai-ingestion-contract`
- `pending-cli-semantic-envelope`
- `pending-telemetry-contract`
- `pending-procedure-core-schema`
- `local-package-source-relocation-only`

Compatibility stop conditions:

- Stop if compatibility work is not handed through AI-intelligence model thread
  `019e8b5a-f2ee-7ea2-96bc-8c07dc5ab6cc` with hotseat/autoplay foundation
  thread `019e86b7-b08b-72f3-8341-6c78a1285c93` recorded as the dependency
  base.
- Stop if dependent CLI semantic, telemetry, AI-ingestion, runtime-status,
  schema/type, debug/internal service, Effect/Bun, or oRPC procedure-core
  implementation starts before Task 2.9 matrix-row acceptance.
- Stop if a row says "support both" without separating normal CLI,
  debug/internal service output, AI ingestion, telemetry, and procedure-core
  consumers.
- Stop if target-thread evidence, peer reports, repo docs, local tests,
  logs/database artifacts, official resources, live runtime proof, or in-game
  observations are collapsed into one proof claim.
- Stop if Autoplay becomes the primary external-agent product path.
- Stop if direct-control can act on non-agent human turns.
- Stop if AI consumers depend on CLI presentation strings, raw JavaScript
  command strings, vague `verified: true`, raw SQL, runtime reflection, or a
  companion/App UI mutation surface instead of explicit outcome evidence over
  direct-control atoms.

Proof classes must stay separate: target-thread evidence, repo docs, local
tests, logs/database artifacts, official resources, live runtime proof, and
in-game observations each prove different claims. A later full in-game
controller can reduce repeated transport verification only by moving proof to
lifecycle certification, method allowlists, local-player identity, approval
tokens, and semantic outcome checks; it does not remove proof.

### Lane H: Review / Gate Lane

Write set:

- review-disposition ledgers and acceptance packets

Responsibilities:

- audit authority, proof, ownership, and relationship-label invariants;
- independently rerun required gates before accepting closures;
- nudge before bad commits, not after.

## Sequencing

1. Import systematic skill and open this OpenSpec change.
   - Done in two Graphite layers:
     `0abccba10 docs(skills): add systematic workstream skill` and
     `66f9af202 docs(skills): apply systematic workstream review fixes`.
2. Fill CLI and direct-control corpus ledgers from current disk.
3. Define shared fixture strategy before extracting more notification/priorities
   suites.
4. Complete remaining CLI test ownership slices:
   - exact notification dismissal;
   - notification HUD materialization;
   - priorities compact projection;
   - any residual monolith fixture ownership.
5. Only after focused tests own behavior, extract direct-control atoms:
   - notification materialization;
   - notification dismissal verification;
   - ready views;
   - operation validation/send/postconditions;
   - read-only tactical/progression/destination surfaces;
   - schemas/types/constants.
6. Define hotseat/autoplay and AI-intelligence compatibility requirements over
   direct-control atoms before command hierarchy, telemetry, or procedure-core
   implementation begins.
7. Define CLI semantic player-agent envelopes and debug-only diagnostic
   boundaries before changing the command hierarchy.
8. Plan the Effect/Bun implementation model for direct-control atoms,
   procedure cores, and tests before source rewrites depend on Effect
   affordances.
9. Explicitly cite the oRPC architecture skill/source authority from the
   relevant stack branches. Current authority is
   `civ7-orpc-control-architecture` from
   `codex/civ7-orpc-control-architecture-skill`: oRPC is typed
   procedure/router/context/middleware composition over repo-owned
   direct-control atoms, not raw command tunneling, caller-owned socket state,
   or transport-first architecture. This citation does not import or accept
   tracked procedure-core source.
10. Add Effect/oRPC procedure cores over stable atoms.

The oRPC lane is therefore planning-only here after authority citation, and it
remains downstream of direct-control atoms, Task 2.9.4 matrix-row acceptance,
schema/type ownership, telemetry/proof vocabulary, and semantic/debug consumer
classification.

## Proof Boundaries

- Test-only extraction proves local CLI test ownership, not runtime behavior.
- Direct-control source movement proves no behavior change only when direct
  package tests/check/build and focused CLI tests pass.
- Mutation-facing runtime behavior requires support-owned real-game proof when
  Civ7 is responsive, or explicit `pending-runtime-proof`.
- OpenSpec validation proves artifact shape only.

## Review Lanes Required

- Architecture review for package/module ownership and forbidden owners.
- Product/proof review for player-unblocking behavior and proof labels.
- Verification review for tests, filters, ownership scans, and runtime proof.
- Relationship-label review for every tactical/diplomatic/notification surface
  that could imply hostility, war, opponent, ally, or suzerain.
