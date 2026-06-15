---
level: error
---
# Domain Ops Root Config

Domain ops do not import domain-root config facades through parent traversal.

```grit
language js(typescript)

`import $imports from $source` where {
  $filename <: r".*mods/mod-swooper-maps/src/domain/.*/ops/.*\.ts$",
  $source <: r".*(?:\.\./){2,}config\.js[\"']"
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
export { config } from "../../config.js";

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
await import("../../config.js");

// @filename: mods/mod-swooper-maps/src/domain/ecology/ops/demo/index.ts
const source = "../../config.js";
```
