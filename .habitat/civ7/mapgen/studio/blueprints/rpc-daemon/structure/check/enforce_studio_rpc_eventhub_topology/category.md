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

Evidence: The check enforces RPC daemon/EventHub lifecycle placement and construction topology.

Notes:
- Subject name says boundary, but failure is lifecycle/topology placement.
