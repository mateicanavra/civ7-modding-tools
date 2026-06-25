# op-calls-op

Primary category: `execution-context`

Secondary categories: `boundaries`

Lifecycle: `steady`

Admission: `admitted`

Niche: `civ7/mapgen/pipeline`

Artifact kind: `check`

Files:
- `op-calls-op.baseline.json`
- `op-calls-op.check.mjs`
- `op-calls-op.pattern.md`
- `op-calls-op.rule.json`
- `op-calls-op.rule.mjs`

Evidence: The check forbids domain op runtime entrypoints from importing sibling ops, the ops barrel, or orchestration helpers.

Notes:
- This is not a universal operation-atomicity category; it is runtime/composition phase purity.
