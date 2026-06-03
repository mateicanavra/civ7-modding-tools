## 1. Workstream Setup

- [x] 1.1 Import `civ7-systematic-workstream` into the support stack.
- [x] 1.2 Apply systematic skill review fixes from
      `codex/systematic-skill-review-fixes`.
- [x] 1.3 Validate this OpenSpec change in strict mode.
- [x] 1.4 Fill `workstream/workstream-record.md` from current branch, stack,
      stashes, and proof state.
- [ ] 1.5 Fill `workstream/cli-play-corpus.md` with every play command/test
      owner row.
- [x] 1.6 Fill `workstream/direct-control-atom-corpus.md` with every direct
      control atom candidate.
- [x] 1.7 Record reviewer/agent findings in
      `workstream/review-disposition-ledger.md`.

## 2. Parallel Planning Gates

- [x] 2.1 Collect CLI topology inventory from a peer agent.
- [x] 2.2 Collect direct-control atom inventory from a peer agent.
- [x] 2.3 Collect OpenSpec/parallelization review from a peer agent.
- [x] 2.4 Reconcile peer findings into corpus ledgers and task sequence.
- [x] 2.5 Define shared fixture strategy before further notification/priorities
      extraction.
- [x] 2.6 Assign one owner at a time for `package.json` play-script wiring and
      `packages/cli/test/commands/game.play.test.ts`.
  - Exact dismiss-notification slice owner: support workstream owner/DRA.
  - Notification HUD slice owner for `package.json` and
    `packages/cli/test/commands/game.play.test.ts`: support workstream
    owner/DRA. Parallel HUD agent owned only net-new
    `game/play/notification/hud.test.ts` preparation in an isolated worktree.
  - Priorities slice owner for `package.json` and
    `packages/cli/test/commands/game.play.test.ts`: support workstream
    owner/DRA. Parallel priorities agent owned only net-new
    `game/play/priorities.test.ts` preparation in an isolated worktree.
    Future slices must record their own single writer before touching either
    file.
- [x] 2.7 Apply the agent framing protocol to any new or reused delegation:
      framing-design context, required skills, objective, reasoning level,
      write-set policy, `/goal` prefix for long-running work, and
      `/compact` before reused-thread topic switches.
  - HUD implementation lane used a fresh `/goal` thread with explicit context,
    skills, objective, hard core, exterior, falsifier, write set, and return
    shape.
  - Priorities implementation lane used a fresh `/goal` thread with explicit
    context, skills, objective, hard core, exterior, falsifier, write set, and
    return shape.
  - Direct-control session/framing test lane used a fresh `/goal` worktree
    thread with explicit context, skills, objective, hard core, exterior,
    falsifier, write set, and return shape. The DRA passively inspected the
    worktree candidate instead of prompting the agent for status.
  - Direct-control ready-unit and ready-city test lanes used separate fresh
    `/goal` worktree threads with disjoint one-file write sets. The DRA
    passively inspected disk candidates and retained broad-suite/docs/commit
    ownership.
  - Direct-control play-notification-view and notification-dismissal test lanes
    used separate fresh `/goal` worktree threads with disjoint one-file write
    sets. The DRA passively inspected disk candidates and retained
    broad-suite/docs/commit ownership.
- [x] 2.8 Read and disposition the report-only hotseat/autoplay,
      AI-intelligence, and synthesis peer waves before treating the
      compatibility planning lane as closed.
  - Direct local reads of the target AI-intelligence thread
    `019e8b5a-f2ee-7ea2-96bc-8c07dc5ab6cc` and hotseat/autoplay foundation
    thread `019e86b7-b08b-72f3-8341-6c78a1285c93` are now dispositioned as
    planning evidence. They replace the earlier direct-read access gap but do
    not close runtime proof, AI ingestion, telemetry, CLI semantic envelope, or
    procedure-core implementation work.
  - Accepted from direct local reads of the completed peer report:
    `019e8cbe-b9a2-7603-8fc6-ea9387fbbd3b` for AI-intelligence model
    implications from thread `019e8b5a-f2ee-7ea2-96bc-8c07dc5ab6cc`.
  - Accepted from direct local reads of the completed peer report:
    `019e8cbf-0138-75d1-9edc-0bda7d413dff` for hotseat/autoplay base
    requirements from thread `019e86b7-b08b-72f3-8341-6c78a1285c93`.
  - Accepted from direct local reads of the completed peer report:
    `019e8cbf-5805-7393-82e8-c83353aeac40` for synthesis mapping both target
    threads onto this support OpenSpec.
- [ ] 2.9 Define and accept the hotseat/autoplay and AI-intelligence
      compatibility matrix:
      semantic game state, decisions, blockers, action results, next-step
      affordances, debug/internal service outputs, operation/proof telemetry,
      and future procedure-core schema needs.
  - [x] 2.9.1 Record the matrix schema and execution gate in `design.md`.
        Hotseat handoff state, semantic CLI player-agent view,
        strategy/intelligence machine ingestion, debug/internal service output,
        operation/proof telemetry, and Effect/oRPC procedure cores must stay
        separate while composing over the same direct-control atom substrate.
  - [x] 2.9.2 Record proof labels and stop conditions for the AI-on-hotseat
        compatibility gate.
  - [x] 2.9.3 Read and disposition report-only peer reviews
        `019e8d01-441f-79d1-afd7-fe40a3c179e6`,
        `019e8d01-4382-7da3-bb81-2f322ed739e2`, and
        `019e8d01-3fc8-74d2-9658-451d3b0e38f8`.
  - [ ] 2.9.4 Accept the matrix rows. Acceptance requires every row to include
        `foundationThread`, `modelThread`, `dependencyDirection`, `surface`,
        `primaryConsumer`, `sourceOwner`, `proofOwner`, `playerScope`,
        `consumerClass`, `evidenceClass`, `procedureCandidate`,
        `normalCliProjection`, `debugServiceProjection`, `proofLabel`,
        `acceptanceStatus`, `blockingDependents`, and `stopCondition`.
        Draft rows are materialized in `workstream/compatibility-matrix.md`,
        but this task remains open until every row is honestly accepted with
        real source owners, proof owners, schemas/tests, and stop conditions.
  - Compatibility proof classes must remain separate: target-thread evidence,
    repo docs, local tests, logs/database artifacts, official resources, live
    runtime proof, and in-game observations.
  - Future atom/semantic rows should add or classify `playerScope`,
    `consumerClass`, `evidenceClass`, `procedureCandidate`, and
    `normalCliProjection` / `debugServiceProjection` before command hierarchy,
    telemetry, AI-ingestion, runtime-status, or procedure-core work depends on
    them.
  - Matrix schema/gate definition does not close matrix-row acceptance,
    hotseat runtime proof, AI data-ingestion design, telemetry source work, CLI
    semantic-surface implementation, or Effect/oRPC procedure-core
    implementation.
