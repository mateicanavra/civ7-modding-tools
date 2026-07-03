# Operation Index File

Status: active working reference

Subject:
`<domain>/ops/<operation-id>/index.ts`

Role:
operation implementation entrypoint.

Required shape:
- exports the operation implementation consumed by `<domain>/ops/index.ts`.

Allowed contents:
- assembly of the operation implementation from local contract, policy, rules,
  strategies, and types.

Violation messages:
- domain-wide registries;
- unrelated operation implementations;
- reusable official Civ7 fact tables or adapter behavior.

Import/export boundary:
- exports the owning operation implementation surface only.

Enforcement:
structure for existence; later Grit/source-shape gate for operation entry
grammar.
