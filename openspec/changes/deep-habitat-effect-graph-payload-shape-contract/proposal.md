# Change: Deep Habitat Effect Graph Payload Shape Contract

## Why

The graph service still preserved a legacy nullish projection path:
`payload.graph ?? payload`. That allowed a malformed Nx graph file with
`graph: null` to be rendered as if the raw payload were valid graph data.

Habitat should not preserve fallback shapes at provider/service boundaries.
The graph service should project valid Nx graph payloads and reject malformed
ones through the service error channel.

## What Changes

- Require `graph` to be a non-null object when an Nx graph payload includes a
  `graph` property.
- Remove the nullish fallback to the raw payload.
- Update graph service tests to assert malformed graph payloads fail.

## Non-Goals

- Do not change successful `habitat graph --json` output for current Nx graph
  files.
- Do not change `NxProvider.graph` command execution.
- Do not reintroduce the deleted raw graph helper.