- [ ] 2.10 Keep intelligence-layer code, transport-first oRPC, and live-game
      proof claims out of the compatibility planning branch until source/proof
      owners are assigned.
  - The report-disposition blocker is closed by 2.8 and gate mechanics are
    recorded under 2.9; matrix-row acceptance and source/proof owners for
    hotseat runtime, AI data ingestion, telemetry, CLI semantic output, and
    Effect/oRPC procedures are still unassigned.

Implementation tasks in sections 3-5 are blocked until the relevant corpus rows
name the exact write set, fixture owner, validation commands,
duplicate/removal boundary, and proof class. For `package.json` and
`packages/cli/test/commands/game.play.test.ts`, the workstream owner must record
the active single writer before delegation.

## 3. CLI Play Test Ownership Lane

Rows 3.1-3.11 are baseline evidence from already-landed test-only Graphite
slices. They do not prove this OpenSpec change is complete and do not authorize
runtime/direct-control claims.

- [x] 3.1 Extract tactical-read play tests.
- [x] 3.2 Extract watch play tests.
- [x] 3.3 Extract topics play tests.
- [x] 3.4 Extract promotion-readiness play tests.
- [x] 3.5 Extract rehydrate play tests.
- [x] 3.6 Extract settlement-recommendations play tests.
- [x] 3.7 Extract ready-city play tests.
- [x] 3.8 Extract unit-move-preview play tests.
- [x] 3.9 Extract ready-unit play tests.
- [x] 3.10 Extract notification-queue play tests.
- [x] 3.11 Extract dismiss-notification-queue play tests.
- [x] 3.12 Extract exact dismiss-notification play tests.
- [x] 3.13 Extract notification HUD materialization play tests.
- [x] 3.14 Extract priorities play tests.
- [x] 3.15 Remove residual monolith fixture ownership after the last consumer
      moves.

## 4. Direct-Control Atom Lane

- [x] 4.1 Define direct-control module boundaries and forbidden owners.
- [x] 4.2 Add or relocate focused direct-control package tests for each atom.
  - [x] 4.2.1 Add public API/primitives package test coverage.
  - [x] 4.2.2 Add session/framing package test coverage.
  - [x] 4.2.3 Add unit move preview package test coverage.
  - [x] 4.2.4 Add ready unit/city package test coverage.
  - [x] 4.2.5 Add notification view/dismissal package test coverage.
  - [x] 4.2.6 Add operation/postcondition package test coverage.
    - [x] 4.2.6a Add unit-operation and production-choice package test
          coverage.
    - [x] 4.2.6b Add unit-target action package test coverage.
    - [x] 4.2.6c Add technology/culture chooser closeout package test
          coverage.
    - [x] 4.2.6d Add diplomacy-response and narrative-choice package test
          coverage.
  - [x] 4.2.7 Add map, visibility, reveal, and GameInfo package test coverage.
  - [x] 4.2.8 Add settlement, progression, and tactical read package test
        coverage.
  - [x] 4.2.9 Add setup/lifecycle package test coverage.
  - [x] 4.2.10 Add autoplay and turn-completion package test coverage.
  - [x] 4.2.11 Add runtime inspection and catalog/proof package test coverage.
  - [x] 4.2.12 Add restart/begin lifecycle package test coverage.
  - [ ] 4.2.13 Add full-grid map identity and resource/feature builder
    readback edge coverage to owning package suites before source extraction.
- [ ] 4.3 Extract notification view/materialization atom.
  - [x] 4.3.1 Extract notification view/materialization embedded source owner
        while keeping the public wrapper in the facade.
  - [x] 4.3.2 Extract notification view wrapper owner while keeping the public
        facade export surface in `index.ts`.
- [x] 4.4 Extract notification dismissal/verification atom.
  - [x] 4.4.1 Extract notification dismissal embedded source owner while
        keeping wrapper-level polling and verification helpers in the facade.
  - [x] 4.4.2 Extract notification dismissal verification helper owner while
        keeping the public wrapper in the facade.
  - [x] 4.4.3 Extract notification dismissal wrapper owner while keeping the
        public facade export surface in `index.ts`.
  - [x] 4.4.4 Extract notification dismissal command builder owner while
        keeping the public facade export surface in `index.ts`, preserving
        guarded read/send dismissal command serialization, final identity-based
        verification, focused package/CLI notification dismissal proof, and
        leaving runtime/live-game proof, telemetry, AI ingestion, semantic CLI
        projection, Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row
        acceptance pending.
- [x] 4.5 Extract ready unit/city view atoms.
  - [x] 4.5.1 Extract unit move preview embedded source owner while keeping
        the public wrapper in the facade.
  - [x] 4.5.2 Extract ready-unit embedded source owner while keeping the public
        wrapper in the facade.
  - [x] 4.5.3 Extract ready-city embedded source owner while keeping the public
        wrapper in the facade.
  - [x] 4.5.4 Extract unit move preview wrapper owner while keeping the public
        facade export surface in `index.ts`.
  - [x] 4.5.5 Extract ready-unit wrapper owner while keeping the public facade
        export surface in `index.ts`.
  - [x] 4.5.6 Extract ready-city wrapper owner while keeping the public facade
        export surface in `index.ts`.
