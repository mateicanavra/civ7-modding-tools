# MapGen Studio dev-watch deploy isolation

## Why

S1.1 `runtime-one-mount` proved the one-mount transport shape, but the live
Play/Save&Deploy proof exposed a pre-existing dev-mode failure introduced by
the `bun --watch` daemon topology: the operation build rewrites
`mods/mod-swooper-maps/dist`, and the daemon imports
`mod-swooper-maps/recipes/*` for the recipe DAG. Those package exports resolve
to `dist/recipes/*.js`, so Bun restarts the daemon mid-operation, kills the
deploy child, and wipes the in-memory operation registries.

This hotfix is S1.1a in the accepted runtime simplification plan. It must land
before S1.2 because every later live proof depends on Play and Save&Deploy
surviving their own deploy step.

## Target Authority Refs

- `docs/projects/studio-runtime-simplification/PLAN.md` — S1.1a hotfix,
  execution discipline, and the program frame: the daemon owns ephemeral truth.
- `openspec/changes/mapgen-studio-runtime-one-mount/` — S1.1 live proof and
  the unified recipe-DAG mount that exposed the import graph issue.
- `apps/mapgen-studio/src/server/daemon/devLive.ts` — dev daemon runs under
  `bun --watch`; hot restarts are expected for source edits, not for the
  operation's own deploy outputs.
- `turbo.json` and `apps/mapgen-studio/src/server/mapConfigs/deploy.ts` — the
  deploy build graph used by both Play and Save&Deploy.

## What Changes

- The daemon-side recipe-DAG service imports Swooper recipe stages from
  `mods/mod-swooper-maps/src/recipes/**` source, not from the package exports
  that resolve to `dist/recipes/**`.
- App TypeScript/Vitest resolver config explicitly recognizes the mod source's
  `@mapgen/domain/*` aliases, keeping the source boundary testable without
  going back through generated package artifacts.
- The Play/Save&Deploy build command runs the `mod-swooper-maps` build task
  with Turbo `--only`, relying on dev startup/package gates for dependency
  builds instead of replaying dependency `dist` outputs during an operation.
- Tests pin both sides of the isolation: no daemon recipe-DAG import from
  `mod-swooper-maps/recipes/*`, and deploy build args include `--only`.
- Vite watch-ignore coverage is broadened to assert all deploy-written mod
  outputs remain ignored by the frontend dev server.

## Non-Goals

- No operation durability across daemon restart. S2.1 owns daemon-truth
  adoption; this slice prevents the operation from causing its own restart.
- No recipe-DAG subprocess/lazy projection unless source import proves
  insufficient.
- No changes to recipe contracts, map generation behavior, mod deploy
  semantics, or the public Studio UI.
- No S1.2 error-spine changes.

## Impact

- `apps/mapgen-studio/src/server/recipeDag/service.ts`
- `apps/mapgen-studio/src/server/mapConfigs/deploy.ts`
- Focused dev-server/deploy tests
- `openspec/changes/mapgen-studio-runtime-one-mount/tasks.md` stale closure
  checkbox is corrected to reflect the already-merged S1.1 PR.

## Verification Gates

- `bun run openspec -- validate mapgen-studio-dev-watch-deploy-isolation --strict`
- Focused app tests for recipe DAG, deploy command, and dev deploy isolation.
- `bun x turbo run check --filter=mapgen-studio`
- Live falsification proof: during Play and Save&Deploy, `serverInstanceId`
  remains stable across the deploy phase and the operation reaches a terminal
  status without the daemon restarting.
