# Civ7 CLI Shell Agent Router

Scope: `packages/cli/**`

- This `kind:app` project owns the `civ7` binary, startup, global hooks, oclif
  plugin registration, and shell-wide build, link, pack, and publish targets.
- Cohesive command topics belong under `plugins/cli/topics/<topic>` as
  `kind:cli-topic-plugin` projects. Register each plugin once; do not retain
  forwarding commands or duplicate topic metadata in the shell.
- Reusable graph, file, Git, mod, configuration, and control behavior remains
  in its named package owner. The shell and topic plugins adapt those
  capabilities rather than reimplementing them.
- Keep command behavior tests with the command owner. Keep only genuinely
  shell-wide hook, startup, and binary tests here.
- Route live Civ7 control through `@civ7/control-orpc` or
  `@civ7/direct-control` according to the root responsibility split; never add
  a shell-local transport.

Architecture authority:

- [`docs/system/ADR.md`](../../docs/system/ADR.md), especially ADR-017
- [`docs/system/cli/OPERATIONS.md`](../../docs/system/cli/OPERATIONS.md) for the
  Bun/oclif execution, plugin assembly, and distribution contract
- [`docs/projects/habitat-harness/taxonomy.md`](../../docs/projects/habitat-harness/taxonomy.md)
- [Root agent router](../../AGENTS.md)

Verify shell changes with `nx run civ7-cli:check`, `nx run civ7-cli:test`, and
`nx run civ7-cli:build`. Verify topic changes through their owning Nx project
and the generic CLI-topic Habitat rule.
