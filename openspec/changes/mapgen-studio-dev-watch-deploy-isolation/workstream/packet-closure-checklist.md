# D1 Packet Closure Checklist

Status: packet accepted; D1 implementation committed on `codex/runtime-effect-dev-watch-deploy-isolation`
Date: 2026-06-14; restack adoption update 2026-06-15

## Packet Shape

- [x] Proposal repaired to forward Nx/Habitat baseline.
- [x] Design repaired to source-boundary/watch-graph component model.
- [x] Tasks repaired to implementation-ready steps.
- [x] Spec delta repaired to source-boundary and mod-package target requirements.
- [x] Packet phase/review/closure records added.
- [x] Historical residue classified so old S1.1a proof text is evidence, not implementation authority.
- [x] Fresh reviews complete.
- [x] Accepted P1/P2 findings repaired or rejected with evidence.
- [x] Packet status moved from draft to accepted.

## Required Verification Before Acceptance

- [x] `bun run openspec -- validate mapgen-studio-dev-watch-deploy-isolation --strict`
- [x] `bun run openspec:validate`
- [x] `git diff --check`
- [x] shortcut scan for unsupported Turbo/fallback/shim/temporary/dual-path/support-both/optional-target/only-if-needed/watch-ignore-only target language; active and historical hits classified in `packet-residue-ledger.md`.

## Execution Gates For Future Implementation

- [x] contract-only Standard recipe-DAG projection replaces full recipe source imports in the daemon recipe-DAG path; `browser-test` active runtime surfaces removed
- [x] `bun install --frozen-lockfile`
- [x] accepted migrated Nx/Habitat baseline proof
- [x] baseline build/check for the selected implementation base
- [x] `bun run nx show project mapgen-studio --json`
- [x] `bun run nx show project mod-swooper-maps --json`
- [x] `bun run nx run mapgen-studio:check --outputStyle=static`
- [x] `bun run nx run mod-swooper-maps:build:studio-deploy --outputStyle=static`
- [x] Habitat owner check for D1 boundaries, with D1-relevant Habitat/Nx/Biome/GritQL gates green and stack-owned `workspace-entrypoints` debt classified to `codex/runtime-effect-control-orpc-build`
- [x] focused tests for contract-only recipe-DAG import, transitive daemon import graph, deploy write-set disjointness, exact deploy command, daemon watch/import trigger, frontend watcher ignores, and D0 one-mount regression
- [ ] live Play and Save&Deploy same-operation phase-sampled proofs with stable `serverInstanceId`, deploy command/log pointer, and restart-recovery exclusion
- [x] final Graphite status/stack rerun after workstream docs settle
- [x] `git status --short --branch`
- [x] `gt status` or documented Graphite CLI equivalent when this CLI aliases `gt status` to Git status
- [x] `gt log --no-interactive`
- [x] clean/quarantined worktree proof before closure

## Implementation Evidence Notes

- Source-backed package export: `mod-swooper-maps/recipes/studio-contracts`
  resolves to `mods/mod-swooper-maps/src/recipes/studio-contracts/index.ts`.
  This is an intentional package entrypoint for daemon contract metadata, not a
  generated `dist/**` recipe artifact.
- Contract ordering authority: `mods/mod-swooper-maps/src/recipes/standard/contract-manifest.ts`
  owns Standard stage/step contract order. Runtime Standard recipe/stage modules
  derive executable arrays from that manifest, and Studio projects the same
  manifest instead of hand-listing a duplicate order.
- Import graph proof: `apps/mapgen-studio/test/devServer/daemonDeployIsolation.test.ts`
  collects daemon-reachable sources from the recipe-DAG service and forbids root
  `@swooper/mapgen-core`, broad `@swooper/mapgen-core/authoring`, broad
  `@mapgen/domain/<domain>`, `@mapgen/domain/.../ops`, runtime recipe/stage/step
  modules, generated `dist/**`/`mod/**` outputs, generated
  `mods/mod-swooper-maps/src/maps/generated/**` maps, and `browser-test`. The
  allowed MapGen authoring paths are the narrow
  `@swooper/mapgen-core/authoring/recipe-dag` and
  `@swooper/mapgen-core/authoring/contracts` subpaths.
- Focused proof command: `bun run --cwd apps/mapgen-studio test -- test/devServer/daemonDeployIsolation.test.ts test/devServer/watchIgnores.test.ts test/server/oneMount.test.ts test/recipeDag/artifactPresentation.test.ts` passes, as does `bun run --cwd mods/mod-swooper-maps test -- test/config/standard-contract-manifest.test.ts`. The one-mount test emits expected 404 stderr for its missing-recipe assertion and still passes.
- Generated artifact disposition: D1 gates regenerated Swooper map/studio recipe
  outputs, and the current tracked-output audit after the final build/check gates
  shows no modified tracked
  `mods/mod-swooper-maps/dist/**`, `mods/mod-swooper-maps/mod/**`,
  `mods/mod-swooper-maps/src/maps/generated/**`, `.d.ts`, schema/defaults,
  presets, `standard-artifacts.js`, or `standard-map-configs.js` files. The only
  generated/artifact-scan hit is the intentional deletion of
  `mods/mod-swooper-maps/src/recipes/browser-test/recipe.ts`. If a tracked
  generated product is modified by any final rerun, it belongs in the D1
  Graphite slice with the source/config change that caused it; ignored
  cache/output remains ignored.
- Non-green stack-owned lint gate: `bun run lint` still fails on the
  `packages/civ7-control-orpc/package.json` `build` script shell-chaining
  violation in `workspace-entrypoints`. This is outside the D1 import-graph
  slice but owned by the runtime Effect stack lower slice
  `codex/runtime-effect-control-orpc-build`; final stack closure must repair it
  there or in a direct follow-up stack slice before claiming root lint green.
  D1-caused `nx-boundaries`, `mapgen-docs`, `biome-ci`, and recipe-artifact
  Habitat checks are green.
- Non-green environment gate: Swooper resource-corpus tests fail in this
  worktree because `.civ7/outputs/resources` is an empty gitlink checkout, so
  official resource XML/modinfo files are absent. D1 does not claim those tests
  green.
- Not run: live Play/Save&Deploy same-operation proof against Civ7.
- Post-commit Graphite proof: D1 was committed through Graphite on
  `codex/runtime-effect-dev-watch-deploy-isolation`. The observed commit before
  this bookkeeping amend was `3298cf38f` (`fix(studio): isolate recipe DAG
  deploy graph`); this checklist is amended into that Graphite slice, so the
  current durable commit identity is the branch tip reported by `git log -1`.
  After the D1 Graphite commit, `git status --short --branch` returned only
  `## codex/runtime-effect-dev-watch-deploy-isolation`, and `gt status` passed
  through to Git status with `nothing to commit, working tree clean`.
