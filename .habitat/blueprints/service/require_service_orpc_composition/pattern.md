---
level: error
---
# Require Native Effect-oRPC Service Composition

The pinned provider lineage is:

`implementEffect(contract, runtime).$context<Context>()` to configured
`service`, to the matching module branch, to Effect-authored router leaves, to
a plain module router, to one configured `service.router(...)` root.

`impl` is private. Root implementation through `impl.router(...)` would bypass
the configured middleware stage. Module and module-index routers never call
`.router(...)`.

```grit
language js(typescript)

predicate require_service_orpc_composition_is_service_source() {
  $filename <: r".*/services/[^/]+/src/service/.*\.ts$"
}

predicate require_service_orpc_composition_is_service_base() {
  $filename <: r".*/services/[^/]+/src/service/base\.ts$"
}

predicate require_service_orpc_composition_is_service_impl() {
  $filename <: r".*/services/[^/]+/src/service/impl\.ts$"
}

predicate require_service_orpc_composition_is_service_module() {
  $filename <: r".*/services/[^/]+/src/service/modules/[^/]+/module\.ts$"
}

predicate require_service_orpc_composition_is_module_router_index() {
  $filename <: r".*/services/[^/]+/src/service/modules/[^/]+/router/index\.ts$"
}

predicate require_service_orpc_composition_is_root_router() {
  $filename <: r".*/services/[^/]+/src/service/router\.ts$"
}

predicate require_service_orpc_composition_has_single_implementation($body) {
  $calls = [],
  $body <: contains bubble($calls) `implementEffect($contract, $runtime)` as $call where {
    $calls += $call
  },
  $count = length(target=$calls),
  $count <: 1
}

predicate require_service_orpc_composition_has_single_root_router($body) {
  $calls = [],
  $body <: contains bubble($calls) `service.router($surface)` as $call where {
    $calls += $call
  },
  $count = length(target=$calls),
  $count <: 1
}

predicate require_service_orpc_composition_has_root_module_input($body) {
  or {
    {
      $body <: contains `const modules = { $properties }`,
      $body <: contains `type Modules = typeof modules`
    },
    {
      $body <: contains `type Modules = { $module_properties }`,
      $body <: contains `const modules: Modules = { $properties }`
    }
  }
}

predicate require_service_orpc_composition_has_native_implementation_lineage($body) {
  require_service_orpc_composition_has_single_implementation(body=$body),
  $body <: contains `const impl = implementEffect(contract, $runtime).$context<Context>()`,
  $body <: contains `type Service = EffectImplementerInternal<typeof contract, Context, Context, never, never>`,
  $body <: contains `export const service: Service = $value` where {
    $value <: `$receiver.use($middleware)`,
    $value <: contains `impl`,
    ! $value <: contains `$owner.$method($args)` where {
      ! $method <: `use`
    }
  }
}

or {
  `implementEffect($contract, $runtime)` where {
    require_service_orpc_composition_is_service_source(),
    ! require_service_orpc_composition_is_service_impl()
  },
  import_statement(source=$source) where {
    require_service_orpc_composition_is_service_base(),
    $source <: r"^[\"'](?:@orpc/server|effect-orpc)[\"']$",
    $import = $source,
    $program <: contains import_statement(source=$import) as $statement,
    $statement <: contains import_specifier(name=`implementEffect`)
  },
  import_statement(source=$source) where {
    require_service_orpc_composition_is_service_base(),
    $source <: r"^[\"']\./contract[\"']$"
  },
  program(statements=$body) where {
    require_service_orpc_composition_is_service_impl(),
    ! require_service_orpc_composition_has_native_implementation_lineage(body=$body)
  },
  `export const impl = $value` where {
    require_service_orpc_composition_is_service_impl()
  },
  program(statements=$body) where {
    require_service_orpc_composition_is_service_module(),
    $filename <: r".*/modules/([A-Za-z_$][A-Za-z0-9_$]*)/module\.ts$"($module_name),
    ! $body <: contains `export const module: ServiceModule<$module_key> = service.$module_name`
  },
  `$receiver.router($surface)` where {
    require_service_orpc_composition_is_module_router_index()
  },
  program(statements=$body) where {
    require_service_orpc_composition_is_module_router_index(),
    ! $body <: contains `export const router = { $properties }`
  },
  program(statements=$body) where {
    require_service_orpc_composition_is_root_router(),
    ! {
      require_service_orpc_composition_has_root_module_input(body=$body),
      $body <: contains `export const router: EnhancedEffectRouter<Modules, Context, Context, Record<never, never>> = service.router(modules)`,
      require_service_orpc_composition_has_single_root_router(body=$body)
    }
  },
  `impl.router($surface)` where {
    require_service_orpc_composition_is_service_source()
  },
  `$receiver.router($surface)` where {
    require_service_orpc_composition_is_root_router(),
    ! $receiver <: `service`
  },
  `export const service: Service = $receiver.use($middleware).use($middleware)` where {
    require_service_orpc_composition_is_service_impl()
  }
}
```

## Matches a second implementation lineage

```typescript
// @filename: services/control/src/service/modules/unit/module.ts
const alternate = implementEffect(contract, runtime).$context<Context>();
export const module: ServiceModule<"unit"> = alternate.unit;
```

## Matches root implementation through the unconfigured stage

```typescript
// @filename: services/control/src/service/router.ts
export const router = impl.router({ unit: unitRouter });
```

## Matches a wrong module branch

```typescript
// @filename: services/control/src/service/modules/unit/module.ts
export const module: ServiceModule<"unit"> = service.world;
```

## Matches module-level router implementation

```typescript
// @filename: services/control/src/service/modules/unit/router/index.ts
export const router = module.router({ command });
```

## Ignores the pinned provider lineage

```typescript
// @filename: services/control/src/service/impl.ts
import { implementEffect } from "effect-orpc";
import { contract } from "./contract";
import type { Context } from "./context";
const impl = implementEffect(contract, runtime).$context<Context>();
type Service = EffectImplementerInternal<typeof contract, Context, Context, never, never>;
export type ServiceModule<K extends keyof typeof contract> = Service[K];
export const service: Service = impl.use(nativeAdmission).use(effectAdmission);

// @filename: services/control/src/service/modules/unit/module.ts
import { service } from "../../impl";
export const module: ServiceModule<"unit"> = service.unit;

// @filename: services/control/src/service/modules/unit/router/index.ts
import { command } from "./command";
export const router = { command };

// @filename: services/control/src/service/router.ts
import { service } from "./impl";
import { router as unit } from "./modules/unit/router";
const modules = { unit };
type Modules = typeof modules;
export const router: EnhancedEffectRouter<
  Modules,
  Context,
  Context,
  Record<never, never>
> = service.router(modules);
```

## Ignores an explicit serialization boundary

```typescript
// @filename: services/control/src/service/router.ts
import { service } from "./impl";
import { router as unit } from "./modules/unit/router";
type Modules = {
  unit: typeof unit;
};
const modules: Modules = { unit };
export const router: EnhancedEffectRouter<
  Modules,
  Context,
  Context,
  Record<never, never>
> = service.router(modules);
```
