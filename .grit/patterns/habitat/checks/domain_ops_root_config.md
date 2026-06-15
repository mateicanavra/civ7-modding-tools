---
level: error
---
# Domain Ops Root Config

Domain ops do not import domain-root config facades through parent traversal.

```grit
language js(typescript)

or {
  `import $imports from "../../config.js"` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/.*/ops/.*\.ts$"
  },
  `import $imports from "../../../config.js"` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/.*/ops/.*\.ts$"
  },
  `import $imports from "../../../../config.js"` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/.*/ops/.*\.ts$"
  },
  `import $imports from "../../../../../config.js"` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/.*/ops/.*\.ts$"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
import config from "../../config.js";

export const value = config;
```

```typescript
// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
import config from "../../config.js";

export const value = config;
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
import config from "./config.js";

export const value = config;
```
