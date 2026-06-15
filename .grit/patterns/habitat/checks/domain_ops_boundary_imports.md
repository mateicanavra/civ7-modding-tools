---
level: error
---
# Domain Ops Boundary Imports

Domain ops do not cross into adapter/context ownership.

```grit
language js(typescript)

or {
  `import $imports from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/.*/ops/.*\.ts$",
    $source <: r"^@civ7/adapter"
  },
  `ExtendedMapContext` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/.*/ops/.*\.ts$"
  },
  `$context.adapter` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/.*/ops/.*\.ts$"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
context.adapter.run();
```

```typescript
// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
context.adapter.run();
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
context.value.run();
```
