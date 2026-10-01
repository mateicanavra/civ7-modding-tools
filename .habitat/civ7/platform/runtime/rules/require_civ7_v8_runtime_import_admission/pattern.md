---
level: error
---
# Require Civ7 V8 Runtime Import Admission

Tagged production source admits only project-local `./` imports. Generated
declaration shards may additionally name exact official virtual modules and the
version-pinned Solid declaration surface proven by the installed Civ7 corpus.

```grit
language js(typescript)

predicate require_civ7_v8_runtime_import_admission_is_source() {
  $filename <: r".*packages/civ7-api/src/.*\.ts$"
}

function require_civ7_v8_runtime_import_admission_status($filename, $source) js {
  const filename = $filename.text.replace(/\\/g, "/");
  const raw = $source.text;
  const quote = raw[0];
  const last = raw[raw.length - 1];
  const quoted = (quote === '"' || quote === "'") && last === quote;
  const staticTemplate = quote === "`" && last === "`" && !raw.includes("${");
  if (!quoted && !staticTemplate) return "blocked:dynamic";

  const source = raw.slice(1, -1);
  if (source.startsWith("./")) return "ok:local";
  if (
    filename.endsWith(".d.ts") &&
    (
      /^\/(?:age-antiquity|age-exploration|age-modern|base-standard|core)\/.+/.test(source) ||
      /^(?:solid-js|solid-js\/jsx-runtime)$/.test(source)
    )
  ) {
    return "ok:declaration";
  }
  return "blocked:outside";
}

or {
  import_statement(source=$source),
  export_statement(source=$source) where { $source <: string() },
  `import($source)`,
  `require($source)`,
  `require.resolve($source)`
} where {
  require_civ7_v8_runtime_import_admission_is_source(),
  $status = require_civ7_v8_runtime_import_admission_status(
    filename=$filename,
    source=$source
  ),
  $status <: includes "blocked:"
}
```

## Matches fixture

```typescript
// @filename: packages/civ7-api/src/node.ts
import "node:fs";

// @filename: packages/civ7-api/src/bun.ts
import "bun:sqlite";

// @filename: packages/civ7-api/src/npm.ts
import "typebox";

// @filename: packages/civ7-api/src/host.ts
import "../test/host.js";

// @filename: packages/civ7-api/src/reexport.ts
export * from "@civ7/map-policy";

// @filename: packages/civ7-api/src/dynamic.ts
void import("node:fs");

// @filename: packages/civ7-api/src/generated/modules/wrong.d.ts
import type { Value } from "typebox";
```

## Ignores fixture

```typescript
// @filename: packages/civ7-api/src/index.ts
export { catalog } from "./catalog.js";

// @filename: packages/civ7-api/src/generated/modules/core.d.ts
import type { JSX } from "solid-js";
import type { Input } from "/core/ui/input/input-support.js";

// @filename: packages/civ7-api/src/generated/modules/base.d.ts
export type { MapLike } from "/base-standard/maps/map-globals.js";

// @filename: packages/other/src/node.ts
import "node:fs";
```
