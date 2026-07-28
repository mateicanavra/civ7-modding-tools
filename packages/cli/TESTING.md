# Testing

This package uses [Vitest](https://vitest.dev/) with the Node environment. It
keeps only shell-wide tests; topic behavior tests live with their owners under
`plugins/cli/topics/*/test`.

## Running tests

```bash
nx run civ7-cli:test
```

For the `game` topic, including the live-play command suite:

```bash
nx run cli-game:test
```

Run these from the repo root. They go through Nx so compiled workspace
dependencies are built before the owning tests import them. Package-local
Vitest commands are only safe after the dependency graph has already been
built.

## Current smoke tests

- The resource-submodule bootstrap script refuses unsafe or incomplete states.

## Suggested future tests

- CLI startup and global hooks exercise their shell-owned behavior directly.
