# Registry Covers Operation Children

Status: active working reference

Subject:
`<domain>/ops/contracts.ts`, `<domain>/ops/index.ts`, and
`<domain>/ops/<operation-id>/` children.

Applies to:
- `scopes/domain/scopes/ops/scope.md`
- `scopes/domain/scopes/ops/files/contracts-ts.md`
- `scopes/domain/scopes/ops/files/index-ts.md`
- operation child directories under `<domain>/ops/`

Required behavior:
- the operation contract registry covers every operation child selected by the
  `ops/` scope;
- the operation implementation registry covers every operation child selected
  by the `ops/` scope;
- registry identifiers match the owning operation child identifiers.

Violation messages:
- an operation child exists without a corresponding registry entry;
- a registry entry names an operation child that does not exist;
- a registry entry points through broad helper, shared, or compatibility
  barrels instead of the owning operation surface.

Enforcement:
Grit/source-shape or TypeScript/package check.
