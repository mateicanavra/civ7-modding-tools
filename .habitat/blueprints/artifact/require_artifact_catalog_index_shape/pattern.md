---
level: error
---
# Require Artifact Catalog Index Shape

A domain artifact `index.ts` owns one typed catalog assembled from sibling
artifact modules. Its only runtime exports are the module and handle
projections derived from that catalog.

```grit
language js(typescript)

predicate has_linked_artifact_catalog_module($body) {
  $body <: contains `import * as $module from $source` where {
    $source <: r"^[\"']\./[^/\"']+\.artifact\.js[\"']$"
  },
  $body <: contains `const catalog = defineArtifactCatalog({ $..., $module, $... })`
}

predicate lacks_artifact_catalog_surface($body) {
  or {
    ! $body <: contains `import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts"`,
    ! has_linked_artifact_catalog_module($body),
    ! $body <: contains `const catalog = defineArtifactCatalog({ $... })`,
    ! $body <: contains `export const artifactModules = catalog.modules`,
    ! $body <: contains `export const artifacts = catalog.artifacts`
  }
}

or {
  program(statements=$body) where {
    lacks_artifact_catalog_surface($body)
  },
  program(statements=$body) where {
    $calls = [],
    $body <: some bubble($calls) $statement where {
      $statement <: contains bubble($calls) `defineArtifactCatalog($_)` as $call where {
        $calls += $call
      }
    },
    $call_count = length(target=$calls),
    ! $call_count <: 1
  },
  program(statements=$body) where {
    $body <: some $statement where {
      ! $statement <: or {
        `import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts"`,
        `import * as $module from $source` where {
          $source <: r"^[\"']\./[^/\"']+\.artifact\.js[\"']$"
        },
        `const catalog = defineArtifactCatalog({ $... })`,
        `export const artifactModules = catalog.modules`,
        `export const artifacts = catalog.artifacts`
      }
    }
  }
}
```

## Matches Fixture

```typescript
// @filename: mods/example-mod/src/domain/weather/artifacts/index.ts
import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import * as forecast from "./forecast.artifact.js";

const catalog = defineArtifactCatalog({ forecast });
export const artifactModules = catalog.modules;
export const artifacts = catalog.artifacts;
export const forecastArtifact = artifacts.forecast;

// @filename: mods/alternate-mod/src/domain/terrain/artifacts/index.ts
import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact } from "./surface.artifact.js";

const catalog = defineArtifactCatalog({ artifact });
export const artifactModules = catalog.modules;
export const artifacts = catalog.artifacts;

// @filename: mods/example-mod/src/domain/geology/artifacts/index.ts
import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import * as strata from "./strata.artifact.js";

const catalog = defineArtifactCatalog({});
export const artifactModules = catalog.modules;
export const artifacts = catalog.artifacts;
```

## Ignores Fixture

```typescript
// @filename: mods/example-mod/src/domain/weather/artifacts/index.ts
import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import * as forecast from "./forecast.artifact.js";
import * as precipitation from "./precipitation.artifact.js";

const catalog = defineArtifactCatalog({ forecast, precipitation });

/** Weather artifact modules pair each contract with its complete validator. */
export const artifactModules = catalog.modules;

/** Weather artifact handles are derived from the admitted module catalog. */
export const artifacts = catalog.artifacts;
```
