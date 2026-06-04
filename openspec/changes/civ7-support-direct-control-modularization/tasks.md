## 1. Workstream Setup

- [x] 1.1 Import `civ7-systematic-workstream` into the support stack.
- [x] 1.2 Apply systematic skill review fixes from
      `codex/systematic-skill-review-fixes`.
- [x] 1.3 Validate this OpenSpec change in strict mode.
- [x] 1.4 Fill `workstream/workstream-record.md` from current branch, stack,
      stashes, and proof state.
- [x] 1.5 Fill `workstream/cli-play-corpus.md` with every play command/test
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
        The matrix also records a row-by-row acceptance backlog; those blockers
        must be cleared per row before any dependent implementation lane can
        consume that row as accepted.
        All six row contract artifacts are now recorded in
        `workstream/compatibility-matrix.md`, but that closes only the
        `contractArtifact` planning sub-gap. Row acceptance still requires
        source/proof/schema owners, tests, and stop-condition coverage.
        A future row acceptance update must include the row acceptance intake
        fields recorded in `workstream/compatibility-matrix.md`: owner
        assignment, write set, contract artifact, proof plan, projection plan,
        stop-condition coverage, downstream unblock, and non-proof claims.
        The debug/internal service output row now has a draft acceptance intake
        with concrete current package/CLI owners and missing proof called out,
        but its `acceptanceStatus` remains `pending-debug-service-boundary`
        until final hierarchy/schema/gate owners, command/flag boundary
        coverage, and normal/debug/AI separation tests are assigned and
        passing. The planning contract is now recorded in
        `workstream/debug-service-projection-contract.md`. Focused compact
        `game play priorities`, compact `game play ready-city`, compact
        `game play unit-move-preview`, and full/read-only
        `game play ready-unit --json` coverage plus passive
        `game watch --jsonl` coverage and progression-read
        `game play traditions` / `game play progress-dashboard` coverage plus
        tactical-read, settlement-recommendation, and promotion-readiness
        coverage plus rehydrate continuity, notification-HUD, and
        notification-queue coverage plus technology-, culture-, celebration-,
        and government-option coverage, now sharing the
        `game/play/normal-output-boundary.ts` test helper, prove sixteen normal
        player-agent projection families omit raw
        transport/session/probe/correlation command internals, but broader
        debug-command boundary, AI-ingestion, telemetry, and
        procedure-diagnostic separation proof remains pending before row
        acceptance. Focused `game health --json`, `game inspect --json`,
        `game inspect --app-ui-snapshot --json`, `game status --json`,
        `game catalog --static --json`, `game exec --dry-run --json`,
        `game visibility --json`, and `game restart --dry-run --json` coverage
        now also proves debug-owned commands emit raw readiness, composed
        playable-status, App UI snapshot, runtime inspection, capability
        catalog provenance fields, exec/restart dry-run request routing fields,
        and visibility counts/grid probes including host/port/state, request
        id, agent, raw command text, state discovery, selected state,
        network/UI/player/map probes, Tuner health globals, catalog
        owner/provenance/confidence,
        own/prototype/enumerable keys, and method owner/length/signature
        diagnostics. The debug projection source/proof owner seed is now
        recorded in
        `packages/cli/src/game-debug/debug-service-projection.ts`,
        `packages/cli/test/commands/game/debug-service-projection.test.ts`,
        and `packages/cli/test/commands/game.control.test.ts`, but the row
        remains pending until final debug hierarchy/schema/test owners,
        command/flag boundary coverage, normal/debug/AI/procedure separation
        tests, and stop-condition coverage are assigned and passing.
        The semantic CLI player-agent view row now has a draft acceptance
        intake with current `game play` command/test owners from
        `workstream/cli-play-corpus.md` and missing envelope/schema/proof
        called out, but its `acceptanceStatus` remains
        `pending-cli-semantic-envelope`. The planning contract is now recorded
        in `workstream/semantic-cli-envelope-contract.md`. The semantic
        envelope source/proof owner seed is now recorded in
        `packages/cli/src/game-play/semantic-envelope.ts` and
        `packages/cli/test/commands/game/play/semantic-envelope.test.ts`, and
        the shared normal-output helper now consumes that owner for forbidden
        debug/internal marker detection. Focused `game play priorities
        --compact --json` proof now carries the first command-integrated
        `semanticEnvelope` through that owner. The row remains pending until
        full command-surface envelope coverage, final schema/test ownership,
        normal/debug/AI separation tests, and stop-condition coverage are
        assigned and passing.
        The operation/proof telemetry row now has a draft acceptance intake
        with current operation, approval, postcondition, notification
        verification, setup/turn lifecycle, and focused CLI proof owners
        identified, but its `acceptanceStatus` remains
        `pending-telemetry-contract`. The planning contract is now recorded in
        `workstream/operation-proof-telemetry-contract.md`. The telemetry
        source/proof owner seed is now recorded in
        `packages/civ7-direct-control/src/proof/operation-telemetry.ts` and
        `packages/civ7-direct-control/test/operation-telemetry.test.ts`, and
        the first operation-atom adapter owner seed is now recorded in
        `packages/civ7-direct-control/src/proof/unit-target-telemetry.ts` with
        proof in
        `packages/civ7-direct-control/test/unit-target-telemetry.test.ts`, and
        the second operation-atom adapter owner seed is now recorded in
        `packages/civ7-direct-control/src/proof/production-choice-telemetry.ts`
        with proof in
        `packages/civ7-direct-control/test/production-choice-telemetry.test.ts`,
        the third operation-atom adapter owner seed is now recorded in
        `packages/civ7-direct-control/src/proof/diplomacy-response-telemetry.ts`
        with proof in
        `packages/civ7-direct-control/test/diplomacy-response-telemetry.test.ts`,
        and the telemetry proof-label guard seed is now recorded in
        `packages/civ7-direct-control/src/proof/operation-telemetry.ts` with
        proof in
        `packages/civ7-direct-control/test/operation-telemetry.test.ts`, but
        the row remains pending until a final schema/test owner, broader
        adapter slices from operation atoms, projection separation tests, and
        final proof-label gates are assigned and passing.
        The strategy/intelligence ingestion row now has a draft acceptance
        intake using current target-thread/peer-report planning evidence and
        direct-control read/proof atom owners as candidate input evidence, but
        its `acceptanceStatus` remains `pending-ai-ingestion-contract` until an
        ingestion contract owner, schema/test owner, source/freshness/evidence
        fixtures, and normal/debug/telemetry/procedure separation tests are
        assigned and passing. The planning contract is now recorded in
        `workstream/strategy-intelligence-ingestion-contract.md`, but it does
        not assign owners or accept the row.
        The hotseat handoff row now has a draft acceptance intake using the
        hotseat/autoplay target-thread and peer-report planning evidence plus
        current runtime/session/setup/autoplay/turn-completion atom owners as
        candidate support evidence, but its `acceptanceStatus` remains
        `pending-hotseat-runtime-proof` until hotseat runtime source/proof
        owners, live activation/rotation/action/restoration gates, and
        human-turn refusal proof are assigned and passing. The planning
        contract/checklist is now recorded in
        `workstream/hotseat-handoff-contract.md`, but it does not assign owners
        or accept the row.
        The Effect/oRPC procedure cores row now has a draft acceptance intake
        using the oRPC authority citation, controller-bridge substrate repair,
        TypeBox versus Effect Schema report disposition, current TypeBox public
        contracts, and current direct-control atom owners as planning evidence,
        but its `acceptanceStatus` remains `pending-procedure-core-schema`
        until procedure-core source/schema/proof owners, context/middleware,
        error, and correlation owners, schema/procedure validation tests,
        encode/decode and typed-error tests, projection-separation tests, and
        no-raw-command-tunnel tests are assigned and passing. The planning
        contract is recorded in `workstream/procedure-core-contract.md`, and the
        first direct-control procedure descriptor owner seed is now recorded in
        `packages/civ7-direct-control/src/procedure-core.ts` with proof in
        `packages/civ7-direct-control/test/procedure-core.test.ts`, but this
        reduces only the source/proof/descriptor-runtime-validation/
        descriptor-typed-error/descriptor-correlation/no-raw-tunnel gap for
        the current TypeBox descriptor shape, generic raw fields, and
        repo-local command serialization and session execute owners; adjacent
        ready-unit, ready-city, unit move-preview, and playable-status
        schema/descriptor seeds reduce only local stable-atom input/output
        proof gaps, and the procedure payload validation seed reduces only the
        local resolved TypeBox input/output validation proof gap. The
        descriptor context-policy seed now records direct
        control facade, endpoint default, state-selection, logger, evidence
        sink, and live-session policy requirements on current descriptors, and
        rejects endpoint/state fields from procedure input when those concerns
        are context-owned; this reduces only the descriptor-context gap and
        does not accept the row.
    - Current blockers: hotseat handoff still needs runtime source/proof
      owners and live activation/rotation/restoration gates; semantic CLI still
      needs envelope/schema/proof ownership and normal/debug separation tests;
      AI ingestion still needs contract/schema/proof ownership and
      source/freshness/evidence fixtures; debug/internal service output still
      needs command/flag boundary ownership and tests; operation/proof
      telemetry still needs contract/schema/proof ownership and explicit
      outcome evidence fixtures; Effect/oRPC procedure cores still need
      procedure/schema/proof ownership, TypeBox/Effect Schema/Zod adapter
      ownership for a concrete schema slice, and procedure-core tests over
      stable atoms. The TypeBox runtime descriptor-validation seed, typed
      descriptor-error seed, descriptor-correlation seed, and TypeBox versus
      Effect Schema report disposition are bounded planning/source evidence;
      they are not enough to accept the row without owners and tests.
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
  - App UI companion planning is also blocked from implementation: the accepted
    bridge substrate is an in-process oRPC/Effect callable router loaded
    through Civ7 native `scope="game"` `UIScripts`, with
    `globalThis.Civ7IntelligenceBridge.invoke(...)` only as serialized ingress
    through the existing tuner/App UI boundary into that router. This planning
    note does not authorize controller source, transport adapters,
    AI-ingestion code, or runtime proof claims.
  - [x] 2.10.1 Audit the current direct-control/CLI support slice for
        implementation leakage after the facade/source modularization stack.
        Current evidence keeps `packages/civ7-direct-control` and
        `packages/cli` on local direct-control atoms and CLI command surfaces:
        no source migration to intelligence-layer code, telemetry persistence,
        Effect/oRPC procedure cores, transport adapters, or App UI companion
        bridge implementation is included in this OpenSpec slice. This closes
        only the guard audit; Task 2.10 remains open until source/proof owners
        are assigned and any affected compatibility rows are accepted.

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
  - [x] 4.3.3 Prune notification view facade dependency injection by letting
        the notification view owner import existing non-facade App UI execution
        and parser owners directly, while keeping public facade exports stable,
        preserving `maxNotifications` defaulting, parse label, read-only
        materialization behavior, debug/internal raw projection boundaries, and
        leaving telemetry, AI ingestion, CLI semantic projection, hotseat
        runtime proof, Effect/oRPC procedure-core work, and Task 2.9.4
        matrix-row acceptance pending.
  - [x] 4.3.4 Prune the trivial notification-view facade call-through wrapper
        by re-exporting the read-owner function directly from `index.ts`,
        preserving public package imports for `getCiv7PlayNotificationView`
        while leaving notification dismissal, telemetry, AI ingestion, CLI
        semantic projection, hotseat runtime proof, Effect/oRPC procedure-core
        work, and Task 2.9.4 matrix-row acceptance pending.
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
  - [x] 4.4.5 Prune notification dismissal facade dependency injection by
        letting `src/play/notifications/dismissal-request.ts` import existing
        non-facade App UI execution, parser, serializer, and approval owners
        directly, while keeping public facade exports stable, preserving
        guarded read/send dismissal command serialization, approval-first
        dismissal behavior, final identity-based verification, focused
        package/CLI notification dismissal proof, and leaving runtime/live-game
        proof, telemetry, AI ingestion, semantic CLI projection, Effect/oRPC
        procedure-core work, and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.4.6 Prune the notification dismissal read facade call-through wrapper
        by re-exporting `getCiv7NotificationDismissal` directly from
        `src/play/notifications/dismissal-request.ts`, preserving public
        package imports, guarded read shape, the separate approved
        `requestCiv7NotificationDismissal` mutation wrapper, focused
        package/CLI notification dismissal proof, and leaving runtime/live-game
        proof, telemetry, AI ingestion, semantic CLI projection, Effect/oRPC
        procedure-core work, and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.4.7 Prune the notification dismissal request facade call-through
        wrapper by re-exporting `requestCiv7NotificationDismissal` directly
        from `src/play/notifications/dismissal-request.ts`, preserving public
        package imports, approval-first dismissal behavior, guarded send
        serialization, final identity-based verification, focused package/CLI
        notification dismissal proof, and leaving runtime/live-game proof,
        telemetry, AI ingestion, semantic CLI projection, Effect/oRPC
        procedure-core work, and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.4.8 Seed a notification dismissal postcondition classification
        owner in `src/play/notifications/postconditions.ts` and attach the
        explicit postcondition to wrapper results, preserving approval-first
        dismissal behavior, final identity-based verification ordering, and
        focused package proof that stale engine-front train-absent or
        dismissed-flag evidence remains unverified. This is a source-owned
        postcondition prerequisite for future telemetry/procedure consumers; it
        does not add a telemetry adapter, change normal CLI/debug/AI
        projections, add persistence, add router/registry/transport or
        Effect/oRPC source, claim runtime/live-game proof, or accept Task 2.9.4
        or Tasks 6.1-6.9.
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
  - [x] 4.5.7 Prune ready read facade dependency injection by letting
        `src/play/ready/{unit,move-preview,city}.ts` import existing
        non-facade App UI execution, parser, bounds, and map-validation owners
        directly, while keeping public facade exports stable, preserving
        ready-unit radius/max-operation bounds, unit-move-preview destination
        validation and movement bounds, ready-city max-operation bounds, no new
        component-id pre-validation, conservative relationship-label policy,
        and leaving ready-domain regrouping, telemetry, AI ingestion, CLI
        semantic projection, hotseat runtime proof, Effect/oRPC procedure-core
        work, and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.5.8 Prune trivial ready-read facade call-through wrappers by
        re-exporting the read-owner functions directly from `index.ts`,
        preserving public package imports for ready-unit view, ready-city view,
        and unit-move-preview while leaving ready-domain regrouping, telemetry,
        AI ingestion, CLI semantic projection, hotseat runtime proof,
        Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance
        pending.
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
  - [x] 4.6.18 Extract technology and culture choice closeout wrapper owners
        while keeping public facade call-through in `index.ts`, preserving
        approval-first checks, player/node validation, App UI execution,
        payload parse labels, command serialization, optional notification
        activation, SET_*_TREE_NODE / SET_*_TREE_TARGET_NODE send behavior,
        focused technology/culture package and CLI proof, and leaving
        runtime/live-game proof, telemetry, AI ingestion, semantic CLI
        projection, Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row
        acceptance pending.
  - [x] 4.6.19 Prune stale facade-local postcondition comparison helpers after
        unit/population/production/narrative/diplomacy/unit-target owners
        moved, preserving remaining facade serializer/probe-value/probe-helper
        injection, package/CLI proof, and leaving shared serializer/type ownership,
        runtime/live-game proof, telemetry, AI ingestion, semantic CLI
        projection, Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row
        acceptance pending.
  - [x] 4.6.20 Prune generic operation facade dependency injection by letting
        `src/play/operations/validate-request.ts` import existing non-facade
        approval, Tuner execution, command-result parser, and serializer owners
        directly, while keeping public facade exports stable, preserving
        approval-first send behavior, validator-first request flow, operation
        router source routing, unit/population/production postcondition
        composition, package/CLI proof, and leaving runtime/live-game proof,
        telemetry, AI ingestion, semantic CLI projection, Effect/oRPC
        procedure-core work, and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.6.21 Prune technology/culture closeout facade dependency injection by
        letting `src/play/progression/{technology,culture}.ts` import existing
        non-facade approval, App UI execution, payload parser, serializer,
        player validation, and direct-control error owners directly, while
        keeping public facade exports stable, preserving approval-first checks,
        player/node validation, App UI execution, payload parse labels, command
        serialization, optional notification activation, SET_*_TREE_NODE /
        SET_*_TREE_TARGET_NODE send behavior, focused package/CLI proof, and
        leaving runtime/live-game proof, telemetry, AI ingestion, semantic CLI
        projection, Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row
        acceptance pending.
  - [x] 4.6.22 Prune production-choice facade dependency injection by letting
        `src/play/operations/production-choice.ts` import existing non-facade
        approval, component-id assertion, city-operation validation, App UI
        execution, payload parser, and serializer owners directly, while keeping
        public facade exports stable, preserving approval-first BUILD request
        orchestration, cityId and production-args validation, validator-first
        behavior, read-only status payload for invalid pre-validation, bounded
        post-send polling, production postcondition classification, package/CLI
        proof, and leaving runtime/live-game proof, telemetry, AI ingestion,
        semantic CLI projection, Effect/oRPC procedure-core work, and Task 2.9.4
        matrix-row acceptance pending.
  - [x] 4.6.23 Prune diplomacy response facade dependency injection by letting
        `src/play/operations/diplomacy-request.ts` import existing non-facade
        approval, player validation, App UI execution, notification view,
        player-operation validation, payload parser, serializer, and
        direct-control error owners directly, while keeping public facade
        exports stable, preserving approval-first RESPOND_DIPLOMATIC_ACTION
        orchestration, action/response integer validation, validator-first
        no-send behavior, App UI closeout command serialization, diplomacy
        postcondition classification, package/CLI proof, and leaving
        runtime/live-game proof, telemetry, AI ingestion, semantic CLI
        projection, Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row
        acceptance pending.
  - [x] 4.6.24 Prune narrative choice facade dependency injection by letting
        `src/play/operations/narrative-request.ts` import existing non-facade
        approval, player validation, ComponentID assertion, App UI execution,
        notification view, player-operation validation, payload parser,
        serializer, and direct-control error owners directly, while keeping
        public facade exports stable, preserving approval-first
        CHOOSE_NARRATIVE_STORY_DIRECTION orchestration, target/action
        validation, validator-first no-send behavior, App UI closeout command
        serialization, narrative postcondition classification, package/CLI
        proof, and leaving runtime/live-game proof, telemetry, AI ingestion,
        semantic CLI projection, Effect/oRPC procedure-core work, and Task 2.9.4
        matrix-row acceptance pending.
  - [x] 4.6.25 Prune unit-target action facade dependency injection by letting
        `src/play/operations/unit-target-action.ts` import existing non-facade
        approval, Tuner execution, and payload parser owners directly, while
        keeping public facade exports stable, preserving read-vs-send split,
        approval-first send behavior, parser label, default verification timing,
        bounded no-repeat-after-unverified polling, unit-target postcondition
        classification, package/CLI proof, and leaving runtime/live-game proof,
        telemetry, AI ingestion, semantic CLI projection, Effect/oRPC
        procedure-core work, and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.6.26 Prune the unit-target action plan facade call-through wrapper by
        re-exporting `getCiv7UnitTargetAction` directly from
        `src/play/operations/unit-target-action.ts`, preserving public package
        imports, read-vs-send split, selected-target plan shape, the separate
        approved `requestCiv7UnitTargetAction` mutation wrapper, package/CLI
        proof, and leaving runtime/live-game proof, telemetry, AI ingestion,
        semantic CLI projection, Effect/oRPC procedure-core work, and Task
        2.9.4 matrix-row acceptance pending.
  - [x] 4.6.26a Prune the unit-target action request facade call-through
        wrapper by re-exporting `requestCiv7UnitTargetAction` directly from
        `src/play/operations/unit-target-action.ts`, preserving public package
        imports, read-vs-send split, approval-first behavior, parser label,
        default verification timing, bounded no-repeat-after-unverified
        polling/wording, unit-target postcondition classification, package/CLI
        proof, and leaving runtime/live-game proof, telemetry, AI ingestion,
        semantic CLI projection, Effect/oRPC procedure-core work, and Task
        2.9.4 matrix-row acceptance pending.
  - [x] 4.6.27 Prune generic operation validation facade call-through wrappers
        by re-exporting `canStartCiv7UnitOperation`,
        `canStartCiv7UnitCommand`, `canStartCiv7CityOperation`,
        `canStartCiv7CityCommand`, and `canStartCiv7PlayerOperation`
        directly from `src/play/operations/validate-request.ts`, preserving
        public package imports, validation/read-only behavior, the separate
        approved `request*` mutation wrappers, package/CLI proof, and leaving
        runtime/live-game proof, telemetry, AI ingestion, semantic CLI
        projection, Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row
        acceptance pending.
  - [x] 4.6.28 Prune generic operation request facade call-through wrappers by
        re-exporting `requestCiv7UnitOperation`, `requestCiv7UnitCommand`,
        `requestCiv7CityOperation`, `requestCiv7CityCommand`, and
        `requestCiv7PlayerOperation` directly from
        `src/play/operations/validate-request.ts`, preserving public package
        imports, approval-first mutation behavior, validator-first request
        flow, postcondition result shape, package/CLI proof, and leaving
        runtime/live-game proof, telemetry, AI ingestion, semantic CLI
        projection, Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row
        acceptance pending.
  - [x] 4.6.29 Prune the production-choice facade call-through wrapper by
        re-exporting `requestCiv7ProductionChoice` directly from
        `src/play/operations/production-choice.ts`, preserving public package
        imports, approval-first BUILD request behavior, cityId and production
        args validation, validator-first no-send behavior, production
        postcondition result shape, package/CLI proof, and leaving
        runtime/live-game proof, telemetry, AI ingestion, semantic CLI
        projection, Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row
        acceptance pending.
  - [x] 4.6.30 Prune the technology/culture closeout facade call-through
        wrappers by re-exporting `requestCiv7TechnologyChoiceCloseout` and
        `requestCiv7CultureChoiceCloseout` directly from
        `src/play/progression/{technology,culture}.ts`, preserving public
        package imports, approval-first checks, player/node validation, App UI
        execution, payload parse labels, optional notification activation,
        SET_*_TREE_NODE / SET_*_TREE_TARGET_NODE send behavior, package/CLI
        proof, and leaving runtime/live-game proof, telemetry, AI ingestion,
        semantic CLI projection, Effect/oRPC procedure-core work, and Task
        2.9.4 matrix-row acceptance pending.
  - [x] 4.6.31 Prune the diplomacy/narrative facade call-through wrappers by
        re-exporting `requestCiv7DiplomacyResponse` and
        `requestCiv7NarrativeChoice` directly from
        `src/play/operations/{diplomacy-request,narrative-request}.ts`,
        preserving public package imports, approval-first response behavior,
        validator-first no-send behavior, App UI closeout command
        serialization, diplomacy/narrative postcondition classification,
        package/CLI proof, and leaving runtime/live-game proof, telemetry, AI
        ingestion, semantic CLI projection, Effect/oRPC procedure-core work,
        and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.6.32 Extract the shared operation stable JSON comparison helper into
        `src/play/operations/stable-json.ts`, preserving the existing
        array-aware key flattening, validation-drift comparison, probe
        comparison, unit-target post-send comparison, postcondition
        classification semantics, and leaving runtime/live-game proof,
        telemetry, AI ingestion, semantic CLI projection, Effect/oRPC
        procedure-core work, and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.6.33 Extract the shared operation runtime probe value/comparison
        helper into `src/play/operations/probe-values.ts`, preserving the
        existing postcondition probe value extraction, probe comparison,
        validation-drift comparison, classifier ordering, unit/population/
        production/diplomacy/narrative postcondition semantics, and leaving
        runtime/live-game proof, telemetry, AI ingestion, semantic CLI
        projection, Effect/oRPC procedure-core work, and Task 2.9.4
        matrix-row acceptance pending.
  - [x] 4.6.34 Extract the shared operation component-id comparison helper into
        `src/play/operations/component-id.ts`, preserving diplomacy blocking
        notification comparison, narrative blocker identity comparison,
        postcondition classifier ordering, no-repeat-after-unverified
        semantics, and leaving runtime/live-game proof, telemetry, AI
        ingestion, semantic CLI projection, Effect/oRPC procedure-core work,
        and Task 2.9.4 matrix-row acceptance pending.
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
  - [x] 4.7.12 Prune tactical/progression read facade dependency injection by
        letting `src/play/tactical/{settlement,target-candidates,battlefield,destination}.ts`
        and `src/play/progression/reads.ts` import existing non-facade App UI
        execution, parser, validation, bounds, and map-validation owners
        directly, while keeping public facade exports stable, preserving
        settlement count bounds, progression player validation,
        target-candidate/battlefield/destination bounds, destination/origin map
        validation, conservative relationship-label policy, and leaving
        telemetry, AI ingestion, CLI semantic projection, hotseat runtime proof,
        Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance
        pending.
  - [x] 4.7.13 Prune trivial tactical/progression read facade call-through
        wrappers by re-exporting the read-owner functions directly from
        `index.ts`, preserving public package imports for settlement
        recommendations, target candidates, traditions view, progress dashboard,
        battlefield scan, and destination analysis while leaving telemetry, AI
        ingestion, CLI semantic projection, hotseat runtime proof, Effect/oRPC
        procedure-core work, and Task 2.9.4 matrix-row acceptance pending.
