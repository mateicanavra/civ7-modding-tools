---
level: error
---
# Require Artifact Catalog Index Shape

An artifact directory exports one direct catalog assembled from named sibling
artifact authorities. The catalog is the only runtime export.

```grit
language js(typescript)

predicate has_linked_artifact($body) {
  $body <: contains `import { artifact as $artifact } from $source` where {
    $source <: r"^[\"']\./[^/\"']+\.artifact\.js[\"']$"
  },
  $body <: contains `export const artifacts = defineArtifactCatalog({ $..., $artifact, $... })`
}

predicate lacks_artifact_catalog_surface($body) {
  or {
    ! $body <: contains `import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts"`,
    ! has_linked_artifact($body),
    ! $body <: contains `export const artifacts = defineArtifactCatalog({ $... })`
  }
}

or {
  program(statements=$body) where {
    lacks_artifact_catalog_surface($body)
  },
  program(statements=$body) where {
    $body <: some $statement where {
      ! $statement <: or {
        `import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts"`,
        `import { artifact as $artifact } from $source` where {
          $source <: r"^[\"']\./[^/\"']+\.artifact\.js[\"']$"
        },
        `export const artifacts = defineArtifactCatalog({ $... })`
      }
    }
  }
}
```

## Matches Fixture

```typescript
// @filename: mods/example-mod/src/domain/weather/artifacts/index.ts
import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as forecast } from "./forecast.artifact.js";

export const artifacts = defineArtifactCatalog({ forecast });
export const forecastArtifact = artifacts.forecast;

// @filename: mods/alternate-mod/src/domain/terrain/artifacts/index.ts
import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import * as surface from "./surface.artifact.js";

export const artifacts = defineArtifactCatalog({ surface });

// @filename: mods/example-mod/src/domain/geology/artifacts/index.ts
import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as strata } from "./strata.artifact.js";

export const artifacts = defineArtifactCatalog({});
```

## Ignores Fixture

```typescript
// @filename: mods/example-mod/src/domain/weather/artifacts/index.ts
import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as forecast } from "./forecast.artifact.js";
import { artifact as precipitation } from "./precipitation.artifact.js";

/** Weather artifact authorities keyed for contracts and consumers. */
export const artifacts = defineArtifactCatalog({ forecast, precipitation });
```
