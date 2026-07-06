---
level: error
---
# Require Domain Ops Binding Surface

Domain root `ops.ts` files bind the domain contract to its implementation
registry. They are not public helper barrels.

```grit
language js(typescript)

or {
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/[^/]+/ops\.ts$",
    ! $body <: [
      `import { createDomain } from "@swooper/mapgen-core/authoring"`,
      `import domain from "./index.js"`,
      `import implementations from "./ops/index.js"`,
      `export default createDomain(domain, implementations)`
    ]
  }
}
```

## Matches Fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/morphology/ops.ts
import { createDomain } from "@swooper/mapgen-core/authoring";

import domain from "./index.js";
import implementations from "./ops/index.js";

export default createDomain(domain, implementations);

const helper = 1;

// @filename: mods/mod-swooper-maps/src/domain/hydrology/ops.ts
import { createDomain } from "@swooper/mapgen-core/authoring";

import domain from "./index.js";
import implementations from "./ops/index.js";

export default createDomain(domain, implementations);

export { DEFAULT_ELEVATION_SCALE } from "./ops/compute-base-topography/rules/index.js";

// @filename: mods/mod-swooper-maps/src/domain/resources/ops.ts
import { createDomain } from "@swooper/mapgen-core/authoring";
import domain from "./index.js";
import implementations from "./ops/index.js";
import { helper } from "./model/policy/helper.js";

export default createDomain(domain, implementations);
```

## Ignores Fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/foundation/ops.ts
import { createDomain } from "@swooper/mapgen-core/authoring";

import domain from "./index.js";
import implementations from "./ops/index.js";

export default createDomain(domain, implementations);

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/index.ts
export { computeMesh } from "./compute-mesh/index.js";
```
