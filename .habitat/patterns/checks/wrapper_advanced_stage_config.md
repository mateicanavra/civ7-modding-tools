---
level: error
---
# Wrapper Advanced Stage Config

Standard recipe and map config source must not reintroduce wrapper-only `advanced` config.

```grit
language js(typescript)

or {
  `advanced: $_` where {
    $filename <: r".*mods/mod-swooper-maps/src/(?:recipes/standard|maps)/.*\.(?:ts|json)$"
  },
  `"advanced": $_` where {
    $filename <: r".*mods/mod-swooper-maps/src/(?:recipes/standard|maps)/.*\.(?:ts|json)$"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/maps/demo.ts
export const config = {
  advanced: {},
};

// @filename: mods/mod-swooper-maps/src/maps/fractal.ts
export const config = {
  "advanced": {
    placement: {},
  },
};

// @filename: mods/mod-swooper-maps/src/maps/config.test.ts
export const testConfig = {
  advanced: {},
};

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/config.ts
export const ecologyConfig = {
  advanced: {
    planBiomes: {},
  },
};

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/hydrology/config.ts
export const hydrologyConfig = {
  "advanced": {
    selectRiverTerrain: {},
  },
};

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/config.test.ts
export const recipeTestConfig = {
  "advanced": {},
};
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/maps/demo.ts
export const config = {
  supported: {},
};

// @filename: mods/mod-swooper-maps/src/maps/current.ts
export const config = {
  placement: {
    planStarts: {},
  },
  hydrology: {
    selectNavigableRiverTerrain: {},
  },
};

// @filename: mods/mod-swooper-maps/src/maps/terms.ts
export const config = {
  advancedStart: true,
  "advanced-starts": "ordinary term",
  advancedSettingsEnabled: false,
};

// @filename: mods/mod-swooper-maps/src/maps/readme.ts
const note = "advanced settings documentation";

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/config.ts
export const ecologyConfig = {
  planBiomes: {},
  assignBiomes: {},
};

// @filename: mods/mod-swooper-maps/src/recipes/browser-test/stages/ecology/config.ts
export const browserTestConfig = {
  advanced: {},
};

// @filename: mods/mod-swooper-maps/src/domain/ecology/config.ts
export const domainConfig = {
  advanced: {},
};

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/config.tsx
export const componentConfig = {
  advanced: {},
};

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/config.test.tsx
export const componentTestConfig = {
  advanced: {},
};

// @filename: mods/mod-swooper-maps/mod/src/recipes/standard/stages/ecology/config.ts
export const generatedConfig = {
  advanced: {},
};

// @filename: packages/mapgen-core/src/maps/demo.ts
export const packageConfig = {
  advanced: {},
};

// @filename: mods/other-mod/src/maps/demo.ts
export const otherModConfig = {
  advanced: {},
};
```
