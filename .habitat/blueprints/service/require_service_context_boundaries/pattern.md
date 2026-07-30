---
level: error
---
# Require Service Context Boundaries

`service/context.ts` is the sole exported `Context` owner. It is a type-only
aggregation of owned root or module port leaves. Configured module branches
carry that context to handlers, so module implementation does not deep-import
the root context.

```grit
language js(typescript)

predicate require_service_context_boundaries_is_service_source() {
  $filename <: r".*/services/[^/]+/src/service/.*\.ts$"
}

predicate require_service_context_boundaries_is_context_owner() {
  $filename <: r".*/services/[^/]+/src/service/context\.ts$"
}

predicate require_service_context_boundaries_is_module_implementation() {
  $filename <: r".*/services/[^/]+/src/service/modules/[^/]+/(?:module\.ts|router(?:/[^/]+)?\.ts)$"
}

predicate require_service_context_boundaries_is_owned_port_source($source) {
  $source <: r"^[\"'](?:\./model/ports/|\./modules/[^/]+/model/ports/)[^/\"']+[\"']$"
}

predicate require_service_context_boundaries_is_whole_type_import($import) {
  $import <: import_statement(type=type())
}

predicate require_service_context_boundaries_is_named_type_import($import) {
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
  program() as $program where {
    require_service_context_boundaries_is_context_owner(),
    not { $program <: contains `export type Context = $context` }
  },
  `export type Context = $context` where {
    require_service_context_boundaries_is_service_source(),
    not { require_service_context_boundaries_is_context_owner() }
  },
  import_statement(source=$source) as $import where {
    require_service_context_boundaries_is_context_owner(),
    or {
      not { require_service_context_boundaries_is_owned_port_source(source=$source) },
      and {
        not { require_service_context_boundaries_is_whole_type_import(import=$import) },
        not { require_service_context_boundaries_is_named_type_import(import=$import) }
      }
    }
  },
  `export const $name = $value` where {
    require_service_context_boundaries_is_context_owner()
  },
  import_statement(source=$source) where {
    require_service_context_boundaries_is_module_implementation(),
    $source <: r"^[\"'](?:\.\./)+(?:context|[^\"']*/context)[\"']$"
  }
}
```

## Matches a missing context owner

```typescript
// @filename: services/control/src/service/context.ts
export type ServiceContext = { readonly unit: UnitPort };
```

## Matches a second context owner

```typescript
// @filename: services/control/src/service/modules/unit/module.ts
export type Context = { readonly unit: UnitPort };
```

## Matches concrete or runtime context acquisition

```typescript
// @filename: services/control/src/service/context.ts
import { createController } from "@civ7/direct-control";
export type Context = { readonly controller: ReturnType<typeof createController> };
export const controller = createController();
```

## Matches a module reopening root context

```typescript
// @filename: services/control/src/service/modules/unit/router/command.ts
import type { Context } from "../../../context";
export declare const context: Context;
```

## Ignores a private port aggregation owner

```typescript
// @filename: services/control/src/service/context.ts
import type { UnitPort } from "./model/ports/unit";
import { type LifecyclePort } from "./modules/lifecycle/model/ports/lifecycle";
export type Context = {
  readonly unit: UnitPort;
  readonly lifecycle: LifecyclePort;
};
```