- [x] 4.6 Extract operation validation/send/postcondition atoms.
  - [x] 4.6.1 Extract operation router embedded validation/send source owner
        while keeping wrapper-level postconditions and specialized closeouts in
        the facade.
  - [x] 4.6.2 Extract technology and culture chooser closeout embedded source
        owners while keeping public wrappers in the facade.
  - [x] 4.6.3 Extract production-choice embedded source owner while keeping
        the public wrapper/build command and production postcondition helpers
        in the facade.
  - [x] 4.6.4 Extract unit-operation postcondition helper owner while keeping
        population, production, and wrapper-level request composition in the
        facade.
  - [x] 4.6.5 Extract population-placement postcondition helper owner while
        keeping production and wrapper-level request composition in the facade.
  - [x] 4.6.6 Extract production postcondition helper owner while keeping
        wrapper-level request composition in the facade.
  - [x] 4.6.7 Extract narrative choice verification helper owner while keeping
        the embedded source and public wrapper in the facade.
  - [x] 4.6.8 Extract diplomacy response verification helper owner while
        keeping the embedded source and public wrapper in the facade.
  - [x] 4.6.9 Extract diplomacy response wrapper owner while keeping the
        public facade export surface in `index.ts`.
  - [x] 4.6.10 Extract narrative choice wrapper owner while keeping the
        public facade export surface and embedded source/build command in
        `index.ts`.
  - [ ] 4.6.11 Extract narrative choice embedded source/build command owner
        after naming the stable operation source module and preserving current
        panel closeout, validation, and postcondition coverage.
  - [x] 4.6.12 Extract unit-target action source and wrapper owner while
        keeping the public facade export surface in `index.ts`.
  - [x] 4.6.12 Extract production-choice wrapper owner while keeping the public
        facade export surface in `index.ts`, preserving approval-first BUILD
        request orchestration, cityId and production-args validation,
        validator-first behavior, read-only status payload for invalid
        pre-validation, bounded post-send polling, production postcondition
        classification, and package/CLI production proof, and leaving generic
        operation wrappers, telemetry, AI ingestion, semantic CLI projection,
        Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance
        pending.
  - [x] 4.6.13 Extract generic operation validation/request wrapper owner while
        keeping the public facade export surface in `index.ts`, preserving
        unit/city/player operation and command validation, approval-first send
        behavior, validator-first requests, operation router source routing,
        unit/population/production postcondition classification, and package
        proof for unit operations and population placement, and leaving
        telemetry, AI ingestion, semantic CLI projection, Effect/oRPC
        procedure-core work, and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.6.14 Extract diplomacy response closeout source owner while keeping
        the public facade export surface in `index.ts`, preserving App UI
        response-panel closeout source text, optional notification activation,
        RESPOND_DIPLOMATIC_ACTION send behavior, UI closeout calls, focused
        diplomacy package/CLI proof, and leaving runtime/live-game proof,
        telemetry, AI ingestion, semantic CLI projection, Effect/oRPC
        procedure-core work, and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.6.15 Extract narrative choice source owner while keeping the public
        facade export surface in `index.ts`, preserving App UI narrative
        choice source text, CHOOSE_NARRATIVE_STORY_DIRECTION send behavior,
        narrative popup/panel closeout calls, focused narrative package/CLI
        proof, and leaving runtime/live-game proof, telemetry, AI ingestion,
        semantic CLI projection, Effect/oRPC procedure-core work, and Task
        2.9.4 matrix-row acceptance pending.
  - [x] 4.6.16 Extract technology choice closeout command builder owner while
        keeping the public facade wrapper in `index.ts`, preserving App UI
        technology closeout command serialization, optional notification
        activation, SET_TECH_TREE_NODE / SET_TECH_TREE_TARGET_NODE send
        behavior, focused technology package/CLI proof, and leaving
        runtime/live-game proof, telemetry, AI ingestion, semantic CLI
        projection, Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row
        acceptance pending.
  - [x] 4.6.17 Extract culture choice closeout command builder owner while
        keeping the public facade wrapper in `index.ts`, preserving App UI
        culture closeout command serialization, optional notification
        activation, SET_CULTURE_TREE_NODE / SET_CULTURE_TREE_TARGET_NODE send
        behavior, focused culture package/CLI proof, and leaving
        runtime/live-game proof, telemetry, AI ingestion, semantic CLI
        projection, Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row
        acceptance pending.
  - [x] 4.6.18 Prune stale facade-local postcondition comparison helpers after
        unit/population/production/narrative/diplomacy/unit-target owners
        moved, preserving remaining facade serializer/probe-value/probe-helper
        injection, package/CLI proof, and leaving shared serializer/type ownership,
        runtime/live-game proof, telemetry, AI ingestion, semantic CLI
        projection, Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row
        acceptance pending.
- [x] 4.7 Extract settlement/tactical/progression read atoms.
  - [x] 4.7.1 Extract settlement recommendation embedded source owner while
        keeping the public wrapper in the facade.
  - [x] 4.7.2 Extract traditions view embedded source owner while keeping the
        public wrapper in the facade.
  - [x] 4.7.3 Extract progress dashboard embedded source owner while keeping
        the public wrapper in the facade.
  - [x] 4.7.4 Extract target-candidates embedded source owner while keeping the
        public wrapper in the facade.
  - [x] 4.7.5 Extract battlefield scan embedded source owner while keeping the
        public wrapper in the facade.
  - [x] 4.7.6 Extract destination analysis embedded source owner while keeping
        the public wrapper in the facade.
  - [x] 4.7.7 Extract progression read wrapper owner while keeping the public
        facade export surface in `index.ts`.
  - [x] 4.7.8 Extract settlement recommendation wrapper owner while keeping the
        public facade export surface in `index.ts`.
  - [x] 4.7.9 Extract target-candidates wrapper owner while keeping the public
        facade export surface in `index.ts`.
  - [x] 4.7.10 Extract battlefield scan wrapper owner while keeping the public
        facade export surface in `index.ts`.
  - [x] 4.7.11 Extract destination analysis wrapper owner while keeping the
        public facade export surface in `index.ts`.
