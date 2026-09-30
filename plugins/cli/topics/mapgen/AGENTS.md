# Civ7 MapGen CLI Topic - Agent Router

Scope: `plugins/cli/topics/mapgen/**`

- This `kind:cli-topic-plugin` project owns the `mapgen` oclif command surface
  and its behavior tests.
- Keep the Civ7 CLI binary, startup, global hooks, and plugin registration in
  `apps/cli`.
- Keep Swooper recipes, diagnostics, metrics, trace, and visualization meaning
  in their reusable product and MapGen package owners. Commands select inputs,
  invoke those public capabilities, and present results.
- Preserve topic-prefixed discovery under `src/commands/mapgen`. Do not add
  forwarding commands to the shell or reimplement MapGen behavior here.

Verify changes with `nx run cli-mapgen:check`, `nx run cli-mapgen:test`, and
`nx run cli-mapgen:build`.