- [x] 4.8 Export stable types/constants only after module owners are defined.
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
  - [x] 4.8.34 Extract action approval primitive/helper owner while preserving
        the public `Civ7ActionApproval` type contract through facade re-exports,
        approval-first rejection message/classification, and no socket use
        before approval, and leaving procedure schemas, operation/proof
        telemetry, hotseat runtime proof, AI ingestion, CLI semantic
        projection, Effect/oRPC procedure-core work, and Task 2.9.4
        matrix-row acceptance pending.
  - [x] 4.8.35 Extract generic validation primitive/helper owner while
        preserving bounded integer, simple identifier, and player-id
        validation message/classification semantics, and leaving map-specific
        validation helpers, procedure schemas, operation/proof telemetry,
        hotseat runtime proof, AI ingestion, CLI semantic projection,
        Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance
        pending.
  - [x] 4.8.36 Extract facade dependency primitive owners for error-message
        formatting and timer sleeping while preserving playable-status error
        shaping and autoplay wait dependency behavior, leaving owner-local
        sleeps/errors, Effect/Bun resource/schedule/layer composition,
        procedure schemas, operation/proof telemetry, hotseat runtime proof, AI
        ingestion, CLI semantic projection, Effect/oRPC procedure-core work,
        and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.8.37 Prune internal `Civ7ActionApproval` type back-imports from the
        public facade by importing from the action-approval owner (or operation
        type owner where already appropriate), while preserving public facade
        re-exports and leaving unrelated command/session type back-imports,
        procedure schemas, operation/proof telemetry, hotseat runtime proof, AI
        ingestion, CLI semantic projection, Effect/oRPC procedure-core work,
        and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.8.38 Prune remaining internal command/session/runtime type
        back-imports from the public facade by importing command results,
        direct-control options, state selections, sessions, runtime probes,
        snapshot/health results, and operation families from their owner
        modules, while preserving public facade re-exports and leaving
        procedure schemas, operation/proof telemetry, hotseat runtime proof, AI
        ingestion, CLI semantic projection, Effect/oRPC procedure-core work,
        and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.8.39 Prune stale facade filesystem import by moving saved-config
        disk listing/parsing and the default save directory into setup
        preparation ownership, while preserving public facade exports and
        leaving procedure schemas, operation/proof telemetry, hotseat runtime
        proof, AI ingestion, CLI semantic projection, Effect/oRPC
        procedure-core work, and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.8.40 Prune stale facade filesystem import after proof/log and
        capability catalog ownership moved filesystem reads into their owner
        modules, while preserving public facade exports and leaving procedure
        schemas, operation/proof telemetry, hotseat runtime proof, AI
        ingestion, CLI semantic projection, Effect/oRPC procedure-core work,
        and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.8.41 Prune stale facade value imports for already-owned direct-control
        error, action approval, map validation, command-result parser,
        command-source serializer, and runtime probe helpers, while preserving
        public facade exports and leaving procedure schemas, operation/proof
        telemetry, hotseat runtime proof, AI ingestion, CLI semantic projection,
        Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance
        pending.
  - [x] 4.8.41 Prune stale facade re-export imports for public primitive,
        session, proof/log, catalog schema, and runtime-constant values now
        exported through direct `export ... from` declarations, while preserving
        public facade exports and leaving procedure schemas, operation/proof
        telemetry, hotseat runtime proof, AI ingestion, CLI semantic projection,
        Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance
        pending.
  - [x] 4.8.42 Prune stale facade re-export imports for map/GameInfo constants
        now exported through direct `export ... from` declarations, while
        preserving public facade exports and leaving procedure schemas,
        operation/proof telemetry, hotseat runtime proof, AI ingestion, CLI
        semantic projection, Effect/oRPC procedure-core work, and Task 2.9.4
        matrix-row acceptance pending.
  - [x] 4.8.43 Prune stale facade type re-export imports for map read helper
        types now exported through direct `export type ... from` declarations,
        while preserving public facade exports and leaving schema ownership,
        operation/proof telemetry, hotseat runtime proof, AI ingestion, CLI
        semantic projection, Effect/oRPC procedure-core work, and Task 2.9.4
        matrix-row acceptance pending.
  - [x] 4.8.44 Prune stale facade type re-export import for the production
        postcondition snapshot now exported through direct
        `export type ... from` declarations, while preserving public facade
        exports and leaving operation/proof telemetry, hotseat runtime proof,
        AI ingestion, CLI semantic projection, Effect/oRPC procedure-core work,
        and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.8.45 Prune stale facade type re-export imports for runtime diagnostic
        helper types now exported through direct `export type ... from`
        declarations, while preserving public facade exports and leaving
        runtime-status projection, telemetry, AI ingestion, CLI semantic
        projection, Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row
        acceptance pending.
  - [x] 4.8.46 Prune stale facade type re-export imports for session endpoint
        and state-role types now exported through direct
        `export type ... from` declarations, while preserving public facade
        exports and leaving session behavior, runtime proof, telemetry, AI
        ingestion, CLI semantic projection, Effect/oRPC procedure-core work,
        and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.8.47 Prune stale facade type re-export imports for notification-view
        decision helper types now exported through direct
        `export type ... from` declarations, while preserving public facade
        exports and leaving notification behavior, runtime proof, telemetry, AI
        ingestion, CLI semantic projection, Effect/oRPC procedure-core work,
        and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.8.48 Prune stale facade type re-export import for the notification
        dismissal summary type now exported through a direct
        `export type ... from` declaration, while preserving public facade
        exports and leaving notification behavior, runtime proof, telemetry, AI
        ingestion, CLI semantic projection, Effect/oRPC procedure-core work,
        and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.8.49 Prune stale facade type re-export imports for progression-read
        helper types now exported through direct `export type ... from`
        declarations, while preserving public facade exports and leaving
        progression behavior, runtime proof, telemetry, AI ingestion, CLI
        semantic projection, Effect/oRPC procedure-core work, and Task 2.9.4
        matrix-row acceptance pending.
  - [x] 4.8.50 Prune stale facade type re-export import for the production
        choice command payload now exported through a direct
        `export type ... from` declaration, while preserving public facade
        exports and leaving production behavior, runtime proof, telemetry, AI
        ingestion, CLI semantic projection, Effect/oRPC procedure-core work,
        and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.8.51 Prune stale facade type re-export imports for setup-read helper
        types now exported through direct `export type ... from` declarations,
        while preserving public facade exports and leaving setup behavior,
        runtime proof, telemetry, AI ingestion, CLI semantic projection,
        Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance
        pending.
  - [x] 4.8.52 Prune stale facade type re-export import for autoplay poll
        options now exported through a direct `export type ... from`
        declaration, while preserving public facade exports and leaving autoplay
        behavior, runtime proof, telemetry, AI ingestion, CLI semantic
        projection, Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row
        acceptance pending.
  - [x] 4.8.53 Prune stale facade type re-export imports for autoplay status
        and turn-completion status results now exported through direct
        `export type ... from` declarations, while preserving public facade
        exports and leaving autoplay/turn-completion behavior, runtime proof,
        telemetry, AI ingestion, CLI semantic projection, Effect/oRPC
        procedure-core work, and Task 2.9.4 matrix-row acceptance pending.
- [x] 4.9 Explicitly cite oRPC architecture authority before any oRPC
      implementation. The support branch cites the
      `civ7-orpc-control-architecture` skill from
      `codex/civ7-orpc-control-architecture-skill` as the procedure/router
      authority: oRPC is typed procedure/router/context/middleware composition
      over repo-owned direct-control atoms, not raw command tunneling or a
      transport-first rewrite. This closes only the authority-citation blocker;
      tracked `packages/civ7-control-orpc` source, procedure-core schemas,
      telemetry hooks, CLI semantic envelopes, AI ingestion, hotseat runtime
      proof, Effect/Bun implementation, and Task 2.9.4 matrix-row acceptance
      remain pending.
