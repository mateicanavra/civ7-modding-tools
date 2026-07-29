---
level: error
---
# Require Service Proof Isolation

Service production source does not load its package-root `test` tree. The
dependency direction remains one-way from proof to production.

```grit
language js(typescript)

predicate require_service_proof_isolation_is_service_production_source() {
  $filename <: r".*/services/[^/]+/src/.*\.ts$"
}

predicate require_service_proof_isolation_is_relative_test_source($source) {
  or {
    $source <: r"^[\"'](?:\./|\.\./)(?:[^/\"']+/)*test(?:/[^\"']*)?[\"']$",
    and {
      $source <: template_string(),
      $source <: not contains template_substitution(),
      $source <: r"^`(?:\./|\.\./)(?:[^/`]+/)*test(?:/[^`]*)?`$"
    }
  }
}

or {
  import_statement(source=$source),
  export_statement(source=$source) where { $source <: string() },
  `import($source)`,
  `require($source)`,
  `require.resolve($source)`
} where {
  require_service_proof_isolation_is_service_production_source(),
  require_service_proof_isolation_is_relative_test_source(source=$source)
}
```

## Matches static proof acquisition

```typescript
// @filename: services/control/src/service/modules/unit/router/command.ts
import { unitFixture } from "../../../../../test/support/unit";
```

## Matches dynamic proof acquisition

```typescript
// @filename: services/control/src/service/client.ts
const support = await import(`../../test/support/client`);
```

## Ignores production and proof-owned edges

```typescript
// @filename: services/control/src/service/router.ts
import { router as unit } from "./modules/unit/router";

// @filename: services/control/test/behavior/unit.test.ts
import { client } from "../../src/client";
```
