# D1 Packet Phase Record - Dev-Watch Deploy Isolation

Status: packet accepted
Date: 2026-06-14
Domino: D1
OpenSpec change: `mapgen-studio-dev-watch-deploy-isolation`
Graphite packet branch: `codex/runtime-effect-openspec-packets`

## Frame

D1 specifies the watch-graph isolation component that lets the Studio daemon keep ownership of operation truth while Play and Save&Deploy perform deploy writes.

The target behavior is not "make Bun watch ignore enough files." The target behavior is: operation-time writes cannot touch files in the daemon's import graph. Watch ignores are secondary guards; ownership is the import/build boundary.

## D0 Dependency

D1 consumes D0 accepted baseline:

- one `/rpc` route and retired satellite paths are accepted baseline;
- the current packet branch is pre-Nx authoring evidence, not the final implementation base for Nx-dependent gates;
- implementation execution waits for the accepted migrated Nx/Habitat baseline where D1 uses Nx/Habitat command proofs.

## Historical Evidence

The existing S1.1a workstream files record a pre-Nx hotfix:

- source recipe loading prevented daemon import of generated recipe `dist`;
- Turbo `--only` constrained operation deploy writes on the pre-Nx baseline;
- live Play and Save&Deploy proof held `serverInstanceId=studio-server-mqby0kyi-1zbz`.

That evidence explains the failure and validates the source-boundary direction. It does not authorize Turbo as the final command path on the migrated baseline.

## Owners And Forbidden Owners

Owners:

- Studio daemon owns runtime operation state and the daemon import graph.
- Swooper recipe source owns the contract-only Studio recipe surface under `mods/mod-swooper-maps/src/recipes/studio-contracts/**`.
- Accepted Nx/Habitat baseline owns dev/build target orchestration.
- D11 owns final removal of remaining app-local dev supervision.

Forbidden owners:

- Generated recipe `dist` files as daemon import authority.
- Full recipe runtime modules, recipe default constructors, generated maps, or deployable mod outputs as Studio recipe-DAG authority.
- Watch-ignore rules as the primary isolation mechanism.
- Turbo-era root task orchestration as the final operation deploy command.
- Browser state or daemon restart recovery as compensation for operation-caused daemon restarts.

## Required Oracles

- Contract-surface oracle: daemon recipe-DAG service imports only the Swooper Maps Studio recipe contract entrypoint and does not consume full recipe runtime/default exports.
- Transitive import graph oracle: daemon entrypoints and daemon-owned service entrypoints are disjoint from operation-written `dist/**`, `mod/**`, and `src/maps/generated/**` roots.
- Build command oracle: operation deploy targets exactly `bun run nx run mod-swooper-maps:build:studio-deploy --outputStyle=static` through repo-local Nx/Habitat.
- Daemon watch oracle: deploy-written outputs do not trigger daemon restart because they are absent from the daemon import graph; frontend watch ignores are secondary guards only.
- D0 regression oracle: one-mount focused tests remain green.
- Live state-machine oracle: Play and Save&Deploy sample the same operation id through accepted, deploy-entered, deploy-exited, and terminal phases with stable daemon identity and recorded deploy command/log pointer.

## Stop Conditions

D1 cannot be accepted if:

- it prescribes Turbo as the final implementation build/deploy command;
- it relies on watch ignores without proving daemon import graph isolation;
- it scopes import proof only to direct recipe-DAG service strings without transitive daemon graph/write-set disjointness;
- it omits same-operation live Play and Save&Deploy phase-sampled stability oracles;
- it fails to route missing Nx/Habitat baseline to a clear execution blocker;
- review finds an accepted P1/P2 orphan or ambiguity.

## Acceptance

Accepted on 2026-06-14 after fresh dev-platform/Nx/Habitat, runtime/watch-graph architecture, and testing/adversarial reviews found no remaining P1/P2 findings after repair.
