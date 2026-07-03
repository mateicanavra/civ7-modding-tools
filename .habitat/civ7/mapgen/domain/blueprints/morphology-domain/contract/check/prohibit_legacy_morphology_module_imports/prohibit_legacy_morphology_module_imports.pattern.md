---
level: error
---
# Prohibit Legacy Morphology Module Imports

Source must not import retired morphology module paths.

```grit
language js(typescript)

import_statement(source=$source) where {
  $filename <: r".*mods/mod-swooper-maps/src/.*\.ts$",
  $source <: r".*@mapgen/domain/morphology/(?:landmass|coastlines|islands|mountains|volcanoes)(?:/.*)?$"
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/demo.ts
import { build } from "@mapgen/domain/morphology/mountains";
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/demo.ts
import { build } from "@mapgen/domain/morphology";
```
