# Design: Deep Habitat Effect Graph Service Module

## Boundary

`graph` is an owned Habitat read capability. It answers: "what project graph
does Habitat expose to users and downstream tooling?" It does not own Nx command
construction. Nx command construction belongs to `NxProvider`.

## Target Flow

```text
Graph CLI -> Habitat service client -> graph service module -> NxProvider + HabitatFileSystem + scoped temp dir
```

The service creates the ephemeral graph output path through
`acquireTempDirectory`, asks `NxProvider` to run the graph command, reads the
JSON through `HabitatFileSystem`, projects `graph.graph ?? graph`, and returns a
stable command result for CLI rendering.

## Target Files

```text
tools/habitat-harness/src/service/modules/graph/contract.ts
tools/habitat-harness/src/service/modules/graph/module.ts
tools/habitat-harness/src/service/modules/graph/router.ts
tools/habitat-harness/src/service/modules/graph/run.ts
tools/habitat-harness/src/providers/nx/index.ts
tools/habitat-harness/src/resources/filesystem.ts
tools/habitat-harness/src/commands/graph.ts
tools/habitat-harness/test/service/graph-service.test.ts
```

## Public Surface Handling

This slice does not change the root package export list. New CLI behavior must
not call `src/lib/graph.ts`. Public-surface drainage owns deletion or relocation
of that legacy export so the final train has no duplicate active graph path.

## Verification Boundary

Unit tests prove service/module behavior and provider command construction.
They do not prove the real Nx graph contents. Package tests and CLI tests prove
existing output routing remains stable.
