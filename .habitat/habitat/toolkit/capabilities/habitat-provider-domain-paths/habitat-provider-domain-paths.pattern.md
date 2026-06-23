---
level: error
---
# Habitat Grit Provider Domain Paths

The Grit provider is a generic tool capability. Repo or product scan roots
belong in registry metadata, not hard-coded provider source.

```grit
language js(typescript)

`$body` where {
  $filename <: r".*tools/habitat-harness/src/service/runtime/grit/.*\.ts$",
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
// @filename: tools/habitat-harness/src/service/runtime/grit/constants.ts
export const roots = ["mods/mod-swooper-maps/src/domain"];

// @filename: tools/habitat-harness/src/service/runtime/grit/constants.ts
export const studio = "apps/mapgen-studio/src";

// @filename: tools/habitat-harness/src/service/runtime/grit/constants.ts
export const packages = ["packages"];

// @filename: tools/habitat-harness/src/service/runtime/grit/constants.ts
export const packageRoot = "packages/civ7-adapter";

// @filename: tools/habitat-harness/src/service/runtime/grit/constants.ts
export const resources = ".civ7/outputs/resources";
```

## Ignores fixture

```typescript
// @filename: tools/habitat-harness/src/service/runtime/grit/constants.ts
export const injectedProbeRoot = "tools/habitat-harness/injected-probe-roots";

// @filename: .habitat/habitat/toolkit/contracts/example-rule/example-rule.rule.json
const registryMetadataCanNameProductRoots = "mods/mod-swooper-maps/src/domain";
```