- [ ] 4.8 Export stable types/constants only after module owners are defined.
  - [x] 4.8.1 Extract ComponentID primitive and direct-control error owner
        modules behind the existing package facade.
  - [x] 4.8.2 Extract setup/lifecycle command and setup-parameter constants
        owner while keeping public facade re-exports in `index.ts`, preserving
        command strings, UI loading-state values, setup parameter IDs, and
        leaving broader public constants/types, procedure schemas,
        operation/proof telemetry, hotseat runtime proof, AI ingestion, CLI
        semantic projection, Effect/oRPC procedure-core work, and Task 2.9.4
        matrix-row acceptance pending.
  - [x] 4.8.3 Extract session endpoint/state constants owner while keeping
        public facade re-exports in `index.ts`, preserving default host, port,
        timeout, App UI/Tuner state names, session config behavior, and leaving
        broader session/config/socket extraction, public constants/types,
        procedure schemas, operation/proof telemetry, hotseat runtime proof, AI
        ingestion, CLI semantic projection, Effect/oRPC procedure-core work,
        and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.8.4 Extract map/GameInfo constants owner while keeping public facade
        re-exports in `index.ts`, preserving GameInfo table defaults, map grid
        bounds, GameInfo row bounds, map/GameInfo wrapper behavior, and leaving
        broader public constants/types, procedure schemas, operation/proof
        telemetry, hotseat runtime proof, AI ingestion, CLI semantic projection,
        Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance
        pending.
  - [x] 4.8.5 Extract capability catalog root constants owner while keeping
        public facade re-exports in `index.ts`, preserving App UI/Tuner
        capability root defaults, static/runtime catalog behavior, and leaving
        broader public constants/types, procedure schemas, operation/proof
        telemetry, hotseat runtime proof, AI ingestion, CLI semantic projection,
        Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance
        pending.
  - [x] 4.8.6 Extract autoplay default constants owner while keeping public
        facade re-exports in `index.ts`, preserving autoplay wrapper defaults
        and leaving broader public constants/types, procedure schemas,
        operation/proof telemetry, hotseat runtime proof, AI ingestion, CLI
        semantic projection, Effect/oRPC procedure-core work, and Task 2.9.4
        matrix-row acceptance pending.
  - [x] 4.8.7 Extract unit-target verification timing constants owner while
        keeping public facade re-exports in `index.ts`, preserving bounded
        post-send polling defaults and leaving broader public constants/types,
        procedure schemas, operation/proof telemetry, hotseat runtime proof, AI
        ingestion, CLI semantic projection, Effect/oRPC procedure-core work,
        and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.8.8 Extract default scripting-log path constant owner while keeping
        public facade re-exports in `index.ts`, preserving proof/log helper path
        construction and leaving broader public constants/types, operation/proof
        telemetry, hotseat runtime proof, AI ingestion, CLI semantic projection,
        Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance
        pending.
  - [x] 4.8.9 Extract session endpoint/state/command-result type owner while
        keeping public facade type re-exports in `index.ts`, preserving tuner
        state selection, direct-control endpoint/options, and command-result
        public contracts while leaving broader public result/input types,
        procedure schemas, operation/proof telemetry, hotseat runtime proof, AI
        ingestion, CLI semantic projection, Effect/oRPC procedure-core work,
        and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.8.10 Extract runtime inspection/snapshot/status type owners into the
        existing runtime atom modules while keeping public facade type
        re-exports in `index.ts`, preserving runtime probe/result/input public
        contracts and leaving broader public result/input types, procedure
        schemas, operation/proof telemetry, hotseat runtime proof, AI
        ingestion, CLI semantic projection, Effect/oRPC procedure-core work,
        and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.8.11 Extract map primitive type owner while keeping public facade
        type re-exports in `index.ts`, preserving map location, map bounds, and
        hidden-info policy public contracts while leaving broader map/result
        types, procedure schemas, operation/proof telemetry, hotseat runtime
        proof, AI ingestion, CLI semantic projection, Effect/oRPC
        procedure-core work, and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.8.12 Extract map read type owner while keeping public facade type
        re-exports in `index.ts`, preserving map summary, plot snapshot, map
        grid input/result, and full-map-grid chunk/input/result public
        contracts while leaving visibility, GameInfo, summary, setup,
        tactical, operation, and ready result types, procedure schemas,
        operation/proof telemetry, hotseat runtime proof, AI ingestion, CLI
        semantic projection, Effect/oRPC procedure-core work, and Task 2.9.4
        matrix-row acceptance pending.
  - [x] 4.8.13 Extract summary read type owner while keeping public facade type
        re-exports in `index.ts`, preserving player/unit/city summary
        input/result public contracts while leaving visibility, GameInfo,
        setup, tactical, operation, and ready result types, procedure schemas,
        operation/proof telemetry, hotseat runtime proof, AI ingestion, CLI
        semantic projection, Effect/oRPC procedure-core work, and Task 2.9.4
        matrix-row acceptance pending.
  - [x] 4.8.14 Extract GameInfo row type owner while keeping public facade type
        re-exports in `index.ts`, preserving GameInfo row input/result public
        contracts while leaving visibility, setup, tactical, operation, and
        ready result types, procedure schemas, operation/proof telemetry,
        hotseat runtime proof, AI ingestion, CLI semantic projection,
        Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance
        pending.
  - [x] 4.8.15 Extract visibility/reveal type owner while keeping public facade
        type re-exports in `index.ts`, preserving visibility summary and reveal
        map result public contracts while leaving setup, tactical, operation,
        and ready result types, procedure schemas, operation/proof telemetry,
        hotseat runtime proof, AI ingestion, CLI semantic projection,
        Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance
        pending.
  - [x] 4.8.16 Extract setup read type owner while keeping public facade type
        re-exports in `index.ts`, preserving setup snapshot/map-row read and
        setup map-row visibility result public contracts while leaving setup
        prepare/start/run lifecycle input/result types, tactical, operation,
        and ready result types, procedure schemas, operation/proof telemetry,
        hotseat runtime proof, AI ingestion, CLI semantic projection,
        Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance
        pending.
  - [x] 4.8.17 Extract setup lifecycle type owners while keeping public facade
        type re-exports in `index.ts`, preserving prepare/start/run
        input/result public contracts while leaving tactical, operation, and
        ready result types, procedure schemas, operation/proof telemetry,
        hotseat runtime proof, AI ingestion, CLI semantic projection,
        Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance
        pending.
  - [x] 4.8.18 Extract autoplay and turn-completion type owners while keeping
        public facade type re-exports in `index.ts`, preserving autoplay
        status/options/action and turn-completion status/action public
        contracts while leaving tactical, operation, and ready result types,
        procedure schemas, operation/proof telemetry, hotseat runtime proof, AI
        ingestion, CLI semantic projection, Effect/oRPC procedure-core work,
        and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.8.19 Extract notification view/dismissal type owners while keeping
        public facade type re-exports in `index.ts`, preserving notification
        view, decision hint/queue, dismissal input/summary/result public
        contracts while leaving diplomacy/narrative/progression closeout,
        tactical, operation, and ready result types, procedure schemas,
        operation/proof telemetry, hotseat runtime proof, AI ingestion, CLI
        semantic projection, Effect/oRPC procedure-core work, and Task 2.9.4
        matrix-row acceptance pending.
  - [x] 4.8.20 Extract progression read type owner while keeping public facade
        type re-exports in `index.ts`, preserving traditions view and progress
        dashboard input/result/action public contracts while leaving
        diplomacy/narrative closeout, tactical, operation, and ready result
        types, procedure schemas, operation/proof telemetry, hotseat runtime
        proof, AI ingestion, CLI semantic projection, Effect/oRPC
        procedure-core work, and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.8.21 Extract tactical read type owners while keeping public facade
        type re-exports in `index.ts`, preserving settlement recommendation,
        target-candidates, battlefield scan, and destination analysis public
        contracts and conservative relationship-label policy while leaving
        diplomacy/narrative closeout, operation, and ready result types,
        procedure schemas, operation/proof telemetry, hotseat runtime proof, AI
        ingestion, CLI semantic projection, Effect/oRPC procedure-core work,
        and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.8.22 Extract ready read type owners while keeping public facade type
        re-exports in `index.ts`, preserving ready-unit, unit-move-preview, and
        ready-city public contracts and conservative relationship-label policy
        while leaving diplomacy/narrative closeout, operation, public procedure
        schemas, operation/proof telemetry, hotseat runtime proof, AI ingestion,
        CLI semantic projection, Effect/oRPC procedure-core work, and Task
        2.9.4 matrix-row acceptance pending.
  - [x] 4.8.23 Extract progression chooser closeout type owners while keeping
        public facade type re-exports in `index.ts`, preserving technology and
        culture closeout input/result contracts while leaving
        diplomacy/narrative closeout, operation, public procedure schemas,
        operation/proof telemetry, hotseat runtime proof, AI ingestion, CLI
        semantic projection, Effect/oRPC procedure-core work, and Task 2.9.4
        matrix-row acceptance pending.
  - [x] 4.8.24 Extract unit-target action type owner while keeping public
        facade type re-exports in `index.ts`, preserving unit-target
        input/candidate/result contracts while leaving generic operation,
        diplomacy/narrative closeout, public procedure schemas,
        operation/proof telemetry, hotseat runtime proof, AI ingestion, CLI
        semantic projection, Effect/oRPC procedure-core work, and Task 2.9.4
        matrix-row acceptance pending.
  - [x] 4.8.25 Extract shared operation primitive and validation type owner
        while keeping public facade type re-exports in `index.ts`, preserving
        operation family/target/input, action approval, and operation
        validation-result public contracts while leaving operation request
        result, postcondition payloads, production choice, diplomacy/narrative
        closeout, public procedure schemas, operation/proof telemetry, hotseat
        runtime proof, AI ingestion, CLI semantic projection, Effect/oRPC
        procedure-core work, and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.8.26 Extract operation request result and postcondition type owners
        while keeping public facade type re-exports in `index.ts`, preserving
        generic operation request result plus unit-operation,
        population-placement, and production postcondition public contracts
        while leaving production choice, diplomacy/narrative closeout, public
        procedure schemas, operation/proof telemetry, hotseat runtime proof, AI
        ingestion, CLI semantic projection, Effect/oRPC procedure-core work,
        and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.8.27 Extract production-choice type owner while keeping public
        facade type re-exports in `index.ts`, preserving production-choice
        input, command payload, and result public contracts while leaving
        diplomacy/narrative closeout, public procedure schemas,
        operation/proof telemetry, hotseat runtime proof, AI ingestion, CLI
        semantic projection, Effect/oRPC procedure-core work, and Task 2.9.4
        matrix-row acceptance pending.
  - [x] 4.8.28 Extract diplomacy-response type owner while keeping public
        facade type re-exports in `index.ts`, preserving diplomacy response
        input, command payload, result, and postcondition public contracts
        while leaving narrative closeout, public procedure schemas,
        operation/proof telemetry, hotseat runtime proof, AI ingestion, CLI
        semantic projection, Effect/oRPC procedure-core work, and Task 2.9.4
        matrix-row acceptance pending.
  - [x] 4.8.29 Extract narrative-choice type owner while keeping public
        facade type re-exports in `index.ts`, preserving narrative choice
        input, command payload, result, and postcondition public contracts
        while leaving public procedure schemas, operation/proof telemetry,
        hotseat runtime proof, AI ingestion, CLI semantic projection,
        Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance
        pending.
  - [x] 4.8.30 Extract capability catalog options type owner while keeping
        public facade type re-exports in `index.ts`, preserving catalog option
        shape and leaving then-remaining facade-owned health result types,
        public procedure schemas, operation/proof telemetry, hotseat runtime
        proof, AI ingestion, CLI semantic projection, Effect/oRPC
        procedure-core work, and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.8.31 Extract restart/begin result type owner while keeping public
        facade type re-exports in `index.ts`, preserving restart/begin result
        shape and leaving then-remaining facade-owned health result types, public
        procedure schemas, operation/proof telemetry, hotseat runtime proof, AI
        ingestion, CLI semantic projection, Effect/oRPC procedure-core work,
        and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.8.32 Extract direct-control health result type owner while keeping
        public facade type re-exports in `index.ts`, preserving health result
        shape and leaving health source/session orchestration, public procedure
        schemas, operation/proof telemetry, hotseat runtime proof, AI
        ingestion, CLI semantic projection, Effect/oRPC procedure-core work,
        and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.8.33 Extract UI loading-state name type owner while keeping public
        facade type re-exports in `index.ts`, preserving the
        `CIV7_UI_LOADING_STATES`-derived alias and leaving setup/lifecycle
        orchestration, public procedure schemas, operation/proof telemetry,
        hotseat runtime proof, AI ingestion, CLI semantic projection,
        Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance
        pending.
