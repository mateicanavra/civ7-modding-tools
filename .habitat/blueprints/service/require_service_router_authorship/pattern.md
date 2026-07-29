---
level: error
---
# Require Service Router Authorship

Direct module router leaves author handlers from the configured `module`
branch. Each leaf exposes one runtime authority. Module `router/index.ts`
registers direct semantic leaves into a plain object, while module and root
router aggregates never author handlers.

```grit
language js(typescript)

predicate require_service_router_authorship_is_router_leaf() {
  $filename <: r".*/services/[^/]+/src/service/modules/[^/]+/router/[^/]+\.ts$",
  ! $filename <: r".*/router/index\.ts$"
}

predicate require_service_router_authorship_is_module_router_index() {
  $filename <: r".*/services/[^/]+/src/service/modules/[^/]+/router/index\.ts$"
}

predicate require_service_router_authorship_is_router_composer() {
  or {
    require_service_router_authorship_is_module_router_index(),
    $filename <: r".*/services/[^/]+/src/service/router\.ts$"
  }
}

predicate require_service_router_authorship_has_one_router_leaf_export($body) {
  $exports = [],
  $body <: contains bubble($exports) `export const $name = $value` as $export where {
    $exports += $export
  },
  $count = length(target=$exports),
  $count <: 1
}

predicate require_service_router_authorship_has_module_handler_authority($body) {
  $body <: contains `export const $name = $value` where {
    $value <: contains `$branch.$method($handler)` where {
      $branch <: contains `module`,
      $method <: r"^(?:effect|handler)$"
    }
  }
}

predicate require_service_router_authorship_has_registered_router_leaf($body) {
  $body <: some $statement where {
    $statement <: import_statement(source=$source) as $import,
    $source <: r"^[\"']\./[a-z][a-z0-9]*(?:-[a-z0-9]+)*[\"']$",
    $import <: contains import_specifier(name=$name),
    $body <: contains `export const router = $value` where {
      $value <: contains $name
    }
  }
}

or {
  program(statements=$body) where {
    require_service_router_authorship_is_router_leaf(),
    ! {
      require_service_router_authorship_has_one_router_leaf_export(body=$body),
      require_service_router_authorship_has_module_handler_authority(body=$body)
    }
  },
  export_statement(declaration=$declaration) where {
    require_service_router_authorship_is_router_leaf(),
    ! $declaration <: lexical_declaration()
  },
  or {
    `export default $value`,
    `export * from $source`,
    `export { $specifiers }`,
    `export { $specifiers } from $source`
  } where {
    require_service_router_authorship_is_router_leaf()
  },
  program(statements=$body) where {
    require_service_router_authorship_is_module_router_index(),
    ! {
      $body <: contains `export const router = { $properties }`,
      require_service_router_authorship_has_registered_router_leaf(body=$body)
    }
  },
  `$branch.$method($handler)` where {
    require_service_router_authorship_is_router_composer(),
    $method <: r"^(?:effect|handler)$"
  }
}
```

## Matches handler authorship in a module index

```typescript
// @filename: services/control/src/service/modules/unit/router/index.ts
export const router = {
  command: module.command.effect(handler),
};
```

## Matches a router leaf with a second runtime export

```typescript
// @filename: services/control/src/service/modules/unit/router/command.ts
export const command = module.command.effect(handler);
export const preview = module.preview.effect(previewHandler);
```

## Matches an unregistered module router

```typescript
// @filename: services/control/src/service/modules/unit/router/index.ts
export const router = {};
```

## Ignores leaf authorship and plain composition

```typescript
// @filename: services/control/src/service/modules/unit/router/command.ts
import { module } from "../module";
export const command = module.command.effect(function* ({ input }) {
  return input;
});

// @filename: services/control/src/service/modules/unit/router/index.ts
import { command } from "./command";
export const router = { command };
```
