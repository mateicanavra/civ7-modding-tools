---
level: error
---
# Require Domain Operation Implementation Type Boundary

An operation contract is the sole owner of its input and output envelopes.
Operation and semantic strategy entrypoints may bind the default contract value,
but strategy leaves and rules do not derive shared working types from that
envelope. Smaller reusable schema primitives and
cohesive subentity types live in the nearest model atoms; algorithm-private
`Params` / `Result` shapes remain private to the operation implementation. A
complete operation or artifact container is never moved into atoms merely to
make its type importable.

```grit
language js(typescript)

predicate is_operation_contract_dependency($source) {
  $source <: r"^[\"']?(?:\./|\.\./)+contract\.js[\"']?$"
}

predicate is_contract_envelope_name($value) {
  $value <: r"(?:Contract|contract)$"
}

or {
  import_statement(source=$source) where {
    $filename <: r"/rules/[^/]+\.ts$",
    is_operation_contract_dependency($source)
  },
  `export { $exports } from $source` where {
    is_operation_contract_dependency($source)
  },
  `export type { $exports } from $source` where {
    is_operation_contract_dependency($source)
  },
  `export * from $source` where {
    is_operation_contract_dependency($source)
  },
  `import($source)` where {
    is_operation_contract_dependency($source)
  },
  `OpTypeBagOf<$value>`,
  `AdmittedOperationInput<$value>`,
  `AdmittedOperationOutput<$value>`,
  `$contract["input"]` where {
    is_contract_envelope_name($contract)
  },
  `$contract["output"]` where {
    is_contract_envelope_name($contract)
  },
  `$contract.input` where {
    is_contract_envelope_name($contract)
  },
  `$contract.output` where {
    is_contract_envelope_name($contract)
  }
}
```

## Matches Fixture

```typescript
// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/rules/project.ts
import type Contract from "../contract.js";

export type ShapeReliefInput = Contract["input"];

// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/index.ts
import Contract from "./contract.js";
import strategies from "./strategies/index.js";

type ShapeReliefOutput = Contract["output"];
export default createOp(Contract, { strategies });

// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven/index.ts
import OperationContract from "../../contract.js";

type ShapeReliefOutput = OperationContract["output"];
export default createStrategy(OperationContract, strategyContract, {
  run: (input) => input,
});
```

## Ignores Fixture

```typescript
// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/rules/project.ts
import type { GridBounds } from "../../../model/atoms/grid-bounds.schema.js";

type ReliefWorkQueue = Readonly<{
  bounds: GridBounds;
  values: Float32Array;
  pending: readonly number[];
}>;

export function projectRelief(queue: ReliefWorkQueue): Float32Array {
  return queue.values;
}

// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/index.ts
import { createOp } from "@swooper/mapgen-core/authoring";
import Contract from "./contract.js";
import strategies from "./strategies/index.js";

export default createOp(Contract, { strategies });

// @filename: mods/example-mod/src/domain/world/modules/terrain/ops/shape-relief/strategies/plate-driven/index.ts
import { createStrategy } from "@swooper/mapgen-core/authoring";
import OperationContract from "../../contract.js";
import definition from "./config.js";

export default createStrategy(OperationContract, definition, {
  run: (input) => ({ relief: input.seed }),
});
```
