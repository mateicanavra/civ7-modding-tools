---
level: error
---
# Preserve Civ7 SDK Runtime Neutrality

The SDK authors portable mod data and files. Civ7 map-script execution belongs
to the deployable map application rather than a runtime-bound SDK subpath.

```grit
language js(typescript)

predicate preserve_civ7_sdk_runtime_neutrality_is_source() {
  $filename <: r".*packages/sdk/src/.*\.ts$"
}

function preserve_civ7_sdk_runtime_neutrality_status($source) js {
  const raw = $source.text;
  const quote = raw[0];
  const last = raw[raw.length - 1];
  const quoted = (quote === '"' || quote === "'") && last === quote;
  const staticTemplate = quote === "`" && last === "`" && !raw.includes("${");
  if (!quoted && !staticTemplate) return "ok:dynamic";

  const source = raw.slice(1, -1);
  if (/^(?:\.\.?\/)+mapgen(?:\/|$)/.test(source)) return "blocked:mapgen";
  if (/^@civ7\/(?:adapter|api|types)(?:\/|$)/.test(source)) return "blocked:civ7";
  if (/^@swooper\/(?:mapgen-core|swooper-physics)(?:\/|$)/.test(source)) {
    return "blocked:swooper";
  }
  if (/^\/base-standard\//.test(source)) return "blocked:official-runtime";
  return "ok:portable";
}

or {
  import_statement(source=$source),
  export_statement(source=$source) where { $source <: string() },
  `import($source)`,
  `require($source)`,
  `require.resolve($source)`
} where {
  preserve_civ7_sdk_runtime_neutrality_is_source(),
  $status = preserve_civ7_sdk_runtime_neutrality_status(source=$source),
  $status <: includes "blocked:"
}
```

## Matches fixture

```typescript
// @filename: packages/sdk/src/index.ts
export * from "./mapgen";

// @filename: packages/sdk/src/runtime/adapter.ts
import { MockAdapter } from "@civ7/adapter";

// @filename: packages/sdk/src/runtime/api.ts
export type { catalog } from "@civ7/api";

// @filename: packages/sdk/src/runtime/types.ts
import "@civ7/types";

// @filename: packages/sdk/src/runtime/core.ts
const core = await import("@swooper/mapgen-core");

// @filename: packages/sdk/src/runtime/native.ts
export * from "/base-standard/maps/map-globals.js";
```

## Ignores fixture

```typescript
// @filename: packages/sdk/src/index.ts
export * from "./builders";

// @filename: packages/sdk/src/builders/mod.ts
import { join } from "node:path";

// @filename: packages/sdk/test/runtime.test.ts
import { MockAdapter } from "@civ7/adapter";
```
