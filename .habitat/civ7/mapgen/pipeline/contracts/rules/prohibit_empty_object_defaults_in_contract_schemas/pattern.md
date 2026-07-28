---
level: error
---
# Prohibit Empty Object Defaults In Contract Schemas

Contract schema definitions should not use empty object defaults.

```grit
language js(typescript)

`default: {}` where {
  $filename <: r".*plugins/mod/map/[^/]+/src/(?:domain/.*/ops/(?:.*/contract|.*\.contract)|recipes/[^/]+/stages/(?:[^/]+/)+steps/[^/]+/config)\.ts$"
}
```

## Matches fixture

```typescript
// @filename: plugins/mod/map/example-mod/src/domain/ecology/modules/biomes/ops/demo.contract.ts
export const Schema = {
  default: {},
};

// @filename: plugins/mod/map/example-mod/src/domain/ecology/modules/biomes/ops/demo.contract.ts
export const Contract = Type.Object(
  {},
  {
    default: {},
  }
);

// @filename: plugins/mod/map/example-mod/src/domain/ecology/modules/biomes/ops/nested.contract.ts
export const Schema = Type.Object({
  options: Type.Object(
    {},
    {
      default: {},
    }
  ),
});

// @filename: plugins/mod/map/example-mod/src/recipes/sample-recipe/stages/ecology/biomes/steps/project-biomes/config.ts
export const StepContract = {
  input: Type.Object(
    {},
    {
      default: {},
    }
  ),
};

// @filename: plugins/mod/map/example-mod/src/domain/ecology/modules/biomes/ops/demo/contract.ts
export const OrdinaryContract = {
  default: {},
};

// @filename: plugins/mod/map/example-mod/src/recipes/sample-recipe/stages/ecology/projection/steps/render/config.ts
export const StepOrdinaryContract = {
  default: {},
};

// @filename: plugins/mod/map/alternate-mod/src/domain/ecology/modules/biomes/ops/demo.contract.ts
export const OtherSchema = {
  default: {},
};
```

## Ignores fixture

```typescript
// @filename: plugins/mod/map/example-mod/src/domain/ecology/modules/biomes/ops/demo.contract.ts
export const Schema = {
  default: { enabled: true },
};

// @filename: plugins/mod/map/example-mod/src/domain/ecology/modules/biomes/ops/demo.contract.ts
export const SchemaWithPropertyDefault = Type.Object({
  enabled: Type.Boolean({ default: true }),
});

// @filename: plugins/mod/map/example-mod/src/domain/ecology/modules/biomes/ops/demo.contract.ts
export const ArrayDefault = {
  default: [],
};

// @filename: plugins/mod/map/example-mod/src/domain/ecology/modules/biomes/ops/demo.contract.ts
export const NullDefault = {
  default: null,
};

// @filename: plugins/mod/map/example-mod/src/domain/ecology/modules/biomes/ops/demo.contract.ts
export const ScalarDefault = {
  default: "standard",
};

// @filename: plugins/mod/map/example-mod/src/domain/ecology/modules/biomes/ops/demo.contract.ts
export const LookalikeDefault = {
  defaultValue: {},
};

// @filename: plugins/mod/map/example-mod/src/domain/ecology/modules/biomes/ops/demo/contract-helper.ts
export const ContractHelper = {
  default: {},
};

// @filename: plugins/mod/map/example-mod/src/domain/ecology/modules/biomes/ops/demo/config.ts
export const Config = {
  default: {},
};

// @filename: plugins/mod/map/example-mod/test/ecology/demo.contract.ts
export const TestSchema = {
  default: {},
};

// @filename: plugins/mod/map/example-mod/src/maps/sample/demo.contract.ts
export const MapSchema = {
  default: {},
};

// @filename: packages/mapgen-core/src/demo.contract.ts
export const PackageSchema = {
  default: {},
};

// @filename: plugins/mod/map/example-mod/src/domain/ecology/modules/biomes/ops/demo.contract.tsx
export const TsxSchema = {
  default: {},
};
```
