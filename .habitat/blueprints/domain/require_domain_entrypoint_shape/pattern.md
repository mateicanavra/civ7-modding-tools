---
level: error
---
# Require Domain Entrypoint Shape

A domain root `index.ts` owns exactly one public domain contract. It imports
`defineDomain` from Core contracts, imports the operation-contract registry,
binds the directory's literal identity once, and default-exports that binding.
Named re-exports may expose only the domain's model or artifact owner slots.

```grit
language js(typescript)

predicate lacks_domain_entrypoint_surface($body, $domain_id) {
  or {
    ! $body <: contains `import { defineDomain } from "@swooper/mapgen-core/authoring/contracts"`,
    ! $body <: contains `import ops from "./ops/contracts.js"`,
    ! $body <: contains `const domain = defineDomain({ id: "$domain_id", ops } as const)`,
    ! $body <: contains `export default domain`
  }
}

or {
  program(statements=$body) where {
    $filename <: r".*mods/[^/]+/src/domain/([^/]+)/index\.ts$"($domain_id),
    lacks_domain_entrypoint_surface($body, $domain_id)
  },
  program(statements=$body) where {
    $calls = [],
    $body <: some bubble($calls) $statement where {
      $statement <: contains bubble($calls) `defineDomain($_)` as $call where {
        $calls += $call
      }
    },
    $call_count = length(target=$calls),
    ! $call_count <: 1
  },
  program(statements=$body) where {
    $filename <: r".*mods/[^/]+/src/domain/([^/]+)/index\.ts$"($domain_id),
    $body <: some $statement where {
      ! $statement <: or {
        `import { defineDomain } from "@swooper/mapgen-core/authoring/contracts"`,
        `import ops from "./ops/contracts.js"`,
        `const domain = defineDomain({ id: "$domain_id", ops } as const)`,
        `export default domain`,
        `export { $exports } from $source` where {
          $source <: r"^[\"']\./(?:model/[^\"']+|artifacts/index\.js)[\"']$"
        },
        `export type { $exports } from $source` where {
          $source <: r"^[\"']\./(?:model/[^\"']+|artifacts/index\.js)[\"']$"
        }
      }
    }
  }
}
```

## Matches Fixture

```typescript
// @filename: mods/example-mod/src/domain/weather/index.ts
import { defineDomain } from "@swooper/mapgen-core/authoring/contracts";
import ops from "./ops/contracts.js";

const domain = defineDomain({ id: "climate", ops } as const);
export default domain;

// @filename: mods/alternate-mod/src/domain/terrain/index.ts
import { defineDomain } from "@swooper/mapgen-core/authoring/contracts";
import ops from "./ops/contracts.js";

const shadow = defineDomain({ id: "terrain", ops } as const);
const domain = defineDomain({ id: "terrain", ops } as const);
export default domain;

// @filename: mods/example-mod/src/domain/settlement/index.ts
import { defineDomain } from "@swooper/mapgen-core/authoring/contracts";
import ops from "./ops/contracts.js";

const domain = defineDomain({ id: "settlement", ops } as const);
export default domain;
export { executeSettlement } from "./ops/build-settlement/index.js";

// @filename: mods/example-mod/src/domain/ocean/index.ts
import { defineDomain } from "@swooper/mapgen-core/authoring/contracts";
import ops from "./ops/contracts.js";

const domain = defineDomain({ id: "ocean", ops } as const);
export default domain;
export * from ".";
```

## Ignores Fixture

```typescript
// @filename: mods/example-mod/src/domain/weather/index.ts
import { defineDomain } from "@swooper/mapgen-core/authoring/contracts";
import ops from "./ops/contracts.js";

const domain = defineDomain({ id: "weather", ops } as const);

export default domain;
export type { WeatherSymbol } from "./model/schemas/index.js";
export { WEATHER_POLICY } from "./model/policy/weather.js";
export { artifactModules, artifacts } from "./artifacts/index.js";
```
