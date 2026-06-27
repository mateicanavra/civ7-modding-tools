# Validate Habitat Service Module File Shape

Subject ID: `validate_habitat_service_module_file_shape`

Title: Validate Habitat Service Module File Shape

Blueprint: `service-module`

Primary category: `structure`

Secondary categories: `contract`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/habitat/toolkit/blueprints/service-module/structure/check/validate_habitat_service_module_file_shape`

Files:
- `validate_habitat_service_module_file_shape.baseline.json`
- `validate_habitat_service_module_file_shape.check.ts`
- `validate_habitat_service_module_file_shape.rule.json`

Evidence: The check enforces recursive Toolkit service module/model suffix shape and residual router shape.

Notes:
- Direct service module/model root topology moved to `validate_habitat_service_module_root_topology`.
- Residual command-check remains for recursive suffix validation and router file-or-directory shape that TOML v1 cannot express cleanly.
