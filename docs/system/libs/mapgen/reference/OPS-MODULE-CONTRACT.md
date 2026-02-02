<toc>
  <item id="purpose" title="Purpose"/>
  <item id="contract" title="Contract"/>
  <item id="strategies" title="Strategies (how variability is encoded)"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Ops module contract

## Purpose

Define how domain operations (ops) are authored and bound into the pipeline in a way that is:
- strict (contracts + schemas),
- composable (ops reused across steps),
- and stable across packages.

## Contract

- Ops are defined by an op contract id (stable string id).
- Ops implementations are bound by id at compile time.
- Op variability is encoded via a `strategy` envelope rather than ad-hoc branching.

Representative example (defineOp contract surface; excerpt; see full file in anchors):

```ts
import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";

export default defineOp({
  kind: "compute",
  id: "morphology/compute-base-topography",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    crustBaseElevation: TypedArraySchemas.f32({ description: "Isostatic base elevation proxy per tile (0..1)." }),
    upliftPotential: TypedArraySchemas.u8({ description: "Uplift potential per tile (0..255)." }),
    riftPotential: TypedArraySchemas.u8({ description: "Rift potential per tile (0..255)." }),
    rngSeed: Type.Integer({ description: "Seed for deterministic base-topography noise." }),
  }),
  output: Type.Object({
    elevation: TypedArraySchemas.i16({ description: "Base elevation per tile (normalized, scaled to int16)." }),
  }),
  strategies: {
    default: ReliefConfigSchema,
  },
});
```

## Strategies (how variability is encoded)

Ops use a “strategy envelope”:

- `config.strategy` selects a strategy id
- `config.config` holds strategy-specific config

This makes op config explicit and schema-valid, and prevents config drift.

Representative example (createOp binds strategy implementations by id; excerpt; see full file in anchors):

```ts
import { createOp } from "@swooper/mapgen-core/authoring";
import ComputeBaseTopographyContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

export default createOp(ComputeBaseTopographyContract, {
  strategies: { default: defaultStrategy },
});
```

## Ground truth anchors

- Op contract definition: `packages/mapgen-core/src/authoring/op/contract.ts`
- Op creation and strategy enforcement: `packages/mapgen-core/src/authoring/op/create.ts`
- Strategy schema/envelope: `packages/mapgen-core/src/authoring/op/envelope.ts`
- Binding compile-time ops by id: `packages/mapgen-core/src/authoring/bindings.ts`
- Target modeling guidance: `docs/projects/engine-refactor-v1/resources/spec/SPEC-step-domain-operation-modules.md`
- Example op contract: `mods/mod-swooper-maps/src/domain/morphology/ops/compute-base-topography/contract.ts`
- Example op implementation: `mods/mod-swooper-maps/src/domain/morphology/ops/compute-base-topography/index.ts`
