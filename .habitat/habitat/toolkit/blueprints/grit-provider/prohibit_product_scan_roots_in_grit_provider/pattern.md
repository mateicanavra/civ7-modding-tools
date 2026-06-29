---
level: error
---
# Prohibit Product Scan Roots In Grit Provider

The Grit provider is a generic tool capability. Repo or product scan roots
belong in registry metadata, not hard-coded provider source.

```grit
language js(typescript)

`$body` where {
  $filename <: r".*tools/habitat/src/providers/grit/.*\.ts$",
  $text = text($body),
  or {
    $text <: includes "packages",
    $text <: includes "apps/",
    $text <: includes "mods/",
    $text <: includes "mods/mod-swooper-maps",
    $text <: includes "apps/mapgen-studio",
    $text <: includes ".civ7"
  }
}
```

## Matches fixture

```typescript
// @filename: tools/habitat/src/providers/grit/constants.ts
export const roots = ["mods/mod-swooper-maps/src/domain"];

// @filename: tools/habitat/src/providers/grit/constants.ts
export const studio = "apps/mapgen-studio/src";

// @filename: tools/habitat/src/providers/grit/constants.ts
export const packages = ["packages"];

// @filename: tools/habitat/src/providers/grit/constants.ts
export const packageRoot = "packages/civ7-adapter";

// @filename: tools/habitat/src/providers/grit/constants.ts
export const resources = ".civ7/outputs/resources";
```

## Ignores fixture

```typescript
// @filename: tools/habitat/src/providers/grit/constants.ts
export const injectedProbeRoot = "tools/habitat/injected-probe-roots";

// @filename: .habitat/habitat/toolkit/blueprints/service-module/example-rule/rule.json
const registryMetadataCanNameProductRoots = "mods/mod-swooper-maps/src/domain";
```
