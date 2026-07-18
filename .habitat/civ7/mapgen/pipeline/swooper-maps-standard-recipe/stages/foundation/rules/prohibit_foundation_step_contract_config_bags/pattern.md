---
level: error
---
# Prohibit Foundation Step Contract Config Bags

Foundation recipe `StepContract` definitions in `config.ts` must not depend on
root or foundation domain config facades, or on root config-bag schemas.

```grit
language js(typescript)

or {
  `import { $imports } from "@mapgen/domain/config.js"`,
  `import type { $imports } from "@mapgen/domain/config.js"`,
  `import $default from "@mapgen/domain/config.js"`,
  `import * as $namespace from "@mapgen/domain/config.js"`,
  `import "@mapgen/domain/config.js"`,
  `import { $imports } from "@mapgen/domain/foundation/config.js"`,
  `import type { $imports } from "@mapgen/domain/foundation/config.js"`,
  `import $default from "@mapgen/domain/foundation/config.js"`,
  `import * as $namespace from "@mapgen/domain/foundation/config.js"`,
  `import "@mapgen/domain/foundation/config.js"`,
  `FoundationConfigSchema`
} where {
  $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/foundation(?:-[^/]+)?/steps/[^/]+/config\.ts$"
}
```
