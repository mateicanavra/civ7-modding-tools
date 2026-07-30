# Civ7 Data CLI Topic - Agent Router

Scope: `plugins/cli/topics/data/**`

- This `kind:cli-topic-plugin` project owns the `data` oclif command surface,
  command-local adapters, and its behavior tests.
- Keep the Civ7 CLI binary, startup, global hooks, and plugin registration in
  `packages/cli`.
- Keep graph, file/archive, and configuration capabilities in their reusable
  package owners; commands adapt those capabilities rather than reimplementing
  them here.
- Preserve topic-prefixed command discovery under `src/commands/data` and do
  not add forwarding commands to the shell.

Verify changes with `nx run cli-data:check`, `nx run cli-data:test`, and
`nx run cli-data:build`.
