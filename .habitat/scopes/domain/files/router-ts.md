# Domain Router File

Status: active working reference

Subject:
`<domain>/router.ts`

Role:
the singular executable router aggregate for the domain.

Required shape:

- imports the domain contract from `./contract.js`;
- imports each direct semantic module router from
  `./modules/<module>/router.js`;
- creates one router whose keys align exactly with the contract's modules;
- default-exports that router and exports no constituent router.

The file binds existing module routers. It does not implement operations,
define policy, own artifacts, or create an alternate public API.

Executable authority:
`.habitat/blueprints/domain/require_domain_router_aggregate_shape/`.
