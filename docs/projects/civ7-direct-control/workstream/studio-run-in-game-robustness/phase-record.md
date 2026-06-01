# Phase Record

## Phase

- Project: Civ7 Direct Control
- Phase: studio-run-in-game-robustness
- Owner: Codex
- Branch/Graphite stack: `codex/studio-run-in-game-robustness` on top of
  `codex/placement-authoring-surface-alignment`
- Started: 2026-06-01
- Status: implemented and proofed with bounded live evidence

## Objective

Harden Studio Run in Game into a reliable, recoverable, phase-aware Civ7 launch
workflow across shell/main-menu, running-game, loading, begin-ready,
stale-listener, and failure states.

## Authority

- Direct user goal for this phase.
- Root `AGENTS.md`; package/app routers before touching their files.
- Prior workstream evidence under
  `docs/projects/civ7-direct-control/workstream/studio-run-in-game/`.
- OpenSpec changes for direct-control setup, Studio Run in Game, live sync,
  disposable reload, and workspace build pipeline.
- Repo-local skills: `civ7-open-spec-workstream`,
  `civ7-operational-debugging`, `framing-design`, `team-design`,
  `testing-design`, `turborepo`, and Graphite workflow.

## Scope

- Write set: `packages/civ7-direct-control/**`,
  `apps/mapgen-studio/**`, focused verification scripts, `package.json`,
  `turbo.json`, `openspec/changes/**`, and this workstream directory.
- Protected surfaces: FireTuner/Windows bridge paths, raw Studio setup JS,
  generated `dist/`/`mod/`, deployed Mods, official resources, Civ7 logs, and
  unrelated Graphite stack files.

## Acceptance Criteria

- Main menu/shell App UI classifies as setup-control ready, not broken health.
- Run in Game phases are explicit, durable, and resumable by request id.
- Run in Game does not refresh/reset the Studio tab or lose operation status
  before a terminal/resumable state is recorded.
- Structured failures include phase, failure class, materialization, reload,
  direct-control code, completed phases, and copyable diagnostics.
- Mutating operations are not silently replayed after uncertainty.
- Tests and live proof cover shell/menu, running-game, durable, disposable,
  stale-listener/LSQ, and recovery boundaries where available.

## Agent Fleet State

- Completed agents:
  - Direct-control lifecycle and readiness:
    `agent-direct-control-lifecycle.md`.
  - Studio/Vite robustness:
    `agent-studio-vite-robustness.md`.
  - Verification gaps and proof matrix:
    `agent-verification-gap-matrix.md`.
  - Product/UX recovery surface:
    `agent-ux-recovery-surface.md`.
- Active agents: none. A stale prior build-pipeline agent was closed during
  closure.

## Verification Log

- `git status --short --branch`: clean at phase open.
- `gt branch create codex/studio-run-in-game-robustness --no-interactive`:
  branch created with no commit.
- `bun run openspec -- list`: baseline listed active dependent changes;
  `studio-run-current-map-config` and `studio-live-civ7-map-sync` still had
  unchecked proof/test tasks from prior work.
- `bun run --cwd packages/civ7-direct-control test && bun run --cwd
  packages/civ7-direct-control check && bun run --cwd
  packages/civ7-direct-control build`: passed.
- `bun run --cwd apps/mapgen-studio check && bun run --cwd apps/mapgen-studio
  test`: passed.
- `bun run openspec -- validate studio-run-in-game-robustness --strict`: passed.
- `bun run openspec:validate`: passed.
- `bun run --cwd mods/mod-swooper-maps test:studio-run-in-game`: passed after
  fixing the stale shipped-map identity test to assert compiled internal
  envelopes.
- `bun run verify:studio-run-in-game`: passed.
- Live shell/menu proof: passed with App UI-only shell classified as `shell`.
- Browser click proof: passed with request id
  `studio-run-in-game-mpuoew2b-ix3`; operation completed and resumed after a
  browser reload.

## Closure Notes

- Reliable now: shell/menu Run in Game disposable launch from the Studio button,
  phase/status polling, browser reload resume within the same dev-server
  lifetime, shell-safe live status, setup row proof, start/begin proof, Tuner
  readiness, runtime seed/dimension proof, and Swooper log marker proof.
- Bounded: durable built-in config launch was not live-replayed in this phase;
  stale listener/LSQ failure was not live-injected; operation records are
  in-memory and do not survive a dev-server process restart.
