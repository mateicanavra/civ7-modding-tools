# Change: Deep Habitat Effect Import Boundaries Direct Provider

## Why

`import-boundaries` is a Habitat structural rule backed by the repo's ESLint
boundary configuration. It was still routed through the inferred Nx
`boundaries` target, which made Habitat call Nx from inside a Habitat check.
That nested path pays project-graph/task-runner overhead for a rule whose real
vendor is ESLint.

Habitat should use Nx at the outer workspace orchestration boundary. Inside a
Habitat structural check, vendor-backed rules should run through their direct
provider/materialization path.

## What Changes

- Stop aliasing the `import-boundaries` rule to the Nx `boundaries` target.
- Let `import-boundaries` execute from its registered command metadata through
  Habitat command materialization.
- Preserve the ESLint boundary cache flags that the old Nx target used.
- Keep the explicit Nx `boundaries` target available as a leaf workspace target.

## Non-Goals

- Do not change boundary taxonomy, ESLint rule semantics, or project tags.
- Do not remove the standalone Nx `boundaries` target.
- Do not rename the source-check/Grit lane in this slice.
- Do not add topology tests for structural enforcement.

## Validation

- `habitat check --rule import-boundaries` should run without nested Nx.
- Workspace graph facts should treat `import-boundaries` as a direct Habitat
  rule.
- The materialized command should include ESLint's content cache flags.
