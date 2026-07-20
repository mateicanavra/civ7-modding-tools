---
level: error
---
# Require MapGen Exported Value Declarations To Have JSDoc

Authored domain, recipe, and reusable diagnostic capability value exports are
cross-module contracts. Their defining declarations require adjacent nonempty
JSDoc. This rule rejects only missing, empty, and obvious placeholder blocks;
review owns whether accepted documentation explains the value's behavior,
purpose, or invariants. A direct anonymous default value is documented at its
export statement; re-export barrels inherit documentation from the owner.

This structural rule deliberately checks the authored value-export superset.
Knip and review own whether an export has a real consumer, while review owns the
semantic quality of non-placeholder documentation.

```grit
language js(typescript)

predicate lacks_declaration_jsdoc($declaration) {
  $previous = before $declaration,
  or {
    ! $previous <: r"(?s)^/\*\*.*\*/$",
    $previous <: r"(?s)^/\*\*[ *\n\r\t]*\*/$",
    $previous <: r"(?is)^/\*\*[ *\n\r\t]*(?:TODO|TBD|FIXME|PLACEHOLDER|DOCUMENTATION[ \t]+PENDING).*\*/$"
  }
}

or {
  export_statement(declaration=$declaration) as $export where {
    $filename <: r".*(?:mods/mod-swooper-maps/src/(?:domain|recipes)|packages/mapgen-diagnostics/src)/.*\.ts$",
    $declaration <: or {
      lexical_declaration(),
      variable_declaration(),
      function_declaration(),
      class_declaration(),
      enum_declaration()
    },
    lacks_declaration_jsdoc($export)
  },
  `export default $value` as $export where {
    $filename <: r".*(?:mods/mod-swooper-maps/src/(?:domain|recipes)|packages/mapgen-diagnostics/src)/.*\.ts$",
    ! $value <: identifier(),
    lacks_declaration_jsdoc($export)
  },
  or {
    `export default $name`,
    `export { $..., $name, $... }`,
    `export { $..., $name as $_, $... }`
  } as $export where {
    $filename <: r".*(?:mods/mod-swooper-maps/src/(?:domain|recipes)|packages/mapgen-diagnostics/src)/.*\.ts$",
    $program <: contains or {
      lexical_declaration() as $declaration where {
        $declaration <: contains variable_declarator(name=$name),
        lacks_declaration_jsdoc($declaration)
      },
      or {
        function_declaration(name=$name),
        class_declaration(name=$name),
        enum_declaration(name=$name)
      } as $declaration where {
        lacks_declaration_jsdoc($declaration)
      }
    }
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/ecology/model/policy/climate.ts
export function resolveClimateBand(latitude: number): number {
  return Math.floor(latitude / 10);
}

// @filename: mods/mod-swooper-maps/src/domain/ecology/model/policy/options.ts
/** TODO */
export const DEFAULT_CLIMATE_OPTIONS = {};

// @filename: mods/mod-swooper-maps/src/recipes/standard/runtime.ts
/** Documentation pending. */
export class StandardRuntimeState {}

// @filename: mods/mod-swooper-maps/src/recipes/standard/tags.ts
/** */
export const STANDARD_TAGS = {};

// @filename: mods/mod-swooper-maps/src/domain/ecology/model/policy/climate-band.ts
export enum ClimateBand {
  Polar,
  Temperate,
  Tropical,
}

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/classify-biomes/index.ts
const classifyBiomes = createOp(BiomeClassificationContract, {
  strategies: { default: defaultStrategy },
});
export default classifyBiomes;

// @filename: mods/mod-swooper-maps/src/recipes/standard/artifacts.ts
function collectArtifacts() {
  return [];
}
export { collectArtifacts };

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/index.ts
export default createStage({
  id: "ecology",
  steps: [],
});
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/ecology/model/policy/climate.ts
/** Maps absolute latitude to the closed climate-band index consumed by biome selection. */
export function resolveClimateBand(latitude: number): number {
  return Math.floor(latitude / 10);
}

// @filename: mods/mod-swooper-maps/src/domain/ecology/index.ts
export { resolveClimateBand } from "./model/policy/climate.js";
export type { ClimateBand } from "./model/types.js";

// @filename: mods/mod-swooper-maps/src/domain/ecology/model/types.ts
export interface ClimateBand {}

// @filename: mods/mod-swooper-maps/src/domain/ecology/model/policy/documented-climate-band.ts
/** Stable climate bands serialized by the authored biome policy. */
export enum DocumentedClimateBand {
  Polar,
  Temperate,
  Tropical,
}

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/classify-biomes/index.ts
/** Executable biome classifier assembled from the stable contract and default strategy. */
const classifyBiomes = createOp(BiomeClassificationContract, {
  strategies: { default: defaultStrategy },
});
export default classifyBiomes;

// @filename: mods/mod-swooper-maps/src/recipes/standard/artifacts.ts
/** Collects the closed artifact set used to compile the standard recipe manifest. */
function collectArtifacts() {
  return [];
}
export { collectArtifacts as collectStandardArtifacts };

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/index.ts
/** Runs the authored ecology steps in their declared dependency order. */
export default createStage({
  id: "ecology",
  steps: [],
});

// @filename: packages/mapgen-core/src/domain/ecology/model/policy/climate.ts
export function resolveFutureCoreClimateBand(latitude: number): number {
  return Math.floor(latitude / 10);
}
```
