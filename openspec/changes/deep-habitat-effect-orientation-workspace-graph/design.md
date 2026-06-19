# Design: Orientation Workspace Graph

## Owner

Workspace graph integration domain and Nx provider.

## Target Files

```text
tools/habitat-harness/src/domains/workspace-graph-integration/index.ts
tools/habitat-harness/src/domains/workspace-graph-integration/classify.ts
tools/habitat-harness/src/domains/workspace-graph-integration/routing.ts
tools/habitat-harness/src/domains/workspace-graph-integration/target-plan.ts
tools/habitat-harness/src/providers/nx/graph.ts
tools/habitat-harness/src/providers/nx/targets.ts
tools/habitat-harness/src/lib/classify-core/**              # drained
tools/habitat-harness/src/lib/workspace-graph/**            # drained
tools/habitat-harness/src/lib/workspace-graph.ts            # drained
tools/habitat-harness/src/lib/workspace-graph-contract.ts   # drained
```

## Required State-Space Reductions

- Nx target metadata is a provider fact, not a command router side effect.
- Classify output is a domain projection, not raw Nx output.
- Missing target facts are represented as unavailable facts, not runnable
  commands.

## Stop Conditions

- Orientation code shells out to Nx directly.
- Nx provider embeds classify routing language.
- Classify reports an unresolved target as runnable.