- [x] 4.10 Classify direct-control service outputs by consumer before command
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
        first-reachable-host selection, per-host error details,
        `all-hosts-unavailable` classification, and focused
        dependency-injected package proof while leaving socket/session
        lifecycle, package-level command execution, lifecycle/reconnect,
        telemetry/correlation contracts, procedure schemas, semantic CLI, AI
        ingestion, hotseat runtime proof, Effect/oRPC procedure-core work, and
        Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.10.7 Extract session socket-open helper owner while preserving
        connection timeout and connection-failed error classification and
        leaving `Civ7DirectControlSession`, frame request handling, state
        querying, command execution, reconnect orchestration,
        telemetry/correlation contracts, procedure schemas, semantic CLI, AI
        ingestion, hotseat runtime proof, Effect/oRPC procedure-core work, and
        Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.10.8 Extract tuner state-parts parser owner while preserving LSQ
        response pair parsing and dangling-part omission, and leaving
        `Civ7DirectControlSession`, listener allocation, frame request
        handling, command execution, reconnect orchestration,
        telemetry/correlation contracts, procedure schemas, semantic CLI, AI
        ingestion, hotseat runtime proof, Effect/oRPC procedure-core work, and
        Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.10.9 Extract tuner listener-id allocator owner while preserving
        positive incrementing listener IDs and leaving
        `Civ7DirectControlSession`, frame request handling, state querying,
        command execution, reconnect orchestration, telemetry/correlation
        contracts, procedure schemas, semantic CLI, AI ingestion, hotseat
        runtime proof, Effect/oRPC procedure-core work, and Task 2.9.4
        matrix-row acceptance pending.
  - [x] 4.10.10 Remove unused standalone tuner message helper after
        listener-id allocation and frame encoding/parsing gained named session
        owners, while leaving `Civ7DirectControlSession`, frame request
        handling, state querying, command execution, reconnect orchestration,
        telemetry/correlation contracts, procedure schemas, semantic CLI, AI
        ingestion, hotseat runtime proof, Effect/oRPC procedure-core work, and
        Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.10.11 Extract `Civ7DirectControlSession` and its private
        pending-request lifecycle into a session owner while preserving socket
        connection fallback, LSQ state queries, framed command execution,
        request timeout/close/error classification, and public facade exports,
        and leaving package-level query/execute wrappers, reconnect
        orchestration, telemetry/correlation contracts, procedure schemas,
        semantic CLI, AI ingestion, hotseat runtime proof, Effect/oRPC
        procedure-core work, and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.10.12 Extract package-level Tuner query/command execution wrappers
        into a session execute owner while preserving `queryCiv7TunerStates`,
        `executeCiv7Command`, `executeCiv7AppUiCommand`, and
        `executeCiv7TunerCommand` public facade behavior, session
        creation/close behavior, App UI/Tuner state forcing, command result
        shape, and focused session proof, and leaving reconnect orchestration,
        lifecycle composition, telemetry/correlation contracts, procedure
        schemas, semantic CLI, AI ingestion, hotseat runtime proof, Effect/oRPC
        procedure-core work, and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.10.13 Move the public endpoint discovery wrapper into the session
        discovery owner now that session execute wrappers are owned outside the
        facade, while preserving public facade exports, host/env ordering,
        first-reachable-host selection, per-host error details,
        `all-hosts-unavailable` classification, and focused dependency-injected
        package proof, and leaving reconnect orchestration, lifecycle
        composition, telemetry/correlation contracts, procedure schemas,
        semantic CLI, AI ingestion, hotseat runtime proof, Effect/oRPC
        procedure-core work, and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.10.14 Extract the private session command reconnect helper into the
        session owner while preserving retry attempts, close-before-retry
        behavior, `750 + attempt * 750` backoff, and `command-failed` fallback
        classification, and leaving Tuner-ready waiting, lifecycle
        composition, telemetry/correlation contracts, procedure schemas,
        semantic CLI, AI ingestion, hotseat runtime proof, Effect/oRPC
        procedure-core work, and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.10.15 Extract direct-control health check owner while keeping public
        facade exports in `index.ts`, preserving endpoint discovery
        composition, no-state/state-missing/unavailable classification,
        selected-state reporting, and typed error wrapping, and leaving
        `waitForCiv7DirectControl`, Tuner-ready waiting, lifecycle composition,
        telemetry/correlation contracts, procedure schemas, semantic CLI, AI
        ingestion, hotseat runtime proof, Effect/oRPC procedure-core work, and
        Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.10.16 Extract direct-control wait wrapper into the session health
        owner while keeping public facade exports in `index.ts`, preserving
        health polling, `waitTimeoutMs` / `timeoutMs` defaulting, poll interval
        defaulting, last-health timeout details, and `connection-timeout`
        classification, and leaving Tuner-ready waiting, lifecycle
        composition, telemetry/correlation contracts, procedure schemas,
        semantic CLI, AI ingestion, hotseat runtime proof, Effect/oRPC
        procedure-core work, and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.10.17 Extract Tuner-ready wait ownership into the Tuner health owner
        while keeping public facade exports in `index.ts`, preserving
        session-scoped Tuner health polling, `waitTimeoutMs` / `timeoutMs`
        defaulting, poll interval defaulting, reconnect-close behavior,
        last-health-or-error timeout details, and `connection-timeout`
        classification, and leaving setup/restart lifecycle composition,
        telemetry/correlation contracts, procedure schemas, semantic CLI, AI
        ingestion, hotseat runtime proof, Effect/oRPC procedure-core work, and
        Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.10.18 Extract command-result JSON payload parser into a session owner
        while preserving host/port/state merge behavior, invalid JSON
        message/classification/details, and existing facade dependency
        injection, and leaving validation helpers, command serialization,
        telemetry/correlation contracts, procedure schemas, semantic CLI, AI
        ingestion, hotseat runtime proof, Effect/oRPC procedure-core work, and
        Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.10.19 Extract shared session acquire/release helper into the session
        owner while preserving `new Civ7DirectControlSession(options)` plus
        `finally` close behavior for Tuner health and setup/restart dependency
        injection, and leaving lifecycle behavior changes, Effect/Bun
        resource/schedule/layer composition, telemetry/correlation contracts,
        procedure schemas, semantic CLI, AI ingestion, hotseat runtime proof,
        Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance
        pending.
  - [x] 4.10.20 Reuse the shared session acquire/release helper from the
        package-level execute owner while preserving `queryCiv7TunerStates`,
        `executeCiv7Command`, App UI/Tuner state forcing wrappers, command
        result shape, and close-on-completion/error behavior, and leaving
        Effect/Bun resource/schedule/layer composition, telemetry/correlation
        contracts, procedure schemas, semantic CLI, AI ingestion, hotseat
        runtime proof, Effect/oRPC procedure-core work, and Task 2.9.4
        matrix-row acceptance pending.
  - [x] 4.10.21 Prune trivial direct-control health and wait facade
        call-through wrappers by re-exporting the session health owner
        functions directly, preserving public package imports, health/wait
        behavior, and session package proof while leaving lifecycle
        composition, telemetry/correlation contracts, procedure schemas,
        semantic CLI, AI ingestion, hotseat runtime proof, Effect/oRPC
        procedure-core work, and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.10.22 Align command-result parser and command-source serializer
        dependency records after facade dependency pruning. The atom corpus now
        records that shared parser/serializer consumers import the existing
        owner modules directly instead of receiving those helpers from
        `index.ts`, while preserving the local package/source proof boundary
        and leaving atom-local source serializers, procedure schemas,
        telemetry/correlation contracts, semantic CLI, AI ingestion, hotseat
        runtime proof, Effect/oRPC procedure-core work, and Task 2.9.4
        matrix-row acceptance pending.
- [x] 4.11 Extract map/visibility/GameInfo read atoms.
  - [x] 4.11.1 Extract map summary, plot snapshot, and map grid read
        wrapper/source owner while keeping the public facade export surface in
        `index.ts`.
  - [x] 4.11.2 Extract visibility summary read wrapper/source owner while
        keeping the public facade export surface in `index.ts`; later 4.11
        rows now own reveal mutation, GameInfo rows, setup map rows, and
        player/unit/city summaries, while downstream AI ingestion, semantic
        CLI, telemetry, hotseat runtime proof, Effect/oRPC procedure-core work,
        and Task 2.9.4 matrix-row acceptance remain pending.
  - [x] 4.11.3 Extract GameInfo rows read wrapper/source owner while keeping
        the public facade export surface in `index.ts`; later 4.11 rows now
        own reveal mutation, setup map rows, and player/unit/city summaries,
        while AI ingestion, static profile shaping, semantic CLI, telemetry,
        hotseat runtime proof, Effect/oRPC procedure-core work, and Task 2.9.4
        matrix-row acceptance remain pending.
  - [x] 4.11.4 Extract player, unit, and city summary read wrapper/source
        owner with focused package proof while keeping public facade exports in
        `index.ts`; later 4.11 rows now own reveal mutation and setup map rows,
        while AI ingestion, static profile shaping, semantic CLI, telemetry,
        hotseat runtime proof, Effect/oRPC procedure-core work, and Task 2.9.4
        matrix-row acceptance remain pending.
  - [x] 4.11.5 Extract reveal-map mutation wrapper owner while keeping public
        facade exports in `index.ts`, preserving approval-first and
        disposable-session guards, player-id validation, visibility before/after
        reads, `Visibility.revealAllPlots` command text, classification shape,
        and leaving setup map rows to the completed 4.11.6 row while AI
        ingestion, static profile shaping, semantic CLI, telemetry, hotseat
        runtime proof, Effect/oRPC procedure-core work, and Task 2.9.4
        matrix-row acceptance remain pending.
  - [x] 4.11.6 Extract setup snapshot and setup map rows read/source owner while
        keeping public facade exports in `index.ts`, preserving setup map script
        validation, `limit` default/bounds, setup-domain/config-db row
        materialization, setup snapshot phase/config shape, and lifecycle helper
        reuse of the same setup source while leaving prepare/start/restart
        lifecycle orchestration, AI ingestion, static profile shaping, semantic
        CLI, telemetry, hotseat runtime proof, and Effect/oRPC procedure-core
        work pending.
  - [x] 4.11.7 Extract map validation helper owner while preserving map
        location `x`/`y` bounds, map-grid `bounds.width`/`bounds.height` hard
        caps, and existing command-failed messages, while keeping runtime
        behavior changes, public procedure schemas, telemetry, hotseat runtime
        proof, AI ingestion, CLI semantic projection, Effect/oRPC procedure-core
        work, and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.11.8 Prune map-read facade dependency injection by letting the map
        read owner import existing non-facade executor/parser/validation/source
        helpers directly, while keeping public facade exports stable,
        preserving map summary, plot snapshot, and map grid behavior, and
        leaving public procedure schemas, telemetry, hotseat runtime proof, AI
        ingestion, CLI semantic projection, Effect/oRPC procedure-core work,
        and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.11.9 Prune summary-read facade dependency injection by letting the
        summary read owner import existing non-facade executor, parser,
        validation, serializer, and source-helper owners directly, while
        keeping public facade exports stable, preserving player/unit/city
        summary validation and component-id pass-through behavior, and leaving
        public procedure schemas, telemetry, hotseat runtime proof, AI
        ingestion, CLI semantic projection, Effect/oRPC procedure-core work,
        and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.11.10 Prune GameInfo read facade dependency injection by letting the
        GameInfo owner import existing non-facade executor, parser, validation,
        serializer, constant, and source-helper owners directly, while keeping
        public facade exports stable, preserving GameInfo table/filter
        validation, lookup/filter value pass-through, limit/offset bounds,
        schema/primary-key options, and leaving public procedure schemas,
        telemetry, hotseat runtime proof, AI ingestion, CLI semantic
        projection, Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row
        acceptance pending.
  - [x] 4.11.11 Prune visibility/reveal facade dependency injection by letting
        the visibility owner import existing non-facade approval, executor,
        parser, validation, serializer, constant, probe, and bounds helpers
        directly, while keeping public facade exports stable, preserving
        visibility read bounds behavior, reveal approval/disposable-session
        guard, reveal classification, and leaving public procedure schemas,
        telemetry, hotseat runtime proof, AI ingestion, CLI semantic
        projection, Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row
        acceptance pending.
  - [x] 4.11.12 Prune trivial map/GameInfo/summary read facade call-through
        wrappers by re-exporting the read-owner functions directly from
        `index.ts`, preserving public package imports for map summary, plot
        snapshot, map grid, GameInfo rows, and player/unit/city summaries while
        leaving visibility/reveal mutation, setup reads, public procedure
        schemas, telemetry, hotseat runtime proof, AI ingestion, CLI semantic
        projection, Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row
        acceptance pending.
  - [x] 4.11.13 Prune the visibility summary read facade call-through wrapper
        by re-exporting `getCiv7VisibilitySummary` directly from
        `src/play/map/visibility.ts`, preserving public package imports,
        visibility read validation/bounds behavior, the separate reveal-map
        mutation wrapper boundary, public procedure schemas, telemetry, hotseat
        runtime proof, AI ingestion, CLI semantic projection, Effect/oRPC
        procedure-core work, and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.11.14 Prune the reveal-map mutation facade call-through wrapper by
        re-exporting `revealCiv7MapForPlayer` directly from
        `src/play/map/visibility.ts`, preserving public package imports,
        approval-first disposable-session guard, before/after visibility reads,
        `Visibility.revealAllPlots` command text, reveal classification shape,
        package proof, and leaving runtime/live-game proof, public procedure
        schemas, telemetry, hotseat runtime proof, AI ingestion, CLI semantic
        projection, Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row
        acceptance pending.
