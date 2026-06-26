# cli-smoke

Blueprint: `cli`

Primary category: `contract`

Secondary categories: `quality`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/habitat/toolkit/blueprints/cli/contract/check/cli-smoke`

Files:
- `cli-smoke.baseline.json`
- `cli-smoke.check.ts`
- `cli-smoke.rule.json`

Evidence: The check validates Habitat CLI help and selected-check JSON report shape.

Notes:
- Uses another rule as a probe; this coupling should be revisited.
