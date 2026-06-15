---
level: error
---
# Step Contract Domain Surface

Step contracts import only domain contract roots, not runtime or private domain files.

```grit
language js(typescript)

or {
  `import $imports from $source` where {
    $filename <: r".*mods/[^/]+/src/recipes/.*/stages/.*/steps/.*(?:contract|\.contract)\.ts$",
    $source <: r".*@mapgen/domain/[^/]+/.+"
  },
  `export { $exports } from $source` where {
    $filename <: r".*mods/[^/]+/src/recipes/.*/stages/.*/steps/.*(?:contract|\.contract)\.ts$",
    $source <: r".*@mapgen/domain/[^/]+/.+"
  },
  `export * from $source` where {
    $filename <: r".*mods/[^/]+/src/recipes/.*/stages/.*/steps/.*(?:contract|\.contract)\.ts$",
    $source <: r".*@mapgen/domain/[^/]+/.+"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/contract.ts
import ecology from "@mapgen/domain/ecology/ops";

export const contract = ecology;
```

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/contract.ts
import ecology from "@mapgen/domain/ecology/ops";

export const contract = ecology;
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/contract.ts
import ecology from "@mapgen/domain/ecology";

export const contract = ecology;
```
