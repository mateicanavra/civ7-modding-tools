# Source Synthesis - Domain Deep Import Tests

## Authority

- `docs/system/libs/mapgen/policies/IMPORTS.md` says tests use public surfaces
  by default and deep imports require focused internal-test intent.
- `docs/projects/engine-refactor-v1/resources/spec/recipe-compile/architecture/03-authoring-patterns.md`
  forbids deep domain op imports from steps, recipes, and tests.
- `docs/projects/engine-refactor-v1/resources/spec/recipe-compile/architecture/06-enforcement.md`
  records test deep imports as exception-only, not the default path.
- `docs/projects/habitat-harness/taxonomy.md` keeps test imports under the same
  structural boundary as runtime unless an owner records an exception.
- The DDI row intentionally leaves external test roots to this sibling row.

## Corpus

Current scan roots are:

- `mods/mod-swooper-maps/test`;
- `packages/*/test`.

The current predicate excludes:

- source under `mods/mod-swooper-maps/src`;
- harness-owned test fixtures under `tools/habitat-harness/test`;
- generated/build outputs such as `dist`, `mod`, and `node_modules`;
- dynamic imports and source strings, which are recorded as context/non-claims.

## Current-Tree Disposition

Before registration, live deep imports in mod tests were remediated:

- ecology type usage moved to the ecology root;
- narrative story helper tests moved to the narrative root or narrative config
  facade;
- the stale hydrology climate test type stopped depending on a missing deep
  domain path and derives its local shape from the public adapter surface.

Parser inventory after remediation found zero forbidden static import or
re-export candidates in the current predicate.

## Adapter Activation Disposition

Native Grit can match DDIT-owned test files, including side-effect imports, when
the file is passed directly to Grit. The current Habitat wrapper selector also
selects `grit-domain-deep-import-tests`, but the shared Grit scan/ignore
configuration still omits the owned mod/package test roots and the injected
mirror path. A broad `.gritignore` removal would activate the probe, but it also
changes scan policy for unrelated test trees and is not part of this row.

DDIT therefore remains blocked on a narrow Habitat Grit adapter scan-root/ignore
activation repair before wrapper/current-tree or injected cleanup proof can be
claimed.

## GritQL Design Notes

The pattern uses documented structural TypeScript snippets:

- `import $imports from $source`;
- `import $source`;
- `export { $exports } from $source`;
- `export * from $source`.

It then applies documented `$filename` and `$source` regex predicates plus
negative source guards for the public `/ops`, `/ops/index.js`, and `/config.js`
surfaces. The `import $imports from $source` snippet is proven with value,
type-only, and namespace import fixtures; `import $source` is proven with a
side-effect import fixture. The row does not use unsupported lookaround regex
or text-only matching.
