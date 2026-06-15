# Design - Dev-Watch Deploy Isolation

## System Boundary

D1 sits at the boundary between three systems:

- the Studio daemon, which owns operation state and serves `/rpc`;
- the Swooper Maps mod package, which owns recipe source, generated map scripts, deployable mod output, and build targets;
- the dev task runner, which watches source, builds dependencies, and starts backend/frontend processes.

The defect appears when those boundaries collapse. If the daemon imports generated files that deploy also writes, the operation state machine becomes self-invalidating: Play or Save&Deploy can restart the daemon while the daemon is reporting that same operation.

The invariant is simple: operation-time writes must not touch files in the daemon's active import graph.

## Ownership Decision

Recipe-DAG stage metadata is source truth, not deploy output. The daemon may load package-owned Studio recipe contract modules under `mods/mod-swooper-maps/src/recipes/studio-contracts/**` because those modules describe authoring stages. The daemon must not load generated `dist/**` modules, deployable `mod/**` modules, generated map outputs, package exports that resolve to generated files, full recipe runtime modules, or recipe default constructors.

The contract module shape is deliberately narrower than "any source recipe module." It is a Studio-facing source contract surface. It can expose ids, stage order, TypeBox schemas, public authoring metadata, and artifact metadata. It cannot expose executable recipe runtime, compile functions, direct-control behavior, generated map bundles, or deploy output. If a future recipe is added, it gets its own contract module beside the current ones and is exported through the index with the same contract type.

Operation deploy is an operation-scoped mod build, not a root dependency build. On the accepted migrated baseline, the command shape is Nx-native and targets the mod package build directly. Broad root orchestration, dependency-output replay, and Turbo-era command paths are historical pre-Nx evidence only.

## Rejected Shapes

- Watch-ignore as the primary fix: it hides current output paths instead of removing generated artifacts from the daemon import graph.
- Lazy import of generated recipe modules: it fails after the Pipeline DAG tab has loaded the generated module once.
- Subprocess recipe projection: it adds process management and IPC for static authoring metadata. It remains a possible future design only if source imports become impossible for a source-backed reason.
- Turbo `--only` as final target: it was a valid pre-Nx hotfix, but the runtime train targets the accepted Nx/Habitat baseline.

## File Structure And Scale Continuity

Keep recipe-DAG service ownership explicit:

```text
apps/mapgen-studio/src/server/recipeDag/service.ts
mods/mod-swooper-maps/src/recipes/studio-contracts/index.ts
mods/mod-swooper-maps/src/recipes/studio-contracts/standard.ts
mods/mod-swooper-maps/src/recipes/studio-contracts/browser-test.ts
apps/mapgen-studio/test/devServer/daemonDeployIsolation.test.ts
apps/mapgen-studio/test/devServer/daemonImportGraph.test.ts
apps/mapgen-studio/test/mapConfigSave/deployCommand.test.ts
apps/mapgen-studio/test/devServer/watchIgnores.test.ts
```

If more daemon-imported authored metadata sources appear, add the next source boundary beside the existing recipe-DAG service and add a matching `devServer/*ImportGraph.test.ts` or `devServer/*Isolation.test.ts` guard. Do not create shared "watch helpers" until at least two independent daemon-import graph boundaries need the same abstraction.

## Testing Strategy

Falsification target: a deploy operation rewrites a daemon-imported file and restarts the daemon mid-operation.

Layered oracles:

- Contract-surface oracle: Studio imports only the Swooper Maps Studio recipe contract entrypoint; the entrypoint exports contract data and TypeBox-backed schemas, not executable recipe runtime or generated outputs.
- Transitive import-graph oracle: daemon entrypoints and daemon-owned service entrypoints are traced, then compared with the operation deploy write-set. The graph cannot include operation-written paths under `mods/mod-swooper-maps/dist/**`, `mods/mod-swooper-maps/mod/**`, or `mods/mod-swooper-maps/src/maps/generated/**`.
- Build command oracle: operation deploy uses exactly `bun run nx run mod-swooper-maps:build --outputStyle=static` on the accepted migrated baseline and does not run broad root dependency orchestration, generated recipe targets, Turbo, global-only/on-the-fly Nx, direct binary, shimmed Nx, or dual-path command selection.
- Daemon watch oracle: deploy-written `dist/**`, `mod/**`, and generated map outputs do not trigger the daemon watcher because they are absent from the daemon import graph. Frontend watch ignores remain secondary churn guards.
- Regression oracle: D0 one-mount focused tests still pass.
- Live oracle: Play and Save&Deploy are sampled through `/rpc` on the same operation id at accepted, deploy-entered, deploy-exited, and terminal phases. Each sample preserves daemon identity and records the deploy command and log pointer. A new daemon accepting a new operation or a browser-restored terminal state is not valid proof.

## Migrated Baseline Gate

D1 can be authored on the current pre-Nx packet branch, but implementation-ready execution requires the accepted migrated Nx/Habitat baseline. If that baseline is not selected, D1 records the missing baseline and stops before claiming final implementation readiness.
