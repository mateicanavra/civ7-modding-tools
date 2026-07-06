# Domain Ops Index File

Status: active working reference

Subject:
`<domain>/ops/index.ts`

Role:
domain operation implementation registry.

Required shape:
- exports the implementation registry consumed by root `ops.ts`.

Allowed contents:
- type imports for registry typing;
- default imports from direct ops-child `index.js` surfaces;
- shorthand registry assembly for operation implementations;
- the default registry export.

Violation messages:
- operation implementation bodies;
- config, policy, or data definitions;
- cross-domain imports that bypass named owner surfaces.
- named operation re-exports or convenience exports.
- named, namespace, side-effect, or type-only imports from operation entry surfaces;
- keyed, inline, spread, method, or accessor registry entries.

Import/export boundary:
- imports from direct ops-child `index.ts` surfaces;
- exports only the registry used by `<domain>/ops.ts`.

Enforcement:
`require_domain_ops_registry_surface` enforces the source shape. Directory
legality for the ops-child surfaces remains owned by domain topology.
