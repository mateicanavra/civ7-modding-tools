## Why

The workspace already has Turbo task edges for MapGen Studio dependency
freshness, but normal package-local entrypoints also reintroduced custom
preflight runners that build dependency packages directly. That creates a
hybrid system: root commands use Turbo while app-local commands can silently
perform their own stale-artifact recovery, making the intended dependency
authority hard to see and easy to regress.

## What Changes

- Make normal MapGen Studio app-local `dev` and `build` scripts leaf-local.
- Route Docs dev through the root Turbo graph and remove hidden docs lifecycle
  dependency builds.
- Move package-local deploy scripts to leaf deploy actions and encode their
  workspace build prerequisites in the root Turbo graph.
- Add an executable guardrail that blocks hidden workspace dependency
  orchestration in package-local entrypoints and deploy scripts.
- Update the MapGen Studio runbook and contributing guide so root Turbo
  commands are the dependency-freshness authority.

## Requires

- Existing Bun workspaces and Turbo task graph.
- Existing `workspace-build-pipeline` dependency edges for MapGen Studio and
  Swooper studio recipe artifacts.

## Affected Owners

- Root `package.json`
- `turbo.json`
- `apps/mapgen-studio/package.json`
- `apps/docs/package.json`
- `apps/mapgen-studio/src/server/mapConfigs/deploy.ts`
- `mods/mod-swooper-maps/package.json`
- `mods/mod-swooper-civ-dacia/package.json`
- `scripts/lint/**`
- `docs/process/CONTRIBUTING.md`
- `docs/projects/mapgen-studio/RUNBOOK.md`

## Verification Gates

- `bun run lint:workspace-entrypoints`
- `bunx turbo run dev --filter=mapgen-studio --dry=json`
- `bunx turbo run build --filter=mapgen-studio --dry=json`
- `bunx turbo run dev --filter=@civ7/docs --dry=json`
- `bunx turbo run build --filter=@civ7/docs --dry=json`
- `bunx turbo run deploy --filter=mod-swooper-maps --dry=json`
- `bunx turbo run deploy --filter=civ-mod-dacia --dry=json`
- `bun run --cwd apps/mapgen-studio test -- test/mapConfigSave/deployCommand.test.ts test/mapConfigSave/operationState.test.ts`
- `bunx turbo run check --filter=mapgen-studio --filter=mod-swooper-maps --filter=civ-mod-dacia`
- `bun run openspec -- validate workspace-entrypoint-authority --strict`
- `git diff --check`
