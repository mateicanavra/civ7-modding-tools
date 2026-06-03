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
- [ ] 4.6 Extract operation validation/send/postcondition atoms.
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
- [ ] 4.9 Import or explicitly cite oRPC architecture authority before any
      oRPC implementation; current support branch has no tracked
      `.agents/skills/civ7-orpc-control-architecture` or
      `packages/civ7-control-orpc` source.
- [ ] 4.10 Classify direct-control service outputs by consumer before command
      hierarchy rewrites: internal service machinery, debug-only diagnostics,
      or semantic player-agent output.
  - [x] 4.10.1 Extract tuner frame encode/parse owner module behind the
        existing package facade.
- [ ] 4.11 Extract map/visibility/GameInfo read atoms.
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
        `waitForFreshLogMarkers` behavior, and leaving capability catalog,
        operation/proof telemetry, hotseat runtime proof, AI ingestion, CLI
        semantic projection, and Effect/oRPC procedure-core work pending.
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
