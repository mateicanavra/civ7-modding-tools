---
level: error
---
# Require Map Config Catalog File Shape

A map config catalog is one ordered identity list, one canonical envelope
admission boundary, and one closed facade. Membership contains map config ids,
not repository paths or mirrored config metadata. Admission derives the
canonical filename identity from the selected id and delegates complete
envelope validation to the map config owner.

```grit
language js(typescript)

or {
  program(statements=$body) where {
    $filename <: r".*/plugins/mod/map/[^/]+/src/maps/catalog/membership\.ts$",
    ! $body <: contains `export const MAP_CONFIG_CATALOG_IDS = $ids`
  },
  program(statements=$body) where {
    $filename <: r".*/plugins/mod/map/[^/]+/src/maps/catalog/membership\.ts$",
    ! $body <: contains `export function admitMapConfigCatalogIds($args) { $functionBody }`,
    ! $body <: contains `export function admitMapConfigCatalogIds($args): $returnType { $functionBody }`
  },
  export_statement() as $export where {
    $filename <: r".*/plugins/mod/map/[^/]+/src/maps/catalog/membership\.ts$",
    ! $export <: `export const MAP_CONFIG_CATALOG_IDS = $ids`,
    ! $export <: `export function admitMapConfigCatalogIds($args) { $functionBody }`,
    ! $export <: `export function admitMapConfigCatalogIds($args): $returnType { $functionBody }`
  },
  import_statement(source=$source) where {
    $filename <: r".*/plugins/mod/map/[^/]+/src/maps/catalog/membership\.ts$",
    ! $source <: r"^[\"']?@civ7/studio-contract[\"']?$"
  },
  program(statements=$body) where {
    $filename <: r".*/plugins/mod/map/[^/]+/src/maps/catalog/admission\.ts$",
    ! $body <: contains `export function admitMapConfigCatalogConfig($args) { $functionBody }`,
    ! $body <: contains `export function admitMapConfigCatalogConfig($args): $returnType { $functionBody }`
  },
  program(statements=$body) where {
    $filename <: r".*/plugins/mod/map/[^/]+/src/maps/catalog/admission\.ts$",
    ! $body <: contains `validateCanonicalMapConfig({ $..., fileName: fileNameForConfigId(args.configId), $..., raw: args.canonicalConfig, $... })`
  },
  export_statement() as $export where {
    $filename <: r".*/plugins/mod/map/[^/]+/src/maps/catalog/admission\.ts$",
    ! $export <: `export function admitMapConfigCatalogConfig($args) { $functionBody }`,
    ! $export <: `export function admitMapConfigCatalogConfig($args): $returnType { $functionBody }`
  },
  import_statement(source=$source) where {
    $filename <: r".*/plugins/mod/map/[^/]+/src/maps/catalog/admission\.ts$",
    ! $source <: r"^[\"']?(?:@civ7/studio-contract|typebox|\.\./configs/canonical\.js)[\"']?$"
  },
  program(statements=$body) where {
    $filename <: r".*/plugins/mod/map/[^/]+/src/maps/catalog/index\.ts$",
    ! $body <: contains `export { admitMapConfigCatalogConfig } from "./admission.js"`
  },
  program(statements=$body) where {
    $filename <: r".*/plugins/mod/map/[^/]+/src/maps/catalog/index\.ts$",
    ! $body <: contains `export { admitMapConfigCatalogIds, MAP_CONFIG_CATALOG_IDS } from "./membership.js"`
  },
  export_statement() as $export where {
    $filename <: r".*/plugins/mod/map/[^/]+/src/maps/catalog/index\.ts$",
    ! $export <: `export { admitMapConfigCatalogConfig } from "./admission.js"`,
    ! $export <: `export { admitMapConfigCatalogIds, MAP_CONFIG_CATALOG_IDS } from "./membership.js"`
  }
}
```

## Matches Fixture

```typescript
// @filename: plugins/mod/map/example-mod/src/maps/catalog/membership.ts
export const CatalogSources = ["plugins/mod/map/example-mod/src/maps/configs/world.config.json"];

// @filename: plugins/mod/map/example-mod/src/maps/catalog/admission.ts
export function admitMapConfigCatalogConfig(args: { sourcePath: string; canonicalConfig: unknown }) {
  return validateCanonicalMapConfig({ fileName: args.sourcePath, raw: args.canonicalConfig });
}

// @filename: plugins/mod/map/example-mod/src/maps/catalog/index.ts
export * from "./legacy-sources.js";
```

## Ignores Fixture

```typescript
// @filename: plugins/mod/map/example-mod/src/maps/catalog/membership.ts
import { isMapConfigId, type MapConfigId } from "@civ7/studio-contract";

export const MAP_CONFIG_CATALOG_IDS = ["earthlike"] as const satisfies readonly MapConfigId[];

export function admitMapConfigCatalogIds(value: unknown): readonly MapConfigId[] {
  if (!Array.isArray(value) || !value.every(isMapConfigId)) throw new Error("Invalid ids.");
  return Object.freeze([...value]);
}

// @filename: plugins/mod/map/example-mod/src/maps/catalog/admission.ts
import type { MapConfigId } from "@civ7/studio-contract";
import type { TSchema } from "typebox";
import { type ValidatedMapConfig, validateCanonicalMapConfig } from "../configs/canonical.js";

function fileNameForConfigId(configId: MapConfigId): string {
  return `${configId}.config.json`;
}

export function admitMapConfigCatalogConfig(args: {
  configId: MapConfigId;
  canonicalConfig: unknown;
  recipeSchema?: TSchema;
}): ValidatedMapConfig {
  return validateCanonicalMapConfig({
    fileName: fileNameForConfigId(args.configId),
    raw: args.canonicalConfig,
    recipeSchema: args.recipeSchema,
  });
}

// @filename: plugins/mod/map/example-mod/src/maps/catalog/index.ts
export { admitMapConfigCatalogConfig } from "./admission.js";
export {
  admitMapConfigCatalogIds,
  MAP_CONFIG_CATALOG_IDS,
} from "./membership.js";
```