- [x] 4.12 Extract runtime inspection/catalog/proof atoms.
  - [x] 4.12.1 Extract runtime API inspection wrapper/source owner while keeping
        the public facade export surface in `index.ts`, classifying it as
        debug/internal service output with normal CLI projection omitted or
        debug-only and debug service projection as raw diagnostic projection,
        while later 4.12 rows now own App UI snapshot, Tuner health, playable
        status, bounded root inspection, capability catalog, catalog schemas,
        and runtime inspection constants. Telemetry, hotseat runtime proof, AI
        ingestion, CLI semantic projection, Effect/oRPC procedure-core work,
        and Task 2.9.4 matrix-row acceptance remain pending.
  - [x] 4.12.2 Extract App UI snapshot wrapper/source owner while keeping the
        public facade export surface in `index.ts`, leaving lifecycle/setup
        orchestration in the facade while reusing the same internal snapshot
        builder/parser helpers. Later 4.12 rows now own Tuner health, playable
        status, bounded root inspection, capability catalog, catalog schemas,
        and runtime inspection constants, while telemetry, hotseat runtime
        proof, AI ingestion, CLI semantic projection, Effect/oRPC procedure-core
        work, and Task 2.9.4 matrix-row acceptance remain pending.
  - [x] 4.12.3 Extract Tuner health wrapper/source/parser owner while keeping
        public facade call-through and session lifecycle/reconnect execution in
        `index.ts`, preserving the internal wait/setup helper reuse through
        injected session-command execution. Later 4.12 rows now own playable
        status, bounded root inspection, capability catalog, catalog schemas,
        and runtime inspection constants, while telemetry, hotseat runtime
        proof, AI ingestion, CLI semantic projection, Effect/oRPC procedure-core
        work, and Task 2.9.4 matrix-row acceptance remain pending.
  - [x] 4.12.4 Extract proof/log helper owner while keeping the public facade
        export surface in `index.ts`, preserving `snapshotFile` /
        `waitForFreshLogMarkers` behavior and the default scripting-log path,
        while later 4.12 rows now own capability catalog and catalog schemas.
        Operation/proof telemetry, hotseat runtime proof, AI ingestion, CLI
        semantic projection, Effect/oRPC procedure-core work, and Task 2.9.4
        matrix-row acceptance remain pending.
  - [x] 4.12.5 Extract capability catalog source owner while keeping public
        facade exports in `index.ts`, injecting runtime root inspection from the
        facade, preserving static/runtime/official-resource catalog behavior,
        while 4.12.8 now owns the TypeBox catalog schema. Operation/proof
        telemetry, hotseat runtime proof, AI ingestion, CLI semantic projection,
        Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance
        remain pending.
  - [x] 4.12.6 Extract playable-status composition owner while keeping public
        facade exports in `index.ts`, preserving App UI/Tuner health
        composition, shell/playable/readiness classification, and unready error
        capture, while later 4.12 rows now own bounded root inspection and
        catalog schema ownership. Operation/proof telemetry, hotseat runtime
        proof, AI ingestion, CLI semantic projection, Effect/oRPC procedure-core
        work, and Task 2.9.4 matrix-row acceptance remain pending.
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
  - [x] 4.12.11 Extract facade-owned runtime probe helpers into the runtime
        probe owner while preserving the generated `probe` helper source text
        and `probeValue` semantics, and leaving module-local source-string
        helpers, shared serializer ownership, public procedure schemas,
        telemetry, hotseat runtime proof, AI ingestion, CLI semantic
        projection, Effect/oRPC procedure-core work, and Task 2.9.4
        matrix-row acceptance pending.
  - [x] 4.12.12 Extract command-source serializer owner while preserving
        `JSON.stringify` output shape and `command-failed` rejection for
        unserializable command input, and leaving module-local source-string
        helpers, validation helpers, public procedure schemas, telemetry,
        hotseat runtime proof, AI ingestion, CLI semantic projection,
        Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance
        pending.
  - [x] 4.12.12.1 Harden the command-source serializer error boundary so
        `src/runtime/command-serialization.ts` preserves `JSON.stringify`
        output shape while wrapping thrown serialization failures such as
        `BigInt` and circular object inputs in `Civ7DirectControlError` with
        `command-failed` classification. Focused runtime package proof covers
        successful serialization, `undefined` rejection, thrown serializer
        failures, and retained cause evidence. This is command-builder
        plumbing proof only; it does not create a raw command tunnel, change
        embedded source behavior, claim runtime/live-game proof, or accept
        Task 2.9.4 / 5.x / 6.x rows.
  - [x] 4.12.13 Prune the static capability catalog facade call-through by
        letting the catalog owner use the existing GameInfo table default while
        keeping public facade exports stable, preserving static catalog entries,
        runtime catalog dependency injection, official-resource scanner
        behavior, and leaving telemetry, AI ingestion, CLI semantic projection,
        hotseat runtime proof, Effect/oRPC procedure-core work, and Task 2.9.4
        matrix-row acceptance pending.
  - [x] 4.12.14 Prune bounded root inspection facade dependency injection by
        letting the runtime root-inspection owner import existing non-facade
        command execution, parser, validation, serializer, error, and bounds
        constant owners directly, while keeping public facade exports stable,
        preserving root identifier validation, root caps, state defaulting,
        parse label, command serialization, result shape, debug/internal-only
        classification, and leaving telemetry, AI ingestion, CLI semantic
        projection, hotseat runtime proof, Effect/oRPC procedure-core work, and
        Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.12.15 Prune capability catalog facade dependency injection by letting
        `src/catalog/capabilities.ts` import existing non-facade bounded root
        inspection and catalog default owners directly, while keeping public
        facade exports stable, preserving static/runtime catalog construction,
        runtime root caps, generated-output-as-evidence policy,
        official-resource scanner behavior, and leaving telemetry, AI
        ingestion, CLI semantic projection, hotseat runtime proof, Effect/oRPC
        procedure-core work, and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.12.16 Prune App UI snapshot facade dependency injection by letting
        `src/runtime/app-ui-snapshot.ts` import existing non-facade App UI
        command execution directly, while keeping public facade exports stable,
        preserving the generated snapshot command, parse label/result shape,
        lifecycle helper reuse of the builder/parser, debug/internal-only raw
        snapshot classification, and leaving telemetry, AI ingestion, CLI
        semantic projection, hotseat runtime proof, Effect/oRPC procedure-core
        work, and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.12.17 Prune Tuner health facade dependency injection by letting
        `src/runtime/tuner-health.ts` import existing non-facade session and
        reconnect execution owners directly for public health/readiness wrappers,
        while setup/restart lifecycle loops still pass the same session-scoped
        dependency explicitly, preserving Tuner state selection, retry/count
        behavior, readiness wait timing, parse label/result shape, and leaving
        telemetry, AI ingestion, CLI semantic projection, hotseat runtime proof,
        Effect/Bun resource composition, Effect/oRPC procedure-core work, and
        Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.12.18 Prune playable-status facade dependency injection by letting
        `src/runtime/playable-status.ts` import existing non-facade App UI
        snapshot, Tuner health, and error-message owners directly, while keeping
        public facade exports stable, preserving App UI/Tuner composition,
        shell/playable/readiness classification, unready error capture, and
        debug/internal-only status classification, and leaving telemetry, AI
        ingestion, CLI semantic projection, hotseat runtime proof,
        Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance
        pending.
  - [x] 4.12.19 Prune runtime API inspection facade dependency injection by
        letting `src/runtime/inspection.ts` import existing non-facade command
        execution, state-name, and runtime inspection default-root owners
        directly, while keeping public facade exports stable, preserving App
        UI/Tuner default-root selection, caller-provided roots, selected state
        execution, generated inspection command semantics, raw debug/internal
        projection, and leaving telemetry, AI ingestion, CLI semantic
        projection, hotseat runtime proof, Effect/oRPC procedure-core work, and
        Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.12.20 Prune trivial runtime status/inspection facade call-through
        wrappers by re-exporting the runtime owner functions directly from
        `index.ts`, preserving public package imports for runtime API
        inspection, App UI snapshot, Tuner health/readiness, playable status,
        and bounded root inspection while leaving lifecycle/setup composition,
        telemetry, AI ingestion, CLI semantic projection, hotseat runtime proof,
        Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance
        pending.
  - [x] 4.12.21 Prune the remaining capability catalog facade call-through
        wrapper by re-exporting `generateCiv7CapabilityCatalog` directly from
        `src/catalog/capabilities.ts`, preserving the public package import
        name, static/runtime catalog behavior, official-resource fixture scope,
        generated-output-as-evidence policy, and leaving telemetry, AI
        ingestion, CLI semantic projection, hotseat runtime proof, Effect/oRPC
        procedure-core work, and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.12.22 Normalize the unit move-preview command-source helper wiring by
        reusing the shared command-source serializer and runtime probe helper
        owners, preserving generated command text, destination validation,
        `maxPlots`/`maxPathPlots` bounds, conservative relationship policy,
        read-only/no-send behavior, and leaving broader atom-local source
        helper normalization, telemetry, AI ingestion, CLI semantic projection,
        hotseat runtime proof, Effect/oRPC procedure-core work, and Task 2.9.4
        matrix-row acceptance pending.
  - [x] 4.12.23 Normalize the ready-unit and ready-city command-source helper
        wiring by reusing the shared command-source serializer and runtime probe
        helper owners, preserving ready-unit radius/maxOperations bounds,
        ready-city maxOperations bounds, no component-id pre-validation, parse
        labels, read-only/no-send behavior, and leaving ready-city domain source
        internals, broader atom-local source helper normalization, telemetry, AI
        ingestion, CLI semantic projection, hotseat runtime proof, Effect/oRPC
        procedure-core work, and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.12.24 Normalize the tactical read command-source helper wiring by
        reusing the shared command-source serializer and runtime probe helper
        owners from settlement recommendations, target candidates, battlefield
        scan, and destination analysis, preserving generated command text,
        tactical bounds/validation, conservative relationship-label policy,
        read-only/no-send behavior, and leaving tactical runtime object readers,
        broader atom-local source helper normalization, telemetry, AI ingestion,
        CLI semantic projection, hotseat runtime proof, Effect/oRPC procedure-core
        work, and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.12.25 Normalize the progression read command-source helper wiring by
        reusing the shared command-source serializer and runtime probe helper
        owners from traditions view and progress dashboard reads, preserving
        generated command text, player validation, parse labels,
        hidden-info/read-only/no-send behavior, and leaving technology/culture
        closeout mutation sources, broader atom-local source helper
        normalization, telemetry, AI ingestion, CLI semantic projection, hotseat
        runtime proof, Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row
        acceptance pending.
  - [x] 4.12.26 Normalize the notification view command-source helper wiring by
        reusing the shared command-source serializer and runtime probe helper
        owners from the read-only notification HUD/materialization owner,
        preserving generated command text, default `maxNotifications` behavior,
        parse label, decision-hint materialization, read-only/no-send behavior,
        and leaving notification dismissal/verification, scenario expansion,
        broader atom-local source helper normalization, telemetry, AI ingestion,
        CLI semantic projection, hotseat runtime proof, Effect/oRPC
        procedure-core work, and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.12.27 Normalize the notification dismissal command-source helper
        wiring by reusing the shared runtime probe helper owner from the
        notification dismissal embedded source, preserving generated command
        text, approval-first request wrapper behavior, dismissal verification
        polling/classification semantics, read/send split, parse label,
        no-repeat-after-unverified behavior, and leaving broader atom-local
        source helper normalization, telemetry, AI ingestion, CLI semantic
        projection, hotseat runtime proof, Effect/oRPC procedure-core work, and
        Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.12.28 Normalize the progression closeout command-source helper wiring
        by reusing the shared runtime probe helper owner from the technology and
        culture closeout embedded sources, preserving generated command text,
        approval-first request wrapper behavior, player/node validation, read/send
        split, parse labels, semantic notification and operation send shape, and
        leaving broader atom-local source helper normalization, telemetry, AI
        ingestion, CLI semantic projection, hotseat runtime proof, Effect/oRPC
        procedure-core work, and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.12.29 Normalize the turn-completion status command-source helper
        wiring by reusing the shared runtime probe helper owner from
        `src/play/turn-completion.ts`, preserving generated command text,
        approval-first send/unready behavior, guard-first status read, stale
        notification fallback classification, turn-completion action result
        shapes, and leaving broader atom-local source helper normalization,
        telemetry, AI ingestion, CLI semantic projection, hotseat runtime proof,
        Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance
        pending.
  - [x] 4.12.30 Normalize the generic operation router command-source helper
        wiring by reusing the shared runtime probe helper owner from
        `src/play/operations/router.ts`, preserving generated router source,
        validator-first operation routing, approval-first request behavior,
        unit/population/production postcondition snapshot shape, no-repeat
        boundaries, and leaving broader atom-local source helper normalization,
        telemetry, AI ingestion, CLI semantic projection, hotseat runtime proof,
        Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance
        pending.
  - [x] 4.12.31 Normalize the production-choice command-source helper wiring by
        reusing the shared runtime probe helper owner from
        `src/play/operations/production-choice.ts`, preserving generated
        command text, approval-first BUILD request behavior, production
        argument validation, bounded post-send polling, production postcondition
        classification shape, and leaving broader atom-local source helper
        normalization, telemetry, AI ingestion, CLI semantic projection, hotseat
        runtime proof, Effect/oRPC procedure-core work, and Task 2.9.4
        matrix-row acceptance pending.
  - [x] 4.12.32 Normalize the diplomacy response and narrative choice
        command-source helper wiring by reusing the shared runtime probe helper
        owner from `src/play/operations/diplomacy-request.ts` and
        `src/play/operations/narrative-request.ts`, preserving generated
        closeout/request command text, approval-first request behavior,
        validation/no-send paths, UI closeout calls, postcondition
        classification, no-repeat-after-unverified boundaries, and leaving
        broader atom-local source helper normalization, telemetry, AI ingestion,
        CLI semantic projection, hotseat runtime proof, Effect/oRPC
        procedure-core work, and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.12.33 Normalize the unit-target action command-source helper wiring by
        reusing the shared runtime serializer and probe helper owners from
        `src/play/operations/unit-target-action.ts`, preserving generated
        command text, read-vs-send split, approval-first request behavior,
        bounded post-send polling, no-repeat-after-unverified wording, unit
        target postcondition classification, and leaving broader atom-local
        source helper normalization, telemetry, AI ingestion, CLI semantic
        projection, hotseat runtime proof, Effect/oRPC procedure-core work, and
        Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.12.34 Normalize the App UI snapshot and Tuner health command-source
        helper wiring by reusing the shared runtime probe helper owner from
        `src/runtime/app-ui-snapshot.ts` and `src/runtime/tuner-health.ts`,
        preserving generated read-only runtime-status command semantics, App UI
        snapshot parse shape, Tuner readiness parse shape, wait/session
        composition, debug/internal projection boundaries, and leaving broader
        atom-local source helper normalization, telemetry, AI ingestion, CLI
        semantic projection, hotseat runtime proof, Effect/oRPC procedure-core
        work, and Task 2.9.4 matrix-row acceptance pending.
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
  - [x] 4.13.3 Prune turn-completion facade dependency injection by letting
        `src/play/turn-completion.ts` import existing non-facade App UI
        execution, parser, notification-view, and approval owners directly,
        while keeping public facade exports stable, preserving approval-first
        send/unready behavior, guard-first status read, stale notification
        fallback classification, command strings, parse label, action result
        shape, and leaving hotseat runtime proof, AI ingestion, CLI semantic
        projection, telemetry, Effect/oRPC procedure-core work, and Task 2.9.4
        matrix-row acceptance pending.
  - [x] 4.13.4 Prune autoplay facade dependency injection by letting
        `src/play/autoplay.ts` import existing non-facade App UI snapshot,
        App UI execution, approval, validation/bounds, serializer, sleep, and
        timing/default owners directly, while keeping public facade exports
        stable, preserving approval gates, bounded turn/player validation,
        explicit unbounded start semantics, stop-settling/pause behavior,
        command strings, result shapes, and local package proof, and leaving
        hotseat runtime proof, AI ingestion, CLI semantic projection,
        telemetry, Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row
        acceptance pending.
  - [x] 4.13.5 Prune the autoplay status facade call-through wrapper by
        re-exporting `getCiv7AutoplayStatus` directly from
        `src/play/autoplay.ts`, preserving public package imports, status read
        shape, the separate configure/start/stop mutation wrappers, hotseat
        runtime proof, AI ingestion, CLI semantic projection, telemetry,
        Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance
        pending.
  - [x] 4.13.6 Prune the turn-completion status facade call-through wrapper by
        re-exporting `getCiv7TurnCompletionStatus` directly from
        `src/play/turn-completion.ts`, preserving public package imports,
        status read shape, the separate send-turn-complete/send-unready
        mutation wrappers, hotseat runtime proof, AI ingestion, CLI semantic
        projection, telemetry, Effect/oRPC procedure-core work, and Task 2.9.4
        matrix-row acceptance pending.
  - [x] 4.13.7 Prune the autoplay action facade call-through wrappers by
        re-exporting `configureCiv7Autoplay`, `startCiv7Autoplay`, and
        `stopCiv7Autoplay` directly from `src/play/autoplay.ts`, preserving
        public package imports, approval-first mutation behavior, explicit
        unbounded start semantics, stop-settling/pause behavior, command
        strings, result shapes, package/CLI proof, and leaving hotseat runtime
        proof, AI ingestion, CLI semantic projection, telemetry, Effect/oRPC
        procedure-core work, and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.13.8 Prune the turn-completion action facade call-through wrappers by
        re-exporting `sendCiv7TurnComplete` and `sendCiv7TurnUnready` directly
        from `src/play/turn-completion.ts`, preserving public package imports,
        approval-first mutation behavior, stale notification fallback
        classification, turn-completion action result shapes, package/CLI
        proof, and leaving hotseat runtime proof, AI ingestion, CLI semantic
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
  - [x] 4.14.7 Extract setup-phase wait helper ownership into setup reads while
        keeping setup-run composition outside the wait-helper owner, preserving
        shell-phase polling, timeout details, `setup-phase-invalid`
        classification, and existing setup/lifecycle package proof, and leaving
        runtime proof, hotseat runtime proof, AI ingestion, semantic CLI
        projection, telemetry, Effect/oRPC procedure-core work, and Task 2.9.4
        matrix-row acceptance pending.
  - [x] 4.14.8 Prune setup-read facade dependency injection by letting
        `src/setup/reads.ts` import existing non-facade approval, App UI
        execution, parser, serializer, probe, constants, and bounds owners
        directly for setup snapshot, setup map rows, setup map-row refresh, and
        setup-phase waits, while keeping public facade exports stable,
        preserving setup source text/parse labels/approval-first refresh
        behavior, and leaving setup prepare/start/run/restart lifecycle
        composition, runtime proof, hotseat runtime proof, AI ingestion,
        semantic CLI projection, telemetry, Effect/oRPC procedure-core work,
        and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.14.9 Prune setup-preparation facade dependency injection by letting
        `src/setup/prepare.ts` import existing non-facade setup-read defaults,
        command-result parser, and setup option identifier validation directly,
        while keeping public facade exports stable, preserving approval-first
        setup mutation, setup snapshot readback, map-row proof, setup option
        validation, prepare command source, and no-replay package proof, and
        leaving prepared-start/setup-run/restart lifecycle composition, runtime
        proof, hotseat runtime proof, AI ingestion, semantic CLI projection,
        telemetry, Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row
        acceptance pending.
  - [x] 4.14.10 Prune prepared-start facade dependency injection by letting
        `src/setup/start.ts` import existing non-facade setup-read defaults,
        session/reconnect, Tuner-ready wait, map-summary, command-result
        parser, setup constants, and setup option identifier validation
        directly, while keeping public facade exports stable, preserving
        approval-first start, pre-start setup readback, host-game command
        source, begin polling, one-attempt begin send, Tuner/map verification,
        seed mismatch classification, and no-replay package proof, and leaving
        setup-run/restart lifecycle composition, runtime proof, hotseat runtime
        proof, AI ingestion, semantic CLI projection, telemetry, Effect/oRPC
        procedure-core work, and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.14.11 Prune setup-run facade dependency injection by letting
        `src/setup/run.ts` import existing non-facade setup read, setup
        prepare, prepared-start, App UI execution, setup constants, approval,
        bounds, and setup option identifier validation owners directly, while
        keeping public facade exports stable, preserving approval-first run
        orchestration, active-game exit-to-shell guard, exit-to-main-menu
        routing, shell wait, prepare/start chaining, verified result shape, and
        no-replay package proof, and leaving restart/begin lifecycle
        composition, runtime proof, hotseat runtime proof, AI ingestion,
        semantic CLI projection, telemetry, Effect/oRPC procedure-core work,
        and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.14.12 Prune restart/begin facade dependency injection by letting
        `src/setup/restart.ts` import existing non-facade App UI execution,
        command execution, session/reconnect, Tuner-ready wait, and setup
        command/loading-state constant owners directly, while keeping public
        facade exports stable, preserving begin command routing, restart-output
        rejection, begin-ready polling, one-attempt begin send, optional Tuner
        readiness wait, restart lifecycle package proof, and no-replay package
        proof, and leaving runtime proof, hotseat runtime proof, AI ingestion,
        semantic CLI projection, telemetry, Effect/oRPC procedure-core work,
        and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.14.13 Prune the stale setup-read facade helper/import left after
        setup-read dependency ownership moved into `src/setup/reads.ts`, while
        keeping public facade exports stable, preserving setup read/source
        behavior, and leaving setup lifecycle behavior, runtime proof, hotseat
        runtime proof, AI ingestion, semantic CLI projection, telemetry,
        Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance
        pending.
  - [x] 4.14.14 Prune trivial setup read facade call-through wrappers by
        re-exporting `getCiv7SetupSnapshot` and `getCiv7SetupMapRows` directly
        from `src/setup/reads.ts`, preserving public package imports, setup
        snapshot/map-row read behavior, the separate setup map-row visibility
        refresh boundary, setup lifecycle behavior, runtime proof, hotseat
        runtime proof, AI ingestion, semantic CLI projection, telemetry,
        Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance
        pending.
  - [x] 4.14.15 Prune trivial restart/begin lifecycle facade call-through
        wrappers by re-exporting `beginCiv7Game`, `restartCiv7Game`, and
        `restartCiv7GameAndBegin` directly from `src/setup/restart.ts`,
        preserving public package imports, App UI restart/begin command
        routing, restart-output rejection, GameStarted polling, one-attempt
        begin send, optional Tuner readiness wait, restart lifecycle package
        proof, no-replay package proof, and leaving runtime/live-game proof,
        hotseat runtime proof, AI ingestion, semantic CLI projection,
        telemetry, Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row
        acceptance pending.
  - [x] 4.14.16 Prune the setup map-row visibility refresh facade call-through
        wrapper by re-exporting `ensureCiv7SetupMapRowVisible` directly from
        `src/setup/reads.ts`, preserving public package imports, approval-first
        refresh behavior, setup map-row materialization, exit-to-shell refresh
        semantics, setup read/source behavior, setup lifecycle behavior, and
        leaving runtime/live-game proof, hotseat runtime proof, AI ingestion,
        semantic CLI projection, telemetry, Effect/oRPC procedure-core work,
        and Task 2.9.4 matrix-row acceptance pending.
  - [x] 4.14.17 Reconcile the setup preparation facade call-through during
        restack by keeping the public `prepareCiv7SinglePlayerSetup` bridge in
        `index.ts`, because App UI saved-configuration loading remains
        facade-owned. This preserves approval-first setup mutation, saved-config
        preload, setup snapshot readback, map-row proof, setup option
        validation, prepare command source, and no-replay package proof. A
        future cleanup can prune this wrapper only after saved-config App UI
        loading moves below the facade; runtime/live-game proof, hotseat runtime
        proof, AI ingestion, semantic CLI projection, telemetry, Effect/oRPC
        procedure-core work, and Task 2.9.4 matrix-row acceptance remain
        pending.
  - [x] 4.14.18 Prune the prepared-start facade call-through wrapper by
        re-exporting `startPreparedCiv7SinglePlayerGame` directly from
        `src/setup/start.ts`, preserving public package imports,
        approval-first start behavior, pre-start setup readback, host-game
        command source, begin polling, one-attempt begin send, Tuner/map
        verification, seed mismatch classification, no-replay package proof,
        and leaving setup-run lifecycle composition, runtime/live-game proof,
        hotseat runtime proof, AI ingestion, semantic CLI projection,
        telemetry, Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row
        acceptance pending.
  - [x] 4.14.19 Reconcile the setup-run facade call-through during restack by
        keeping `runCiv7SinglePlayerFromSetup` in `index.ts` as the narrow
        composition bridge that injects the saved-config-aware prepare wrapper,
        setup-read owner, setup-start owner, and setup-phase wait owner. This
        preserves approval-first setup/run behavior, active-game exit-to-shell
        guard, exit-to-main-menu command routing, shell wait, prepare/start
        chaining, saved-config preload through run, verified result shape, and
        no-replay package proof. A future cleanup can prune this wrapper only
        after saved-config App UI loading moves below the facade; runtime/live
        proof, hotseat runtime proof, AI ingestion, semantic CLI projection,
        telemetry, Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row
        acceptance remain pending.
