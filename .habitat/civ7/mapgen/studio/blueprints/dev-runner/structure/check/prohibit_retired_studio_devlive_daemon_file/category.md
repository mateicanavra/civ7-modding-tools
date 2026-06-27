# Prohibit Retired Studio DevLive Daemon File

Subject ID: `prohibit_retired_studio_devlive_daemon_file`

Title: Prohibit Retired Studio DevLive Daemon File

Blueprint: `dev-runner`

Primary category: `structure`

Secondary categories: `execution`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/studio/blueprints/dev-runner/structure/check/prohibit_retired_studio_devlive_daemon_file`

Files:
- `prohibit_retired_studio_devlive_daemon_file.baseline.json`
- `prohibit_retired_studio_devlive_daemon_file.rule.json`
- `prohibit_retired_studio_devlive_daemon_file.structure.toml`

Evidence: The structure rule keeps the retired Studio `devLive.ts` daemon file absent from the daemon source directory.

Notes:
- Split from `enforce_studio_dev_runner_topology`; package script, Nx target, Vite config, and required token assertions remain outside `structure-check`.
