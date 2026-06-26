# Require Narrow Game-UI Bridge Bootstrap

Subject ID: `intelligence-bridge-ui-bootstrap`

Title: Require Narrow Game-UI Bridge Bootstrap

Blueprint: `intelligence-bridge`

Primary category: `boundary`

Secondary categories: `execution`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/platform/blueprints/intelligence-bridge/boundary/check/intelligence-bridge-ui-bootstrap`

Files:
- `intelligence-bridge-ui-bootstrap.baseline.json`
- `intelligence-bridge-ui-bootstrap.check.ts`
- `intelligence-bridge-ui-bootstrap.rule.json`

Evidence: The check requires the bridge UI bootstrap to use the narrow game-ui entrypoint and avoid root oRPC/client-server primitives.

Notes:
- none