- [x] 4.15 Seed a unit-target operation telemetry adapter owner in
      `src/proof/unit-target-telemetry.ts` with focused local proof in
      `test/unit-target-telemetry.test.ts`, preserving approval,
      `validation_pre`, `send_receipt`, `post_read`, `validation_post`,
      postcondition, and `outcome_delta` as separate telemetry slots while
      treating legacy `verified` booleans as source evidence only. This seeds
      the operation/proof telemetry row's operation-atom adapter gap for one
      unit-target action shape only; it does not choose schema technology,
      add persistence, implement AI ingestion, add Effect/oRPC middleware,
      claim runtime/live-game proof, accept Task 2.9.4, or create broad
      adapters for every operation family.
- [x] 4.16 Seed a production-choice operation telemetry adapter owner in
      `src/proof/production-choice-telemetry.ts` with focused local proof in
      `test/production-choice-telemetry.test.ts`, preserving approval,
      `validation_pre`, `send_receipt`, `post_read`, `validation_post`,
      postcondition, `outcome_delta`, `blocker_delta`, and evidence policy as
      separate telemetry slots while treating legacy `verified` booleans as
      source evidence only. This seeds the operation/proof telemetry row's
      operation-atom adapter gap for one production-choice shape only; the
      source-reachable cleared path can summarize confirmed, while missing
      postcondition, validator-blocked no-send, no-state-change,
      blocker-still-live, `validation-changed`, and pending-runtime-proof paths
      remain no-repeat guarded. Defensive enum handling for
      `production-state-changed` is not counted as focused proof for a current
      source-reachable production-choice outcome. It does not choose schema
      technology, add
      persistence, implement AI ingestion, change CLI/debug projections, add
      Effect/oRPC middleware, claim runtime/live-game proof, accept Task 2.9.4,
      or create broad adapters for every operation family.
- [x] 4.17 Seed operation telemetry proof-label guards in
      `src/proof/operation-telemetry.ts` with focused proof in
      `test/operation-telemetry.test.ts`, rejecting `live-runtime-proof` and
      `in-game-observation` evidence labels unless the record boundary is
      explicitly `live-runtime-proof`. This preserves `pending-runtime-proof`
      as a pending evidence class without allowing local tests, planning
      evidence, docs, peer reports, logs, or target-thread evidence to be
      mislabeled as live proof. It does not collect runtime evidence, choose
      schema technology, add persistence, implement AI ingestion, change
      CLI/debug projections, add Effect/oRPC middleware, claim runtime/live-game
      proof, accept Task 2.9.4, or create broad telemetry middleware.
- [x] 4.17.1 Seed a diplomacy-response operation telemetry adapter owner in
      `src/proof/diplomacy-response-telemetry.ts` with focused local proof in
      `test/diplomacy-response-telemetry.test.ts`, preserving approval,
      `validation_pre`, `send_receipt`, `post_read`, `validation_post`,
      postcondition, `outcome_delta`, `blocker_delta`, and evidence policy as
      separate telemetry slots while treating legacy `verified` booleans as
      source evidence only. This seeds the operation/proof telemetry row's
      operation-atom adapter gap for one diplomacy-response shape only; source
      postcondition classifications `turn-unblocked`,
      `diplomacy-blocker-cleared`, and `blocking-notification-changed` can
      summarize confirmed, while missing postcondition, validator-blocked
      no-send, `no-state-change`, `validation-changed`, and
      pending-runtime-proof paths remain no-repeat guarded. It does not choose
      schema technology, add persistence, implement AI ingestion, change
      CLI/debug projections, add Effect/oRPC middleware, claim
      runtime/live-game proof, accept Task 2.9.4, or create broad adapters for
      every operation family.
- [x] 4.17.2 Seed a narrative-choice operation telemetry adapter owner in
      `src/proof/narrative-choice-telemetry.ts` with focused local proof in
      `test/narrative-choice-telemetry.test.ts`, preserving approval,
      `validation_pre`, `send_receipt`, `post_read`, `validation_post`,
      postcondition, `outcome_delta`, `blocker_delta`, and evidence policy as
      separate telemetry slots while treating legacy `verified` booleans as
      source evidence only. This seeds the operation/proof telemetry row's
      operation-atom adapter gap for one narrative-choice shape only; source
      postcondition classifications `turn-unblocked`,
      `narrative-blocker-cleared`, and `narrative-panel-cleared` can summarize
      confirmed, while missing postcondition, validator-blocked no-send,
      `no-state-change`, `validation-changed`, and pending-runtime-proof paths
      remain no-repeat guarded. It does not choose schema technology, add
      persistence, implement AI ingestion, change CLI/debug projections, add
      Effect/oRPC middleware, claim runtime/live-game proof, accept Task 2.9.4,
      or create broad adapters for every operation family.
- [x] 4.17.3 Seed a notification-dismissal operation telemetry adapter owner
      in `src/proof/notification-dismissal-telemetry.ts` with focused local
      proof in `test/notification-dismissal-telemetry.test.ts`, preserving
      approval, `validation_pre`, `send_receipt`, `post_read`,
      `validation_post`, postcondition, `outcome_delta`, `blocker_delta`, and
      evidence policy as separate telemetry slots while treating legacy
      `verified` booleans as source evidence only. This seeds the
      operation/proof telemetry row's operation-atom adapter gap for one
      notification-dismissal App UI action shape only; the source-owned
      postcondition classifications `notification-disappeared`,
      `notification-dismissed`, `engine-queue-cleared`,
      `notification-train-cleared`, `engine-front-moved`, and
      `notification-train-front-moved` can summarize confirmed, while missing
      postcondition, validator-blocked no-send, `not-sent`, `missing-after`,
      `engine-front-still-live`, `no-state-change`, and pending-runtime-proof
      paths remain no-repeat guarded. It does not choose schema technology, add
      persistence, implement AI ingestion, change CLI/debug projections, add
      Effect/oRPC middleware, claim runtime/live-game proof, accept Task 2.9.4,
      or create broad adapters for every operation family.
- [x] 4.17.4 Seed operation telemetry projection-separation proof in
      `src/proof/operation-telemetry.ts` with focused proof in
      `test/operation-telemetry.test.ts`, explicitly routing normal
      CLI/player-agent consumers to the semantic telemetry summary, raw records
      to debug/internal or raw telemetry consumers only, and AI/procedure
      consumers to blocked-until-owned projection states. This preserves useful
      normal action/status/postcondition/no-repeat guidance while keeping raw
      transport/session/proof/debug slots out of normal output. It does not
      change CLI behavior, add telemetry persistence, implement AI ingestion,
      add router/registry/transport code, add Effect/oRPC source, claim
      runtime/live-game proof, accept Task 2.9.4, or start Tasks 6.1-6.9.
- [x] 4.18 Seed a direct-control procedure-core descriptor owner in
      `src/procedure-core.ts` with focused proof in
      `test/procedure-core.test.ts`, defining TypeBox-backed descriptor slots
      for stable atom owners, projection policy, proof boundary, player scope,
      consumer class, and mutation gate metadata. The proof rejects generic raw
      command tunnel descriptors plus repo-local command-source/session
      execution descriptors such as `runtime/command-serialization` /
      `jsLiteral` and `session/execute` / `executeCiv7Command` before they can
      become oRPC procedures, requires mutation descriptors to carry approval,
      validator-first, postcondition, and no-repeat-after-unverified gates, and
      rejects local `live-runtime-proof` claims before runtime-proof ownership
      exists.
      This task also records descriptor runtime validation, typed descriptor
      errors, and correlation policy owner seeds, while keeping telemetry as an
      Effect/oRPC middleware hook rather than a separate transport surface.
      This reduces the Effect/oRPC Procedure Cores row's source/proof owner
      and no-raw-tunnel/proof-label guard gaps only; it does not collect
      runtime evidence, implement Effect/oRPC source, add
      `packages/civ7-control-orpc`, add transport adapters, migrate schemas,
      implement the in-game controller router, claim runtime/live-game proof,
      accept Task 2.9.4, or start Tasks 6.1-6.9.
  - [x] 4.18.1 Record procedure descriptor schema-technology ownership in
        `src/procedure-core.ts` with focused proof in
        `test/procedure-core.test.ts` and public facade proof in
        `test/public-api.test.ts`. Current adjacent procedure descriptors
        declare `schemaTechnology: "typebox"`, while the descriptor guard
        rejects unaccepted `effect-schema` and `zod-adapter` claims before
        procedure promotion. This records the current TypeBox descriptor
        contract and keeps the TypeBox versus Effect Schema disposition
        pending; it does not migrate schemas, deprecate TypeBox, add Effect
        Schema artifacts, implement Effect/oRPC source, add
        `packages/civ7-control-orpc`, add transport adapters, implement the
        in-game controller router, claim runtime/live-game proof, accept Task
        2.9.4, or start Tasks 6.1-6.9.
- [x] 4.19 Seed ready-unit read-atom TypeBox schemas in
      `src/play/ready/unit.ts` with focused proof in
      `test/ready-unit-view.test.ts` and public facade proof in
      `test/public-api.test.ts`. This records one concrete read atom's
      bounded input and result schema owner for future procedure-core
      composition while rejecting out-of-bound input and root-level raw command
      fields. It does not choose Effect Schema, migrate broader contracts,
      implement Effect/oRPC source, add `packages/civ7-control-orpc`, add
      transport adapters, implement the in-game controller router, claim
      runtime/live-game proof, accept Task 2.9.4, or start Tasks 6.1-6.9.
- [x] 4.20 Bind procedure descriptors to schema references in
      `src/procedure-core.ts` with focused proof in
      `test/procedure-core.test.ts` and public facade proof in
      `test/public-api.test.ts`. The descriptor owner now records
      `inputSchema` and `outputSchema` owner/export slots, binds the
      `unit.ready.view` descriptor to the ready-unit TypeBox schema exports,
      rejects schema owners outside `@civ7/direct-control`, rejects
      expression-like schema export names, and rejects schema references to raw
      command-source/session owners. This is descriptor/schema-reference proof
      only; it does not resolve runtime router registration, choose Effect
      Schema, migrate broader contracts, implement Effect/oRPC source, add
      `packages/civ7-control-orpc`, add transport adapters, implement the
      in-game controller router, claim runtime/live-game proof, accept Task
      2.9.4, or start Tasks 6.1-6.9.
- [x] 4.21 Resolve procedure descriptor schema references against explicit
      schema artifacts in `src/procedure-core.ts` with focused proof in
      `test/procedure-core.test.ts` and public facade proof in
      `test/public-api.test.ts`. The descriptor owner now resolves
      `unit.ready.view` input/output schema references to the actual ready-unit
      TypeBox schema artifacts and rejects unresolved referenced artifacts with
      typed descriptor-error details. This is local schema-reference resolution
      proof only; it does not implement runtime router/procedure registration,
      choose Effect Schema, migrate broader contracts, implement Effect/oRPC
      source, add `packages/civ7-control-orpc`, add transport adapters,
      implement the in-game controller router, claim runtime/live-game proof,
      accept Task 2.9.4, or start Tasks 6.1-6.9.
- [x] 4.22 Add an adjacent ready-unit procedure descriptor artifact in
      `src/play/ready/unit-procedure.ts` with focused proof in
      `test/ready-unit-procedure.test.ts` and public facade proof in
      `test/public-api.test.ts`. The descriptor records `unit.ready.view`
      metadata beside the ready-unit atom and schema exports, resolves through
      the existing schema artifact map, and proves its input/output field lists
      name root fields on the resolved TypeBox schemas, including
      `legalOperations` instead of the stale copied fixture field
      `operationCandidates`. This is one local descriptor artifact only; it
      does not implement runtime router/procedure registration, choose Effect
      Schema, migrate broader contracts, implement Effect/oRPC source, add
      `packages/civ7-control-orpc`, add transport adapters, implement the
      in-game controller router, claim runtime/live-game proof, accept Task
      2.9.4, or start Tasks 6.1-6.9.
- [x] 4.23 Guard resolved procedure descriptor field lists in
      `src/procedure-core.ts` with focused proof in
      `test/procedure-core.test.ts`. Schema resolution now rejects
      `inputFields` or `outputFields` that do not exist on the resolved TypeBox
      schema root properties, proving the stale `operationCandidates` fixture
      field cannot be promoted when the ready-unit descriptor output schema
      exposes `legalOperations`. This is local descriptor resolver proof only;
      it does not implement runtime router/procedure registration, choose
      Effect Schema, migrate broader contracts, implement Effect/oRPC source,
      add `packages/civ7-control-orpc`, add transport adapters, implement the
      in-game controller router, claim runtime/live-game proof, accept Task
      2.9.4, or start Tasks 6.1-6.9.
