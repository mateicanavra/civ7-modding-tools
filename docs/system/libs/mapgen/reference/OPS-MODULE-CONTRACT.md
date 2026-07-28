<toc>
  <item id="purpose" title="Purpose"/>
  <item id="contract" title="Contract"/>
  <item id="operation-input-admission" title="Operation input admission"/>
  <item id="types" title="Type authority"/>
  <item id="strategies" title="Strategies (how variability is encoded)"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Operation module contract

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
- Executable ops are collected once by canonical id into the recipe's `operations` registry.
- Compilation and step execution bind against that same registry; there is no parallel runtime registry.
- Op variability is encoded via a `strategy` envelope rather than ad-hoc branching.
- Each leaf operation's `contract.ts` is the only owner of its input/output
  envelopes, authors both roots directly inside `defineOp`, and exports its
  contract as the default authority.
- Each strategy's semantic definition belongs to that leaf's `config.ts`: one
  immutable id plus its authored config schema, returned by `defineStrategy`.
- The operation contract imports leaf configs directly and supplies their
  definition tuple to `defineOp`. There is no strategy-root config or contract
  aggregate; `strategies/index.ts` aggregates implementations only.
- The owning module's singular `contract.ts` imports leaf operation contracts
  directly and composes them through `defineDomainSubdomain`.
- The owning module's singular `router.ts` imports leaf operation
  implementations directly and binds them through
  `createDomainSubdomainRouter`.
- The module's `ops/` directory contains only semantic operation directories;
  it does not add an intermediate contract or implementation registry.
- Aggregate surfaces do not publish named child-contract re-exports. Consumers
  select operation contracts through the public nested domain contract.

Representative operation contract surface:

```ts
import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";
import plateDrivenDefinition from "./strategies/plate-driven/config.js";

export default defineOp({
  kind: "compute",
  id: "world/shape-relief",
  input: Type.Object({ strength: Type.Number() }),
  output: Type.Object({ relief: Type.Number() }),
  strategies: [plateDrivenDefinition],
});
```

Representative direct module composition:

```ts
// modules/shape/contract.ts
import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";
import shapeRelief from "./ops/shape-relief/contract.js";

export default defineDomainSubdomain({
  id: "shape",
  ops: { shapeRelief },
});
```

```ts
// modules/shape/router.ts
import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import shapeRelief from "./ops/shape-relief/index.js";

export default createDomainSubdomainRouter(contract, { shapeRelief });
```

## Operation input admission

Operation inputs are observational data by definition. The public invocation surface, step-bound
runtime surface, and strategy boundary therefore share one canonical deeply readonly
`OperationInput<Schema>` projection. Ordinary mutable schema-shaped values remain assignable by
callers, and immutable artifact reads can be forwarded without casts or defensive copies.

Core admits that caller-provided value once at the executable operation boundary. It first checks
the complete TypeBox shape, then exact typed-array constructors and cardinalities, without applying
defaults, cleaning, cloning, freezing, or wrapping. The strategy receives the same reference under
`AdmittedOperationInput<Schema>`; that type preserves the readonly input surface and adds genuine
typed-array admission brands. Operation outputs remain ordinary newly owned values.

This is a zero-copy readonly authoring constraint, not runtime isolation. TypeScript's structural
assignability can widen a readonly object into a compatible writable structural type, and explicit
casts can bypass any compile-time projection. Strategy and helper code must not widen or cast input
data into mutable APIs. Code that needs to retain or mutate input-derived state copies it into newly
owned storage. Hard runtime immutability would require an explicit snapshot or storage boundary and
is not implied by operation admission.

Select typed-array cardinality by the exact relation the input owns:

- omitted `cardinality` means the conventional grid product `width * height`;
- a path tuple means the exact product of the referenced numeric input paths;
- `{ factors, addend }` means that product plus a fixed nonnegative addend,
  including the terminal entry in a CSR offsets array; and
- `"constructor-only"` checks the exact constructor without a length relation
  and is reserved for inputs that genuinely have no fixed input-relative
  cardinality.

`"map-grid"` is contextual artifact cardinality. Operation contracts have no
admitted setup context and refuse that mode when the operation is constructed;
use the ordinary input-relative modes above.

```ts
input: Type.Object({
  width: Type.Integer({ minimum: 1 }),
  height: Type.Integer({ minimum: 1 }),
  cellCount: Type.Integer({ minimum: 1 }),
  grid: TypedArraySchemas.u8(),
  latitudeByRow: TypedArraySchemas.f32({ cardinality: ["height"] }),
  offsets: TypedArraySchemas.i32({
    cardinality: { factors: ["cellCount"], addend: 1 },
  }),
  samples: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
}),
```

The structural and typed-array programs are compiled once when `createOp` constructs the operation.
The schema-owned typed-array compiler is shared, but each boundary selects its capabilities.
Operation inputs compile input-relative metadata and refuse contextual `"map-grid"`; artifacts
compile the same exact-constructor walker with admitted dimensions.

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

Strategy definition belongs to `strategies/<semantic-id>/config.ts`, not to a
detached root constant or a strategy-root barrel. The file exports one default
`defineStrategy({ id, config })` authority. Its sibling `index.ts` imports that
definition plus the shared operation `contract.ts`, then binds the implementation
with `createStrategy(OperationContract, StrategyDefinition, implementation)`.
The operation's `strategies/index.ts` aggregates only those implementations.

```text
shape-relief/
  contract.ts
  index.ts
  strategies/
    index.ts
    plate-driven/
      config.ts
      index.ts
```

Every returned contract exposes the resolved `defaultStrategy` and TypeBox-materialized
`defaultConfig`, regardless of whether the author inferred or declared the default.
This is a hard authoring cut: raw operation envelopes that selected `"default"` must migrate to
the operation's semantic strategy id. Recipe-level persisted configuration remains governed by
its stage public schema and compile mapping rather than by raw operation envelopes.

Representative implementation composition:

```ts
import { createOp } from "@swooper/mapgen-core/authoring";
import ComputePlateTopologyContract from "./contract.js";
import strategies from "./strategies/index.js";

export default createOp(ComputePlateTopologyContract, {
  strategies,
});
```

## Ground truth anchors

- Op contract definition: `packages/mapgen-core/src/authoring/operation/contract.ts`
- Strategy definition factory: `packages/mapgen-core/src/authoring/operation/strategy-definition.ts`
- Op creation and strategy enforcement: `packages/mapgen-core/src/authoring/operation/create.ts`
- Strategy schema/envelope: `packages/mapgen-core/src/authoring/operation/envelope.ts`
- Collecting and binding canonical executable ops: `packages/mapgen-core/src/authoring/operation/bindings.ts`
- Current operation-authoring guide: `docs/system/libs/mapgen/how-to/add-an-op.md`
- Example module contract and router:
  `plugins/mod/map/swooper-physics/src/domain/foundation/modules/mesh/contract.ts`,
  `plugins/mod/map/swooper-physics/src/domain/foundation/modules/mesh/router.ts`
- Example op contract: `plugins/mod/map/swooper-physics/src/domain/foundation/modules/mesh/ops/compute-mesh/contract.ts`
- Example op implementation: `plugins/mod/map/swooper-physics/src/domain/foundation/modules/mesh/ops/compute-mesh/index.ts`
- Example extracted strategy binding: `plugins/mod/map/swooper-physics/src/domain/foundation/modules/projection/ops/compute-plate-topology/index.ts`
