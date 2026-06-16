## 1. Packet Entrance

- [x] 1.1 Consume accepted D0 baseline packet and Nx/Habitat scout report.
- [x] 1.2 Reframe D1 as watch-graph isolation on the accepted migrated baseline, not as a Turbo-era hotfix.
- [x] 1.3 Run fresh D1 review lanes and disposition all P1/P2 findings before D2 starts.

Restack adoption note, 2026-06-15:

- Packet authority is accepted, but implementation closure is still pending.
- Current code already routes Studio deploy through the dedicated repo-local Nx
  target shape, but the D1 proof set has not been rerun on this slice.
- Implementation correction: `browser-test` is no longer an active recipe and
  is being removed from Studio/Swooper runtime surfaces instead of preserved as
  a second contract projection. D1 closure now requires a Standard-only Studio
  recipe-DAG contract projection plus transitive daemon import-graph proof.

## 2. Implementation Shape

- [x] 2.1 Add a package-owned Standard-only Studio recipe contract projection under `mods/mod-swooper-maps/src/recipes/studio-contracts/index.ts`.
- [x] 2.2 Keep daemon recipe-DAG imports on the contract-only Studio recipe entrypoint, not full recipe runtime modules.
- [x] 2.3 Prove the transitive daemon recipe-DAG import graph is disjoint from operation-written roots: `mods/mod-swooper-maps/dist/**`, `mods/mod-swooper-maps/mod/**`, and `mods/mod-swooper-maps/src/maps/generated/**`.
- [x] 2.4 Express operation deploy builds through `bun run nx run mod-swooper-maps:build:studio-deploy --outputStyle=static` on the accepted Nx/Habitat baseline, not the broad package build target, Turbo-era root orchestration, or generated recipe targets.
- [x] 2.5 Prove no daemon import uses `mod-swooper-maps/recipes/*` package exports, full recipe runtime modules, stage runtime modules, step runtime modules, generated recipe files, generated map outputs, deployable mod outputs, or `browser-test`.
- [x] 2.6 Keep deploy-written mod outputs outside daemon/frontend watch authority through source-boundary ownership and watch-ignore guards.

Implementation proof note, 2026-06-15:

- The daemon recipe-DAG service now imports the Standard-only Studio contract
  projection through the source-backed package subpath
  `mod-swooper-maps/recipes/studio-contracts`; that package export resolves to
  `mods/mod-swooper-maps/src/recipes/studio-contracts/index.ts`, not generated
  `dist/**` recipe outputs.
- `@swooper/mapgen-core` owns narrow public subpaths
  `@swooper/mapgen-core/authoring/recipe-dag` and
  `@swooper/mapgen-core/authoring/contracts`. Daemon-reachable Standard
  contract/artifact files import the narrow `authoring/contracts` helper, not
  the broad `authoring` barrel.
- `browser-test` and the retired `viz:foundation` harness are removed from
  active runtime/package surfaces. Active docs now point at `viz:standard` /
  `mods/mod-swooper-maps/src/dev/viz/standard-run.ts`.
- Standard stage/step contract ordering is single-owned by
  `mods/mod-swooper-maps/src/recipes/standard/contract-manifest.ts`.
  Runtime Standard recipe/stage modules derive executable order from that
  manifest, and Studio projects the same manifest; Studio no longer maintains a
  hand-copied stage/step order.
- Daemon-reachable contract metadata uses `@mapgen/domain/<domain>/contract`
  modules, not broad domain barrels or `ops` barrels. The focused daemon graph
  test explicitly forbids root `@swooper/mapgen-core`, broad
  `@swooper/mapgen-core/authoring`, broad `@mapgen/domain/<domain>`, domain
  `ops` barrels, runtime recipe/stage/step modules, generated outputs, and
  `browser-test` in the collected graph.

## 3. Verification

