# Workspace Entrypoint Authority Phase Record

## Frame

Gate: 1-8.

Objective: repair the custom-runner regression category by making root Turbo the
visible dependency-freshness authority for normal app/package entrypoints while
preserving explicit diagnostics as explicit diagnostics.

Hard core:
- Root Turbo graph owns cross-workspace dependency freshness.
- Package-local normal entrypoints are leaf-local.
- Package-local deploy scripts are leaf-local; Turbo owns build prerequisites.
- Verification remains executable through dry-runs, lint guardrails, and
  OpenSpec validation.

Exterior:
- Do not remove domain diagnostics just because they perform setup.
- Do not make direct package-local app execution the blessed freshness path.
- Do not hand-edit generated artifacts.

## Current Slice

Write set:
- `package.json`
- `turbo.json`
- `apps/mapgen-studio/package.json`
- `apps/mapgen-studio/src/server/mapConfigs/deploy.ts`
- `apps/mapgen-studio/test/mapConfigSave/**`
- `apps/docs/package.json`
- `mods/mod-swooper-maps/package.json`
- `mods/mod-swooper-civ-dacia/package.json`
- `scripts/lint/lint-workspace-entrypoints.mjs`
- `docs/process/CONTRIBUTING.md`
- `docs/projects/mapgen-studio/RUNBOOK.md`
- `openspec/changes/workspace-entrypoint-authority/**`

## Corpus

Normal entrypoint violations found:
- `apps/mapgen-studio` app-local `dev` and `build` ran dependency preflights.
- `apps/docs` package lifecycle `predev` and `prebuild` built workspace
  dependencies with Bun filters.

Explicit diagnostic setup found and kept outside this slice's preflight
violation set:
- Swooper Maps viz/diagnostic preflight setup.

Package-local deploy orchestration found and repaired:
- `mods/mod-swooper-maps` `deploy` and `deploy:studio` invoked Turbo and Bun
  workspace filters from a package-local script.
- `mods/mod-swooper-civ-dacia` `deploy` invoked the CLI through a Bun workspace
  filter.
- Studio Save/Deploy and Run in Game invoked the package-local deploy script;
  it now invokes the root Turbo `deploy:studio` graph for Swooper Maps.

## Proof Ledger

- Passed: `bun run lint:workspace-entrypoints`
- Passed: MapGen Studio Turbo dry-runs for `dev` and `build`
- Passed: Docs Turbo dry-runs for `dev` and `build`
- Passed: Mod deploy Turbo dry-runs for Swooper Maps deploy, Swooper Maps
  Studio deploy, and Dacia deploy
- Passed: `bun run --cwd apps/mapgen-studio test -- test/mapConfigSave/deployCommand.test.ts test/mapConfigSave/operationState.test.ts`
- Passed: `bunx turbo run check --filter=mapgen-studio --filter=mod-swooper-maps --filter=civ-mod-dacia`
- Passed: `bun run openspec -- validate workspace-entrypoint-authority --strict`
- Passed: `git diff --check`
