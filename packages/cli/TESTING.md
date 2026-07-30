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

- The shell registers exactly the five admitted CLI plugins.
- The production binary starts successfully and exposes the five topic roots.

The workspace-owned Civ7 resource acquisition proof runs separately:

```bash
bun run resources:test
```
