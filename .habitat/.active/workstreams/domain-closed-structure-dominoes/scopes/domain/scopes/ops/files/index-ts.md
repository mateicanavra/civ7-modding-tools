# Domain Ops Index File

Status: active working reference

Subject:
`<domain>/ops/index.ts`

Role:
domain operation implementation registry.

Required shape:
- exports the implementation registry consumed by root `ops.ts`.

Allowed contents:
- operation implementation imports from operation-local entry surfaces;
- registry assembly for operation implementations.

Violation messages:
- operation implementation bodies;
- config, policy, or data definitions;
- cross-domain imports that bypass named owner surfaces.

Import/export boundary:
- imports from operation-local `index.ts` surfaces;
- exports the registry used by `<domain>/ops.ts`.

Enforcement:
structure for existence; later Grit/source-shape or TypeScript/package check
for registry shape.
