# Strategy Uses Approved Local Surfaces

Status: active working reference

Subject:
`<domain>/ops/<operation-id>/strategies/*.ts`

Applies to:
- `scopes/domain/scopes/ops/scopes/operation/scopes/strategies/scope.md`
- strategy implementation files
- operation-local `contract.ts`, `types.ts`, `policy/`, and `rules/` surfaces

Required behavior:
- strategy implementations stay owned by one operation;
- strategy implementations use approved operation-local contract, type,
  policy, and rule surfaces;
- cross-operation or domain-wide concerns are imported from their named owner.

Violation messages:
- strategy files define domain-wide policy;
- strategy files import official Civ7 fact tables directly when a policy owner
  exists;
- strategy files reach into another operation's private implementation surface;
- strategy files create shared helper ownership by local import convention.

Enforcement:
Grit/source-shape, TypeScript/package check, or semantic review.
