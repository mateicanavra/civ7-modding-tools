# Design: Check Graph Preflight Drain

## Frame

Habitat uses the workspace graph for planning and routing, but structural-check
execution should not turn every graph-backed rule into two graph operations:
first a preflight graph read, then the provider-owned target execution. That is
the wrong boundary. The provider should run the target and surface failures.

## Ownership

- `domains/structural-check/execution.ts` owns check execution order.
- `providers/nx` owns graph-backed target execution.
- Workspace graph integration remains responsible for classify and verify
  planning, not preflight gating every check command.

## Implementation

Remove `graphDependencyRefusals` from structural-check execution. Command rules
still derive graph-backed status from registry facts, and graph-backed command
rules still execute through `NxProvider`. If the target is unavailable, the
provider execution path returns the failure as a rule diagnostic.

## Risks

- Missing graph targets now fail through provider execution instead of the
  previous dependency-refused diagnostic. That is acceptable for check execution
  because the provider owns the executable target boundary.
- Verify/classify graph planning is intentionally untouched.
