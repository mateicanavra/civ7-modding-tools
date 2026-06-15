## 1. Packet Entrance

- [x] 1.1 Consume accepted D0 baseline packet and Nx/Habitat scout report.
- [x] 1.2 Reframe D1 as watch-graph isolation on the accepted migrated baseline, not as a Turbo-era hotfix.
- [ ] 1.3 Run fresh D1 review lanes and disposition all P1/P2 findings before D2 starts.

Restack adoption note, 2026-06-15:

- Packet authority is accepted, but implementation closure is still pending.
- Current code already routes Studio deploy through the dedicated repo-local Nx
  target shape, but the D1 proof set has not been rerun on this slice.
- Known implementation gap: `apps/mapgen-studio/src/server/recipeDag/service.ts`
  still imports full source recipe modules from
  `mods/mod-swooper-maps/src/recipes/*/recipe.js` rather than a contract-only
  Studio recipe surface. Tasks below remain unchecked until the contract-only
  import graph, deploy write-set isolation, and live Play/Save&Deploy proofs
  are completed.

## 2. Implementation Shape

- [ ] 2.1 Add a package-owned Studio recipe contract surface under `mods/mod-swooper-maps/src/recipes/studio-contracts/**`, with one module per recipe and a shared index.
- [ ] 2.2 Keep daemon recipe-DAG imports on the contract-only Studio recipe entrypoint, not full recipe runtime modules.
- [ ] 2.3 Prove the transitive daemon import graph is disjoint from operation-written roots: `mods/mod-swooper-maps/dist/**`, `mods/mod-swooper-maps/mod/**`, and `mods/mod-swooper-maps/src/maps/generated/**`.
- [ ] 2.4 Express operation deploy builds through `bun run nx run mod-swooper-maps:build:studio-deploy --outputStyle=static` on the accepted Nx/Habitat baseline, not the broad package build target, Turbo-era root orchestration, or generated recipe targets.
- [ ] 2.5 Prove no daemon import uses `mod-swooper-maps/recipes/*` package exports, full recipe runtime modules, generated recipe files, generated map outputs, or deployable mod outputs.
- [ ] 2.6 Keep deploy-written mod outputs outside daemon/frontend watch authority through source-boundary ownership and watch-ignore guards.

## 3. Verification

- [ ] 3.1 `bun install --frozen-lockfile`.
- [ ] 3.2 Baseline build/check for the selected implementation base.
- [ ] 3.3 `bun run openspec -- validate mapgen-studio-dev-watch-deploy-isolation --strict`.
- [ ] 3.4 `bun run openspec:validate`.
- [ ] 3.5 `bun run nx show project mapgen-studio --json` on the accepted migrated baseline.
- [ ] 3.6 `bun run nx show project mod-swooper-maps --json` on the accepted migrated baseline.
- [ ] 3.7 `bun run nx run mapgen-studio:check --outputStyle=static` on the accepted migrated baseline.
- [ ] 3.8 `bun run habitat classify <path-or-diff>` for D1 implementation paths, followed by the Habitat/Nx/Biome/GritQL gates it reports.
- [ ] 3.9 Focused tests: contract-only recipe-DAG import, transitive daemon import graph, deploy write-set disjointness, deploy command, daemon watch/import trigger, frontend watcher ignores, and D0 one-mount regression.
- [ ] 3.10 Negative search for daemon imports from `mod-swooper-maps/recipes/*`, full recipe runtime modules, generated recipe files, generated map outputs, and deployable mod outputs.
- [ ] 3.11 Negative search for active runtime dev/deploy specs prescribing Turbo, global-only/on-the-fly Nx, direct binary Nx, broad root orchestration, generated recipe targets, fallback, shim, temporary, dual path, support-both, optional target shape, or only-if-needed language.
- [ ] 3.12 Live Play proof: same operation id sampled through accepted, deploy-entered, deploy-exited, and terminal phases; `serverInstanceId` remains stable; deploy command and log pointer recorded; browser persistence/restart recovery excluded.
- [ ] 3.13 Live Save&Deploy proof: same operation id sampled through accepted, deploy-entered, deploy-exited, and terminal phases; `serverInstanceId` remains stable; deploy command and log pointer recorded; browser persistence/restart recovery excluded.

## 4. Closure

- [ ] 4.1 Record verification evidence and skipped-gate rationale, if any.
- [ ] 4.2 Update downstream D11 assumptions if Nx dev-runner facts change.
- [ ] 4.3 Inspect worktree and stack with `git status --short --branch`, `gt status` or documented Graphite CLI equivalent, and `gt log --no-interactive`.
- [ ] 4.4 Commit packet/implementation changes through Graphite with clean/quarantined worktree state.
