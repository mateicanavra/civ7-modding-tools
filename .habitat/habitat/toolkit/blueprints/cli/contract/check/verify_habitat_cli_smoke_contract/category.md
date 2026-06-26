# Verify Habitat CLI Smoke Contract

Subject ID: `verify_habitat_cli_smoke_contract`

Title: Verify Habitat CLI Smoke Contract

Blueprint: `cli`

Primary category: `contract`

Secondary categories: `quality`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/habitat/toolkit/blueprints/cli/contract/check/verify_habitat_cli_smoke_contract`

Files:
- `verify_habitat_cli_smoke_contract.baseline.json`
- `verify_habitat_cli_smoke_contract.check.ts`
- `verify_habitat_cli_smoke_contract.rule.json`

Evidence: The check validates Habitat CLI help and selected-check JSON report shape.

Notes:
- Uses another rule as a probe; this coupling should be revisited.
