# Domain Module Router File

Status: active working reference

Subject:
`<domain>/modules/<module>/router.ts`

Role:
the singular executable router for one semantic module.

Required shape:

- imports its module contract from `./contract.js`;
- default-imports each leaf operation implementation from
  `./ops/<operation>/index.js`;
- binds the exact implementation record inline;
- creates one router whose operation keys align with the contract;
- default-exports that router.

It does not delegate through `ops/index.ts`, implement operations, or define
model, artifact, recipe, adapter, or compatibility behavior.

Executable authority:
`.habitat/blueprints/domain-subdomain/require_domain_module_router_binding_shape/`.