- [x] 3.1 `bun install --frozen-lockfile`.
- [x] 3.2 Baseline build/check for the selected implementation base.
- [x] 3.3 `bun run openspec -- validate mapgen-studio-dev-watch-deploy-isolation --strict`.
- [x] 3.4 `bun run openspec:validate`.
- [x] 3.5 `bun run nx show project mapgen-studio --json` on the accepted migrated baseline.
- [x] 3.6 `bun run nx show project mod-swooper-maps --json` on the accepted migrated baseline.
- [x] 3.7 `bun run nx run mapgen-studio:check --outputStyle=static` on the accepted migrated baseline.
- [x] 3.8 Run Habitat owner checks for D1 boundaries and classify non-green findings by ownership; D1-relevant checks pass, while the remaining enforced failure is stack-owned `workspace-entrypoints` debt in `codex/runtime-effect-control-orpc-build`.
- [x] 3.9 Focused tests: contract-only recipe-DAG import, transitive daemon import graph, deploy write-set disjointness, deploy command, daemon watch/import trigger, frontend watcher ignores, and D0 one-mount regression.
- [x] 3.10 Negative search for daemon imports from `mod-swooper-maps/recipes/*`, full recipe runtime modules, generated recipe files, generated map outputs, and deployable mod outputs.
- [x] 3.11 Negative search for active runtime dev/deploy specs prescribing Turbo, global-only/on-the-fly Nx, direct binary Nx, broad root orchestration, generated recipe targets, fallback, shim, temporary, dual path, support-both, optional target shape, or only-if-needed language.
- [x] 3.12 Live Play proof: same operation id sampled through accepted, deploy-entered, deploy-exited, and terminal phases; `serverInstanceId` remains stable; deploy command and log pointer recorded; browser persistence/restart recovery excluded.
- [x] 3.13 Live Save&Deploy proof: same operation id sampled through accepted, deploy-entered, deploy-exited, and terminal phases; `serverInstanceId` remains stable; deploy command and log pointer recorded; browser persistence/restart recovery excluded.

Verification evidence, 2026-06-15:

- Green: `bun install --frozen-lockfile`.
- Green: `bun run openspec -- validate mapgen-studio-dev-watch-deploy-isolation --strict`.
- Green: `bun run nx run @swooper/mapgen-core:build --outputStyle=static`.
- Green: `bun run nx run mod-swooper-maps:check --outputStyle=static`.
- Green: `bun run nx run mapgen-studio:check --outputStyle=static`.
- Green: `bun run --cwd apps/mapgen-studio test -- test/devServer/daemonDeployIsolation.test.ts test/devServer/watchIgnores.test.ts test/server/oneMount.test.ts test/recipeDag/artifactPresentation.test.ts` (4 files, 8 tests). `oneMount.test.ts` emits the expected 404 stderr for the missing-recipe assertion and still passes.
- Green: `bun run --cwd mods/mod-swooper-maps test -- test/config/standard-contract-manifest.test.ts`.
- Green graph proof: `daemonDeployIsolation.test.ts` passes, and the collected daemon-reachable graph oracle explicitly fails root `@swooper/mapgen-core`, broad `@swooper/mapgen-core/authoring`, broad `@mapgen/domain/<domain>`, `@mapgen/domain/.../ops`, runtime recipe/stage/step modules, generated `dist/**`/`mod/**` outputs, generated `mods/mod-swooper-maps/src/maps/generated/**` maps, and `browser-test`.
- Green negative scan: `rg -n 'viz:foundation|foundation-run\\.ts' docs openspec apps mods scripts packages -g '!docs/_archive/**' -g '!**/scratch/**' -g '!node_modules' -g '!dist' -g '!mod' -g '!openspec/changes/mapgen-studio-dev-watch-deploy-isolation/**'` returns no active-doc/runtime matches. The current D1 task/checklist files contain self-referential proof text and are intentionally excluded from this zero-match claim.
- Green generated-artifact audit: `git status --short packages/mapgen-core/dist mods/mod-swooper-maps/dist mods/mod-swooper-maps/mod mods/mod-swooper-maps/src/maps/generated` shows no tracked generated output changes after the final build/typegen gates, and `git diff --name-status --diff-filter=AMD | rg 'mods/mod-swooper-maps/(dist|mod|src/maps/generated)|packages/mapgen-core/dist|\\.d\\.ts$|\\.schema\\.json$|\\.defaults\\.json$|\\.presets\\.json$|standard-map-configs\\.js$|standard-artifacts\\.js$|browser-test'` reports only the intentional `D mods/mod-swooper-maps/src/recipes/browser-test/recipe.ts`.
- Green: `bun run openspec:validate` (186 passed, 0 failed).
- Green: `git diff --check`.
- Habitat owner check: `bun tools/habitat-harness/bin/dev.ts check --owner @internal/habitat-harness --json` is non-green only because of the stack-owned `workspace-entrypoints` failure below. D1-relevant `mapgen-docs`, `nx-boundaries`, `biome-ci`, `grit-studio-recipe-artifacts`, file-layer generated-output checks, and baseline integrity pass.
- Pending rerun before commit: final Graphite status/stack inspection.
- Historical non-green stack-owned lint gate: `bun run lint` failed on
  `workspace-entrypoints` for `packages/civ7-control-orpc/package.json` script
  chaining (`tsup --config tsup.config.ts && tsc ...`). This was outside the D1
  import-graph slice and was owned by the runtime Effect stack lower slice
  `codex/runtime-effect-control-orpc-build`. Later D12/root graph records
  supersede this as final stack hygiene evidence. The current recovery branches
  see different unrelated Swooper Habitat failures, not this
  `workspace-entrypoints` failure.
