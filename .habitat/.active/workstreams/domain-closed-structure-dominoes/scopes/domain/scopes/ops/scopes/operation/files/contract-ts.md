# Operation Contract File

Status: active working reference

Subject:
`<domain>/ops/<operation-id>/contract.ts`

Role:
operation contract surface.

Required shape:
- defines the operation contract consumed by the domain operation registry.

Allowed contents:
- operation input/output/config contract declarations;
- contract-local types required to express that operation contract.

Violation messages:
- operation implementation bodies;
- strategy implementations;
- cross-operation policy;
- domain-wide model policy or data.

Import/export boundary:
- exports the operation contract surface for `ops/contracts.ts`.

Enforcement:
structure for existence; later Grit/source-shape gate for contract grammar.
