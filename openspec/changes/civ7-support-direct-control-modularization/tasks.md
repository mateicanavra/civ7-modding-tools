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
- [ ] 4.4 Extract notification dismissal/verification atom.
  - [x] 4.4.1 Extract notification dismissal embedded source owner while
        keeping wrapper-level polling and verification helpers in the facade.
- [x] 4.5 Extract ready unit/city view atoms.
  - [x] 4.5.1 Extract unit move preview embedded source owner while keeping
        the public wrapper in the facade.
  - [x] 4.5.2 Extract ready-unit embedded source owner while keeping the public
        wrapper in the facade.
  - [x] 4.5.3 Extract ready-city embedded source owner while keeping the public
        wrapper in the facade.
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

## 5. CLI Semantic Surface Lane

- [ ] 5.1 Define normal play-command response envelopes from the perspective of
      a player agent.
- [ ] 5.2 Move or reserve transport/session/proof internals for explicit debug
      commands or debug flags.
- [ ] 5.3 Add tests that normal play outputs omit internal direct-control
      plumbing while still preserving actionable state-machine status,
      blockers, and next steps.
- [ ] 5.4 Reduce large CLI JSON outputs by projecting direct-control service
      results into semantic game state, action results, and decision affordances.

## 6. Effect/Bun And Effect/oRPC Composition Lane

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
