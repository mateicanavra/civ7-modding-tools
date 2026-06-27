---
level: error
---
# Prohibit Morphology Stage Config Bag Imports

Morphology stage files must not reach into the domain config bag.

```grit
language js(typescript)

import_statement(source=$source) where {
  $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/(?:morphology-coasts|morphology-routing|morphology-erosion|morphology-features)/.*\.ts$",
  $source <: r".*@mapgen/domain/config(?:/.*)?$"
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-routing/demo.ts
import { config } from "@mapgen/domain/config";
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/map-morphology/demo.ts
import { config } from "@mapgen/domain/config";
```
