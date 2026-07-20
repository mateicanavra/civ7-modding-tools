# Habitat Restack Semantic Handoff - Studio Daemon Source Watch

Status: prep-phase handoff, no restack execution performed

Change set: PR #1990, `agent-S-studio-daemon-watch`, merged as `f23784e7ebf420455481321eea063a9d44d22943` on 2026-06-30

Supersession note (2026-07-09): the `bun-source` export-condition direction
remains active, but the `--watch` daemon-launch guidance below is superseded by
the MapGen Studio Nx dev runner authority and live Run in Game evidence. The
user-facing `mapgen-studio:serve-daemon` target must keep daemon identity stable
while runtime operations write generated content, so it runs
`bun --conditions bun-source src/server/daemon/daemon.ts` without Bun watch.
Treat historical `--watch` references in this handoff as context, not current
authority.

Confidence: Verified for merge/PR/file/static evidence and current file deltas; Corroborated for historical hot-reload claims in the source commit messages; current live stabilization evidence is scoped to Run in Game daemon identity stability and browser status reconciliation, not to the full real-user matrix.

## What Changed

PR #1990 makes the MapGen Studio development daemon watch and execute first-party TypeScript source instead of stale built `dist` packages.

Evidence:

- `gh pr view 1990` reports merged PR #1990, head `agent-S-studio-daemon-watch`, merge commit `f23784e7e`, title `chore(mapgen-studio): run the studio daemon in watch mode (dev:server)`.
- PR #1990 contains four source commits:
  - `2704585d`: add `--watch` to `dev:server`.
  - `4897f629`: add `bun-source` export condition to `@civ7/studio-server` and run `dev:server` with `bun --conditions bun-source --watch`.
  - `3ce385e0`: make `scripts/restart-mapgen-studio.sh` launch the daemon via `bun run dev:server`.
  - `036abb97`: extend `bun-source` exports to `@civ7/control-orpc`, `@civ7/direct-control`, and `@civ7/plugin-mods`.
- The source commit messages, not the short PR body alone, record historical live proof claims: daemon restart on a `studio-server` source edit, runner daemon using `dev:server`, and source/dist resolution plus daemon restarts across the first-party dependency closure. These are historical evidence only; fresh runtime proof remains a later execution gate.
- `git show --name-status f23784e7e` changes:
  - `apps/mapgen-studio/package.json`
  - `apps/mapgen-studio/src/server/daemon/daemon.ts`
  - `packages/civ7-control-orpc/package.json`
  - `packages/civ7-direct-control/package.json`
  - `packages/plugins/plugin-mods/package.json`
  - `packages/studio-server/package.json`
  - `scripts/restart-mapgen-studio.sh`

## Why It Changed

Before this change, the dev daemon imported `@civ7/studio-server` and downstream packages from built `dist`, so server-package edits required a manual rebuild and daemon bounce. `bun --watch` alone did not solve that, because the app module graph still resolved through published package import conditions.

The durable part of the semantic fix is an opt-in export condition:

```text
bun --conditions bun-source src/server/daemon/daemon.ts
```

Only the dev daemon passes the custom `bun-source` condition. Production `serve`, Vite/browser consumers, TypeScript, and ordinary package import resolution keep using `dist`. Do not add Bun watch to the user-facing daemon target; Run in Game materialization writes repo-local runtime files and must not restart the process that owns the active operation registry.

## What Must Not Be Dropped

- Preserve a dev daemon invocation that includes `--conditions bun-source` and excludes Bun watch.
- In Habitat's projectized app, translate this into `apps/mapgen-studio/project.json` target `serve-daemon` or its owning command surface. Do not restore the old inline `nx.targets` object in `apps/mapgen-studio/package.json`.
- Preserve `apps/mapgen-studio/package.json` script `dev:server` if the Habitat command surface still relies on package scripts under `cwd`; otherwise preserve equivalent Nx target command semantics.
- Preserve `bun-source` export condition entries for every first-party package the daemon loads:
  - `@civ7/studio-server`: `.`, `./contract`, `./live-game`
  - `@civ7/control-orpc`: `.`, `./runtime`, `./game-ui`, `./contract`
  - `@civ7/direct-control`: `.`, `./play/*`, `./proof/*` entries present in the package exports
  - `@civ7/plugin-mods`: add/keep an exports map with `.` using `bun-source` and `./package.json`
