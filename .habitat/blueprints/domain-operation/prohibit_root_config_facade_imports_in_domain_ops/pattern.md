---
level: error
---
# Prohibit Root Config Facade Imports In Domain Ops

Domain ops do not import domain-root config facades through parent traversal
or package aliases.

```grit
language js(typescript)

or {
  import_statement(source=$source) where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/.*/ops/.*\.ts$",
    $source <: r"^[\"']?(?:(?:\.\./){2,}config\.js|@mapgen/domain(?:/[^/]+)?/config\.js)[\"']?$"
  },
  `export { $exports } from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/.*/ops/.*\.ts$",
    $source <: r"^[\"']?(?:(?:\.\./){2,}config\.js|@mapgen/domain(?:/[^/]+)?/config\.js)[\"']?$"
  },
  `export * from $source` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/.*/ops/.*\.ts$",
    $source <: r"^[\"']?(?:(?:\.\./){2,}config\.js|@mapgen/domain(?:/[^/]+)?/config\.js)[\"']?$"
  },
  `import($source)` where {
    $filename <: r".*mods/mod-swooper-maps/src/domain/.*/ops/.*\.ts$",
    $source <: r"^[\"']?(?:(?:\.\./){2,}config\.js|@mapgen/domain(?:/[^/]+)?/config\.js)[\"']?$"
  }
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
import config from "../../config.js";

export const value = config;

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
import config from "../../../config.js";

export const value = config;

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
import config from "../../../../config.js";

export const value = config;

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
import config from "../../../../../config.js";

export const value = config;

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
import config from "../../../../../../config.js";

export const value = config;

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
import { config } from "../../config.js";

export const value = config;

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
import config from '../../config.js';

export const value = config;

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
import * as config from "../../../config.js";

export const value = config;

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
import type { DomainConfig } from "../../config.js";

export type Value = DomainConfig;

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
import "../../config.js";

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
export { config } from "../../config.js";

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
export * from "../../config.js";

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
export async function loadConfig() {
  return import("../../config.js");
}

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/demo/contract.ts
import { config } from "@mapgen/domain/config.js";

export const value = config;

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/demo/contract.ts
import type { FoundationConfig } from "@mapgen/domain/foundation/config.js";

export type Value = FoundationConfig;

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/demo/contract.ts
import * as foundationConfig from "@mapgen/domain/foundation/config.js";

export const value = foundationConfig;

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/demo/contract.ts
export * from "@mapgen/domain/foundation/config.js";

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/demo/contract.ts
export async function loadConfig() {
  return import("@mapgen/domain/config.js");
}
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
import config from "./config.js";

export const value = config;

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
import config from "../config.js";

export const value = config;

// @filename: mods/mod-swooper-maps/src/domain/ecology/lib/demo.ts
import config from "../../config.js";

export const value = config;

// @filename: mods/other-mod/src/domain/ecology/ops/demo/index.ts
import config from "../../config.js";

export const value = config;

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.tsx
import config from "../../config.js";

export const value = config;

// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/demo.ts
import config from "../../config.js";

export const value = config;

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
import config from "../../config";

export const value = config;

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
import config from "../../config.json";

export const value = config;

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
export { config } from "../config.js";

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
await import("../config.js");

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
await import("../../config.json");

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
const source = "../../config.js";

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/demo/contract.ts
import config from "@mapgen/domain/foundation/ops/demo/config.js";

export const value = config;

// @filename: mods/mod-swooper-maps/src/domain/foundation/ops/demo/contract.ts
import { createOp } from "@mapgen/domain/foundation/ops";

export const value = createOp;
```
