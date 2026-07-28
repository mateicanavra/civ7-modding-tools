# Civ7 Docs CLI Topic - Agent Router

Scope: `plugins/cli/topics/docs/**`

- This `kind:cli-topic-plugin` project owns the `docs` oclif command surface,
  command-local adapters, and its behavior tests.
- Keep the Civ7 CLI binary, startup, global hooks, and plugin registration in
  `packages/cli`.
- Keep file/archive and configuration capabilities in their reusable package
  owners; commands adapt those capabilities rather than reimplementing them
  here.
- Preserve topic-prefixed command discovery under `src/commands/docs` and do
  not add forwarding commands to the shell.

Verify changes with `nx run cli-docs:check`, `nx run cli-docs:test`, and
`nx run cli-docs:build`.
