# Validate Habitat Service Module Root Topology

Subject ID: `validate_habitat_service_module_root_topology`

Title: Validate Habitat Service Module Root Topology

Blueprint: `service-module`

Primary category: `structure`

Secondary categories: `contract`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/habitat/toolkit/blueprints/service-module/structure/check/validate_habitat_service_module_root_topology`

Files:
- `validate_habitat_service_module_root_topology.baseline.json`
- `validate_habitat_service_module_root_topology.rule.json`
- `validate_habitat_service_module_root_topology.structure.toml`

Evidence: The structure rule owns direct service module and service model root topology.

Notes:
- Split from `validate_habitat_service_module_file_shape`; recursive suffix and router file-or-directory residuals remain command-check because TOML v1 has no typed child or disjunctive required-child semantics.
