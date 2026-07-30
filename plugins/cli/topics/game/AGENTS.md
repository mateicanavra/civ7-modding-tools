# Civ7 Game CLI Topic - Agent Router

Scope: `plugins/cli/topics/game/**`

- This `kind:cli-topic-plugin` project owns the `game` oclif command surface,
  command-local game adapters, and its behavior tests.
- Keep the Civ7 CLI binary, startup, global hooks, and plugin registration in
  `apps/cli`.
- Route live Civ7 control through `@civ7/control-orpc` and
  `@civ7/direct-control`; do not add a topic-local transport.
- Preserve topic-prefixed discovery under `src/commands/game` and do not add
  forwarding commands to the shell.

Verify changes with `nx run cli-game:check`, `nx run cli-game:test`, and
`nx run cli-game:build`.
