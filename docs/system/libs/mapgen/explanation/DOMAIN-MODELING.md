<toc>
  <item id="purpose" title="Purpose"/>
  <item id="domain" title="What a domain owns"/>
  <item id="ops" title="Ops vs steps"/>
  <item id="shape" title="Domain and module shape"/>
  <item id="model" title="Model vocabulary ownership"/>
  <item id="boundaries" title="Boundaries + dependency direction"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Domain modeling (explanation)

## Purpose

Explain how MapGen uses domains to keep algorithmic code modular, testable, and reusable across recipes.

Contract references:
- [`docs/system/libs/mapgen/reference/domains/DOMAINS.md`](/system/libs/mapgen/reference/domains/DOMAINS.md)
- [`docs/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md`](/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md)

## What a domain owns

A domain should own:
- the canonical algorithms (ops),
- domain-level truth/projection semantics,
- and the stable model vocabulary genuinely shared across its modules.

Domains should not own:
- recipe composition,
- step ordering,
- or adapter/Studio UX.

## Ops vs steps

- **Ops** are the “algorithm units”:
  - pure compute/plan whose leaf `contract.ts` owns the admitted input and
    output envelopes.
- **Steps** are orchestration:
  - they bind ops, read and publish admitted artifacts, invoke declared engine capabilities, emit
  trace events, and may project invocation-local observations through optional
  metrics/visualization facets.

This separation keeps algorithmic code reusable and keeps orchestration visible and debuggable.

## Domain and module shape

A domain is a semantic router, not a flat cabinet of operations. Its root
contract composes direct modules; its router attaches the corresponding
implementations. Direct modules repeat the same contract/router split around a
cohesive operation family. Today the hierarchy intentionally stops after that
one direct module level.

```text
domain/<domain>/
  index.ts
  contract.ts
  router.ts
  model/                 # optional domain-wide vocabulary
    atoms/
    policy/
  modules/
    <module>/
      index.ts
      contract.ts
      router.ts
      model/             # optional module-wide vocabulary
        atoms/
        policy/
      artifacts/         # products owned by this module
      ops/
        contract.ts      # singular operation-contract registry
        index.ts         # operation implementations
        <operation>/
```

`contract.ts` describes what can be composed. `router.ts` supplies executable
implementations. `index.ts` is the small public gateway. Artifact catalogs live
with the module that produces their data products rather than in a second
domain-wide registry.

## Model vocabulary ownership

`model/atoms` owns small composable schema primitives, cohesive subentities,
their derived types, and stable identities. `model/policy` owns stable decisions
and constraints. Neither directory is a generic home for helpers, config bags,
constants, complete artifact payloads, complete operation envelopes, or
artifact authorities. If a schema fills an entire artifact or call envelope and
is reused unchanged elsewhere, it has not been decomposed into an atom; it has
blurred two owners.

Place vocabulary at the lowest semantic owner that covers every real consumer:

- operation-local vocabulary stays with the operation,
- vocabulary shared by operations in one module belongs to that module's model,
- vocabulary shared across sibling modules belongs to the domain model.

Do not create empty model directories, and do not hoist vocabulary merely
because it might become reusable later. Authoring config remains with its real
stage, step, or operation owner rather than being routed through domain model
vocabulary.

An operation's complete input/output `Type.Object` envelopes exist only as
direct inline schemas in that leaf operation's `contract.ts`. Their individual
properties may compose exact atoms from the nearest owner: its module model
first, the aggregate domain model for cross-module vocabulary, and an exact
sibling-module atom only when the dependency genuinely crosses modules. The
contract never imports an artifact catalog or borrows an artifact's complete
payload schema.

Rules, strategies, and implementations consume private algorithm
`Params`/`Result` types, composed from atom types only for the smaller semantic
parts that are genuinely shared. They do not derive reusable types from a
contract's input/output envelope or an artifact's schema. Artifact owners
independently author their complete payload schema in `defineArtifact`, compose
smaller atoms inside it, and add identity plus any runtime refinement;
`artifacts/index.ts` remains the artifact aggregation surface.

Strategy configuration has a separate leaf authority under the semantic
strategy directory. Detached `StrategySchema` declarations in an operation
contract are transitional, not model atoms and not the destination. The exact
typed registration API is being ratcheted in the dedicated strategy-topology
slice; until then, do not create new detached strategy schema authorities.

Operation and artifact ids are stable, namespaced identities owned by their respective contracts.
Completion ids are typed constants owned by the recipe whose external-state transactions they
connect. None requires a parallel generic tag registry.

## Boundaries + dependency direction

Preferred dependency direction:
- stages/steps depend on public domain/module contracts and artifact catalogs,
- leaf operation contracts inline complete input/output envelopes and compose
  exact nearest-owner atoms only for smaller properties or subentities,
- artifact owners locally compose complete payload schemas from smaller atoms
  and add artifact identity/admission,
- strategies and rules depend on private algorithm types and smaller atom types
  rather than contract/artifact-derived or payload-shaped aliases,
- module internals may depend upward on their domain model,
- domain-wide vocabulary never depends downward on a module,
- consumers depend on recipes (to compile/run),
- domains do not depend on specific recipes or consumers.

## Ground truth anchors

- Domain contract authoring: `packages/mapgen-core/src/authoring/domain/contract.ts`
- Domain router authoring: `packages/mapgen-core/src/authoring/domain/router.ts`
- Op authoring helpers: `packages/mapgen-core/src/authoring/operation/contract.ts`
- Example aggregate contract/router: `plugins/mod/map/swooper-physics/src/domain/foundation/contract.ts`, `plugins/mod/map/swooper-physics/src/domain/foundation/router.ts`
- Example direct module: `plugins/mod/map/swooper-physics/src/domain/foundation/modules/tectonics/`
- Domain contract index: `docs/system/libs/mapgen/reference/domains/DOMAINS.md`
