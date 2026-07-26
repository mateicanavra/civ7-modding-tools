# Domain Modules Scope

Status: active working reference

Subject:
`<domain>/modules/`

Ownership boundary:
semantic modules directly composed by the domain. A module is a router-like
unit with one contract, one executable router, operations that implement its
capabilities, and optional local model and artifact products.

Each direct child is a semantic module whose closed root contains:

- required `contract.ts`, `router.ts`, `index.ts`, and `ops/`;
- optional `model/` and `artifacts/`.

Modules do not coexist with pseudo-modules such as `shared`, `support`,
`helpers`, or flattened operation families. Model vocabulary and artifact
products use their dedicated child kinds.

Executable authority:
`.habitat/blueprints/domain-subdomain/`.
