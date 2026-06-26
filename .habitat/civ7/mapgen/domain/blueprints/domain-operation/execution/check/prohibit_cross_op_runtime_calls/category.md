# Prohibit Cross-Op Runtime Calls

Subject ID: `prohibit_cross_op_runtime_calls`

Title: Prohibit Cross-Op Runtime Calls

Blueprint: `domain-operation`

Primary category: `execution`

Secondary categories: `boundary`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/domain/blueprints/domain-operation/execution/check/prohibit_cross_op_runtime_calls`

Files:
- `prohibit_cross_op_runtime_calls.baseline.json`
- `prohibit_cross_op_runtime_calls.pattern.md`
- `prohibit_cross_op_runtime_calls.rule.json`

Evidence: The pattern forbids domain op runtime entrypoints from importing sibling ops or the ops barrel. Orchestration helper calls are owned by `prohibit_runtime_orchestration_helpers_in_domain_ops`.

Notes:
- This is not a universal operation-atomicity category; it is runtime/composition phase purity.
- Split canary: duplicate `ops.bind` / `runValidated` command-script detection was removed in favor of the existing Grit-owned orchestration helper rule.
