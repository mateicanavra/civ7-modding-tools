# Domain Entrypoint File

Status: active working reference

Subject:
`<domain>/index.ts`

Role:
the narrow public gateway for one domain.

Required shape:

- default-exports the domain contract from `./contract.js`;
- may expose intentionally public model or module entrypoints only through
  their own `index.js` owner surfaces.

The executable router remains available only from the explicit `/router`
specifier. The entrypoint does not reach into module internals, re-export
constituent operation contracts or implementations, or recreate
contract/router aggregates.

Executable authority:
`.habitat/blueprints/domain/require_domain_entrypoint_shape/`.
