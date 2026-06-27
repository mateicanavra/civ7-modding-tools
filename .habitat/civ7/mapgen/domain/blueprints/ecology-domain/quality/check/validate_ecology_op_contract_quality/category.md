# Validate Ecology Op Contract Quality

Subject ID: `validate_ecology_op_contract_quality`

Title: Validate Ecology Op Contract Quality

Blueprint: `ecology-domain`

Primary category: `quality`

Secondary categories: `contract`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/domain/blueprints/ecology-domain/quality/check/validate_ecology_op_contract_quality`

Files:
- `validate_ecology_op_contract_quality.baseline.json`
- `validate_ecology_op_contract_quality.rule.json`

Evidence: The package-local validator checks ecology contract schema descriptions and exported-function JSDoc in ecology op/step source.

Notes:
- Split out of the retired aggregate domain refactor shell. This is quality/contract validation behavior owned by `mod-swooper-maps`, not structure-check topology.
- Residual owner class: package-local validator.
