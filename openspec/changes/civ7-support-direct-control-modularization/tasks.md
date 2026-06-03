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
- [ ] 4.2 Add or relocate focused direct-control package tests for each atom.
  - [x] 4.2.1 Add public API/primitives package test coverage.
  - [ ] 4.2.2 Add session/framing package test coverage.
  - [ ] 4.2.3 Add unit move preview package test coverage.
- [ ] 4.3 Extract notification view/materialization atom.
- [ ] 4.4 Extract notification dismissal/verification atom.
- [ ] 4.5 Extract ready unit/city view atoms.
- [ ] 4.6 Extract operation validation/send/postcondition atoms.
- [ ] 4.7 Extract tactical/progression/destination/battlefield/target read
  atoms.
- [ ] 4.8 Export stable types/constants only after module owners are defined.
- [ ] 4.9 Import or explicitly cite oRPC architecture authority before any
  oRPC implementation; current support branch has no tracked
  `.agents/skills/civ7-orpc-control-architecture` or
  `packages/civ7-control-orpc` source.

## 5. Effect/oRPC Composition Lane

- [ ] 5.1 Define procedure-core inputs/outputs over direct-control atoms.
- [ ] 5.2 Add TypeBox schema artifacts where procedure surfaces need them.
- [ ] 5.3 Add approval gates, context, correlation IDs, and error shaping.
- [ ] 5.4 Expose transport adapters only after procedure cores are testable.

## 6. Verification And Closure

- [ ] 6.1 For every test-only slice, run `git diff --check`, focused suite,
  adjacent monolith filter, `bun run check:cli`, `bun run test:cli:play`, and
  ownership scan.
- [ ] 6.2 For every direct-control source slice, run direct-control
  tests/check/build plus focused CLI consumers.
- [ ] 6.3 For every runtime-changing slice, attach real-game proof or explicit
  `pending-runtime-proof`.
- [ ] 6.4 Run `bun run openspec -- validate civ7-support-direct-control-modularization --strict`.
- [ ] 6.5 Run final downstream realignment and closure checklist.
