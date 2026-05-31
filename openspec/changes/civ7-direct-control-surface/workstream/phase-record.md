# Phase Record

## Phase

- Project: Civ7 Direct Control
- Phase: discovery, spec, implementation, and verification for
  `civ7-direct-control-surface`
- Owner: Codex
- Branch/Graphite stack: `codex/civ7-direct-control-workstream` on top of
  `codex/firetuner-socket-studio-restart`
- Started: 2026-05-31
- Status: implementation and verification complete; Graphite cleanup pending

## Objective

- Target movement: create one repo-owned direct Civ7 control boundary and route
  CLI/Studio through it.
- Non-goals: FireTuner clone, Windows supervisor, Steam workaround, duplicate
  transport ownership, broad automation UI.
- Done condition: OpenSpec change, implementation, tests, docs, verification,
  downstream realignment, clean Graphite state, and zero-context handoff.

## Authority

- Root/subtree `AGENTS.md`: root instructions; package routers to be read before
  touching package files.
- Product refs: direct user goal, `docs/projects/civ7-direct-control/PROJECT-civ7-direct-control.md`,
  `civ7-product-authority`.
- Architecture refs: `civ7-architecture-authority`, OpenSpec source map,
  current CLI/Studio/package ownership after repo mapping.
- Project refs: `docs/projects/civ7-direct-control/workstream/discovery/`.
- Excluded/stale inputs: Windows/FireTuner bridge behavior as primary path unless
  direct socket falsifies.

## Current State

- Repo/Graphite state: branch created with `gt create codex/civ7-direct-control-workstream --no-interactive`.
- Dirty files and owner: pre-existing user/watcher files
  `mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json` and
  `NOTE-TO-DRA.md`; owner must not stage or modify them.
- Current code evidence: `@civ7/direct-control` owns the direct tuner protocol,
  persistent restart/begin sessions, App UI snapshots, and Tuner readiness
  canaries. CLI and Studio call the package boundary; the Windows/FireTuner
  bridge path has been removed from repo-owned runtime control.
- Generated outputs affected: none expected; generated outputs are protected.
- Tests/guards affected: CLI socket tests, CLI command tests, Studio API/build
  tests, OpenSpec validation.

## Scope

- Write set: direct-control source package/module, CLI command wiring, Studio
  runtime control wiring, focused tests, docs, OpenSpec/workstream artifacts.
- Protected files: generated outputs, deployed Mods, logs, lockfiles,
  pre-existing dirty user files.
- Owners: to be finalized after repo surface mapping.
- Forbidden owners: generated outputs, bridge logs, broad `shared` dumping
  grounds, caller-local protocol implementations.
- Consumer impact: CLI and Studio callers should see same or improved runtime
  control behavior with clearer errors.
- Downstream assumptions: FireTuner can remain optional reference evidence.

## Spec/Tasks

- Spec/proposal: `openspec/changes/civ7-direct-control-surface/`.
- Tasks: `openspec/changes/civ7-direct-control-surface/tasks.md`.
- Validation status: `bun run openspec -- validate civ7-direct-control-surface --strict` passed after draft creation.

## Review

- Review lanes: product, architecture, spec, verification.
- Blocking findings: none remain.
- Accepted findings repaired: Studio package-boundary ownership, state-changing
  command replay prevention, CLI wait state selection, workstream freshness, and
  final verification evidence.
- Rejected/invalidated/waived/deferred findings: readiness-command replay was
  invalidated for generic health polling after code inspection; type/autocomplete
  catalog is a later slice, not a closure blocker.

## Agent Fleet State

- Active agents: none.
- Completed agents: repo surface explorer, runtime protocol investigator,
  public corpus investigator, architecture reviewer, verification auditor,
  App UI API investigator, Tuner API investigator, restart/begin investigators.
- Assigned write sets: discovery report files only until implementation split.
- Latest evidence by agent: repo surface report recommends `packages/civ7-direct-control`;
  runtime protocol report confirms direct Civ7 listener, states, read-only
  commands, and repeated new-socket reconnect probes.
- Open findings by agent: none.
- Running/stale status: none.
- Integration owner: Codex.

## Implementation

- Completed tasks: branch, artifact setup, repo/runtime/public-corpus discovery,
  API inventory, OpenSpec proposal, package boundary, CLI/Studio routing,
  bridge removal, persistent session transport, native restart/begin flow, Tuner
  health canary, tests, and live proof.
- Remaining tasks: final full validation, Graphite commit, and closure.
- Stop conditions triggered: none.

## Verification

- Commands run: `git status --short --branch`, `gt ls`, `gt branch info`,
  `bun run openspec -- list`,
  `bun run openspec -- validate civ7-direct-control-surface --strict`,
  `bun run openspec -- validate remove-firetuner-bridge-legacy --strict`,
  `bun run openspec:validate`, `git diff --check`,
  live direct socket probes to `127.0.0.1:4318`, package build/check/tests, CLI
  check/build/focused tests, and Studio build.
- Results: branch created; pre-existing dirty files identified; OpenSpec change
  valid; live `LSQ:` returned `App UI` and `Tuner`; `CMD:65535:1+1` returned
  `2`; `Network.restartGame()` returned `true`; on a fresh started game at
  2026-05-31T18:58:31.563Z, the package-equivalent persistent session observed
  loading states `WaitingForGameplayData` -> `WaitingForLoadingCurtain` ->
  `WaitingForGameCore` -> `WaitingForVisualization` -> `WaitingForUIReady`,
  called `UI.notifyUIReady()`, observed `GameStarted`, then passed a Tuner canary
  (`Game`, `Autoplay`, `GameplayMap`, `Players`, `84x54`, alive ids). Fresh
  `Scripting.log` markers after offset `24957` matched `Creating Context -
  MapGeneration`, `[SWOOPER_MOD]`, and `Destroying Context -  MapGeneration`.
  After implementation, the actual CLI path also passed:
  `game health --json` returned `App UI` and `Tuner`, and
  `game restart --begin --wait-tuner --json --timeout-ms 120000` returned
  restart `true`, begin `null`, final App UI `GameStarted`, and Tuner
  `ready: true`.
- Skipped gates and rationale: root-wide check/test was not run; focused package,
  CLI, Studio, OpenSpec, git whitespace, and live runtime gates cover this slice.
- Evidence boundary: direct transport, state discovery, App UI restart/begin,
  Tuner post-Begin gameplay readiness, and Scripting.log runtime proof. Not a
  full Civ7 process restart proof.

## Realignment

- Downstream docs/specs/issues updated: project reports, OpenSpec artifacts,
  package README, runtime debugging skill guidance, architecture/CLI docs.
- Tests/guards updated: direct-control package tests, CLI restart/exec/health/
  inspect tests, Studio build path.
- Deferrals/triage updated: none yet.
- Downstream realignment ledger: updated for bridge removal and direct-control
  ownership.

## Next Action

- Exact next step: commit the Graphite branch without staging pre-existing user
  dirty files.
- First files to inspect: validation output, `git status --short`, OpenSpec
  task state.
- Stop condition: direct socket proof contradicts project frame.
