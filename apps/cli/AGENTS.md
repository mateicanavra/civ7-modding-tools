# Civ7 CLI Shell Agent Router

Scope: `apps/cli/**`

- This `kind:app` project owns the `civ7` application composition, binary,
  startup, global hooks, oclif plugin registration, and shell-wide operational
  targets.
- Cohesive command topics belong under `plugins/cli/topics/<topic>` as
  `kind:cli-topic-plugin` projects. Register each plugin once; do not retain
  forwarding commands or duplicate topic metadata in the shell.
- Reusable graph, file, Git, mod, configuration, and product behavior remains
  in its named package, resource, or service owner. The app selects providers,
  acquires ready resources, binds public clients, and supplies those clients to
  topic plugins rather than reimplementing product policy.
- Keep command behavior tests with the command owner. Keep only genuinely
  shell-wide hook, startup, and binary tests here.
- Route foundational live control through the bound `civ7-control` client and
  actor-facing gameplay through the bound `civ7-play` client. Never import the
  legacy direct-control package, a service-private router/contract, or add a
  shell-local transport.

Architecture authority:

- [`docs/system/ADR.md`](../../docs/system/ADR.md), especially ADR-017
- [`docs/system/cli/OPERATIONS.md`](../../docs/system/cli/OPERATIONS.md) for the
  Bun/oclif execution, plugin assembly, and distribution contract
- [`docs/projects/habitat-harness/taxonomy.md`](../../docs/projects/habitat-harness/taxonomy.md)
- [Root agent router](../../AGENTS.md)

Verify shell changes with `nx run civ7-cli:check`, `nx run civ7-cli:test`, and
`nx run civ7-cli:build`. Verify topic changes through their owning Nx project
and the generic CLI-topic Habitat rule.