- [ ] 4.9 Import or explicitly cite oRPC architecture authority before any
      oRPC implementation; current support branch has no tracked
      `.agents/skills/civ7-orpc-control-architecture` or
      `packages/civ7-control-orpc` source.
- [ ] 4.10 Classify direct-control service outputs by consumer before command
      hierarchy rewrites: internal service machinery, debug-only diagnostics,
      or semantic player-agent output.
  - [x] 4.10.1 Extract tuner frame encode/parse owner module behind the
        existing package facade.
  - [x] 4.10.2 Extract session endpoint/state/options/command-result type owner
        behind the existing package facade, leaving session config/socket,
        lifecycle/reconnect, procedure schemas, telemetry, semantic CLI, AI
        ingestion, hotseat runtime proof, and Effect/oRPC procedure-core work
        pending.
  - [x] 4.10.3 Extract session state-selection helper owner behind the
        existing package facade, preserving role/name/id selection and
        missing-state error classification while leaving session config/socket,
        endpoint discovery, command execution, lifecycle/reconnect, procedure
        schemas, telemetry, semantic CLI, AI ingestion, hotseat runtime proof,
        Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance
        pending.
  - [x] 4.10.4 Extract session direct-control config owner behind the existing
        package facade, preserving host/env ordering, deduplication, port and
        timeout defaults, invalid-port classification, and CLI public resolver
        behavior while leaving endpoint discovery, socket/session lifecycle,
        command execution, lifecycle/reconnect, procedure schemas, telemetry,
        semantic CLI, AI ingestion, hotseat runtime proof, Effect/oRPC
        procedure-core work, and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.10.5 Extract direct-control request-id helper owner behind the
        existing package facade, preserving the existing prefix/date/pid format
        while leaving endpoint discovery, socket/session lifecycle, command
        execution, lifecycle/reconnect, telemetry/correlation contracts,
        procedure schemas, semantic CLI, AI ingestion, hotseat runtime proof,
        Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance
        pending.
  - [x] 4.10.6 Extract endpoint discovery owner behind the existing package
        facade, preserving host/env ordering from config resolution,
        first-reachable-host selection, per-host error details, and
        `all-hosts-unavailable` classification while leaving socket/session
        lifecycle, command execution, lifecycle/reconnect,
        telemetry/correlation contracts, procedure schemas, semantic CLI, AI
        ingestion, hotseat runtime proof, Effect/oRPC procedure-core work, and
        Task 2.9.4 matrix-row acceptance pending.
