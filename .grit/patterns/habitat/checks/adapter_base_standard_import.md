---
level: error
---
# Adapter Base Standard Import

Runtime `/base-standard/` imports belong only in `@civ7/adapter`.

```grit
language js(typescript)

or {
  `import $imports from $source` where {
    $filename <: r".*packages/.*\.ts$",
    ! $filename <: includes "packages/civ7-adapter/",
    $source <: r".*/base-standard/.+"
  },
  `import $source` where {
    $filename <: r".*packages/.*\.ts$",
    ! $filename <: includes "packages/civ7-adapter/",
    $source <: r".*/base-standard/.+"
  }
}
```

## Matches fixture

```typescript
// @filename: packages/example/src/demo.ts
import "/base-standard/maps/map-globals.js";
```

```typescript
// @filename: packages/example/src/demo.ts
import "/base-standard/maps/map-globals.js";
```

## Ignores fixture

```typescript
// @filename: packages/civ7-adapter/src/demo.ts
import "/base-standard/maps/map-globals.js";
```
