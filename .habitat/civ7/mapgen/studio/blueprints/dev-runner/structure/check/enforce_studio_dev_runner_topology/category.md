# Enforce Studio Dev Runner Topology

Subject ID: `enforce_studio_dev_runner_topology`

Title: Enforce Studio Dev Runner Topology

Blueprint: `dev-runner`

Primary category: `structure`

Secondary categories: `execution`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/studio/blueprints/dev-runner/structure/check/enforce_studio_dev_runner_topology`

Files:
- `enforce_studio_dev_runner_topology.baseline.json`
- `enforce_studio_dev_runner_topology.check.ts`
- `enforce_studio_dev_runner_topology.rule.json`

Evidence: The check enforces Studio dev/serve-daemon topology, package script absence, and Vite generated/deploy output ignores.

Notes:
- none
