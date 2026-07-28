# Civ7 Git and Mod CLI Topic - Agent Router

Scope: `plugins/cli/topics/git-mod/**`

- This `kind:cli-topic-plugin` project owns the `git subtree`, `mod git`, and
  `mod manage` oclif command surfaces, command-local adapters, and behavior
  tests.
- Keep the Civ7 CLI binary, startup, global hooks, and plugin registration in
  `packages/cli`.
- Keep reusable Git and mod capabilities in `@civ7/plugin-git` and
  `@civ7/plugin-mods`; commands adapt those packages rather than reimplementing
  them here.
- Preserve topic-prefixed command discovery under `src/commands` and do not add
  forwarding commands to the shell.

Verify changes with `nx run cli-git-mod:check`, `nx run cli-git-mod:test`, and
`nx run cli-git-mod:build`.
