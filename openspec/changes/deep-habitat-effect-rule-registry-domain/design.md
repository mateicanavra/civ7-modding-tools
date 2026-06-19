# Design: Rule Registry Domain

## Owner

Rule registry and rule selection domains.

## Target Files

```text
tools/habitat-harness/src/domains/rule-registry/index.ts
tools/habitat-harness/src/domains/rule-registry/schema.ts
tools/habitat-harness/src/domains/rule-registry/load.ts
tools/habitat-harness/src/domains/rule-registry/facts.ts
tools/habitat-harness/src/domains/rule-registry/graph-facts.ts
tools/habitat-harness/src/domains/rule-selection/index.ts
tools/habitat-harness/src/domains/rule-selection/selectors.ts
tools/habitat-harness/src/domains/rule-selection/errors.ts
tools/habitat-harness/src/rules/registry/**        # drained by this packet
tools/habitat-harness/src/rules/facts.ts           # drained by this packet
```

## Required State-Space Reductions

- Registry load errors become tagged domain errors.
- Filesystem reads use `HabitatFileSystem` and `HabitatConfig`.
- `ownerTool` is not the internal authority model; registry facts distinguish
  domain authority, provider capability, and render-facing labels.

## Stop Conditions

- Registry code reads from `node:fs` directly after closure.
- Selection logic imports provider implementations.
- Public barrels export registry internals as package API.
