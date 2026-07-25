# Domain Scope

Status: active working reference

Subject:
`mods/<mod>/src/domain/<domain>/`

Ownership boundary:
one public composition boundary over semantic modules. A domain owns
recipe-independent model language and composes module contracts and routers.
Recipe ordering, stage projection, adapter/runtime behavior, official Civ7
catalogs, and generic MapGen mechanics remain exterior.

Required direct members:

- `contract.ts`: singular aggregate of direct module contracts;
- `router.ts`: singular aggregate of direct module routers;
- `index.ts`: narrow public domain entrypoint;
- `modules/`: semantic module container.

Optional direct member:

- `model/`: atoms, policy, or rules shared by multiple direct modules.

Closed means closed. A domain root does not admit `ops.ts`, direct `ops/`,
direct `artifacts/`, config facades, helper cabinets, or compatibility barrels.
Content that does not fit the spine must descend to its semantic module, rise
to an actual shared owner, move to an exterior authority, or be deleted.

Executable authority:

- `.habitat/blueprints/domain/require_domain_source_topology/`
- `.habitat/blueprints/domain/require_domain_contract_aggregate_shape/`
- `.habitat/blueprints/domain/require_domain_router_aggregate_shape/`
- `.habitat/blueprints/domain/require_domain_entrypoint_shape/`
- `.habitat/blueprints/domain/require_domain_model_source_topology/`
