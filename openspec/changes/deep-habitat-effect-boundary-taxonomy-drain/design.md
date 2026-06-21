# Design: Boundary Taxonomy Drain

## Ownership

Boundary enforcement has two different concerns:

- **Import-edge legality:** owned by the `boundaries` Nx target using
  `@nx/enforce-module-boundaries` and `eslint.boundaries.config.mjs`.
- **Taxonomy drift validation:** owned by the new
  `@internal/habitat-harness:validate:boundary-taxonomy` target, which checks
  taxonomy rows, package manifests, resolved Nx project metadata, boundary
  config constraints, and current graph edges. The target is declared by the
  Habitat package manifest and consumed by root check plus Habitat
  verify/pre-push planning.

The unit suite owns only the pure model: markdown parsing, config extraction,
constraint matching, and audit behavior against fixtures.

## Target Shape

The new target runs:

```bash
bun run --cwd tools/habitat-harness validate:boundary-taxonomy
```

The target is cacheable and declares inputs that affect the audit:

- taxonomy markdown;
- boundary ESLint config;
- root Nx/package-manager config;
- package manifests and project metadata;
- import-bearing source files that affect the Nx project graph.

## Test Shape

`boundary-taxonomy.test.ts` must not call `createProjectGraphAsync` or otherwise
resolve the live workspace graph. It can still exercise graph-edge diagnostics
through bounded fake graph edges.

## Boundary

This slice does not change the rule registry or public Habitat check semantics.
It removes a slow topology assertion from package tests and gives that assertion
an explicit graph-owned command path that normal validation workflows consume.
