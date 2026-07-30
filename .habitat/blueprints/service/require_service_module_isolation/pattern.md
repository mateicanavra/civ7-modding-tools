---
level: error
---
# Require Service Module Isolation

The service root sees modules only through contract and router indexes, plus
type-only context port declarations. A module never enters a sibling module.
Its contract leaves may ascend to the shared contract base and schema; its
router leaves may ascend to their own `module.ts`; and `module.ts` may acquire
only the root implementation stage.

```grit
language js(typescript)

predicate require_service_module_isolation_is_module_source() {
  $filename <: r".*/services/[^/]+/src/service/modules/[^/]+/.*\.ts$"
}

predicate require_service_module_isolation_is_root_service_source() {
  $filename <: r".*/services/[^/]+/src/service/.*\.ts$",
  ! require_service_module_isolation_is_module_source()
}

predicate require_service_module_isolation_is_allowed_root_module_import($import, $source) {
  or {
    and {
      $filename <: r".*/src/service/contract\.ts$",
      $source <: r"^[\"']\./modules/[^/]+/contract[\"']$"
    },
    and {
      $filename <: r".*/src/service/router\.ts$",
      $source <: r"^[\"']\./modules/[^/]+/router[\"']$"
    },
    and {
      $filename <: r".*/src/service/context\.ts$",
      $source <: r"^[\"']\./modules/[^/]+/model/ports/[^\"']+[\"']$",
      $import <: contains type()
    }
  }
}

predicate require_service_module_isolation_is_allowed_module_ascent($source) {
  or {
    and {
      $filename <: r".*/src/service/modules/[^/]+/module\.ts$",
      $source <: r"^[\"']\.\./\.\./impl[\"']$"
    },
    and {
      $filename <: r".*/src/service/modules/[^/]+/contract/[^/]+\.ts$",
      $source <: r"^[\"']\.\./\.\./\.\./(?:base|schema/[^\"']+)[\"']$"
    },
    and {
      $filename <: r".*/src/service/modules/[^/]+/router/[^/]+\.ts$",
      $source <: r"^[\"']\.\./module[\"']$"
    },
    and {
      $filename <: r".*/src/service/modules/[^/]+/middleware/[^/]+\.ts$",
      $source <: r"^[\"']\.\./\.\./\.\./impl[\"']$"
    }
  }
}

predicate require_service_module_isolation_is_sibling_module_alias($source) {
  $filename <: r".*/services/([^/]+)/src/service/modules/([^/]+)/.*\.ts$"($owner, $module),
  $source <: r"^[\"']#([^/]+)-service/modules/([^/]+)(?:/|[\"'])"($alias_owner, $target),
  $alias_owner <: $owner,
  ! $target <: $module
}

or {
  import_statement(source=$source) as $import where {
    require_service_module_isolation_is_root_service_source(),
    $source <: r"^[\"']\./modules/",
    ! require_service_module_isolation_is_allowed_root_module_import(import=$import, source=$source)
  },
  export_statement(source=$source) where {
    require_service_module_isolation_is_root_service_source(),
    $source <: r"^[\"']\./modules/"
  },
  import_statement(source=$source) where {
    require_service_module_isolation_is_module_source(),
    $source <: r"^[\"'](?:\.\./){2,}",
    ! require_service_module_isolation_is_allowed_module_ascent(source=$source)
  },
  export_statement(source=$source) where {
    require_service_module_isolation_is_module_source(),
    $source <: r"^[\"']\.\./"
  },
  import_statement(source=$source) where {
    require_service_module_isolation_is_module_source(),
    require_service_module_isolation_is_sibling_module_alias(source=$source)
  },
  export_statement(source=$source) where {
    require_service_module_isolation_is_module_source(),
    require_service_module_isolation_is_sibling_module_alias(source=$source)
  }
}
```

## Matches root acquisition of a module implementation

```typescript
// @filename: services/control/src/service/context.ts
import { createUnitHandler } from "./modules/unit/router/command";
```

## Matches a sibling module edge

```typescript
// @filename: services/control/src/service/modules/unit/router/command.ts
import { world } from "#control-service/modules/world/router";
```

## Matches contract acquisition of root implementation

```typescript
// @filename: services/control/src/service/modules/unit/contract/command.ts
import { service } from "../../../impl";
```

## Ignores declared composition faces

```typescript
// @filename: services/control/src/service/contract.ts
import { contract as unit } from "./modules/unit/contract";

// @filename: services/control/src/service/router.ts
import { router as unit } from "./modules/unit/router";

// @filename: services/control/src/service/context.ts
import type { UnitPort } from "./modules/unit/model/ports/unit";

// @filename: services/control/src/service/modules/unit/module.ts
import { service } from "../../impl";

// @filename: services/control/src/service/modules/unit/contract/command.ts
import { base } from "../../../base";
import { standard } from "../../../schema/standard";

// @filename: services/control/src/service/modules/unit/router/command.ts
import { module } from "../module";
```
