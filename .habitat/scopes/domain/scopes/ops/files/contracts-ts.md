# Domain Ops Contracts File

Status: active working reference

Subject:
`<domain>/ops/contracts.ts`

Role:
domain operation contract registry.

Required shape:
- exports the operation contract set consumed by the domain root contract.

Allowed contents:
- operation contract imports from operation-local contract surfaces;
- registry assembly for operation contracts.

Violation messages:
- operation implementations;
- domain policy or config definitions;
- broad barrels or compatibility re-exports.

Import/export boundary:
- imports from `./<operation-id>/contract.js` style owner surfaces;
- exports the registry used by `<domain>/index.ts`.

Enforcement:
structure for existence; later Grit/source-shape or TypeScript/package check
for registry shape.
