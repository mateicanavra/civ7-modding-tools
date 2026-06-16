## Design

The row uses native Grit over TypeScript to detect static test imports and
re-exports from non-public `@mapgen/domain/<domain>/...` subpaths.

Current predicate:

- `mods/mod-swooper-maps/test/**/*.{ts,tsx}`;
- `packages/*/test/**/*.{ts,tsx}`;
- static import declarations, including import-from and side-effect imports,
  plus `export { ... } from` and `export * from` declarations whose source
  starts with `@mapgen/domain/<domain>/`;
- allowed public controls are exact domain root, `/ops`, `/ops/index.js`, and
  `/config.js`.

The predicate intentionally does not claim dynamic imports or source strings.
Those are parser-inventory context and fixture controls until a separate row
proves that source class.

## Fixture Matrix

Positive fixtures:

- value imports from `rules`, `strategies`, `ops/<tail>`, and `types.js`;
- type-only imports from deep strategy paths;
- namespace imports from deep rule paths;
- side-effect imports from deep rule paths;
- named re-exports from deep rule paths;
- export-star from deep narrative paths;
- both mod test and package test filename roots.

Controls:

- domain root imports;
- public `/ops` and `/ops/index.js` imports;
- public `/config.js` imports;
- recipe source paths, harness test paths, source strings, and dynamic imports.

## Source Remediation

Current live test imports were repaired instead of baselined:

- ecology tests now import `BIOME_SYMBOL_TO_INDEX` from the ecology root;
- narrative story tests now import story helper values from the narrative root
  and config from `@mapgen/domain/narrative/config.js`;
- narrative root exports named gameplay/story helpers explicitly, avoiding
  broad `export *` root facades;
- the stale hydrology climate test type now derives its local test shape from
  the public `EngineAdapter` surface instead of a missing deep domain path.

## Non-Claims

- Dynamic import closure is not proven.
- Source-string closure is not proven.
- Raw direct Grit acquisition remains unclaimed.
- Habitat wrapper/current-tree projection over the owned test roots is not
  proven under the current shared Grit scan configuration because the wrapper
  selector reports the registered row but shared test ignores keep the row's
  test roots and injected mirrors out of the projected Grit corpus.
- Injected violation cleanup/path-control proof is not proven until that
  adapter activation repair exists.
- Package export-map and publish-surface closure are not proven.
- Apply safety is not claimed.
- Classify/generator behavior is not claimed.
- Broader domain-refactor closure and product/runtime proof are not claimed.
