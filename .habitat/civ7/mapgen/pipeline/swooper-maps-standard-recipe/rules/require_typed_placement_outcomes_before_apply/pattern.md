---
level: error
---
# Require Typed Placement Outcomes Before Apply

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

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/placement/apply.ts
generateOfficialDiscoveries(context, discoveryPlan);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/placement/apply.ts
const resourcesPlaced = generateOfficialResources(context, resourcePlan).placedCount;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/placement/apply.ts
await generateOfficialDiscoveries(context, discoveryPlan);
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/placement/apply.ts
resourcePlacementOutcomes();

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/placement/apply.ts
const resourcesPlaced = resourcePlacement.summary.placedCount;
const discoveriesPlaced = discoveryPlacement.summary.placedCount;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/placement/apply.ts
officialGenerators.generateOfficialResources(context, resourcePlan);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/placement/apply.ts
const generatorName = "generateOfficialDiscoveries";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/place-resources/apply.ts
generateOfficialResources(context, resourcePlan);

// @filename: mods/mod-swooper-maps/mod/src/recipes/standard/stages/placement/steps/placement/apply.ts
generateOfficialResources(context, resourcePlan);

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/placement/apply.tsx
generateOfficialResources(context, resourcePlan);

// @filename: packages/mapgen-core/src/recipes/standard/stages/placement/steps/placement/apply.ts
generateOfficialResources(context, resourcePlan);

// @filename: mods/other-mod/src/recipes/standard/stages/placement/steps/placement/apply.ts
generateOfficialResources(context, resourcePlan);
```
