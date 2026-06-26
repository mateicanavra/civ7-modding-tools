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

Evidence: The check enforces Toolkit service module/model file tree, suffix shape, and module layout.

Notes:
- Custom filesystem validator; target state is positive subject-local allowlist.