- Preserve the production/browser safety boundary: custom `bun-source` must remain opt-in to the dev daemon only.
- Preserve `scripts/restart-mapgen-studio.sh` launching the daemon via `bun run dev:server` or the exact Habitat-equivalent target, not a raw `bun src/server/daemon/daemon.ts` invocation.
- Preserve the daemon comment that documents dev-only source resolution, adjusted if the command moves into `project.json`.

## Likely Conflict Surfaces

Verified shallow overlap with the current Habitat stack:

```text
apps/mapgen-studio/package.json
apps/mapgen-studio/src/server/daemon/daemon.ts
packages/civ7-control-orpc/package.json
packages/civ7-direct-control/package.json
packages/plugins/plugin-mods/package.json
packages/studio-server/package.json
```

The highest-risk conflict is `apps/mapgen-studio/package.json` versus Habitat projectization:

- `main` still has inline `nx.targets` and package scripts including `dev`, `dev:frontend`, `dev:server`, `check`, `test`, `build`, `build:vite`, `check:worker-bundle`, and `lint:react-compiler`.
- Habitat moves the app target graph to `apps/mapgen-studio/project.json` and keeps a slim package `scripts` block.
- Correct resolution is not "take main package.json" and not "take Habitat package.json"; it is "keep Habitat projectization while preserving the dev-daemon `bun-source` source-resolution semantics on the owning target/script surface."

Secondary conflict risks:

- Habitat package manifests may have removed package-local `build`/`check` scripts while `main` added `bun-source` exports nearby.
- `scripts/restart-mapgen-studio.sh` is not in the shallow Habitat overlap set, but it can silently remain stale if not checked.
- `bun.lock` may change indirectly after manifest resolution; regenerate only after all manifest decisions are made.

## Preservation Checks

Proof classes are separate:

- Record truth proof: validate package exports structurally, not by grep. A post-restack check should parse the package JSON files and assert every required export key has the exact `bun-source` target:
  - `packages/studio-server/package.json`: `.` -> `./src/index.ts`, `./contract` -> `./src/contract/index.ts`, `./live-game` -> `./src/liveGame/model.ts`.
  - `packages/civ7-control-orpc/package.json`: `.` -> `./src/index.ts`, `./runtime` -> `./src/runtime.ts`, `./game-ui` -> `./src/game-ui.ts`, `./contract` -> `./src/contract.ts`.
  - `packages/civ7-direct-control/package.json`: every non-`./package.json` export present in the final manifest has a `bun-source` value pointing to the matching `./src/**.ts` source path.
  - `packages/plugins/plugin-mods/package.json`: `.` -> `./src/index.ts`, and `./package.json` remains exported.
- Record truth proof: validate the owning daemon command by parsing `apps/mapgen-studio/project.json` and/or `apps/mapgen-studio/package.json`; the final dev daemon path must include `--conditions bun-source`, exclude Bun watch, include `src/server/daemon/daemon.ts`, and keep `cwd`/script ownership executing from `apps/mapgen-studio`.
- Record truth proof: `git grep -- '--conditions bun-source'` should show the dev daemon consumer only, plus documentation/comments. Any new production/browser consumer is a stop condition.
- Record truth proof: `apps/mapgen-studio/package.json` must not reintroduce the superseded inline `nx.targets` block; Habitat's `apps/mapgen-studio/project.json` remains the target owner.
- Record truth proof: `scripts/restart-mapgen-studio.sh` must use `bun run dev:server` or the Habitat-equivalent target rather than raw daemon execution.
- Habitat wrapper behavior: run the relevant Habitat/Nx checks for `mapgen-studio`, `studio-server`, `control-orpc`, `direct-control`, and `plugin-mods` after restack.
- Runtime/product proof: if claimed later, boot the daemon under the dev command and show it resolves first-party source without rebuilding dist. Source hot-restart is no longer a user-facing daemon invariant because active Studio operations must preserve daemon identity.

Non-claims:

- Static export checks do not prove Bun resolution or hot reload.
- Habitat wrapper behavior and typecheck/build checks do not prove the dev daemon resolves source.
- The source commit-message runtime proof is historical evidence, not fresh post-restack proof.

## Unresolved Questions

- Whether `serve-daemon` should call `bun run dev:server` in `apps/mapgen-studio/package.json` or inline the full Bun command in `apps/mapgen-studio/project.json`; either preserves behavior if the command, absence of Bun watch, and cwd are correct.
- Whether package-local `build`/`check` script restoration is desirable for any of the touched packages. Current Habitat task-graph direction suggests preserving Habitat's graph-owned scripts while adding only export-condition semantics.