- [x] 4.11 Extract map/visibility/GameInfo read atoms.
  - [x] 4.11.1 Extract map summary, plot snapshot, and map grid read
        wrapper/source owner while keeping the public facade export surface in
        `index.ts`.
  - [x] 4.11.2 Extract visibility summary read wrapper/source owner while
        keeping the public facade export surface in `index.ts` and leaving
        reveal mutation, GameInfo rows, setup map rows, and player/unit/city
        summaries pending.
  - [x] 4.11.3 Extract GameInfo rows read wrapper/source owner while keeping
        the public facade export surface in `index.ts` and leaving reveal
        mutation, setup map rows, player/unit/city summaries, AI ingestion, and
        static profile shaping pending.
  - [x] 4.11.4 Extract player, unit, and city summary read wrapper/source
        owner with focused package proof while keeping public facade exports in
        `index.ts` and leaving reveal mutation, setup map rows, AI ingestion,
        static profile shaping, semantic CLI, telemetry, hotseat runtime proof,
        and Effect/oRPC procedure-core work pending.
  - [x] 4.11.5 Extract reveal-map mutation wrapper owner while keeping public
        facade exports in `index.ts`, preserving approval-first and
        disposable-session guards, player-id validation, visibility before/after
        reads, `Visibility.revealAllPlots` command text, classification shape,
        and leaving setup map rows to 4.11.6 plus AI ingestion, static profile
        shaping, semantic CLI, telemetry, hotseat runtime proof, and
        Effect/oRPC procedure-core work pending.
  - [x] 4.11.6 Extract setup snapshot and setup map rows read/source owner while
        keeping public facade exports in `index.ts`, preserving setup map script
        validation, `limit` default/bounds, setup-domain/config-db row
        materialization, setup snapshot phase/config shape, and lifecycle helper
        reuse of the same setup source while leaving prepare/start/restart
        lifecycle orchestration, AI ingestion, static profile shaping, semantic
        CLI, telemetry, hotseat runtime proof, and Effect/oRPC procedure-core
        work pending.
