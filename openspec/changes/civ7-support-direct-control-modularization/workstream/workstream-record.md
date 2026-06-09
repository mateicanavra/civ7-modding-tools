# Civ7 Support Direct-Control Modularization Workstream

## Frame

- Objective: migrate accumulated Civ7 play-support behavior from monolithic CLI
  tests and large direct-control source into focused CLI ownership, stable
  direct-control atoms, and later Effect/oRPC composition over those atoms.
- Hard core: player-unblocking authority remains available; proof boundaries
  stay honest; relationship/suzerain labels require official evidence.
- Exterior: no play-thread wakeups while gameplay is parked; no runtime proof
  claims from local tests; no transport-first oRPC; no generated-output edits.
- Falsifier: implementation starts without corpus/task ownership; dirty user
  notes are committed or lost; monolith coverage is duplicated; direct-control
  behavior changes without focused tests/proof; relationship labels outrun
  official evidence.

## Current State

- Worktree:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-watch-civ7-live-play-reference-assembly`
- Stack tip when opened: `codex/add-systematic-workstream-skill-to-support-stack`
- Skill import commit: `0abccba10 docs(skills): add systematic workstream skill`
- Skill review-fix commit:
  `66f9af202 docs(skills): apply systematic workstream review fixes`
- OpenSpec base commit:
  `d2c01f03b docs(openspec): add support modularization workstream`
- Prior test-modularization tip: `4c02bfe71 test(cli): extract dismiss notification queue play tests`
- Gameplay: parked; no play-thread verification requested.

## Protected User Notes

Treat stash messages and paths as authoritative over indices:

- `preserve user direct-control modularization note before dismiss queue slice`
  - `packages/civ7-direct-control/src/index.ts`
- `preserve user effect stream fixture note before notification queue slice`
  - `packages/cli/test/commands/fixtures/tuner-socket-server.ts`
- `preserve user tuner fixture typing note before next play slice`
  - `packages/cli/test/commands/fixtures/tuner-socket-server.ts`
- `preserve user deeper play hierarchy note before ready-unit closure`
  - `packages/cli/test/commands/game/play/NOTE.md`
- `preserve user host-port fixture note before unit-move closure`
  - `packages/cli/test/commands/game/play/unit-move-preview.test.ts`
- `preserve user test-organization note before settlement slice closeout`
  - `packages/cli/test/commands/NOTE.md`

## Parallel Agent Assignments

All launched report-only threads must be read and dispositioned before their
topic is treated as closed. Query failure is not absence; use thread ids,
titles, and parent reports to close the loop.

| Thread id | Title | Wave | Status | Report read | Disposition | Contribution / follow-up |
|---|---|---|---|---|---|---|
| `019e8ac1-b9c2-7b22-a1a8-2ef9f8af9e7a` | Audit systematic workstream skill | older pre-framing | completed, archived | yes | Accepted: full reviewed skill is present above `66f9af202`; no new import needed. | Resolves skill-presence blocker; agents parked below `66f9af202` must move upstack. |
| `019e8ac3-b214-7540-a320-309c5f5482ee` | Inventory CLI play tests | older pre-framing | completed, archived | yes | Accepted as informal inventory; superseded/confirmed by framed CLI thread. | Confirms monolith owners and order: exact dismiss, HUD, priorities. |
| `019e8ac3-b28f-70c2-a98a-60213f5238ec` | Inspect direct-control atoms | older pre-framing | completed, archived | yes | Accepted as informal inventory; superseded/confirmed by framed direct-control thread. | Seeds atom boundaries, runtime-proof classes, and user TODO stash cautions. |
| `019e8ac3-b2ca-7b53-910a-bc6286c4d04b` | Plan Civ7 support refactor | older pre-framing | completed, archived | yes | Accepted review findings; concrete P2 blockers recorded in disposition ledger. | Repairs missing authority ref, stale validation state, baseline-task overclaim, and oRPC authority caveat. |
| `019e8ac9-2992-73f2-b9dd-0226205390c5` | Investigate CLI play topology | framed `/goal` | completed, archived | yes | Accepted as current CLI corpus evidence. | Provides exact test names, fixture strategy, focused/adjacent gates, and relationship-label scans. |
| `019e8ac9-296c-74a3-9d30-f4e3a4f51545` | Investigate direct-control atoms | framed `/goal` | completed, archived | yes | Accepted as current direct-control corpus evidence; source edits remain blocked. | Provides source regions, proposed owners, forbidden owners, needed tests, and proof boundaries. |
| `019e8ac9-2938-7a50-87b9-a1915f35d427` | Review OpenSpec workstream | framed `/goal` | completed, archived | yes | Accepted as current pre-code review. | Confirms implementation remains blocked until row detail and single-writer gates are present. |
| `019e8ad7-dc15-76a0-88f8-bb5210bfd7e9` | Add notification HUD test | framed `/goal` implementation | completed, idle | yes | Accepted as boundary-clean net-new candidate only; proof was incomplete in the isolated worktree because `@civ7/direct-control` build artifacts were unavailable there. | Created local/mode-named `game/play/notification/hud.test.ts`; DRA performed single-writer monolith removal, package wiring, and final gates in the support worktree. |
| `019e8ae4-8b20-79a0-8553-41b71bccb63f` | Add priorities play test | framed `/goal` implementation | completed, idle | yes | Accepted as boundary-clean net-new candidate only; proof was incomplete in the isolated worktree because `vitest` was unavailable there. | Created local `game/play/priorities.test.ts` with priority HUD/ready-unit/ready-city/battlefield fixtures; DRA performed single-writer monolith deletion, package wiring, and final gates in the support worktree. |
| `019e8af1-0303-7ce2-b059-6178542f833e` | Plan direct-control test boundaries | framed `/goal` report-only | completed, idle | yes | Accepted as package-test boundary evidence; no mutation authority. | Identified one broad `packages/civ7-direct-control/test/direct-control.test.ts` suite, missing per-atom package tests, missing atom rows for map/setup/autoplay/turn/root/catalog surfaces, and recommended public API/primitives as first source-adjacent test slice. |
| `019e8af1-427e-7463-a9be-dbdeabbccfdf` | Assess oRPC authority lane | framed `/goal` report-only | completed, idle | yes | Accepted as authority disposition; no mutation authority. | Confirms current support branch lacks tracked `.agents/skills/civ7-orpc-control-architecture` and `packages/civ7-control-orpc`; oRPC stays downstream until authority/source is imported or cited from the relevant branches. |

## Parallelization Rule

Agents may use separate worktrees or a shared visible worktree, but every lane
must have a disjoint write set before editing. The spec owner coordinates
Graphite; no lane may restack, submit, or mutate unrelated stacks. `package.json`
play-script wiring and `packages/cli/test/commands/game.play.test.ts` are
single-owner files for each active slice.

## Agent Framing Protocol

All future agent waves must be framed before delegation:

- Use framing design to state context, objective, hard core, exterior,
  falsifier, required skills, evidence expectations, write-set permissions, and
  return format.
- Treat agents as peer investigators or implementers with explicit evidence
  outputs, not generic helpers.
- Choose reasoning level by task: lower for mechanical inventory, higher for
  architecture, proof, or synthesis.
- Include a `/goal` prefix in instructions for long-running investigation or
  implementation objectives.
- Prefer fresh agents for new topics.
- Reuse an existing agent only when its previous context is intentionally useful.
  If reusing while switching topics, send `/compact`, wait for completion, then
  send the new framed instruction.
- State whether the agent is report-only or may mutate files. Mutating agents
  need disjoint write sets and explicit Graphite constraints.

## Gate State

- Gate 1: framed.
- Gate 2: repo isolated at skill review-fix commit before draft validation.
- OpenSpec validation: passed with
  `bun run openspec -- validate civ7-support-direct-control-modularization --strict`.
- CLI corpus ledger: report findings merged for remaining monolith owners;
  notification HUD and priorities rows completed with parallel candidate
  handoffs and DRA integration proof; `game.play.test.ts` monolith ownership is
  removed.
- Direct-control atom corpus: report findings merged for top-level atom
  boundaries, package-test gaps, and missing public-surface rows; source edits
  remain blocked until the target slice adds package-owned tests/API-shape
  coverage and names proof class.
- Review-disposition ledger: agent/reviewer findings recorded.
- Exact dismiss-notification CLI slice: completed as test-only extraction with
  local fixture ownership and no runtime claim.
- Notification HUD CLI slice: completed as test-only extraction with a
  boundary-clean parallel net-new test candidate, DRA-owned monolith/package
  integration, local HUD fixture ownership, and no runtime claim.
- Priorities CLI slice: completed as test-only extraction with a
  boundary-clean parallel net-new test candidate, DRA-owned monolith/package
  integration, local priority fixture ownership, relationship-label guards, and
  no runtime claim.
- Next implementation lane: direct-control atom planning/tests. Source edits
  remain blocked until atom rows name owners, consumers, proof class, and package
  test coverage.
- oRPC/Effect lane: planning-only in this support branch. Current tracked files
  do not include `.agents/skills/civ7-orpc-control-architecture` or
  `packages/civ7-control-orpc`; later work must import or explicitly cite the
  oRPC authority branch before implementation.