- [x] 4.24 Add ready-city read-atom TypeBox schemas and an adjacent procedure
      descriptor artifact in `src/play/ready/city.ts` and
      `src/play/ready/city-procedure.ts`, with focused proof in
      `test/ready-city-view.test.ts`, `test/ready-city-procedure.test.ts`, and
      public facade proof in `test/public-api.test.ts`. This records
      `city.ready.view` beside the existing ready-city atom, validates bounded
      `cityId`/`maxOperations` input, validates the ready-city result root
      including `legalOperations`, `productionCandidates`, `townFocusOptions`,
      and `populationPlacement`, rejects root-level raw command fields, and
      resolves the descriptor's schema references through the generic
      schema-root field-list guard. Complex nested runtime values remain
      bounded TypeBox owner fields with `unknown` where no stable nested
      contract is accepted yet. This is a second local read-atom
      schema/descriptor artifact only; it does not implement runtime
      router/procedure registration, choose Effect Schema, migrate broader
      contracts, implement Effect/oRPC source, add `packages/civ7-control-orpc`,
      add transport adapters, implement the in-game controller router, claim
      runtime/live-game proof, accept Task 2.9.4, or start Tasks 6.1-6.9.
- [x] 4.25 Add unit move-preview read-atom TypeBox schemas and an adjacent
      procedure descriptor artifact in `src/play/ready/move-preview.ts` and
      `src/play/ready/move-preview-procedure.ts`, with focused proof in
      `test/unit-move-preview.test.ts`,
      `test/unit-move-preview-procedure.test.ts`, and public facade proof in
      `test/public-api.test.ts`. This records `unit.move.preview` beside the
      existing read-only unit move-preview atom, validates bounded
      `unitId`/`destination`/`maxPlots`/`maxPathPlots` input, exports a shared
      `Civ7MapLocationSchema` from the map type owner that matches the existing
      `validateMapLocation` integer `0..1_000_000` boundary, validates the
      move-preview result root including reachability, queued/requested
      destination/path, and neutral `relationshipPolicy`, rejects root-level
      raw command fields, and resolves the descriptor's schema references
      through the generic schema-root field-list guard. Complex engine-derived
      movement/path values remain bounded TypeBox owner fields with `unknown`
      where no stable nested contract is accepted yet. This is a third local
      read-atom schema/descriptor artifact only; it does not implement runtime
      router/procedure registration, choose Effect Schema, migrate broader
      contracts, implement Effect/oRPC source, add `packages/civ7-control-orpc`,
      add transport adapters, implement the in-game controller router, claim
      runtime/live-game proof, accept Task 2.9.4, or start Tasks 6.1-6.9.
  - [x] 4.26 Add playable-status runtime-support TypeBox schemas and an adjacent
      procedure descriptor artifact in
      `src/runtime/{app-ui-snapshot,tuner-health,playable-status}.ts` and
      `src/runtime/playable-status-procedure.ts`, with focused proof in
      `test/runtime-and-catalog.test.ts`,
      `test/playable-status-procedure.test.ts`, and public facade proof in
      `test/public-api.test.ts`. This records `runtime.playable.status` beside
      the existing `getCiv7PlayableStatus` atom, keeps endpoint/session
      selection out of the empty procedure input schema so host/port/state/raw
      command remain context/debug-owned, validates App UI snapshot, Tuner
      health, and composed playable-status result shapes, validates both
      `tuner-ready` and non-ready shell/unavailable/error shapes including
      optional omitted `tuner`, failed probes, and `errors` evidence, rejects
      root-level raw command fields, and resolves the descriptor's schema
      references through the generic schema-root field-list guard. This is a
      local runtime-support schema/descriptor artifact only; it does not
      implement runtime router/procedure registration, choose Effect Schema,
      migrate broader contracts, implement Effect/oRPC source, add
      `packages/civ7-control-orpc`, add transport adapters, implement the
      in-game controller router, claim runtime/live-game proof, accept Task
      2.9.4, or start Tasks 6.1-6.9.
  - [x] 4.27 Add procedure-core context-policy metadata to the direct-control
        descriptor owner and current adjacent descriptors, with focused proof in
        `test/procedure-core.test.ts` and public facade proof in
        `test/public-api.test.ts`. This records context requirements for the
        direct-control facade, endpoint defaults, Tuner/App UI state selection,
        logger, evidence sink, and playable-status live-session policy, and
        rejects host/port/state procedure input fields when endpoint/state
        selection is declared context-owned while leaving raw command/session
        fields under the existing no-raw-command-tunnel guard. This is local
        descriptor metadata/proof only; it does not implement middleware,
        generate correlation IDs at runtime, add router/procedure behavior,
        choose Effect Schema, add Effect/oRPC source, add
        `packages/civ7-control-orpc`, add transport adapters, implement the
        in-game controller router, claim runtime/live-game proof, accept Task
        2.9.4, or start Tasks 6.1-6.9.
  - [x] 4.28 Add local procedure-core payload validation helpers in
        `src/procedure-core.ts` with focused proof in
        `test/procedure-core.test.ts` and public facade proof in
        `test/public-api.test.ts`. This validates procedure input and output
        payloads against explicit resolved TypeBox schema artifacts for current
        descriptors, proving ready-unit bounded input, unit move-preview
        validator-equivalent map-location bounds, ready-unit output shape, and
        raw root-field rejection without executing atoms or registering a
        router. This is local schema-payload validation proof only; it does not
        implement runtime router/procedure registration, choose Effect Schema,
        migrate broader contracts, add Effect/oRPC source, add
        `packages/civ7-control-orpc`, add transport adapters, implement the
        in-game controller router, claim runtime/live-game proof, accept Task
        2.9.4, or start Tasks 6.1-6.9.
  - [x] 4.29 Add a no-network procedure-core call primitive in
        `src/procedure-core.ts` with focused proof in
        `test/procedure-core.test.ts` and public facade proof in
        `test/public-api.test.ts`. This validates input before an injected
        handler, validates output after the handler, attaches debug/telemetry
        diagnostics separately from the returned output, generates or validates
        correlation IDs according to descriptor policy, and normalizes handler
        failures with typed direct-control error details. This is local
        injected-handler procedure-core proof only; it does not execute live
        direct-control atoms, implement runtime router/procedure registration,
        choose Effect Schema, add Effect/oRPC source, add
        `packages/civ7-control-orpc`, add transport adapters, implement the
        in-game controller router, claim runtime/live-game proof, accept Task
        2.9.4, or start Tasks 6.1-6.9.
  - [x] 4.30 Add the first concrete ready-unit procedure call wrapper in
        `src/play/ready/unit-procedure.ts`, with focused proof in
        `test/ready-unit-procedure.test.ts` and public facade proof in
        `test/public-api.test.ts`. This composes the local procedure-core call
        primitive with the existing `getCiv7ReadyUnitView` atom, validates
        procedure input before atom dependencies run, validates the atom output
        through the descriptor schema artifacts, forwards direct-control
        options to the atom, and keeps procedure diagnostics separate from the
        ready-unit output. This is local no-network proof over fake atom
        dependencies only; it does not execute live direct-control atoms, add a
        router/registry/transport adapter, choose Effect Schema, add
        Effect/oRPC source, add `packages/civ7-control-orpc`, implement the
        in-game controller router, claim runtime/live-game proof, accept Task
        2.9.4, or start Tasks 6.1-6.9.
  - [x] 4.31 Add the adjacent ready-city procedure call wrapper in
        `src/play/ready/city-procedure.ts`, with focused proof in
        `test/ready-city-procedure.test.ts` and public facade proof in
        `test/public-api.test.ts`. This composes the local procedure-core call
        primitive with the existing `getCiv7ReadyCityView` atom, validates
        procedure input before atom dependencies run, validates the atom output
        through the descriptor schema artifacts, forwards direct-control
        options to the atom, and keeps procedure diagnostics separate from the
        ready-city output. This is local no-network proof over fake atom
        dependencies only; it does not execute live direct-control atoms, add a
        router/registry/transport adapter, choose Effect Schema, add
        Effect/oRPC source, add `packages/civ7-control-orpc`, implement the
        in-game controller router, claim runtime/live-game proof, accept Task
        2.9.4, or start Tasks 6.1-6.9.
  - [x] 4.32 Add the adjacent unit move-preview procedure call wrapper in
        `src/play/ready/move-preview-procedure.ts`, with focused proof in
        `test/unit-move-preview-procedure.test.ts` and public facade proof in
        `test/public-api.test.ts`. This composes the local procedure-core call
        primitive with the existing `getCiv7UnitMovePreview` atom, validates
        procedure input before atom dependencies run, validates the atom output
        through the descriptor schema artifacts, forwards direct-control
        options to the atom, preserves the neutral relationship-policy output,
        and keeps procedure diagnostics separate from the move-preview output.
        This is local no-network proof over fake atom dependencies only; it
        does not execute live direct-control atoms, add a router/registry/
        transport adapter, choose Effect Schema, add Effect/oRPC source, add
        `packages/civ7-control-orpc`, implement the in-game controller router,
        claim runtime/live-game proof, accept Task 2.9.4, or start Tasks
        6.1-6.9.
  - [x] 4.33 Add the adjacent playable-status procedure call wrapper in
        `src/runtime/playable-status-procedure.ts`, with focused proof in
        `test/playable-status-procedure.test.ts` and public facade proof in
        `test/public-api.test.ts`. This composes the local procedure-core call
        primitive with the existing `getCiv7PlayableStatus` runtime-support
        atom, keeps endpoint/session selection in procedure context rather than
        input, validates procedure input before runtime dependencies run,
        validates ready and unavailable outputs through the descriptor schema
        artifacts, forwards direct-control options to the atom, and keeps
        procedure diagnostics separate from playable-status output. This is
        local no-network proof over fake App UI/Tuner dependencies only; it
        does not execute live direct-control atoms, construct final runtime
        context, add middleware, add a router/registry/transport adapter,
        choose Effect Schema, add Effect/oRPC source, add
        `packages/civ7-control-orpc`, implement the in-game controller router,
        claim runtime/live-game proof, accept Task 2.9.4, or start Tasks
        6.1-6.9.
  - [x] 4.34 Add the adjacent App UI snapshot procedure call wrapper in
        `src/runtime/app-ui-snapshot-procedure.ts`, with focused proof in
        `test/app-ui-snapshot-procedure.test.ts` and public facade proof in
        `test/public-api.test.ts`. This adds an empty procedure input schema
        beside the existing `getCiv7AppUiSnapshot` runtime-support atom,
        keeps endpoint/session/state selection in procedure context rather than
        input, validates procedure input before fake command dependencies run,
        validates raw App UI diagnostic output through descriptor schema
        artifacts, forwards direct-control options to the atom, and keeps
        procedure diagnostics separate from App UI snapshot output. This is
        local no-network proof over a fake App UI command dependency only; it
        does not execute live direct-control atoms, construct final runtime
        context, add middleware, add a router/registry/transport adapter,
        choose Effect Schema, add Effect/oRPC source, add
        `packages/civ7-control-orpc`, implement the in-game controller router,
        claim runtime/live-game proof, accept Task 2.9.4, or start Tasks
        6.1-6.9.
  - [x] 4.35 Add the adjacent Tuner health procedure call wrapper in
        `src/runtime/tuner-health-procedure.ts`, with focused proof in
        `test/tuner-health-procedure.test.ts` and public facade proof in
        `test/public-api.test.ts`. This adds an empty procedure input schema
        beside the existing `checkCiv7TunerHealth` runtime-support atom, keeps
        endpoint/session/state selection in procedure context rather than
        input, validates procedure input before fake session dependencies run,
        validates raw Tuner diagnostic output through descriptor schema
        artifacts, forwards direct-control options to the atom, and keeps
        procedure diagnostics separate from Tuner health output. This is local
        no-network proof over fake session/reconnect dependencies only; it
        does not execute live direct-control atoms, construct final runtime
        context, add middleware, add a router/registry/transport adapter,
        choose Effect Schema, add Effect/oRPC source, add
        `packages/civ7-control-orpc`, implement the in-game controller router,
        claim runtime/live-game proof, accept Task 2.9.4, or start Tasks
        6.1-6.9.
  - [x] 4.36 Add the adjacent notification-view procedure atom in
        `src/play/notifications/view-procedure.ts`, with TypeBox input/output
        schemas beside the existing notification read atom in
        `src/play/notifications/view.ts`, focused proof in
        `test/play-notification-view-procedure.test.ts`, adjacent atom schema
        proof in `test/play-notification-view.test.ts`, and public facade proof
        in `test/public-api.test.ts`. This composes the local procedure-core
        call primitive with the existing `getCiv7PlayNotificationView` atom,
        validates bounded `maxNotifications` input before atom dependencies
        run, keeps endpoint/session/state/raw-command selection out of
        procedure input, validates notification/decision/HUD output through
        descriptor schema artifacts, forwards direct-control options to the
        atom, and keeps procedure diagnostics separate from notification-view
        output. This is local no-network proof over fake atom dependencies
        only; it does not change CLI output, notification classification, or
        dismissal behavior, execute live direct-control atoms, add a
        router/registry/transport adapter, choose Effect Schema, add
        Effect/oRPC source, add `packages/civ7-control-orpc`, implement the
        in-game controller router, claim runtime/live-game proof, accept Task
        2.9.4, or start Tasks 6.1-6.9.
  - [x] 4.37 Add the adjacent settlement-recommendations procedure atom in
        `src/play/tactical/settlement-procedure.ts`, with TypeBox input/output
        schemas beside the existing read-only settlement recommendation atom
        in `src/play/tactical/settlement.ts`, focused proof in
        `test/settlement-recommendations-procedure.test.ts`, adjacent atom
        schema proof in `test/settlement-recommendations.test.ts`, and public
        facade proof in `test/public-api.test.ts`. This composes the local
        procedure-core call primitive with the existing
        `getCiv7SettlementRecommendations` atom under the existing `strategy`
        procedure family, validates bounded `count` and map-location input
        before atom dependencies run, keeps endpoint/session/state/raw-command
        selection out of procedure input, validates origin/suggestion output
        through descriptor schema artifacts, forwards direct-control options
        to the atom, and keeps procedure diagnostics separate from settlement
        recommendation output. This is local no-network proof over fake atom
        dependencies only; it does not change CLI output, reinterpret
        recommendations as actions, add city-founding/send behavior, execute
        live direct-control atoms, add a router/registry/transport adapter,
        choose Effect Schema, add Effect/oRPC source, add
        `packages/civ7-control-orpc`, implement the in-game controller router,
        claim runtime/live-game proof, accept Task 2.9.4, or start Tasks
        5.1-5.7 or 6.1-6.9.
  - [x] 4.38 Add the adjacent target-candidates procedure atom in
        `src/play/tactical/target-candidates-procedure.ts`, with TypeBox
        input/output schemas beside the existing read-only target-candidates
        atom in `src/play/tactical/target-candidates.ts`, focused proof in
        `test/target-candidates-procedure.test.ts`, adjacent atom schema proof
        in `test/tactical-reads.test.ts`, and public facade proof in
        `test/public-api.test.ts`. This composes the local procedure-core call
        primitive with the existing `getCiv7TargetCandidates` atom under the
        existing `strategy` procedure family, validates bounded `playerId`,
        `origins`, `maxCandidates`, `maxPlayers`, and `unitRadius` input
        before atom dependencies run, keeps endpoint/session/state/raw-command
        selection out of procedure input, validates the neutral
        `relationshipLabelPolicy` contract as `not-classified` / `none` /
        `relationship-unproven`, forwards direct-control options to the atom,
        and keeps procedure diagnostics separate from target-candidates output.
        This is local no-network proof over fake atom dependencies only; it
        does not change CLI output, reinterpret target candidates as action
        plans, infer hostile/enemy/non-friendly/opponent/threat/war/ally/
        suzerain labels, add attack/move/send behavior, execute live
        direct-control atoms, add a broad tactical catalog, add a
        router/registry/transport adapter, choose Effect Schema, add
        Effect/oRPC source, add `packages/civ7-control-orpc`, implement the
        in-game controller router, claim runtime/live-game proof, accept Task
        2.9.4, or start Tasks 5.1-5.7 or 6.1-6.9.
  - [x] 4.39 Add the adjacent battlefield-scan procedure atom in
        `src/play/tactical/battlefield-procedure.ts`, with TypeBox input/output
        schemas beside the existing read-only battlefield scan atom in
        `src/play/tactical/battlefield.ts`, focused proof in
        `test/battlefield-scan-procedure.test.ts`, adjacent atom schema proof
        in `test/tactical-reads.test.ts`, and public facade proof in
        `test/public-api.test.ts`. This composes the local procedure-core call
        primitive with the existing `getCiv7BattlefieldScan` atom under the
        existing `strategy` procedure family, validates bounded `playerId`,
        `origins`, `radius`, `maxPlayers`, `maxUnits`, and `maxCities` input
        before atom dependencies run, keeps endpoint/session/state/raw-command
        selection out of procedure input, validates the neutral
        `relationshipLabelPolicy` contract as `not-classified` / `none` /
        `relationship-unproven`, rejects row-level relationship proof/label
        promotion beyond `self` or `none`, forwards direct-control options to
        the atom, and keeps procedure diagnostics separate from battlefield
        scan output. This is local no-network proof over fake atom dependencies
        only; it does not change CLI output, reinterpret battlefield scan as
        action planning or validator output, infer hostile/enemy/non-friendly/
        opponent/threat/war/ally/suzerain labels, add attack/move/send
        behavior, execute live direct-control atoms, add a broad tactical
        catalog, add a router/registry/transport adapter, choose Effect Schema,
        add Effect/oRPC source, add `packages/civ7-control-orpc`, implement the
        in-game controller router, claim runtime/live-game proof, accept Task
        2.9.4, or start Tasks 5.1-5.7 or 6.1-6.9.
  - [x] 4.40 Add the adjacent destination-analysis procedure atom in
        `src/play/tactical/destination-procedure.ts`, with TypeBox input/output
        schemas beside the existing read-only destination analysis atom in
        `src/play/tactical/destination.ts`, focused proof in
        `test/destination-analysis-procedure.test.ts`, adjacent atom schema
        proof in `test/tactical-reads.test.ts`, and public facade proof in
        `test/public-api.test.ts`. This composes the local procedure-core call
        primitive with the existing `getCiv7DestinationAnalysis` atom under
        the existing `strategy` procedure family, requires `destination`,
        validates bounded `playerId`, `origin`, `destination`,
        `corridorRadius`, `destinationRadius`, `maxPlayers`, `maxUnits`, and
        `maxCities` input before atom dependencies run, keeps endpoint/session/
        state/raw-command selection out of procedure input, validates the
        neutral `relationshipLabelPolicy` contract as `not-classified` /
        `none` / `relationship-unproven`, rejects row-level relationship
        proof/label promotion beyond `self` or `none`, forwards direct-control
        options to the atom, and keeps procedure diagnostics separate from
        destination analysis output. This is local no-network proof over fake
        atom dependencies only; it does not change CLI output, reinterpret the
        destination lens as pathfinding/route authority, movement/attack/send
        planning, or validator output, infer hostile/enemy/non-friendly/
        opponent/threat/war/ally/suzerain labels, execute live direct-control
        atoms, add a broad tactical catalog, add a router/registry/transport
        adapter, choose Effect Schema, add Effect/oRPC source, add
        `packages/civ7-control-orpc`, implement the in-game controller router,
        claim runtime/live-game proof, accept Task 2.9.4, or start Tasks
        5.1-5.7 or 6.1-6.9.
  - [x] 4.41 Add the adjacent traditions-view procedure atom in
        `src/play/progression/traditions-procedure.ts`, with TypeBox
        input/output schemas beside the existing read-only traditions view atom
        in `src/play/progression/reads.ts`, focused proof in
        `test/traditions-view-procedure.test.ts`, adjacent atom schema proof in
        `test/progression-reads.test.ts`, and public facade proof in
        `test/public-api.test.ts`. This composes the local procedure-core call
        primitive with the existing `getCiv7TraditionsView` atom under the
        existing `strategy` procedure family, validates bounded `playerId`
        input before atom dependencies run, keeps endpoint/session/state/
        raw-command selection out of procedure input, validates tradition
        action-hint output as read-only `CHANGE_TRADITION` affordances rather
        than sends, forwards direct-control options to the atom, and keeps
        procedure diagnostics separate from traditions view output. This is
        local no-network proof over fake atom dependencies only; it does not
        change CLI output, send or validate tradition changes, reinterpret the
        view as action execution, execute live direct-control atoms, add a
        progression taxonomy family or broad progression catalog, add a router/
        registry/transport adapter, choose Effect Schema, add Effect/oRPC
        source, add `packages/civ7-control-orpc`, implement the in-game
        controller router, claim runtime/live-game proof, accept Task 2.9.4, or
        start Tasks 5.1-5.7 or 6.1-6.9.
  - [x] 4.42 Add the adjacent progress-dashboard procedure atom in
        `src/play/progression/progress-dashboard-procedure.ts`, with TypeBox
        input/output schemas beside the existing read-only progress dashboard
        atom in `src/play/progression/reads.ts`, focused proof in
        `test/progress-dashboard-procedure.test.ts`, adjacent atom schema proof
        in `test/progression-reads.test.ts`, and public facade proof in
        `test/public-api.test.ts`. This composes the local procedure-core call
        primitive with the existing `getCiv7ProgressDashboard` atom under the
        existing `strategy` procedure family, validates bounded `playerId`
        input before atom dependencies run, keeps endpoint/session/state/
        raw-command selection out of procedure input, validates age, legacy
        path, victory, triumph, proof-source, and hidden-info output contracts,
        forwards direct-control options to the atom, and keeps procedure
        diagnostics separate from progress dashboard output. This is local
        no-network proof over fake atom dependencies only; it does not change
        CLI output, choose technologies/civics/productions/policies/victory
        strategy, execute live direct-control atoms, add a progression taxonomy
        family or broad progression catalog, add a router/registry/transport
        adapter, choose Effect Schema, add Effect/oRPC source, add
        `packages/civ7-control-orpc`, implement the in-game controller router,
        claim runtime/live-game proof, accept Task 2.9.4, or start Tasks
        5.1-5.7 or 6.1-6.9.
  - [x] 4.43 Add the adjacent map-summary procedure atom in
        `src/play/map/summary-procedure.ts`, with TypeBox input/output schemas
        beside the existing read-only map summary atom in `src/play/map/types.ts`,
        focused proof in `test/map-summary-procedure.test.ts`, adjacent atom
        schema proof in `test/map-and-visibility.test.ts`, and public facade
        schema proof in `test/public-api.test.ts`. This composes the local
        procedure-core call primitive with the existing `getCiv7MapSummary`
        atom under the existing `map` procedure family, validates bounded
        `maxIds` and optional `includeAreaRegionCounts` input before atom
        dependencies run, keeps endpoint/session/state/raw-command selection out
        of procedure input, validates map/game/area runtime-probe output through
        descriptor schema artifacts, forwards direct-control options to the
        atom, and keeps procedure diagnostics separate from map-summary output.
        This is local no-network proof over fake atom dependencies only; it
        does not change CLI output, implement plot snapshot/map grid/GameInfo/
        visibility procedure atoms, execute live direct-control atoms, add a
        broad map catalog, add a router/registry/transport adapter, choose
        Effect Schema, add Effect/oRPC source, add `packages/civ7-control-orpc`,
        implement the in-game controller router, claim runtime/live-game proof,
        accept Task 2.9.4, or start Tasks 5.1-5.7 or 6.1-6.9.
  - [x] 4.44 Add the adjacent plot-snapshot procedure atom in
        `src/play/map/plot-snapshot-procedure.ts`, with TypeBox input/output
        schemas beside the existing read-only plot snapshot atom in
        `src/play/map/types.ts`, focused proof in
        `test/plot-snapshot-procedure.test.ts`, adjacent atom schema proof in
        `test/map-and-visibility.test.ts`, and public facade schema proof in
        `test/public-api.test.ts`. This composes the local procedure-core call
        primitive with the existing `getCiv7PlotSnapshot` atom under the
        existing `map` procedure family, validates map-location integer bounds,
        plot field vocabulary, hidden-info policy, and runtime-probe output
        shape through descriptor schema artifacts, keeps endpoint/session/state/
        raw-command selection out of procedure input, forwards direct-control
        options to the atom, and keeps procedure diagnostics separate from plot
        snapshot output. This is local no-network proof over fake atom
        dependencies only; it does not change CLI output, implement map grid/
        GameInfo/visibility procedure atoms, execute live direct-control atoms,
        add a broad map catalog, add a router/registry/transport adapter, choose
        Effect Schema, add Effect/oRPC source, add `packages/civ7-control-orpc`,
        implement the in-game controller router, claim runtime/live-game proof,
        accept Task 2.9.4, or start Tasks 5.1-5.7 or 6.1-6.9.
  - [x] 4.45 Add the adjacent map-grid procedure atom in
        `src/play/map/grid-procedure.ts`, with TypeBox input/output schemas
        beside the existing read-only map grid atom in `src/play/map/types.ts`,
        focused proof in `test/map-grid-procedure.test.ts`, adjacent atom schema
        proof in `test/map-and-visibility.test.ts`, and public facade schema
        proof in `test/public-api.test.ts`. This composes the local
        procedure-core call primitive with the existing `getCiv7MapGrid` atom
        under the existing `map` procedure family, validates exact bounds-or-
        locations input shape, validator-equivalent map-location/map-bounds
        integer limits, location-list cap, bounded `maxPlots`, plot field
        vocabulary, hidden-info policy, omitted-count output, and plot
        runtime-probe output shape through descriptor schema artifacts, keeps
        endpoint/session/state/raw-command selection out of procedure input,
        forwards direct-control options to the atom, and keeps procedure
        diagnostics separate from map-grid output. This is local no-network
        proof over fake atom dependencies only; it does not change CLI output,
        implement GameInfo/visibility procedure atoms, execute live
        direct-control atoms, add a broad map catalog, add a router/registry/
        transport adapter, choose Effect Schema, add Effect/oRPC source, add
        `packages/civ7-control-orpc`, implement the in-game controller router,
        claim runtime/live-game proof, accept Task 2.9.4, or start Tasks
        5.1-5.7 or 6.1-6.9.
  - [x] 4.46 Add the adjacent GameInfo rows procedure atom in
        `src/play/map/gameinfo-procedure.ts`, with TypeBox input/output
        schemas beside the existing bounded GameInfo rows atom in
        `src/play/map/gameinfo.ts`, focused proof in
        `test/gameinfo-rows-procedure.test.ts`, adjacent atom schema proof in
        `test/runtime-and-catalog.test.ts`, and public facade schema proof in
        `test/public-api.test.ts`. This composes the local procedure-core call
        primitive with the existing `getCiv7GameInfoRows` atom under the
        existing `runtime` procedure family, validates GameInfo table/filter
        identifiers, bounded `limit`/`offset`, lookup/filter/include toggles,
        source `"GameInfo"`, runtime-probe totals, optional schema/primary-key
        probe output, endpoint/session/state/raw-command input exclusion,
        direct-control option forwarding, and output/diagnostics separation.
        This is local no-network proof over fake atom dependencies plus the
        existing fake Tuner fixture only; it does not change CLI output,
        implement visibility procedure atoms, execute live direct-control
        atoms, add a broad map/debug catalog, add a router/registry/transport
        adapter, choose Effect Schema, add Effect/oRPC source, add
        `packages/civ7-control-orpc`, implement the in-game controller router,
        claim runtime/live-game proof, accept Task 2.9.4, or start Tasks
        5.1-5.7 or 6.1-6.9.
  - [x] 4.47 Add the adjacent visibility-summary procedure atom in
        `src/play/map/visibility-procedure.ts`, with TypeBox input/output
        schemas beside the existing bounded visibility summary atom in
        `src/play/map/visibility.ts`, focused proof in
        `test/visibility-summary-procedure.test.ts`, adjacent atom schema
        proof in `test/map-and-visibility.test.ts`, and public facade schema
        proof in `test/public-api.test.ts`. This composes the local
        procedure-core call primitive with the existing
        `getCiv7VisibilitySummary` atom under the existing `map` procedure
        family, validates bounded `playerId`, validator-equivalent map bounds,
        the existing `includeGrid`-requires-`bounds` invariant, bounded
        `maxPlots`, revealed/visible runtime-probe output, counts/grid output,
        endpoint/session/state/raw-command input exclusion, direct-control
        option forwarding, no-reveal command text, and output/diagnostics
        separation. This is local no-network proof over fake atom dependencies
        plus the existing fake Tuner fixture only; it does not wrap
        `revealCiv7MapForPlayer`, change reveal mutation behavior, change CLI
        output, execute live direct-control atoms, add a broad map catalog, add
        a router/registry/transport adapter, choose Effect Schema, add
        Effect/oRPC source, add `packages/civ7-control-orpc`, implement the
        in-game controller router, claim runtime/live-game proof, accept Task
        2.9.4, or start Tasks 5.1-5.7 or 6.1-6.9.
  - [x] 4.48 Add the adjacent turn-completion status procedure atom in
        `src/play/turn-completion-procedure.ts`, with TypeBox input/output
        schemas beside the existing read-only turn-completion status atom in
        `src/play/turn-completion.ts`, focused proof in
        `test/turn-completion-status-procedure.test.ts`, adjacent atom schema
        proof in `test/autoplay-and-turn.test.ts`, and public facade schema
        proof in `test/public-api.test.ts`. This composes the local
        procedure-core call primitive with the existing
        `getCiv7TurnCompletionStatus` atom under the existing `runtime`
        procedure family, validates empty context-owned input, status output
        fields (`turn`, `turnDate`, `hasSentTurnComplete`, `canEndTurn`,
        `blocker`, and `firstReadyUnitId`), endpoint/session/state/raw-command
        input exclusion, direct-control option forwarding, output/diagnostics
        separation, fake-dependency no-network calls, and absence of
        `sendTurnComplete` / `sendUnreadyTurn` command text. This is local
        no-network read-atom proof only; it does not change turn-completion
        send/unready mutation behavior, autoplay behavior, CLI output, execute
        live direct-control atoms, add a router/registry/transport adapter,
        choose Effect Schema, add Effect/oRPC source, add
        `packages/civ7-control-orpc`, implement the in-game controller router,
        claim runtime/live-game proof, accept Task 2.9.4, or start Tasks
        5.1-5.7 or 6.1-6.9.
  - [x] 4.49 Add the adjacent unit-summary procedure atom in
        `src/play/unit-summary-procedure.ts`, with TypeBox input/output
        schemas beside the existing read-only unit summary atom in
        `src/play/summaries.ts`, focused proof in
        `test/unit-summary-procedure.test.ts`, adjacent atom schema proof in
        `test/summary-reads.test.ts`, and public facade schema proof in
        `test/public-api.test.ts`. This composes the local procedure-core call
        primitive with the existing `getCiv7UnitSummary` atom under the
        existing `unit` procedure family, validates bounded `playerId`/
        `playerIds`, component `unitIds`, bounded `maxItems`, `includeHidden`,
        unit runtime-probe output, validator-equivalent map-location output,
        endpoint/session/state/raw-command input exclusion, direct-control
        option forwarding, output/diagnostics separation, fake-dependency
        no-network calls, and absence of send-operation command text. This is
        local no-network read-atom proof only; it does not add player-summary
        or city-summary procedure atoms, change CLI output, execute live
        direct-control atoms, add a broad summary catalog, add a router/
        registry/transport adapter, choose Effect Schema, add Effect/oRPC
        source, add `packages/civ7-control-orpc`, implement the in-game
        controller router, claim runtime/live-game proof, accept Task 2.9.4, or
        start Tasks 5.1-5.7 or 6.1-6.9.
  - [x] 4.50 Add the adjacent city-summary procedure atom in
        `src/play/city-summary-procedure.ts`, with TypeBox input/output
        schemas beside the existing read-only city summary atom in
        `src/play/summaries.ts`, focused proof in
        `test/city-summary-procedure.test.ts`, adjacent atom schema proof in
        `test/summary-reads.test.ts`, and public facade schema proof in
        `test/public-api.test.ts`. This composes the local procedure-core call
        primitive with the existing `getCiv7CitySummary` atom under the
        existing `city` procedure family, validates bounded `playerId`/
        `playerIds`, component `cityIds`, bounded `maxItems`, `includeHidden`,
        city runtime-probe output, validator-equivalent map-location output,
        endpoint/session/state/raw-command input exclusion, direct-control
        option forwarding, output/diagnostics separation, fake-dependency
        no-network calls, and absence of send-operation command text. This is
        local no-network read-atom proof only; it does not add a player-summary
        procedure atom, change CLI output, execute live direct-control atoms,
        add a broad summary catalog, add a router/registry/transport adapter,
        choose Effect Schema, add Effect/oRPC source, add
        `packages/civ7-control-orpc`, implement the in-game controller router,
        claim runtime/live-game proof, accept Task 2.9.4, or start Tasks
        5.1-5.7 or 6.1-6.9.
  - [x] 4.51 Add the adjacent player-summary procedure atom in
        `src/play/player-summary-procedure.ts`, with TypeBox input/output
        schemas beside the existing read-only player summary atom in
        `src/play/summaries.ts`, focused proof in
        `test/player-summary-procedure.test.ts`, adjacent atom schema proof in
        `test/summary-reads.test.ts`, procedure-family proof in
        `test/procedure-core.test.ts`, and public facade schema proof in
        `test/public-api.test.ts`. This adds the narrow `player` procedure
        family needed for the existing player read atom, then composes the
        local procedure-core call primitive with `getCiv7PlayerSummary` as
        `player.summary.read`, validating bounded `playerIds`, bounded
        `maxItems`, include toggles, player runtime-probe output, component-id
        unit/city id output, endpoint/session/state/raw-command input
        exclusion, direct-control option forwarding, output/diagnostics
        separation, fake-dependency no-network calls, and absence of
        send-operation command text. This is local no-network read-atom proof
        only; it does not add a broad player procedure catalog, change CLI
        output, execute live direct-control atoms, add a router/registry/
        transport adapter, choose Effect Schema, add Effect/oRPC source, add
        `packages/civ7-control-orpc`, implement the in-game controller router,
        claim runtime/live-game proof, accept Task 2.9.4, or start Tasks
        5.1-5.7 or 6.1-6.9.
  - [x] 4.52 Add the adjacent unit-target action request procedure atom in
        `src/play/operations/unit-target-action-procedure.ts`, with TypeBox
        input/output schemas beside the existing approved unit-target action
        atom in `src/play/operations/unit-target-action.ts`, focused proof in
        `test/unit-target-action-procedure.test.ts`, existing mutation/no-repeat
        package proof in `test/unit-target-action.test.ts`, mutation-gate proof
        in `test/procedure-core.test.ts`, and public facade schema proof in
        `test/public-api.test.ts`. This composes the local procedure-core call
        primitive with `requestCiv7UnitTargetAction` as
        `unit.target.action.request`, validating component-id input,
        validator-equivalent bounded target coordinates, explicit
        `approvalReason`, optional disposable-session intent,
        approval/validator/postcondition/no-repeat gate metadata,
        caller-provided correlation, endpoint/session/state/raw-command input
        exclusion, direct-control option forwarding, output/diagnostics
        separation, fake-dependency no-network calls, approval object
        construction before the existing atom send path, and no handler
        execution without caller correlation or with invalid input. This is
        local no-network mutation-procedure proof only; it does not execute
        live direct-control atoms, change CLI output, weaken approval/
        validator/postcondition/no-repeat behavior, add a router/registry/
        transport adapter, choose Effect Schema, add Effect/oRPC source, add
        `packages/civ7-control-orpc`, implement the in-game controller router,
        claim runtime/live-game proof, accept Task 2.9.4, or start Tasks
        5.1-5.7 or 6.1-6.9.
  - [x] 4.53 Add the adjacent production-choice request procedure atom in
        `src/play/operations/production-choice-procedure.ts`, with TypeBox
        request/result schemas beside the existing approved production-choice
        atom in `src/play/operations/production-choice.ts` and postcondition
        schemas in `src/play/operations/production-postconditions.ts`.
        Focused proof in `test/production-choice-procedure.test.ts` covers
        descriptor schema resolution, validator-equivalent city/production args
        input, explicit `approvalReason`, mutation gate metadata,
        caller-provided correlation, endpoint/session/state/raw-command input
        exclusion, no-network fake request calls, approval object construction,
        direct-control option forwarding, no handler execution without caller
        correlation or with invalid input, and a procedure-safe result
        projection that omits the atom's raw `command` field. Existing proof in
        `test/production-choice.test.ts` and
        `test/production-choice-telemetry.test.ts` continues to cover the
        official App UI production path, sticky blocker/no-repeat semantics,
        and telemetry guarding. This is local no-network mutation-procedure
        proof only; it does not execute live direct-control atoms, change CLI
        output, weaken approval/validator/postcondition/no-repeat behavior,
        add a router/registry/transport adapter, choose Effect Schema, add
        Effect/oRPC source, add `packages/civ7-control-orpc`, implement the
        in-game controller router, claim runtime/live-game proof, accept Task
        2.9.4, or start Tasks 5.1-5.7 or 6.1-6.9.
  - [x] 4.54 Add the adjacent notification dismissal request procedure atom in
        `src/play/notifications/dismissal-procedure.ts`, with TypeBox request/
        result schemas beside the existing notification dismissal atom in
        `src/play/notifications/dismissal-request.ts` and postcondition/summary
        schemas in `src/play/notifications/postconditions.ts`. The existing
        atom now asserts `notificationId` as a Civ7 ComponentID before building
        App UI commands. Focused proof in
        `test/notification-dismissal-procedure.test.ts` covers descriptor schema
        resolution, explicit `approvalReason`, mutation gate metadata,
        caller-provided correlation, endpoint/session/state/raw-command input
        exclusion, no-network fake request calls, approval object construction,
        direct-control option forwarding, no handler execution without caller
        correlation or with invalid input, output validation for confirmed and
        `engine-front-still-live` guarded postconditions, and root command/raw-
        command output rejection. Adjacent proof in `test/notification-dismissal.test.ts`
        covers malformed notification-id rejection before App UI command
        construction, while `test/notification-dismissal-telemetry.test.ts`
        continues to cover no-repeat guarding for unverified/stale/pending
        notification dismissal telemetry paths. This is local no-network
        mutation-procedure proof only; it does not execute live direct-control
        atoms, change CLI output, weaken approval/validator/postcondition/no-
        repeat behavior, infer repeat safety from legacy `verified`, add a
        router/registry/transport adapter, choose Effect Schema, add
        Effect/oRPC source, add `packages/civ7-control-orpc`, implement the
        in-game controller router, claim runtime/live-game proof, accept Task
        2.9.4, or start Tasks 5.1-5.7 or 6.1-6.9.

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
  - The descriptor owner seed in Task 4.18 provides local package proof for
    procedure keys, projection policy, mutation gate metadata, generic raw
    tunnel rejection, command-source/session-execute owner rejection, and
    local rejection of `live-runtime-proof` claims over example stable atoms.
    Task 4.19 adds one concrete ready-unit read-atom TypeBox input/output
    schema seed for future procedure-core composition.
    Task 4.20 binds the ready-unit descriptor to those schema exports through
    guarded descriptor schema references.
    Task 4.21 resolves those references against explicit TypeBox schema
    artifacts in local descriptor-owner proof.
    Task 4.22 adds the first adjacent ready-unit descriptor artifact and proves
    its field lists match the resolved ready-unit schema root fields.
    Task 4.23 moves that field-list guard into the generic descriptor resolver.
    Task 4.24 adds the second adjacent read-atom schema/descriptor artifact for
    `city.ready.view` over the ready-city decision view.
    Task 4.25 adds the third adjacent read-atom schema/descriptor artifact for
    `unit.move.preview` over the read-only unit movement preview, including a
    map-location schema that matches the existing atom validator boundary.
    Task 4.26 adds an adjacent runtime-support schema/descriptor artifact for
    `runtime.playable.status` over the composed App UI/Tuner playable-status
    atom, including non-ready shell/unavailable/error shape proof and an empty
    procedure input schema that leaves endpoint/session selection in context.
    Task 4.34 adds an adjacent runtime-support schema/descriptor/call artifact
    for `runtime.app.ui.snapshot` over the App UI snapshot atom, including an
    empty procedure input schema that leaves endpoint/session/state selection
    in context and local no-network proof over a fake App UI command
    dependency.
    Task 4.36 adds an adjacent read-atom schema/descriptor/call artifact for
    `notifications.view` over the notification read atom, including bounded
    `maxNotifications` input, notification/decision/HUD output schema proof,
    and local no-network proof over fake atom dependencies.
    Task 4.37 adds an adjacent read-atom schema/descriptor/call artifact for
    `strategy.settlement.recommendations` over the settlement recommendation
    atom, including bounded `count` input, map-location input, origin/
    suggestion output schema proof, and local no-network proof over fake atom
    dependencies.
    Task 4.38 adds an adjacent read-atom schema/descriptor/call artifact for
    `strategy.target.candidates` over the target-candidates atom, including
    bounded target-candidate input, neutral relationship-label-policy output
    proof, and local no-network proof over fake atom dependencies.
    Task 4.39 adds an adjacent read-atom schema/descriptor/call artifact for
    `strategy.battlefield.scan` over the battlefield scan atom, including
    bounded battlefield scan input, neutral relationship-label-policy output
    proof, row-level relationship-proof/label guard proof, and local
    no-network proof over fake atom dependencies.
    Task 4.40 adds an adjacent read-atom schema/descriptor/call artifact for
    `strategy.destination.analysis` over the destination analysis atom,
    including required destination input, map-location and bounded radius/cap
    input proof, neutral relationship-label-policy output proof, row-level
    relationship-proof/label guard proof, and local no-network proof over fake
    atom dependencies.
    Task 4.41 adds an adjacent read-atom schema/descriptor/call artifact for
    `strategy.traditions.view` over the traditions view atom, including bounded
    player input, tradition action-hint output proof, context/raw-command input
    rejection, no-send command text proof, and local no-network proof over fake
    atom dependencies.
    Task 4.42 adds an adjacent read-atom schema/descriptor/call artifact for
    `strategy.progress.dashboard` over the progress dashboard atom, including
    bounded player input, age/legacy/victory/triumph/proof-source output proof,
    context/raw-command input rejection, no-send command text proof, and local
    no-network proof over fake atom dependencies.
    Task 4.43 adds an adjacent read-atom schema/descriptor/call artifact for
    `map.summary.read` over the map summary atom, including bounded `maxIds`
    input, area-count toggle input, context/raw-command input rejection,
    map/game/area runtime-probe output proof, and local no-network proof over
    fake atom dependencies.
    Task 4.44 adds an adjacent read-atom schema/descriptor/call artifact for
    `map.plot.snapshot` over the plot snapshot atom, including validator-
    equivalent map-location bounds, plot field vocabulary proof, hidden-info
    policy output proof, context/raw-command input rejection, plot runtime-probe
    output proof, and local no-network proof over fake atom dependencies.
    Task 4.45 adds an adjacent read-atom schema/descriptor/call artifact for
    `map.grid.read` over the map grid atom, including exact bounds-or-locations
    input proof, validator-equivalent map-bounds/location/list/maxPlots caps,
    plot field vocabulary proof, hidden-info policy output proof, context/raw-
    command input rejection, omitted-count/map/probe output proof, and local
    no-network proof over fake atom dependencies.
    Task 4.46 adds an adjacent runtime/debug read-atom schema/descriptor/call
    artifact for `runtime.gameinfo.rows` over the GameInfo rows atom, including
    GameInfo table/filter identifier proof, bounded limit/offset input,
    lookup/filter/include toggle proof, context/raw-command input rejection,
    source/runtime-probe/schema/primary-key output proof, and local no-network
    proof over fake atom dependencies.
    Task 4.47 adds an adjacent read-atom schema/descriptor/call artifact for
    `map.visibility.read` over the visibility summary atom, including bounded
    player/map-bounds/maxPlots input proof, the existing includeGrid/bounds
    invariant, context/raw-command input rejection, revealed/visible runtime-
    probe output proof, no-reveal command-text proof, and local no-network proof
    over fake atom dependencies.
    Task 4.48 adds an adjacent read-atom schema/descriptor/call artifact for
    `runtime.turn.completion.status` over the turn-completion status atom,
    including empty context-owned input proof, turn-completion status output
    proof, context/raw-command input rejection, no send/unready command-text
    proof, and local no-network proof over fake atom dependencies.
    Task 4.49 adds an adjacent read-atom schema/descriptor/call artifact for
    `unit.summary.read` over the unit summary atom, including bounded
    player/unit/max-items input proof, unit runtime-probe output proof,
    validator-equivalent map-location output proof, context/raw-command input
    rejection, no send-operation command-text proof, and local no-network proof
    over fake atom dependencies.
    Task 4.50 adds an adjacent read-atom schema/descriptor/call artifact for
    `city.summary.read` over the city summary atom, including bounded
    player/city/max-items input proof, city runtime-probe output proof,
    validator-equivalent map-location output proof, context/raw-command input
    rejection, no send-operation command-text proof, and local no-network proof
    over fake atom dependencies.
    Task 4.51 adds the narrow `player` procedure family and an adjacent
    read-atom schema/descriptor/call artifact for `player.summary.read` over
    the player summary atom, including bounded player/max-items input proof,
    include toggle proof, player runtime-probe output proof, component-id
    unit/city id output proof, context/raw-command input rejection, no
    send-operation command-text proof, and local no-network proof over fake atom
    dependencies.
    Task 4.52 adds the first adjacent mutation schema/descriptor/call artifact
    for `unit.target.action.request` over the approved unit-target action atom,
    including component-id input proof, validator-equivalent bounded target
    coordinate proof, approval reason proof, mutation gate metadata, caller
    correlation proof, context/raw-command input rejection, output proof over
    the existing unit-target postcondition shape, and local no-network proof
    over a fake request dependency.
    Task 4.53 adds the second adjacent mutation schema/descriptor/call
    artifact for `city.production.choice.request` over the approved
    production-choice atom, including city/production args input proof,
    approval reason proof, mutation gate metadata, caller correlation proof,
    context/raw-command input rejection, procedure-safe output projection that
    omits raw command text, production postcondition output proof, and local
    no-network proof over a fake request dependency.
    Task 4.54 adds the third adjacent mutation schema/descriptor/call artifact
    for `notifications.dismiss.request` over the notification dismissal atom,
    including component-id notification input proof, approval reason proof,
    mutation gate metadata, caller correlation proof, context/raw-command input
    rejection, notification postcondition output proof for confirmed and guarded
    stale-engine-front paths, root command/raw-command output rejection, and
    local no-network proof over a fake request dependency.
    Task 6.1 remains blocked until Task 2.9.4 row acceptance names final
    procedure/schema/proof owners and tests over concrete procedure
    inputs/outputs beyond the ready-unit, ready-city, unit move-preview,
    runtime-support, notification-view, settlement-recommendations,
    target-candidates, battlefield-scan, destination-analysis, and
    traditions-view, progress-dashboard, map-summary, plot-snapshot, map-grid,
    GameInfo-rows, visibility-summary, turn-completion status, and
    unit-summary, city-summary, player-summary, unit-target action request,
    production-choice request, and notification dismissal request schema seeds,
    descriptor schema-reference binding/resolution, adjacent descriptor/call
    artifacts, mutation gate metadata, and resolver field-list guard.
