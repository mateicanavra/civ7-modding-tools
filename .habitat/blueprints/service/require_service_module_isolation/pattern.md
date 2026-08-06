---
level: error
tags: [service, module, ownership]
---
# Require Service Module Isolation

Service roots compose module contract and router faces. A module owns its
entire implementation interior and never enters a sibling. Another service
consumes only the public client, never a private relative path or internal
service alias. Import and require sources are literal so the boundary remains
inspectable. Module wiring may reach the local implementation spine; other
module source may use service-root model facts but not root contract/router
execution.

This rule reasons from normalized paths rather than enumerating directory
depths. It does not select an oRPC builder, middleware API, or Effect bridge.

```grit
language js(typescript)

function require_service_module_isolation_status($filename, $source) js {
  const filename = $filename.text.replace(/\\/g, "/");
  const ownerMatch = filename.match(/(?:^|\/)services\/([^/]+)\/src\//);
  if (!ownerMatch) return "outside";
  const owner = ownerMatch[1];
  const moduleMatch = filename.match(
    /(?:^|\/)services\/[^/]+\/src\/service\/modules\/([^/]+)\//
  );
  const importerModule = moduleMatch ? moduleMatch[1] : null;
  const raw = $source.text;
  const quote = raw[0];
  const last = raw[raw.length - 1];
  const quoted = (quote === '"' || quote === "'") && last === quote;
  const staticTemplate = quote === "`" && last === "`" && !raw.includes("${");
  if (!quoted && !staticTemplate) return "blocked:computed-source";
  const source = raw.slice(1, -1);

  const alias = source.match(/^#([^/]+)-service\/(.+)$/);
  let target;
  if (alias) {
    if (alias[1] !== owner) return "blocked:private-service";
    target = `services/${owner}/src/service/${alias[2]}`;
  } else {
    if (!source.startsWith(".")) return "external";
    const parts = filename.split("/");
    parts.pop();
    for (const part of source.split("/")) {
      if (!part || part === ".") continue;
      if (part === "..") parts.pop();
      else parts.push(part);
    }
    target = parts.join("/");
  }
  target = target.replace(/\.(?:[cm]?[jt]s)$/, "");
  const targetService = target.match(
    /(?:^|\/)services\/([^/]+)\/src\/service(?:\/|$)/
  );
  if (!targetService) return "ok";
  if (targetService[1] !== owner) return "blocked:private-service";

  const targetModule = target.match(/\/src\/service\/modules\/([^/]+)(?:\/|$)/);
  if (importerModule && targetModule && targetModule[1] !== importerModule) {
    return "blocked:sibling";
  }

  if (importerModule && /\/src\/service\/(?:contract|router)$/.test(target)) {
    return "blocked:root-execution";
  }
  if (importerModule && /\/src\/service\/(?:base|impl)$/.test(target)) {
    const wiring = /\/module\.ts$/.test(filename) || /\/middleware\/[^/]+\.ts$/.test(filename);
    if (!wiring) return "blocked:root-wiring";
  }

  if (!importerModule && targetModule) {
    const contractComposer = /\/src\/service\/contract\.ts$/.test(filename) &&
      /\/contract(?:\/index)?$/.test(target);
    const routerComposer = /\/src\/service\/router\.ts$/.test(filename) &&
      /\/router$/.test(target);
    const contextPort = /\/src\/service\/base\.ts$/.test(filename) &&
      /\/model\/ports\/[^/]+$/.test(target);
    if (!contractComposer && !routerComposer && !contextPort) {
      return "blocked:root-enters-module";
    }
  }

  return "ok";
}

or {
  import_statement(source=$source),
  export_statement(source=$source) where { $source <: string() },
  `import($source)`,
  `require($source)`,
  `require.resolve($source)`
} where {
  $filename <: r".*services/[^/]+/src/.*\.ts$",
  $status = require_service_module_isolation_status(
    filename=$filename,
    source=$source
  ),
  $status <: includes "blocked:"
}
```

## Matches a sibling module import

```typescript
// @filename: services/jobs/src/service/modules/catalog/router/find.router.ts
import { retry } from "../../queue/model/policy/retry";
```

## Matches another service's private alias

```typescript
// @filename: services/jobs/src/service/modules/catalog/router/find.router.ts
import { router } from "#control-service/router";
```

## Matches a computed module source

```typescript
// @filename: services/jobs/src/service/modules/catalog/router/find.router.ts
const dependency = await import(moduleSpecifier);
```

## Matches root entry into module implementation

```typescript
// @filename: services/jobs/src/service/model/policy/catalog.ts
import { runFind } from "../../modules/catalog/router/find.router";
```

## Ignores lawful composition and local collaboration

```typescript
// @filename: services/jobs/src/service/contract.ts
import { contract as catalog } from "./modules/catalog/contract";
// @filename: services/jobs/src/service/router.ts
import { router as catalog } from "./modules/catalog/router";
// @filename: services/jobs/src/service/modules/catalog/module.ts
import { implementation } from "../../impl";
// @filename: services/jobs/src/service/modules/catalog/router/find.router.ts
import { admission } from "../model/policy/admission";
```
