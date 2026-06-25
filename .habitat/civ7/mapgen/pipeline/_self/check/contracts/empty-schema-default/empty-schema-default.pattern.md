---
level: error
---
# Empty Schema Default

Contract schema definitions should not use empty object defaults.

```grit
language js(typescript)

`default: {}` where {
  $filename <: r".*mods/[^/]+/src/(?:domain/.*/ops/(?:.*/contract|.*\.contract)|recipes/.*/steps/(?:.*/contract|.*\.contract))\.ts$"
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo.contract.ts
export const Schema = {
  default: {},
};

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo.contract.ts
export const Contract = Type.Object(
  {},
  {
    default: {},
  }
);

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/nested.contract.ts
export const Schema = Type.Object({
  options: Type.Object(
    {},
    {
      default: {},
    }
  ),
});

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot.contract.ts
export const StepContract = {
  input: Type.Object(
    {},
    {
      default: {},
    }
  ),
};

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/contract.ts
export const OrdinaryContract = {
  default: {},
};

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/plot/contract.ts
export const StepOrdinaryContract = {
  default: {},
};

// @filename: mods/other-mod/src/domain/ecology/ops/demo.contract.ts
export const OtherSchema = {
  default: {},
};
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo.contract.ts
export const Schema = {
  default: { enabled: true },
};

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo.contract.ts
export const SchemaWithPropertyDefault = Type.Object({
  enabled: Type.Boolean({ default: true }),
});

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo.contract.ts
export const ArrayDefault = {
  default: [],
};

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo.contract.ts
export const NullDefault = {
  default: null,
};

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo.contract.ts
export const ScalarDefault = {
  default: "standard",
};

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo.contract.ts
export const LookalikeDefault = {
  defaultValue: {},
};

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/contract-helper.ts
export const ContractHelper = {
  default: {},
};

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/config.ts
export const Config = {
  default: {},
};

// @filename: mods/mod-swooper-maps/test/ecology/demo.contract.ts
export const TestSchema = {
  default: {},
};

// @filename: mods/mod-swooper-maps/src/maps/standard/demo.contract.ts
export const MapSchema = {
  default: {},
};

// @filename: packages/mapgen-core/src/demo.contract.ts
export const PackageSchema = {
  default: {},
};

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo.contract.tsx
export const TsxSchema = {
  default: {},
};
```
