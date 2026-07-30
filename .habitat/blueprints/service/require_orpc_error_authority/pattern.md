---
level: error
---
# Require Pinned E2 oRPC Error Authority

Pinned `effect-orpc` maps contract-declared `ORPCTaggedError` failures.
Executable interiors therefore do not construct `ORPCError`, install a second
middleware error map, or translate all failures through a catch-all portal.

```grit
language js(typescript)

predicate require_orpc_error_authority_is_governed_source() {
  $filename <: r".*/services/[^/]+/src/service/.*\.ts$"
}

predicate require_orpc_error_authority_is_executable_interior() {
  $filename <: r".*/services/[^/]+/src/service/(?:impl\.ts|router\.ts|middleware/[^/]+\.ts|modules/[^/]+/(?:module\.ts|router/[^/]+\.ts|middleware/[^/]+\.ts))$"
}

predicate require_orpc_error_authority_is_middleware_source() {
  $filename <: r".*/services/[^/]+/src/service/(?:middleware|modules/[^/]+/middleware)/.*\.ts$"
}

predicate require_orpc_error_authority_is_error_source($source) {
  $source <: r"^[\"'][^\"']*(?:[/\.]errors?)(?:[/\.][^\"']*)?[\"']$"
}

predicate require_orpc_error_authority_is_whole_type_import($import) {
  $import <: import_statement(type=type())
}

predicate require_orpc_error_authority_is_named_type_import($import) {
  $import <: `import { $... } from $source`,
  $import <: contains import_specifier() as $type_specifier where {
    $type_specifier <: contains type()
  },
  not {
    $import <: contains import_specifier() as $specifier where {
      $specifier <: not contains type()
    }
  }
}

or {
  import_statement(source=$source) as $import where {
    require_orpc_error_authority_is_executable_interior(),
    $source <: r"^[\"'](?:@orpc/server|@orpc/client)[\"']$",
    $import <: contains import_specifier(name=`ORPCError`) as $specifier,
    $specifier <: not contains type()
  },
  `new ORPCError($arguments)` where {
    require_orpc_error_authority_is_executable_interior()
  },
  import_statement(source=$source) as $import where {
    require_orpc_error_authority_is_governed_source(),
    $source <: r"^[\"']effect-orpc[\"']$",
    $import <: contains import_specifier(name=`toORPCError`)
  },
  import_statement(source=$source) as $import where {
    require_orpc_error_authority_is_executable_interior(),
    require_orpc_error_authority_is_error_source(source=$source),
    not { require_orpc_error_authority_is_whole_type_import(import=$import) },
    not { require_orpc_error_authority_is_named_type_import(import=$import) }
  },
  `$receiver.errors($argument)` where {
    require_orpc_error_authority_is_middleware_source()
  },
  import_statement(source=$source) as $import where {
    require_orpc_error_authority_is_governed_source(),
    $source <: r"^[\"']effect-orpc[\"']$",
    $import <: contains import_specifier(name=`ORPCTaggedError`),
    not { $filename <: r".*/model/errors/[^/]+\.ts$" },
    not { $filename <: r".*/modules/[^/]+/contract/[^/]+\.ts$" }
  },
  or {
    `const dispatchError = $value`,
    `function dispatchError($args) { $body }`,
    `const errorStatusMap = $value`,
    `errorStatusMap[$key]`,
    `errorStatusMap.$key`
  } where {
    require_orpc_error_authority_is_governed_source()
  }
}
```

## Matches direct catch-all translation

```typescript
// @filename: services/control/src/service/impl.ts
import { ORPCError } from "@orpc/server";
import { toORPCError } from "effect-orpc";
export const translate = (failure: unknown) =>
  new ORPCError("INTERNAL_SERVER_ERROR", { cause: toORPCError(failure) });
```

## Matches parallel executable error values

```typescript
// @filename: services/control/src/service/modules/unit/router/command.ts
import { UnitUnavailable } from "../model/errors/unit";
export const command = module.command.effect(() => Effect.fail(new UnitUnavailable()));
```

## Matches executable tagged error authority

```typescript
// @filename: services/control/src/service/modules/unit/router/command.ts
import { ORPCTaggedError } from "effect-orpc";
export class UnitUnavailable extends ORPCTaggedError("UnitUnavailable", { status: 503 }) {}
```

## Ignores leaf-local contract errors

```typescript
// @filename: services/control/src/service/modules/unit/contract/command.ts
import { ORPCTaggedError } from "effect-orpc";
const UnitUnavailable = ORPCTaggedError("UnitUnavailable", { status: 503 });
export const command = base.errors({ UnitUnavailable });
```

## Ignores shared error models

```typescript
// @filename: services/control/src/service/modules/unit/model/errors/unit.ts
import { ORPCTaggedError } from "effect-orpc";
export class UnitUnavailable extends ORPCTaggedError("UnitUnavailable", { status: 503 }) {}
```

## Ignores injected constructors and type-only error facts

```typescript
// @filename: services/control/src/service/modules/unit/router/command.ts
import type { UnitUnavailable } from "../model/errors/unit";
export const command = module.command.effect(function* ({ errors }) {
  return yield* Effect.fail(errors.UnitUnavailable());
});
```
