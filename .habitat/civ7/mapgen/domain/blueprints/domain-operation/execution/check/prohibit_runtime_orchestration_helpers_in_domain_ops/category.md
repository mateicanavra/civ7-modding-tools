# Prohibit Runtime Orchestration Helpers In Domain Ops

Subject ID: `prohibit_runtime_orchestration_helpers_in_domain_ops`

Title: Prohibit Runtime Orchestration Helpers In Domain Ops

Blueprint: `domain-operation`

Primary category: `execution`

Secondary categories: none

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/domain/blueprints/domain-operation/execution/check/prohibit_runtime_orchestration_helpers_in_domain_ops`

Files:
- `prohibit_runtime_orchestration_helpers_in_domain_ops.baseline.json`
- `prohibit_runtime_orchestration_helpers_in_domain_ops.pattern.md`
- `prohibit_runtime_orchestration_helpers_in_domain_ops.rule.json`

Evidence: The pattern forbids ops.bind and runValidated inside domain op runtime entrypoints.

Notes:
- none