- [ ] 4.12 Extract runtime inspection/catalog/proof atoms.
  - [x] 4.12.1 Extract runtime API inspection wrapper/source owner while keeping
        the public facade export surface in `index.ts`, classifying it as
        debug/internal service output with normal CLI projection omitted or
        debug-only and debug service projection as raw diagnostic projection,
        and leaving App UI snapshot, Tuner health, playable status, bounded root
        inspection, capability catalog, telemetry, hotseat runtime proof, AI
        ingestion, CLI semantic projection, and Effect/oRPC procedure-core work
        pending.
  - [x] 4.12.2 Extract App UI snapshot wrapper/source owner while keeping the
        public facade export surface in `index.ts`, leaving lifecycle/setup
        orchestration in the facade while reusing the same internal snapshot
        builder/parser helpers, and leaving Tuner health, playable status,
        bounded root inspection, capability catalog, telemetry, hotseat runtime
        proof, AI ingestion, CLI semantic projection, and Effect/oRPC
        procedure-core work pending.
  - [x] 4.12.3 Extract Tuner health wrapper/source/parser owner while keeping
        public facade call-through and session lifecycle/reconnect execution in
        `index.ts`, preserving the internal wait/setup helper reuse through
        injected session-command execution, and leaving playable status, bounded
        root inspection, capability catalog, telemetry, hotseat runtime proof,
        AI ingestion, CLI semantic projection, and Effect/oRPC procedure-core
        work pending.
  - [x] 4.12.4 Extract proof/log helper owner while keeping the public facade
        export surface in `index.ts`, preserving `snapshotFile` /
        `waitForFreshLogMarkers` behavior and the default scripting-log path,
        and leaving capability catalog, operation/proof telemetry, hotseat
        runtime proof, AI ingestion, CLI semantic projection, and Effect/oRPC
        procedure-core work pending.
  - [x] 4.12.5 Extract capability catalog source owner while keeping public
        facade exports in `index.ts`, injecting runtime root inspection from the
        facade, preserving static/runtime/official-resource catalog behavior,
        and leaving TypeBox schema ownership, operation/proof telemetry,
        hotseat runtime proof, AI ingestion, CLI semantic projection, and
        Effect/oRPC procedure-core work pending.
  - [x] 4.12.6 Extract playable-status composition owner while keeping public
        facade exports in `index.ts`, preserving App UI/Tuner health
        composition, shell/playable/readiness classification, and unready error
        capture, and leaving bounded root inspection, TypeBox schema ownership,
        operation/proof telemetry, hotseat runtime proof, AI ingestion, CLI
        semantic projection, and Effect/oRPC procedure-core work pending.
  - [x] 4.12.7 Extract bounded root inspection owner while keeping public
        facade exports in `index.ts`, preserving root identifier validation,
        bounds, state default, JSON parse label, command serialization, and
        result shape, and leaving TypeBox schema ownership, operation/proof
        telemetry, hotseat runtime proof, AI ingestion, CLI semantic projection,
        Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance
        pending.
  - [x] 4.12.8 Extract capability catalog schema owner while keeping public
        facade exports in `index.ts`, preserving TypeBox catalog entry/catalog
        schema shape and catalog result typing, and leaving broader public
        constants/types, procedure schemas, operation/proof telemetry, hotseat
        runtime proof, AI ingestion, CLI semantic projection, Effect/oRPC
        procedure-core work, and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.12.9 Extract runtime inspection constants owner while keeping public
        facade re-exports in `index.ts`, preserving default App UI/Tuner root
        catalogs and bounded root `maxKeys`/`maxMethods` defaults, and leaving
        broader public constants/types, procedure schemas, operation/proof
        telemetry, hotseat runtime proof, AI ingestion, CLI semantic
        projection, Effect/oRPC procedure-core work, and Task 2.9.4
        matrix-row acceptance pending.
  - [x] 4.12.10 Extract runtime result/input/probe type owners while keeping
        public facade type re-exports in `index.ts`, preserving runtime API
        inspection, bounded root inspection, App UI snapshot, Tuner health,
        playable status, and runtime probe type contracts without moving source
        strings, command execution, lifecycle/session orchestration, procedure
        schemas, telemetry, hotseat runtime proof, AI ingestion, CLI semantic
        projection, Effect/oRPC procedure-core work, or Task 2.9.4
        matrix-row acceptance.
- [x] 4.13 Extract autoplay and turn-completion atoms.
  - [x] 4.13.1 Extract turn-completion wrapper/source owner while keeping public
        facade exports in `index.ts`, preserving approval-first send/unready
        behavior, guard-first status read, stale notification fallback
        classification, command strings, parse label, and action result shape,
        and leaving autoplay source ownership, hotseat runtime proof, AI
        ingestion, CLI semantic projection, telemetry, Effect/oRPC
        procedure-core work, and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.13.2 Extract autoplay status/configure/start/stop source ownership
        while keeping public facade exports in `index.ts`, preserving approval
        gates, bounded turn/player validation, explicit unbounded start
        semantics, stop-settling/pause behavior, command strings, and result
        shapes, and leaving hotseat runtime proof, AI ingestion, CLI semantic
        projection, telemetry, Effect/oRPC procedure-core work, and Task 2.9.4
        matrix-row acceptance pending.
