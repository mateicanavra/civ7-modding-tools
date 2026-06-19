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