- [ ] 6.2 Evaluate TypeBox versus Effect Schema before adding or rewriting
      procedure-core/direct-control contract schemas. The decision must cover
      encode/decode affordances, typed errors, oRPC compatibility, test
      ergonomics, existing TypeBox contract coverage, runtime validation
      behavior, duplication cost, migration blast radius, and whether one
      schema technology can safely own internal service contracts plus AI/CLI
      semantic projections.
  - Do not convert existing TypeBox contracts or add Effect Schema artifacts
    until this disposition is recorded and Task 2.9.4 matrix-row acceptance is
    satisfied for the affected surface.
  - Planning evidence from report-only thread
    `019e8efd-a057-7263-83a9-828e49a07b70` is dispositioned as bounded hybrid:
    keep current TypeBox public contracts until a consumer-backed schema slice
    proves replacement value; consider Effect Schema for new/refactored
    Effect-native procedure-core, telemetry, and AI-ingestion contracts where
    decode/encode, transformations, typed parse errors, Effect integration, or
    machine-ingestion ergonomics matter; document any Zod/oRPC adapter as an
    adapter boundary rather than a third durable schema authority.
  - The report disposition is planning evidence, not row acceptance. A concrete
    schema slice still needs TypeBox/Effect Schema/Zod adapter ownership,
    source/proof owners, and tests before Task 2.9.4 or 6.x implementation can
    proceed.
  - Migration acceptance checks remain pending: oRPC schema/procedure
    validation test, error-shape snapshot, encode/decode round trip, Bun
    runtime check, CLI semantic projection test, and AI-ingestion contract
    fixture test.
