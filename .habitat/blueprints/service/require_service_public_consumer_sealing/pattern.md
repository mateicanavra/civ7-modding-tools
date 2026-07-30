---
level: error
---
# Require Service Public Consumer Sealing

Foreign packages, plugins, apps, and mods consume a standalone service through
its public package exports. They do not import, re-export, or dynamically load
a private `#<owner>-service` alias or a physical
`services/<owner>/src/service` implementation path.

This law owns literal module-loading edges. It does not inspect ordinary path
data or computed module names. Owner-local service source remains outside the
foreign-consumer acquisition roots.

```grit
language js(typescript)

predicate require_service_public_consumer_sealing_is_foreign_consumer_source() {
  $filename <: r"(?:^|.*/)(?:packages|plugins|apps|mods)/.*\.[cm]?[jt]sx?$"
}

predicate require_service_public_consumer_sealing_is_private_service_alias($source) {
  or {
    $source <: r"^[\"']#[^/\"']+-service(?:/[^\"']*)?[\"']$",
    and {
      $source <: template_string(),
      $source <: not contains template_substitution(),
      $source <: r"^`#[^/`]+-service(?:/[^`]*)?`$"
    }
  }
}

predicate require_service_public_consumer_sealing_is_physical_service_tree_source($source) {
  or {
    $source <: r"^[\"'](?:services/|(?:\./|\.\./)+(?:[^/\"']+/)*services/)[^/\"']+/src/service(?:/[^\"']*)?[\"']$",
    and {
      $source <: template_string(),
      $source <: not contains template_substitution(),
      $source <: r"^`(?:services/|(?:\./|\.\./)+(?:[^/`]+/)*services/)[^/`]+/src/service(?:/[^`]*)?`$"
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
  require_service_public_consumer_sealing_is_foreign_consumer_source(),
  or {
    require_service_public_consumer_sealing_is_private_service_alias(source=$source),
    require_service_public_consumer_sealing_is_physical_service_tree_source(source=$source)
  }
}
```

## Matches foreign private aliases

```typescript
// @filename: plugins/cli/topics/game/src/private-control.ts
import { router } from "#civ7-control-service/router";

// @filename: apps/mods/map/swooper-physics/scripts/live/private-control.ts
const control = await import(`#civ7-control-service/impl`);

// @filename: mods/example-controller/src/private-control.ts
export { router } from "#civ7-control-service/router";
```

## Matches physical implementation paths

```typescript
// @filename: packages/studio-server/src/private-control.ts
const control = require("../../../services/civ7-control/src/service/router");

// @filename: apps/mapgen-studio/src/private-control.ts
const contract = require.resolve(`../../../services/civ7-control/src/service/contract`);
```

## Ignores public consumers and owner-local private aliases

```typescript
// @filename: packages/studio-server/src/control.ts
import { createCiv7ControlOrpcServerClient } from "@civ7/control-orpc";

// @filename: services/civ7-control/src/client.ts
import { router } from "#civ7-control-service/router";
```