- Non-green environment gate: `bun run nx run mod-swooper-maps:test --outputStyle=static`
  and focused `bun run --cwd mods/mod-swooper-maps test -- test/resources/resource-corpus-contract.test.ts`
  fail because `.civ7/outputs/resources` is an empty gitlink checkout in this
  worktree; the failing tests read missing official resource XML/modinfo files.
- Reconciled 2026-06-16: D12 later ran live Run in Game and Save&Deploy
  state-machine proof through the D11 Nx Studio runner, with stable daemon
  identity, pushed event terminal completion, keyed status agreement, current
  projection agreement, and tracked generated/catalog artifacts restored cleanly.
  This consumes D1's broad live Play/Save&Deploy operation proof handoff without
  adding new D1 runtime behavior proof.

## 4. Closure

- [x] 4.1 Record verification evidence and skipped-gate rationale, if any.
- [x] 4.2 Update downstream D11 assumptions if Nx dev-runner facts change.
- [x] 4.3 Inspect worktree and stack with `git status --short --branch`, `gt status` or documented Graphite CLI equivalent, and `gt log --no-interactive`.
- [x] 4.4 Commit packet/implementation changes through Graphite with clean/quarantined worktree state.

Post-commit proof, 2026-06-15:

- D1 Graphite slice: `codex/runtime-effect-dev-watch-deploy-isolation`.
- Observed D1 commit before post-commit bookkeeping amend:
  `3298cf38f` (`fix(studio): isolate recipe DAG deploy graph`). This file is
  amended into the same Graphite slice, so the durable commit identity after
  the bookkeeping repair is the branch tip reported by `git log -1`.
- Clean proof after the D1 Graphite commit: `git status --short --branch`
  returned only `## codex/runtime-effect-dev-watch-deploy-isolation`, and
  `gt status` passed through to Git status with `nothing to commit, working
  tree clean`.

D11 disposition: D1 did not materially change Nx dev-runner facts. The
stack-owned root lint item surfaced during D1 was historical
`packages/civ7-control-orpc/package.json` `workspace-entrypoints` debt owned by
`codex/runtime-effect-control-orpc-build`; later D12/root graph records
supersede it as final stack hygiene evidence.
