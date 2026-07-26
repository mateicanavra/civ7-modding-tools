# Domain Module Entrypoint File

Status: active working reference

Subject:
`<domain>/modules/<module>/index.ts`

Role:
the narrow public gateway for one semantic module.

Required shape:

- default-exports the module contract from `./contract.js`;
- may expose the module artifact catalog or intentional model entrypoints only
  through their canonical `index.js` owners.

The executable router remains available only from the explicit `/router`
specifier. The entrypoint does not reach into operation leaves, re-export
constituent contracts or strategies, or recreate module aggregates.

Executable authority:
`.habitat/blueprints/domain-subdomain/require_domain_module_entrypoint_shape/`.
