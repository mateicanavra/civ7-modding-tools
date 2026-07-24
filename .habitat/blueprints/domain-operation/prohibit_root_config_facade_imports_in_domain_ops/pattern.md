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
// @filename: mods/mod-swooper-maps/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
import config from "../../config.js";

export const value = config;

// @filename: mods/mod-swooper-maps/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
import config from "../../../config.js";

export const value = config;

// @filename: mods/mod-swooper-maps/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
import config from "../../../../config.js";

export const value = config;

// @filename: mods/mod-swooper-maps/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
import config from "../../../../../config.js";

export const value = config;

// @filename: mods/mod-swooper-maps/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
import config from "../../../../../../config.js";

export const value = config;

// @filename: mods/mod-swooper-maps/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
import { config } from "../../config.js";

export const value = config;

// @filename: mods/mod-swooper-maps/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
import config from '../../config.js';

export const value = config;

// @filename: mods/mod-swooper-maps/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
import * as config from "../../../config.js";

export const value = config;

// @filename: mods/mod-swooper-maps/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
import type { DomainConfig } from "../../config.js";

export type Value = DomainConfig;

// @filename: mods/mod-swooper-maps/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
import "../../config.js";

// @filename: mods/mod-swooper-maps/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
export { config } from "../../config.js";

// @filename: mods/mod-swooper-maps/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
export * from "../../config.js";

// @filename: mods/mod-swooper-maps/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
export async function loadConfig() {
  return import("../../config.js");
}

// @filename: mods/mod-swooper-maps/src/domain/world/modules/geology/ops/estimate-crust/contract.ts
import { config } from "@mapgen/domain/config.js";

export const value = config;

// @filename: mods/mod-swooper-maps/src/domain/world/modules/geology/ops/estimate-crust/contract.ts
import type { WorldConfig } from "@mapgen/domain/world/config.js";

export type Value = WorldConfig;

// @filename: mods/mod-swooper-maps/src/domain/world/modules/geology/ops/estimate-crust/contract.ts
import * as worldConfig from "@mapgen/domain/world/config.js";

export const value = worldConfig;

// @filename: mods/mod-swooper-maps/src/domain/world/modules/geology/ops/estimate-crust/contract.ts
export * from "@mapgen/domain/world/config.js";

// @filename: mods/mod-swooper-maps/src/domain/world/modules/geology/ops/estimate-crust/contract.ts
export async function loadConfig() {
  return import("@mapgen/domain/config.js");
}
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
import config from "./config.js";

export const value = config;

// @filename: mods/mod-swooper-maps/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
import config from "../config.js";

export const value = config;

// @filename: mods/mod-swooper-maps/src/domain/world/model/policy/habitat.ts
import config from "../../config.js";

export const value = config;

// @filename: mods/other-mod/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
import config from "../../config.js";

export const value = config;

// @filename: mods/mod-swooper-maps/src/domain/world/modules/biosphere/ops/estimate-habitat/index.tsx
import config from "../../config.js";

export const value = config;

// @filename: mods/mod-swooper-maps/src/recipes/example/stages/biosphere/steps/estimate-habitat/step.ts
import config from "../../config.js";

export const value = config;

// @filename: mods/mod-swooper-maps/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
import config from "../../config";

export const value = config;

// @filename: mods/mod-swooper-maps/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
import config from "../../config.json";

export const value = config;

// @filename: mods/mod-swooper-maps/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
export { config } from "../config.js";

// @filename: mods/mod-swooper-maps/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
await import("../config.js");

// @filename: mods/mod-swooper-maps/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
await import("../../config.json");

// @filename: mods/mod-swooper-maps/src/domain/world/modules/biosphere/ops/estimate-habitat/index.ts
const source = "../../config.js";

// @filename: mods/mod-swooper-maps/src/domain/world/modules/geology/ops/estimate-crust/contract.ts
import config from "@mapgen/domain/world/modules/geology/ops/estimate-crust/config.js";

export const value = config;

// @filename: mods/mod-swooper-maps/src/domain/world/modules/geology/ops/estimate-crust/contract.ts
import { createOp } from "@mapgen/domain/world/modules/geology/ops";

export const value = createOp;
```
