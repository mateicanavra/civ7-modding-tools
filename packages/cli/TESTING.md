# Testing

This package uses [Vitest](https://vitest.dev/) with the Node environment. Tests live in `test/commands` and `test/utils`.

## Running tests

```bash
bun run test:cli
```

For the Civ7 live-play command suite:

```bash
bun run test:cli:play
```

Run these from the repo root. They go through Turborepo so compiled workspace
dependencies, especially `@civ7/direct-control`, are built before the CLI tests
import them. Package-local Vitest commands are only safe after the dependency
graph has already been built.

## Current smoke tests

- `expandPath` expands `~` to the user's home directory.
- `crawl` and `explore` commands delegate to `@civ7/plugin-graph` workflows.

## Suggested future tests

- `findProjectRoot` locates the workspace root.
- CLI commands produce expected output files.