- [x] 4.14 Extract setup/start lifecycle atoms.
  - [x] 4.14.1 Extract setup snapshot and setup map rows read/source owner while
        keeping public facade exports in `index.ts` and leaving
        `ensureCiv7SetupMapRowVisible`, `prepareCiv7SinglePlayerSetup`,
        `startPreparedCiv7SinglePlayerGame`, `runCiv7SinglePlayerFromSetup`,
        restart/begin lifecycle orchestration, no-replay semantics, runtime
        proof, AI ingestion, semantic CLI projection, telemetry, Effect/oRPC
        procedure-core work, and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.14.2 Extract setup map-row visibility refresh owner while keeping
        public facade exports in `index.ts`, preserving approval-first
        exit-to-shell refresh, setup map-row polling, command strings, and
        verified result shape, and leaving `prepareCiv7SinglePlayerSetup`,
        `startPreparedCiv7SinglePlayerGame`, `runCiv7SinglePlayerFromSetup`,
        restart/begin lifecycle orchestration, no-replay semantics, runtime
        proof, AI ingestion, semantic CLI projection, telemetry, Effect/oRPC
        procedure-core work, and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.14.3 Extract single-player setup preparation owner while keeping
        public facade exports in `index.ts`, preserving approval-first setup
        mutation, setup snapshot readback, map-row proof, setup option
        validation, prepare command source, and no-replay-after-socket-close
        proof, and leaving `startPreparedCiv7SinglePlayerGame`,
        `runCiv7SinglePlayerFromSetup`, restart/begin lifecycle orchestration,
        runtime proof, AI ingestion, semantic CLI projection, telemetry,
        Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance
        pending.
  - [x] 4.14.4 Extract prepared single-player start owner while keeping public
        facade exports in `index.ts`, preserving approval-first start,
        pre-start setup readback, host-game command source, begin polling,
        one-attempt begin send, Tuner/map verification, seed mismatch
        classification, and no-replay-after-begin-close package proof, and
        leaving `runCiv7SinglePlayerFromSetup`, restart/begin lifecycle
        orchestration, runtime proof, AI ingestion, semantic CLI projection,
        telemetry, Effect/oRPC procedure-core work, and Task 2.9.4
        matrix-row acceptance pending.
  - [x] 4.14.5 Extract single-player setup run owner while keeping public facade
        exports in `index.ts`, preserving approval-first run orchestration,
        active-game rejection unless `fromRunningGame: "exit-to-shell"` is
        supplied, exit-to-main-menu command routing, shell wait, prepare/start
        composition, verified result shape, and existing no-replay package
        proof, and leaving restart/begin lifecycle orchestration, runtime
        proof, AI ingestion, semantic CLI projection, telemetry, Effect/oRPC
        procedure-core work, and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.14.6 Extract restart/begin lifecycle owner while keeping public facade
        exports in `index.ts`, preserving App UI restart command routing,
        restart-output rejection, begin notification command routing,
        GameStarted polling, one-attempt begin send, optional Tuner readiness
        wait, and restart lifecycle package proof, and leaving runtime proof,
        hotseat runtime proof, AI ingestion, semantic CLI projection,
        telemetry, Effect/oRPC procedure-core work, and Task 2.9.4
        matrix-row acceptance pending.

## 5. CLI Semantic Surface Lane

Rows 5.1-5.7 are blocked on Task 2.9.4 matrix-row acceptance and must not start
until their source owner, proof owner, proof label, normal CLI projection,
debug/internal service projection, and AI-ingestion boundary are recorded.

- [ ] 5.1 Define normal play-command response envelopes from the perspective of
      a player agent.
- [ ] 5.2 Move or reserve transport/session/proof internals for explicit debug
      commands or debug flags.
- [ ] 5.3 Add tests that normal play outputs omit internal direct-control
      plumbing while still preserving actionable state-machine status,
      blockers, and next steps.
- [ ] 5.4 Reduce large CLI JSON outputs by projecting direct-control service
      results into semantic game state, action results, and decision affordances.
- [ ] 5.5 Ensure the semantic envelope model has a machine-ingestion contract for
      the AI-intelligence strategy-data layer that is distinct from normal CLI
      presentation strings and from debug-only raw diagnostics.
- [ ] 5.6 Preserve hotseat handoff semantics in normal play views: current local
      player, agent-owned slot, human-turn exclusion, action eligibility,
      blocker state, and approval-token status.
- [ ] 5.7 Define action audit vocabulary for semantic and machine-ingestion
      outputs: strategy intent, candidate action, operation family, target,
      args, approval, validation result, send result, post-read, correlation id,
      evidence policy, approval reason, `validation_pre`, `send_receipt`,
      `validation_post`, `outcome_delta`, and stale/unknown classification.

## 6. Effect/Bun And Effect/oRPC Composition Lane

Rows 6.1-6.9 are blocked on Task 2.9.4 matrix-row acceptance and must not start
until their procedure candidates, schema owners, proof owners, debug/internal
service projections, telemetry contract boundaries, and external direct-control
authority are recorded.

- [ ] 6.1 Define procedure-core inputs/outputs over direct-control atoms.
- [ ] 6.2 Add TypeBox schema artifacts where procedure surfaces need them.
- [ ] 6.3 Add approval gates, context, correlation IDs, and error shaping.
- [ ] 6.4 Expose transport adapters only after procedure cores are testable.
- [ ] 6.5 Plan Effect `Scope`/resource acquisition, streams/buffers, schedules,
      layers, error modeling, and concurrency usage for direct-control atoms,
      procedure cores, and tests.
- [ ] 6.6 Prefer Bun-native APIs over Node APIs in new/refactored control code
      unless Node is the only practical or clearly better implementation.
- [ ] 6.7 Keep the oclif CLI shell; do not replace it with Effect CLI unless a
      later accepted command-hierarchy spec explicitly authorizes that change.
- [ ] 6.8 Ensure procedure-core schemas compose stable direct-control atoms for
      both live hotseat/autoplay control and AI-intelligence data ingestion
      before exposing transport adapters.
- [ ] 6.9 Keep the in-game App UI companion endpoint subordinate to
      `@civ7/direct-control` with a small versioned JSON-envelope/RPC shape;
      keep oRPC at the external direct-control boundary and raw `game exec` as
      diagnostic/probe substrate only.

## 7. Verification And Closure

- [ ] 7.1 For every test-only slice, run `git diff --check`, focused suite,
      adjacent monolith filter, `bun run check:cli`, `bun run test:cli:play`, and
      ownership scan.
- [ ] 7.2 For every direct-control source slice, run direct-control
      tests/check/build plus focused CLI consumers.
- [ ] 7.3 For every runtime-changing slice, attach real-game proof or explicit
      `pending-runtime-proof`.
- [ ] 7.4 For every CLI semantic-surface slice, prove normal play output omits
      internal service plumbing and that intentional diagnostics are reachable
      only through debug-owned surfaces.
- [ ] 7.5 For every Effect/Bun source slice, prove resource cleanup, stream/error
      behavior, and API choice with focused package tests.
- [ ] 7.6 Run `bun run openspec -- validate civ7-support-direct-control-modularization --strict`.
- [ ] 7.7 Run final downstream realignment and closure checklist.
