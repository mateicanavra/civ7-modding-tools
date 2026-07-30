---
level: error
---
# Require Public Domain Surfaces In Tests

MapGen tests consume domains through the same named public surfaces as product
code. A test path does not create a second, implicit private API.

```grit
language js(typescript)

or {
  or {
    import_statement(source=$source),
    `export { $exports } from $source`,
    `export type { $exports } from $source`,
    `export * from $source`,
    `import($source)`
  } where {
    $source <: r"^[\"']?@mapgen/domain/[a-z0-9]+(?:-[a-z0-9]+)*/.+[\"']?$",
    ! $source <: r"^[\"']?@mapgen/domain/[a-z0-9]+(?:-[a-z0-9]+)*/(?:router(?:\.js)?|model/(?:atoms(?:/(?:index|[a-z0-9]+(?:-[a-z0-9]+)*\.schema)\.js)?|policy/[a-z0-9]+(?:-[a-z0-9]+)*\.js)|modules/[a-z0-9]+(?:-[a-z0-9]+)*/(?:artifacts(?:/index\.js)?|model/(?:atoms(?:/(?:index|[a-z0-9]+(?:-[a-z0-9]+)*\.schema)\.js)?|policy/[a-z0-9]+(?:-[a-z0-9]+)*\.js)))[\"']?$"
  },
  or {
    import_statement(source=$source),
    `export { $exports } from $source`,
    `export type { $exports } from $source`,
    `export * from $source`,
    `import($source)`
  } where {
    $source <: r"^[\"']?(?:(?:\.\./)+(?:src/)?domain/|(?:\.\./)+plugins/mod/map/[^/]+/src/domain/)[a-z0-9]+(?:-[a-z0-9]+)*/.+[\"']?$",
    ! $source <: r"^[\"']?(?:(?:\.\./)+(?:src/)?domain/|(?:\.\./)+plugins/mod/map/[^/]+/src/domain/)[a-z0-9]+(?:-[a-z0-9]+)*/(?:(?:index|router)(?:\.js)?|model/(?:atoms(?:/(?:index|[a-z0-9]+(?:-[a-z0-9]+)*\.schema)\.js)?|policy/[a-z0-9]+(?:-[a-z0-9]+)*\.js)|modules/[a-z0-9]+(?:-[a-z0-9]+)*/(?:artifacts(?:/index\.js)?|model/(?:atoms(?:/(?:index|[a-z0-9]+(?:-[a-z0-9]+)*\.schema)\.js)?|policy/[a-z0-9]+(?:-[a-z0-9]+)*\.js)))[\"']?$"
  }
}
```

## Matches Fixture

```typescript
// @filename: plugins/mod/map/example-mod/test/domains/geology/private.test.ts
import privateRule from "@mapgen/domain/geology/modules/lithosphere/ops/compute-crust/rules/private.js";

// @filename: plugins/mod/map/another-mod/test/recipes/example.test.ts
export * from "@mapgen/domain/biosphere/model/private.js";

// @filename: packages/example-package/test/domain-reach.test.ts
import operation from "../../../plugins/mod/map/example-mod/src/domain/geology/modules/lithosphere/ops/compute-crust/index.js";

// @filename: plugins/mod/map/example-mod/test/domains/geology/ops-index.test.ts
import implementations from "@mapgen/domain/geology/modules/lithosphere/ops/index.js";
```

## Ignores Fixture

```typescript
// @filename: plugins/mod/map/example-mod/test/domains/geology/public.test.ts
import geology from "@mapgen/domain/geology/router";
import policy from "@mapgen/domain/geology/model/policy/plate-activity.js";
import { artifacts } from "@mapgen/domain/geology/modules/tectonics/artifacts";
import relativeGeology from "../../../src/domain/geology/index.js";
import relativeRouter from "../../../src/domain/geology/router.js";
import { artifacts as relativeArtifacts } from "../../../src/domain/geology/modules/tectonics/artifacts/index.js";
import { CRUST_POLICY } from "../../../src/domain/geology/model/policy/crust.js";

export const values = [
  geology,
  policy,
  artifacts,
  relativeGeology,
  relativeRouter,
  relativeArtifacts,
  CRUST_POLICY,
];

```
