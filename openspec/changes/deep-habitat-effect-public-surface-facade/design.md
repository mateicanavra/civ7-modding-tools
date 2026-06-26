# Design: Public Surface Facade

## Owner

Public contract boundary.

## Target Files

```text
tools/habitat-harness/src/public/index.ts
tools/habitat-harness/src/public/check-report.ts
tools/habitat-harness/src/public/classify.ts
tools/habitat-harness/src/public/verify.ts
tools/habitat-harness/src/public/generators.ts
tools/habitat-harness/src/index.ts
tools/habitat-harness/src/plugin.ts
tools/habitat-harness/package.json
```

## Classification Table

Every export in `src/index.ts` SHALL be classified before source movement:

- `public-contract`: intentionally supported for package consumers.
- `public-adapter`: explicit public re-export for a moved public contract path.
- `internal-callsite`: repo-local callsite that must import the internal path.
- `test-only`: test import that should use explicit test helpers.
- `dead-code-remove`: no supported callsite remains.

## Stop Conditions

- A live provider Layer, runtime runner, vendor command builder, or test fake is
  exported from the package facade.
- An export remains because an internal module imports through `src/index.ts`.
- A public adapter has no closure action.

## Known Adapter Closure Actions

- Closed in this packet: `src/lib/baseline.ts`, `src/lib/check-report.ts`, and
  `src/lib/diagnostics.ts` were removed. Internal callsites now import owning
  domains directly, and package consumers receive only the `src/public/**`
  facade.

## Implemented Export Classification

- `public-contract`: structural check report DTOs/schemas/rendering,
  classify DTOs/schemas/rendering, verify receipt/base DTOs/schemas/rendering,
  and generator option DTOs exposed through `src/public/**`.
- `internal-callsite`: command orchestration, proof-contract assembly,
  baseline authority, structural execution, rule rendering, and protected-zone
  helpers import owning domains or internal support paths directly.
- `dead-code-remove`: package-root exports for adapter failures, config layers,
  typed Habitat errors, baseline sync helpers, root runtime runner, Git graph
  helpers, verify execution helpers, workspace-tool materialization, provider
  command fakes/results, rule registry helpers, and `HabitatRuntimeLive`.

## Package Metadata

- `exports["."]` remains `./src/index.ts`, which is now a one-line facade over
  `./src/public/index.js`.
- `exports["./public/*"]` exposes intentional public submodules.
- `files` now includes `src` as the source closure for exported TypeScript
  entrypoints instead of enumerating stale internal workspace-graph or
  rule-registry paths.
