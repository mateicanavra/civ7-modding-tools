---
level: error
---
# Domain Ops Projection Effects

Domain ops should not encode map projection/effect dependency keys.

```grit
language js(typescript)

or {
  `"artifact:map.$suffix"` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/.*/ops/.*\.ts$"
  },
  `"effect:map.$suffix"` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/.*/ops/.*\.ts$"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
export const key = "artifact:map.foo";
```

```typescript
// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
export const key = "artifact:map.foo";
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
export const key = "artifact:terrain.foo";
```
