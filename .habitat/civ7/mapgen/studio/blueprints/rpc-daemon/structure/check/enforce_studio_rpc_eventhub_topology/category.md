# Enforce Studio RPC EventHub Topology

Subject ID: `enforce_studio_rpc_eventhub_topology`

Title: Enforce Studio RPC EventHub Topology

Blueprint: `rpc-daemon`

Primary category: `structure`

Secondary categories: `execution`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/studio/blueprints/rpc-daemon/structure/check/enforce_studio_rpc_eventhub_topology`

Files:
- `enforce_studio_rpc_eventhub_topology.baseline.json`
- `enforce_studio_rpc_eventhub_topology.check.ts`
- `enforce_studio_rpc_eventhub_topology.rule.json`

Evidence: The check requires the daemon to mount the Studio RPC handler through the runtime context.

Notes:
- EventHub lifecycle source bans moved to `prohibit_studio_rpc_eventhub_lifecycle_leaks`.
- Remaining positive call-presence assertion stays command-check because it is not a forbidden source pattern or file-tree topology.
