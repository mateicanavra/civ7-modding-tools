# Phase Record

## Phase

- Project: Studio runtime simplification
- Phase: S1.1a `dev-watch-deploy-isolation`
- Owner: Codex DRA implementation lane
- Branch/Graphite stack: `codex/dev-watch-deploy-isolation` stacked on `main`
- Started: 2026-06-13
- Status: closed by S1.1a Graphite lane PR #1679

## Objective

- Target movement: Prevent Play/Save&Deploy from restarting the Bun daemon by
  keeping operation-written mod outputs out of the daemon import graph.
- Non-goals: operation durability across daemon restart; S1.2 error spine;
  recipe contract or UI changes.
- Done condition: focused guards and live proof show deploy does not change
  `serverInstanceId` mid-operation.

## Authority

- Root/subtree `AGENTS.md`: root repo router; `mods/mod-swooper-maps/AGENTS.md`;
  `mods/mod-swooper-maps/src/AGENTS.md`.
- Product refs: `docs/projects/studio-runtime-simplification/PLAN.md`.
- Architecture refs: S1.1 `mapgen-studio-runtime-one-mount`; daemon
  `bun --watch` topology in `apps/mapgen-studio/src/server/daemon/devLive.ts`.
- Project refs: this OpenSpec change.
- Excluded/stale inputs: stale habitat worktree plan; original main checkout
  foreign staged river/lake files.

## Current State

- Repo/Graphite state: fresh worktree at `331534895`, branch
  `codex/dev-watch-deploy-isolation`, Graphite parent `main`.
- Dirty files and owner: only S1.1a implementation/spec files in this
  worktree; one live-proof JSON formatting residue was reverted before
  closure.
- Current code evidence: daemon recipe-DAG service loads Swooper recipe stages
  from `mods/mod-swooper-maps/src/recipes/**`, not generated package
  `recipes/*` exports; deploy plan runs Turbo with `--only`.
- Generated outputs affected: `mods/mod-swooper-maps/dist/**`,
  `mods/mod-swooper-maps/mod/**`, `mods/mod-swooper-maps/src/maps/generated/**`.
- Tests/guards affected: deploy command tests, dev watcher tests, recipe-DAG
  service tests.

## Scope

- Write set: `apps/mapgen-studio/src/server/recipeDag/service.ts`,
  `apps/mapgen-studio/src/server/mapConfigs/deploy.ts`, focused tests,
  S1.1a OpenSpec files, stale S1.1 closure checkbox.
- Protected files: generated `dist/**`, `mod/**`, generated map outputs,
  foreign dirty/staged river/lake files in original main checkout.
- Owners: Studio daemon/runtime, Swooper recipe source as authoring truth.
- Forbidden owners: Bun watch-ignore workaround as primary fix; generated
  artifacts as source authority.
- Consumer impact: none outside Studio dev Play/Save&Deploy reliability.
- Downstream assumptions: later runtime slices can rely on dev live proof.

## Spec/Tasks

- Spec/proposal: `openspec/changes/mapgen-studio-dev-watch-deploy-isolation/`.
- Tasks: `tasks.md`.
- Validation status: strict OpenSpec and full OpenSpec validation passed.

## Review

- Review lanes: owner/architecture, watcher, verification.
- Blocking findings: none remaining.
- Accepted findings repaired: S1.1a inserted before S1.2 because live proofs
  were not meaningful while deploy restarted the daemon; PRE-1/PRE-2 repaired
  by source-owned recipe loading and deploy `--only`.
- Rejected/invalidated/waived/deferred findings: none yet.

## Agent Fleet State

- Active agents: none.
- Completed agents: watcher lane `019ebf78-6ce1-71d0-8e78-05d9586bd703`
  returned `DONT_NOTIFY` on the closure pass.
- Assigned write sets: watcher has no implementation write set.
- Latest evidence by agent: watcher closure pass returned `DONT_NOTIFY`; it
  confirmed source recipe loading, deploy `--only`, guards, one-mount coverage,
  clean diff whitespace, and no generated/runtime residue.
- Open findings by agent: none.
- Running/stale status: watcher closed.
- Integration owner: Codex DRA implementation lane.

## Implementation

- Completed tasks: implementation, focused guards, package/app gates,
  OpenSpec validation, and live Play/Save&Deploy falsification proof.
- Remaining tasks: none.
- Stop conditions triggered: none.

## Verification

- Commands run:
  - `bun run openspec -- validate mapgen-studio-dev-watch-deploy-isolation --strict`
  - `bun run openspec:validate`
  - `bun run --cwd apps/mapgen-studio test -- test/devServer/daemonDeployIsolation.test.ts test/devServer/watchIgnores.test.ts test/mapConfigSave/deployCommand.test.ts test/recipeDag/artifactPresentation.test.ts`
  - `bun run --cwd apps/mapgen-studio test -- test/server/oneMount.test.ts test/server/daemonFetch.test.ts test/recipeDag/artifactPresentation.test.ts test/devServer/daemonDeployIsolation.test.ts test/devServer/watchIgnores.test.ts test/mapConfigSave/deployCommand.test.ts`
  - `bun x turbo run check --filter=mapgen-studio`
  - `bun x turbo run test --filter=@civ7/studio-server --filter=@civ7/control-orpc --filter=@civ7/direct-control`
  - `git diff --check`
- Results: all passed. One-mount guarantees remain covered by the expanded app
  test set and package gates.
- Live proof: daemon preloaded recipe DAG (`17` stages), then Save&Deploy
  accepted `s1-1a-save-mqby26rk` and completed with
  `serverInstanceId=studio-server-mqby0kyi-1zbz`; Play accepted
  `studio-run-in-game-mqby28jd-1zbz` and completed with the same
  `serverInstanceId`.
- Skipped gates and rationale: no intended skipped gate. Direct
  `bun run --cwd apps/mapgen-studio check` is not the repo-correct app gate
  before dependency outputs exist; root Turbo app check was used instead.
- Evidence boundary: local live daemon proof plus local package/app gates.

## Realignment

- Downstream docs/specs/issues updated: S1.1 stale closure checkbox corrected;
  S1.1a tasks/spec/workstream evidence updated.
- Tests/guards updated: daemon import graph, deploy command, watcher ignore,
  and one-mount guards updated and verified.
- Deferrals/triage updated: none.
- Downstream realignment ledger: not needed unless proof changes scope.

## Next Action

- Exact next step: start S1.2 `error-spine` from refreshed `main` after the
  S1.1a Graphite merge/drain lands.
- First files to inspect: S1.2 OpenSpec plan and current Studio operation error
  handling.
- Stop condition: `main` cannot fast-forward to the S1.1a merge result.
