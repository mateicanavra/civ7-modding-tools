---
level: error
---
# Require Generic Service Anchor Exports

Every service spine exposes the generic authority for its role. `base.ts`
exports the shared `eoc` contract-authoring base, `context.ts` exports the
`Context` type, contract and router aggregates export `contract` and `router`,
`impl.ts` exports only the configured `service`, and `module.ts` exports only
the configured module branch. Implementation anchors carry the native portable
types required for declaration emit. The sole `impl` binding remains private.

```grit
language js(typescript)

predicate require_service_anchor_exports_is_service_base() {
  $filename <: r".*/services/[^/]+/src/service/base\.ts$"
}

predicate require_service_anchor_exports_is_service_context() {
  $filename <: r".*/services/[^/]+/src/service/context\.ts$"
}

predicate require_service_anchor_exports_is_service_contract_anchor() {
  $filename <: r".*/services/[^/]+/src/service/(?:contract\.ts|modules/[^/]+/contract/index\.ts)$"
}

predicate require_service_anchor_exports_is_service_impl() {
  $filename <: r".*/services/[^/]+/src/service/impl\.ts$"
}

predicate require_service_anchor_exports_is_service_module() {
  $filename <: r".*/services/[^/]+/src/service/modules/[^/]+/module\.ts$"
}

predicate require_service_anchor_exports_is_service_router_anchor() {
  $filename <: r".*/services/[^/]+/src/service/(?:router\.ts|modules/[^/]+/router/index\.ts)$"
}

predicate require_service_anchor_exports_is_service_root_router() {
  $filename <: r".*/services/[^/]+/src/service/router\.ts$"
}

predicate require_service_anchor_exports_is_service_module_router() {
  $filename <: r".*/services/[^/]+/src/service/modules/[^/]+/router/index\.ts$"
}

predicate require_service_anchor_exports_is_runtime_export($export) {
  $export <: export_statement(declaration=$declaration) where {
    $declaration <: or {
      lexical_declaration(),
      variable_declaration(),
      function_declaration(),
      class_declaration(),
      enum_declaration()
    }
  }
}

or {
  program(statements=$body) where {
    require_service_anchor_exports_is_service_base(),
    ! $body <: contains `export const base = $value`
  },
  program(statements=$body) where {
    require_service_anchor_exports_is_service_context(),
    ! $body <: contains `export type Context = $type`
  },
  program(statements=$body) where {
    require_service_anchor_exports_is_service_contract_anchor(),
    ! $body <: contains `export const contract = $value`
  },
  program(statements=$body) where {
    require_service_anchor_exports_is_service_impl(),
    ! {
      $body <: contains `type Service = EffectImplementerInternal<typeof contract, Context, Context, never, never>`,
      $body <: contains `export const service: Service = $value`
    }
  },
  program(statements=$body) where {
    require_service_anchor_exports_is_service_module(),
    ! $body <: contains `export const module: ServiceModule<$module_key> = $value`
  },
  program(statements=$body) where {
    require_service_anchor_exports_is_service_root_router(),
    ! $body <: contains `export const router: EnhancedEffectRouter<Modules, Context, Context, Record<never, never>> = $value`
  },
  program(statements=$body) where {
    require_service_anchor_exports_is_service_module_router(),
    ! $body <: contains `export const router = $value`
  },
  export_statement() as $export where {
    require_service_anchor_exports_is_service_base(),
    require_service_anchor_exports_is_runtime_export(export=$export),
    ! $export <: `export const base = $value`
  },
  export_statement() as $export where {
    require_service_anchor_exports_is_service_context(),
    require_service_anchor_exports_is_runtime_export(export=$export)
  },
  export_statement() as $export where {
    require_service_anchor_exports_is_service_contract_anchor(),
    require_service_anchor_exports_is_runtime_export(export=$export),
    ! $export <: `export const contract = $value`
  },
  export_statement() as $export where {
    require_service_anchor_exports_is_service_impl(),
    require_service_anchor_exports_is_runtime_export(export=$export),
    ! $export <: `export const service: Service = $value`
  },
  export_statement() as $export where {
    require_service_anchor_exports_is_service_module(),
    ! $export <: `export const module: ServiceModule<$module_key> = $value`
  },
  export_statement() as $export where {
    require_service_anchor_exports_is_service_root_router(),
    require_service_anchor_exports_is_runtime_export(export=$export),
    ! $export <: `export const router: EnhancedEffectRouter<Modules, Context, Context, Record<never, never>> = $value`
  },
  export_statement() as $export where {
    require_service_anchor_exports_is_service_module_router(),
    require_service_anchor_exports_is_runtime_export(export=$export),
    ! $export <: `export const router = $value`
  },
  or {
    `export default $value`,
    `export * from $source`,
    `export { $specifiers } from $source`
  } where {
    or {
      require_service_anchor_exports_is_service_base(),
      require_service_anchor_exports_is_service_context(),
      require_service_anchor_exports_is_service_contract_anchor(),
      require_service_anchor_exports_is_service_impl(),
      require_service_anchor_exports_is_service_module(),
      require_service_anchor_exports_is_service_router_anchor()
    }
  }
}
```

## Matches a public implementation stage

```typescript
// @filename: services/control/src/service/impl.ts
export const impl = implementEffect(contract, runtime).$context<Context>();
type Service = EffectImplementerInternal<typeof contract, Context, Context, never, never>;
export type ServiceModule<K extends keyof typeof contract> = Service[K];
export const service: Service = impl.use(admission);
```

## Matches a second module export

```typescript
// @filename: services/control/src/service/modules/unit/module.ts
export const module: ServiceModule<"unit"> = service.unit;
export const createUnitModule = () => module;
```

## Matches runtime context authority

```typescript
// @filename: services/control/src/service/context.ts
export type Context = { readonly requestId: string };
export const createContext = (): Context => ({ requestId: "request" });
```

## Ignores the generic anchors

```typescript
// @filename: services/control/src/service/base.ts
import { eoc } from "effect-orpc";
export const base = eoc.$meta<Meta>({}).errors(errorMap);

// @filename: services/control/src/service/context.ts
export type Context = { readonly requestId: string };
export type RequestPort = { readonly requestId: string };

// @filename: services/control/src/service/impl.ts
const impl = implementEffect(contract, runtime).$context<Context>();
type Service = EffectImplementerInternal<typeof contract, Context, Context, never, never>;
export type ServiceModule<K extends keyof typeof contract> = Service[K];
export const service: Service = impl.use(admission);

// @filename: services/control/src/service/modules/unit/module.ts
export const module: ServiceModule<"unit"> = service.unit;

// @filename: services/control/src/service/modules/unit/contract/index.ts
export const contract = { command };

// @filename: services/control/src/service/modules/unit/router/index.ts
export const router = { command };

// @filename: services/control/src/service/router.ts
const modules = { unit };
type Modules = typeof modules;
export const router: EnhancedEffectRouter<
  Modules,
  Context,
  Context,
  Record<never, never>
> = service.router(modules);
```
