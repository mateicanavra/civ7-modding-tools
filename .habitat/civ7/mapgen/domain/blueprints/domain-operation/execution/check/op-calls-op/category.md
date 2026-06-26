# Prohibit Cross-Op Runtime Calls

Subject ID: `op-calls-op`

Title: Prohibit Cross-Op Runtime Calls

Blueprint: `domain-operation`

Primary category: `execution`

Secondary categories: `boundary`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/domain/blueprints/domain-operation/execution/check/op-calls-op`

Files:
- `op-calls-op.baseline.json`
- `op-calls-op.check.mjs`
- `op-calls-op.pattern.md`
- `op-calls-op.rule.json`
- `op-calls-op.rule.mjs`

Evidence: The check forbids domain op runtime entrypoints from importing sibling ops, the ops barrel, or orchestration helpers.

Notes:
- This is not a universal operation-atomicity category; it is runtime/composition phase purity.
