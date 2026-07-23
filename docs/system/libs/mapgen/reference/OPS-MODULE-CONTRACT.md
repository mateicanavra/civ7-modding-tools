<toc>
  <item id="purpose" title="Purpose"/>
  <item id="contract" title="Contract"/>
  <item id="types" title="Type authority"/>
  <item id="strategies" title="Strategies (how variability is encoded)"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Ops module contract

## Purpose

Define how domain operations (ops) are authored and bound into the pipeline in a way that is:
- strict (contracts + schemas),
- composable (ops reused across steps),
- and stable across packages.

Domains are aggregate semantic routers. Each direct child under `modules/` is
also a semantic router for one cohesive operation family. The hierarchy
currently permits one direct module level; it does not create a recursive tree
of arbitrary operation folders.

## Contract

- Ops are defined by an op contract id (stable string id).
- Ops implementations are bound by id at compile time.
- Op variability is encoded via a `strategy` envelope rather than ad-hoc branching.
- Each leaf operation's `contract.ts` is the only owner of its input/output
  envelopes, authors both roots directly inside `defineOp`, and exports its
  contract as the default authority.
- Each strategy's configuration schema belongs to that semantic strategy
  leaf's `contract.ts`. The dedicated strategy-topology successor will settle
  and enforce the typed registration API; detached `StrategySchema` authorities
  in operation contracts are not the destination.
- Each module's singular `ops/contract.ts` privately collects its operation
  contracts and exports only the aggregate default authority.
- Each module's `ops/index.ts` binds the corresponding implementations.
- The module `contract.ts` exposes that operation contract set through
  `defineDomainSubdomain`; its `router.ts` supplies the implementations through
  `createDomainSubdomainRouter`.

Representative input/output surface. The complete `defineOp` example returns
after the strategy leaf contract API lands; this fragment does not present an
empty strategy registry that Core would refuse:

```ts
// Direct properties inside defineOp({ ... }):
input: Type.Object({
  bounds: GridBoundsSchema,
  segmentEvents: Type.Array(TectonicEventSchema),
  hotspotEvents: Type.Array(TectonicEventSchema),
  weight: Type.Number({ minimum: 0, maximum: 10 }),
}),
output: Type.Object({
  era: Type.Integer({ minimum: 0 }),
  events: Type.Array(TectonicEventSchema),
}),
```

## Type authority

The contract envelope is owner-local admission wiring, not reusable domain
vocabulary. Complete input/output schemas are direct `Type.*(...)` expressions
inside `defineOp`. Their properties may compose smaller schema primitives or
cohesive subentities from exact `model/atoms` files; they never recover or
borrow a complete payload through an artifact catalog. An exact sibling-module
atom import is allowed only when the operation truly consumes that smaller
semantic part.

Rules, strategies, and implementations use private algorithm `Params`/`Result`
types, composing atom types only for smaller shared parts. They do not export or consume
`Static<typeof Contract.input>`, `Static<typeof Contract.output>`, indexed
contract input/output types, or types inferred from `artifact.schema`.
`createOp` and `createStrategy` still use the default contract authority to
bind admission and implementations; that binding is not a second source for
domain value types.

## Strategies (how variability is encoded)

Ops use a “strategy envelope”:

- `config.strategy` selects a strategy id
- `config.config` holds strategy-specific config
- a sole semantic strategy is necessarily the default
- a multi-strategy operation explicitly names `defaultStrategy`; object order never selects behavior
- strategy ids describe behavior; `"default"` is not a valid strategy identity

Strategy configuration belongs to `strategies/<semantic-id>/contract.ts`, not
to a detached root constant in the operation contract. Existing inline or
detached operation-owned strategy schemas remain migration input until the
strategy-topology successor establishes the exact typed registration API; this
reference does not claim that global corpus is already sealed.

Every returned contract exposes the resolved `defaultStrategy` and TypeBox-materialized
`defaultConfig`, regardless of whether the author inferred or declared the default.
This is a hard authoring cut: raw operation envelopes that selected `"default"` must migrate to
the operation's semantic strategy id. Recipe-level persisted configuration remains governed by
its stage public schema and compile mapping rather than by raw operation envelopes.

Representative example (createOp binds strategy implementations by id; excerpt; see full file in anchors):

```ts
import { createOp } from "@swooper/mapgen-core/authoring";
import ComputePlateTopologyContract from "./contract.js";
import { wrappedHexAdjacencyStrategy } from "./strategies/index.js";

export default createOp(ComputePlateTopologyContract, {
  strategies: { "wrapped-hex-adjacency": wrappedHexAdjacencyStrategy },
});
```

## Ground truth anchors

- Op contract definition: `packages/mapgen-core/src/authoring/op/contract.ts`
- Op creation and strategy enforcement: `packages/mapgen-core/src/authoring/op/create.ts`
- Strategy schema/envelope: `packages/mapgen-core/src/authoring/op/envelope.ts`
- Binding compile-time ops by id: `packages/mapgen-core/src/authoring/bindings.ts`
- Current operation-authoring guide: `docs/system/libs/mapgen/how-to/add-an-op.md`
- Example module contract and router: `mods/mod-swooper-maps/src/domain/foundation/modules/mesh/contract.ts`, `mods/mod-swooper-maps/src/domain/foundation/modules/mesh/router.ts`
- Example operation registry: `mods/mod-swooper-maps/src/domain/foundation/modules/mesh/ops/contract.ts`
- Example op contract: `mods/mod-swooper-maps/src/domain/foundation/modules/mesh/ops/compute-mesh/contract.ts`
- Example op implementation: `mods/mod-swooper-maps/src/domain/foundation/modules/mesh/ops/compute-mesh/index.ts`
- Example extracted strategy binding: `mods/mod-swooper-maps/src/domain/foundation/modules/projection/ops/compute-plate-topology/index.ts`
