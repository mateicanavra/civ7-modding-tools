# Domain Structure And Module Shape

This reference describes the active nested MapGen domain model. Executable
authority lives in `.habitat/blueprints/`; `.habitat/scopes/domain/` explains
the same model for authors. Historical examples and project notes do not
override those generic kind laws.

## Ownership Spine

```text
mods/<mod>/src/domain/<domain>/
  contract.ts
  router.ts
  index.ts
  model/                         # optional vocabulary shared by sibling modules
    atoms/
    policy/
    rules/
  modules/
    <module>/
      contract.ts
      router.ts
      index.ts
      model/                     # optional vocabulary local to this module
        atoms/
        policy/
        rules/
      artifacts/                 # optional immutable products owned by this module
        index.ts
        *.artifact.ts
      ops/
        <operation>/
          contract.ts
          index.ts
          rules/                 # optional private implementation rules
          strategies/
            index.ts
            <semantic-id>/
              config.ts
              index.ts
```

The hierarchy is semantic:

- A domain composes module contracts and executable routers.
- A module owns its operations, immutable artifacts, and local model language.
- An operation defines one input/output contract shared by every strategy.
- A strategy leaf owns one semantic configuration definition and one
  implementation of that operation contract.
- Model atoms, policy, and rules live at the lowest level that owns their
  meaning. They rise only when sibling modules genuinely share them.

Closed means closed. Do not add a root `ops.ts`, a flat domain `ops/`, root
artifacts, `model/schemas`, operation `types.ts`, flat strategy files, generic
helper cabinets, or compatibility barrels. Content that does not fit the spine
must descend to its semantic owner, rise to a genuine shared owner, move to an
exterior authority, or be deleted.

## Aggregate Surfaces

Each aggregate surface is singular and narrow:

- Domain `contract.ts` exports the domain contract composed from direct module
  contracts.
- Domain `router.ts` exports the executable domain router composed from direct
  module routers.
- Domain `index.ts` exports the intended public domain surface.
- Module `contract.ts` exports the module contract composed from its operation
  contract registry and artifact catalog.
- Module `router.ts` binds that contract to the module's executable operations.
- Module `index.ts` exports the intended public module surface.
- `artifacts/index.ts` exports the singular artifact catalog.

Do not re-export every child contract or implementation beside its aggregate.
Consumers select through the aggregate they are allowed to know.

## Operation And Strategy Shape

An operation contract lives in `<operation>/contract.ts` and owns:

- stable semantic id and kind;
- one inline input schema;
- one inline output schema;
- the complete tuple of strategy definitions imported from semantic strategy
  `config.ts` files.

The operation `index.ts` creates one executable operation from that contract
and the executable strategy tuple in `strategies/index.ts`. It does not export
an additional type bag or child contract surface.

Each `strategies/<semantic-id>/config.ts` exports one `defineStrategy(...)`
definition containing the semantic id and authored config schema. Its
`index.ts` uses `createStrategy(operationContract, strategyDefinition, ...)`
to implement the shared operation input/output contract. A one-strategy
operation infers its sole default; a multi-strategy operation explicitly
selects a semantic default. `"default"` is not a strategy identity.

Rules and strategies consume model atoms for shared schema vocabulary. They do
not import artifact schemas or operation input/output types as a substitute for
decomposition.

## Artifact Shape

Artifacts belong to the domain module that produces their immutable semantic
data. Each `*.artifact.ts` file exports one `artifact` created by a single
weighted `defineArtifact(...)` definition:

- artifact-private schema is authored inline;
- complete structural and semantic admission is attached through `refine`;
- only genuinely shared schema primitives come from the owning model's atoms;
- no detached schema, validator, issue contract, or second artifact authority
  is exported.

Recipe stages do not own domain artifact catalogs. Current engine state is read
through the invocation-local adapter and is not published as an immutable
artifact that immediately becomes stale.

## Recipe Boundary

Step `config.ts` selects operation contracts from public domain/module
contracts and artifact handles from the exact owning module catalog. Step
`step.ts` receives executable operations and declared artifact runtimes from
`createStep`; it does not deep-import operation implementations or access raw
artifact storage.

Runtime recipe wiring imports the public domain routers. Stages establish
recipe order and projection/materialization boundaries; they do not recreate
domain contracts, artifacts, or policy.

## Enforcement

Before editing unfamiliar domain structure, run:

```text
bun habitat classify <path>
```

Then run the exact targets and rules it reports. The generic laws under these
blueprints are the source of structural truth:

- `.habitat/blueprints/domain/`
- `.habitat/blueprints/domain-subdomain/`
- `.habitat/blueprints/domain-operation/`
- `.habitat/blueprints/domain-operation-strategy/`
- `.habitat/blueprints/domain-atom/`
- `.habitat/blueprints/domain-policy/`
- `.habitat/blueprints/artifact/`

Do not replace those kind laws with recipe-, domain-, module-, or filename
inventories. Niche rules may narrow a real local invariant, but they never
redefine the blueprint.
