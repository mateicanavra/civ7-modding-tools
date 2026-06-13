---
level: error
---
# Domain Root Catalogs

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
export const tags = [];
```

```typescript
// @filename: mods/mod-swooper-maps/src/domain/ecology/tags.ts
export const tags = [];
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/ecology/index.ts
export const tags = [];
```
