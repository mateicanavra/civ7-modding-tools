---
level: error
---
# Contract Export All

Contract and public-surface files must not re-export value surfaces with bare
`export *`; type-only aggregation remains allowed.

```grit
language js(typescript)

`export * from $source` as $export where {
  $export_text = text($export),
  ! $export_text <: includes "export type *",
  or {
    $filename <: r".*mods/[^/]+/src/recipes/.*/stages/.*/steps/.*(?:contract|\.contract)\.ts$",
    $filename <: r".*mods/[^/]+/src/domain/.*/ops/.*/(?:contract|types|index)\.ts$",
    $filename <: r".*mods/[^/]+/src/domain/.*/ops/.*/(?:rules|strategies)/.*\.ts$"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/demo/ops/plan-demo/index.ts
export * from "./contract.js";
```

```typescript
// @filename: mods/mod-swooper-maps/src/domain/demo/ops/plan-demo/index.ts
export * from "./contract.js";
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/demo/ops/plan-demo/index.ts
export { planDemo } from "./contract.js";
```
