# Operation Types File

Status: active working reference

Subject:
`<domain>/ops/<operation-id>/types.ts`

Role:
operation-local type convenience surface.

Required shape:
- contains types used by the owning operation family only.

Allowed contents:
- local convenience types that reduce repetition inside the owning operation.

Violation messages:
- domain-wide vocabulary;
- official Civ7 engine/global declarations;
- cross-operation public model types;
- config objects or executable helpers.

Import/export boundary:
- consumed by the owning operation internals only unless a later public surface
  owner-law names a broader surface.

Enforcement:
semantic review first; later source-shape gate if this slot proves unstable.
