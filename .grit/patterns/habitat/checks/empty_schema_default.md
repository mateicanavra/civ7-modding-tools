---
level: error
---
# Empty Schema Default

Contract schema definitions should not use empty object defaults.

```grit
language js(typescript)

`default: {}` where {
  $filename <: r".*mods/[^/]+/src/(?:domain/.*/ops/.*\.contract|recipes/.*/steps/.*\.contract)\.ts$"
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo.contract.ts
export const Schema = {
  default: {},
};
```

```typescript
// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo.contract.ts
export const Schema = {
  default: {},
};
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo.contract.ts
export const Schema = {
  default: { enabled: true },
};
```
