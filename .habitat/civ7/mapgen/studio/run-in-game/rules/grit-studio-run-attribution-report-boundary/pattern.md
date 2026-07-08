---
level: error
---
# Grit Studio Run Attribution Report Boundary

Packet 13 keeps Run in Game attribution private. The Studio server runtime
assembles one report from existing operation records and links it through
diagnostics lookup. Public status/current/events remain governed by the closed
public contract rule; this rule guards against attribution assembly or
diagnostics-section wiring drifting outside the private runtime reporting
boundary.

```grit
language js(typescript)

or {
  program(statements=$body) where {
    $filename <: r".*(?:packages/studio-server/src|apps/mapgen-studio/src/server)/.*\.tsx?$",
    not {
      $filename <: r".*packages/studio-server/src/operationRuntime/(?:attributionReport|diagnostics)\.ts$"
    },
    $body <: contains r"\b(?:RunAttributionReport|buildRunAttributionReport|writeRunAttributionReport|RUN_ATTRIBUTION_REPORT_FILE)\b"
  },
  `attribution: $value` where {
    $filename <: r".*(?:packages/studio-server/src|apps/mapgen-studio/src/server)/.*\.tsx?$",
    not {
      $filename <: r".*packages/studio-server/src/operationRuntime/(?:attributionReport|diagnostics)\.ts$"
    }
  }
}
```

## Matches Fixture

```typescript
// @filename: packages/studio-server/src/operationRuntime/projection.ts
import { buildRunAttributionReport } from "./attributionReport";

export function projectRunInGame(operation) {
  return { requestId: operation.requestId, attribution: buildRunAttributionReport(operation) };
}

// @filename: apps/mapgen-studio/src/server/studio/engines.ts
const attribution = { source: "app layer" };
```

## Ignores Fixture

```typescript
// @filename: packages/studio-server/src/operationRuntime/attributionReport.ts
export function buildRunAttributionReport(operation) {
  return operation;
}
export async function writeRunAttributionReport(operation) {
  return { report: buildRunAttributionReport(operation) };
}

// @filename: packages/studio-server/src/operationRuntime/diagnostics.ts
const attribution = await writeRunAttributionReport(operation);
const record = { sections: { attribution: privateJson(attribution), operation } };

// @filename: packages/studio-server/src/operationRuntime/projection.ts
export function projectRunInGame(operation) {
  return { requestId: operation.requestId, diagnosticsId: operation.diagnosticsId };
}
```
