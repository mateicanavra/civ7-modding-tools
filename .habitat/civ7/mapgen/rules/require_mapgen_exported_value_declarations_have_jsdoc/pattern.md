---
level: error
---
# Require MapGen Exported Value Declarations To Have JSDoc

Authored MapGen application, SDK, product, policy, Studio, and reusable
capability value exports are cross-module contracts or framework-discovered
authoring contracts. Their defining declarations require adjacent nonempty
JSDoc. This rule rejects only missing, empty, and
obvious placeholder blocks; review owns whether accepted documentation explains
the value's behavior, purpose, invariants, or material gotchas. A direct
anonymous default value is documented at its export statement; re-export barrels
inherit documentation from the owner. A TypeScript overload family has one
documentation owner: its first signature.

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

predicate follows_exported_overload_signature($export, $declaration) {
  $declaration <: or {
    function_signature(name=$name),
    function_declaration(name=$name)
  },
  $previous = before $export,
  $previous <: export_statement(declaration=function_signature(name=$name))
}

predicate follows_local_overload_signature($declaration) {
  $declaration <: or {
    function_signature(name=$name),
    function_declaration(name=$name)
  },
  $previous = before $declaration,
  $previous <: function_signature(name=$name)
}

or {
  export_statement(declaration=$declaration) as $export where {
    $declaration <: or {
      lexical_declaration(),
      variable_declaration(),
      function_signature(),
      function_declaration(),
      class_declaration(),
      enum_declaration()
    },
    ! follows_exported_overload_signature($export, $declaration),
    lacks_declaration_jsdoc($export)
  },
  `export default $value` as $export where {
    ! $value <: identifier(),
    lacks_declaration_jsdoc($export)
  },
  or {
    `export default $name`,
    `export { $..., $name, $... }`,
    `export { $..., $name as $_, $... }`
  } as $export where {
    $program <: contains or {
      lexical_declaration() as $declaration where {
        $declaration <: contains variable_declarator(name=$name),
        lacks_declaration_jsdoc($declaration)
      },
      or {
        function_signature(name=$name),
        function_declaration(name=$name),
        class_declaration(name=$name),
        enum_declaration(name=$name)
      } as $declaration where {
        ! follows_local_overload_signature($declaration),
        lacks_declaration_jsdoc($declaration)
      }
    }
  }
} where {
  not { $filename <: r".*apps/mods/map/[^/]+/src/maps/generated/.*\.tsx?$" }
}
```

## Matches fixture

```typescript
// @filename: plugins/mod/map/example-mod/src/domain/ecology/model/policy/climate.ts
export function resolveClimateBand(latitude: number): number {
  return Math.floor(latitude / 10);
}

// @filename: plugins/mod/map/example-mod/src/domain/ecology/model/policy/options.ts
/** TODO */
export const DEFAULT_CLIMATE_OPTIONS = {};

// @filename: plugins/mod/map/example-mod/src/recipes/standard/runtime.ts
/** Documentation pending. */
export class StandardRuntimeState {}

// @filename: plugins/mod/map/example-mod/src/recipes/standard/completions.ts
/** */
export const STANDARD_COMPLETIONS = {};

// @filename: plugins/mod/map/example-mod/src/domain/ecology/model/policy/climate-band.ts
export enum ClimateBand {
  Polar,
  Temperate,
  Tropical,
}

// @filename: plugins/mod/map/example-mod/src/domain/ecology/ops/classify-biomes/index.ts
const classifyBiomes = createOp(BiomeClassificationContract, {
  strategies: { "biophysical-gaussian": biophysicalGaussianStrategy },
});
export default classifyBiomes;

// @filename: plugins/mod/map/example-mod/src/recipes/standard/artifacts.ts
function collectArtifacts() {
  return [];
}
export { collectArtifacts };

// @filename: plugins/mod/map/example-mod/src/recipes/standard/stages/ecology/index.ts
export default createStage({
  id: "ecology",
  steps: [],
});

// @filename: packages/mapgen-core/src/authoring/step/contract.ts
export function defineFixtureStep(definition: { id: string }): { id: string };
export function defineFixtureStep(definition: { id: string; tags: readonly string[] }): {
  id: string;
  tags: readonly string[];
};
export function defineFixtureStep(
  definition: { id: string } | { id: string; tags: readonly string[] }
) {
  return definition;
}
```

## Ignores fixture

```typescript
// @filename: plugins/mod/map/example-mod/src/domain/ecology/model/policy/climate.ts
/** Maps absolute latitude to the closed climate-band index consumed by biome selection. */
export function resolveClimateBand(latitude: number): number {
  return Math.floor(latitude / 10);
}

// @filename: plugins/mod/map/example-mod/src/domain/ecology/index.ts
export { resolveClimateBand } from "./model/policy/climate.js";
export type { ClimateBand } from "./model/types.js";

// @filename: plugins/mod/map/example-mod/src/domain/ecology/model/types.ts
export interface ClimateBand {}

// @filename: plugins/mod/map/example-mod/src/domain/ecology/model/policy/documented-climate-band.ts
/** Stable climate bands serialized by the authored biome policy. */
export enum DocumentedClimateBand {
  Polar,
  Temperate,
  Tropical,
}

// @filename: plugins/mod/map/example-mod/src/domain/ecology/ops/classify-biomes/index.ts
/** Executable biome classifier assembled from the stable contract and semantic strategy. */
const classifyBiomes = createOp(BiomeClassificationContract, {
  strategies: { "biophysical-gaussian": biophysicalGaussianStrategy },
});
export default classifyBiomes;

// @filename: plugins/mod/map/example-mod/src/recipes/standard/artifacts.ts
/** Collects the closed artifact set used to compile the standard recipe manifest. */
function collectArtifacts() {
  return [];
}
export { collectArtifacts as collectStandardArtifacts };

// @filename: plugins/mod/map/example-mod/src/recipes/standard/stages/ecology/index.ts
/** Runs the authored ecology steps in their declared dependency order. */
export default createStage({
  id: "ecology",
  steps: [],
});

// @filename: packages/mapgen-core/src/authoring/step/contract.ts
/** Admits one fixture step while preserving its optional authored tags. */
export function defineFixtureStep(definition: { id: string }): { id: string };
export function defineFixtureStep(definition: { id: string; tags: readonly string[] }): {
  id: string;
  tags: readonly string[];
};
export function defineFixtureStep(
  definition: { id: string } | { id: string; tags: readonly string[] }
) {
  return definition;
}
```
