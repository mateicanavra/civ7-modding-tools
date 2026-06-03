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

- Skill audit agent: find canonical `civ7-systematic-workstream` branch and
  import boundary.
- CLI topology agent: enumerate remaining monolith owners, fixtures, and safe
  extraction order.
- Direct-control atom agent: enumerate `index.ts` atom candidates, public
  exports, tests, and runtime-proof boundaries.
- OpenSpec review agent: audit change shape, lane division, and validation
  gates.

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
- OpenSpec validation: pending.
- CLI corpus ledger: pending.
- Direct-control atom corpus: pending.
- Review-disposition ledger: pending.
- Next implementation lane: blocked until corpus ledgers and fixture strategy
  are filled.
