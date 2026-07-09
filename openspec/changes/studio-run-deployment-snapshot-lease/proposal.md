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
- Studio launches Run in Game through the stable Studio-run map script and
  reports setup/visibility failures if Civ7 cannot see the deployed row;
- the `RuntimeOwnershipLease` acquired at operation admission covers deployment,
  Civ7 setup/start, and writes to the Studio-run deployed mod;
- `RunDeployment` and `DeployedModSnapshot` are recorded after copy.

## Behavior Verification

Behavior tests verify copy success/failure, snapshot recording, Save/Deploy
conflict behavior, cancellation lease release, and no rebuild invocation through
observable command-port behavior.

## Structural Enforcement

Permanent positive assertions:

- Run in Game deploy source uses the generated mod root as the copy input and
  the stable Studio-run mod id as the deploy identity;
- Save/Deploy's Swooper-map rebuild/deploy path is not reachable from Run in
  Game deploy source;
- private runtime surfaces carry deployment, deployed snapshot, and lease
  deployed-mod evidence.

Structural authority row: SA-11 `grit-studio-run-copy-deploy-boundary`.
Behavior tests and live endpoint probes cover the runtime facts: copied bytes,
snapshot digest, conflict timing, public/private visibility, and lease release.

## Verification Gates

- Deployment copy and snapshot behavior tests.
- Lease conflict and release behavior tests.
- Live Studio endpoint evidence for deployment snapshot creation and
  Save/Deploy ownership conflict projection.
- SA-11 `grit-studio-run-copy-deploy-boundary`.
- SA-11/Grit proves the copy-only/no-rebuild source boundary; endpoint evidence
  proves public behavior and produced deployment snapshot identity.
- No declared verification gate is skipped; packet closure records evidence in
  `workstream/verification-evidence.md`.
- `bun run openspec -- validate studio-run-deployment-snapshot-lease --strict`.
