# Operation Contract File

Status: active working reference

Subject:
`<domain>/ops/<operation-id>/contract.ts`

Role:
operation contract surface.

Required shape:
- defines the operation contract consumed by the domain operation registry.

Allowed contents:
- operation input/output/strategy contract declarations;
- contract-local types required to express that operation contract.

Violation messages:
- operation implementation bodies;
- strategy implementations;
- cross-operation policy;
- domain-wide model policy or data.

Import/export boundary:
- exports the operation contract surface for `ops/contracts.ts`.
- may import reusable schema primitives from `<domain>/model/schemas/`;
- may import reusable policy constants from `<domain>/model/policy/`;
- must not import sibling or family `config.ts` bags.

Enforcement:
structure for existence; Grit/source-shape gate in
`.habitat/blueprints/domain-operation/require_operation_contract_file_shape/`.
