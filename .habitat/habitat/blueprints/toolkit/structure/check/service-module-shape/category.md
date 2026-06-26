# service-module-shape

Blueprint: `toolkit`

Primary category: `structure`

Secondary categories: `contract`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/habitat/blueprints/toolkit/structure/check/service-module-shape`

Files:
- `service-module-shape.baseline.json`
- `service-module-shape.check.ts`
- `service-module-shape.rule.json`

Evidence: The check enforces Toolkit service module/model file tree, suffix shape, and module layout.

Notes:
- Custom filesystem validator; target state is positive subject-local allowlist.
