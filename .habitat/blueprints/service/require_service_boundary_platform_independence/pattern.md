---
level: error
---
# Require Platform-Independent Service Boundaries

Service contracts, context, schemas, DTOs, errors, policy, and ports describe
portable capabilities. They do not load concrete `node:` or `bun:` modules.
Executable host composition owns those dependencies.

```grit
language js(typescript)

predicate require_service_boundary_platform_independence_is_service_boundary_declaration() {
  or {
    $filename <: r".*/services/[^/]+/src/service/(?:context|contract)\.ts$",
    $filename <: r".*/services/[^/]+/src/service/modules/[^/]+/contract/[^/]+\.ts$",
    $filename <: r".*/services/[^/]+/src/service/schema/[^/]+\.ts$",
    $filename <: r".*/services/[^/]+/src/service/(?:modules/[^/]+/)?model/(?:dto|errors|policy|ports)/[^/]+\.ts$"
  }
}

predicate require_service_boundary_platform_independence_is_platform_source($source) {
  $source <: r"^[\"'](?:node:|bun:)[^\"']+[\"']$"
}

or {
  import_statement(source=$source),
  export_statement(source=$source) where { $source <: string() },
  `import($source)`,
  `require($source)`,
  `require.resolve($source)`
} where {
  require_service_boundary_platform_independence_is_service_boundary_declaration(),
  require_service_boundary_platform_independence_is_platform_source(source=$source)
}
```

## Matches a Node dependency in a port

```typescript
// @filename: services/control/src/service/model/ports/evidence.ts
import type { PathLike } from "node:fs";
export type EvidencePort = { readonly target: PathLike };
```

## Matches Bun acquisition in a contract leaf

```typescript
// @filename: services/control/src/service/modules/unit/contract/command.ts
const store = await import("bun:sqlite");
```

## Ignores portable declarations

```typescript
// @filename: services/control/src/service/context.ts
import type { Effect } from "effect";
import type { UnitPort } from "./modules/unit/model/ports/unit";
export type Context = {
  readonly unit: UnitPort;
  readonly request: Effect.Effect<void>;
};

// @filename: services/control/src/service/modules/unit/router/command.ts
import { readFile } from "node:fs/promises";
export const command = module.command.effect(function* () {
  return yield* Effect.promise(() => readFile("fixture"));
});
```
