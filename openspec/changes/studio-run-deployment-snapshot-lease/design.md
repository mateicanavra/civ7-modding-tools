# Design

## Deployed Mod Identity

Run in Game deploys to stable mod id `mod-swooper-studio-run`. Request-specific
identity is inside the mod through `RunArtifactId`, map row id, script path, and
correlation markers.

## Snapshot

`RunDeployment` records deployment start/end, request id, generated mod root,
deployed mod id, and target root. `DeployedModSnapshot` records post-copy file
count, file identities, digests, marker observations, and target root in private
records.

## Lease

`RuntimeOwnershipLease` was acquired at Run in Game admission. This packet
records the deployed mod resource identity protected by that existing lease.
Save/Deploy retains its durable catalog semantics, but any deployed-mod write it
performs must respect the same lease and report public category `ownership`
while Run in Game holds it.
