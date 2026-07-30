---
level: error
---
# Prohibit Bare Value Export-All From Contract Surfaces

Domain contract files and recipe `StepContract` config modules must not
re-export value surfaces with bare `export *`; type-only aggregation remains
allowed.

```grit
language js(typescript)

`export * from $source` as $export where {
  $export_text = text($export),
  ! $export_text <: includes "export type *",
  or {
    $filename <: r".*plugins/mod/map/[^/]+/src/recipes/[^/]+/stages/(?:[^/]+/)+steps/[^/]+/config\.ts$",
    $filename <: r".*plugins/mod/map/[^/]+/src/domain/.*/ops/.*/(?:contract|types|index)\.ts$",
    $filename <: r".*plugins/mod/map/[^/]+/src/domain/.*/ops/.*/(?:rules|strategies)/.*\.ts$"
  }
}
```

## Matches fixture

```typescript
// @filename: plugins/mod/map/example-mod/src/domain/demo/modules/planning/ops/plan-demo/index.ts
export * from "./contract.js";

// @filename: plugins/mod/map/example-mod/src/domain/demo/modules/planning/ops/plan-demo/contract.ts
export * from "./types.js";

// @filename: plugins/mod/map/example-mod/src/domain/demo/modules/planning/ops/plan-demo/types.ts
export * from "./shared-types.js";

// @filename: plugins/mod/map/example-mod/src/domain/demo/modules/planning/ops/plan-demo/rules/index.ts
export * from "../contract.js";

// @filename: plugins/mod/map/example-mod/src/domain/demo/modules/planning/ops/plan-demo/rules/check.ts
export * from "../contract.js";

// @filename: plugins/mod/map/example-mod/src/domain/demo/modules/planning/ops/plan-demo/strategies/balanced/index.ts
export * from "../contract.js";

// @filename: plugins/mod/map/example-mod/src/recipes/sample-recipe/stages/world/planning/steps/build/config.ts
export * from "@mapgen/domain/demo";

// @filename: plugins/mod/map/example-mod/src/recipes/sample-recipe/stages/world/planning/steps/assemble/config.ts
export * from "@mapgen/domain/demo";
```

```typescript
// @filename: plugins/mod/map/example-mod/src/domain/demo/modules/planning/ops/plan-demo/index.ts
export * from "./contract.js";

// @filename: plugins/mod/map/example-mod/src/domain/demo/modules/planning/ops/plan-demo/contract.ts
export * from "./types.js";

// @filename: plugins/mod/map/example-mod/src/domain/demo/modules/planning/ops/plan-demo/types.ts
export * from "./shared-types.js";

// @filename: plugins/mod/map/example-mod/src/domain/demo/modules/planning/ops/plan-demo/rules/index.ts
export * from "../contract.js";

// @filename: plugins/mod/map/example-mod/src/domain/demo/modules/planning/ops/plan-demo/rules/check.ts
export * from "../contract.js";

// @filename: plugins/mod/map/example-mod/src/domain/demo/modules/planning/ops/plan-demo/strategies/balanced/index.ts
export * from "../contract.js";

// @filename: plugins/mod/map/example-mod/src/recipes/sample-recipe/stages/world/planning/steps/build/config.ts
export * from "@mapgen/domain/demo";

// @filename: plugins/mod/map/example-mod/src/recipes/sample-recipe/stages/world/planning/steps/assemble/config.ts
export * from "@mapgen/domain/demo";
```

## Ignores fixture

```typescript
// @filename: plugins/mod/map/example-mod/src/domain/demo/modules/planning/ops/plan-demo/index.ts
export { planDemo } from "./contract.js";

// @filename: plugins/mod/map/example-mod/src/domain/demo/modules/planning/ops/plan-demo/contract.ts
export { type PlanDemoInput } from "./types.js";

// @filename: plugins/mod/map/example-mod/src/domain/demo/modules/planning/ops/plan-demo/rules/index.ts
export * as planDemo from "./contract.js";

// @filename: plugins/mod/map/example-mod/src/domain/demo/index.ts
export * from "./ops/index.js";

// @filename: plugins/mod/map/example-mod/src/domain/demo/config.ts
export * from "./shared/knobs.js";

// @filename: plugins/mod/map/example-mod/src/domain/demo/modules/planning/ops/plan-demo/rules.ts
export * from "./rules/index.js";

// @filename: plugins/mod/map/example-mod/src/domain/demo/modules/planning/ops/plan-demo/index.tsx
export * from "./contract.js";

// @filename: packages/sdk/src/index.ts
export * from "./builders";
```
