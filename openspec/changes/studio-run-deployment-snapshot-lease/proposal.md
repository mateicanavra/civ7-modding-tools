# Studio Run Deployment Snapshot And Runtime Lease

## Why

Deployment should not rebuild. It should copy the request-local generated mod to
a stable deployed mod identity, record what was copied, and hold the shared
runtime/mod-write lease while Civ7 setup/start can observe that deployed state.

## System Context

Affected owners:

- Run in Game deployment code
- Civ7 Mods directory copy code
- Save/Deploy operation coordination where it writes deployed mod surfaces
- runtime operation lifecycle and cancellation cleanup

This packet does not change catalog Save/Deploy durable catalog semantics.

## Before And After

Before:

- deployment can run a build target as a side effect;
- deployment evidence can be inferred from command success or generated output;
- Save/Deploy and Run in Game can race deployed mod writes.

After:

- Run in Game deployment copies from `StudioRunGeneratedMod` into stable deployed
  mod id `mod-swooper-studio-run`;
- Studio ensures the setup config used for Run in Game enables that mod id;
- the `RuntimeOwnershipLease` acquired at operation admission covers deployment,
  Civ7 setup/start, and writes to the Studio-run deployed mod;
- `RunDeployment` and `DeployedModSnapshot` are recorded after copy.

## Behavior Verification

Behavior tests verify copy success/failure, snapshot recording, Save/Deploy
conflict behavior, cancellation lease release, and no rebuild invocation through
observable command-port behavior.

## Structural Enforcement

Permanent positive assertions:

- Run in Game deployment is copy-only from generated mod to deployed mod id;
- deployed snapshot is the runtime deployment authority;
- the already-held runtime ownership lease gates deployed-mod writes and Civ7
  setup/start control.

Structural authority row: SA-11 `grit-studio-run-copy-deploy-boundary`.
Behavior tests cover copy, conflict, and release behavior.

## Verification Gates

- Deployment copy and snapshot behavior tests.
- Lease conflict and release behavior tests.
- SA-11 `grit-studio-run-copy-deploy-boundary`.
- `bun run openspec -- validate studio-run-deployment-snapshot-lease --strict`.
