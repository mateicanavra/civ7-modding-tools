---
level: error
tags: [service, boundary, platform]
---
# Require Platform-Independent Service Source

Every service source file describes or executes a semantic capability over
ready inputs. It does not acquire a Node or Bun capability, enter a provider
implementation, or reach into an app or plugin. Qualified app composition
selects providers and passes ready resource values or public clients through
the service's construction face.

This relation owns explicit module loading only. Nx owns project-kind edges,
package exports own public subpaths, and execution proof owns actual lifecycle
and acquisition behavior.

```grit
language js(typescript)

predicate require_service_boundary_platform_independence_is_service_source() {
  $filename <: r".*services/[^/]+/src/.*\.ts$",
  ! $filename <: r".*/(?:test|tests|__tests__)/.*"
}

function require_service_boundary_platform_independence_status($source) js {
  const raw = $source.text;
  const quote = raw[0];
  const last = raw[raw.length - 1];
  const quoted = (quote === '"' || quote === "'") && last === quote;
  const staticTemplate = quote === "`" && last === "`" && !raw.includes("${");
  if (!quoted && !staticTemplate) return "not-literal";
  const source = raw.slice(1, -1);
  if (/^(?:node:|bun:)/.test(source)) return "blocked:platform";
  if (/^(?:\.{1,2}\/)*(?:apps|plugins)(?:\/|$)/.test(source)) {
    return "blocked:host";
  }
  if (/(?:^|\/)providers(?:\/|$)/.test(source)) return "blocked:provider";
  return "ok";
}

or {
  import_statement(source=$source),
  export_statement(source=$source) where { $source <: string() },
  `import($source)`,
  `require($source)`,
  `require.resolve($source)`
} where {
  require_service_boundary_platform_independence_is_service_source(),
  $status = require_service_boundary_platform_independence_status(source=$source),
  $status <: includes "blocked:"
}
```

## Matches a router acquiring Node state

```typescript
// @filename: services/jobs/src/service/modules/catalog/router/list.router.ts
import { readFile } from "node:fs/promises";
```

## Matches a client entering a provider

```typescript
// @filename: services/jobs/src/client.ts
import { acquireLocalQueue } from "@workspace/queue/providers/local";
```

## Ignores ready resource and service capabilities

```typescript
// @filename: services/jobs/src/client.ts
import type { Queue } from "@workspace/queue";
import type { CatalogClient } from "@workspace/catalog";
```
