# Domain Module Operations Scope

Status: active working reference

Subject:
`<domain>/modules/<module>/ops/`

Ownership boundary:
one closed directory per semantic operation. Declarative aggregation belongs
to the parent module `contract.ts`; executable aggregation belongs to its
`router.ts`.

Required direct members:

- one or more semantic operation directories.

No collection-level `contract.ts`/`index.ts`, flat operation files, shared
helpers, policy, artifacts, or config facades are admitted at this level.
Shared semantic vocabulary moves to the nearest model; generic mechanics move
to MapGen Core.

Executable authority:
`.habitat/blueprints/domain-operation/require_domain_operation_source_topology/`.
