# Domain Module Contract File

Status: active working reference

Subject:
`<domain>/modules/<module>/contract.ts`

Role:
the singular contract aggregate for one semantic module.

Required shape:

- imports `defineDomainSubdomain` from MapGen Core authoring contracts;
- default-imports each leaf operation contract from
  `./ops/<operation>/contract.js`;
- composes the exact operation record inline in `defineDomainSubdomain`;
- defines and default-exports one module contract;
- exports no constituent operation contract.

The file does not delegate through `ops/contract.ts`, invent a parallel
artifact catalog, or re-export individual operations or artifacts.

Executable authority:
`.habitat/blueprints/domain-subdomain/require_domain_module_contract_aggregate_shape/`.
