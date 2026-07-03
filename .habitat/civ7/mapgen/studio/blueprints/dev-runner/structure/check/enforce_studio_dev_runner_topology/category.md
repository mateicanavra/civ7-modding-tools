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

Evidence: The check enforces Studio dev/serve-daemon Nx/package-script topology and Vite generated/deploy output ignores.

Notes:
- Residual owner class: future owner gap; remaining file-shape assertions are structure-check candidates but not converted in this closure slice.
- Retired `devLive.ts` file absence moved to `prohibit_retired_studio_devlive_daemon_file`.
- Remaining package script, Nx target, evaluated Vite config, and source-token assertions are not `structure-check` ownership.
