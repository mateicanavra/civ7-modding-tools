# Project: Node LTS Upgrade

**Status:** Planned
**Target:** Standardize this repository on the latest Node.js LTS through Volta and root-level repo pins.
**Created:** 2026-06-25

## Objective

Move the repo from the current Node 22 line to the latest Node.js LTS, `24.18.0`, using one clear repository-level toolchain contract. The preferred final shape is intentionally simple:

- one root `.nvmrc` with `24.18.0`
- one root `package.json` `engines.node` value
- one root `package.json` `volta.node` pin
- CI reads the same intended version explicitly
- no redundant per-package `engines.node` entries unless a package proves it genuinely needs a different Node version

Do not execute this upgrade until the implementation turn. This document is the source-backed plan for that turn.

## Current State

Official release state as of 2026-06-25:

- Latest Node.js LTS: `24.18.0` (`Krypton`)
- Latest Node.js Current/stable release: `26.4.0`
- Current repo pin: `22.22.0`
- Node 22 remains LTS, but it is no longer the newest LTS line.

Local Volta state observed during discovery:

- `node@22.22.0` is the current Volta default.
- `node@24.18.0` is already installed and usable via `volta run --node 24.18.0 ...`.
- `volta list all` currently reports a Yarn image permissions issue under `~/.volta/tools/image/yarn`; Node-specific Volta commands still work.

## Existing Node Version Surfaces

Authoritative or active surfaces to update:

- `.nvmrc`: currently `22.22.0`
- root `package.json`: `engines.node` currently `22.22.0`
- root `package.json`: `@types/node` currently `^22.19.21`
- root `package.json`: `overrides["@types/node"]` currently `^22.19.21`
- `bun.lock`: records `@types/node@22.19.21`
- `.github/workflows/ci.yml`: `actions/setup-node` currently `22.14.x`
- `.github/workflows/publish.yml`: `actions/setup-node` currently `22.14.x`
- `.github/workflows/railway-preview.yml`: `actions/setup-node` currently `22.14.x`
- `.github/workflows/railway-preview-reconcile.yml`: `actions/setup-node` currently `22.14.x`
- `README.md`: currently says Node `22.22.0`
- `docs/process/CONTRIBUTING.md`: currently says Node `22.14+`
- `packages/cli/AGENTS.md`: currently says Node `>= 22.14` / `22.22.0`
- `tools/habitat-harness/src/generators/scaffold/project/support/writer.ts`: currently emits `node: "22.22.0"`

Redundant package-level `engines.node` entries currently all repeat `22.22.0`:

- `mods/mod-swooper-civ-dacia/package.json`
- `packages/civ7-control-orpc/package.json`
- `packages/civ7-direct-control/package.json`
- `packages/cli/package.json`
- `packages/config/package.json`
- `packages/mapgen-viz/package.json`
- `packages/plugins/plugin-files/package.json`
- `packages/plugins/plugin-git/package.json`
- `packages/plugins/plugin-graph/package.json`
- `packages/plugins/plugin-mods/package.json`
- `packages/sdk/package.json`
- `packages/studio-server/package.json`

Preferred implementation is to remove these repeated per-package `engines.node` fields and rely on the root contract. Keep or add package-level engines only if verification reveals a package-specific runtime requirement.

Archived docs may mention Node 22, but they are not active authority and should not drive the implementation. Update them only if a live link or generator consumes them.

## Compatibility Read

Package metadata checked during discovery does not show a Node 24 blocker:

- `vite@7.3.1`: supports `^20.19.0 || >=22.12.0`
- `vitest@4.0.18`: supports `^20.0.0 || ^22.0.0 || >=24.0.0`
- `oclif@4.23.14`: supports `>=18.0.0`
- `@biomejs/biome@2.4.16`: supports `>=14.21.3`
- `@getgrit/cli@0.1.0-alpha.1743007075`: supports `>=14`
- `@fission-ai/openspec`: supports `>=20.19.0`
- `esbuild@0.27.2`, `tsup@8.5.1`, and `typescript@5.9.3` are compatible by declared engine ranges.

Local Node 24 probes already run:

- `volta run --node 24.18.0 node --version` -> `v24.18.0`
- `volta run --node 24.18.0 node tools/habitat-harness/bin/run.js verify --help` passed
- `volta run --node 24.18.0 bun run check` in `tools/habitat-harness` passed
- `volta run --node 24.18.0 bun run check` in `packages/civ7-control-orpc` passed
- `volta run --node 24.18.0 bun run check` in `packages/sdk` passed

Observed failures in `packages/cli` and `packages/studio-server` were also present under Node 22. They are dependency-freshness / workspace build-output issues for `@civ7/control-orpc` and `@civ7/plugin-graph`, not evidence of Node 24 incompatibility.

## Target Implementation Strategy

1. Install or select the Volta default outside the repo when desired:

   ```bash
   volta install node@24.18.0
   node --version
   ```

2. Pin the project with Volta in the repo:

   ```bash
   volta pin node@24.18.0
   ```

   This should add or update root `package.json` `volta.node`. Keep root `engines.node` aligned with the same exact version unless the repo intentionally chooses a range later.

3. Update `.nvmrc` to `24.18.0`.

4. Update CI `setup-node` values to `24.18.0` or `24.18.x`. Prefer exact `24.18.0` if the goal is fully reproducible local/CI parity.

5. Update root Node type dependencies:

   - Use the Node 24 type line, not `@types/node@latest` if latest has moved to Node 26.
   - Discovery found current available Node 24 type package as `@types/node@24.13.2`.
   - Update root `devDependencies["@types/node"]` and `overrides["@types/node"]` together, then regenerate `bun.lock`.

6. Remove redundant per-package `engines.node` values that only mirror the root pin. If a package has no remaining `engines` fields, remove the empty `engines` object.

7. Update active docs and generator defaults:

   - `README.md`
   - `docs/process/CONTRIBUTING.md`
   - `packages/cli/AGENTS.md`
   - `tools/habitat-harness/src/generators/scaffold/project/support/writer.ts`

8. Regenerate lockfile through Bun, not manual edits:

   ```bash
   bun install
   ```

   If `--frozen-lockfile` fails after package edits, run regular `bun install` once to refresh `bun.lock`, then verify with `bun install --frozen-lockfile`.

## Proof Plan

Minimum proof for the implementation turn:

```bash
node --version
bun --version
bun install --frozen-lockfile
volta run --node 24.18.0 bun run --cwd tools/habitat-harness check
volta run --node 24.18.0 node tools/habitat-harness/bin/run.js verify --help
volta run --node 24.18.0 bun run check-types
volta run --node 24.18.0 bun run test
```

If time allows, run the broader repo lane:

```bash
volta run --node 24.18.0 bun run ci
```

If package-local checks fail on unresolved workspace imports, classify whether the same failure reproduces under Node 22 before treating it as Node 24 risk.

## Stop Conditions

Stop and reassess if any of these occur:

- A dependency declares an incompatible Node engine for Node 24.
- `bun install` changes more than `bun.lock` and expected package metadata.
- CI or local scripts rely on package-level `engines.node` for behavior rather than documentation.
- Node 24 introduces a runtime behavior failure that does not reproduce under Node 22.
- Volta fails to install or select Node because of the local Yarn image permissions issue.

## Sources

- Node.js previous releases: https://nodejs.org/en/about/previous-releases
- Node.js download/current page: https://nodejs.org/en/download/current
- Volta getting started: https://docs.volta.sh/guide/getting-started
- Volta pin reference: https://docs.volta.sh/reference/pin
