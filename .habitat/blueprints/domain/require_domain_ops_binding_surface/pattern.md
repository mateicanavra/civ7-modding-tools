---
level: error
---
# Require Domain Ops Binding Surface

Domain root `ops.ts` files bind the domain contract to its implementation
registry. They are closed owner modules, not public helper barrels. The
required statements may appear in any order; no additional statement may
create a second public or runtime authority in this binding surface.

```grit
language js(typescript)

predicate lacks_domain_ops_binding_surface($body) {
  or {
    ! $body <: contains `import { createDomain } from "@swooper/mapgen-core/authoring"`,
    ! $body <: contains `import domain from "./index.js"`,
    ! $body <: contains `import implementations from "./ops/index.js"`,
    ! $body <: contains `export default createDomain(domain, implementations)`
  }
}

program(statements=$body) where {
  or {
    lacks_domain_ops_binding_surface($body),
    $body <: some bubble {
      $statement where {
        ! $statement <: or {
          `import { createDomain } from "@swooper/mapgen-core/authoring"`,
          `import domain from "./index.js"`,
          `import implementations from "./ops/index.js"`,
          `export default createDomain(domain, implementations)`
        }
      }
    }
  }
}
```

## Matches Fixture

```typescript
// @filename: mods/example-mod/src/domain/weather/ops.ts
import { createDomain } from "@swooper/mapgen-core/authoring";

import domain from "./index.js";
import implementations from "./ops/index.js";

export default createDomain(domain, implementations);

const helper = 1;

// @filename: mods/alternate-mod/src/domain/terrain/ops.ts
import { createDomain } from "@swooper/mapgen-core/authoring";

import domain from "./index.js";
import implementations from "./ops/index.js";

export default createDomain(domain, implementations);

export { TERRAIN_SCALE } from "./model/policy/terrain-scale.js";

// @filename: mods/example-mod/src/domain/settlement/ops.ts
import { createDomain } from "@swooper/mapgen-core/authoring";
import domain from "./index.js";
import implementations from "./ops/index.js";
import { helper } from "./model/policy/helper.js";

export default createDomain(domain, implementations);
```

## Ignores Fixture

```typescript
// @filename: mods/example-mod/src/domain/weather/ops.ts
import implementations from "./ops/index.js";
import domain from "./index.js";
import { createDomain } from "@swooper/mapgen-core/authoring";

export default createDomain(domain, implementations);

```
