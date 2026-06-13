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
```

```typescript
// @filename: mods/mod-swooper-maps/src/maps/demo.ts
export const config = {
  advanced: {},
};
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/maps/demo.ts
export const config = {
  supported: {},
};
```
