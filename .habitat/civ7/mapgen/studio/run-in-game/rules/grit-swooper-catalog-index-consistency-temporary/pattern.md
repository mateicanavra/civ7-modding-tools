---
level: error
---
# Grit Swooper Catalog Index Wiring Anchors Temporary

Packet 4 introduces `CatalogSourceIndex` before catalog generation is cut over
to consume it. The semantic equality assertion is behavioral, not structural:
`mods/mod-swooper-maps/test/config/catalog-source-index.test.ts` compares the
source index paths against the current default generation discovery set. This
temporary Habitat-owned advisory guards only the transitional anchors around
that proof: the index file, reader/validator entry points, equality-test anchor,
and transient `studio-current` exclusion. It must not become a second catalog
authority or a hardcoded membership list.

The ignores fixture intentionally demonstrates anchor presence only. Remove
this rule after `swooper-catalog-index-cutover` registers SA-09
`nx-swooper-catalog-index-target-topology`.

```grit
language js(typescript)

or {
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/src/maps/catalog/sourceIndex\.ts$",
    ! $body <: contains `export const CatalogSourceIndex = $entries as const satisfies readonly CatalogSourceEntry[]`
  },
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/src/maps/catalog/sourceIndex\.ts$",
    ! $body <: contains `function catalogSource($args) { $body }`
  },
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/src/maps/catalog/sources\.ts$",
    ! $body <: contains `export function readCatalogSourceIndex($args) { $body }`
  },
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/src/maps/catalog/sources\.ts$",
    ! $body <: contains `export function parseCatalogSourceIndex($args) { $body }`
  },
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/src/maps/catalog/sources\.ts$",
    ! $body <: contains `export function validateCatalogSourceIndex($args) { $body }`
  },
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/scripts/generate-map-artifacts\.ts$",
    ! $body <: contains `const transientStudioCurrentConfig = "studio-current.config.json"`
  },
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/scripts/generate-map-artifacts\.ts$",
    ! $body <: contains `const includeTransientStudioCurrent = process.env.SWOOPER_INCLUDE_STUDIO_CURRENT === "1"`
  },
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/scripts/generate-map-artifacts\.ts$",
    ! $body <: contains `if (!includeTransientStudioCurrent && entry.name === transientStudioCurrentConfig) continue`
  },
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/test/config/catalog-source-index\.test\.ts$",
    ! $body <: contains `expect(indexPaths).toEqual(expectedPaths)`
  },
  program(statements=$body) where {
    $filename <: r".*mods/mod-swooper-maps/test/config/catalog-source-index\.test\.ts$",
    ! $body <: contains `currentDefaultGenerationConfigPaths`
  },
  `catalogSourceId: "studio-current"` where {
    $filename <: r".*mods/mod-swooper-maps/src/maps/catalog/sourceIndex\.ts$"
  },
  `configPath: "mods/mod-swooper-maps/src/maps/configs/studio-current.config.json"` where {
    $filename <: r".*mods/mod-swooper-maps/src/maps/catalog/sourceIndex\.ts$"
  }
}
```

## Matches Fixture

```typescript
// @filename: mods/mod-swooper-maps/src/maps/catalog/sourceIndex.ts
export const CatalogSourceIndex = [];

// @filename: mods/mod-swooper-maps/src/maps/catalog/sources.ts
export function readCatalogSourceIndex() {}

// @filename: mods/mod-swooper-maps/scripts/generate-map-artifacts.ts
async function loadRegistry() {}

// @filename: mods/mod-swooper-maps/test/config/catalog-source-index.test.ts
it("checks something nearby", () => {});
```

## Ignores Fixture

```typescript
// @filename: mods/mod-swooper-maps/src/maps/catalog/sourceIndex.ts
export const CatalogSourceIndex = [
  catalogSource({
    catalogSourceId: "swooper-earthlike",
    configPath: "mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json",
  }),
] as const satisfies readonly CatalogSourceEntry[];

// @filename: mods/mod-swooper-maps/src/maps/catalog/sources.ts
export function readCatalogSourceIndex(options) {
  return parseCatalogSourceIndex(CatalogSourceIndex, options).entries;
}
export function parseCatalogSourceIndex(value, options = {}) {
  return { ok: true, entries: value };
}
export function validateCatalogSourceIndex(value, options = {}) {
  return [];
}

// @filename: mods/mod-swooper-maps/scripts/generate-map-artifacts.ts
const transientStudioCurrentConfig = "studio-current.config.json";
const includeTransientStudioCurrent = process.env.SWOOPER_INCLUDE_STUDIO_CURRENT === "1";
for (const entry of entries) {
  if (!includeTransientStudioCurrent && entry.name === transientStudioCurrentConfig) continue;
}

// @filename: mods/mod-swooper-maps/test/config/catalog-source-index.test.ts
function currentDefaultGenerationConfigPaths() {}
it("matches the current default catalog generation source set", () => {
  expect(indexPaths).toEqual(expectedPaths);
});
```
