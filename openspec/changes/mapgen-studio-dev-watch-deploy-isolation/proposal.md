# MapGen Studio dev-watch deploy isolation

## Why

D1 protects the Studio operation state machine from its own dev-time deploy writes.

D0 proves the one `/rpc` runtime surface, but Play and Save&Deploy are still only reliable if their deploy/build phase cannot rewrite files inside the daemon's watched import graph. The historical S1.1a hotfix found the failure mode: the daemon loaded recipe-DAG modules through `mod-swooper-maps/recipes/*`, those exports resolved into `mods/mod-swooper-maps/dist/recipes/**`, and operation-time deploy builds rewrote that same generated tree. The Bun watcher restarted the daemon mid-operation, killed the active child process, and wiped the in-memory operation registries.

That bug class is larger than one import string. The component boundary is:

- Studio daemon imports authoring/runtime truth, not operation-written deploy artifacts.
- Operation deploy builds write only the mod package outputs required for the operation.
- Dev orchestration proves the daemon identity remains stable while Play and Save&Deploy cross their deploy phase.

D1 therefore defines the watch-graph isolation contract that every later runtime packet relies on for live proof.

## Target Authority Refs

- `docs/projects/studio-runtime-simplification/RUNTIME-EFFECT-REFACTOR-FRAME.md` - D1 domino and always-on proof gates.
- `docs/projects/studio-runtime-simplification/OPENSPEC-PACKET-TRAIN.md` - accepted D0 baseline policy.
- `openspec/changes/mapgen-studio-runtime-one-mount/workstream/phase-record.md` - D0 accepted baseline and one-mount oracles.
- `openspec/changes/mapgen-studio-runtime-one-mount/workstream/nx-habitat-scout-report.md` - migrated Nx/Habitat command policy and branch suitability.
- `openspec/changes/mapgen-studio-runtime-one-mount/workstream/residue-ledger.md` - D11 owns remaining app-local dev supervision.
- Historical evidence in this change's `workstream/phase-record.md` - S1.1a proof that source recipe loading plus operation-scoped build prevented daemon restart on the pre-Nx baseline.

## What Changes

- The Swooper Maps package exposes a contract-only Studio recipe entrypoint under source, with scale-continuous placement such as `mods/mod-swooper-maps/src/recipes/studio-contracts/index.ts` plus recipe-specific modules. It exports only recipe/stage contract data needed by Studio recipe-DAG views: ids, order, TypeBox schemas, public authoring metadata, and artifact metadata. It does not export recipe runtimes, compile functions, default recipe constructors, map bundles, generated maps, deployable mod output, or package `dist` exports.
- The daemon-side recipe-DAG service imports that contract-only source entrypoint, not package exports that resolve to `mods/mod-swooper-maps/dist/**` and not full recipe runtime modules such as `mods/mod-swooper-maps/src/recipes/*/recipe.ts` or `runtime.ts`.
- The recipe-DAG source import boundary remains a source-authority boundary: contract-only source modules are allowed, generated map outputs and deploy artifacts are not.
- Operation deploy build commands are expressed through the accepted Nx/Habitat baseline. On the migrated baseline, Play and Save&Deploy use the repo-local mod package build target directly: `bun run nx run mod-swooper-maps:build --outputStyle=static`. D1 must verify that target with `bun run nx show project mod-swooper-maps --json` before changing the deploy plan. Broad root build orchestration and generated recipe targets are not deploy-operation authority.
- D1 records the historical Turbo `--only` hotfix as pre-Nx evidence only. It is not the final implementation command on the migrated baseline.
- Watch-ignore checks remain guardrails, not the primary fix. The primary fix is import-graph ownership plus operation-scoped build writes.
- Live proof records API-path samples for the same operation id across accepted, deploy-entered, deploy-exited, and terminal phases for both Play and Save&Deploy. Each sample records `serverInstanceId`, operation id, phase/status, daemon start identity or timestamp when exposed, the deploy command fired, and matching log pointers. Browser persistence and daemon-restart recovery do not count as D1 evidence.

## Non-Goals

- No operation durability across daemon restart. D6 owns daemon-truth adoption and D4 owns runtime operation registries.
- No error-spine changes. D3 owns typed workflow failures and `RunInGameHttpError` deletion.
- No app-local process supervision cleanup. D11 owns the final Nx dev-runner shape.
- No recipe runtime semantics, map generation semantics, mod deploy semantics, or UI behavior changes beyond preserving daemon identity during operation deploy. The new Studio recipe contract entrypoint is a metadata exposure boundary, not a change to recipe behavior.
- No watch-ignore-only fix, lazy generated-dist import, or subprocess recipe projection unless this packet is revised with a stronger ownership reason and guard tests.

## Impact

- `apps/mapgen-studio/src/server/recipeDag/service.ts`
- `mods/mod-swooper-maps/src/recipes/studio-contracts/**`
- `apps/mapgen-studio/src/server/mapConfigs/deploy.ts`
- Studio dev/watch tests and deploy-command tests.
- D1 workstream records, including the historical S1.1a proof and migrated Nx/Habitat packet gates.

## Verification Gates

- `bun install --frozen-lockfile` before trusting tool output.
- Baseline build/check on the selected implementation base.
- `bun run openspec -- validate mapgen-studio-dev-watch-deploy-isolation --strict`.
- `bun run openspec:validate`.
- `bun run nx show project mapgen-studio --json` on the accepted migrated baseline.
- `bun run nx show project mod-swooper-maps --json` on the accepted migrated baseline.
- `bun run nx run mapgen-studio:check --outputStyle=static` on the accepted migrated baseline.
- `bun run habitat classify <path-or-diff>` on D1 implementation paths, followed by any Habitat/Nx/Biome/GritQL gates it reports.
- `git status --short --branch`, Graphite stack inspection, and clean/quarantined worktree proof before closure.
- Focused app tests for whole-daemon import graph, deploy command shape, daemon watch/import triggers, frontend watch ignores, and D0 one-mount regression.
- Negative search proving daemon code does not import `mod-swooper-maps/recipes/*`, generated recipe exports, full recipe runtime modules, generated map outputs, or deployable mod outputs.
- Transitive daemon import-graph proof from `apps/mapgen-studio/src/server/daemon/daemon.ts` and daemon-owned service entrypoints, compared against the operation deploy write-set. The two sets must be disjoint for `mods/mod-swooper-maps/dist/**`, `mods/mod-swooper-maps/mod/**`, and `mods/mod-swooper-maps/src/maps/generated/**`.
- Negative search proving active runtime dev/deploy specs do not prescribe Turbo as the final operation build command.
- Live falsification proof: Play and Save&Deploy keep `serverInstanceId` and operation id stable across accepted/deploying/terminal API samples, cross the deploy phase, and reach terminal status without daemon restart or restart recovery.
