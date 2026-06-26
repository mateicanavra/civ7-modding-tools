# Validate Habitat Service Module File Shape

Subject ID: `service-module-shape`

Title: Validate Habitat Service Module File Shape

Blueprint: `service-module`

Primary category: `structure`

Secondary categories: `contract`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/habitat/toolkit/blueprints/service-module/structure/check/service-module-shape`

Files:
- `service-module-shape.baseline.json`
- `service-module-shape.check.ts`
- `service-module-shape.rule.json`

Evidence: The check enforces Toolkit service module/model file tree, suffix shape, and module layout.

Notes:
- Custom filesystem validator; target state is positive subject-local allowlist.