- [ ] 6.3 Add approval gates, context, correlation IDs, and error shaping.
- [ ] 6.4 Expose transport adapters only after procedure cores are testable.
- [ ] 6.5 Plan Effect `Scope`/resource acquisition, streams/buffers, schedules,
      layers, error modeling, and concurrency usage for direct-control atoms,
      procedure cores, and tests, including the setup/restart readiness waits
      that currently remain dependency-injected during modularization.
- [ ] 6.6 Prefer Bun-native APIs over Node APIs in new/refactored control code
      unless Node is the only practical or clearly better implementation.
- [ ] 6.7 Keep the oclif CLI shell; do not replace it with Effect CLI unless a
      later accepted command-hierarchy spec explicitly authorizes that change.
- [ ] 6.8 Ensure procedure-core schemas compose stable direct-control atoms for
      both live hotseat/autoplay control and AI-intelligence data ingestion
      before exposing transport adapters.
- [ ] 6.9 Plan the in-game controller bridge as an in-process oRPC/Effect
      callable router loaded through Civ7 native `scope="game"` `UIScripts`;
      keep `globalThis.Civ7IntelligenceBridge.invoke(...)` as serialized
      ingress through the existing tuner/App UI boundary into that router, keep
      raw `game exec` as diagnostic/probe substrate only, and do not create a
      hand-maintained App UI method table or ad hoc JSON-envelope product API.

## 7. Verification And Closure

- [x] 7.1 For every test-only slice, run `git diff --check`, focused suite,
      adjacent monolith filter, `bun run check:cli`, `bun run test:cli:play`, and
      ownership scan.
- [x] 7.2 For every direct-control source slice, run direct-control
      tests/check/build plus focused CLI consumers.
- [x] 7.3 For every runtime-changing slice, attach real-game proof or explicit
      `pending-runtime-proof`.
- [x] 7.4 For every CLI semantic-surface slice, prove normal play output omits
      internal service plumbing and that intentional diagnostics are reachable
      only through debug-owned surfaces.
- [x] 7.5 For every Effect/Bun source slice, prove resource cleanup, stream/error
      behavior, and API choice with focused package tests.
- [x] 7.6 Run `bun run openspec -- validate civ7-support-direct-control-modularization --strict`.
- [x] 7.7 Run final downstream realignment and closure checklist.
