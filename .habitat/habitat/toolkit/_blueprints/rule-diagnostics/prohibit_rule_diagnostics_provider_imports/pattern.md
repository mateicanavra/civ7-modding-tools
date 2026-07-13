---
level: error
---
# Prohibit Rule Diagnostics Provider Imports

Production consumers use the stable RuleDiagnostics and RuleFixPlanning
capabilities. Concrete Grit construction stays inside the provider tree and
the explicit runtime composition root.

```grit
language js(typescript)

or {
  import_statement(source=$source) where {
    $filename <: r".*tools/habitat/src/.*\.ts$",
    not { $filename <: r".*tools/habitat/src/resources/rule-diagnostics/providers/grit/.*\.ts$" },
    not {
      $filename <: r".*tools/habitat/src/runtime/layers\.ts$",
      $source <: r"^[\"']@habitat/cli/resources/rule-diagnostics/providers/grit/provider[\"']$"
    },
    $source <: r"^[\"'](?:.*/)?providers/grit(?:/.*)?[\"']$"
  },
  `export { $exports } from $source` where {
    $filename <: r".*tools/habitat/src/.*\.ts$",
    not { $filename <: r".*tools/habitat/src/resources/rule-diagnostics/providers/grit/.*\.ts$" },
    $source <: r"^[\"'](?:.*/)?providers/grit(?:/.*)?[\"']$"
  },
  `export * from $source` where {
    $filename <: r".*tools/habitat/src/.*\.ts$",
    not { $filename <: r".*tools/habitat/src/resources/rule-diagnostics/providers/grit/.*\.ts$" },
    $source <: r"^[\"'](?:.*/)?providers/grit(?:/.*)?[\"']$"
  },
  `import($source)` where {
    $filename <: r".*tools/habitat/src/.*\.ts$",
    not { $filename <: r".*tools/habitat/src/resources/rule-diagnostics/providers/grit/.*\.ts$" },
    $source <: r"^[\"'](?:.*/)?providers/grit(?:/.*)?[\"']$"
  }
}
```

## Matches fixture

```typescript
// @filename: tools/habitat/src/service/consumer.ts
import { makeGritCommandService } from "@habitat/cli/resources/rule-diagnostics/providers/grit/index";

// @filename: tools/habitat/src/service/type-consumer.ts
import type { GritCommandService } from "../resources/rule-diagnostics/providers/grit/index.js";

// @filename: tools/habitat/src/resources/rule-diagnostics/consumer.ts
import { makeGritCommandService } from "./providers/grit/index.js";

// @filename: tools/habitat/src/service/side-effect.ts
import "../resources/rule-diagnostics/providers/grit/index.js";

// @filename: tools/habitat/src/service/reexport.ts
export { makeGritCommandService } from "../resources/rule-diagnostics/providers/grit/index.js";

// @filename: tools/habitat/src/service/star-reexport.ts
export * from "../resources/rule-diagnostics/providers/grit/index.js";

// @filename: tools/habitat/src/service/dynamic-consumer.ts
export async function loadProvider() {
  return import("../resources/rule-diagnostics/providers/grit/provider.js");
}

// @filename: tools/habitat/src/service/inline-type-consumer.ts
export type ProviderModule = typeof import("../resources/rule-diagnostics/providers/grit/provider.js");

// @filename: tools/habitat/src/runtime/layers.ts
import { makeRuleDiagnosticsService } from "@habitat/cli/resources/rule-diagnostics/providers/grit/service";

// @filename: tools/habitat/src/runtime/service-context.ts
import { makeGritRuleFixPlanningLayer } from "@habitat/cli/resources/rule-diagnostics/providers/grit/provider";
```

## Ignores fixture

```typescript
// @filename: tools/habitat/src/runtime/layers.ts
import {
  makeGritRuleDiagnosticsLayer,
  makeGritRuleFixPlanningLayer,
} from "@habitat/cli/resources/rule-diagnostics/providers/grit/provider";

// @filename: tools/habitat/src/runtime/service-context.ts
import { RuleFixPlanning } from "@habitat/cli/resources/rule-fix-planning/index";

// @filename: tools/habitat/src/service/base.ts
import type { RuleFixPlanningService } from "@habitat/cli/resources/rule-fix-planning/index";

// @filename: tools/habitat/test/provider.test.ts
import { makeGritCommandService } from "../src/resources/rule-diagnostics/providers/grit/index.js";

// @filename: tools/habitat/src/service/consumer.ts
import { RuleDiagnostics } from "@habitat/cli/resources/rule-diagnostics/index";
```
