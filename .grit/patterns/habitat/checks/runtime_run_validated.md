---
level: error
---
# Runtime Run Validated

Runtime layers must not call `runValidated`.

```grit
language js(typescript)

or {
  `runValidated($...)` where {
    $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$"
  },
  `$target.runValidated($...)` where {
    $filename <: r".*mods/[^/]+/src/(?:recipes/.*/stages/.*/steps|domain/.*/ops/.*/strategies)/.*\.ts$"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot.ts
runValidated(operation);
```

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot.ts
runValidated(operation);
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot.ts
runOperation(operation);
```
