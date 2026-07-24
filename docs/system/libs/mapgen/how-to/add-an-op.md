<toc>
  <item id="purpose" title="Purpose"/>
  <item id="prereqs" title="Prereqs"/>
  <item id="checklist" title="Checklist"/>
  <item id="verification" title="Verification"/>
  <item id="footguns" title="Footguns"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# How-to: add an op

## Purpose

Add a new **op** to a direct domain module (`defineOp` contract + `createOp`
implementation + module registry wiring).

This how-to is **module-level** (ops live inside a semantic module under a
domain). It routes to:
- Ops module contract reference: [`docs/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md`](/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md)
- Import policy: [`docs/system/libs/mapgen/policies/IMPORTS.md`](/system/libs/mapgen/policies/IMPORTS.md)

## Prereqs

- You have chosen the owning domain and direct semantic module. Prefer the
  lowest existing module that owns the operation's policy and outputs; do not
  add a generic operation cabinet.
- You’ve chosen a stable op id (namespaced; e.g. `"foundation/compute-mesh"`).
- You know what the op is: `kind: "compute" | "plan" | ...` and what its strategy surface is.

## Checklist

### 1) Define the op contract (`defineOp`)

- Create `contract.ts` for the op.
- Use `defineOp({ kind, id, input, output, strategies })`; author complete input
  and output schemas directly in that call rather than through detached root
  constants.
- Export the leaf contract as the file's default authority. Do not export named
  input/output envelope types or treat the envelope as domain vocabulary.
- Compose smaller input/output properties from exact primitive or subentity atom
  schemas at the nearest owner. Import a sibling module's atom directly only
  when the operation truly consumes that subentity; never import an artifact
  catalog or a complete artifact payload here.
- Put each strategy definition in that semantic strategy leaf's `config.ts` as
  the default result of `defineStrategy({ id, config })`.
- Import leaf configs directly into the operation contract and pass their tuple
  as `strategies`. Do not add a strategy-root config or contract barrel.
- Give every strategy a semantic id that names its behavior; never use `"default"`.
- For a multi-strategy operation, add `defaultStrategy` explicitly; object order never selects behavior.
- Make schemas explicit (TypedArray schemas for binary grids; keep descriptions meaningful).

#### Typed-array input admission

Choose typed-array cardinality from the input relation the operation can prove:

- omit `cardinality` for the conventional `width * height` grid;
- use a path tuple for the exact product of those numeric input paths;
- use `{ factors, addend }` for an exact product plus a fixed nonnegative
  addend, such as a CSR offsets array with one terminal entry; and
- use `"constructor-only"` only when the input genuinely has no fixed
  input-relative length relation.

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

Only typed-array schemas reachable through an operation's input compile this
metadata into runtime admission. Operation outputs and artifact schemas do not.

Representative owner-local operation contract:

```ts
import eventDistanceDecayDefinition from "./strategies/event-distance-decay/config.js";

export default defineOp({
  kind: "compute",
  id: "foundation/compute-era-tectonic-fields",
  input: Type.Object({ weight: Type.Number({ minimum: 0, maximum: 10 }) }),
  output: Type.Object({ era: Type.Integer({ minimum: 0 }) }),
  strategies: [eventDistanceDecayDefinition],
});
```

### 2) Implement the op (`createOp`)

- Create `index.ts` for the op and use `createOp(Contract, { strategies })`.
- Keep strategy functions deterministic and side-effect free.
- Give rules and strategies named atom types or private algorithm
  `Params`/`Result` types. Do not derive them from contract input/output or
  `artifact.schema`.

In each `strategies/<semantic-id>/index.ts`, bind the shared operation contract
and the sibling definition with `createStrategy`. Aggregate the resulting
implementations as a default tuple from `strategies/index.ts`.

Representative operation root:

```ts
import { createOp } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import strategies from "./strategies/index.js";

export default createOp(contract, {
  strategies,
});
```

### 3) Wire the op into the module registry

- Add the contract to the private aggregate in `ops/contract.ts`; that file
  exposes the aggregate as its sole default authority and does not re-export
  constituent operation contracts.
- Add the implementation to `ops/index.ts` and satisfy
  `DomainOpImplementationsForContracts<Contracts>` against the default
  aggregate's type.

Representative example (domain registry wiring; excerpt; see full file in anchors):

```ts
import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import computeEraTectonicFields from "./compute-era-tectonic-fields/index.js";

type Contracts = typeof import("./contract.js").default;

const implementations = {
  computeEraTectonicFields,
} as const satisfies DomainOpImplementationsForContracts<Contracts>;
```

### 4) Consume the op from a step (optional but common)

- Reference the op via the step contract’s `ops: { ... }` section.
- Call it via the injected `ops.*` handle inside the step `run()`.

## Verification

- Run:
  - `nx run mapgen-core:test`
  - `nx run mod-swooper-maps:test`
- Confirm the domain still type-checks (implementations match contracts).
- If wired into a step, run a traced execution and confirm the op call returns correctly shaped outputs.

## Footguns

- **Unstable op ids**: op ids are long-lived identifiers; treat them as public API within the MapGen ecosystem.
- **Breaking schema drift**: changing input/output schema is a breaking change for all steps that use the op.
- **Artifact-schema coupling**: artifacts and operation envelopes own different
  complete containers. They may compose the same smaller atoms independently;
  importing an artifact catalog or borrowing its payload reverses that
  authority.
- **Envelope-type leakage**: contract input/output types are admitted call
  shapes, not reusable rule or strategy types.
- **Generic strategy identity**: a strategy named `default` hides the behavior being selected. A sole
  semantic strategy is inferred as the default; a multi-strategy contract declares its default.
- **Wrong semantic owner**: an operation belongs to the module whose model and
  artifacts it uses, not to a domain-wide `ops/` cabinet.
- **Forgetting to wire contracts/implementations**: an op contract alone is inert; the module must export + implement it.

## Ground truth anchors

- Op contract API: `packages/mapgen-core/src/authoring/op/contract.ts`
- Op implementation wrapper: `packages/mapgen-core/src/authoring/op/create.ts`
- Domain registry authoring: `packages/mapgen-core/src/authoring/domain/contract.ts`
- Example op contract: `mods/mod-swooper-maps/src/domain/foundation/modules/tectonics/ops/compute-era-tectonic-fields/contract.ts`
- Example op implementation: `mods/mod-swooper-maps/src/domain/foundation/modules/tectonics/ops/compute-era-tectonic-fields/index.ts`
- Example model atoms: `mods/mod-swooper-maps/src/domain/foundation/modules/tectonics/model/atoms/`
- Module contract registry: `mods/mod-swooper-maps/src/domain/foundation/modules/tectonics/ops/contract.ts`
- Module implementation registry: `mods/mod-swooper-maps/src/domain/foundation/modules/tectonics/ops/index.ts`
