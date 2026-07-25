# Domain Operation Scope

Status: active working reference

Subject:
`<domain>/modules/<module>/ops/<operation>/`

Ownership boundary:
one pure operation contract and its swappable semantic strategies. The module
acts like a router: operations define its callable capabilities; strategies
provide interchangeable implementations of each operation contract; local
rules compose into those strategies.

Required direct members:

- `contract.ts`: one operation input/output contract and strategy definitions;
- `index.ts`: one operation implementation binding;
- `strategies/`: semantic implementation variants.

Optional direct members:

- `rules/`: pure helpers used only by this operation.

Policy and schema vocabulary live in the nearest module or domain `model/`.
The operation root does not admit local artifact catalogs, config facades,
cross-operation helpers, adapters, recipes, or runtime orchestration.

Executable authority:
`.habitat/blueprints/domain-operation/`.
