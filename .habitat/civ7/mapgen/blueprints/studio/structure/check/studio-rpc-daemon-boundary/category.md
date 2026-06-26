# studio-rpc-daemon-boundary

Blueprint: `studio`

Primary category: `structure`

Secondary categories: `execution`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/blueprints/studio/structure/check/studio-rpc-daemon-boundary`

Files:
- `studio-rpc-daemon-boundary.baseline.json`
- `studio-rpc-daemon-boundary.check.ts`
- `studio-rpc-daemon-boundary.rule.json`

Evidence: The check enforces RPC daemon/EventHub lifecycle placement and construction topology.

Notes:
- Subject name says boundary, but failure is lifecycle/topology placement.
