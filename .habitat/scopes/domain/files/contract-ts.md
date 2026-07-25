# Domain Contract File

Status: active working reference

Subject:
`<domain>/contract.ts`

Role:
the singular contract aggregate for the domain.

Required shape:

- imports `defineDomain` from MapGen Core authoring contracts;
- imports each direct semantic module from
  `./modules/<module>/contract.js`;
- defines one domain contract from those modules;
- default-exports that contract and exports no constituent contract.

The file does not own operation contracts, schemas, policy, implementation
logic, compatibility exports, or public convenience aliases.

Executable authority:
`.habitat/blueprints/domain/require_domain_contract_aggregate_shape/`.
