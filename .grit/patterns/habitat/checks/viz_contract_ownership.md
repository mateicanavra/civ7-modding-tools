---
level: error
---
# Viz Contract Ownership

Shared visualization contracts are stage surfaces, not `steps/` hubs.

```grit
language js(typescript)

or {
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/[^/]+/steps/viz\.ts$"
  },
  `import $imports from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/[^/]+/.*\.ts$",
    $resolved = resolve(path=$source),
    $resolved <: r".*/stages/[^/]+/steps/viz(?:\.js|\.ts)?$"
  },
  `import $imports from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/[^/]+/.*\.ts$",
    $source <: r"^\.\./",
    $resolved = resolve(path=$source),
    $resolved <: r".*/stages/[^/]+/steps/[^/]+/viz(?:\.js|\.ts)?$"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/viz.ts
export const viz = {};
```

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/viz.ts
export const viz = {};
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/foundation/viz.ts
export const viz = {};
```
