---
level: error
---
# Placement Outcome Boundary

Placement apply code consumes typed outcomes instead of direct official generator calls.

```grit
language js(typescript)

or {
  `generateOfficialResources($...)` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/placement/apply\.ts$"
  },
  `generateOfficialDiscoveries($...)` where {
    $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/placement/apply\.ts$"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/placement/apply.ts
generateOfficialResources();
```

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/placement/apply.ts
generateOfficialResources();
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/placement/apply.ts
resourcePlacementOutcomes();
```
