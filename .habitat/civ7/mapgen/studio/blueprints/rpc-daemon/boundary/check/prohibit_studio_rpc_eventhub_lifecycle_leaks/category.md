# Prohibit Studio RPC EventHub Lifecycle Leaks

Subject ID: `prohibit_studio_rpc_eventhub_lifecycle_leaks`

Title: Prohibit Studio RPC EventHub Lifecycle Leaks

Blueprint: `rpc-daemon`

Primary category: `boundary`

Secondary categories: `execution`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/studio/blueprints/rpc-daemon/boundary/check/prohibit_studio_rpc_eventhub_lifecycle_leaks`

Files:
- `prohibit_studio_rpc_eventhub_lifecycle_leaks.baseline.json`
- `prohibit_studio_rpc_eventhub_lifecycle_leaks.pattern.md`
- `prohibit_studio_rpc_eventhub_lifecycle_leaks.rule.json`

Evidence: The Grit pattern keeps Studio RPC daemon source from owning or injecting EventHub lifecycle.

Notes:
- Split from `enforce_studio_rpc_eventhub_topology`; the positive daemon mount assertion remains command-check because Grit diagnostics report forbidden matches, not missing required calls.
