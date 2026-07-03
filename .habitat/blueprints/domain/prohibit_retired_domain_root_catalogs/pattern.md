---
level: error
---
# Prohibit Retired Domain Root Catalogs

Domain-root `tags.ts` and `artifacts.ts` catalogs are retired structure.

```grit
language js(typescript)

program(statements=$body) where {
  $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/(?:tags|artifacts)\.ts$"
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/ecology/tags.ts
export const ECOLOGY_TAGS = {
  soil: "tag:ecology.soil",
};

// @filename: mods/mod-swooper-maps/src/domain/ecology/artifacts.ts
export const ECOLOGY_ARTIFACTS = {
  resourceBasins: "artifact:ecology.resourceBasins",
};

// @filename: mods/mod-swooper-maps/src/domain/hydrology/tags.ts
export type HydrologyTag = "tag:hydrology.river";

// @filename: mods/mod-swooper-maps/src/domain/morphology/artifacts.ts
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/ecology/index.ts
export * from "./ops/index.js";

// @filename: mods/mod-swooper-maps/src/domain/ecology/config.ts
export const tags = [];

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/plan-biomes/tags.ts
export const tags = [];

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/plan-biomes/artifacts.ts
export const artifacts = [];

// @filename: mods/mod-swooper-maps/src/domain/ecology/shared/artifacts.ts
export const artifacts = [];

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts
export const ecologyStageArtifacts = [];

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/tags.ts
export const ecologyStageTags = [];

// @filename: mods/mod-swooper-maps/mod/src/domain/ecology/tags.ts
export const generatedTags = [];

// @filename: mods/mod-swooper-maps/src/domain/ecology/tags.test.ts
export const tags = [];

// @filename: mods/mod-swooper-maps/src/domain/ecology/tags.tsx
export const tags = [];

// @filename: mods/mod-swooper-maps/src/maps/pangaea/domain/ecology/tags.ts
export const tags = [];

// @filename: packages/mapgen-core/src/domain/ecology/tags.ts
export const tags = [];

// @filename: mods/other-mod/src/domain/ecology/tags.ts
export const tags = [];

// @filename: mods/mod-swooper-maps/src/domainish/ecology/tags.ts
export const tags = [];
```
