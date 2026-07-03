# Change: Deep Habitat Effect Graph Service Module

## Why

`habitat graph` still behaves like a script: the CLI calls `src/lib/graph`,
which creates temp files, shells through the legacy spawn path, reads JSON from
disk, and renders output directly. Habitat graph/orientation is an owned
capability and should sit behind the Effect-oRPC service surface while Nx
command execution stays provider-owned.

## What Changes

- Add a `graph` Habitat service module.
- Route `habitat graph` through the in-process Habitat service client.
- Add an Nx provider graph command for `target-check graph --file <path>`.
- Use Effect-managed temp directory acquisition and Habitat filesystem reads
  for graph JSON materialization.
- Extend service architecture guard tests so `graph` follows the same module
  topology as `check` and `verify`.

## What Does Not Change

- No public graph JSON output contract change.
- No Nx target names or root scripts change.
- No classify output contract change.
- No alternate graph implementation is added.

## Affected Owners

- `tools/habitat-harness/src/service/modules/graph/**`
- `tools/habitat-harness/src/providers/nx/index.ts`
- `tools/habitat-harness/src/resources/filesystem.ts`
- `tools/habitat-harness/src/commands/graph.ts`
- `tools/habitat-harness/src/lib/graph.ts` remains untouched by this slice;
  public-surface drainage owns deletion or relocation of that legacy export
- `tools/habitat-harness/test/service/**`
- `tools/habitat-harness/test/commands/habitat-commands.test.ts`

## Stop Conditions

- The graph service executes Nx directly instead of using `NxProvider`.
- The CLI calls `src/lib/graph` for owned orchestration.
- Temp-file lifecycle is unmanaged.
- The service module changes graph JSON shape or exit behavior.

## Verification

- Focused graph service and CLI tests.
- `bun run --cwd tools/habitat-harness check`
- `bun run --cwd tools/habitat-harness test`
- `bun run biome:ci`
- `bun run openspec -- validate deep-habitat-effect-graph-service-module --strict`
- `bun run openspec:validate`
- `git diff --check`
